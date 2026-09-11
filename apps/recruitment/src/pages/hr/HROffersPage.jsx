import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Icon from '../../components/common/Icon.jsx';
import TAHeader from '../../components/ta/TAHeader.jsx';
import DataGrid from '../../components/ta/DataGrid.jsx';
import Toolbar from '../../components/ta/Toolbar.jsx';
import Avatar from '../../components/ta/Avatar.jsx';
import Tag from '../../components/ta/Tag.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { useCollectionView } from '../../hooks/useCollectionView.js';
import { OFFER_STATUS_META } from '../../constants/statuses.js';
import { formatDate, formatCurrencyINR } from '../../utils/format.js';

// The old offer-status tones don't match Tag's tone names — map them once.
const OFFER_TONE = { neutral: 'grey', warning: 'amber', info: 'blue', success: 'green', error: 'red' };

const COLUMNS = [
  { key: 'candidate', label: 'Candidate', sortable: true },
  { key: 'job', label: 'Position', sortable: true },
  { key: 'joiningDate', label: 'Joining Date', sortable: true },
  { key: 'compensation', label: 'Compensation', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'actions', label: 'Actions' },
];

export default function HROffersPage() {
  const navigate = useNavigate();
  const { data, getApplication } = useApp();
  const [sp] = useSearchParams();

  const rows = useMemo(
    () =>
      (data.offers || [])
        .map((o) => {
          const app = getApplication(o.applicationId);
          if (!app) return null;
          return { ...o, candidate: o.candidateName, candidateId: app.candidateId, job: o.jobTitle };
        })
        .filter(Boolean),
    [data.offers, getApplication]
  );

  const statusParam = OFFER_STATUS_META[sp.get('status')] ? sp.get('status') : 'all';
  const view = useCollectionView(rows, {
    searchFields: ['candidate', 'job'],
    pageSize: 12,
    initialSort: { key: 'candidate', dir: 'asc' },
    initialFilters: statusParam !== 'all' ? { status: statusParam } : undefined,
  });

  const activeStatus = typeof view.filters.status === 'string' ? view.filters.status : 'all';

  const clearAll = () => {
    view.setQuery('');
    view.setFilter('status', 'all');
  };

  const chips = [
    activeStatus !== 'all' && { key: 'status', label: OFFER_STATUS_META[activeStatus].label, onRemove: () => view.setFilter('status', 'all') },
    view.query && { key: 'q', label: `“${view.query}”`, onRemove: () => view.setQuery('') },
  ].filter(Boolean);

  return (
    <>
      <TAHeader title="Offers" subtitle="Every offer prepared by Talent Acquisition, at any stage." />

      <Toolbar
        search={{ value: view.query, onChange: view.setQuery, placeholder: 'Search candidate or position…' }}
        filters={[
          {
            label: 'Status',
            value: activeStatus,
            onChange: (v) => view.setFilter('status', v),
            options: Object.entries(OFFER_STATUS_META).map(([value, m]) => ({ value, label: m.label })),
          },
        ]}
        chips={chips}
        onClearAll={chips.length > 1 ? clearAll : undefined}
      />

      <DataGrid
        columns={COLUMNS}
        rows={view.rows}
        sort={view.sort}
        onSort={view.onSort}
        pager={{ page: view.page, pageSize: view.pageSize, total: view.total, onPage: view.setPage }}
        empty={{ icon: 'FileCheck', title: 'No offers found', message: 'Try changing the filters or search.' }}
        renderRow={(r) => {
          const meta = OFFER_STATUS_META[r.status];
          return (
            <tr key={r.id} onClick={() => navigate(`/hr/candidates/${r.candidateId}`)} style={{ cursor: 'pointer' }}>
              <td>
                <span className="ta-cell-cand">
                  <Avatar name={r.candidate} />
                  <span className="ta-cell-cand__name">{r.candidate}</span>
                </span>
              </td>
              <td className="ta-cell-strong">{r.job}</td>
              <td className="ta-cell-mute">{formatDate(r.joiningDate)}</td>
              <td className="ta-cell-mute">{formatCurrencyINR(r.compensation)}</td>
              <td><Tag tone={OFFER_TONE[meta.tone] || 'grey'}>{meta.label}</Tag></td>
              <td>
                <span className="ta-rowactions" onClick={(e) => e.stopPropagation()}>
                  <button className="ta-iconbtn" onClick={() => navigate(`/hr/candidates/${r.candidateId}`)} aria-label="Open offer">
                    <Icon name="ArrowRight" size={15} />
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
