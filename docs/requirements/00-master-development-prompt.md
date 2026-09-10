# C-Centrik — Master Development Prompt (source of truth)

> Verbatim-intent capture of the master prompt supplied by the product owner on
> 2026-09-10. This file is the authoritative requirements reference for turning the
> frontend prototype into a production system. When code and this document
> disagree, this document wins unless a newer requirements file supersedes it.

Related: [`01-pre-offer-document-verification.md`](./01-pre-offer-document-verification.md)

---

## 1. Objective

Convert the existing C-Centrik recruitment + onboarding app from a prototype into a
production-ready system. The current frontend UI is the visual foundation and must be
**preserved** — layouts, navigation, component structure, design language, screens and
interactions that already make sense. UI changes only where required to connect real
APIs, add missing workflow functionality, validation, document handling, notifications,
interview functionality, email, approval/rejection/reapply, HR verification, offer
management, onboarding, and proper loading/error/empty states.

Priority order: **Functionality + Data integrity + Security + Workflow correctness**
before visual redesign.

Everything below must be backed by:

```
Frontend → Real Backend APIs → Business Logic → AuthN/AuthZ → Database
→ Secure File Storage → SMTP/Email → Notifications → Audit Logs
```

No important production workflow may depend on hardcoded or fake data.

## 2. Chosen stack (decided 2026-09-10)

- **Supabase** — managed Postgres + Auth + Storage (all-managed infra).
- **Candidate auth: Google OAuth only.** Identity maps to a persistent candidate account.
- Staff (TA/HR/admin/interviewer) also authenticate; roles enforced server-side (RLS +
  edge functions). Frontend route hiding is not security.
- Email via SMTP (credentials in Supabase function secrets, never in frontend).

## 3. End-to-end journey

```
Candidate → Careers site / TA application link → Application → Resume upload & parse
→ Validation → Mandatory documents → Submission → TA dashboard → TA review
   ├─ Approve → Interview process → Rounds → Panelist feedback
   │     (progress / not progressing / needs review)
   │  → All required interviews complete → Pre-offer document verification
   │  → HR document verification (verified / correction required)
   │  → TA notified → Offer letter → Candidate acceptance
   │  → TA "Ready for Onboarding" → HR onboarding form → HR verification
   │  → Employee creation → Ccentrik Workspace
   ├─ Reject (Close Application)
   └─ Request Update (revision_requested) → candidate corrects → new version → TA review
```

## 4. Portals

- **Candidate / Careers** (public): browse jobs, apply directly or via TA link,
  authenticate (Google), upload resume, review auto-filled info, upload documents,
  track application, respond to update requests, receive notifications + interview
  info, submit requested documents, receive & accept offer, complete onboarding forms.
- **Talent Acquisition**: assigned candidates, review, approve/reject/request-update,
  specify missing info, notify candidate, run interviews (processes, rounds, panelists,
  scheduling), review feedback, progress/stop candidates, request documents, monitor
  completion, receive HR verification notifications, send offers, track acceptance,
  approve for onboarding.
- **HR**: receive selected candidates, view + verify documents, mark verified / flag
  missing/incorrect, notify TA, view offer readiness, onboarding communication, verify
  onboarding info, review completed forms, finalize employee, move to employee lifecycle.

## 5. Roles

`candidate`, `ta`, `hr`, `admin`, `interviewer`, `employee`. Authorization enforced on
the backend.

## 6. Core data model (minimum entities)

```
users(profiles)  candidates  employees  jobs  application_links  applications
application_events  documents  document_requirements  document_submissions
notifications  interview_processes  interview_rounds  interviewers/panelists
interview_assignments  interview_feedback  offers  offer_documents
onboarding_forms  onboarding_form_sections  onboarding_fields  onboarding_submissions
onboarding_field_values  hr_verifications  emails  email_attachments  audit_logs
```

Foreign keys + real relationships. Stable IDs — never use display names as identifiers.

## 7. Jobs

Fields: `id, job_code, title, department, location, employment_type, description,
requirements, status, created_by, created_at, updated_at`.
Status: `draft | published | closed | archived`. Cannot apply to closed/archived jobs.

## 8. TA-specific application links

