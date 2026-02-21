import { useState, useEffect } from 'react';
import attendanceApi from '../../api/attendance';
import usersApi from '../../api/users';
import { CalendarCheck, Filter, User, Clock } from 'lucide-react';

const cardClass = 'bg-white border border-border rounded-xl p-4 shadow-sm';
const thClass = 'text-left py-3 px-2.5 border-b-2 border-border font-semibold text-[13px] text-slate-600';
const tdClass = 'py-2.5 px-2.5 border-b border-border text-sm';

const statusClass = (status) => {
  if (status === 'present') return 'px-2 py-0.5 rounded-md text-xs bg-green-500/15 text-green-600';
  if (status === 'absent') return 'px-2 py-0.5 rounded-md text-xs bg-red-500/10 text-red-500';
  if (status === 'half-day') return 'px-2 py-0.5 rounded-md text-xs bg-amber-500/15 text-amber-600';
  if (status === 'leave') return 'px-2 py-0.5 rounded-md text-xs bg-slate-500/15 text-slate-600';
  return 'px-2 py-0.5 rounded-md text-xs bg-surface text-slate-900';
};

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString();
}

function formatTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function Attendance() {
  const [list, setList] = useState([]);
  const [telecallers, setTelecallers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [telecallerFilter, setTelecallerFilter] = useState('');
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));

  const loadTelecallers = () =>
    usersApi.list('telecaller').then((res) => setTelecallers(res.data.users || [])).catch(() => setTelecallers([]));

  const loadAttendance = () => {
    setLoading(true);
    const params = { from, to };
    if (telecallerFilter) params.userId = telecallerFilter;
    attendanceApi
      .list(params)
      .then((res) => setList(res.data.attendance || []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTelecallers();
  }, []);

  useEffect(() => {
    loadAttendance();
  }, [from, to, telecallerFilter]);

  return (
    <div>
      <h1 className="mb-6 flex items-center gap-2">
        <CalendarCheck size={24} className="text-primary" />
        Attendance
      </h1>

      <section className={cardClass}>
        <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-xs text-muted uppercase tracking-wide">
            <Filter size={14} />
            <span>Filters</span>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <label className="flex items-center gap-2 text-sm">
              <span>From</span>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="py-1.5 px-2.5 rounded-md border border-border bg-white text-sm"
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <span>To</span>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="py-1.5 px-2.5 rounded-md border border-border bg-white text-sm"
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <User size={14} />
              <select
                value={telecallerFilter}
                onChange={(e) => setTelecallerFilter(e.target.value)}
                className="py-1.5 px-2.5 rounded-md border border-border bg-white text-sm min-w-[160px]"
              >
                <option value="">All telecallers</option>
                {telecallers.map((t) => (
                  <option key={t._id} value={t._id}>{t.name}</option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={loadAttendance}
              className="py-1.5 px-3 rounded-md border border-border bg-white text-sm hover:bg-surface"
            >
              Apply
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={thClass}>Date</th>
                <th className={thClass}>Telecaller</th>
                <th className={thClass}>
                  <span className="flex items-center gap-1"><Clock size={14} /> Check-in</span>
                </th>
                <th className={thClass}>
                  <span className="flex items-center gap-1"><Clock size={14} /> Check-out</span>
                </th>
                <th className={thClass}>Status</th>
                <th className={thClass}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {list.map((a) => (
                <tr key={a._id}>
                  <td className={tdClass}>{formatDate(a.date)}</td>
                  <td className={tdClass}>
                    {a.userId ? (a.userId.name || a.userId.email || '—') : '—'}
                  </td>
                  <td className={tdClass}>{formatTime(a.checkIn)}</td>
                  <td className={tdClass}>{formatTime(a.checkOut)}</td>
                  <td className={tdClass}>
                    <span className={statusClass(a.status)}>{a.status || 'present'}</span>
                  </td>
                  <td className={tdClass}>{a.notes || '—'}</td>
                </tr>
              ))}
              {list.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className={`${tdClass} text-muted text-center`}>
                    No attendance records in this range.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {loading && <p className="text-muted text-sm mt-3">Loading...</p>}
      </section>
    </div>
  );
}
