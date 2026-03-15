import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../components/DashboardLayout';
import { Plus, FolderKanban, Search, Filter, ExternalLink } from 'lucide-react';
import useAdminStore from '../../../store/adminStore';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import StatusBadge from '../../../components/StatusBadge';

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
      badgeColorClass="border-teal-300/20 bg-teal-400/10 text-teal-100"
    >
      <div className="space-y-6">
        <section className="glass-panel rounded-[1.75rem] p-5 sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">Project registry</h2>
              <p className="mt-2 text-sm text-slate-400">Search, review, and update infrastructure records from a cleaner operations table.</p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">
              <div className="relative min-w-0 flex-1 xl:w-96">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search projects by name or location"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="min-h-12 w-full rounded-xl border border-white/10 bg-slate-950/55 py-3 pl-11 pr-4 text-sm text-slate-100 outline-none transition duration-200 placeholder:text-slate-500 focus:border-teal-300/45 focus:bg-slate-950/72 focus:ring-4 focus:ring-teal-400/10"
                />
              </div>
              <Button variant="secondary" fullWidth={false}>
                <Filter className="h-4 w-4" />
                Filter
              </Button>
              <Button onClick={() => navigate('/admin/projects/create')} fullWidth={false}>
                <Plus className="h-4 w-4" />
                Create Project
              </Button>
            </div>
          </div>
        </section>

        <Card noPadding className="overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="shimmer-line mx-auto mb-4 h-8 w-8 rounded-full" />
              <p className="text-sm text-slate-400">Loading projects...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center text-rose-200">
              <p>{error}</p>
              <Button onClick={() => fetchProjects()} className="mx-auto mt-4" fullWidth={false}>
                Retry
              </Button>
            </div>
          ) : (
            <div className="table-shell overflow-x-auto rounded-none border-0 bg-transparent shadow-none">
              <table className="min-w-full divide-y divide-white/8">
                <thead className="bg-white/[0.03]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Project Details</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Location</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Contractor</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/8 bg-slate-950/20">
                  {projects.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-16 text-center">
                        <FolderKanban className="mx-auto mb-4 h-12 w-12 text-slate-700" />
                        <p className="text-slate-400">No projects found in the system</p>
                      </td>
                    </tr>
                  ) : (
                    projects.map((project) => (
                      <tr key={project.id} className="transition-colors hover:bg-white/[0.03]">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="rounded-2xl border border-white/10 bg-white/6 p-3 text-slate-200">
                              <FolderKanban className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-100">{project.name}</p>
                              <p className="mt-1 text-xs text-slate-400">
                                {project.road_length}km x {project.road_width}m • {project.road_type}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-slate-200">{project.city}</p>
                          <p className="mt-1 text-xs text-slate-400">{project.district}, {project.state}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/8 text-[11px] font-semibold text-slate-200">
                              {(project.contractor_name || 'U').charAt(0)}
                            </div>
                            <span className="text-sm text-slate-300">{project.contractor_name || 'Unassigned'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col items-start gap-3">
                            <StatusBadge status={project.status} />
                            <select
                              value={project.status}
                              onChange={(e) => updateProjectStatus(project.id, e.target.value)}
                              className="rounded-xl border border-white/10 bg-slate-950/65 px-3 py-2 text-xs text-slate-200 outline-none transition focus:border-teal-300/40 focus:ring-4 focus:ring-teal-400/10"
                            >
                              <option value="OPEN_FOR_BIDDING">Open for Bidding</option>
                              <option value="ASSIGNED">Assigned</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="COMPLETED">Completed</option>
                            </select>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => navigate(`/admin/projects/${project.id}`)}
                            className="inline-flex rounded-xl border border-white/10 bg-white/6 p-2.5 text-slate-300 transition hover:border-teal-300/20 hover:bg-teal-400/10 hover:text-white"
                            title="View Details"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </button>
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
