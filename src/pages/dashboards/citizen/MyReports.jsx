import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../../store/authStore';
import useCitizenStore from '../../../store/citizenStore';
import DashboardLayout from '../../../components/DashboardLayout';
import { FileText, AlertCircle, CheckCircle, Clock, MapPin } from 'lucide-react';
import { getMyReports } from '../../../services/reportService';
import { getProjectById } from '../../../services/projectService';

export default function MyReports() {
  const { user } = useAuthStore();
  const { citizenReports, setCitizenReports } = useCitizenStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await getMyReports();
        const reportsData = response.reports || [];
        
        const reportsWithProjects = await Promise.all(
          reportsData.map(async (report) => {
            if (!report.project_id) {
              return { ...report, projectName: 'General Road Issue' };
            }
            try {
              const projRes = await getProjectById(report.project_id);
              return { ...report, projectName: projRes.data?.project?.name || 'Unknown Project' };
            } catch (e) {
              return { ...report, projectName: 'Unknown Project' };
            }
          })
        );
        
        setCitizenReports(reportsWithProjects);
        setLoading(false);
      } catch (err) {
        setError('Failed to load your reports.');
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'RESOLVED': return <CheckCircle className="w-4 h-4 mr-1.5" />;
      case 'OPEN': return <Clock className="w-4 h-4 mr-1.5" />;
      case 'IN_REVIEW': return <AlertCircle className="w-4 h-4 mr-1.5" />;
      default: return <Clock className="w-4 h-4 mr-1.5" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'RESOLVED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'OPEN': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'IN_REVIEW': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
  };

  return (
    <DashboardLayout title="My Reports" roleName="Citizen" badgeColorClass="border-emerald-500/30 text-emerald-400">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
          <FileText className="w-6 h-6 text-emerald-500" />
          Your Submitted Reports
        </h2>
        <p className="text-zinc-400 mt-2">Track the status of the road issues you have reported.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      ) : citizenReports.length === 0 ? (
        <div className="bg-zinc-900/50 border border-zinc-800 p-12 rounded-xl text-center">
          <FileText className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-zinc-300 mb-2">No Reports Found</h3>
          <p className="text-zinc-500 max-w-md mx-auto">You haven't submitted any road issue reports yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {citizenReports.map((report) => (
            <div key={report.id} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:bg-zinc-800/50 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 pr-4">
                  <h3 className="text-lg font-bold text-zinc-100">{report.projectName}</h3>
                  <div className="flex items-center gap-2 text-sm text-zinc-400 mt-1 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>{report.latitude?.toFixed(4)}, {report.longitude?.toFixed(4)}</span>
                  </div>
                  <p className="text-zinc-200 font-medium">{report.description}</p>
                  <p className="text-sm text-zinc-500 mt-1">Reported on {new Date(report.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`px-3 py-1.5 inline-flex items-center text-xs font-medium rounded-full border whitespace-nowrap ${getStatusColor(report.status)}`}>
                  {getStatusIcon(report.status)}
                  {report.status}
                </span>
              </div>
              {report.photo_url && (
                <div className="mt-4 pt-4 border-t border-zinc-800/50">
                  <img src={report.photo_url} alt="Report evidence" className="h-32 w-auto rounded-lg object-cover" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
