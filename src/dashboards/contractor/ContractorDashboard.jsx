import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { FolderKanban, Truck, AlertTriangle, Activity, ArrowRight, FileText } from 'lucide-react';
import useContractorStore from '../../store/contractorStore';
import { useAuthStore } from '../../store/authStore';
import StatCard from '../../components/StatCard';
import Card from '../../components/Card';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';

export default function ContractorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    contractorProjects,
    deliveries,
    projectReports,
    fetchContractorProjects,
    fetchDeliveries,
    fetchAllReports,
    loading,
  } = useContractorStore();

  useEffect(() => {
    if (user?.id) {
      fetchContractorProjects();
      fetchDeliveries();
      fetchAllReports();
    }
  }, [user?.id, fetchContractorProjects, fetchDeliveries, fetchAllReports]);

  const stats = useMemo(() => {
    const safeProjects = Array.isArray(contractorProjects) ? contractorProjects : [];
    const safeDeliveries = Array.isArray(deliveries) ? deliveries : [];
    const safeReports = Array.isArray(projectReports) ? projectReports : [];

    return {
      assignedProjects: safeProjects.length,
      activeProjects: safeProjects.filter((p) => p.status === 'ASSIGNED' || p.status === 'IN_PROGRESS').length,
      pendingDeliveries: safeDeliveries.filter((d) => d.status === 'ASSIGNED' || d.status === 'IN_TRANSIT').length,
      citizenComplaints: safeReports.filter((r) => r.status === 'OPEN').length,
    };
  }, [contractorProjects, deliveries, projectReports]);

  const recentProjects = useMemo(() => {
    const safeProjects = Array.isArray(contractorProjects) ? contractorProjects : [];
    return safeProjects.slice(0, 5);
  }, [contractorProjects]);

  const recentDeliveries = useMemo(() => {
    const safeDeliveries = Array.isArray(deliveries) ? deliveries : [];
    return safeDeliveries.slice(0, 5);
  }, [deliveries]);

  return (
    <DashboardLayout
      title="Contractor Dashboard"
      roleName="Contractor"
      badgeColorClass="border-sky-300/20 bg-sky-400/10 text-sky-100"
    >
      <div className="space-y-8">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_60px_rgba(2,6,23,0.32)] backdrop-blur-xl sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-sky-200/80">Delivery Operations</p>
              <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Welcome back, {user?.name}</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Monitor your assigned work, coordinate deliveries, and stay ahead of public issues without losing clarity in the noise.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/35 p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Today&apos;s Snapshot</p>
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Projects live</span>
                  <span className="font-semibold text-slate-50">{stats.activeProjects}</span>
                </div>
                <div className="h-px bg-white/8" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Deliveries in motion</span>
                  <span className="font-semibold text-slate-50">{stats.pendingDeliveries}</span>
                </div>
                <div className="h-px bg-white/8" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Open complaints</span>
                  <span className="font-semibold text-slate-50">{stats.citizenComplaints}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Assigned Projects" value={stats.assignedProjects} icon={FolderKanban} color="blue" />
          <StatCard title="Active Projects" value={stats.activeProjects} icon={Activity} color="emerald" />
          <StatCard title="Pending Deliveries" value={stats.pendingDeliveries} icon={Truck} color="amber" />
          <StatCard title="Citizen Complaints" value={stats.citizenComplaints} icon={AlertTriangle} color="red" />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <Card title="Recent Project Updates" subtitle="Tap into current progress and jump into details quickly.">
            <div className="space-y-4">
              {loading && contractorProjects.length === 0 ? (
                <div className="rounded-[1.4rem] border border-dashed border-white/10 px-6 py-10 text-center text-slate-400">
                  Loading projects...
                </div>
              ) : recentProjects.length > 0 ? (
                recentProjects.map((project) => (
                  <button
                    key={project.id}
                    type="button"
                    className="surface-hover flex w-full items-center justify-between gap-4 rounded-[1.35rem] border border-white/8 bg-white/[0.03] p-4 text-left"
                    onClick={() => navigate(`/contractor/projects/${project.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-3 text-sky-200">
                        <FolderKanban className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-100">{project.name}</p>
                        <p className="mt-1 text-xs text-slate-400">{project.city}, {project.district}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <StatusBadge status={project.status} />
                      <ArrowRight className="h-4 w-4 text-slate-600 transition-colors group-hover:text-slate-300" />
                    </div>
                  </button>
                ))
              ) : (
                <div className="rounded-[1.4rem] border border-dashed border-white/10 px-6 py-10 text-center text-slate-400">
                  No projects found.
                </div>
              )}
              <Button variant="outline" onClick={() => navigate('/contractor/projects')}>
                <FileText className="h-4 w-4" />
                View All Projects
              </Button>
            </div>
          </Card>

          <Card title="Recent Deliveries" subtitle="Fast visibility into material movement and current delivery state.">
            <div className="space-y-4">
              {loading && deliveries.length === 0 ? (
                <div className="rounded-[1.4rem] border border-dashed border-white/10 px-6 py-10 text-center text-slate-400">
                  Loading deliveries...
                </div>
              ) : recentDeliveries.length > 0 ? (
                recentDeliveries.map((delivery) => (
                  <button
                    key={delivery.id}
                    type="button"
                    className="surface-hover flex w-full items-center justify-between gap-4 rounded-[1.35rem] border border-white/8 bg-white/[0.03] p-4 text-left"
                    onClick={() => navigate('/contractor/deliveries')}
                  >
                    <div className="flex items-center gap-4">
                      <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-3 text-amber-200">
                        <Truck className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-100">{delivery.material_type}</p>
                        <p className="mt-1 text-xs text-slate-400">{delivery.project_name}</p>
                      </div>
                    </div>
                    <StatusBadge status={delivery.status} />
                  </button>
                ))
              ) : (
                <div className="rounded-[1.4rem] border border-dashed border-white/10 px-6 py-10 text-center text-slate-400">
                  No deliveries found.
                </div>
              )}
              <Button variant="outline" onClick={() => navigate('/contractor/deliveries')}>
                <Truck className="h-4 w-4" />
                View All Deliveries
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
