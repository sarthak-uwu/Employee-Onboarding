import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../common/Icon.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { ROLES } from '../../constants/roles.js';
import { APP_STATUS, DOC_STATUS } from '../../constants/statuses.js';

/* How far along the happy path a status sits. Higher = further. */
const ORD = {
  [APP_STATUS.SUBMITTED]: 1, [APP_STATUS.RETURNED]: 1, [APP_STATUS.TA_REVIEW]: 2,
  [APP_STATUS.INTERVIEW_PLANNING]: 3, [APP_STATUS.INTERVIEW_IN_PROGRESS]: 4, [APP_STATUS.INTERVIEW_PASSED]: 5,
  [APP_STATUS.DOC_VERIFICATION]: 6, [APP_STATUS.DOCS_VERIFIED]: 8, [APP_STATUS.OFFER_DRAFT]: 8,
  [APP_STATUS.OFFER_ISSUED]: 9, [APP_STATUS.OFFER_ACCEPTED]: 10, [APP_STATUS.ONBOARDING_PENDING]: 10,
  [APP_STATUS.HR_VERIFICATION_REJECTED]: 10, [APP_STATUS.HR_VERIFICATION]: 11,
  [APP_STATUS.JOINING_PENDING]: 12, [APP_STATUS.EMPLOYEE]: 13,
};

const CAND = '/candidate/application';
const STEPS = [
  { role: ROLES.CANDIDATE, who: 'Candidate', title: 'Browse jobs & apply', hint: 'Open a role and fill in the application form.', to: () => '/candidate/jobs', at: 1 },
  { role: ROLES.TA, who: 'Talent Acquisition', title: 'Review the application', hint: 'Open the new applicant — review starts automatically.', to: (a) => `/ta/candidates/${a.candidateId}`, at: 2 },
  { role: ROLES.TA, who: 'Talent Acquisition', title: 'Approve the candidate', hint: 'Approve to move them into interview planning.', to: (a) => `/ta/candidates/${a.candidateId}`, at: 3 },
  { role: ROLES.TA, who: 'Talent Acquisition', title: 'Schedule an interview', hint: 'Fill the interview modal and schedule the round.', to: (a) => `/ta/candidates/${a.candidateId}`, at: 4 },
  { role: ROLES.TA, who: 'Talent Acquisition', title: 'Record the result', hint: 'Mark the round Passed and add remarks.', to: (a) => `/ta/candidates/${a.candidateId}`, at: 5 },
  { role: ROLES.TA, who: 'Talent Acquisition', title: 'Move to documents', hint: 'Send the candidate to document verification.', to: (a) => `/ta/candidates/${a.candidateId}`, at: 6 },
  { role: ROLES.CANDIDATE, who: 'Candidate', title: 'Upload documents', hint: 'Upload each verification document.', to: () => CAND, docsDone: true, at: 8 },
  { role: ROLES.TA, who: 'Talent Acquisition', title: 'Verify the documents', hint: 'Verify each uploaded document.', to: (a) => `/ta/candidates/${a.candidateId}`, at: 8 },
  { role: ROLES.TA, who: 'Talent Acquisition', title: 'Record the extended offer', hint: 'Log the offer details in the modal.', to: (a) => `/ta/candidates/${a.candidateId}`, at: 9 },
  { role: ROLES.TA, who: 'Talent Acquisition', title: 'Confirm offer accepted', hint: 'The candidate replies by email — confirm it.', to: (a) => `/ta/candidates/${a.candidateId}`, at: 10 },
  { role: ROLES.CANDIDATE, who: 'Candidate', title: 'Fill onboarding details', hint: 'Complete the onboarding form and submit it.', to: () => CAND, at: 11 },
  { role: ROLES.HR, who: 'Human Resources', title: 'Verify onboarding', hint: 'Review the submitted details and verify them.', to: (a) => `/hr/candidates/${a.candidateId}`, at: 12 },
  { role: ROLES.HR, who: 'Human Resources', title: 'Complete joining', hint: 'Mark joining complete — creates the employee.', to: (a) => `/hr/candidates/${a.candidateId}`, at: 13 },
];

