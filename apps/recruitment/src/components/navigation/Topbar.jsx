import Icon from '../common/Icon.jsx';
import GlobalSearch from './GlobalSearch.jsx';
import NotificationBell from './NotificationBell.jsx';
import RoleSwitcher from './RoleSwitcher.jsx';
import { DEMO_USERS } from '../../constants/roles.js';

export default function Topbar({ role, base, greeting, onToggleSidebar }) {
  const user = DEMO_USERS[role];

  return (
    <header className="topbar">
      <div className="row gap-3">
        <button className="icon-btn sidebar-toggle" onClick={onToggleSidebar} aria-label="Toggle navigation">
          <Icon name="Menu" size={18} />
        </button>
        <div className="topbar__greeting">
          {greeting}
          <strong>{user?.name}</strong>
        </div>
      </div>
      <div className="topbar__actions">
        <GlobalSearch base={base} />
        <NotificationBell role={role} />
        <RoleSwitcher compact />
        <span className="avatar" title={user?.name}>
          {user?.initials}
        </span>
      </div>
    </header>
  );
}
