import { useState, useEffect } from 'react';
import telecallerApi from '../../api/telecaller';
import { History, MessageSquare, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

// Preset questions – Demat, SIP, mutual funds, stocks (client business)
const PRESET_QUESTIONS = [
  'Demat account opening – process & charges',
  'SIP – how to start, minimum amount',
  'Mutual fund options / which fund to choose',
  'Stock market / equity trading – brokerage, platform',
  'Motilal Oswal / other broker comparison',
  'Document required for Demat',
  'Account opening timeline',
  'Charges – AMC, brokerage, hidden fees',
  'Existing Demat – transfer or new',
  'Call back after a week',
  'Send details on WhatsApp / email',
  'Demo or guidance session',
];

// Preset remarks – for outcome & follow-up reason
const PRESET_REMARKS = [
  'Asked to call back later',
  'Not interested – wrong timing',
  'Will think and revert',
  'Want to discuss with family / spouse',
  'Already has Demat / SIP elsewhere',
  'Using another broker (e.g. Zerodha, Upstox)',
  'Not reachable – busy',
  'Interested – will confirm',
  'Charges / brokerage too high',
  'No response / switched off',
  'Callback on weekend',
  'Decision maker not available',
  'Want brochure / details on email',
  'Demat only / SIP only / stocks only – not all',
];

function getTomorrowISO() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export default function CloseCallForm({ callingNumberId, onClose, onCancel }) {
  const [outcome, setOutcome] = useState(null);
  const [followUpDate, setFollowUpDate] = useState(getTomorrowISO());
  const [interested, setInteresting] = useState(null);
  const [questionsAsked, setQuestionsAsked] = useState('');
  const [remark, setRemark] = useState('');
  const [converted, setConverted] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [previousCall, setPreviousCall] = useState(null);
  const [previousCallLoading, setPreviousCallLoading] = useState(true);
  const [prevCallExpanded, setPrevCallExpanded] = useState(false);
  const [step, setStep] = useState(1);
  const [optionalNotesOpen, setOptionalNotesOpen] = useState(false);

  useEffect(() => {
    if (!callingNumberId) return;
    setPreviousCallLoading(true);
    telecallerApi
      .previousCall(callingNumberId)
      .then((res) => setPreviousCall(res.data.previousCall || null))
      .catch(() => setPreviousCall(null))
      .finally(() => setPreviousCallLoading(false));
  }, [callingNumberId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (outcome === 'not_connected' && !followUpDate.trim()) {
      setError('Please set a follow-up date.');
      return;
    }
    if (outcome === 'connected' && (interested === null || converted === null)) {
      setError('Please answer Interested and Converted.');
      return;
    }
    if (outcome === 'connected' && converted === false) {
      if (!followUpDate.trim()) {
        setError('Please set a follow-up date.');
        return;
      }
      if (!remark.trim()) {
        setError('Please add a reason or message for follow-up.');
        return;
      }
    }
    if (!callingNumberId) {
      setError('Invalid lead. Please close and try again.');
      return;
    }
    setSubmitting(true);
    try {
      const body = {
        outcome,
        followUpDate:
          outcome === 'not_connected' ? followUpDate
          : outcome === 'connected' && converted === false ? followUpDate
          : undefined,
        interested: outcome === 'connected' ? interested : undefined,
        questionsAsked: outcome === 'connected' ? questionsAsked : undefined,
        remark: remark ? remark.trim() : undefined,
        converted: outcome === 'connected' ? converted : undefined,
      };
      await telecallerApi.closeCall(callingNumberId, body);
      if (typeof onClose === 'function') onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to close call');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrevDate = (d) => (d ? new Date(d).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) : '');

  const prevCallSummary =
    previousCall &&
    (previousCall.outcome === 'not_connected'
      ? `Last: Not connected · ${previousCall.followUpDate ? new Date(previousCall.followUpDate).toLocaleDateString() : '—'}`
      : `Last: Connected, ${previousCall.converted ? 'converted' : 'not converted'}${previousCall.remark ? ` · ${previousCall.remark.slice(0, 40)}${previousCall.remark.length > 40 ? '…' : ''}` : ''}`);

  const isNotConnectedFlow = outcome === 'not_connected';
  const isConnectedConverted = outcome === 'connected' && converted === true;
  const isConnectedNotConverted = outcome === 'connected' && converted === false;
  const canSubmitStep1 = outcome === 'not_connected' && followUpDate.trim();
  const canGoStep3 = outcome === 'connected' && interested !== null && converted === false;
  const canSubmitStep2 = outcome === 'connected' && interested !== null && converted === true;
  const canSubmitStep3 = isConnectedNotConverted && followUpDate.trim() && remark.trim();

  const totalSteps = outcome === 'connected' && converted === false ? 3 : 2;
  const stepLabel = step === 1 ? '1' : step === 2 ? '2' : '3';

  const btnTap = 'min-h-[44px] min-w-[44px] touch-manipulation';
  const choiceBtn =
    'flex-1 py-4 px-4 rounded-xl border-2 text-base font-semibold transition-colors ' + btnTap;

  if (!callingNumberId) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-[200] p-0 sm:p-4" onClick={() => typeof onCancel === 'function' && onCancel()}>
      <div
        className="bg-surface rounded-t-2xl sm:rounded-2xl w-full max-w-[420px] max-h-[90vh] sm:max-h-[85vh] flex flex-col shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header + step */}
        <div className="shrink-0 px-4 pt-4 pb-2 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <h2 className="mt-0 mb-0 text-lg font-semibold">Close call</h2>
            {outcome && (
              <span className="text-xs text-muted">
                Step {stepLabel} of {totalSteps}
              </span>
            )}
          </div>
          {previousCallLoading && <p className="text-muted text-sm">Loading previous call...</p>}
          {!previousCallLoading && previousCall && (
            <button
              type="button"
              onClick={() => setPrevCallExpanded((prev) => !prev)}
              className="w-full text-left p-3 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-between gap-2"
            >
              <span className="flex items-center gap-2 text-slate-700 text-sm font-medium">
                <History size={16} className="shrink-0" />
                {prevCallSummary}
              </span>
              {prevCallExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          )}
          {!previousCallLoading && previousCall && prevCallExpanded && (
            <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm space-y-1.5">
              <p className="text-slate-600">
                <span className="font-medium">When:</span> {formatPrevDate(previousCall.closedAt)}
              </p>
              <p className="text-slate-600">
                <span className="font-medium">Outcome:</span>{' '}
                {previousCall.outcome === 'connected' ? 'Connected' : 'Not connected'}
              </p>
              {previousCall.outcome === 'connected' && previousCall.converted !== undefined && (
                <p className="text-slate-600">
                  <span className="font-medium">Converted then:</span> {previousCall.converted ? 'Yes' : 'No'}
                </p>
              )}
              {previousCall.followUpDate && (
                <p className="text-slate-600 flex items-center gap-1">
                  <Calendar size={14} />
                  <span className="font-medium">Follow-up was:</span>{' '}
                  {new Date(previousCall.followUpDate).toLocaleDateString()}
                </p>
              )}
              {previousCall.remark && (
                <div className="pt-2 border-t border-slate-200 flex items-start gap-1">
                  <MessageSquare size={14} className="shrink-0 mt-0.5" />
                  <span className="text-slate-700"><span className="font-medium">Reason:</span> {previousCall.remark}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden flex">
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

            {/* Step 1: Outcome */}
            {step === 1 && (
              <>
                <p className="mb-3 font-medium text-slate-700">Was the call picked / connected?</p>
                <div className="flex gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => setOutcome('connected')}
                    className={`${choiceBtn} ${outcome === 'connected' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-white text-slate-700'}`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setOutcome('not_connected')}
                    className={`${choiceBtn} ${outcome === 'not_connected' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-white text-slate-700'}`}
                  >
                    No
                  </button>
                </div>
                {isNotConnectedFlow && (
                  <div className="mt-4">
                    <label className="block mb-2 font-medium text-slate-700">Follow-up date</label>
                    <input
                      type="date"
                      className="input-field w-full py-3 text-base"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                    />
                  </div>
                )}
              </>
            )}

            {/* Step 2: Interested + Converted (only when connected) */}
            {step === 2 && outcome === 'connected' && (
              <>
                <p className="mb-3 font-medium text-slate-700">Customer interested?</p>
                <div className="flex gap-3 mb-5">
                  <button
                    type="button"
                    onClick={() => setInteresting(true)}
                    className={`${choiceBtn} ${interested === true ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-white text-slate-700'}`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setInteresting(false)}
                    className={`${choiceBtn} ${interested === false ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-white text-slate-700'}`}
                  >
                    No
                  </button>
                </div>
                <p className="mb-3 font-medium text-slate-700">Converted?</p>
                <div className="flex gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => setConverted(true)}
                    className={`${choiceBtn} ${converted === true ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-white text-slate-700'}`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setConverted(false)}
                    className={`${choiceBtn} ${converted === false ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-white text-slate-700'}`}
                  >
                    No
                  </button>
                </div>
                {isConnectedConverted && (
                  <>
                    <button
                      type="button"
                      onClick={() => setOptionalNotesOpen((o) => !o)}
                      className="text-sm text-primary font-medium py-2"
                    >
                      {optionalNotesOpen ? '− Hide notes' : '+ Add notes (optional)'}
                    </button>
                    {optionalNotesOpen && (
                      <div className="mt-2 space-y-3">
                        <div>
                          <label className="block text-xs text-muted mb-1">Questions asked</label>
                          <div className="overflow-x-auto flex gap-2 pb-1 -mx-1 scrollbar-thin">
                            {PRESET_QUESTIONS.map((q) => (
                              <button
                                key={q}
                                type="button"
                                className="shrink-0 py-2 px-3 bg-white border border-border rounded-lg text-[13px]"
                                onClick={() =>
                                  setQuestionsAsked((prev) => (prev ? `${prev}\n• ${q}` : `• ${q}`))
                                }
                              >
                                {q}
                              </button>
                            ))}
                          </div>
                          <textarea
                            className="input-field mt-1 min-h-[60px] w-full text-sm"
                            value={questionsAsked}
                            onChange={(e) => setQuestionsAsked(e.target.value)}
                            placeholder="What did the customer ask?"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-muted mb-1">Remark</label>
                          <div className="overflow-x-auto flex gap-2 pb-1 -mx-1">
                            {PRESET_REMARKS.map((r) => (
                              <button
                                key={r}
                                type="button"
                                className="shrink-0 py-2 px-3 bg-white border border-border rounded-lg text-[13px]"
                                onClick={() => setRemark((prev) => (prev ? `${prev}\n• ${r}` : `• ${r}`))}
                              >
                                {r}
                              </button>
                            ))}
                          </div>
                          <textarea
                            className="input-field mt-1 min-h-[60px] w-full text-sm"
                            value={remark}
                            onChange={(e) => setRemark(e.target.value)}
                            placeholder="Notes about the call"
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* Step 3: Follow-up date + reason (only when connected & not converted) */}
            {step === 3 && isConnectedNotConverted && (
              <>
                <p className="mb-2 font-medium text-amber-800">Follow-up required</p>
                <div className="mb-4">
                  <label className="block mb-2 font-medium text-slate-700">Follow-up date</label>
                  <input
                    type="date"
                    className="input-field w-full py-3 text-base"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                  />
                </div>
                <label className="block mb-2 font-medium text-slate-700">Reason or message (required)</label>
                <div className="overflow-x-auto flex gap-2 pb-2 -mx-1 mb-2">
                  {PRESET_REMARKS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      className="shrink-0 py-2.5 px-3 bg-white border border-border rounded-lg text-[13px]"
                      onClick={() => setRemark((prev) => (prev ? `${prev}\n• ${r}` : `• ${r}`))}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <textarea
                  className="input-field w-full min-h-[80px] text-base"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="Why follow-up? e.g. callback later, price concern..."
                  required
                />
              </>
            )}
          </div>

          {/* Sticky bottom actions */}
          <div className="shrink-0 p-4 pt-3 border-t border-border bg-surface flex gap-3">
            {step === 1 && !isNotConnectedFlow && outcome !== null && (
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 py-3.5 bg-primary text-white border-0 rounded-xl font-semibold text-base"
              >
                Next
              </button>
            )}
            {step === 2 && isConnectedNotConverted && (
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 py-3.5 bg-primary text-white border-0 rounded-xl font-semibold text-base"
              >
                Next
              </button>
            )}
            {step >= 2 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="py-3.5 px-4 bg-white border border-border rounded-xl font-medium text-slate-700"
              >
                Back
              </button>
            )}
            {(canSubmitStep1 || canSubmitStep2 || canSubmitStep3) ? (
              <button
                type="submit"
                disabled={submitting}
                className={`flex-1 py-3.5 rounded-xl font-semibold text-base border-0 ${btnTap} ${
                  submitting ? 'bg-slate-400 text-white' : 'bg-primary text-white'
                }`}
              >
                {submitting ? 'Saving...' : 'Close call'}
              </button>
            ) : step === 1 && !outcome ? (
              <span className="flex-1 py-3.5 rounded-xl font-semibold text-base border-0 bg-slate-200 text-slate-500 flex items-center justify-center">
                Close call
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => typeof onCancel === 'function' && onCancel()}
              className="py-3.5 px-4 bg-white border border-border rounded-xl font-medium text-slate-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
