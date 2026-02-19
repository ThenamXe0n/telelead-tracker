import { useState, useEffect } from 'react';
import usersApi from '../../api/users';

export default function Telecallers() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'telecaller' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    usersApi.list('telecaller')
      .then((res) => setList(res.data.users))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(), []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await usersApi.create(form);
      setModal(false);
      setForm({ name: '', email: '', password: '', role: 'telecaller' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this telecaller?')) return;
    try {
      await usersApi.delete(id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1>Telecallers</h1>
        <button
          type="button"
          onClick={() => setModal(true)}
          className="py-2.5 px-4 bg-primary text-white border-0 rounded-lg font-semibold"
        >
          Add Telecaller
        </button>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Role</th>
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((u) => (
                <tr key={u._id} className="border-b border-border">
                  <td className="p-3">{u.name}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.role}</td>
                  <td className="p-3 text-right">
                    <button type="button" onClick={() => handleDelete(u._id)} className="text-red-500 bg-transparent border-0 cursor-pointer">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {list.length === 0 && <p className="p-6 text-muted">No telecallers yet. Add one to get started.</p>}
        </div>
      )}
      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-10" onClick={() => setModal(false)}>
          <div className="bg-surface p-6 rounded-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="mt-0">Add Telecaller</h2>
            {error && <p className="text-red-500 mb-3">{error}</p>}
            <form onSubmit={handleCreate}>
              <input className="input-field mb-3" placeholder="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
              <input className="input-field mb-3" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
              <input className="input-field mb-3" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required minLength={6} />
              <select className="input-field mb-3" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
                <option value="telecaller">Telecaller</option>
                <option value="admin">Admin</option>
              </select>
              <div className="flex gap-2 mt-4">
                <button type="submit" disabled={saving} className="py-2.5 px-5 bg-primary text-white border-0 rounded-lg">{saving ? 'Saving...' : 'Create'}</button>
                <button type="button" onClick={() => setModal(false)} className="py-2.5 px-5 bg-border text-slate-900 border-0 rounded-lg">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
