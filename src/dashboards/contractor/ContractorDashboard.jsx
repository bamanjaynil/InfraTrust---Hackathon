import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { FolderKanban, Truck, AlertTriangle, Activity, ArrowRight, FileText } from 'lucide-react';
import useContractorStore from '../../store/contractorStore';
import { useAuthStore } from '../../store/authStore';
import StatCard from '../../components/StatCard';
import Card from '../../components/Card';
import Button from '../../components/Button';

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
    loading 
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
      activeProjects: safeProjects.filter(p => p.status === 'ONGOING').length,
      pendingDeliveries: safeDeliveries.filter(d => d.status === 'ASSIGNED' || d.status === 'IN_TRANSIT').length,
      citizenComplaints: safeReports.filter(r => r.status === 'OPEN').length
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
      badgeColorClass="bg-blue-500/10 text-blue-500 border-blue-500/20"
    >
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-zinc-100">Welcome back, {user?.name}</h2>
            <p className="text-zinc-500 text-sm mt-1">Here is your infrastructure overview.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Assigned Projects" value={stats.assignedProjects} icon={FolderKanban} color="blue" />
          <StatCard title="Active Projects" value={stats.activeProjects} icon={Activity} color="emerald" />
          <StatCard title="Pending Deliveries" value={stats.pendingDeliveries} icon={Truck} color="amber" />
          <StatCard title="Citizen Complaints" value={stats.citizenComplaints} icon={AlertTriangle} color="red" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card title="Recent Project Updates">
            <div className="space-y-4">
              {loading && contractorProjects.length === 0 ? (
                <div className="text-center py-8 text-zinc-500">Loading projects...</div>
              ) : recentProjects.length > 0 ? (
                recentProjects.map((project) => (
                  <div 
                    key={project.id} 
                    className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/contractor/projects/${project.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-zinc-900 text-blue-500">
                        <FolderKanban className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-200">{project.name}</p>
                        <p className="text-xs text-zinc-500">{project.city}, {project.district}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                        project.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                        project.status === 'ONGOING' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                        'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
                      }`}>
                        {project.status}
                      </div>
                      <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-zinc-500">No projects found.</div>
              )}
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => navigate('/contractor/projects')}
              >
                View All Projects
              </Button>
            </div>
          </Card>

          <Card title="Recent Deliveries">
            <div className="space-y-4">
              {loading && deliveries.length === 0 ? (
                <div className="text-center py-8 text-zinc-500">Loading deliveries...</div>
              ) : recentDeliveries.length > 0 ? (
                recentDeliveries.map((delivery) => (
                  <div 
                    key={delivery.id} 
                    className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer group"
                    onClick={() => navigate('/contractor/deliveries')}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-zinc-900 text-amber-500">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-200">{delivery.material_type}</p>
                        <p className="text-xs text-zinc-500">{delivery.project_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                        delivery.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                        delivery.status === 'IN_TRANSIT' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                        'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
                      }`}>
                        {delivery.status}
                      </div>
                      <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-zinc-500">No deliveries found.</div>
              )}
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => navigate('/contractor/deliveries')}
              >
                View All Deliveries
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
