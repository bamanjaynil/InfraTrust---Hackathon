import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { FolderKanban, Plus, Users, Activity, AlertTriangle, CheckCircle, Navigation } from 'lucide-react';
import useAdminStore from '../../store/adminStore';
import StatCard from '../../components/StatCard';
import Card from '../../components/Card';
import Button from '../../components/Button';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { projects, reports, deliveries, fetchProjects, fetchReports, fetchDeliveries } = useAdminStore();

  useEffect(() => {
    fetchProjects();
    fetchReports();
    fetchDeliveries();
  }, [fetchProjects, fetchReports, fetchDeliveries]);

  const stats = useMemo(() => {
    const safeProjects = Array.isArray(projects) ? projects : [];
    const safeReports = Array.isArray(reports) ? reports : [];

    return {
      totalProjects: safeProjects.length,
      activeProjects: safeProjects.filter((p) => p.status === 'ASSIGNED' || p.status === 'IN_PROGRESS').length,
      completedProjects: safeProjects.filter((p) => p.status === 'COMPLETED').length,
      pendingReports: safeReports.filter((r) => r.status === 'OPEN').length,
      trustAlerts: 0,
    };
  }, [projects, reports]);

  const recentActivity = useMemo(() => {
    const safeProjects = Array.isArray(projects) ? projects : [];
    const safeDeliveries = Array.isArray(deliveries) ? deliveries : [];
    const safeReports = Array.isArray(reports) ? reports : [];

    return [
      ...safeProjects.slice(0, 3).map((p) => ({
        id: `p-${p.id}`,
        title: `New Project: ${p.name}`,
        time: p.created_at,
        icon: FolderKanban,
        tone: 'text-teal-200 bg-teal-400/10 border-teal-300/15',
      })),
      ...safeDeliveries.slice(0, 3).map((d) => ({
        id: `d-${d.id}`,
        title: `Delivery: ${d.material_type} to ${d.project_id}`,
        time: d.timestamp,
        icon: Navigation,
        tone: 'text-sky-200 bg-sky-400/10 border-sky-300/15',
      })),
      ...safeReports.slice(0, 3).map((r) => ({
        id: `r-${r.id}`,
        title: `Report: ${r.description.substring(0, 30)}...`,
        time: r.created_at,
        icon: AlertTriangle,
        tone: 'text-amber-200 bg-amber-400/10 border-amber-300/15',
      })),
    ]
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 6);
  }, [projects, deliveries, reports]);

  return (
    <DashboardLayout
      title="Admin Dashboard"
      roleName="Administrator"
      badgeColorClass="border-teal-300/20 bg-teal-400/10 text-teal-100"
    >
      <section className="mb-8 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_60px_rgba(2,6,23,0.32)] backdrop-blur-xl sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-200/80">Control Tower</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold text-white sm:text-4xl">
              A clearer oversight layer for live infrastructure operations.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Review projects, monitor delivery activity, and resolve citizen reports from a calmer command surface with stronger visual hierarchy.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              ['Projects', stats.totalProjects],
              ['Reports open', stats.pendingReports],
              ['Completed', stats.completedProjects],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[1.5rem] border border-white/10 bg-slate-950/35 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{label}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-50">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Total Projects" value={stats.totalProjects} icon={FolderKanban} color="emerald" />
        <StatCard title="Active Projects" value={stats.activeProjects} icon={Activity} color="blue" />
        <StatCard title="Completed" value={stats.completedProjects} icon={CheckCircle} color="purple" />
        <StatCard title="Pending Reports" value={stats.pendingReports} icon={AlertTriangle} color="amber" />
        <StatCard title="Trust Alerts" value={stats.trustAlerts} icon={Activity} color="red" />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <Card title="Quick Actions" subtitle="High-trust actions for daily admin work.">
            <div className="space-y-3">
              <Button onClick={() => navigate('/admin/projects/create')} variant="secondary" className="justify-start">
                <Plus className="h-4 w-4 text-teal-200" />
                Create New Project
              </Button>
              <Button onClick={() => navigate('/admin/reports')} variant="secondary" className="justify-start">
                <AlertTriangle className="h-4 w-4 text-amber-200" />
                Review Reports
              </Button>
              <Button onClick={() => navigate('/admin/contractors')} variant="secondary" className="justify-start">
                <Users className="h-4 w-4 text-sky-200" />
                Manage Contractors
              </Button>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card title="Recent Activity" subtitle="Latest operational signals across projects, deliveries, and reports.">
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 rounded-[1.3rem] border border-white/8 bg-white/[0.03] px-4 py-4">
                    <div className={`rounded-2xl border p-3 ${activity.tone}`}>
                      <activity.icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-100">{activity.title}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {new Date(activity.time).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.4rem] border border-dashed border-white/10 px-6 py-12 text-center">
                  <Activity className="mx-auto mb-3 h-8 w-8 text-slate-600" />
                  <p className="text-sm text-slate-400">No recent activity found</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
