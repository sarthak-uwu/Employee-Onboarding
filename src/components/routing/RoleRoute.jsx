import { Navigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';

export default function RoleRoute({ allow, children }) {
  const { role, authConfigured, authLoading } = useApp();

  // Wait for the real session + profile before deciding anything.
  if (authConfigured && authLoading) {
    return <div className="route-loading" style={{ padding: 48, textAlign: 'center', color: '#8a93a3' }}>Loading…</div>;
  }

  if (!role) return <Navigate to="/" replace />;
  if (allow && role !== allow) {
    const home = role === 'ta' ? '/ta' : role === 'hr' ? '/hr' : '/candidate';
    return <Navigate to={home} replace />;
  }
  return children;
}
