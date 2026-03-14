import React, { useEffect } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import { AlertTriangle, ExternalLink, MessageSquare, MapPin, Search } from 'lucide-react';
import useAdminStore from '../../../store/adminStore';
import Card from '../../../components/Card';
import StatusBadge from '../../../components/StatusBadge';
import Button from '../../../components/Button';
import { useState } from 'react';

export default function AdminReports() {
  const { reports, fetchReports, updateReportStatus, loading, error } = useAdminStore();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchReports(searchTerm);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, fetchReports]);

  const handleStatusChange = async (reportId, newStatus) => {
    await updateReportStatus(reportId, newStatus);
  };

  return (
    <DashboardLayout 
      title="Citizen Reports" 
      roleName="Administrator"
      badgeColorClass="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search reports by description or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 pl-10 pr-4 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        <Card noPadding>
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-zinc-400 text-sm">Loading reports...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-400">
              <p>{error}</p>
              <Button onClick={() => fetchReports()} className="mt-4 w-auto mx-auto">Retry</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-800">
                <thead className="bg-zinc-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Report Info</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 bg-zinc-900">
                  {reports.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <MessageSquare className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                        <p className="text-zinc-500">No citizen reports found</p>
                      </td>
                    </tr>
                  ) : (
                    reports.map((report) => (
                      <tr key={report.id} className="hover:bg-zinc-800/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded bg-zinc-800 text-amber-500 mt-0.5">
                              <AlertTriangle className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-zinc-200 line-clamp-1">{report.description}</p>
                              <p className="text-xs text-zinc-500 mt-1 font-mono">ID: #{report.id.substring(0, 8)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-zinc-400">
                            <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                            <span className="text-sm">{report.city}, {report.district}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={report.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-zinc-500">{new Date(report.created_at).toLocaleDateString()}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-3">
                            <select 
                              className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-emerald-500 transition-colors"
                              value={report.status}
                              onChange={(e) => handleStatusChange(report.id, e.target.value)}
                            >
                              <option value="OPEN">Open</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="RESOLVED">Resolved</option>
                              <option value="REJECTED">Rejected</option>
                            </select>
                            <button className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors">
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
