import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Icon from '../../components/common/Icon.jsx';
import TAHeader from '../../components/ta/TAHeader.jsx';
import Card from '../../components/ta/Card.jsx';
import Button from '../../components/ta/Button.jsx';
import Tag from '../../components/ta/Tag.jsx';
import EmptyState from '../../components/ta/EmptyState.jsx';
import ReasonModal from '../../components/workflow/ReasonModal.jsx';
import ScheduleInterviewModal from '../../components/workflow/ScheduleInterviewModal.jsx';
import InterviewResultModal from '../../components/workflow/InterviewResultModal.jsx';
import OfferDrawer from '../../components/workflow/OfferDrawer.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { findJob } from '../../data/jobs.js';
import { getApplication, getApplicationEvents, decideApplication, startReview as startReviewApi } from '../../api/applications.js';
import { applicationFromDb } from '../../api/mappers.js';
import {
  APP_STATUS,
  ROUND_STATUS,
  ROUND_STATUS_META,
  DOC_STATUS,
  DOC_STATUS_META,
  OFFER_STATUS_META,
  PIPELINE_STAGES,
  stageIndexForStatus,
  stageBadgeForStatus,
  isDocMandatory,
} from '../../constants/statuses.js';
import { formatDate, formatCurrencyINR } from '../../utils/format.js';
import { collapseDocActivity } from '../../utils/activity.js';
import StepTitle from '../../components/workflow/StepTitle.jsx';

function Info({ label, value }) {
  return (
    <div className="ta-info__item">
      <span className="ta-info__label">{label}</span>
      <span className="ta-info__value">{value || '—'}</span>
    </div>
  );
}

const IN_REVIEW = [APP_STATUS.SUBMITTED, APP_STATUS.TA_REVIEW];
const IN_INTERVIEW = [APP_STATUS.INTERVIEW_PLANNING, APP_STATUS.INTERVIEW_IN_PROGRESS, APP_STATUS.INTERVIEW_PASSED];
const CAN_OFFER = [APP_STATUS.DOCS_VERIFIED, APP_STATUS.OFFER_DRAFT];
const DOC_STAGES = [
  APP_STATUS.DOC_VERIFICATION, APP_STATUS.DOCS_VERIFIED, APP_STATUS.OFFER_DRAFT,
  APP_STATUS.OFFER_ISSUED, APP_STATUS.OFFER_ACCEPTED, APP_STATUS.ONBOARDING_PENDING,
  APP_STATUS.HR_VERIFICATION, APP_STATUS.HR_VERIFICATION_REJECTED, APP_STATUS.JOINING_PENDING, APP_STATUS.EMPLOYEE,
];

/* Database application + timeline -> the shape this page renders. */
function adaptRemote(a, events) {
  if (!a) return null;
  return {
    id: a.id,
    candidateId: a.code,
    status: a.status,
    jobId: a.jobId,
    jobTitle: a.jobTitle,
    isGeneral: !a.jobId,
    source: a.source === 'ta_link' ? 'TA link' : 'Careers',
    submittedAt: a.submittedAt,
    assignedTo: 'Talent Acquisition',
    returnReason: a.returnReason,
    rejectReason: a.rejectReason,
    personal: a.personal || {},
    professional: a.professional || {},
    education: a.education || [],
    additional: a.additional || {},
    _events: (events || []).map((e) => ({
      id: e.id, title: e.title, description: e.description, at: e.created_at, actor: e.actor_label || 'System',
    })),
  };
}

