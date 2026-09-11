import { useEffect, useState } from 'react';
import Icon from '../common/Icon.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { timeAgo } from '../../utils/format.js';
import {
  listNotifications,
  markAllRead,
  subscribeNotifications,
} from '../../api/notifications.js';
import { notificationFromDb } from '../../api/mappers.js';

export default function NotificationBell({ variant }) {
  const { configured } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!configured) return undefined;
    let active = true;
    const load = () =>
      listNotifications()
        .then((rows) => active && setItems((rows || []).map(notificationFromDb)))
        .catch(() => {});
    load();
    const unsub = subscribeNotifications(load);
    return () => {
      active = false;
      unsub();
    };
  }, [configured]);

  const unread = items.filter((n) => !n.read).length;
  const btnClass = variant === 'ta' ? 'ta-iconbtn' : 'icon-btn';
  const dotClass = variant === 'ta' ? 'ta-iconbtn__dot' : 'badge-count';

  const openAndRead = () => {
    setOpen((o) => !o);
    if (!open && unread) {
      markAllRead().then(() => setItems((rs) => rs.map((n) => ({ ...n, read: true }))));
    }
  };

  return (
    <div className="pos-rel">
      <button
        className={btnClass}
        aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
        onClick={openAndRead}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      >
        <Icon name="Bell" size={18} />
        {unread > 0 && <span className={dotClass}>{unread}</span>}
      </button>
      {open && (
        <div className="dropdown-panel">
          <div className="dropdown-panel__header">Notifications</div>
          {items.length === 0 && <div className="notif-item text-secondary">You're all caught up.</div>}
          {items.slice(0, 12).map((n) => (
            <div key={n.id} className={`notif-item${n.read ? '' : ' notif-item--unread'}`}>
              <div className="strong text-small">{n.title}</div>
              <div className="text-xs text-secondary">{n.body}</div>
              <div className="text-xs text-secondary mt-2">{timeAgo(n.at)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
