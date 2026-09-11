import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/common/Icon.jsx';
import Button from '../../components/ta/Button.jsx';
import Card from '../../components/ta/Card.jsx';
import Tag from '../../components/ta/Tag.jsx';
import EmptyState from '../../components/ta/EmptyState.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { listMyApplications, getApplicationEvents, resubmitApplication } from '../../api/applications.js';
import { applicationFromDb } from '../../api/mappers.js';
import { initialsOf, formatDate } from '../../utils/format.js';
import { APP_STATUS, stageIndexForStatus, stageBadgeForStatus } from '../../constants/statuses.js';

/* The candidate's own journey — used to size the progress donut. This app's
   pipeline stops at the offer; onboarding onward lives in the HR application. */
const CANDIDATE_STEPS = ['Applied', 'In review', 'Interview', 'Offer'];
const PIPELINE_TO_CANDIDATE = [1, 1, 2, 3, 3, 3, 3];

/* One friendly line telling the candidate what happens next. */
function nextStep(status) {
  switch (status) {
    case APP_STATUS.SUBMITTED:
    case APP_STATUS.TA_REVIEW:
      return { icon: 'Eye', text: 'Your application is being reviewed by our talent acquisition team.' };
    case APP_STATUS.INTERVIEW_PLANNING:
      return { icon: 'CalendarDays', text: "You've been advanced — we'll be in touch with next steps." };
    default:
      return null;
  }
}

/* Map a database application + timeline into the shape this page renders. */
function adaptRemote(a) {
  if (!a) return null;
  return {
    id: a.id,
    code: a.code,
    jobTitle: a.jobTitle,
    submittedAt: a.submittedAt,
    assignedTo: 'Talent Acquisition',
    status: a.status,
    returnReason: a.returnReason,
    rejectReason: a.rejectReason,
    personal: a.personal || {},
  };
}

export default function MyApplicationPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { configured } = useAuth();
  const [remote, setRemote] = useState({ loading: true, app: null, events: [] });
  const [resubmitting, setResubmitting] = useState(false);

  const load = () => {
    listMyApplications()
      .then(async (apps) => {
        const latest = apps?.[0] ? applicationFromDb(apps[0]) : null;
        const events = latest ? await getApplicationEvents(latest.id) : [];
        setRemote({ loading: false, app: latest, events });
      })
      .catch(() => setRemote({ loading: false, app: null, events: [] }));
  };
  useEffect(() => {
    if (configured) load();
    else setRemote({ loading: false, app: null, events: [] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configured]);

  if (!configured) {
    return (
      <div className="cx-page">
        <div className="wsauth__alert" role="alert">
          <Icon name="AlertCircle" size={15} /> Backend not configured yet — see .env.example.
        </div>
      </div>
    );
  }

  if (remote.loading) {
    return <div className="cx-page"><div className="cx-loading">Loading your application…</div></div>;
  }

  const app = adaptRemote(remote.app);

  if (!app) {
    return (
      <div className="cx-page">
        <EmptyState
          icon="FileText"
          title="No application yet"
          message="Once you submit an application it will appear here with a live status timeline."
          action={<Button icon="Briefcase" onClick={() => navigate('/candidate/jobs')}>Browse jobs</Button>}
        />
      </div>
    );
  }

  const activities = remote.events.map((e) => ({
    id: e.id, title: e.title, description: e.description, at: e.created_at, actor: e.actor_label || 'System',
  }));
  const name = `${app.personal.firstName || ''} ${app.personal.lastName || ''}`.trim() || 'there';

  const status = app.status;
  const badge = stageBadgeForStatus(status);
  const stageIdx = stageIndexForStatus(status);
  const rejected = status === APP_STATUS.REJECTED;
  const hint = nextStep(status);

  const candIdx = rejected ? 0 : (PIPELINE_TO_CANDIDATE[Math.max(0, stageIdx)] ?? 0);
  const progress = rejected ? 0 : Math.round(((candIdx + 1) / CANDIDATE_STEPS.length) * 100);

  const doResubmit = async () => {
    setResubmitting(true);
    try {
      await resubmitApplication(app.id);
      toast.success('Application resubmitted for review.');
      load();
    } catch (e) {
      toast.error(e.message || 'Could not resubmit your application.');
    } finally {
      setResubmitting(false);
    }
  };

  return (
    <div className="cx-page">
      <div className="cx-idcard">
        <div className="cx-idcard__id">
          <span className="cx-idcard__avatar">{initialsOf(name)}</span>
          <div>
            <h2>Hi {app.personal.firstName}</h2>
            <div className="cx-idcard__meta">{app.jobTitle}</div>
          </div>
        </div>
        <dl className="cx-idcard__facts">
          <div><dt>Application reference</dt><dd>{app.code}</dd></div>
          <div><dt>Submitted</dt><dd>{formatDate(app.submittedAt)}</dd></div>
          <div><dt>Assigned to</dt><dd>{app.assignedTo}</dd></div>
        </dl>
        <div className="cx-idcard__progress">
          <div className="cx-idcard__donut" role="img" aria-label={`Progress ${progress} percent`}>
            <svg viewBox="0 0 42 42">
              <circle className="cx-donut-track" cx="21" cy="21" r="15.9" pathLength="100" />
              {!rejected && (
                <circle className="cx-donut-arc" cx="21" cy="21" r="15.9" pathLength="100" strokeDasharray={`${progress} 100`} />
              )}
            </svg>
            <span className="cx-idcard__donutnum">{rejected ? '—' : `${progress}%`}</span>
          </div>
          <div className="cx-idcard__pmeta">
            <span className="cx-idcard__plabel">{rejected ? 'Application status' : 'Progress'}</span>
            <div className="cx-idcard__tag"><Tag tone={badge.tone}>{badge.label}</Tag></div>
          </div>
        </div>
      </div>

      {status === APP_STATUS.RETURNED && (
        <div className="ta-note ta-note--warn" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="RotateCcw" size={15} /> <strong>Action needed:</strong> {app.returnReason}
          </div>
          <Button icon="RotateCcw" onClick={doResubmit} disabled={resubmitting}>
            {resubmitting ? 'Resubmitting…' : 'Resubmit application'}
          </Button>
        </div>
      )}

      <div className="ta-stack">
        <Card title="Recruitment progress">
          {rejected ? (
            <div className="cx-nextline cx-nextline--stop">
              <Icon name="XCircle" size={15} />
              <span>
                <strong>Not selected:</strong>{' '}
                {app.rejectReason || 'After reviewing your application the team decided not to move forward this time.'}
                {' '}We appreciate your interest and encourage you to apply for future roles.
              </span>
            </div>
          ) : hint && status !== APP_STATUS.RETURNED && (
            <div className="cx-nextline">
              <Icon name={hint.icon} size={15} />
              <span><strong>What's next:</strong> {hint.text}</span>
            </div>
          )}

          {activities.length > 0 && (
            <ol className="ta-timeline cx-actlog">
              {activities.slice(0, 12).map((a) => (
                <li key={a.id}>
                  <span className="ta-timeline__dot" />
                  <div className="cx-actitem">
                    <span className="cx-actitem__main">
                      <span className="ta-cell-strong">{a.title}</span>
                      <span className="ta-cell-sub">{a.description}</span>
                    </span>
                    <span className="ta-cell-sub cx-actitem__when">{formatDate(a.at)} · {a.actor}</span>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>
    </div>
  );
}
