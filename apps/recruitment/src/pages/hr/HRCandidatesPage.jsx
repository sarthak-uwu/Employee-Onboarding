import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Icon from '../../components/common/Icon.jsx';
import TAHeader from '../../components/ta/TAHeader.jsx';
import StatBar from '../../components/ta/StatBar.jsx';
import DataGrid from '../../components/ta/DataGrid.jsx';
import Toolbar from '../../components/ta/Toolbar.jsx';
import Tag from '../../components/ta/Tag.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { useCollectionView } from '../../hooks/useCollectionView.js';
import { APP_STATUS, DOC_STATUS, HR_FUNNEL_STAGES, hrStageRank, hrStageBadge } from '../../constants/statuses.js';
import { formatDate } from '../../utils/format.js';

const COLUMNS = [
  { key: 'name', label: 'Candidate', sortable: true },
  { key: 'position', label: 'Position', sortable: true },
  { key: 'hrStatus', label: 'Onboarding Stage', sortable: true },
  { key: 'joiningDate', label: 'Joining', sortable: true },
  { key: 'actions', label: '' },
];

export default function HRCandidatesPage() {
  const navigate = useNavigate();
  const { data, offerFor, documentsFor } = useApp();
  const [sp] = useSearchParams();

  const rows = useMemo(
    () =>
      (data.applications || [])
        // HR only owns candidates once the offer is accepted (the TA → HR
        // handover). Everything up to "offer sent" stays with Talent Acquisition.
        .filter((a) => hrStageRank(a.status) >= 2)
        .map((a) => {
          const offer = offerFor(a.id);
          const docs = documentsFor(a.id);
          const verified = docs.filter((d) => d.status === DOC_STATUS.VERIFIED).length;
          const rejected = docs.filter((d) => d.status === DOC_STATUS.REJECTED).length;
          return {
            id: a.id,
            candidateId: a.candidateId,
            name: `${a.personal.firstName} ${a.personal.lastName}`,
            position: a.jobTitle,
            department: offer?.department || 'General',
            offerStatus: offer?.status || null,
            joiningDate: offer?.joiningDate || null,
            hrStatus: a.status,
            hrRank: hrStageRank(a.status),
            docsIssue: rejected > 0,
            docsState: rejected ? 'rejected' : (docs.length && verified === docs.length ? 'verified' : 'pending'),
            docs: rejected ? { tone: 'red', text: `${rejected} rejected` }
              : docs.length && verified === docs.length ? { tone: 'green', text: 'All verified' }
              : verified ? { tone: 'amber', text: `${verified}/${docs.length} verified` }
              : { tone: 'grey', text: '—' },
          };
        }),
    [data.applications, offerFor, documentsFor]
  );

  // Stage filter = "reached this stage or further" (cumulative), matching the
  // dashboard's onboarding funnel — a funnel band's count is exactly what its
  // click shows here. The "Onboarding Stage" column still shows where each
  // candidate currently is (which may be further along).
  const stageParam = HR_FUNNEL_STAGES.some((s) => s.key === sp.get('stage')) ? sp.get('stage') : 'all';
  const deptParam = sp.get('dept') || null; // set when arriving from the "Onboarding by Department" donut
  const [stage, setStageKey] = useState(stageParam);

  const initialFilters = {};
  if (stageParam !== 'all') initialFilters.hrRank = (r) => r.hrRank >= HR_FUNNEL_STAGES.find((s) => s.key === stageParam).rank;
  if (deptParam) initialFilters.department = deptParam;

  const view = useCollectionView(rows, {
    searchFields: ['name', 'candidateId'],
    pageSize: 30,
    initialSort: { key: 'name', dir: 'asc' },
    initialFilters: Object.keys(initialFilters).length ? initialFilters : {},
  });

  const deptOptions = useMemo(
    () => [...new Set(rows.map((r) => r.department).filter(Boolean))].sort().map((d) => ({ value: d, label: d })),
    [rows]
  );
  const activeDept = typeof view.filters.department === 'string' ? view.filters.department : 'all';
  const activeDocs = typeof view.filters.docsState === 'string' ? view.filters.docsState : 'all';

  const [joined, setJoinedKey] = useState('all');
  const setJoined = (key) => {
    setJoinedKey(key);
    view.setFilter('joiningDate', key === 'all' ? 'all' : key === 'set' ? (r) => !!r.joiningDate : (r) => !r.joiningDate);
  };

  const setStage = (key) => {
    setStageKey(key);
    const target = HR_FUNNEL_STAGES.find((s) => s.key === key);
    view.setFilter('hrRank', key === 'all' ? 'all' : (r) => r.hrRank >= target.rank);
  };

  const clearAll = () => {
    setStage('all');
    setJoined('all');
    view.setFilter('department', 'all');
    view.setFilter('docsState', 'all');
  };

  // Re-apply filters when already on the page and the dashboard link changes the URL params.
  const spKey = `${sp.get('stage') || ''}|${sp.get('dept') || ''}`;
  const firstSync = useRef(true);
  useEffect(() => {
    if (firstSync.current) { firstSync.current = false; return; }
    setStage(stageParam);
    view.setFilter('department', deptParam || 'all');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spKey]);

  // The filter dropdowns already show their active value, so no separate
  // chip row — just a "Clear filters" affordance when something is set.
  const hasFilters = stage !== 'all' || activeDept !== 'all' || activeDocs !== 'all' || joined !== 'all';

  const apps = data.applications || [];
  const kpis = [
    { icon: 'Users', accent: 'blue', label: 'At HR stage', value: rows.length, onClick: () => setStage('all') },
    { icon: 'Eye', accent: 'amber', label: 'Awaiting verification', value: apps.filter((a) => a.status === APP_STATUS.HR_VERIFICATION).length, onClick: () => setStage('verification') },
    { icon: 'CalendarClock', accent: 'violet', label: 'Joining scheduled', value: apps.filter((a) => a.status === APP_STATUS.JOINING_PENDING).length, onClick: () => setStage('joining') },
    { icon: 'UserRoundCheck', accent: 'green', label: 'Onboarded', value: apps.filter((a) => a.status === APP_STATUS.EMPLOYEE).length, onClick: () => setStage('onboarded') },
  ];

  return (
    <>
      <TAHeader title="Candidates" subtitle="Candidates who have reached the HR stage." />

      <StatBar items={kpis} />

      <Toolbar
        filters={[
          {
            label: 'Stage',
            value: stage,
            onChange: setStage,
            options: HR_FUNNEL_STAGES.map((s) => ({ value: s.key, label: s.label })),
          },
          { label: 'Department', value: activeDept, onChange: (v) => view.setFilter('department', v), options: deptOptions },
          {
            label: 'Documents',
            value: activeDocs,
            onChange: (v) => view.setFilter('docsState', v),
            options: [
              { value: 'verified', label: 'All verified' },
              { value: 'rejected', label: 'Has rejection' },
              { value: 'pending', label: 'Pending' },
            ],
          },
          {
            label: 'Joining date',
            value: joined,
            onChange: setJoined,
            options: [
              { value: 'set', label: 'Date set' },
              { value: 'unset', label: 'Not set' },
            ],
          },
        ]}
        onClearAll={hasFilters ? clearAll : undefined}
        pager={{ page: view.page, pageSize: view.pageSize, total: view.total, onPage: view.setPage }}
      />

      <DataGrid
        columns={COLUMNS}
        rows={view.rows}
        sort={view.sort}
        onSort={view.onSort}
        pager={{ page: view.page, pageSize: view.pageSize, total: view.total, onPage: view.setPage }}
        empty={{ icon: 'Users', title: 'No candidates at the HR stage yet', message: 'Candidates appear here once their documents are verified.' }}
        renderRow={(r) => {
          const hrBadge = hrStageBadge(r.hrStatus);
          return (
            <tr key={r.id} onClick={() => navigate(`/hr/candidates/${r.candidateId}`)} style={{ cursor: 'pointer' }}>
              <td>
                <span className="ta-cell-cand__name">{r.name}</span><br />
                <span className="ta-cell-cand__sub">{r.candidateId}</span>
              </td>
              <td>
                <span className="ta-cell-strong">{r.position}</span><br />
                <span className="ta-cell-sub">{r.department}</span>
              </td>
              <td>
                <Tag tone={hrBadge.tone}>{hrBadge.label}</Tag>
                {r.docsIssue && (
                  <div className="ta-cell-sub" style={{ marginTop: 2, color: 'var(--tag-red-fg)' }}>Document rejected</div>
                )}
              </td>
              <td className="ta-cell-mute">
                {r.joiningDate
                  ? <span className="hr-joined"><Icon name="CalendarCheck" size={13} /> {formatDate(r.joiningDate)}</span>
                  : 'Not set'}
              </td>
              <td>
                <span className="ta-rowactions" onClick={(e) => e.stopPropagation()}>
                  <button className="ta-iconbtn" onClick={() => navigate(`/hr/candidates/${r.candidateId}`)} aria-label="Open candidate">
                    <Icon name="ChevronRight" size={17} />
                  </button>
                </span>
              </td>
            </tr>
          );
        }}
      />
    </>
  );
}