const OPEN_KEY = 'talentflow.demo.open';
const HOLD = 2000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const daysFromNow = (n) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);

const NARRATION = [
  'Riya opens the careers site and picks a role that fits her.',
  'She fills in the application form — resume, contact details, experience — and submits it.',
  'The recruiter opens Riya\'s application. Review starts automatically.',
  'The recruiter approves Riya and moves her into interview planning.',
  'The recruiter schedules a technical interview round — type, interviewer, date, link.',
  'After the interview, the panel records the result as Passed and shares the remarks with Riya.',
  'Interviews cleared — the recruiter sends Riya to document verification.',
  'Riya uploads each document. Mandatory ones carry a red star.',
  'The recruiter checks every document and marks them verified.',
  'The offer letter goes out by email; the recruiter records the key details here.',
  'Riya accepts by email. The recruiter confirms it, handing over to HR.',
  'Riya completes the onboarding form — 10th/12th, address, emergency contact.',
  'HR reviews the onboarding details and verifies them.',
  'HR marks the joining complete. An employee record is created — Riya is now an employee.',
];

const NAME = { first: 'Riya', last: 'Kapoor' };
const EMAIL = 'riya.kapoor@example.com';
const PHONE = '+91 98200 41000';
const BOT_APPLICATION = {
  jobId: 'JOB-1028', source: 'Direct', autofilled: [],
  personal: { firstName: NAME.first, middleName: '', lastName: NAME.last, email: EMAIL, mobile: PHONE, dob: '', gender: '', nationality: 'Indian', currentLocation: 'Bengaluru', preferredLocation: 'Bengaluru', address: { line1: '12 MG Road', line2: '', city: 'Bengaluru', state: 'Karnataka', country: 'India', postalCode: '560001' } },
  professional: { currentJobTitle: 'Product Designer', currentCompany: 'PixelForge', totalExperience: '6', relevantExperience: '5', employmentStatus: 'Employed', currentCTC: '1600000', expectedCTC: '2200000', noticePeriod: '30 days', preferredJobLocation: 'Bengaluru', skills: ['Figma', 'Prototyping', 'Design Systems'], certifications: [], languages: ['English', 'Hindi'] },
  education: [{ qualification: 'B.Des Interaction Design', university: 'National Institute of Design', specialization: 'Interaction Design', year: '2019', grade: '8.4 CGPA' }],
  additional: { coverNote: 'Keen to build enterprise onboarding experiences.', referral: '', portfolio: '' },
  resume: { name: 'Riya_Kapoor_Resume.pdf', size: 146000, uploadedAt: new Date().toISOString() },
};
const BOT_INTERVIEW = { type: 'Technical Interview', interviewer: 'Karthik Rao', date: daysFromNow(3), time: '11:00', mode: 'Online', link: 'https://meet.example/demo-round', location: '', notes: 'Portfolio walkthrough + design exercise.' };
const BOT_ONBOARDING = {
  tenth: { school: 'Delhi Public School', board: 'CBSE', year: '2012', percentage: '92' },
  twelfth: { school: 'Delhi Public School', board: 'CBSE', year: '2014', percentage: '89' },
  address: { line1: '12 MG Road', line2: 'Indiranagar', city: 'Bengaluru', state: 'Karnataka', postalCode: '560001' },
  emergencyContact: { name: 'Anil Kapoor', phone: '+91 98200 42000' },
};
const ONBOARDING_SEQ = ['Delhi Public School', 'CBSE', '2012', '92', 'Delhi Public School', 'CBSE', '2014', '89', '12 MG Road', 'Indiranagar', 'Bengaluru', 'Karnataka', '560001', 'Anil Kapoor', '+91 98200 42000'];