Each TA can create a unique link per job. Link holds a **secure random token**
(`/apply?ref=SECURE_RANDOM_TOKEN`) — never `?ta_id=1`. Backend resolves
token → application_link → job → TA. On submit, `assigned_ta_id` = resolved TA,
server-side, candidate cannot modify. Direct applications use `source = careers`;
TA-link applications use `source = ta_link`. Store the source.

## 9. Candidate authentication

Google OAuth. Returning candidate: sign in → profile → previous applications →
current status. A candidate sees **only their own** records.

## 10. Resume upload / parsing (must be real)

Accept PDF/DOC/DOCX. Flow: upload → backend file validation → secure storage → text
extraction → parser/AI extraction → structured info → frontend auto-fill. Extract when
available: full name, email, phone, location, skills, education, experience, companies,
job titles, LinkedIn, portfolio. **Candidate must review** extracted info; nothing is
submitted automatically without review.

## 11. Validation engine (frontend AND backend)

Validate required fields, name, email, phone, resume, documents, URLs, dates, file
type, file size, application state. `abc@` must fail. `123`, `abcdefgh`, `0000000000`
must fail per configured rules. Never trust browser validation alone.

## 12. Application submission

Pre-checks: candidate exists, job exists & open, application valid, required fields
complete, resume exists, required documents handled, email/phone valid, TA attribution
valid if TA link used. Use a **transaction** to create application + events + document
relationships + notification + audit event atomically.

## 13. TA review actions

1. **Advance Candidate** — backend `approved`.
2. **Close Application** — backend `rejected`.
3. **Request Update** — backend `revision_requested`. TA must enter reason + missing
   info + required correction; empty requests are rejected. Candidate gets email +
   in-app notification. Resubmission creates a **new application version/event**, never
   destroys prior audit history.

Every TA decision triggers a real email through the SMTP service (approved / rejected /
update requested templates).

## 14. In-app notifications

Every important workflow transition creates a notification:
`title, message, type, entity_type, entity_id, is_read, created_at, read_at`.
Candidate, TA and HR each have a notification center.

## 15. Interview stage (terminology)

Use **Interview Panel**, **Interview Panelist**, **Interview Round**, **Interview
Feedback** (never bare "Interviewer"). Round names configurable — do not hardcode a
fixed set.

- `interview_rounds`: `id, application_id, round_number, name, description,
  scheduled_at, duration, location/meeting_url, status, created_by, timestamps`.
- `interview_panelists`: `id, name, email, department, designation, status`.
- `interview_assignments`: round ↔ panelist.

Scheduling: select round, panelist(s), date, time, meeting link/location, instructions.
Candidate + panelist + TA all emailed. Round status: `scheduled | completed | cancelled
| rescheduled`. Progression decision: `progress | not_progressing | needs_review`
(UI: Advance / Not Moving Forward / Further Review).

**Feedback is mandatory** after every completed interview — `decision` + `remarks`,
remarks required for every decision (frontend AND backend reject empty). Decisions:
`advance | further_review | not_progressing`. Never overwrite historical feedback; keep
an audit trail; TA can view history.

Progression logic: next round unlocks only per configured workflow. `not_progressing`
stops progression. `further_review` keeps candidate in review; next round does not auto
unlock unless TA explicitly proceeds. When all required rounds complete + candidate
advanced → show **Proceed to Document Verification** as next TA action.

## 16. Document request + candidate document center

TA configures required documents (data-driven, not hardcoded). See
[`01-pre-offer-document-verification.md`](./01-pre-offer-document-verification.md) for
the full pre-offer document engine and the current 16-item checklist.

Candidate document card: name, required/optional, status, upload, **Can't Provide** +
reason. Every required document has "Can't Provide This Document"; if chosen, reason is
mandatory and a **visible warning** (not a tooltip) is shown:
*"This document is required for verification. Not providing it may affect your
application and can lead to rejection."* Do not falsely state rejection is guaranteed.

Real file upload; configurable formats (min PDF/JPG/JPEG/PNG/DOC/DOCX). Validate MIME,
extension, size, corruption, completion. Store securely. Document status:
`requested | uploaded | under_verification | verified | rejected | revision_required |
cannot_provide` — backend controls transitions.

## 17. HR document verification

