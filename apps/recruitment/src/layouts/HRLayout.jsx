import { useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import HRSidebar from '../components/navigation/HRSidebar.jsx';
import HRTopbar from '../components/navigation/HRTopbar.jsx';
import Icon from '../components/common/Icon.jsx';
import { useApp } from '../context/AppContext.jsx';
import { APP_STATUS } from '../constants/statuses.js';

const BOTTOM_NAV = [
  { to: '/hr', label: 'Dashboard', icon: 'Home', end: true },
  { to: '/hr/candidates', label: 'Candidates', icon: 'Users' },
  { to: '/hr/employees', label: 'Employees', icon: 'UserRoundCheck' },
];

const COLLAPSE_KEY = 'talentflow.hr.sidebar.collapsed';

function readCollapsed() {
  try { return localStorage.getItem(COLLAPSE_KEY) === '1'; } catch { return false; }
}

export default function HRLayout() {
  const [open, setOpen] = useState(false); // mobile drawer
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [head, setHead] = useState(null);
  const { pathname } = useLocation();
  const { data } = useApp();

  const ctx = useMemo(() => ({ setHead }), []);

  // Small nav badges: candidates waiting on HR's onboarding verification, and
  // candidates waiting to join.
  const navCounts = useMemo(() => {
    const apps = data.applications || [];
    return {
      verification: apps.filter((a) => a.status === APP_STATUS.HR_VERIFICATION).length,
      joining: apps.filter((a) => a.status === APP_STATUS.JOINING_PENDING).length,
    };
  }, [data]);

  // Offers live inside the Candidates area now (offer-status column + filter);
  // the full activity log has its own page.
  const navItems = [
    { to: '/hr', label: 'Dashboard', icon: 'LayoutDashboard', end: true },
    { to: '/hr/candidates', label: 'Candidates', icon: 'Users', count: navCounts.verification },
    { to: '/hr/employees', label: 'Employees', icon: 'UserRoundCheck', count: navCounts.joining },
    { to: '/hr/activity', label: 'Activity', icon: 'History' },
  ];

  const toggleCollapse = () => {
    setCollapsed((c) => {
      const next = !c;
      try { localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0'); } catch { /* ignore */ }
      return next;
    });
  };

  return (
    <div className={`ta-shell${collapsed ? ' ta-shell--collapsed' : ''}`}>
      <HRSidebar
        open={open}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
        onNavigate={() => setOpen(false)}
        navItems={navItems}
      />
      {open && <div className="overlay" style={{ zIndex: 39 }} onClick={() => setOpen(false)} />}

      <div className="ta-main">
        <HRTopbar head={head} onMenu={() => setOpen(true)} />
        <div className="ta-page" key={pathname}>
          <Outlet context={ctx} />
        </div>
      </div>

      <nav className="ta-bottomnav">
        {BOTTOM_NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `ta-bottomnav__link${isActive ? ' active' : ''}`}
          >
            <Icon name={item.icon} size={19} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
