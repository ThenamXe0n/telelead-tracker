import { useState, useEffect } from 'react';
import scriptsApi from '../../api/scripts';

export default function Scripts() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ title: '', body: '', isActive: true });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    scriptsApi.list()
      .then((res) => setList(res.data.scripts || []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(), []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await scriptsApi.create(form);
      setModal(null);
      setForm({ title: '', body: '', isActive: true });
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!modal?.id) return;
    setSaving(true);
    try {
      await scriptsApi.update(modal.id, { title: form.title, body: form.body, isActive: form.isActive });
      setModal(null);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this script?')) return;
    try {
      await scriptsApi.delete(id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  const openEdit = (s) => {
    setModal({ id: s._id, title: s.title, body: s.body, isActive: s.isActive });
    setForm({ title: s.title, body: s.body || '', isActive: s.isActive !== false });
  };

  const modalClass = 'fixed inset-0 bg-black/60 flex items-center justify-center z-10';
  const panelClass = 'bg-surface p-6 rounded-xl w-full max-w-lg max-h-[90vh] overflow-auto';

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1>Call Scripts</h1>
        <button
          type="button"
          onClick={() => { setModal('create'); setForm({ title: '', body: '', isActive: true }); }}
          className="py-2.5 px-4 bg-primary text-white border-0 rounded-lg font-semibold"
        >
          Add Script
        </button>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="flex flex-col gap-2">
          {list.map((s) => (
            <div key={s._id} className="flex items-center justify-between p-4 bg-surface border border-border rounded-xl">
              <div>
                <strong>{s.title}</strong>
                {s.isActive && <span className="ml-2 text-xs text-green-600">Active</span>}
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => openEdit(s)} className="py-1.5 px-3 bg-border text-slate-900 border-0 rounded-md">Edit</button>
                <button type="button" onClick={() => handleDelete(s._id)} className="py-1.5 px-3 bg-transparent text-red-500 border-0">Delete</button>
              </div>
            </div>
          ))}
          {list.length === 0 && <p className="text-muted">No scripts. Add one for telecallers to read during calls.</p>}
        </div>
      )}
      {modal === 'create' && (
        <div className={modalClass} onClick={() => setModal(null)}>
          <div className={panelClass} onClick={(e) => e.stopPropagation()}>
            <h2 className="mt-0">New Script</h2>
            <form onSubmit={handleCreate}>
              <input className="input-field mb-3" placeholder="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
              <textarea className="input-field mb-3 min-h-[200px]" placeholder="Script content (for telecallers)" value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} />
              <label className="flex items-center gap-2 mb-4">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
                Active (shown to telecallers)
              </label>
              <div className="flex gap-2">
                <button type="submit" disabled={saving} className="py-2.5 px-5 bg-primary text-white border-0 rounded-lg">{saving ? 'Saving...' : 'Create'}</button>
                <button type="button" onClick={() => setModal(null)} className="py-2.5 px-5 bg-border text-slate-900 border-0 rounded-lg">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {modal && modal !== 'create' && modal.id && (
        <div className={modalClass} onClick={() => setModal(null)}>
          <div className={panelClass} onClick={(e) => e.stopPropagation()}>
            <h2 className="mt-0">Edit Script</h2>
            <form onSubmit={handleUpdate}>
              <input className="input-field mb-3" placeholder="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
              <textarea className="input-field mb-3 min-h-[200px]" placeholder="Script content" value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} />
              <label className="flex items-center gap-2 mb-4">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
                Active
              </label>
              <div className="flex gap-2">
                <button type="submit" disabled={saving} className="py-2.5 px-5 bg-primary text-white border-0 rounded-lg">{saving ? 'Saving...' : 'Save'}</button>
                <button type="button" onClick={() => setModal(null)} className="py-2.5 px-5 bg-border text-slate-900 border-0 rounded-lg">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
