import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../components/DashboardLayout';
import { FolderKanban, Search, Filter } from 'lucide-react';
import useContractorStore from '../../../store/contractorStore';
import { useAuthStore } from '../../../store/authStore';
import Card from '../../../components/Card';
import Button from '../../../components/Button';

export default function ContractorProjects() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { contractorProjects, fetchContractorProjects, loading } = useContractorStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchContractorProjects({ search: searchQuery, status: statusFilter });
    }
  }, [user?.id, fetchContractorProjects, searchQuery, statusFilter]);

  return (
    <DashboardLayout 
      title="My Projects" 
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
                placeholder="Search projects..." 
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
              <option value="PLANNED">Planned</option>
              <option value="ONGOING">Ongoing</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="pb-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Project Name</th>
                  <th className="pb-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Location</th>
                  <th className="pb-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Road Length</th>
                  <th className="pb-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                  <th className="pb-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Completion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-zinc-500">Loading projects...</td>
                  </tr>
                ) : contractorProjects.length > 0 ? (
                  contractorProjects.map((project) => (
                    <tr 
                      key={project.id} 
                      className="hover:bg-zinc-800/30 transition-colors cursor-pointer group"
                      onClick={() => navigate(`/contractor/projects/${project.id}`)}
                    >
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-zinc-900 text-blue-500 group-hover:bg-blue-500/10 transition-colors">
                            <FolderKanban className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium text-zinc-200">{project.name}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="text-sm text-zinc-400">{project.city}, {project.district}</span>
                      </td>
                      <td className="py-4">
                        <span className="text-sm text-zinc-400">{project.length} km</span>
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                          project.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                          project.status === 'ONGOING' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                          'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
                        }`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full" 
                              style={{ width: `${project.status === 'COMPLETED' ? 100 : project.status === 'ONGOING' ? 50 : 0}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-zinc-400 w-8">
                            {project.status === 'COMPLETED' ? '100%' : project.status === 'ONGOING' ? '50%' : '0%'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-zinc-500">No projects found.</td>
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
