import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import sheetsApi from '../../api/sheets';
import usersApi from '../../api/users';
import statsApi from '../../api/stats';

export default function SheetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sheet, setSheet] = useState(null);
  const [numbers, setNumbers] = useState([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState(null);
  const [telecallers, setTelecallers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [singlePhone, setSinglePhone] = useState('');
  const [singleName, setSingleName] = useState('');
  const [assignIds, setAssignIds] = useState([]);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadHeaders, setUploadHeaders] = useState([]);
  const [uploadFilename, setUploadFilename] = useState('');
  const [phoneColumn, setPhoneColumn] = useState('');
  const [nameColumn, setNameColumn] = useState('');

  const loadSheet = () => sheetsApi.get(id).then((res) => setSheet(res.data.sheet));
  const loadNumbers = () => sheetsApi.getNumbers(id, 1, 100).then((res) => { setNumbers(res.data.numbers); setTotal(res.data.total); });
  const loadStats = () => statsApi.sheet(id).then((res) => setStats(res.data.stats)).catch(() => setStats(null));
  const loadTelecallers = () => usersApi.list('telecaller').then((res) => setTelecallers(res.data.users || []));

  useEffect(() => {
    setLoading(true);
    Promise.all([loadSheet(), loadNumbers(), loadStats(), loadTelecallers()])
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await sheetsApi.uploadCSV(id, file);
      const headers = res.data.headers || [];
      const fn = res.data.filename || '';
      setUploadHeaders(headers);
      setUploadFilename(fn);
      setPhoneColumn(headers[0] || '');
      setNameColumn(headers.find((h) => /name|customer|contact/i.test(h)) || '');
      setUploadModalOpen(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const closeUploadModal = () => {
    setUploadModalOpen(false);
    setUploadHeaders([]);
    setUploadFilename('');
    setPhoneColumn('');
    setNameColumn('');
  };

  const handleImportWithMapping = async () => {
    if (!phoneColumn) {
      alert('Please select the column for phone number.');
      return;
    }
    setImporting(true);
    try {
      const res = await sheetsApi.uploadImport(id, uploadFilename, phoneColumn, nameColumn || undefined);
      loadNumbers();
      loadStats();
      alert(`Imported ${res.data.added} numbers.`);
      closeUploadModal();
    } catch (err) {
      alert(err.response?.data?.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const handleAddOne = async (e) => {
    e.preventDefault();
    if (!singlePhone.trim()) return;
    try {
      await sheetsApi.addNumber(id, singlePhone.trim(), singleName.trim() || undefined);
      setSinglePhone('');
      setSingleName('');
      loadNumbers();
      loadStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Add failed');
    }
  };

  const handleAssign = async () => {
    setAssigning(true);
    try {
      await sheetsApi.assign(id, assignIds.length ? assignIds : undefined);
      loadNumbers();
      loadStats();
      alert('Assignment done.');
    } catch (err) {
      alert(err.response?.data?.message || 'Assign failed');
    } finally {
      setAssigning(false);
    }
  };

  if (loading || !sheet) return <p>Loading...</p>;

  return (
    <div>
      <div className="mb-4">
        <button type="button" onClick={() => navigate('/admin/sheets')} className="bg-transparent text-muted border-0 cursor-pointer mb-2">← Back to Sheets</button>
        <h1 className="m-0">{sheet.name}</h1>
      </div>
      {stats && (
        <div className="flex gap-3 mb-6 flex-wrap">
          <span>Pending: <strong>{stats.pending}</strong></span>
          <span>Assigned: <strong>{stats.assigned}</strong></span>
          <span>Follow-up: <strong>{stats.followUp}</strong></span>
          <span>Converted: <strong>{stats.converted}</strong></span>
          <span>Dropped: <strong>{stats.dropped}</strong></span>
        </div>
      )}
      <div className="flex flex-wrap gap-4 mb-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="py-2 px-3 bg-surface border border-border rounded-lg">{uploading ? 'Uploading...' : 'Upload CSV/Excel'}</span>
          <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFile} disabled={uploading} className="hidden" />
        </label>
        <form onSubmit={handleAddOne} className="flex gap-2 items-center flex-wrap">
          <input className="input-field w-[140px] py-2" placeholder="Phone" value={singlePhone} onChange={(e) => setSinglePhone(e.target.value)} />
          <input className="input-field w-[120px] py-2" placeholder="Name (optional)" value={singleName} onChange={(e) => setSingleName(e.target.value)} />
          <button type="submit" className="py-2 px-4 bg-primary text-white border-0 rounded-lg">Add</button>
        </form>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            multiple
            value={assignIds}
            onChange={(e) => setAssignIds(Array.from(e.target.selectedOptions, (o) => o.value))}
            className="input-field p-2 min-w-[180px]"
          >
            {telecallers.map((t) => (
              <option key={t._id} value={t._id}>{t.name}</option>
            ))}
          </select>
          <button type="button" onClick={handleAssign} disabled={assigning || telecallers.length === 0} className="py-2 px-4 bg-green-500 text-white border-0 rounded-lg disabled:opacity-50">
            {assigning ? 'Assigning...' : 'Assign to selected (or all)'}
          </button>
        </div>
      </div>
      {uploadModalOpen && uploadHeaders.length > 0 && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[1000]" onClick={closeUploadModal}>
          <div className="bg-white rounded-xl p-6 shadow-md min-w-[320px]" onClick={(e) => e.stopPropagation()}>
            <h2 className="m-0 mb-4 text-lg">Map CSV columns</h2>
            <p className="text-muted text-sm mb-4">Select which column is for phone number and which is for name (optional).</p>
            <div className="mb-3">
              <label className="block text-xs font-semibold mb-1">Phone number column *</label>
              <select value={phoneColumn} onChange={(e) => setPhoneColumn(e.target.value)} className="input-field w-full py-2">
                {uploadHeaders.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
            <div className="mb-5">
              <label className="block text-xs font-semibold mb-1">Name column (optional)</label>
              <select value={nameColumn} onChange={(e) => setNameColumn(e.target.value)} className="input-field w-full py-2">
                <option value="">— None —</option>
                {uploadHeaders.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={closeUploadModal} className="py-2 px-4 bg-surface text-slate-900 border border-border rounded-lg">Cancel</button>
              <button type="button" onClick={handleImportWithMapping} disabled={importing} className="py-2 px-4 bg-primary text-white border-0 rounded-lg disabled:opacity-50">
                {importing ? 'Importing...' : 'Import'}
              </button>
            </div>
          </div>
        </div>
      )}
      <p className="text-muted mb-2">Total numbers: {total}</p>
      <div className="bg-surface border border-border rounded-xl overflow-auto max-h-[400px]">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-3">Phone</th>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {numbers.map((n) => (
              <tr key={n._id} className="border-b border-border">
                <td className="p-3">{n.phone}</td>
                <td className="p-3">{n.name || '—'}</td>
                <td className="p-3">{n.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
