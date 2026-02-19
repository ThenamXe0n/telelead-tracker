import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { user } = await login(email, password);
      navigate(user.role === 'admin' ? '/admin' : '/telecaller', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-surface to-white">
      <form
        onSubmit={handleSubmit}
        className="card w-full max-w-md p-8 shadow-md"
      >
        <div className="text-center mb-7">
          <div className="inline-flex items-center gap-2.5 mb-2 text-primary-dark">
            <span className="text-3xl font-bold">Mind TeleCRM</span>
          </div>
          <p className="text-muted text-sm m-0">Sign in to your account</p>
        </div>
        {error && (
          <p className="text-red-500 mb-4 text-sm flex items-center gap-1.5">
            {error}
          </p>
        )}
        <label className="block mb-1.5 text-sm font-medium text-slate-600">
          Email
        </label>
        <div className="relative mb-4">
          <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input-field pl-10"
          />
        </div>
        <label className="block mb-1.5 text-sm font-medium text-slate-600">
          Password
        </label>
        <div className="relative mb-6">
          <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input-field pl-10"
          />
        </div>
        <button type="submit" disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
          <LogIn size={18} />
          {submitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
