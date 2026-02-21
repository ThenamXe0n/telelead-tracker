import { useState, useEffect } from 'react';
import telecallerApi from '../../api/telecaller';
import attendanceApi from '../../api/attendance';
import CallList from './CallList';
import CloseCallForm from './CloseCallForm';
import { LogIn, LogOut, Clock } from 'lucide-react';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function Dashboard() {
  const [tab, setTab] = useState('assigned');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [closingId, setClosingId] = useState(null);
  const [counts, setCounts] = useState({ assigned: 0, followUp: 0, converted: 0 });
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [punchLoading, setPunchLoading] = useState(false);

  const loadTodayAttendance = () => {
    attendanceApi.list({ from: todayISO(), to: todayISO() })
      .then((res) => {
        const arr = res.data.attendance || [];
        setTodayAttendance(arr[0] || null);
      })
      .catch(() => setTodayAttendance(null));
  };

  const handlePunch = (action) => {
    setPunchLoading(true);
    attendanceApi.punch(action)
      .then(() => loadTodayAttendance())
      .catch(() => {})
      .finally(() => setPunchLoading(false));
  };

  const formatTime = (d) => (d ? new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—');

  const fetchCounts = () => {
    telecallerApi.counts()
      .then((res) => setCounts(res.data.counts || { assigned: 0, followUp: 0, converted: 0 }))
      .catch(() => setCounts({ assigned: 0, followUp: 0, converted: 0 }));
  };

  const fetchList = () => {
    setLoading(true);
    const api = tab === 'assigned' || tab === 'pending' ? telecallerApi.assigned
      : tab === 'follow-up' ? telecallerApi.followUp
      : telecallerApi.converted;
    api()
      .then((res) => setList(res.data.list || []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCounts();
    loadTodayAttendance();
  }, []);

  useEffect(() => {
    fetchList();
  }, [tab]);

  const onCallClosed = () => {
    setClosingId(null);
    fetchCounts();
    fetchList();
  };

  const tabs = [
    { key: 'assigned', label: 'Assigned', countKey: 'assigned', sublabel: 'remaining' },
    { key: 'follow-up', label: 'Follow-up', countKey: 'followUp', sublabel: '' },
    { key: 'converted', label: 'Converted', countKey: 'converted', sublabel: '' },
  ];

  const tabClass = (active) =>
    `py-3 px-4 border-0 rounded-[10px] cursor-pointer text-sm min-w-[100px] flex flex-col items-center gap-1 ${
      active ? 'bg-primary text-white font-semibold shadow-md' : 'bg-surface text-slate-900 font-normal'
    }`;

  return (
    <div className="p-4">
      <div className="mb-5 p-3 bg-surface border border-border rounded-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted">
          <Clock size={16} />
          <span>Today&apos;s attendance</span>
          {todayAttendance && (
            <span className="text-slate-700">
              In: {formatTime(todayAttendance.checkIn)} · Out: {formatTime(todayAttendance.checkOut)}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={punchLoading || !!todayAttendance?.checkIn}
            onClick={() => handlePunch('checkIn')}
            className="flex items-center gap-1.5 py-2 px-3.5 bg-green-600 text-white border-0 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogIn size={16} />
            Punch In
          </button>
          <button
            type="button"
            disabled={punchLoading || !todayAttendance?.checkIn || !!todayAttendance?.checkOut}
            onClick={() => handlePunch('checkOut')}
            className="flex items-center gap-1.5 py-2 px-3.5 bg-slate-600 text-white border-0 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut size={16} />
            Punch Out
          </button>
        </div>
      </div>
      <div className="flex gap-2.5 mb-5 flex-wrap">
        {tabs.map((t) => (
          <button key={t.key} type="button" className={tabClass(tab === t.key)} onClick={() => setTab(t.key)}>
            <span className="text-[22px] font-bold leading-none">{counts[t.countKey] ?? 0}</span>
            <span>{t.label}</span>
            {t.sublabel && <span className="text-[11px] opacity-90">{t.sublabel}</span>}
          </button>
        ))}
      </div>
      {loading ? (
        <p className="text-muted">Loading...</p>
      ) : (
        <CallList list={list} tab={tab} onOpenCloseForm={(id) => setClosingId(id)} onRefresh={fetchList} />
      )}
      {closingId && (
        <CloseCallForm callingNumberId={closingId} onClose={onCallClosed} onCancel={() => setClosingId(null)} />
      )}
    </div>
  );
}
