import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Dashboard from './Dashboard';
import ScriptView from './ScriptView';
import { Phone , ScrollText} from 'lucide-react';

export default function TelecallerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const linkClass = (isActive) =>
    `flex-1 py-2.5 px-2 text-center flex items-center justify-center gap-2 no-underline text-xs ${
      isActive ? 'text-primary font-semibold' : 'text-muted font-normal'
    }`;

  return (
    <div className="min-h-screen pb-[70px]">
      <header className="py-3 px-4 bg-surface border-b border-border flex justify-between items-center">
        <span className="font-semibold">Telecalling CRM</span>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted">{user?.name}</span>
          <button
            type="button"
            onClick={handleLogout}
            className="py-1.5 px-2.5 bg-transparent text-muted border border-border rounded-md text-xs"
          >
            Logout
          </button>
        </div>
      </header>
      <main>
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="script" element={<ScriptView />} />
        </Routes>
      </main>
      <nav className="fixed bottom-0 left-0 right-0 flex bg-surface border-t-2 border-border py-2 z-[100]">
        <NavLink to="/telecaller" end className={({ isActive }) => linkClass(isActive)}>
         <Phone size={18} /> Calls
        </NavLink>
        <NavLink to="/telecaller/script" className={({ isActive }) => linkClass(isActive)}>
          <ScrollText size={18} /> Script
        </NavLink>
      </nav>
    </div>
  );
}
