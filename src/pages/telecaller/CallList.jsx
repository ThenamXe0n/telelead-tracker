import { useState } from 'react';
import { Phone, ClipboardList, Pencil, Check, X } from 'lucide-react';
import telecallerApi from '../../api/telecaller';

const btnBase = 'inline-flex items-center gap-2 py-3 px-5 rounded-[10px] font-semibold text-sm border-0 cursor-pointer no-underline';

export default function CallList({ list, tab, onOpenCloseForm, onRefresh }) {
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [savingName, setSavingName] = useState(false);

  const isAssignedOrPending = tab === 'assigned' || tab === 'pending';
  const isFollowUp = tab === 'follow-up';
  const useCallNowFlow = isAssignedOrPending;
  const firstLead = useCallNowFlow && list.length > 0 ? list[0] : null;
  const remainingList = useCallNowFlow && list.length > 1 ? list.slice(1) : [];

  const displayName = (item) => {
    const n = item.name?.trim();
    return n && n.toLowerCase() !== 'unknown' ? n : 'Unknown';
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setEditingName(item.name?.trim() && item.name.toLowerCase() !== 'unknown' ? item.name : '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const saveName = async () => {
    if (editingId == null) return;
    setSavingName(true);
    try {
      await telecallerApi.updateLeadName(editingId, editingName.trim() || 'unknown');
      cancelEdit();
      onRefresh?.();
    } catch (_) {
      // keep editing on error
    } finally {
      setSavingName(false);
    }
  };

  function LeadRow({ item, showCallAndClose, compact }) {
    const isEditing = editingId === item._id;
    return (
      <div className={`bg-surface border border-border rounded-xl p-4 mb-3 ${compact ? 'p-3' : ''}`}>
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div className="min-w-0 flex-1">
            <div className={`font-semibold ${compact ? 'text-sm' : 'text-base'}`}>{item.phone}</div>
            {isEditing ? (
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  placeholder="Enter name"
                  className="input-field py-2 px-3 text-sm flex-1 min-w-[120px]"
                  autoFocus
                />
                <button type="button" onClick={saveName} disabled={savingName} className="p-2 rounded-lg bg-primary text-white disabled:opacity-50" aria-label="Save name">
                  <Check size={18} />
                </button>
                <button type="button" onClick={cancelEdit} className="p-2 rounded-lg bg-slate-200 text-slate-700" aria-label="Cancel">
                  <X size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-sm ${displayName(item) === 'Unknown' ? 'text-amber-600 italic' : 'text-muted'}`}>{displayName(item)}</span>
                {(isAssignedOrPending || isFollowUp) && (
                  <button type="button" onClick={() => startEdit(item)} className="p-1 rounded text-slate-500 hover:bg-slate-200" aria-label="Edit name" title="Edit name (e.g. after asking on call)">
                    <Pencil size={14} />
                  </button>
                )}
              </div>
            )}
            {isFollowUp && item.followUpDate && (
              <div className="text-xs text-amber-500 mt-0.5">Follow-up: {new Date(item.followUpDate).toLocaleDateString()}</div>
            )}
          </div>
          {showCallAndClose && editingId !== item._id && (
            <div className="flex gap-2 flex-wrap">
              <a href={`tel:${item.phone}`} className={`${btnBase} bg-green-500 text-white`}><Phone size={18} /></a>
              <button type="button" onClick={() => item?._id != null && typeof onOpenCloseForm === 'function' && onOpenCloseForm(item._id)} className={`${btnBase} bg-primary text-white`}>
                <ClipboardList size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (list.length === 0) {
    return <p className="text-muted text-center py-6">No calls in this list.</p>;
  }

  if (useCallNowFlow && firstLead) {
    return (
      <div>
        <div className="mb-4 p-4 bg-primary/10 border-2 border-primary rounded-xl">
          <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Current call (top of list)</p>
          <div className="flex justify-between items-start flex-wrap gap-3">
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-lg">{firstLead.phone}</div>
              {editingId === firstLead._id ? (
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    placeholder="Enter name"
                    className="input-field py-2 px-3 text-sm flex-1 min-w-[120px]"
                    autoFocus
                  />
                  <button type="button" onClick={saveName} disabled={savingName} className="p-2 rounded-lg bg-primary text-white disabled:opacity-50" aria-label="Save name"><Check size={18} /></button>
                  <button type="button" onClick={cancelEdit} className="p-2 rounded-lg bg-slate-200 text-slate-700" aria-label="Cancel"><X size={18} /></button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`text-sm ${displayName(firstLead) === 'Unknown' ? 'text-amber-600 italic' : 'text-slate-600'}`}>{displayName(firstLead)}</span>
                  <button type="button" onClick={() => startEdit(firstLead)} className="p-1 rounded text-slate-500 hover:bg-slate-200" aria-label="Edit name"><Pencil size={14} /></button>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-3 mt-4 flex-wrap">
            <a href={`tel:${firstLead.phone}`} className={`${btnBase} flex-1 min-w-[140px] justify-center bg-green-600 text-white py-4 text-base`}>
              <Phone size={20} />
              Call now
            </a>
            <button type="button" onClick={() => firstLead?._id != null && typeof onOpenCloseForm === 'function' && onOpenCloseForm(firstLead._id)} className={`${btnBase} flex-1 min-w-[140px] justify-center bg-primary text-white py-4 text-base`}>
              <ClipboardList size={20} />
              Close call
            </button>
          </div>
          <p className="text-xs text-muted mt-3">Complete the close-call form after the call to move to the next number.</p>
        </div>
        {remainingList.length > 0 && (
          <>
            <p className="text-sm font-medium text-muted mb-2">Up next ({remainingList.length})</p>
            {remainingList.map((item) => (
              <div key={item._id} className="bg-surface border border-border rounded-xl p-3 mb-2">
                {editingId === item._id ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      placeholder="Enter name"
                      className="input-field py-2 px-3 text-sm flex-1 min-w-[100px]"
                      autoFocus
                    />
                    <button type="button" onClick={saveName} disabled={savingName} className="p-2 rounded-lg bg-primary text-white disabled:opacity-50"><Check size={16} /></button>
                    <button type="button" onClick={cancelEdit} className="p-2 rounded-lg bg-slate-200 text-slate-700"><X size={16} /></button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-sm">{item.phone}</div>
                      <span className={`text-xs ${displayName(item) === 'Unknown' ? 'text-amber-600 italic' : 'text-muted'}`}>{displayName(item)}</span>
                    </div>
                    <button type="button" onClick={() => startEdit(item)} className="p-1.5 rounded text-slate-500" aria-label="Edit name"><Pencil size={14} /></button>
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    );
  }

  return (
    <div>
      {list.map((item) => (
        <LeadRow key={item._id} item={item} showCallAndClose={isFollowUp} compact={false} />
      ))}
    </div>
  );
}
