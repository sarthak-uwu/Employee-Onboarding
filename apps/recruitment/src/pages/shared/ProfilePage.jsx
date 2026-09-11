import { Card, InfoList } from '../../components/common/Card.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { ROLE_META } from '../../constants/roles.js';

export default function ProfilePage({ role }) {
  const { profile } = useApp();
  const meta = ROLE_META[role];
  const name = profile?.full_name || profile?.email || 'Account';
  const initials = name
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0].toUpperCase())
    .join('');

  return (
    <div className="page-body" style={{ maxWidth: 640 }}>
      <h1 className="page-title mb-4">Profile</h1>
      <Card>
        <div className="row gap-4 mb-4">
          <span className="avatar" style={{ width: 56, height: 56, fontSize: 18 }}>
            {initials}
          </span>
          <div>
            <div className="section-title">{name}</div>
            <div className="text-secondary text-small">{meta.label}</div>
          </div>
        </div>
        <InfoList
          items={[
            { label: 'Email', value: profile?.email },
            { label: 'Role', value: meta.label },
            { label: 'Responsibilities', value: meta.description },
          ]}
        />
      </Card>
    </div>
  );
}
