import React, { useEffect, useState, useMemo } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import { AlertTriangle, Search, Filter } from 'lucide-react';
import useContractorStore from '../../../store/contractorStore';
import { useAuthStore } from '../../../store/authStore';
import Card from '../../../components/Card';
import Button from '../../../components/Button';

export default function ContractorReports() {
  const { user } = useAuthStore();
  const { contractorProjects, projectReports, fetchContractorProjects, fetchAllReports, loading } = useContractorStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchContractorProjects();
      fetchAllReports();
    }
  }, [user?.id, fetchContractorProjects, fetchAllReports]);

  const filteredReports = useMemo(() => {
    return projectReports.filter(report => {
      const matchesSearch = 
        report.project_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        report.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter ? report.status === statusFilter : true;
      return matchesSearch && matchesStatus;
    });
  }, [projectReports, searchQuery, statusFilter]);

  return (
    <DashboardLayout 
      title="Citizen Reports" 
      roleName="Contractor"
      badgeColorClass="bg-blue-500/10 text-blue-500 border-blue-500/20"
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Search reports..." 
                className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-blue-500 transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select 
              className="bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-blue-500 px-4 py-2"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="pb-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Report ID</th>
                  <th className="pb-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Project</th>
                  <th className="pb-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Description</th>
                  <th className="pb-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Date</th>
                  <th className="pb-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {loading && projectReports.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-zinc-500">Loading reports...</td>
                  </tr>
                ) : filteredReports.length > 0 ? (
                  filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-zinc-900 text-red-500">
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium text-zinc-200">{report.id.substring(0, 8)}...</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="text-sm text-zinc-400">{report.project_name}</span>
                      </td>
                      <td className="py-4">
                        <span className="text-sm text-zinc-400 max-w-xs truncate block" title={report.description}>
                          {report.description}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className="text-sm text-zinc-400">
                          {new Date(report.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                          report.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                          report.status === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                          'bg-red-500/10 text-red-500 border-red-500/20'
                        }`}>
                          {report.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-zinc-500">No citizen reports found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
