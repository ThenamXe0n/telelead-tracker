import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, FileSpreadsheet, FileText, Target, LogOut, User } from 'lucide-react';
import Dashboard from './Dashboard';
import Telecallers from './Telecallers';
import Sheets from './Sheets';
import SheetDetail from './SheetDetail';
import Scripts from './Scripts';
import LeadTracking from './LeadTracking';
import logo from '/assets/logo512.png';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const linkClass = (isActive) =>
    `flex items-center gap-2 py-2.5 px-3.5 rounded-lg no-underline ${isActive ? 'text-primary-dark font-semibold bg-primary/10' : 'text-muted font-medium'
    }`;

  return (
    <div className="min-h-screen bg-surface">
      <header className=' bg-white border-b border-border items-center justify-between shadow-sm flex px-6'>
        <div className="flex items-center gap-2 justify-center">
          <img src={logo} className="h-10 w-auto" alt="Mind TeleCRM" />
          <span className="font-bold text-xl"><span className='text-primary'>Mind</span> <span className='text-cyan-900'>TeleCRM</span></span>
        </div>
        <nav className="flex gap-1 items-center py-3 px-5">
          <NavLink to="/admin" end className={({ isActive }) => linkClass(isActive)}>
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>
          <NavLink to="/admin/telecallers" className={({ isActive }) => linkClass(isActive)}>
            <Users size={18} />
            Telecallers
          </NavLink>
          <NavLink to="/admin/sheets" className={({ isActive }) => linkClass(isActive)}>
            <FileSpreadsheet size={18} />
            Sheets
          </NavLink>
          <NavLink to="/admin/leads" className={({ isActive }) => linkClass(isActive)}>
            <Target size={18} />
            Lead tracking
          </NavLink>
          <NavLink to="/admin/scripts" className={({ isActive }) => linkClass(isActive)}>
            <FileText size={18} />
            Scripts
          </NavLink>
        </nav>
        <div className='flex items-center gap-6 '> <span className="ml-auto flex items-center gap-2.5 text-slate-600">
          <User size={16} />
          {user?.name}
        </span>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 py-2 px-3.5 bg-transparent text-muted border border-border rounded-lg"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>
      <main className="flex-1 p-6">
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="telecallers" element={<Telecallers />} />
          <Route path="sheets" element={<Sheets />} />
          <Route path="sheets/:id" element={<SheetDetail />} />
          <Route path="leads" element={<LeadTracking />} />
          <Route path="scripts" element={<Scripts />} />
        </Routes>
      </main>
    </div>
  );
}
