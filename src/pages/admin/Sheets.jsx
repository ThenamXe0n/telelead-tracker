import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import sheetsApi from '../../api/sheets';

export default function Sheets() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    sheetsApi.list()
      .then((res) => setList(res.data.sheets))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(), []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await sheetsApi.create(name || undefined);
      setModal(false);
      setName('');
      navigate(`/admin/sheets/${data.sheet._id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Delete this sheet and all its numbers?')) return;
    try {
      await sheetsApi.delete(id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1>Calling Sheets</h1>
        <button
          type="button"
          onClick={() => setModal(true)}
          className="py-2.5 px-4 bg-primary text-white border-0 rounded-lg font-semibold"
        >
          New Sheet
        </button>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="flex flex-col gap-2">
          {list.map((s) => (
            <div
              key={s._id}
              className="flex items-center justify-between p-4 bg-surface border border-border rounded-xl"
            >
              <Link to={`/admin/sheets/${s._id}`} className="text-inherit font-medium no-underline">{s.name}</Link>
              <button type="button" onClick={(e) => handleDelete(s._id, e)} className="text-red-500 bg-transparent border-0 cursor-pointer p-1">Delete</button>
            </div>
          ))}
          {list.length === 0 && <p className="text-muted">No sheets. Create one and upload a CSV or add numbers.</p>}
        </div>
      )}
      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-10" onClick={() => setModal(false)}>
          <div className="bg-surface p-6 rounded-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="mt-0">New Sheet</h2>
            <form onSubmit={handleCreate}>
              <input
                className="input-field mb-4"
                placeholder="Sheet name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <div className="flex gap-2">
                <button type="submit" disabled={saving} className="py-2.5 px-5 bg-primary text-white border-0 rounded-lg">{saving ? 'Creating...' : 'Create'}</button>
                <button type="button" onClick={() => setModal(false)} className="py-2.5 px-5 bg-border text-slate-900 border-0 rounded-lg">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
