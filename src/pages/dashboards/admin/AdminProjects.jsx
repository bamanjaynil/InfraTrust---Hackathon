import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../components/DashboardLayout';
import { Plus, FolderKanban, Search, Filter, ExternalLink } from 'lucide-react';
import useAdminStore from '../../../store/adminStore';
import Card from '../../../components/Card';
import StatusBadge from '../../../components/StatusBadge';
import Button from '../../../components/Button';

const AdminProjects = () => {
  const navigate = useNavigate();
  const { projects, fetchProjects, updateProjectStatus, loading, error } = useAdminStore();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProjects(searchTerm);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, fetchProjects]);

  return (
    <DashboardLayout 
      title="Infrastructure Projects" 
      roleName="Administrator" 
      badgeColorClass="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search projects by name, location..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 pl-10 pr-4 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800 w-auto">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button
              onClick={() => navigate('/admin/projects/create')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Project
            </Button>
          </div>
        </div>
        
        <Card noPadding>
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-zinc-400 text-sm">Loading projects...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-400">
              <p>{error}</p>
              <Button onClick={() => fetchProjects()} className="mt-4 w-auto mx-auto">Retry</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-800">
                <thead className="bg-zinc-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Project Details</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Contractor</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 bg-zinc-900">
                  {projects.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <FolderKanban className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                        <p className="text-zinc-500">No projects found in the system</p>
                      </td>
                    </tr>
                  ) : (
                    projects.map((project) => (
                      <tr 
                        key={project.id} 
                        className="hover:bg-zinc-800/30 transition-colors group"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded bg-zinc-800 text-zinc-400 group-hover:text-emerald-500 transition-colors">
                              <FolderKanban className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-zinc-200">{project.name}</p>
                              <p className="text-xs text-zinc-500 mt-0.5">{project.length_km}km x {project.width_m}m • {project.road_type}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-zinc-300">{project.city}</p>
                          <p className="text-xs text-zinc-500 mt-0.5">{project.district}, {project.state}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400">
                              {(project.contractor_name || 'U').charAt(0)}
                            </div>
                            <span className="text-sm text-zinc-400">{project.contractor_name || 'Unassigned'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select 
                            value={project.status}
                            onChange={(e) => updateProjectStatus(project.id, e.target.value)}
                            className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs rounded px-2 py-1 focus:outline-none focus:border-emerald-500 transition-colors"
                          >
                            <option value="PLANNED">Planned</option>
                            <option value="ONGOING">Ongoing</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => navigate(`/admin/projects/${project.id}`)}
                              className="p-2 rounded hover:bg-zinc-800 text-zinc-400 hover:text-emerald-500 transition-colors"
                              title="View Details"
                            >
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
};

export default AdminProjects;
