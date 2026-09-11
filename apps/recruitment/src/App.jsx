import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes.jsx';
import ToastContainer from './components/common/ToastContainer.jsx';
import { useApp } from './context/AppContext.jsx';
import { ROLES } from './constants/roles.js';

/** Offline-demo helper: /any?as=ta|candidate sets the role and strips the param.
    No-op once a real backend is configured — role then comes from Google auth. */
function RoleFromQuery() {
  const { role, setRole } = useApp();
  const [sp, setSp] = useSearchParams();
  useEffect(() => {
    const as = sp.get('as');
    if (as && [ROLES.CANDIDATE, ROLES.TA].includes(as)) {
      if (role !== as) setRole(as);
      sp.delete('as');
      setSp(sp, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp]);
  return null;
}

export default function App() {
  return (
    <>
      <RoleFromQuery />
      <AppRoutes />
      <ToastContainer />
    </>
  );
}
