import { useState } from 'react';
import telecallerApi from '../../api/telecaller';

const PRESET_QUESTIONS = [
  'Pricing and packages',
  'Product comparison with current solution',
  'Delivery timeline',
  'Payment options',
  'Discount for annual plan',
  'Demo requested',
  'Technical specifications',
  'Refund policy',
  'Call back after a week',
  'Send details on WhatsApp',
];

const PRESET_REMARKS = [
  'Customer asked to call back later',
  'Not interested – wrong timing',
  'Will think and revert',
  'Requested brochure/details on email',
  'Callback after discussion with family',
  'Already using competitor',
  'Not reachable – busy',
  'Interested – will confirm',
  'Price too high',
  'No response / switched off',
  'Requested callback on weekend',
  'Decision maker not available',
];

export default function CloseCallForm({ callingNumberId, onClose, onCancel }) {
  const [outcome, setOutcome] = useState(null);
  const [followUpDate, setFollowUpDate] = useState('');
  const [interested, setInteresting] = useState(null);
  const [questionsAsked, setQuestionsAsked] = useState('');
  const [remark, setRemark] = useState('');
  const [converted, setConverted] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (outcome === 'not_connected') {
      if (!followUpDate.trim()) {
        setError('Please set a follow-up date.');
        return;
      }
    }
    if (outcome === 'connected' && (interested === null || converted === null)) {
      setError('Please answer Interested and Converted.');
      return;
    }
    setSubmitting(true);
    try {
      const body = {
        outcome,
        followUpDate: outcome === 'not_connected' ? followUpDate : undefined,
        interested: outcome === 'connected' ? interested : undefined,
        questionsAsked: outcome === 'connected' ? questionsAsked : undefined,
        remark: remark || undefined,
        converted: outcome === 'connected' ? converted : undefined,
      };
      await telecallerApi.closeCall(callingNumberId, body);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to close call');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[200] p-4" onClick={onCancel}>
      <div className="bg-surface rounded-2xl p-6 w-full max-w-[420px] max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <h2 className="mt-0 mb-4">Close call</h2>
        {error && <p className="text-red-500 mb-3">{error}</p>}
        <form onSubmit={handleSubmit}>
          <p className="mb-3 font-medium">Was the call picked / connected?</p>
          <div className="flex gap-3 mb-5">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="radio" name="outcome" checked={outcome === 'connected'} onChange={() => setOutcome('connected')} />
              Yes
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="radio" name="outcome" checked={outcome === 'not_connected'} onChange={() => setOutcome('not_connected')} />
              No
            </label>
          </div>

          {outcome === 'not_connected' && (
            <div className="mb-4">
              <label className="block mb-1.5">Follow-up date</label>
              <input type="date" className="input-field" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} required />
            </div>
          )}

          {outcome === 'connected' && (
            <>
              <p className="mb-2 font-medium">Customer interested?</p>
              <div className="flex gap-3 mb-4">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="interested" checked={interested === true} onChange={() => setInteresting(true)} />
                  Yes
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="interested" checked={interested === false} onChange={() => setInteresting(false)} />
                  No
                </label>
              </div>
              <label className="block mb-1.5">Questions asked (optional)</label>
              <p className="text-xs text-muted mb-1.5">Tap to add:</p>
              <div className="flex flex-wrap gap-1 mb-2">
                {PRESET_QUESTIONS.map((q) => (
                  <button key={q} type="button" className="inline-block py-1.5 px-3 bg-surface border border-border rounded-lg text-[13px] cursor-pointer text-slate-900 m-1 mt-0 ml-0" onClick={() => setQuestionsAsked((prev) => (prev ? `${prev}\n• ${q}` : `• ${q}`))}>
                    {q}
                  </button>
                ))}
              </div>
              <textarea className="input-field mb-3 min-h-[70px]" value={questionsAsked} onChange={(e) => setQuestionsAsked(e.target.value)} placeholder="What did the customer ask?" />
              <label className="block mb-1.5">Remark (optional)</label>
              <p className="text-xs text-muted mb-1.5">Tap to add:</p>
              <div className="flex flex-wrap gap-1 mb-2">
                {PRESET_REMARKS.map((r) => (
                  <button key={r} type="button" className="inline-block py-1.5 px-3 bg-surface border border-border rounded-lg text-[13px] cursor-pointer text-slate-900 m-1 mt-0 ml-0" onClick={() => setRemark((prev) => (prev ? `${prev}\n• ${r}` : `• ${r}`))}>
                    {r}
                  </button>
                ))}
              </div>
              <textarea className="input-field mb-3 min-h-[70px]" value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="Notes about the call" />
              <p className="mb-2 font-medium">Converted?</p>
              <div className="flex gap-3 mb-4">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="converted" checked={converted === true} onChange={() => setConverted(true)} />
                  Yes
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="converted" checked={converted === false} onChange={() => setConverted(false)} />
                  No
                </label>
              </div>
            </>
          )}

          <div className="flex gap-3 mt-6">
            <button type="submit" disabled={!outcome || submitting} className="flex-1 py-3.5 bg-primary text-white border-0 rounded-[10px] font-semibold text-base disabled:opacity-50">
              {submitting ? 'Saving...' : 'Close call'}
            </button>
            <button type="button" onClick={onCancel} className="py-3.5 px-5 bg-border text-slate-900 border-0 rounded-[10px]">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
