import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../components/DashboardLayout';
import { FolderKanban, MapPin, Calendar, Activity, ArrowLeft, Truck, AlertTriangle } from 'lucide-react';
import useContractorStore from '../../../store/contractorStore';
import { useAuthStore } from '../../../store/authStore';
import Card from '../../../components/Card';
import Button from '../../../components/Button';

export default function ContractorProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { 
    contractorProjects, 
    deliveries, 
    projectReports,
    fetchContractorProjects, 
    fetchDeliveries,
    fetchProjectReports,
    loading 
  } = useContractorStore();

  useEffect(() => {
    if (user?.id) {
      if (contractorProjects.length === 0) {
        fetchContractorProjects();
      }
      fetchDeliveries();
      fetchProjectReports(id);
    }
  }, [user?.id, id, fetchContractorProjects, fetchDeliveries, fetchProjectReports, contractorProjects.length]);

  const project = useMemo(() => {
    return contractorProjects.find(p => p.id === id);
  }, [contractorProjects, id]);

  const projectDeliveries = useMemo(() => {
    return deliveries.filter(d => d.project_id === id);
  }, [deliveries, id]);

  const reports = useMemo(() => {
    return projectReports.filter(r => r.project_id === id);
  }, [projectReports, id]);

  if (loading && !project) {
    return (
      <DashboardLayout title="Project Details" roleName="Contractor" badgeColorClass="bg-blue-500/10 text-blue-500 border-blue-500/20">
        <div className="flex items-center justify-center h-64">
          <div className="text-zinc-500">Loading project details...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout title="Project Details" roleName="Contractor" badgeColorClass="bg-blue-500/10 text-blue-500 border-blue-500/20">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="text-zinc-500">Project not found.</div>
          <Button variant="outline" onClick={() => navigate('/contractor/projects')}>
            Back to Projects
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Project Details" 
      roleName="Contractor"
      badgeColorClass="bg-blue-500/10 text-blue-500 border-blue-500/20"
    >
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/contractor/projects')}
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold text-zinc-100">{project.name}</h2>
          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
            project.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
            project.status === 'ONGOING' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
            'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
          }`}>
            {project.status}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card title="Project Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-zinc-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-zinc-200">Location</p>
                      <p className="text-sm text-zinc-400">{project.city}, {project.district}, {project.state}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Activity className="w-5 h-5 text-zinc-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-zinc-200">Road Specifications</p>
                      <p className="text-sm text-zinc-400">Length: {project.length} km</p>
                      <p className="text-sm text-zinc-400">Width: {project.width} m</p>
                      <p className="text-sm text-zinc-400">Type: {project.road_type}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-zinc-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-zinc-200">Timeline</p>
                      <p className="text-sm text-zinc-400">Status: {project.status}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Material Requirements (BoQ)">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-center">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Bitumen</p>
                  <p className="text-xl font-bold text-zinc-200">{project.bitumen || 0} t</p>
                </div>
                <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-center">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Aggregate</p>
                  <p className="text-xl font-bold text-zinc-200">{project.aggregate || 0} t</p>
                </div>
                <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-center">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Cement</p>
                  <p className="text-xl font-bold text-zinc-200">{project.cement || 0} t</p>
                </div>
                <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-center">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Sand</p>
                  <p className="text-xl font-bold text-zinc-200">{project.sand || 0} t</p>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button onClick={() => navigate('/contractor/material-requests')}>
                  Request Materials
                </Button>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card title="Delivery Progress">
              <div className="space-y-4">
                {projectDeliveries.length > 0 ? (
                  projectDeliveries.slice(0, 5).map(delivery => (
                    <div key={delivery.id} className="flex items-center justify-between p-3 bg-zinc-900 border border-zinc-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Truck className="w-4 h-4 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium text-zinc-200">{delivery.material_type}</p>
                          <p className="text-xs text-zinc-500">{delivery.volume} tons</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                        delivery.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                        delivery.status === 'IN_TRANSIT' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                        'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
                      }`}>
                        {delivery.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-zinc-500 text-center py-4">No deliveries yet.</p>
                )}
                {projectDeliveries.length > 5 && (
                  <Button variant="outline" className="w-full" onClick={() => navigate('/contractor/deliveries')}>
                    View All Deliveries
                  </Button>
                )}
              </div>
            </Card>

            <Card title="Citizen Complaints">
              <div className="space-y-4">
                {reports.length > 0 ? (
                  reports.slice(0, 5).map(report => (
                    <div key={report.id} className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className={`w-4 h-4 ${report.status === 'OPEN' ? 'text-red-500' : 'text-emerald-500'}`} />
                          <span className="text-xs font-medium text-zinc-400">
                            {new Date(report.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                          report.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                          'bg-red-500/10 text-red-500 border-red-500/20'
                        }`}>
                          {report.status}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-300 line-clamp-2">{report.description}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-zinc-500 text-center py-4">No complaints reported.</p>
                )}
                {reports.length > 5 && (
                  <Button variant="outline" className="w-full" onClick={() => navigate('/contractor/reports')}>
                    View All Complaints
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
