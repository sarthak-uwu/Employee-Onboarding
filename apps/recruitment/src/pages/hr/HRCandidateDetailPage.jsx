import { useLayoutEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Icon from '../../components/common/Icon.jsx';
import TAHeader from '../../components/ta/TAHeader.jsx';
import Card from '../../components/ta/Card.jsx';
import Button from '../../components/ta/Button.jsx';
import Tag from '../../components/ta/Tag.jsx';
import EmptyState from '../../components/ta/EmptyState.jsx';
import ReasonModal from '../../components/workflow/ReasonModal.jsx';
import AssignRoleModal from '../../components/workflow/AssignRoleModal.jsx';
import StepTitle from '../../components/workflow/StepTitle.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import {
  APP_STATUS,
  DOC_STATUS,
  DOC_STATUS_META,
  OFFER_STATUS_META,
  PIPELINE_STAGES,
  stageIndexForStatus,
  stageBadgeForStatus,
} from '../../constants/statuses.js';
import { formatDate, formatCurrencyINR } from '../../utils/format.js';
import { collapseDocActivity } from '../../utils/activity.js';

// The old system's tone names ('info'/'success'/...) don't match Tag's tone
// names ('blue'/'green'/...) — map them once, same as the TA detail page does.
const TONE = { info: 'blue', success: 'green', error: 'red', warning: 'amber', neutral: 'grey' };

// HR-owned workflow: how far the candidate has moved through HR's three steps.
const HR_RANK = {
  [APP_STATUS.ONBOARDING_PENDING]: 1,
  [APP_STATUS.HR_VERIFICATION]: 1,
  [APP_STATUS.HR_VERIFICATION_REJECTED]: 1,
  [APP_STATUS.JOINING_PENDING]: 2,
  [APP_STATUS.EMPLOYEE]: 3,
};
const STEP_LABELS = ['Onboarding Verification', 'Joining', 'Employee'];

function Info({ label, value }) {
  return (
    <div className="ta-info__item">
      <span className="ta-info__label">{label}</span>
      <span className="ta-info__value">{value || '—'}</span>
    </div>
  );
}

