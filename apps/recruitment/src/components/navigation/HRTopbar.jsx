import Icon from '../common/Icon.jsx';
import GlobalSearch from './GlobalSearch.jsx';
import NotificationBell from './NotificationBell.jsx';
import ProfileMenu from './ProfileMenu.jsx';
import { ROLES } from '../../constants/roles.js';

/* Same single-header-band pattern as TATopbar: page title comes from <TAHeader>,
   tools (search / notifications / avatar) live on the right. */
export default function HRTopbar({ head, onMenu }) {
  return (
    <header className="ta-topbar">
      <button className="ta-iconbtn ta-menubtn" onClick={onMenu} aria-label="Open navigation">
        <Icon name="Menu" size={18} />
      </button>

      <div className="ta-topbar__head">
        {head?.backTo && (
          <button className="ta-topbar__back" onClick={head.onBack}>
            <Icon name="ArrowLeft" size={13} /> {head.backLabel || 'Back'}
          </button>
        )}
        {head?.title && <h1 className="ta-topbar__title">{head.title}</h1>}
        {head?.subtitle && <p className="ta-topbar__sub">{head.subtitle}</p>}
      </div>

      <GlobalSearch base="/hr" variant="ta" />
      <NotificationBell role={ROLES.HR} variant="ta" />
      <ProfileMenu role={ROLES.HR} links={[{ label: 'Profile & settings', icon: 'Settings', to: '/hr/settings' }]} />
    </header>
  );
}
