import { useState, useEffect } from 'react';
import scriptsApi from '../../api/scripts';

export default function ScriptView() {
  const [script, setScript] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    scriptsApi.list()
      .then((res) => setScript(res.data.script))
      .catch(() => setScript(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-6 text-muted">Loading script...</p>;
  if (!script) return <p className="p-6 text-muted">No active script. Ask your admin to add one.</p>;

  return (
    <div className="p-4">
      <h1 className="mb-4">{script.title}</h1>
      <div className="bg-surface border border-border rounded-xl p-5 whitespace-pre-wrap leading-relaxed">
        {script.body || 'No content.'}
      </div>
    </div>
  );
}
