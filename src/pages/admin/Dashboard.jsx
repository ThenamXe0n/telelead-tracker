import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Filter, Search, Target, Clock3, UserCheck, RefreshCcw, CheckCircle2, XCircle, ListChecks } from 'lucide-react';
import statsApi from '../../api/stats';
import StatsTile from '../../components/ui/Dashboard';


export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    Promise.all([
      statsApi.overview().then((res) => res.data.stats).catch(() => null),
      statsApi.leads({ page: 1, limit: 15 }).then((res) => res.data.leads || []).catch(() => []),
    ])
      .then(([s, l]) => {
        setStats(s);
        setLeads(l);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!stats) return <p>Failed to load stats.</p>;

  const statCard = 'bg-surface border border-border rounded-xl p-5 min-w-[140px]';
  const tableTh = 'text-left py-3 px-2.5 border-b-2 border-border font-semibold text-xs text-slate-600';
  const tableTd = 'py-2.5 px-2.5 border-b border-border text-sm';
  const statusBadge = (status) => {
    if (status === 'converted') return 'px-2 py-0.5 rounded-md text-xs bg-green-500/15 text-green-600';
    if (status === 'dropped') return 'px-2 py-0.5 rounded-md text-xs bg-red-500/10 text-red-500';
    return 'px-2 py-0.5 rounded-md text-xs bg-surface text-slate-900';
  };

  const filteredLeads = leads.filter((l) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch = !term
      || l.phone?.toString().toLowerCase().includes(term)
      || l.name?.toLowerCase().includes(term)
      || l.sheetId?.name?.toLowerCase().includes(term)
      || l.assignedTo?.name?.toLowerCase().includes(term);

    const matchesStatus = !statusFilter || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const uniqueStatuses = Array.from(new Set(leads.map((l) => l.status))).filter(Boolean);

  return (
    <div>
      <h1 className="mb-6">Dashboard</h1>
      <div className="flex flex-wrap gap-4 mb-8">
        {[
          { key: 'total', label: 'Total', icon: Target, value: stats.total, variant: 'default' },
          { key: 'pending', label: 'Pending', icon: Clock3, value: stats.pending, variant: 'primary' },
          { key: 'assigned', label: 'Assigned', icon: UserCheck, value: stats.assigned, variant: 'default' },
          { key: 'followUp', label: 'Follow-up', icon: RefreshCcw, value: stats.followUp, variant: 'default' },
          { key: 'converted', label: 'Converted', icon: CheckCircle2, value: stats.converted, variant: 'default' },
          { key: 'dropped', label: 'Dropped', icon: XCircle, value: stats.dropped, variant: 'default' },
        ].map((tile) => (
          <StatsTile
            key={tile.key}
            icon={tile.icon}
            label={tile.label}
            value={tile.value}
            variant={tile.variant}
          />
        ))}
      </div>

      <div className={`${statCard} p-0 overflow-hidden`}>
        <div className="py-4 px-5 border-b border-border flex justify-between items-center">
          <h2 className="m-0 text-lg flex items-center gap-2">
            <ListChecks size={18} className="text-primary" />
            <span>Recent leads</span>
          </h2>
          <Link to="/admin/leads" className="text-sm text-primary font-medium">View all →</Link>
        </div>
        <div className="px-5 pt-3 pb-3 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted uppercase tracking-wide">
            <Filter size={14} />
            <span>Filters</span>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search phone, name, sheet, telecaller..."
                className="pl-8 pr-3 py-1.5 rounded-md border border-border bg-white text-sm min-w-[220px]"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-1.5 px-2.5 rounded-md border border-border bg-white text-sm"
            >
              <option value="">All statuses</option>
              {uniqueStatuses.map((status) => (
                <option key={status} value={status}>
                  {status.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={tableTh}>Phone</th>
                <th className={tableTh}>Name</th>
                <th className={tableTh}>Sheet</th>
                <th className={tableTh}>Assigned to</th>
                <th className={tableTh}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((l) => (
                <tr key={l._id}>
                  <td className={tableTd}>{l.phone}</td>
                  <td className={tableTd}>{l.name || '—'}</td>
                  <td className={tableTd}>{l.sheetId?.name || '—'}</td>
                  <td className={tableTd}>{l.assignedTo ? l.assignedTo.name : <span className="text-muted">Unassigned</span>}</td>
                  <td className={tableTd}>
                    <span className={statusBadge(l.status)}>{l.status.replace('_', '-')}</span>
                  </td>
                </tr>
              ))}
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={5} className={`${tableTd} text-muted text-center`}>No leads yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
