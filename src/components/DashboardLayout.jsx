import React, { useMemo, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  FileText,
  FolderKanban,
  Globe,
  LayoutDashboard,
  LogOut,
  Map,
  Menu,
  Navigation,
  PanelLeftClose,
  PlusCircle,
  ShieldCheck,
  User,
  Users,
  X,
} from 'lucide-react';

const roleAccent = {
  ADMIN: 'from-teal-300/35 via-cyan-300/15 to-transparent',
  CONTRACTOR: 'from-sky-300/35 via-blue-300/15 to-transparent',
  DRIVER: 'from-amber-300/35 via-orange-300/12 to-transparent',
  CITIZEN: 'from-emerald-300/35 via-teal-300/15 to-transparent',
};

export default function DashboardLayout({ title, roleName, badgeColorClass, children }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const role = useMemo(() => user?.role || roleName?.toUpperCase(), [user?.role, roleName]);

  const navLinks = useMemo(() => {
    const links = [{ name: 'Dashboard', path: `/${role.toLowerCase()}/dashboard`, icon: LayoutDashboard }];

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
  }, [role]);

  const isActiveLink = (path) => {
    if (path === `/${role.toLowerCase()}/dashboard`) {
      return location.pathname === path;
    }
    if (path === '/admin/projects') {
      return location.pathname === path || (location.pathname.startsWith('/projects/') && !location.pathname.includes('create'));
    }
    if (path === '/contractor/projects') {
      return location.pathname === path || (location.pathname.startsWith('/projects/') && !location.pathname.includes('create'));
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const Sidebar = (
    <aside
      className={`glass-panel relative flex h-full flex-col overflow-hidden border-white/10 transition-all duration-300 ${
        sidebarCollapsed ? 'lg:w-[5.5rem]' : 'lg:w-72'
      } w-[18.5rem] rounded-none lg:rounded-[2rem]`}
    >
      <div className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-br ${roleAccent[role] || roleAccent.CITIZEN}`} />

      <div className="relative flex items-center justify-between border-b border-white/8 px-5 py-5">
        <div className={`min-w-0 ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
          <h2 className="text-2xl font-semibold text-white">InfraTrust</h2>
          <p className="mt-1 text-xs uppercase tracking-[0.26em] text-slate-400">Ops Console</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSidebarCollapsed((value) => !value)}
            className="hidden rounded-xl border border-white/10 bg-white/6 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white lg:inline-flex"
            aria-label="Toggle sidebar"
          >
            <PanelLeftClose className={`h-4 w-4 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded-xl border border-white/10 bg-white/6 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="relative px-4 pb-4 pt-5">
        <div className={`rounded-[1.35rem] border border-white/10 bg-white/6 p-4 ${sidebarCollapsed ? 'lg:px-3 lg:py-3' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-300/80 to-sky-400/70 text-base font-semibold text-slate-950 shadow-[0_10px_25px_rgba(45,212,191,0.35)]">
              {(user?.name || roleName || 'U').charAt(0)}
            </div>
            <div className={`min-w-0 ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
              <p className="truncate text-sm font-semibold text-slate-100">{user?.name || roleName}</p>
              <p className="truncate text-xs text-slate-400">{user?.email || 'user@example.com'}</p>
            </div>
          </div>
          <div
            className={`mt-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] ${badgeColorClass} ${
              sidebarCollapsed ? 'lg:hidden' : ''
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            {user?.role || roleName.toUpperCase()}
          </div>
        </div>
      </div>

      <nav className="relative flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const active = isActiveLink(link.path);

          return (
            <button
              key={link.path}
              type="button"
              onClick={() => {
                navigate(link.path);
                setMobileOpen(false);
              }}
              className={`group flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-sm font-medium transition duration-200 ${
                active
                  ? 'border-teal-300/20 bg-gradient-to-r from-teal-300/14 via-cyan-300/8 to-transparent text-white shadow-[0_12px_30px_rgba(20,184,166,0.12)]'
                  : 'border-transparent text-slate-400 hover:border-white/8 hover:bg-white/6 hover:text-slate-100'
              } ${sidebarCollapsed ? 'lg:justify-center lg:px-2' : ''}`}
              title={sidebarCollapsed ? link.name : undefined}
            >
              <Icon className={`h-4.5 w-4.5 shrink-0 ${active ? 'text-teal-200' : 'text-slate-500 group-hover:text-slate-200'}`} />
              <span className={sidebarCollapsed ? 'lg:hidden' : ''}>{link.name}</span>
            </button>
          );
        })}
      </nav>

      <div className="relative border-t border-white/8 p-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-rose-300/20 hover:bg-rose-500/10 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          <span className={sidebarCollapsed ? 'lg:hidden' : ''}>Sign Out</span>
        </button>
      </div>
    </aside>
  );

  return (
    <div className="relative min-h-screen bg-transparent text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1700px] gap-0 p-0 lg:gap-6 lg:p-5">
        <div className="hidden lg:block">{Sidebar}</div>

        {mobileOpen && (
          <div className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)}>
            <div className="h-full w-[18.5rem]" onClick={(e) => e.stopPropagation()}>
              {Sidebar}
            </div>
          </div>
        )}

        <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
          <header className="sticky top-0 z-30 border-b border-white/8 bg-slate-950/35 backdrop-blur-xl lg:rounded-[1.75rem] lg:border lg:border-white/8">
            <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileOpen(true)}
                  className="inline-flex rounded-2xl border border-white/10 bg-white/6 p-2.5 text-slate-300 transition hover:bg-white/10 hover:text-white lg:hidden"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-500">Workspace</p>
                  <h1 className="truncate text-2xl font-semibold text-white">{title}</h1>
                </div>
              </div>

              <div className="hidden items-center gap-3 sm:flex">
                <div className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-slate-300">
                  <span className="text-slate-500">Signed in as</span> {user?.name || roleName}
                </div>
                <div className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] ${badgeColorClass}`}>
                  {user?.role || roleName.toUpperCase()}
                </div>
              </div>
            </div>
          </header>

          <div className="relative flex-1 overflow-y-auto px-4 pb-6 pt-5 sm:px-6 lg:px-8 lg:pb-8 lg:pt-6">
            <div className="relative mx-auto max-w-7xl">
              <div className="pointer-events-none absolute -left-6 top-0 hidden h-48 w-48 rounded-full bg-teal-400/8 blur-3xl md:block" />
              <div className="pointer-events-none absolute right-0 top-16 hidden h-40 w-40 rounded-full bg-sky-400/8 blur-3xl md:block" />
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