export default function HRCandidateDetailPage() {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const {
    getApplicationByCandidate, documentsFor, offerFor, employeeFor, activitiesFor,
    verifyDocument, rejectDocument, verifyOnboarding, rejectOnboarding, completeJoining, assignEmployeeRole,
  } = useApp();

  const app = getApplicationByCandidate(candidateId);
  const [rejectingOnboarding, setRejectingOnboarding] = useState(false);
  const [rejectDoc, setRejectDoc] = useState(null);
  const [joining, setJoining] = useState(false);
  const [editingRole, setEditingRole] = useState(false);
  const [tab, setTab] = useState('overview');
  const [step, setStep] = useState(null);
  const [showAllAct, setShowAllAct] = useState(false);

  // Keep the Activity card no taller than the workflow column beside it.
  const leftColRef = useRef(null);
  const [sideMax, setSideMax] = useState(null);
  useLayoutEffect(() => {
    const el = leftColRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const sync = () => setSideMax(window.innerWidth > 1160 ? el.offsetHeight : null);
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    window.addEventListener('resize', sync);
    return () => { ro.disconnect(); window.removeEventListener('resize', sync); };
  }, []);

  if (!app) {
    return (
      <EmptyState icon="UserX" title="Candidate not found" message="This candidate may have been removed."
        action={<Button variant="ghost" onClick={() => navigate('/hr/candidates')}>Back to candidates</Button>} />
    );
  }

  const name = `${app.personal.firstName} ${app.personal.lastName}`;
  const p = app.personal;
  const pr = app.professional;
  const documents = documentsFor(app.id);
  const offer = offerFor(app.id);
  const employee = employeeFor(app.id);
  const activities = collapseDocActivity(activitiesFor(app.id), documents.length);
  const badge = stageBadgeForStatus(app.status);

  const stageIdx = Math.max(0, stageIndexForStatus(app.status));
  const progress = Math.round(((stageIdx + 1) / PIPELINE_STAGES.length) * 100);

  const act = (fn, msg) => { fn(); toast.success(msg); };
  const markJoined = (teamRole) => {
    const employeeId = completeJoining(app.id, teamRole);
    toast.success(`Joining completed — employee ID ${employeeId}${teamRole ? ` · ${teamRole}` : ''}.`);
    setJoining(false);
  };
  const saveRole = (teamRole) => {
    assignEmployeeRole(employee.id, teamRole);
    toast.success(teamRole ? `Team role set to ${teamRole}.` : 'Team role cleared.');
    setEditingRole(false);
  };

  // ---- workflow steps ----
  const rank = HR_RANK[app.status] || 1;
  const s1 = rank > 1 ? 'done' : 'current';
  const s2 = rank > 2 ? 'done' : rank === 2 ? 'current' : 'upcoming';
  const s3 = rank === 3 ? 'done' : 'upcoming';
  const stepStates = [s1, s2, s3];
  const maxStep = stepStates.reduce((acc, s, i) => (s === 'upcoming' ? acc : i + 1), 1);
  const liveStep = (() => {
    const i = stepStates.indexOf('current');
    return i >= 0 ? i + 1 : maxStep;
  })();
  const activeStep = Math.min(step ?? liveStep, maxStep);
  const goStep = (n) => setStep(Math.min(maxStep, Math.max(1, n)));

  const onboardingRows = app.onboarding && (
    <div className="ta-info">
      <Info label="10th school" value={app.onboarding.tenth?.school} />
      <Info label="10th board / year" value={[app.onboarding.tenth?.board, app.onboarding.tenth?.year].filter(Boolean).join(' · ')} />
      <Info label="10th percentage" value={app.onboarding.tenth?.percentage ? `${app.onboarding.tenth.percentage}%` : ''} />
      <Info label="12th school" value={app.onboarding.twelfth?.school} />
      <Info label="12th board / year" value={[app.onboarding.twelfth?.board, app.onboarding.twelfth?.year].filter(Boolean).join(' · ')} />
      <Info label="12th percentage" value={app.onboarding.twelfth?.percentage ? `${app.onboarding.twelfth.percentage}%` : ''} />
      <Info label="Permanent address" value={[app.onboarding.address?.line1, app.onboarding.address?.city, app.onboarding.address?.state, app.onboarding.address?.postalCode].filter(Boolean).join(', ')} />
      <Info label="Emergency contact" value={app.onboarding.emergencyContact?.name && `${app.onboarding.emergencyContact.name} · ${app.onboarding.emergencyContact.phone}`} />
    </div>
  );

  const tiles = [
    ['overview', 'Overview', 'LayoutDashboard'],
    ['contact', 'Contact', 'Mail'],
    documents.length > 0 && ['documents', 'Documents', 'Files'],
    offer && ['offer', 'Offer', 'FileCheck'],
  ].filter(Boolean);

  return (
    <>
      <TAHeader
        title={name}
        subtitle={`${app.candidateId} · applied for ${app.jobTitle}`}
        backTo="/hr/candidates"
        backLabel="Candidates"
      />

      <div className="ta-progress-row">
        <div className="ta-progress"><div className="ta-progress__bar" style={{ width: `${progress}%` }} /></div>
        <span className="ta-cell-sub">{PIPELINE_STAGES[stageIdx]?.label} · {progress}%</span>
      </div>

      {app.status === APP_STATUS.HR_VERIFICATION_REJECTED && app.onboardingRejectReason && (
        <div className="ta-note ta-note--warn"><Icon name="RotateCcw" size={15} /> Returned to candidate: {app.onboardingRejectReason}</div>
      )}

      <div className="ta-detail-grid">
        <div className="ta-stack" ref={leftColRef}>
          <Card>
            <div className="ta-ptabs">
              {tiles.map(([k, label, icon]) => (
                <button
                  key={k}
                  type="button"
                  className={`ta-ptab${tab === k ? ' is-active' : ''}`}
                  onClick={() => setTab(k)}
                >
                  <Icon name={icon} size={15} /> {label}
                </button>
              ))}
            </div>

            {tab === 'overview' && (
              <div className="ta-snapshot">
                <div className="ta-snapshot__stage">
                  <span className="ta-info__label">Current stage</span>
                  <Tag tone={badge.tone}>{badge.label}</Tag>
                </div>
                <dl className="ta-snapshot__list">
                  {[
                    ['Current role', pr.currentJobTitle ? `${pr.currentJobTitle}${pr.currentCompany ? ` @ ${pr.currentCompany}` : ''}` : null],
                    ['Experience', pr.totalExperience ? `${pr.totalExperience} yrs` : null],
                    ['Expected CTC', pr.expectedCTC ? formatCurrencyINR(pr.expectedCTC) : null],
                    ['Location', p.currentLocation ? `${p.currentLocation}${p.preferredLocation && p.preferredLocation !== p.currentLocation ? ` → ${p.preferredLocation}` : ''}` : null],
                    ['Source', app.source || null],
                    ['Submitted', formatDate(app.submittedAt)],
                  ].filter(([, v]) => v).map(([k, v]) => (
                    <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
                  ))}
                </dl>
              </div>
            )}

            {tab === 'contact' && (
              <>
                <div className="ta-info">
                  <Info label="Email" value={p.email} />
                  <Info label="Mobile" value={p.mobile} />
                  <Info label="Current location" value={p.currentLocation} />
                  <Info label="Preferred location" value={p.preferredLocation} />
                </div>
                <a className="ta-btn ta-btn--ghost" href={`mailto:${p.email}`} style={{ marginTop: 16 }}>
                  <Icon name="Mail" size={15} /> Mail to
                </a>
              </>
            )}

            {tab === 'documents' && (
              <div className="ta-stack">
                <div style={{ marginBottom: 4 }}>
                  <Tag tone={documents.every((d) => d.status === DOC_STATUS.VERIFIED) ? 'green' : 'amber'}>
                    {documents.filter((d) => d.status === DOC_STATUS.VERIFIED).length}/{documents.length} verified
                  </Tag>
                </div>
                {documents.map((doc) => {
                  const m = DOC_STATUS_META[doc.status];
                  return (
                    <div className="ta-docrow" key={doc.id}>
                      <span className="ta-docrow__icon"><Icon name="FileText" size={16} /></span>
                      <div className="grow">
                        <div className="ta-cell-strong">{doc.label}</div>
                        <div className="ta-cell-sub">{doc.fileName || 'No file uploaded'}{doc.status === DOC_STATUS.REJECTED && doc.rejectionReason ? ` · ${doc.rejectionReason}` : ''}</div>
                      </div>
                      <Tag tone={TONE[m.tone] || 'grey'}>{m.label}</Tag>
                      {doc.status === DOC_STATUS.UPLOADED && (
                        <span className="ta-rowactions" style={{ opacity: 1 }}>
                          <button className="ta-iconbtn" title="Verify" onClick={() => act(() => verifyDocument(doc.id), `${doc.label} verified.`)}><Icon name="Check" size={15} /></button>
                          <button className="ta-iconbtn" title="Reject" onClick={() => setRejectDoc(doc)}><Icon name="X" size={15} /></button>
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {tab === 'offer' && offer && (
              <>
                <div style={{ marginBottom: 12 }}>
                  <Tag tone={TONE[OFFER_STATUS_META[offer.status].tone] || 'grey'}>{OFFER_STATUS_META[offer.status].label}</Tag>
                </div>
                <div className="ta-info">
                  <Info label="Job title" value={offer.jobTitle} />
                  <Info label="Department" value={offer.department} />
                  <Info label="Joining date" value={formatDate(offer.joiningDate)} />
                  <Info label="Compensation" value={formatCurrencyINR(offer.compensation)} />
                  <Info label="Reporting manager" value={offer.reportingManager} />
                  <Info label="Probation" value={offer.probationPeriod} />
                </div>
              </>
            )}
          </Card>

          {/* Workflow — one step per page */}
          <Card title="Onboarding workflow" action={<span className="ta-cell-sub">Step {activeStep} of {maxStep}</span>}>
            <div className="ta-wizard__tabs">
              {STEP_LABELS.slice(0, maxStep).map((label, i) => {
                const n = i + 1;
                const st = stepStates[i];
                return (
                  <button
                    key={n}
                    type="button"
                    className={`ta-wizard__tab${n === activeStep ? ' is-active' : ''}`}
                    onClick={() => goStep(n)}
                  >
                    <span className={`ta-step__num ta-step__num--${n === activeStep ? 'current' : st}`}>
                      {st === 'done' && n !== activeStep ? <Icon name="Check" size={13} strokeWidth={3} /> : n}
                    </span>
                    <span className="ta-wizard__tablabel">{label}</span>
                  </button>
                );
              })}
            </div>

            <div className="ta-wizard__panel">
              <div className="ta-wizard__panelhead">
                <StepTitle n={activeStep} label={STEP_LABELS[activeStep - 1]} state={stepStates[activeStep - 1]} />
              </div>

              {activeStep === 1 && (
                app.status === APP_STATUS.ONBOARDING_PENDING ? (
                  <p className="ta-cell-mute">Waiting for the candidate to submit their onboarding details.</p>
                ) : app.status === APP_STATUS.HR_VERIFICATION_REJECTED ? (
                  <>
                    <p className="ta-cell-sub" style={{ marginBottom: 12 }}>Returned to the candidate — waiting for the corrected details.</p>
                    {onboardingRows}
                  </>
                ) : (
                  <>
                    {app.status === APP_STATUS.HR_VERIFICATION ? (
                      <p className="ta-cell-sub" style={{ marginBottom: 12 }}>Review the submitted details, then verify or send them back for correction.</p>
                    ) : (
                      <p className="ta-cell-sub" style={{ marginBottom: 12 }}>Onboarding details verified.</p>
                    )}
                    {onboardingRows}
                    {app.status === APP_STATUS.HR_VERIFICATION && (
                      <div className="ta-btnrow" style={{ marginTop: 14 }}>
                        <Button icon="CheckCircle2" onClick={() => act(() => verifyOnboarding(app.id), 'Onboarding verified — joining is now pending.')}>Verify onboarding</Button>
                        <Button variant="ghost" icon="RotateCcw" onClick={() => setRejectingOnboarding(true)}>Return to candidate</Button>
                      </div>
                    )}
                  </>
                )
              )}

              {activeStep === 2 && (
                s2 === 'upcoming' ? (
                  <p className="ta-cell-mute">Opens once onboarding details are verified.</p>
                ) : app.status === APP_STATUS.JOINING_PENDING ? (
                  <>
                    <p className="ta-cell-sub" style={{ marginBottom: 12 }}>Confirm the candidate has joined to create their employee record.</p>
                    <div className="ta-btnrow">
                      <Button icon="UserRoundCheck" onClick={() => setJoining(true)}>Mark joining completed</Button>
                    </div>
                  </>
                ) : (
                  <div className="ta-info">
                    <Info label="Joined on" value={employee && formatDate(employee.joiningDate)} />
                    <Info label="Employee ID" value={employee?.id} />
                  </div>
                )
              )}

              {activeStep === 3 && (
                !employee ? (
                  <p className="ta-cell-mute">Available after joining is completed.</p>
                ) : (
                  <>
                    <div className="ta-info">
                      <Info label="Employee ID" value={employee.id} />
                      <Info label="Position" value={employee.position} />
                      <Info label="Department" value={employee.department} />
                      <Info label="Team role" value={employee.teamRole} />
                      <Info label="Joining date" value={formatDate(employee.joiningDate)} />
                    </div>
                    <div className="ta-btnrow" style={{ marginTop: 14 }}>
                      <Button variant="ghost" icon={employee.teamRole ? 'Pencil' : 'Plus'} onClick={() => setEditingRole(true)}>
                        {employee.teamRole ? 'Change team role' : 'Assign team role'}
                      </Button>
                    </div>
                  </>
                )
              )}
            </div>

            <div className="ta-wizard__nav">
              <Button variant="ghost" icon="ChevronLeft" disabled={activeStep === 1} onClick={() => goStep(activeStep - 1)}>Back</Button>
              <Button variant="ghost" iconRight="ChevronRight" disabled={activeStep >= maxStep} onClick={() => goStep(activeStep + 1)}>Next</Button>
            </div>
          </Card>
        </div>

        <div
          className="ta-stack ta-actside"
          style={sideMax ? { maxHeight: `${sideMax}px` } : undefined}
        >
          <Card title="Activity">
            {activities.length === 0 ? (
              <p className="ta-cell-mute">No activity yet.</p>
            ) : (
              <>
                <ol className="ta-timeline ta-timeline--scroll">
                  {(showAllAct ? activities : activities.slice(0, 4)).map((a) => (
                    <li key={a.id}>
                      <span className="ta-timeline__dot" />
                      <div>
                        <div className="ta-cell-strong">{a.title}</div>
                        <div className="ta-cell-sub">{a.description}</div>
                        <div className="ta-cell-sub">{formatDate(a.at)} · {a.actor}</div>
                      </div>
                    </li>
                  ))}
                </ol>
                {activities.length > 4 && (
                  <button
                    type="button"
                    className={`ta-actmore${showAllAct ? ' is-open' : ''}`}
                    onClick={() => setShowAllAct((v) => !v)}
                  >
                    {showAllAct ? 'Show less' : `Show all ${activities.length}`}
                    <Icon name="ChevronDown" size={14} />
                  </button>
                )}
              </>
            )}
          </Card>
        </div>
      </div>

      <ReasonModal
        open={rejectingOnboarding} onClose={() => setRejectingOnboarding(false)}
        title="Return onboarding details" label="What needs to be corrected?" confirmLabel="Return to candidate" tone="secondary"
        onSubmit={(reason) => { rejectOnboarding(app.id, reason); setRejectingOnboarding(false); toast.success('Onboarding details returned to candidate.'); }}
      />
      <ReasonModal
        open={!!rejectDoc} onClose={() => setRejectDoc(null)}
        title={`Reject ${rejectDoc?.label || 'document'}`} label="What is wrong with it?" confirmLabel="Reject document" tone="danger"
        onSubmit={(reason) => { rejectDocument(rejectDoc.id, reason); setRejectDoc(null); toast.success('Document rejected — candidate notified.'); }}
      />
      <AssignRoleModal
        open={joining}
        name={name}
        title={`Complete joining — ${name}`}
        hint="This becomes the employee's team role. You can change it later from this page."
        confirmLabel="Complete joining"
        onClose={() => setJoining(false)}
        onSave={markJoined}
      />
      <AssignRoleModal
        open={editingRole}
        name={name}
        initialRole={employee?.teamRole || ''}
        title={`Team role — ${name}`}
        onClose={() => setEditingRole(false)}
        onSave={saveRole}
      />
    </>
  );
}
