import { useState, useEffect } from 'react';
import telecallerApi from '../../api/telecaller';
import CallList from './CallList';
import CloseCallForm from './CloseCallForm';

export default function Dashboard() {
  const [tab, setTab] = useState('assigned');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [closingId, setClosingId] = useState(null);
  const [counts, setCounts] = useState({ assigned: 0, followUp: 0, converted: 0 });

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
