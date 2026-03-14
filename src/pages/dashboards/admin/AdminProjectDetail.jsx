import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../components/DashboardLayout';
import { 
  FolderKanban, 
  MapPin, 
  Calendar, 
  User, 
  Activity, 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  ArrowLeft,
  Truck,
  BarChart3
} from 'lucide-react';
import adminService from '../../../services/adminService';
import StatusBadge from '../../../components/StatusBadge';

export default function AdminProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await adminService.getProjectById(id);
        setProject(response.data);
      } catch (err) {
        setError('Failed to fetch project details');
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      await adminService.updateProjectStatus(id, newStatus);
      setProject({ ...project, project: { ...project.project, status: newStatus } });
    } catch (err) {
      setError('Failed to update status');
    }
  };

  if (loading) return <DashboardLayout title="Loading..."><div className="text-center py-12 text-zinc-500">Loading project details...</div></DashboardLayout>;
  if (error) return <DashboardLayout title="Error"><div className="text-center py-12 text-red-500">{error}</div></DashboardLayout>;
  if (!project || !project.project) return <DashboardLayout title="Not Found"><div className="text-center py-12 text-zinc-500">Project not found</div></DashboardLayout>;

  const { project: projectData, boq, deliveries } = project;

  return (
    <DashboardLayout title={`Project: ${projectData.name}`}>
      <button 
        onClick={() => navigate('/admin/projects')}
        className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Projects
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Project Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Overview Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-zinc-100">{projectData.name}</h2>
                <div className="flex items-center gap-2 text-zinc-400 mt-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{projectData.city}, {projectData.district}, {projectData.state}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge status={projectData.status} />
                <select 
                  className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  value={projectData.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                >
                  <option value="PLANNED">Planned</option>
                  <option value="ONGOING">Ongoing</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <InfoItem icon={Calendar} label="Created" value={new Date(projectData.created_at).toLocaleDateString()} />
              <InfoItem icon={User} label="Contractor" value={projectData.contractor_name || 'Unassigned'} />
              <InfoItem icon={Activity} label="Type" value={projectData.road_type} />
              <InfoItem icon={BarChart3} label="Length" value={`${projectData.length} m`} />
            </div>
          </div>

          {/* BoQ Section */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-zinc-200 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-500" />
              Bill of Quantities (AI Estimated)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <BoQItem label="Bitumen" value={boq?.bitumen?.toFixed(2)} unit="Units" />
              <BoQItem label="Aggregate" value={boq?.aggregate?.toFixed(2)} unit="Units" />
              <BoQItem label="Cement" value={boq?.cement?.toFixed(2)} unit="Units" />
              <BoQItem label="Sand" value={boq?.sand?.toFixed(2)} unit="Units" />
              <div className="md:col-span-2 bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-4 flex justify-between items-center">
                <span className="text-sm text-emerald-500 font-medium">Estimated Budget</span>
                <span className="text-xl font-bold text-emerald-400">₹{parseFloat(boq?.estimated_cost || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Deliveries Section */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-zinc-200 mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-500" />
              Delivery Tracking
            </h3>
            {deliveries && deliveries.length > 0 ? (
              <div className="space-y-3">
                {deliveries.map(d => (
                  <div key={d.id} className="flex justify-between items-center p-3 bg-zinc-800/50 rounded-lg border border-zinc-800">
                    <div>
                      <p className="text-sm font-medium text-zinc-200">{d.material_type}</p>
                      <p className="text-xs text-zinc-500">{d.volume} units • {new Date(d.timestamp).toLocaleDateString()}</p>
                    </div>
                    <StatusBadge status={d.status} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-zinc-500 text-sm">
                No deliveries recorded for this project yet.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Citizen Reports & Timeline */}
        <div className="space-y-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-zinc-200 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Citizen Reports
            </h3>
            <div className="space-y-4">
              <p className="text-zinc-500 text-sm text-center py-4">No reports filed for this project.</p>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-zinc-200 mb-4">Project Timeline</h3>
            <div className="space-y-4">
              <TimelineItem status="PLANNED" date={projectData.created_at} active={true} />
              <TimelineItem status="ONGOING" date={null} active={projectData.status === 'ONGOING'} />
              <TimelineItem status="COMPLETED" date={null} active={projectData.status === 'COMPLETED'} />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-zinc-500 mb-1">
        <Icon className="w-4 h-4" />
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-sm text-zinc-200 font-semibold">{value}</p>
    </div>
  );
}

function BoQItem({ label, value, unit }) {
  return (
    <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-800">
      <p className="text-xs text-zinc-500 mb-1">{label}</p>
      <p className="text-lg font-bold text-zinc-200">{value} <span className="text-xs font-normal text-zinc-500">{unit}</span></p>
    </div>
  );
}

function TimelineItem({ status, date, active }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full ${active ? 'bg-emerald-500' : 'bg-zinc-800'}`} />
        <div className="w-0.5 h-full bg-zinc-800" />
      </div>
      <div>
        <p className={`text-sm font-medium ${active ? 'text-zinc-200' : 'text-zinc-500'}`}>{status}</p>
        {date && <p className="text-xs text-zinc-500">{new Date(date).toLocaleDateString()}</p>}
      </div>
    </div>
  );
}
