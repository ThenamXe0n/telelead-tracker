import { Phone, ClipboardList } from 'lucide-react';

const btnBase = 'inline-flex items-center gap-2 py-3 px-5 rounded-[10px] font-semibold text-sm border-0 cursor-pointer no-underline';

export default function CallList({ list, tab, onOpenCloseForm }) {
  const isAssignedOrPending = tab === 'assigned' || tab === 'pending';
  const isFollowUp = tab === 'follow-up';

  return (
    <div>
      {list.length === 0 ? (
        <p className="text-muted text-center py-6">No calls in this list.</p>
      ) : (
        list.map((item) => (
          <div key={item._id} className="bg-surface border border-border rounded-xl p-4 mb-3">
            <div className="flex justify-between items-center flex-wrap gap-3">
              <div>
                <div className="font-semibold text-base">{item.phone}</div>
                {item.name && <div className="text-sm text-muted">{item.name}</div>}
                {isFollowUp && item.followUpDate && (
                  <div className="text-xs text-amber-500">Follow-up: {new Date(item.followUpDate).toLocaleDateString()}</div>
                )}
              </div>
              {(isAssignedOrPending || isFollowUp) && (
                <div className="flex gap-2 flex-wrap">
                  <a href={`tel:${item.phone}`} className={`${btnBase} bg-green-500 text-white`}>
                    <Phone size={18} />
                    {/* Call */}
                  </a>
                  <button type="button" onClick={() => onOpenCloseForm(item._id)} className={`${btnBase} bg-primary text-white`}>
                    <ClipboardList size={18} />
                    {/* Close call */}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