/* ---- DOM helpers (bot drives the real UI) ---- */
function nativeSet(el, value) {
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype
    : el instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
  const d = Object.getOwnPropertyDescriptor(proto, 'value');
  if (d && d.set) d.set.call(el, value); else el.value = value;
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
}
const dialog = () => document.querySelector('[role="dialog"]') || document;
function findBtn(root, ...phrases) {
  const w = phrases.map((p) => p.toLowerCase());
  return [...(root || document).querySelectorAll('button, a.ta-btn, a.cx-btn')].find((el) => {
    if (el.offsetParent === null || el.disabled) return false;
    const t = (el.textContent || '').trim().toLowerCase();
    return w.some((p) => t.includes(p));
  }) || null;
}
function fieldByLabel(root, text) {
  const t = text.toLowerCase();
  for (const lab of (root || document).querySelectorAll('.ta-field__label, .field__label, label')) {
    if ((lab.textContent || '').toLowerCase().includes(t)) {
      const field = lab.closest('.ta-field, .field') || lab.parentElement?.parentElement;
      const ctrl = field?.querySelector('input:not([type=file]):not([disabled]), select, textarea');
      if (ctrl && ctrl.offsetParent !== null) return ctrl;
    }
  }
  return null;
}

export default function DemoFlow() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const app = useApp();
  const { data, getApplication, documentsFor, setRole, startGuidedDemo } = app;

  const ctxRef = useRef(app);
  useEffect(() => { ctxRef.current = app; });

  const [open, setOpen] = useState(() => {
    try { return localStorage.getItem(OPEN_KEY) === '1'; } catch { return false; }
  });
  useEffect(() => {
    try { localStorage.setItem(OPEN_KEY, open ? '1' : '0'); } catch { /* ignore */ }
  }, [open]);

  const [playing, setPlaying] = useState(false);
  const [botStep, setBotStep] = useState(0);
  const [botLabel, setBotLabel] = useState('');
  const [cursor, setCursor] = useState({ x: -100, y: -100, click: false, show: false });
  const stoppedRef = useRef(false);
  const runningRef = useRef(false);

  const trackedApp = data?.myApplicationId ? getApplication(data.myApplicationId) : null;
  const pos = trackedApp ? (ORD[trackedApp.status] ?? 0) : 0;
  const docsUploaded = trackedApp
    ? documentsFor(trackedApp.id).some((d) => d.required)
      && documentsFor(trackedApp.id).filter((d) => d.required).every((d) => d.status === DOC_STATUS.UPLOADED || d.status === DOC_STATUS.VERIFIED)
    : false;
  const isDone = (s) => (s.docsDone ? pos >= s.at || docsUploaded : pos >= s.at);
  const computedIndex = STEPS.findIndex((s) => !isDone(s));
  const doneCount = playing ? botStep : (computedIndex === -1 ? STEPS.length : computedIndex);
  const currentIndex = playing ? Math.min(botStep, STEPS.length - 1) : (computedIndex === -1 ? STEPS.length - 1 : computedIndex);
  const allDone = doneCount >= STEPS.length;

  const stop = () => { stoppedRef.current = true; setPlaying(false); setCursor((c) => ({ ...c, show: false })); };
  const restart = () => { stop(); startGuidedDemo(); setRole(ROLES.CANDIDATE); navigate('/candidate/jobs'); setBotStep(0); setBotLabel(''); };
  const goToStep = (s) => { setRole(s.role); navigate(s.to(trackedApp || {})); };

  async function runBot() {
    if (runningRef.current) return;
    runningRef.current = true;
    stoppedRef.current = false;
    setOpen(true);
    setPlaying(true);
    setBotStep(0);
    setBotLabel(NARRATION[0]);
    setCursor({ x: window.innerWidth / 2, y: window.innerHeight / 2, click: false, show: true });

    const c = () => ctxRef.current;
    const guard = () => { if (stoppedRef.current) throw new Error('stopped'); };
    const waitFor = async (finder, tries = 12) => { for (let i = 0; i < tries; i++) { guard(); const el = finder(); if (el) return el; await sleep(220); } return null; };

    const pointAt = async (el, quick) => {
      if (!el || !el.getBoundingClientRect) return;
      const r0 = el.getBoundingClientRect();
      if (r0.top < 72 || r0.bottom > window.innerHeight - 96) { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); await sleep(quick ? 220 : 400); }
      const r = el.getBoundingClientRect();
      setCursor({ x: r.left + r.width / 2, y: r.top + r.height / 2, click: false, show: true });
      await sleep(quick ? 260 : 480);
    };
    const pulse = async () => { setCursor((p) => ({ ...p, click: true })); await sleep(140); setCursor((p) => ({ ...p, click: false })); await sleep(120); };
    const click = async (finder, fallback) => {
      guard();
      const el = await waitFor(finder);
      if (el) { await pointAt(el); await pulse(); el.click(); }
      else if (fallback) fallback();
      await sleep(280);
    };
    const type = async (finder, value, quick = true) => {
      const el = await waitFor(finder, 8);
      if (!el) return false;
      await pointAt(el, quick);
      el.focus();
      if (el.tagName === 'SELECT') { nativeSet(el, value); }
      else { for (let i = 1; i <= value.length; i++) { guard(); nativeSet(el, value.slice(0, i)); await sleep(26); } el.blur(); }
      await sleep(160);
      return true;
    };
    const hold = async (k) => { setBotLabel(NARRATION[k]); await sleep(HOLD); guard(); setBotStep(k); await sleep(500); };
    const switchTo = async (role, path, note) => { if (note) setBotLabel(note); setRole(role); await sleep(320); navigate(path); await sleep(1100); guard(); };

    try {
      c().startGuidedDemo();
      setRole(ROLES.CANDIDATE);
      await sleep(600);
      navigate('/candidate/jobs');
      await sleep(1600);
      guard();

      // 1 — application form
      setBotLabel('Opening the role and filling the application form…');
      await click(() => findBtn(document, 'apply'));
      await sleep(700);
      const fileInput = await waitFor(() => document.querySelector('.cx-upload input[type=file]'), 10);
      await pointAt(findBtn(document, 'upload resume') || fileInput);
      await pulse();
      if (fileInput) {
        try {
          const dt = new DataTransfer();
          dt.items.add(new File(['resume'], 'Riya_Kapoor_Resume.pdf', { type: 'application/pdf' }));
          fileInput.files = dt.files;
          fileInput.dispatchEvent(new Event('change', { bubbles: true }));
          await sleep(2600);
        } catch { /* file API blocked — carry on, we'll fall back on submit */ }
      }
      await type(() => fieldByLabel(document, 'first name'), NAME.first);
      await type(() => fieldByLabel(document, 'last name'), NAME.last);
      await type(() => fieldByLabel(document, 'email'), EMAIL);
      await type(() => fieldByLabel(document, 'phone'), PHONE);
      await type(() => fieldByLabel(document, 'current location'), 'Bengaluru');
      await type(() => fieldByLabel(document, 'total experience'), '5–8 years');
      await type(() => fieldByLabel(document, 'current company'), 'PixelForge');
      await type(() => fieldByLabel(document, 'current job title'), 'Product Designer');

      const beforeId = c().data.myApplicationId;
      await click(() => findBtn(document, 'submit application'));
      await sleep(1400);
      if (c().data.myApplicationId === beforeId) c().submitApplication(BOT_APPLICATION);
      await sleep(700);
      const mine = c().getApplication(c().data.myApplicationId);
      const candidateId = mine.candidateId;
      const applicationId = mine.id;
      navigate('/candidate/application');
      await hold(1);

      // 2 — TA opens the applicant
      await switchTo(ROLES.TA, `/ta/candidates/${candidateId}`, 'Switching to the Talent Acquisition view…');
      c().startReview(applicationId);
      await hold(2);

      // 3 — approve
      await click(() => findBtn(document, 'approve'), () => c().approveApplication(applicationId));
      await hold(3);

      // 4 — schedule interview (modal)
      await click(() => findBtn(document, 'schedule interview'));
      await sleep(650);
      await type(() => fieldByLabel(dialog(), 'interview type'), 'Technical Interview');
      await type(() => fieldByLabel(dialog(), 'interviewer'), 'Karthik Rao');
      await type(() => fieldByLabel(dialog(), 'meeting link'), 'https://meet.example/demo-round');
      await type(() => fieldByLabel(dialog(), 'notes'), 'Portfolio walkthrough + design exercise.');
      await click(() => findBtn(dialog(), 'schedule interview'), () => c().scheduleInterview(applicationId, BOT_INTERVIEW));
      await sleep(500);
      if (!c().interviewsFor(applicationId).length) c().scheduleInterview(applicationId, BOT_INTERVIEW);
      await hold(4);

      // 5 — record result (modal)
      await click(() => findBtn(document, 'record result'));
      await sleep(650);
      const pass = [...dialog().querySelectorAll('.radio-card')].find((l) => /pass/i.test(l.textContent));
      if (pass) { await pointAt(pass); await pulse(); pass.click(); }
      await type(() => dialog().querySelector('textarea'), 'Strong portfolio, clear thinking, good culture fit.', false);
      const share = dialog().querySelector('.ta-checkline input[type=checkbox]');
      if (share) { await pointAt(share); await pulse(); share.click(); }
      await click(() => findBtn(dialog(), 'save result'), () => {
        const iv = c().interviewsFor(applicationId)[0];
        if (iv) c().recordInterviewResult(iv.id, { result: 'PASS', comments: 'Strong portfolio, clear thinking, good culture fit.', shareComments: true });
      });
      await sleep(500);
      if (c().interviewsFor(applicationId)[0]?.result !== 'PASS') {
        const iv = c().interviewsFor(applicationId)[0];
        if (iv) c().recordInterviewResult(iv.id, { result: 'PASS', comments: 'Strong portfolio, clear thinking, good culture fit.', shareComments: true });
      }
      await hold(5);

      // 6 — move to documents
      await click(() => findBtn(document, 'proceed to documents', 'move to documents'), () => c().advanceToDocuments(applicationId));
      await hold(6);

      // 7 — candidate uploads each document
      await switchTo(ROLES.CANDIDATE, '/candidate/application', 'Back to the candidate — uploading documents…');
      const docs = c().documentsFor(applicationId);
      for (let i = 0; i < docs.length; i++) {
        guard();
        const d = docs[i];
        setBotLabel(`Uploading ${d.label}  (${i + 1}/${docs.length})`);
        c().uploadDocument(d.id, { name: `${d.key}.pdf`, size: 180000, type: 'application/pdf', uploadedAt: new Date().toISOString() });
        const row = document.querySelector(`#doc-${d.id}`);
        if (row) { await pointAt(row.querySelector('button') || row, true); await pulse(); }
        await sleep(450);
      }
      await hold(7);

      // 8 — TA verifies each document
      await switchTo(ROLES.TA, `/ta/candidates/${candidateId}`, 'Back to the recruiter — verifying documents…');
      const tdocs = c().documentsFor(applicationId);
      for (let i = 0; i < tdocs.length; i++) {
        guard();
        const d = tdocs[i];
        setBotLabel(`Verifying ${d.label}  (${i + 1}/${tdocs.length})`);
        const vbtn = document.querySelector('.ta-iconbtn[title="Verify"]');
        if (vbtn) { await pointAt(vbtn, true); await pulse(); }
        if (c().documentsFor(applicationId).find((x) => x.id === d.id)?.status === DOC_STATUS.UPLOADED) c().verifyDocument(d.id);
        await sleep(430);
      }
      await hold(8);

      // 9 — record extended offer (modal)
      await click(() => findBtn(document, 'record extended offer', 'record offer'));
      await sleep(650);
      await type(() => fieldByLabel(dialog(), 'department'), 'SAP Functional');
      await type(() => fieldByLabel(dialog(), 'joining date'), daysFromNow(21));
      await type(() => fieldByLabel(dialog(), 'reporting manager'), 'Latha Suresh');
      await click(() => findBtn(dialog(), 'mark offer as extended'), () => c().saveOffer(applicationId, {
        candidateName: `${NAME.first} ${NAME.last}`, jobTitle: c().getApplication(applicationId)?.jobTitle || 'Product Designer',
        department: 'SAP Functional', joiningDate: daysFromNow(21), reportingManager: 'Latha Suresh',
        location: 'Bengaluru, India', employmentType: 'Full-time', compensation: '', probationPeriod: '6 months', benefits: '',
      }, true));
      await sleep(500);
      if (!c().offerFor(applicationId)) c().saveOffer(applicationId, {
        candidateName: `${NAME.first} ${NAME.last}`, jobTitle: 'Product Designer', department: 'SAP Functional',
        joiningDate: daysFromNow(21), reportingManager: 'Latha Suresh', location: 'Bengaluru, India',
        employmentType: 'Full-time', compensation: '', probationPeriod: '6 months', benefits: '',
      }, true);
      await hold(9);

      // 10 — confirm accepted
      await click(() => findBtn(document, 'confirm accepted', 'confirm offer accepted'), () => {
        const o = c().offerFor(applicationId); if (o) c().confirmOfferAccepted(o.id);
      });
      await hold(10);

      // 11 — onboarding form
      await switchTo(ROLES.CANDIDATE, '/candidate/application', 'Back to the candidate — onboarding form…');
      const obBtn = await waitFor(() => findBtn(document, 'submit onboarding details'));
      const obCard = obBtn?.closest('.ta-card, .card') || document;
      const obInputs = [...obCard.querySelectorAll('input:not([disabled])')];
      for (let i = 0; i < obInputs.length && i < ONBOARDING_SEQ.length; i++) {
        guard();
        await pointAt(obInputs[i], true);
        obInputs[i].focus();
        const v = ONBOARDING_SEQ[i];
        for (let k = 1; k <= v.length; k++) { nativeSet(obInputs[i], v.slice(0, k)); await sleep(20); }
        obInputs[i].blur();
        await sleep(90);
      }
      await click(() => findBtn(document, 'submit onboarding details'), () => c().submitOnboardingForms(applicationId, BOT_ONBOARDING));
      await sleep(500);
      if (c().getApplication(applicationId)?.status !== APP_STATUS.HR_VERIFICATION) c().submitOnboardingForms(applicationId, BOT_ONBOARDING);
      await hold(11);

      // 12 — HR verifies onboarding
      await switchTo(ROLES.HR, `/hr/candidates/${candidateId}`, 'Switching to the HR view…');
      await click(() => findBtn(document, 'verify onboarding'), () => c().verifyOnboarding(applicationId));
      await hold(12);

      // 13 — HR completes joining (opens the team-role modal)
      await click(() => findBtn(document, 'complete joining', 'mark joining complete'));
      await sleep(600);
      await type(() => dialog().querySelector('input:not([type=file])'), 'SAP Functional');
      await click(() => findBtn(dialog(), 'complete joining'), () => c().completeJoining(applicationId, 'SAP Functional'));
      await sleep(500);
      if (c().getApplication(applicationId)?.status !== APP_STATUS.EMPLOYEE) c().completeJoining(applicationId, 'SAP Functional');
      // close any leftover dialog
      const leftover = document.querySelector('[role="dialog"] .icon-btn, [role="dialog"] [aria-label="Close"]');
      if (leftover) leftover.click();
      await hold(13);
      navigate(`/hr/candidates/${candidateId}`);
      setBotLabel(`${NAME.first} is now an employee 🎉`);
    } catch {
      /* stopped or a step failed — leave the app wherever it got to */
    } finally {
      runningRef.current = false;
      setPlaying(false);
      setCursor((cur) => ({ ...cur, show: false }));
    }
  }

  const botCursor = cursor.show ? (
    <div className={`botcursor${cursor.click ? ' is-click' : ''}`} style={{ transform: `translate(${cursor.x}px, ${cursor.y}px)` }} aria-hidden="true">
      <svg viewBox="0 0 24 24" width="22" height="22">
        <path d="M5 3l14 7-6 2-2 6-6-15z" fill="#111827" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
      <span className="botcursor__ring" />
    </div>
  ) : null;

  // Hide the launcher on the marketing / sign-in screens (unless mid-run).
  if (!playing && (pathname === '/' || pathname === '/login')) return null;

  if (playing) {
    return (
      <>
        {botCursor}
        <div className="demobar" role="status">
          <span className="demobar__icon"><Icon name="Bot" size={15} /></span>
          <span className="demobar__step">{Math.min(botStep + 1, STEPS.length)}/{STEPS.length}</span>
          <span className="demobar__text">{botLabel}</span>
          <button type="button" className="demobar__stop" onClick={stop}><Icon name="Square" size={12} /> Stop</button>
          <span className="demobar__bar"><span style={{ width: `${(doneCount / STEPS.length) * 100}%` }} /></span>
        </div>
      </>
    );
  }

  if (!open) {
    return (
      <>
        {botCursor}
        <button type="button" className="demoflow__fab" onClick={() => setOpen(true)}>
          <Icon name="Bot" size={15} />
          Demo bot
          <span className="demoflow__fabcount">{doneCount}/{STEPS.length}</span>
        </button>
      </>
    );
  }

  return (
    <>
      {botCursor}
      <aside className="demoflow" aria-label="Demo bot">
        <header className="demoflow__head">
          <span className="demoflow__title"><Icon name="Bot" size={15} /> Candidate → TA → HR</span>
          <div className="demoflow__headbtns">
            <button type="button" onClick={restart} title="Reset to the start"><Icon name="RotateCcw" size={14} /></button>
            <button type="button" onClick={() => setOpen(false)} title="Hide"><Icon name="X" size={15} /></button>
          </div>
        </header>

        <button type="button" className="demoflow__play" onClick={allDone ? restart : runBot}>
          <Icon name={allDone ? 'RotateCcw' : 'Play'} size={13} />
          {allDone ? 'Run the demo again' : 'Auto-play the full flow'}
        </button>

        <div className="demoflow__bar"><span style={{ width: `${(doneCount / STEPS.length) * 100}%` }} /></div>
        <p className="demoflow__sub">
          {allDone ? 'Full lifecycle complete — the candidate is now an employee.' : `Step ${doneCount + 1} of ${STEPS.length} · ${STEPS[currentIndex].who}`}
        </p>

        <ol className="demoflow__list">
          {STEPS.map((s, i) => {
            const done = i < doneCount;
            const active = i === currentIndex && !allDone;
            return (
              <li key={s.title} className={`demoflow__step${done ? ' is-done' : ''}${active ? ' is-active' : ''}`}>
                <span className="demoflow__dot">{done ? <Icon name="Check" size={12} /> : i + 1}</span>
                <div className="demoflow__body">
                  <span className="demoflow__steptitle">{s.title}</span>
                  <span className="demoflow__who">{s.who}</span>
                  {active && (
                    <>
                      <span className="demoflow__hint">{s.hint}</span>
                      <button type="button" className="demoflow__go" onClick={() => goToStep(s)} disabled={s.at > 1 && !trackedApp}>
                        Take me there <Icon name="ArrowRight" size={13} />
                      </button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </aside>
    </>
  );
}
