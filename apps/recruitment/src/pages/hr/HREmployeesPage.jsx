import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/common/Icon.jsx';
import TAHeader from '../../components/ta/TAHeader.jsx';
import StatBar from '../../components/ta/StatBar.jsx';
import DataGrid from '../../components/ta/DataGrid.jsx';
import Toolbar from '../../components/ta/Toolbar.jsx';
import Tag from '../../components/ta/Tag.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { useCollectionView } from '../../hooks/useCollectionView.js';
import { APP_STATUS } from '../../constants/statuses.js';
import { formatDate } from '../../utils/format.js';

const COLUMNS = [
  { key: 'name', label: 'Employee', sortable: true },
  { key: 'position', label: 'Position', sortable: true },
  { key: 'department', label: 'Department', sortable: true },
  { key: 'joiningDate', label: 'Joined', sortable: true },
  { key: 'actions', label: 'Actions' },
];

/* Give each department a stable colour so the table scans by team at a glance. */
const DEPT_TONES = ['blue', 'violet', 'teal', 'green', 'amber'];
function deptTone(name = '') {
  let h = 0;
  for (let i = 0; i < name.length; i += 1) h = (h * 31 + name.charCodeAt(i)) % 997;
  return DEPT_TONES[h % DEPT_TONES.length];
}

/* Days until a date (negative once it's in the past). */
function daysUntil(dateStr) {
  if (!dateStr) return null;
  return Math.round((new Date(dateStr) - Date.now()) / 86400000);
}

export default function HREmployeesPage() {
  const navigate = useNavigate();
  const { data, offerFor, getApplication } = useApp();

  const employees = data.employees || [];

  const joiningPending = useMemo(
    () => (data.applications || []).filter((a) => a.status === APP_STATUS.JOINING_PENDING),
    [data.applications]
  );

  const joinedThisMonth = useMemo(() => {
    const now = new Date();
    return employees.filter((e) => {
      const d = new Date(e.joiningDate);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  }, [employees]);

  const departmentCount = useMemo(
    () => new Set(employees.map((e) => e.department).filter(Boolean)).size,
    [employees]
  );

  const view = useCollectionView(employees, {
    searchFields: ['name', 'id', 'position'],
    pageSize: 30,
    initialSort: { key: 'joiningDate', dir: 'desc' },
  });

  const departments = useMemo(
    () => [...new Set(employees.map((e) => e.department).filter(Boolean))].sort(),
    [employees]
  );
  const positions = useMemo(
    () => [...new Set(employees.map((e) => e.position).filter(Boolean))].sort(),
    [employees]
  );

  const [dept, setDept] = useState('all');
  const [position, setPosition] = useState('all');
  const [period, setPeriod] = useState('all');
  const PERIOD_LABEL = { month: 'This month', q90: 'Last 90 days', year: 'This year' };

  const applyDept = (v) => { setDept(v); view.setFilter('department', v); };
  const applyPosition = (v) => { setPosition(v); view.setFilter('position', v); };
  const applyPeriod = (v) => {
    setPeriod(v);
    const now = Date.now();
    const preds = {
      month: (e) => { const d = new Date(e.joiningDate); const n = new Date(); return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear(); },
      q90: (e) => now - new Date(e.joiningDate) <= 90 * 86400000,
      year: (e) => new Date(e.joiningDate).getFullYear() === new Date().getFullYear(),
    };
    view.setFilter('joinedPeriod', v === 'all' ? 'all' : preds[v]);
  };

  const empChips = [
    dept !== 'all' && { key: 'dept', label: dept, onRemove: () => applyDept('all') },
    position !== 'all' && { key: 'position', label: position, onRemove: () => applyPosition('all') },
    period !== 'all' && { key: 'period', label: PERIOD_LABEL[period], onRemove: () => applyPeriod('all') },
  ].filter(Boolean);

  const kpis = [
    { icon: 'UserRoundCheck', accent: 'green', label: 'Onboarded', value: employees.length },
    { icon: 'CalendarClock', accent: 'amber', label: 'Joining soon', value: joiningPending.length },
    { icon: 'CalendarPlus', accent: 'blue', label: 'Joined this month', value: joinedThisMonth },
    { icon: 'Building2', accent: 'violet', label: 'Departments', value: departmentCount },
  ];

  return (
    <>
      <TAHeader
        title="Employees"
        subtitle={`${joiningPending.length} joining · ${employees.length} onboarded`}
      />

      <StatBar items={kpis} />

      {joiningPending.length > 0 && (
        <div className="hr-upnext">
          <span className="hr-upnext__label"><Icon name="Rocket" size={13} /> Joining soon</span>
          <div className="hr-upnext__list">
            {joiningPending.map((a) => {
              const d = daysUntil(offerFor(a.id)?.joiningDate);
              return (
                <button
                  key={a.id}
                  type="button"
                  className="hr-upnext__pill"
                  onClick={() => navigate(`/hr/candidates/${a.candidateId}`)}
                >
                  {a.personal.firstName} {a.personal.lastName}
                  {d != null && (
                    <span className={`hr-upnext__days${d <= 7 ? ' is-soon' : ''}`}>{d <= 0 ? 'now' : `${d}d`}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <Toolbar
        filters={[
          { label: 'Department', value: dept, onChange: applyDept, options: departments.map((d) => ({ value: d, label: d })) },
          { label: 'Position', value: position, onChange: applyPosition, options: positions.map((p) => ({ value: p, label: p })) },
          { label: 'Joined', value: period, onChange: applyPeriod, options: [
            { value: 'month', label: 'This month' },
            { value: 'q90', label: 'Last 90 days' },
            { value: 'year', label: 'This year' },
          ] },
        ]}
        chips={empChips}
        onClearAll={empChips.length > 1 ? () => { applyDept('all'); applyPosition('all'); applyPeriod('all'); } : undefined}
        pager={{ page: view.page, pageSize: view.pageSize, total: view.total, onPage: view.setPage }}
      />

      <DataGrid
        columns={COLUMNS}
        rows={view.rows}
        sort={view.sort}
        onSort={view.onSort}
        pager={{ page: view.page, pageSize: view.pageSize, total: view.total, onPage: view.setPage }}
        empty={{ icon: 'UserRoundCheck', title: 'No employees onboarded yet', message: 'Employees appear here once joining is marked complete.' }}
        renderRow={(e) => {
          const app = getApplication(e.applicationId);
          return (
            <tr
              key={e.id}
              onClick={() => app && navigate(`/hr/candidates/${app.candidateId}`)}
              style={{ cursor: app ? 'pointer' : 'default' }}
            >
              <td>
                <span className="ta-cell-cand__name">{e.name}</span><br />
                <span className="ta-cell-cand__sub">{e.id}</span>
              </td>
              <td className="ta-cell-strong">{e.position}</td>
              <td>{e.department ? <Tag tone={deptTone(e.department)}>{e.department}</Tag> : <span className="ta-cell-mute">—</span>}</td>
              <td className="ta-cell-mute">
                <span className="hr-joined"><Icon name="CalendarCheck" size={13} /> {formatDate(e.joiningDate)}</span>
              </td>
              <td>
                {app && (
                  <span className="ta-rowactions" onClick={(ev) => ev.stopPropagation()}>
                    <button className="ta-iconbtn" onClick={() => navigate(`/hr/candidates/${app.candidateId}`)} aria-label="Open profile">
                      <Icon name="ChevronRight" size={17} />
                    </button>
                  </span>
                )}
              </td>
            </tr>
          );
        }}
      />
    </>
  );
}