Candidate submits → HR verification queue. Per document HR sees name, candidate,
uploaded date, file, status, action, remarks. HR actions: Verify / Request Correction /
Reject. Correction requires a mandatory HR remark. Keep all document versions; never
overwrite prior files without version history.

After HR verification, TA gets an **expandable** notification panel (collapsed:
"HR Verification Update — Documents reviewed for X"; expanded: verified count,
correction-required count, remarks, recommended action) — no navigation away from the
dashboard to read it. Outcomes: Fully Verified (TA may proceed with offer) or
Correction Required (TA blocked from offer until satisfied, unless explicit admin
override).

## 18. Offer stage

Available only when interview process complete + candidate selected + mandatory
documents verified. **Offer Composer** = professional email composer: To (candidate
name + email from the application record), Subject, Body (rich/controlled formatting,
professional default template, editable), Attachment (real offer-letter upload
PDF/DOC/DOCX, stored securely → `offers`, `offer_documents`), Send / Save Draft /
Cancel, with sending/sent/failed states. No unauthorized recipients.

Every important email logged in `emails`: `id, recipient, sender, subject, body,
template, entity_type, entity_id, status(queued|sent|failed), sent_at, failed_at,
created_at`. `email_attachments` too.

Offer email includes a secure "Review Offer" link. Offer status:
`draft | sent | viewed | accepted | declined | expired`.

Acceptance: candidate reviews offer + letter, acknowledges
("I have reviewed the offer and agree to the terms…"), then Accept. Store `accepted_at,
accepted_by, offer_id`. No repeated uncontrolled acceptance. Acknowledgment email to
candidate + notification to TA.

## 19. TA onboarding approval → HR handoff

After acceptance, TA action **Ready for Onboarding**. Then HR gets a notification,
candidate enters HR onboarding queue and is told onboarding is ready.
`offer accepted + TA onboarding approval = HR onboarding unlocked`.

## 20. HR onboarding form (dynamic engine)

Configurable sections (Personal, Contact, Address, Bank, Emergency Contact, Employment,
Tax/Statutory, Identity, Other). Tables: `onboarding_forms, onboarding_form_sections,
onboarding_fields, onboarding_submissions, onboarding_field_values`. Field types: text,
number, email, phone, date, dropdown, multi-select, radio, checkbox, file, address.
Mandatory fields enforced client + server. Exact field list configured separately.

## 21. HR verification + employee creation

Candidate submits onboarding → HR verification queue → Verify / Request Correction
(mandatory remark) → correction loop → final verification. Then create employee record:
`employee_id, candidate_id, employee_code, department, designation, joining_date,
employment_status, timestamps`. Employee then accesses **Ccentrik Workspace** (keep
existing employee-login naming).

## 22. Notification + email engines

One reusable notification system (recipients: candidate, TA, HR, panelist, employee).
Triggers: application submitted/approved/rejected/update-requested, interview
scheduled/rescheduled/completed, feedback submitted, candidate advanced/not-progressing,
documents requested/uploaded/correction-required/verified, offer prepared/sent/accepted,
ready-for-onboarding, onboarding started/correction-required/verified, employee created.

One reusable email service: SMTP, templates, attachments, HTML + plain-text fallback,
logging, retry, failure handling. Env: `SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD,
SMTP_FROM`. Templates keyed (`application_submitted`, `application_approved`, …) with
variables `{{candidate_name}}, {{job_title}}, {{application_id}}, {{interview_date}},
{{interview_time}}, {{application_link}}, {{offer_link}}, {{document_link}}`. Every
candidate action email carries a secure token link; do not expose internal IDs.

## 23. Application timeline + audit log

Every application has a full persisted timeline of events (submitted → TA review →
advanced → rounds → documents → HR verification → offer → accepted → onboarding →
employee). Immutable `audit_logs`: who, what, which entity, when, previous state, new
state, remarks. Never delete critical workflow history.

## 24. Role-based data isolation

- **Candidate**: only own profile/applications/documents/interviews/offer/onboarding/
  notifications. Cannot access another candidate.
- **TA**: assigned applications + associated candidates + interview processes they
  manage + relevant documents + offers they manage.
- **HR**: candidates handed to HR, required documents, verification, onboarding,
  employee creation.
- **Panelist**: only assigned interview rounds + relevant candidate info + feedback UI.

