import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import Icon from '../components/common/Icon.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { ROLES, ROLE_META } from '../constants/roles.js';
import markWhite from '../assets/centrik-logo-white.png';
import markColor from '../assets/ccentrik-logo.png';

function homeForRole(role) {
  return ROLE_META[role]?.home || '/candidate';
}

// This app owns the recruitment journey only — onboarding and beyond live in
// the separate HR application (docs/requirements/02-two-application-architecture.md).
const JOURNEY = [
  { label: 'Applied', icon: 'FileText', desc: 'All in one place', c: '#60a5fa', c2: '#2563eb' },
  { label: 'Screening', icon: 'Eye', desc: 'Find the right fit', c: '#a78bfa', c2: '#7c3aed' },
  { label: 'Interview', icon: 'CalendarDays', desc: 'Coordinate with ease', c: '#f472b6', c2: '#db2777' },
  { label: 'Offer', icon: 'FileCheck', desc: 'Move forward fast', c: '#fbbf24', c2: '#f59e0b' },
];

export default function LoginPage() {
  const { configured, role, loading: authLoading, signInWithGoogle, signOut } = useAuth();
  const [error, setError] = useState('');
  const [signing, setSigning] = useState(false);

  if (configured && !authLoading && role) {
    // HR accounts belong to the separate HR application's own Supabase
    // project — one shouldn't exist here, but never loop-redirect if it does.
    if (role === ROLES.HR) {
      return (
        <div className="wsauth" style={{ placeItems: 'center', textAlign: 'center', padding: 24 }}>
          <div>
            <p>This account is an HR account. Please use the HR application instead.</p>
            <button type="button" className="wsauth__forgot" onClick={() => signOut()}>Sign out</button>
          </div>
        </div>
      );
    }
    return <Navigate to={homeForRole(role)} replace />;
  }

  const googleSignIn = async () => {
    if (!configured || signing) return;
    setError('');
    setSigning(true);
    const { error: oauthError } = await signInWithGoogle();
    if (oauthError) {
      setError(oauthError.message);
      setSigning(false);
    }
  };

  return (
    <div className="wsauth">
      <aside className="wsauth__aside">
        <span className="wsauth__blob wsauth__blob--1" aria-hidden="true" />
        <span className="wsauth__blob wsauth__blob--2" aria-hidden="true" />
        <span className="wsauth__blob wsauth__blob--3" aria-hidden="true" />

        <figure className="wsfloat wsfloat--in" aria-hidden="true">
          <span className="wsfloat__avatar"><Icon name="UserRound" size={17} /></span>
          <span className="wsfloat__body"><b>New Applicant</b><i /><i /></span>
        </figure>
        <figure className="wsfloat wsfloat--out" aria-hidden="true">
          <span className="wsfloat__avatar"><Icon name="FileCheck" size={17} /></span>
          <span className="wsfloat__body"><b>Offer sent!</b></span>
          <span className="wsfloat__check"><Icon name="Check" size={11} /></span>
        </figure>

        <img className="wsauth__logo wsauth__logo--lg" src={markWhite} alt="Ccentrik" />

        <div className="wsauth__pitch">
          <h1>From application<br /><span>to offer, effortlessly.</span></h1>
          <p>Apply, track and hire — one clear pipeline for candidates and recruiters.</p>
        </div>

        <span className="wsauth__tick" aria-hidden="true" />

        <ol className="wsjourney" aria-hidden="true">
          <span className="wsjourney__rail"><span className="wsjourney__pulse" /></span>
          {JOURNEY.map((s, i) => (
            <li className="wsjourney__step" key={s.label} style={{ '--i': i, '--c': s.c, '--c2': s.c2 }}>
              <span className="wsjourney__node"><Icon name={s.icon} size={19} /></span>
              <span className="wsjourney__label">{s.label}</span>
              <span className="wsjourney__desc">{s.desc}</span>
              {i < JOURNEY.length - 1 && (
                <span className="wsjourney__sep"><Icon name="ChevronRight" size={13} /></span>
              )}
            </li>
          ))}
        </ol>

        <p className="wsauth__tags" aria-hidden="true">Candidates<span>·</span>Talent Acquisition</p>
      </aside>

      <main className="wsauth__main">
        <div className="wsauth__panel">
          <img className="wsauth__logo wsauth__logo--sm" src={markColor} alt="Ccentrik" />
          <h2>Welcome</h2>
          <p className="wsauth__lede">
            Sign in to apply for a role, track your application, or manage the recruitment
            pipeline as Talent Acquisition.
          </p>

          {error && (
            <div className="wsauth__alert" role="alert">
              <Icon name="AlertCircle" size={15} /> {error}
            </div>
          )}
          {!configured && (
            <div className="wsauth__alert" role="alert">
              <Icon name="AlertCircle" size={15} /> Backend not configured yet — see .env.example.
            </div>
          )}

          <button type="button" className="wsauth__google" onClick={googleSignIn} disabled={!configured || signing || authLoading}>
            <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.76c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.15-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
              <path fill="#FBBC05" d="M5.85 14.1a6.6 6.6 0 0 1 0-4.22V7.04H2.18a11 11 0 0 0 0 9.9l3.67-2.84Z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.67 2.84C6.71 7.31 9.14 5.38 12 5.38Z" />
            </svg>
            {signing ? 'Signing in…' : 'Continue with Google'}
          </button>

          <p className="wsauth__foot">
            New here? Signing in with Google creates your candidate account automatically —
            no separate sign-up needed. Talent Acquisition access is granted by your administrator.
          </p>
        </div>
      </main>
    </div>
  );
}
