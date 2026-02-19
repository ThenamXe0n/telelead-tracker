import { useState, useEffect } from 'react';
import statsApi from '../../api/stats';

const TAB_KEYS = { telecallers: 'telecallers', leads: 'leads', monthly: 'monthly' };

const cardClass = 'bg-white border border-border rounded-xl p-4 shadow-sm';
const thClass = 'text-left py-3 px-2.5 border-b-2 border-border font-semibold text-[13px] text-slate-600';
const tdClass = 'py-2.5 px-2.5 border-b border-border text-sm';
const tabClass = (active) => `py-2.5 px-4 border-b-2 bg-transparent text-sm cursor-pointer ${active ? 'border-primary text-primary font-semibold' : 'border-transparent text-muted font-medium'}`;
const statusBadge = (status) => {
  if (status === 'converted') return 'px-2 py-0.5 rounded-md text-xs bg-green-500/15 text-green-600';
  if (status === 'dropped') return 'px-2 py-0.5 rounded-md text-xs bg-red-500/10 text-red-500';
  return 'px-2 py-0.5 rounded-md text-xs bg-surface text-slate-900';
};

export default function LeadTracking() {
  const [activeTab, setActiveTab] = useState(TAB_KEYS.telecallers);
  const [telecallers, setTelecallers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [monthly, setMonthly] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leadPage, setLeadPage] = useState(1);
  const [telecallerFilter, setTelecallerFilter] = useState('');
  const [detailId, setDetailId] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const limit = 20;

  const loadTelecallerStats = () =>
    statsApi.telecallerStats().then((res) => setTelecallers(res.data.telecallers || []));

  const loadLeads = () =>
    statsApi
      .leads({ page: leadPage, limit, telecallerId: telecallerFilter || undefined })
      .then((res) => {
        setLeads(res.data.leads || []);
        setTotalLeads(res.data.total || 0);
      });

  const loadMonthly = () =>
    statsApi.monthlyConversions().then((res) => setMonthly(res.data.monthly || []));

  useEffect(() => {
    setLoading(true);
    Promise.all([loadTelecallerStats(), loadLeads(), loadMonthly()])
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadLeads();
  }, [leadPage, telecallerFilter]);

  const totalPages = Math.ceil(totalLeads / limit) || 1;

  const openLeadDetail = (callingNumberId) => {
    setDetailId(callingNumberId);
    setDetailData(null);
    setDetailLoading(true);
    statsApi
      .leadRecords(callingNumberId)
      .then((res) => setDetailData({ lead: res.data.lead, records: res.data.records || [] }))
      .catch(() => setDetailData(null))
      .finally(() => setDetailLoading(false));
  };

  const closeLeadDetail = () => {
    setDetailId(null);
    setDetailData(null);
  };

  if (loading && telecallers.length === 0) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="mb-6">Lead tracking</h1>

      <div className="flex gap-1 mb-5 border-b border-border">
        <button type="button" className={tabClass(activeTab === TAB_KEYS.telecallers)} onClick={() => setActiveTab(TAB_KEYS.telecallers)}>
          Leads by telecaller
        </button>
        <button type="button" className={tabClass(activeTab === TAB_KEYS.leads)} onClick={() => setActiveTab(TAB_KEYS.leads)}>
          Leads & assignment
        </button>
        <button type="button" className={tabClass(activeTab === TAB_KEYS.monthly)} onClick={() => setActiveTab(TAB_KEYS.monthly)}>
          Monthly leads
        </button>
      </div>

      {activeTab === TAB_KEYS.telecallers && (
      <section className={cardClass}>
        <h2 className="m-0 mb-4 text-lg">Leads by telecaller</h2>
        <p className="text-muted text-sm mb-4">
          Pending (assigned + follow-up), converted, and dropped counts for each telecaller. Converted = closed as converted by that telecaller.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={thClass}>Telecaller</th>
                <th className={thClass}>Assigned</th>
                <th className={thClass}>Follow-up</th>
                <th className={thClass}>Converted</th>
                <th className={thClass}>Dropped</th>
                <th className={thClass}>Total</th>
              </tr>
            </thead>
            <tbody>
              {telecallers.map((t) => (
                <tr key={t._id}>
                  <td className={tdClass}>
                    <strong>{t.name}</strong>
                    {t.email && <div className="text-xs text-muted">{t.email}</div>}
                  </td>
                  <td className={tdClass}>{t.assigned}</td>
                  <td className={tdClass}>{t.followUp}</td>
                  <td className={`${tdClass} text-green-600`}>{t.converted}</td>
                  <td className={tdClass}>{t.dropped}</td>
                  <td className={`${tdClass} font-semibold`}>{t.total}</td>
                </tr>
              ))}
              {telecallers.length === 0 && (
                <tr>
                  <td colSpan={6} className={`${tdClass} text-muted text-center`}>No telecallers</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      )}

      {activeTab === TAB_KEYS.leads && (
      <section className={cardClass}>
        <h2 className="m-0 mb-4 text-lg">Leads & assignment</h2>
        <p className="text-muted text-sm mb-4">
          Who each lead is assigned to. Converted leads show the telecaller who closed them.
        </p>
        <div className="mb-3 flex items-center gap-2 flex-wrap">
          <label className="text-sm">
            Filter by telecaller:
            <select
              value={telecallerFilter}
              onChange={(e) => { setTelecallerFilter(e.target.value); setLeadPage(1); }}
              className="ml-2 py-1.5 px-2.5 rounded-md border border-border bg-white"
            >
              <option value="">All</option>
              {telecallers.map((t) => (
                <option key={t._id} value={t._id}>{t.name}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={thClass}>Phone</th>
                <th className={thClass}>Name</th>
                <th className={thClass}>Sheet</th>
                <th className={thClass}>Assigned to</th>
                <th className={thClass}>Status</th>
                <th className={thClass}>Converted by</th>
                <th className={thClass}>Details</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l._id}>
                  <td className={tdClass}>{l.phone}</td>
                  <td className={tdClass}>{l.name || '—'}</td>
                  <td className={tdClass}>{l.sheetId?.name || '—'}</td>
                  <td className={tdClass}>{l.assignedTo ? l.assignedTo.name : <span className="text-muted">Unassigned</span>}</td>
                  <td className={tdClass}>
                    <span className={statusBadge(l.status)}>{l.status.replace('_', '-')}</span>
                  </td>
                  <td className={tdClass}>{l.status === 'converted' && l.assignedTo ? l.assignedTo.name : '—'}</td>
                  <td className={tdClass}>
                    <button type="button" onClick={() => openLeadDetail(l._id)} className="py-1.5 px-3 bg-primary text-white border-0 rounded-md text-[13px] cursor-pointer">
                      View details
                    </button>
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={7} className={`${tdClass} text-muted text-center`}>No leads</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="mt-3 flex items-center gap-2">
            <button type="button" onClick={() => setLeadPage((p) => Math.max(1, p - 1))} disabled={leadPage <= 1} className="py-1.5 px-3 border border-border rounded-md bg-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
              Previous
            </button>
            <span className="text-sm text-muted">Page {leadPage} of {totalPages} ({totalLeads} total)</span>
            <button type="button" onClick={() => setLeadPage((p) => Math.min(totalPages, p + 1))} disabled={leadPage >= totalPages} className="py-1.5 px-3 border border-border rounded-md bg-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
              Next
            </button>
          </div>
        )}
      </section>
      )}

      {detailId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4" onClick={closeLeadDetail}>
          <div className="bg-white rounded-xl p-6 max-w-[560px] w-full max-h-[90vh] overflow-auto shadow-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="m-0 mb-4 text-lg">Lead details</h2>
            {detailLoading && <p className="text-muted">Loading...</p>}
            {!detailLoading && detailData && (
              <>
                <div className="mb-4 pb-4 border-b border-border">
                  <p className="my-1"><strong>Phone:</strong> {detailData.lead.phone}</p>
                  <p className="my-1"><strong>Name:</strong> {detailData.lead.name || '—'}</p>
                  <p className="my-1"><strong>Sheet:</strong> {detailData.lead.sheetId?.name || '—'}</p>
                  <p className="my-1"><strong>Status:</strong> {detailData.lead.status}</p>
                  <p className="my-1"><strong>Assigned to:</strong> {detailData.lead.assignedTo ? detailData.lead.assignedTo.name : 'Unassigned'}</p>
                </div>
                <h3 className="m-0 mb-3 text-base">Call history (remarks & notes by telecaller)</h3>
                {detailData.records.length === 0 ? (
                  <p className="text-muted text-sm">No call records yet.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {detailData.records.map((rec) => (
                      <div key={rec._id} className="p-3 bg-surface rounded-lg border border-border">
                        <div className="text-xs text-muted mb-2">{new Date(rec.closedAt).toLocaleString()} · {rec.telecallerId?.name || '—'}</div>
                        <p className="my-1 text-sm"><strong>Outcome:</strong> {rec.outcome === 'connected' ? 'Connected' : 'Not connected'}</p>
                        {rec.outcome === 'connected' && (
                          <>
                            {rec.interested !== undefined && <p className="my-1 text-sm"><strong>Interested:</strong> {rec.interested ? 'Yes' : 'No'}</p>}
                            {rec.converted !== undefined && <p className="my-1 text-sm"><strong>Converted:</strong> {rec.converted ? 'Yes' : 'No'}</p>}
                            {rec.questionsAsked && <p className="my-1 text-sm"><strong>Questions asked:</strong><br />{rec.questionsAsked}</p>}
                          </>
                        )}
                        {rec.outcome === 'not_connected' && rec.followUpDate && <p className="my-1 text-sm"><strong>Follow-up date:</strong> {new Date(rec.followUpDate).toLocaleDateString()}</p>}
                        {rec.remark && <p className="my-1 text-sm"><strong>Remark:</strong><br />{rec.remark}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
            <div className="mt-5">
              <button type="button" onClick={closeLeadDetail} className="py-2.5 px-5 bg-border text-slate-900 border-0 rounded-lg cursor-pointer">Close</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === TAB_KEYS.monthly && (
      <section className={cardClass}>
        <h2 className="m-0 mb-4 text-lg">Monthly conversion record</h2>
        <p className="text-muted text-sm mb-4">Number of leads converted per month (last 24 months).</p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={thClass}>Month</th>
                <th className={thClass}>Converted</th>
              </tr>
            </thead>
            <tbody>
              {monthly.map((m) => (
                <tr key={m.yearMonth}>
                  <td className={tdClass}>{m.monthLabel}</td>
                  <td className={`${tdClass} text-green-600 font-semibold`}>{m.count}</td>
                </tr>
              ))}
              {monthly.length === 0 && (
                <tr>
                  <td colSpan={2} className={`${tdClass} text-muted text-center`}>No conversion data yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      )}
    </div>
  );
}
