import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../common/Icon.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { ROLES, ROLE_META } from '../../constants/roles.js';

const OPTS = [
  { role: ROLES.CANDIDATE, icon: 'UserRound', color: 'var(--tf-indigo)' },
  { role: ROLES.TA, icon: 'Users', color: 'var(--tf-violet)' },
  { role: ROLES.HR, icon: 'UserRoundCheck', color: 'var(--tf-teal)' },
];

export default function RoleSwitcher({ compact }) {
  const { role, setRole } = useApp();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const current = ROLE_META[role];

  const pick = (r) => {
    setRole(r);
    setOpen(false);
    navigate(ROLE_META[r].home);
  };

  return (
    <div className="role-switch" onBlur={() => setTimeout(() => setOpen(false), 150)}>
      <button className="role-switch__btn" onClick={() => setOpen((o) => !o)} title="Switch role (demo)">
        <Icon name="RefreshCw" size={13} />
        {!compact && <span>{current?.label || 'Switch role'}</span>}
        <Icon name="ChevronDown" size={12} />
      </button>
      {open && (
        <div className="role-switch__panel">
          <div style={{ padding: '8px 14px', fontSize: 11, fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Demo role
          </div>
          {OPTS.map((o) => (
            <button
              key={o.role}
              className={`role-switch__item${role === o.role ? ' role-switch__item--active' : ''}`}
              style={{ '--rc': o.color }}
              onMouseDown={() => pick(o.role)}
            >
              <span className="role-switch__dot" />
              <Icon name={o.icon} size={15} />
              {ROLE_META[o.role].label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
