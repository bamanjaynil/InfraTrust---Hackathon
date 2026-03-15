import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjectById, updateProjectStatus } from '../../services/projectService';
import DashboardLayout from '../../components/DashboardLayout';
import { ArrowLeft, Lock, MapPin, Ruler, Layers, Truck, Calendar, Activity, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const userRole = useAuthStore((state) => state.role);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await getProjectById(id);
        setData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch project details');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      await updateProjectStatus(id, newStatus);
      setData(prev => ({
        ...prev,
        project: { ...prev.project, status: newStatus }
      }));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const content = () => {
    if (loading) return <div className="p-6 text-zinc-400">Loading project details...</div>;
    if (error) return <div className="p-6 text-red-400">{error}</div>;
    if (!data) return <div className="p-6 text-zinc-400">Project not found</div>;

    const { project, boq, deliveries = [], reports = [] } = data;
    const canUpdateStatus = userRole === 'ADMIN' || userRole === 'CONTRACTOR';

    const getStatusIcon = (status) => {
      switch (status) {
        case 'ASSIGNED':
        case 'IN_PROGRESS': return <Activity className="w-4 h-4 mr-1.5" />;
        case 'COMPLETED': return <CheckCircle className="w-4 h-4 mr-1.5" />;
        case 'OPEN_FOR_BIDDING': return <Clock className="w-4 h-4 mr-1.5" />;
        default: return <Clock className="w-4 h-4 mr-1.5" />;
      }
    };

    const getStatusColor = (status) => {
      switch (status) {
        case 'ASSIGNED':
        case 'IN_PROGRESS': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        case 'COMPLETED': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        case 'OPEN_FOR_BIDDING': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        default: return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      }
    };

    const getProgressPercentage = () => {
      if (project.status === 'COMPLETED') return 100;
      if (project.status === 'OPEN_FOR_BIDDING') return 5;
      
      const start = new Date(project.start_date || project.created_at).getTime();
      const end = new Date(project.end_date || new Date(start + 90 * 24 * 60 * 60 * 1000)).getTime();
      const now = new Date().getTime();
      
      if (now < start) return 0;
      if (now > end) return 95; // Almost done but delayed
      
      const total = end - start;
      const elapsed = now - start;
      return Math.min(Math.round((elapsed / total) * 100), 95);
    };

    const progress = getProgressPercentage();

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-zinc-100">{project.name}</h1>
          </div>
          <span className={`px-3 py-1.5 inline-flex items-center text-sm font-medium rounded-full border ${getStatusColor(project.status)}`}>
            {getStatusIcon(project.status)}
            {project.status}
          </span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex justify-between items-end mb-2">
            <h3 className="text-sm font-medium text-zinc-300">Project Progress</h3>
            <span className="text-lg font-bold text-emerald-400">{progress}%</span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-2.5 mb-1">
            <div 
              className={`h-2.5 rounded-full ${project.status === 'FAILED' ? 'bg-red-500' : 'bg-emerald-500'}`} 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-zinc-500 text-right">Estimated based on timeline</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Project Information */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-zinc-100 mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-500" />
                Project Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-zinc-500 flex items-center gap-2"><Truck className="w-4 h-4" /> Contractor</p>
                  <p className="font-medium text-zinc-200">{project.contractor_name || 'Unassigned'}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-zinc-500 flex items-center gap-2"><Calendar className="w-4 h-4" /> Created Date</p>
                  <p className="font-medium text-zinc-200">{new Date(project.created_at).toLocaleDateString()}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-zinc-500 flex items-center gap-2"><Ruler className="w-4 h-4" /> Dimensions</p>
                  <p className="font-medium text-zinc-200">{project.road_length || project.length}km <span className="text-zinc-600">x</span> {project.road_width || project.width}m</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-zinc-500 flex items-center gap-2"><Layers className="w-4 h-4" /> Road Type</p>
                  <p className="font-medium text-zinc-200">{project.road_type}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-zinc-500 flex items-center gap-2"><Layers className="w-4 h-4" /> Soil Type</p>
                  <p className="font-medium text-zinc-200">{project.soil_type}</p>
                </div>
              </div>

            <div className="mt-8 pt-6 border-t border-zinc-800">
              <h3 className="text-sm font-medium text-zinc-300 mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-500" />
                  Coordinates
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-zinc-950/50 p-3 rounded-lg border border-zinc-800/50">
                    <span className="text-zinc-500 block mb-1">Start Point</span>
                    <span className="font-mono text-zinc-300">{project.start_lat}, {project.start_lng}</span>
                  </div>
                  <div className="bg-zinc-950/50 p-3 rounded-lg border border-zinc-800/50">
                    <span className="text-zinc-500 block mb-1">End Point</span>
                    <span className="font-mono text-zinc-300">{project.end_lat}, {project.end_lng}</span>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-zinc-100 mb-4">Transparency Snapshot</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
                  <p className="text-xs uppercase tracking-wider text-zinc-500">Assigned Contractor</p>
                  <p className="mt-2 text-sm text-zinc-200">{project.contractor_name || 'Not assigned yet'}</p>
                </div>
                <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
                  <p className="text-xs uppercase tracking-wider text-zinc-500">Delivery History</p>
                  <p className="mt-2 text-sm text-zinc-200">{deliveries.length} recorded deliveries</p>
                </div>
                <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
                  <p className="text-xs uppercase tracking-wider text-zinc-500">Citizen Issues</p>
                  <p className="mt-2 text-sm text-zinc-200">{reports.length} reported issues</p>
                </div>
              </div>
            </div>
          </div>

            {/* Status Management (Admin/Contractor only) */}
            {canUpdateStatus && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-zinc-100 mb-4">Manage Status</h2>
                <div className="flex flex-wrap gap-3">
                  {['OPEN_FOR_BIDDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'].map(status => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      disabled={updating || project.status === status}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2
                        ${project.status === status 
                          ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50' 
                          : 'bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-zinc-700'}`}
                    >
                      {getStatusIcon(status)}
                      Set {status}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bill of Quantities */}
          <div className="lg:col-span-1">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 sticky top-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-zinc-100">Bill of Quantities</h2>
                {boq?.locked && (
                  <span className="text-xs font-medium bg-zinc-800 text-zinc-400 px-2 py-1 rounded flex items-center border border-zinc-700">
                    <Lock className="w-3 h-3 mr-1" />
                    Locked
                  </span>
                )}
              </div>

              {boq ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/50">
                    <span className="text-zinc-400">Bitumen</span>
                    <span className="font-medium text-zinc-200">{boq.bitumen} <span className="text-zinc-500 text-sm">units</span></span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/50">
                    <span className="text-zinc-400">Aggregate</span>
                    <span className="font-medium text-zinc-200">{boq.aggregate} <span className="text-zinc-500 text-sm">units</span></span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/50">
                    <span className="text-zinc-400">Cement</span>
                    <span className="font-medium text-zinc-200">{boq.cement} <span className="text-zinc-500 text-sm">units</span></span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/50">
                    <span className="text-zinc-400">Sand</span>
                    <span className="font-medium text-zinc-200">{boq.sand} <span className="text-zinc-500 text-sm">units</span></span>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-zinc-800">
                    <div className="flex flex-col gap-2">
                      <span className="text-zinc-500 text-sm">Estimated Total Cost</span>
                      <span className="text-3xl font-bold text-emerald-400">₹{Number(boq.estimated_cost).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 bg-zinc-950/50 rounded-lg border border-zinc-800/50 border-dashed">
                  <Layers className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
                  <p className="text-zinc-500 text-sm">No BoQ generated for this project.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getRoleName = () => {
    if (userRole === 'ADMIN') return 'Admin';
    if (userRole === 'CONTRACTOR') return 'Contractor';
    if (userRole === 'CITIZEN') return 'Citizen';
    return 'User';
  };

  const getBadgeColor = () => {
    if (userRole === 'ADMIN') return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    if (userRole === 'CONTRACTOR') return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    if (userRole === 'CITIZEN') return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
  };

  return (
    <DashboardLayout 
      title="Project Details" 
      roleName={getRoleName()} 
      badgeColorClass={getBadgeColor()}
    >
      {content()}
    </DashboardLayout>
  );
};

export default ProjectDetail;
