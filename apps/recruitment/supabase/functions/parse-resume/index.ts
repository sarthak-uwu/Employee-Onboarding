// POST /functions/v1/parse-resume  { path: "resumes/<uid>/<file>" }
// Auth: the signed-in candidate (path must be under their own folder).
//
// Real extraction: downloads the file from storage, pulls text out of PDF /
// DOCX, then runs a heuristic parser. The candidate reviews everything on the
// form, so "best effort" is fine — nothing here is trusted as final.

import { fail, ok, preflight } from "../_shared/http.ts";
import { currentProfile, serviceClient } from "../_shared/supabase.ts";
import { extractText as extractPdfText, getDocumentProxy } from "https://esm.sh/unpdf@0.12.1";
import JSZip from "https://esm.sh/jszip@3.10.1";

const SKILL_DICT = [
  "javascript", "typescript", "react", "redux", "node.js", "node", "next.js", "vue",
  "angular", "html", "css", "sass", "tailwind", "graphql", "rest", "python", "django",
  "flask", "java", "spring", "go", "rust", "c++", "c#", ".net", "sql", "postgresql",
  "mysql", "mongodb", "redis", "kafka", "rabbitmq", "docker", "kubernetes", "aws",
  "gcp", "azure", "terraform", "ci/cd", "jenkins", "git", "playwright", "cypress",
  "jest", "testing", "accessibility", "figma", "sap", "sap cap", "odata", "fiori",
  "abap", "power bi", "tableau", "excel", "salesforce", "workday",
];

const DEGREE_RE =
  /\b(b\.?tech|b\.?e\.?|b\.?sc|bca|b\.?com|bba|m\.?tech|m\.?e\.?|m\.?sc|mca|mba|ph\.?d|bachelor|master|diploma)\b/i;

async function docxToText(bytes: Uint8Array): Promise<string> {
  const zip = await JSZip.loadAsync(bytes);
  const doc = zip.file("word/document.xml");
  if (!doc) return "";
  const xml = await doc.async("string");
  return xml
    .replace(/<\/w:p>/g, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/[ \t]+/g, " ")
    .trim();
}

async function pdfToText(bytes: Uint8Array): Promise<string> {
  const pdf = await getDocumentProxy(bytes);
  const { text } = await extractPdfText(pdf, { mergePages: true });
  return text;
}

function parse(text: string) {
  const flat = text.replace(/\r/g, "");
  const lines = flat.split("\n").map((l) => l.trim()).filter(Boolean);
  const lower = flat.toLowerCase();

  const email = flat.match(/[\w.+-]+@[\w-]+\.[\w.-]+/)?.[0] ?? "";
  const phone =
    flat.match(/(\+?\d[\d\s()-]{8,}\d)/)?.[0]?.replace(/\s{2,}/g, " ").trim() ?? "";
  const linkedin = flat.match(/https?:\/\/(www\.)?linkedin\.com\/[^\s)]+/i)?.[0] ?? "";
  const portfolio =
    flat.match(/https?:\/\/(?!(www\.)?linkedin\.com)[^\s)]+\.[a-z]{2,}[^\s)]*/i)?.[0] ?? "";

  // Name: first non-contact line near the top, 2-4 capitalised words.
  let name = "";
  for (const l of lines.slice(0, 6)) {
    if (/@|\d{4}|http/i.test(l)) continue;
    if (/^[A-Z][a-zA-Z.'-]+(\s+[A-Z][a-zA-Z.'-]+){1,3}$/.test(l)) {
      name = l;
      break;
    }
  }
  const [firstName, ...rest] = name.split(/\s+/);
  const lastName = rest.pop() ?? "";

  const skills = SKILL_DICT.filter((s) => lower.includes(s))
    .map((s) => s.replace(/\b\w/g, (c) => c.toUpperCase()))
    .slice(0, 20);

  const education = lines
    .filter((l) => DEGREE_RE.test(l))
    .slice(0, 3)
    .map((l) => ({ qualification: l.slice(0, 120), university: "", specialization: "", year: (l.match(/\b(19|20)\d{2}\b/) ?? [""])[0], grade: "" }));

  const expMatch = lower.match(/(\d{1,2})\+?\s*(years?|yrs?)\s+(of\s+)?(experience|exp)/);
  const totalExperience = expMatch ? expMatch[1] : "";

  const currentJobTitle =
    lines.find((l) => /\b(engineer|developer|consultant|manager|analyst|designer|lead|architect)\b/i.test(l) && l.length < 60) ?? "";

  return {
    firstName: firstName ?? "",
    lastName,
    email,
    mobile: phone,
    linkedin,
    portfolio,
    currentLocation: "",
    currentJobTitle,
    currentCompany: "",
    totalExperience,
    skills,
    education,
  };
}

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;
  if (req.method !== "POST") return fail("METHOD", "POST only.", 405);

  const profile = await currentProfile(req);
  if (!profile) return fail("UNAUTHENTICATED", "Please sign in.", 401);

  let path = "";
  try {
    path = (await req.json()).path ?? "";
  } catch {
    return fail("INVALID_JSON", "Malformed body.", 400);
  }
  if (!path.startsWith(`resumes/${profile.id}/`) && !path.startsWith(`${profile.id}/`)) {
    return fail("FORBIDDEN", "That file does not belong to you.", 403);
  }

  const objectPath = path.replace(/^resumes\//, "");
  const svc = serviceClient();
  const { data: file, error } = await svc.storage.from("resumes").download(objectPath);
  if (error || !file) return fail("NOT_FOUND", "Resume file not found.", 404);

  const bytes = new Uint8Array(await file.arrayBuffer());
  const name = path.toLowerCase();

  let text = "";
  try {
    if (name.endsWith(".pdf")) text = await pdfToText(bytes);
    else if (name.endsWith(".docx")) text = await docxToText(bytes);
    else text = new TextDecoder("utf-8", { fatal: false }).decode(bytes).replace(/[^\x09\x0a\x0d\x20-\x7e]+/g, " ");
  } catch (_e) {
    return fail("PARSE_FAILED", "We couldn't read that file. Please fill the form manually.", 200);
  }

  if (text.trim().length < 30) {
    return ok({ fields: {}, extracted: [], note: "Not enough text found — please fill the form manually." });
  }

  const fields = parse(text);
  const extracted = Object.entries(fields)
    .filter(([, v]) => (Array.isArray(v) ? v.length : String(v).trim()))
    .map(([k]) => k);

  return ok({ fields, extracted });
});
