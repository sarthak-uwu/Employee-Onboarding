import { NavLink } from 'react-router-dom';
import Icon from '../common/Icon.jsx';
import logo from '../../assets/ccentrik-logo.png';

export default function Sidebar({ title, badge, items, footerItems, open, onNavigate }) {
  return (
    <aside className={`sidebar${open ? ' sidebar--open' : ''}`}>
      <div className="sidebar__brand">
        <span className="brand-chip"><img src={logo} alt="Ccentrik" /></span>
      </div>
      <div className="sidebar__section-label">{title}</div>
      <nav className="sidebar__nav">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.end}
            className={({ isActive }) => `sidebar__link${isActive ? ' active' : ''}`}
            onClick={onNavigate}
          >
            <Icon name={it.icon} size={18} />
            <span className="grow">{it.label}</span>
            {it.count != null && it.count > 0 && <span className="badge badge--neutral">{it.count}</span>}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar__footer">
        {footerItems.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            className={({ isActive }) => `sidebar__link${isActive ? ' active' : ''}`}
            onClick={onNavigate}
          >
            <Icon name={it.icon} size={18} />
            {it.label}
          </NavLink>
        ))}
      </div>
    </aside>
  );
}
