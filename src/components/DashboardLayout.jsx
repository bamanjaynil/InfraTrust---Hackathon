import React from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, LayoutDashboard, FolderKanban, PlusCircle, Map, Navigation, Globe, AlertTriangle, FileText, Users, Activity, User } from 'lucide-react';

export default function DashboardLayout({ title, roleName, badgeColorClass, children }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavLinks = () => {
    const role = user?.role || roleName.toUpperCase();
    const links = [
      { name: 'Dashboard', path: `/${role.toLowerCase()}/dashboard`, icon: LayoutDashboard }
    ];

    if (role === 'ADMIN') {
      links.push({ name: 'Projects', path: '/admin/projects', icon: FolderKanban });
      links.push({ name: 'Create Project', path: '/admin/projects/create', icon: PlusCircle });
      links.push({ name: 'Contractors', path: '/admin/contractors', icon: Users });
      links.push({ name: 'Deliveries', path: '/admin/deliveries', icon: Navigation });
      links.push({ name: 'Citizen Reports', path: '/admin/reports', icon: AlertTriangle });
      links.push({ name: 'Trust Scores', path: '/admin/trust-scores', icon: Activity });
    } else if (role === 'CONTRACTOR') {
      links.push({ name: 'My Projects', path: '/contractor/projects', icon: FolderKanban });
      links.push({ name: 'Material Requests', path: '/contractor/material-requests', icon: FileText });
      links.push({ name: 'Deliveries', path: '/contractor/deliveries', icon: Navigation });
      links.push({ name: 'Drivers', path: '/contractor/drivers', icon: Users });
      links.push({ name: 'Reports', path: '/contractor/reports', icon: AlertTriangle });
    } else if (role === 'DRIVER') {
      links.push({ name: 'Active Deliveries', path: '/driver/deliveries', icon: Navigation });
      links.push({ name: 'Delivery History', path: '/driver/history', icon: FileText });
      links.push({ name: 'Profile', path: '/driver/profile', icon: User });
    } else if (role === 'CITIZEN') {
      links.push({ name: 'Projects', path: '/citizen/projects', icon: Map });
      links.push({ name: 'Report Road Issue', path: '/citizen/report', icon: AlertTriangle });
      links.push({ name: 'My Reports', path: '/citizen/reports', icon: FileText });
    }

    return links;
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-xl font-bold text-emerald-500 tracking-tight">InfraTrust</h2>
          <div className={`mt-2 inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${badgeColorClass}`}>
            {user?.role || roleName.toUpperCase()}
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {getNavLinks().map((link) => {
            const Icon = link.icon;
            let isActive = false;
            if (link.path === `/${(user?.role || roleName).toLowerCase()}/dashboard`) {
              isActive = location.pathname === link.path;
            } else if (link.path === '/admin/projects') {
              isActive = location.pathname === '/admin/projects' || (location.pathname.startsWith('/projects/') && !location.pathname.includes('create'));
            } else if (link.path === '/contractor/projects') {
              isActive = location.pathname === '/contractor/projects' || (location.pathname.startsWith('/projects/') && !location.pathname.includes('create'));
            } else {
              isActive = location.pathname === link.path || location.pathname.startsWith(`${link.path}/`);
            }
            
            return (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-emerald-500/10 text-emerald-400' 
                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.name}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold text-zinc-300">
              {(user?.name || roleName).charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-200 truncate">{user?.name || roleName}</p>
              <p className="text-xs text-zinc-500 truncate">{user?.email || 'user@example.com'}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg hover:bg-zinc-800 transition-colors text-sm font-medium text-zinc-300 hover:text-white"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-zinc-950">
        {/* Top Navigation */}
        <header className="h-16 bg-zinc-900/50 border-b border-zinc-800 flex items-center justify-between px-8 shrink-0 backdrop-blur-sm">
          <h1 className="text-xl font-semibold text-zinc-100">{title}</h1>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