## 25. Security

AuthN, AuthZ, RBAC, input validation, server-side validation, secure sessions/tokens,
rate limiting, CSRF where applicable, secure cookies, OAuth validation, file validation
+ size limits, secure document storage, access-controlled downloads, SQL-injection and
XSS protection, API authorization, audit logging, secret management. Never trust
frontend-supplied `ta_id, hr_id, candidate_id, application_owner, application_status,
document_verification_status, offer_status` — derive from authenticated context.

## 26. API + response standard

Conceptual namespaces: `/api/auth, /api/jobs, /api/application-links, /api/candidates,
/api/applications, /api/resumes, /api/documents, /api/notifications, /api/interviews,
/api/panelists, /api/offers, /api/onboarding, /api/hr, /api/emails`. Adapt to Supabase
(PostgREST + RPC + edge functions).

Success: `{ "success": true, "data": {} }`.
Error: `{ "success": false, "error": { "code", "message", "fields": {} } }`.
Never return stack traces.

Frontend: centralized API services in `src/api/*` — no scattered raw calls in
components. Every dynamic component supports Loading / Success / Empty / Error / Retry.
**No fake success states** — only show "submitted / sent / verified / accepted" after
the backend confirms it.

## 27. Files

Secure storage, never expose raw paths. Access = secure download endpoint + auth check
+ temporary URL. Each file: owner, application, document type, version, upload
timestamp, status. Replacement uploads create a new version; keep prior versions.

## 28. Integrity rules

Duplicate protection (application, document submission, offer acceptance, interview
feedback, onboarding submission). Transactions for critical transitions. Controlled
**state machine** — no arbitrary `status = anything` from the frontend. Canonical
happy path:

```
draft → submitted → under_review → approved → interview → selected
→ documents_requested → documents_under_verification → documents_verified
→ offer_sent → offer_accepted → onboarding → employee_created
```

Alternative: `under_review → revision_requested → resubmitted → under_review`;
`under_review → rejected`.

## 29. Status naming

User-facing: Advance / Not Moving Forward / Further Review (not Pass/Fail/Hold);
Interview Panelist (not Interviewer); Request Update (not Reapply); Application Closed
(candidate-facing, not Reject). Backend keeps machine-readable values.

## 30. Architectural principle

The system is a **workflow engine**, not disconnected pages. Every major action →
DB state change + timeline event + notification + email (where required) + audit log +
next workflow action.

## 31. Phased implementation

1. **Foundation** — DB, auth, candidate, TA, jobs, TA links, resume upload + parsing,
   application, documents, Can't Provide, validation, TA dashboard, TA notifications,
   SMTP.
2. **TA review** — review, Advance/Close/Request Update, reapplication, notifications,
   email templates, timeline.
3. **Interview** — process, rounds, panel, panelists, scheduling, emails, feedback,
   mandatory remarks, decisions, round progression.
4. **Document verification** — TA document request, candidate document center, Can't
   Provide + reason + warning, HR verification, correction required, HR→TA notification,
   versioning. (See `01-pre-offer-document-verification.md`.)
5. **Offer** — composer, email editor, letter upload, SMTP send, attachments, tracking,
   candidate offer page, acceptance, acceptance notification.
6. **HR onboarding** — TA Ready for Onboarding, HR queue, dynamic candidate forms,
   submission, HR verification, correction loop, final verification.
7. **Employee creation** — employee record + code + profile + joining info, employee
   auth, Ccentrik Workspace handoff.

Test each workflow before moving on. Reuse anything production-capable; replace only
mock/demo functionality; do not build parallel competing auth/API/DB/notification
systems.

## 32. Definition of done

A real candidate travels the entire workflow (apply → resume parsed → submitted →
TA review → update/advance/close → interview → feedback → document request → candidate
documents → HR verification → offer → acceptance → TA onboarding approval → HR
onboarding → HR verification → employee creation → Ccentrik Workspace) with no dummy
data, fake APIs, fake notifications/uploads/emails, fake status changes, frontend-only
state, hardcoded candidates, hardcoded TA assignment or unauthorized data access. Every
stage backed by real persistent data and proper APIs. Architecture stays extensible for
future HR/payroll/lifecycle/attendance/leave/performance/Workspace modules.