export default function TACandidateDetailPage() {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { configured } = useAuth();
  const {
    getApplicationByCandidate, interviewsFor, documentsFor, offerFor, employeeFor, activitiesFor,
    startReview, approveApplication, returnApplication, rejectApplication,
    scheduleInterview, recordInterviewResult, advanceToDocuments,
    verifyDocument, rejectDocument, saveOffer, confirmOfferAccepted, declineOffer,
  } = useApp();

  const [remote, setRemote] = useState({ loading: configured, app: null });
  const reloadRemote = () => {
    if (!configured) return;
    Promise.all([getApplication(candidateId), getApplicationEvents(candidateId)])
      .then(([a, ev]) => setRemote({ loading: false, app: adaptRemote(applicationFromDb(a), ev) }))
      .catch(() => setRemote({ loading: false, app: null }));
  };
  useEffect(() => {
    if (configured) reloadRemote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configured, candidateId]);

  const app = configured ? remote.app : getApplicationByCandidate(candidateId);
  const [modal, setModal] = useState(null); // 'return' | 'reject' | 'schedule' | 'offer'
  const [resultFor, setResultFor] = useState(null);
  const [rejectDoc, setRejectDoc] = useState(null);
  const [step, setStep] = useState(null); // wizard page; null = follow the live stage
  const [showAllAct, setShowAllAct] = useState(false);
  const [tab, setTab] = useState('overview'); // profile tile: overview | contact | experience | skills

  // Keep the Activity card no taller than the workflow column beside it — it
  // scrolls internally instead of running past the left card's bottom edge.
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

  useEffect(() => {
    if (!app || app.status !== APP_STATUS.SUBMITTED) return;
    if (configured) startReviewApi(app.id).then(reloadRemote).catch(() => {});
    else startReview(app.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app?.id, app?.status]);

  if (configured && remote.loading) {
    return <div className="cx-loading" style={{ padding: 48 }}>Loading candidate…</div>;
  }

  if (!app) {
    return (
      <EmptyState icon="UserX" title="Candidate not found" message="This candidate may have been removed."
        action={<Button variant="ghost" onClick={() => navigate('/ta/candidates')}>Back to candidates</Button>} />
    );
  }

  const name = `${app.personal.firstName} ${app.personal.lastName}`;
  const p = app.personal;
  const pr = app.professional;
  const job = app.jobId ? findJob(app.jobId) : null;
  const interviews = configured ? [] : interviewsFor(app.id);
  const documents = configured ? [] : documentsFor(app.id);
  const offer = configured ? null : offerFor(app.id);
  const employee = configured ? null : employeeFor(app.id);
  const activities = configured
    ? app._events
    : collapseDocActivity(activitiesFor(app.id), documents.length);
  const badge = stageBadgeForStatus(app.status);

  const stageIdx = Math.max(0, stageIndexForStatus(app.status));
  const rejected = app.status === APP_STATUS.REJECTED;
  const progress = rejected ? 0 : Math.round(((stageIdx + 1) / PIPELINE_STAGES.length) * 100);

  const canVerifyDocs = [APP_STATUS.DOC_VERIFICATION, APP_STATUS.DOCS_VERIFIED].includes(app.status);
  const showDocs = DOC_STAGES.includes(app.status);

  const act = (fn, msg) => { fn(); toast.success(msg); };

  // TA review decision — real edge function when configured, mock action otherwise.
  const decide = async (action, reason, msg, mockFn) => {
    if (configured) {
      try {
        await decideApplication(app.id, action, reason);
        await reloadRemote();
        toast.success(msg);
      } catch (e) {
        toast.error(e.message || 'Could not complete that action.');
      }
    } else {
      mockFn();
      toast.success(msg);
    }
  };

  // Workflow step states — pipeline index: 1 review, 2 interview, 3 documents, 4 offer.
  const cur = stageIdx;
  const stepState = (idx) => (cur > idx ? 'done' : cur === idx ? 'current' : 'upcoming');
  const s1 = rejected ? 'current' : cur >= 2 ? 'done' : 'current';
  const s2 = rejected ? (cur >= 2 ? 'done' : 'upcoming') : stepState(2);
  const s3 = stepState(3);
  const s4 = stepState(4);

  const STEP_LABELS = ['Application Review', 'Interview Scheduling', 'Document Verification', 'Offer'];
  const stepStates = [s1, s2, s3, s4];
  // only show steps the application has actually reached (up to and including the current one)
  const maxStep = stepStates.reduce((acc, s, i) => (s === 'upcoming' ? acc : i + 1), 1);
  const liveStep = (() => {
    const i = stepStates.indexOf('current');
    return i >= 0 ? i + 1 : maxStep;
  })();
  const activeStep = Math.min(step ?? liveStep, maxStep);
  const goStep = (n) => setStep(Math.min(maxStep, Math.max(1, n)));

  return (
    <>
      <TAHeader
        title={name}
        subtitle={`${app.candidateId} · applied for ${app.jobTitle}`}
        backTo="/ta/candidates"
        backLabel="Candidates"
      />

      {!rejected && (
        <div className="ta-progress-row">
          <div className="ta-progress"><div className="ta-progress__bar" style={{ width: `${progress}%` }} /></div>
          <span className="ta-cell-sub">{PIPELINE_STAGES[stageIdx]?.label} · {progress}%</span>
        </div>
      )}

      {app.status === APP_STATUS.RETURNED && (
        <div className="ta-note ta-note--warn"><Icon name="RotateCcw" size={15} /> Returned to candidate: {app.returnReason}</div>
      )}
      {app.status === APP_STATUS.OFFER_ISSUED && (
        <div className="ta-note ta-note--info">
          <Icon name="Mail" size={15} />
          <span>Offer letter sent. When the candidate replies by email to accept, click <strong>Confirm offer accepted</strong> to hand over to HR.</span>
        </div>
      )}
      {rejected && (
        <div className="ta-note ta-note--err"><Icon name="XCircle" size={15} /> Application rejected{app.rejectReason ? `: ${app.rejectReason}` : ''}</div>
      )}

      <div className="ta-detail-grid">
        <div className="ta-stack" ref={leftColRef}>
          <Card>
            <div className="ta-ptabs">
              {[
                ['overview', 'Overview', 'LayoutDashboard'],
                ['contact', 'Contact', 'Mail'],
                ['experience', 'Experience', 'Briefcase'],
                ['skills', 'Skills & education', 'GraduationCap'],
              ].map(([k, label, icon]) => (
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
                    ['Notice period', pr.noticePeriod || null],
                    ['Expected CTC', pr.expectedCTC ? formatCurrencyINR(pr.expectedCTC) : null],
                    ['Location', p.currentLocation ? `${p.currentLocation}${p.preferredLocation && p.preferredLocation !== p.currentLocation ? ` → ${p.preferredLocation}` : ''}` : null],
                    ['Application', app.isGeneral ? 'General' : 'Specific vacancy'],
                    ['Source', app.source || null],
                    ['Submitted', formatDate(app.submittedAt)],
                    ['Assigned to', app.assignedTo || null],
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

            {tab === 'experience' && (
              <div className="ta-info">
                <Info label="Current title" value={pr.currentJobTitle} />
                <Info label="Current company" value={pr.currentCompany} />
                <Info label="Total experience" value={pr.totalExperience ? `${pr.totalExperience} years` : '—'} />
                <Info label="Relevant experience" value={pr.relevantExperience ? `${pr.relevantExperience} years` : '—'} />
                <Info label="Notice period" value={pr.noticePeriod} />
                <Info label="Expected CTC" value={formatCurrencyINR(pr.expectedCTC)} />
              </div>
            )}

            {tab === 'skills' && (
              <>
                <div className="ta-skills" style={{ marginBottom: 16 }}>
                  {(pr.skills || []).length ? pr.skills.map((s) => <span key={s} className="ta-skill">{s}</span>) : <span className="ta-cell-mute">No skills listed</span>}
                </div>
                {(app.education || []).map((e, i) => (
                  <div key={e.id || i} className="ta-info__item" style={{ marginBottom: 8 }}>
                    <span className="ta-info__label">{e.qualification || `Education ${i + 1}`}</span>
                    <span className="ta-info__value">{[e.university, e.specialization, e.year].filter(Boolean).join(' · ') || '—'}</span>
                  </div>
                ))}
              </>
            )}
          </Card>

          {/* Workflow — one step per page */}
          <Card title="Recruitment workflow" action={<span className="ta-cell-sub">Step {activeStep} of {maxStep}</span>}>
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
                {activeStep === 2 && IN_INTERVIEW.includes(app.status) && (
                  <Button variant="ghost" icon="CalendarPlus" onClick={() => setModal('schedule')}>Schedule round</Button>
                )}
                {activeStep === 3 && showDocs && (
                  <Tag tone={documents.every((d) => d.status === DOC_STATUS.VERIFIED) ? 'green' : 'amber'}>
                    {documents.filter((d) => d.status === DOC_STATUS.VERIFIED).length}/{documents.length} verified
                  </Tag>
                )}
                {activeStep === 4 && offer && (
                  <Tag tone={{ neutral: 'grey', warning: 'amber', info: 'blue', success: 'green', error: 'red' }[OFFER_STATUS_META[offer.status].tone] || 'grey'}>{OFFER_STATUS_META[offer.status].label}</Tag>
                )}
              </div>

              {activeStep === 1 && (
                IN_REVIEW.includes(app.status) ? (
                  <>
                    <p className="ta-cell-sub" style={{ marginBottom: 12 }}>
                      Check the profile against the role, then take the candidate forward to interviews or send the application back.
                    </p>
                    <div className="ta-btnrow">
                      <Button icon="CheckCircle2" onClick={() => decide('advance', null, 'Candidate advanced to the interview stage.', () => approveApplication(app.id))}>Advance candidate</Button>
                      <Button variant="ghost" icon="RotateCcw" onClick={() => setModal('return')}>Request update</Button>
                      <Button variant="ghost" icon="XCircle" onClick={() => setModal('reject')}>Close application</Button>
                    </div>
                  </>
                ) : app.status === APP_STATUS.RETURNED ? (
                  <p className="ta-cell-sub">Returned to the candidate: {app.returnReason || 'awaiting an updated application.'}</p>
                ) : rejected ? (
                  <p className="ta-cell-sub">Application was not taken forward{app.rejectReason ? `: ${app.rejectReason}` : '.'}</p>
                ) : (
                  <p className="ta-cell-sub">Approved — the candidate moved forward to interviews.</p>
                )
              )}

              {activeStep === 2 && (
                s2 === 'upcoming' ? (
                  <p className="ta-cell-mute">Opens once the application is approved.</p>
                ) : interviews.length === 0 ? (
                  <p className="ta-cell-sub">No round scheduled yet — use <b>Schedule round</b> to set up the first interview.</p>
                ) : (
                  <div className="ta-stack">
                    {interviews.map((iv) => {
                      const m = ROUND_STATUS_META[iv.status];
                      return (
                        <div className="ta-round" key={iv.id}>
                          <div className="ta-round__head">
                            <span className="ta-cell-strong">Round {iv.round} · {iv.type}</span>
                            <Tag tone={m.tone === 'info' ? 'blue' : m.tone === 'success' ? 'green' : m.tone === 'error' ? 'red' : m.tone === 'warning' ? 'amber' : 'grey'}>{m.label}</Tag>
                          </div>
                          <div className="ta-cell-sub">{formatDate(iv.date)} at {iv.time} · {iv.mode} · {iv.interviewer}</div>
                          {iv.comments && iv.status !== ROUND_STATUS.SCHEDULED && (
                            <div className="ta-cell-sub ta-remark" style={{ marginTop: 4 }}>
                              Remarks: {iv.comments}
                              <span className={`ta-remark__tag ta-remark__tag--${iv.shareComments ? 'shared' : 'internal'}`}>
                                {iv.shareComments ? 'Shared with candidate' : 'Internal only'}
                              </span>
                            </div>
                          )}
                          {iv.status === ROUND_STATUS.SCHEDULED && (
                            <div style={{ marginTop: 8 }}>
                              <Button variant="ghost" icon="ClipboardCheck" onClick={() => setResultFor(iv)}>Record result</Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {app.status === APP_STATUS.INTERVIEW_PASSED && (
                      <div style={{ marginTop: 4 }}>
                        <Button icon="ArrowRight" onClick={() => act(() => advanceToDocuments(app.id), 'Moved to document verification.')}>Proceed to documents</Button>
                      </div>
                    )}
                  </div>
                )
              )}

              {activeStep === 3 && (
                !showDocs ? (
                  <p className="ta-cell-mute">Opens once all interview rounds are cleared.</p>
                ) : (
                  <div className="ta-stack">
                    {documents.map((doc) => {
                      const m = DOC_STATUS_META[doc.status];
                      const tone = { info: 'blue', success: 'green', error: 'red', warning: 'amber', neutral: 'grey' }[m.tone] || 'grey';
                      const mandatory = isDocMandatory(doc.key);
                      return (
                        <div className="ta-docrow" key={doc.id}>
                          <span className="ta-docrow__icon"><Icon name="FileText" size={16} /></span>
                          <div className="grow">
                            <div className="ta-cell-strong">{doc.label}{mandatory && <span className="cx-req" title="Mandatory"> *</span>}</div>
                            <div className="ta-cell-sub">{doc.fileName || (doc.status === DOC_STATUS.WAIVED ? 'Not provided by candidate' : 'No file uploaded')}{doc.status === DOC_STATUS.REJECTED && doc.rejectionReason ? ` · ${doc.rejectionReason}` : ''}</div>
                            {doc.status === DOC_STATUS.WAIVED && doc.skipReason && (
                              <div className="ta-cell-sub" style={{ color: 'var(--tag-amber-fg)' }}>Candidate's reason: {doc.skipReason}</div>
                            )}
                          </div>
                          <Tag tone={tone}>{m.label}</Tag>
                          {canVerifyDocs && [DOC_STATUS.UPLOADED, DOC_STATUS.VERIFIED].includes(doc.status) && (
                            <span className="ta-rowactions" style={{ opacity: 1 }}>
                              {doc.status !== DOC_STATUS.VERIFIED && (
                                <button className="ta-iconbtn" title="Verify" onClick={() => act(() => verifyDocument(doc.id), `${doc.label} verified.`)}><Icon name="Check" size={15} /></button>
                              )}
                              <button className="ta-iconbtn" title="Reject" onClick={() => setRejectDoc(doc)}><Icon name="X" size={15} /></button>
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )
              )}

              {activeStep === 4 && (
                s4 === 'upcoming' && !offer ? (
                  <p className="ta-cell-mute">Available once documents are verified.</p>
                ) : (
                  <>
                    {offer ? (
                      <>
                        <p className="ta-cell-sub" style={{ marginBottom: 12 }}>The offer letter is prepared and sent outside the app. These are the details on record.</p>
                        <div className="ta-info">
                          <Info label="Position" value={offer.jobTitle} />
                          <Info label="Department" value={offer.department} />
                          <Info label="Expected joining date" value={formatDate(offer.joiningDate)} />
                          <Info label="Reporting manager" value={offer.reportingManager} />
                        </div>
                      </>
                    ) : (
                      <p className="ta-cell-sub" style={{ marginBottom: 12 }}>Documents are verified. Record the offer details once the letter has been sent.</p>
                    )}
                    <div className="ta-btnrow" style={{ marginTop: offer ? 14 : 0 }}>
                      {CAN_OFFER.includes(app.status) && (
                        <Button icon="FileCheck" onClick={() => setModal('offer')}>{offer ? 'Update offer' : 'Record extended offer'}</Button>
                      )}
                      {app.status === APP_STATUS.OFFER_ISSUED && offer && (
                        <>
                          <Button icon="CheckCircle2" onClick={() => act(() => confirmOfferAccepted(offer.id), 'Offer acceptance confirmed — handed over to HR.')}>Confirm accepted</Button>
                          <Button variant="ghost" icon="XCircle" onClick={() => act(() => declineOffer(offer.id), 'Marked as declined.')}>Mark declined</Button>
                        </>
                      )}
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

      {/* Modals — reused from the existing workflow */}
      <ReasonModal
        open={modal === 'return'} onClose={() => setModal(null)}
        title="Request an update" label="What does the candidate need to add or fix?" confirmLabel="Send request" tone="secondary"
        onSubmit={(reason) => {
          setModal(null);
          decide('request_update', reason, 'Update request sent to the candidate.', () => returnApplication(app.id, reason));
        }}
      />
      <ReasonModal
        open={modal === 'reject'} onClose={() => setModal(null)}
        title="Close application" label="Reason (internal)" confirmLabel="Close application" tone="danger"
        onSubmit={(reason) => {
          setModal(null);
          decide('close', reason, 'Application closed.', () => rejectApplication(app.id, reason));
        }}
      />
      <ReasonModal
        open={!!rejectDoc} onClose={() => setRejectDoc(null)}
        title={`Reject ${rejectDoc?.label || 'document'}`} label="What is wrong with it?" confirmLabel="Reject document" tone="danger"
        onSubmit={(reason) => { rejectDocument(rejectDoc.id, reason); setRejectDoc(null); toast.success('Document rejected — candidate notified.'); }}
      />
      <ScheduleInterviewModal
        open={modal === 'schedule'} onClose={() => setModal(null)} roundNumber={interviews.length + 1}
        onSchedule={(payload) => { scheduleInterview(app.id, payload); setModal(null); toast.success('Interview scheduled.'); }}
      />
      <InterviewResultModal
        open={!!resultFor} onClose={() => setResultFor(null)} interview={resultFor}
        onSave={(res) => { recordInterviewResult(resultFor.id, res); setResultFor(null); toast.success('Interview result saved.'); }}
      />
      {modal === 'offer' && (
        <OfferDrawer
          open onClose={() => setModal(null)} application={app} job={job} existingOffer={offer}
          onSave={(payload) => {
            saveOffer(app.id, payload, true);
            setModal(null);
            toast.success('Extended offer recorded — awaiting the candidate\'s response.');
          }}
        />
      )}
    </>
  );
}
