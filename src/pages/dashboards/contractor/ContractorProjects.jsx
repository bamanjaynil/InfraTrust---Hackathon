import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../components/DashboardLayout';
import { FolderKanban, Search, Send, FileText } from 'lucide-react';
import useContractorStore from '../../../store/contractorStore';
import { useAuthStore } from '../../../store/authStore';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import StatusBadge from '../../../components/StatusBadge';

export default function ContractorProjects() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    openProjects,
    myApplications,
    assignedProjects,
    fetchContractorProjects,
    applyToProject,
    loading,
  } = useContractorStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [bidDrafts, setBidDrafts] = useState({});
  const [proposalDrafts, setProposalDrafts] = useState({});

  useEffect(() => {
    if (user?.id) {
      fetchContractorProjects({ search: searchQuery });
    }
  }, [user?.id, fetchContractorProjects, searchQuery]);

  const handleApply = async (projectId) => {
    const bidAmount = Number(bidDrafts[projectId]);
    if (!bidAmount) {
      return;
    }

    await applyToProject(projectId, {
      bid_amount: bidAmount,
      proposal_text: proposalDrafts[projectId] || '',
    });
  };

  return (
    <DashboardLayout
      title="Project Marketplace"
      roleName="Contractor"
      badgeColorClass="border-sky-300/20 bg-sky-400/10 text-sky-100"
    >
      <div className="space-y-6">
        <section className="glass-panel rounded-[1.75rem] p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">Bidding and assignments</h2>
              <p className="mt-2 text-sm text-slate-400">Track open tenders, submitted applications, and already assigned work from one place.</p>
            </div>
            <div className="relative min-w-0 flex-1 lg:w-72">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search projects..."
                className="min-h-12 w-full rounded-xl border border-white/10 bg-slate-950/55 py-3 pl-11 pr-4 text-sm text-slate-100 outline-none transition duration-200 placeholder:text-slate-500 focus:border-sky-300/45 focus:bg-slate-950/72 focus:ring-4 focus:ring-sky-400/10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-3">
          <Card title="Open Projects" subtitle="Apply to road projects that are still open for bidding.">
            <div className="space-y-4">
              {openProjects.length === 0 ? (
                <p className="text-sm text-slate-400">No open projects found.</p>
              ) : (
                openProjects.map((project) => (
                  <div key={project.id} className="rounded-[1.3rem] border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-slate-100">{project.name}</p>
                        <p className="mt-1 text-xs text-slate-400">{project.city}, {project.district}</p>
                      </div>
                      <StatusBadge status={project.status} />
                    </div>
                    <p className="mt-3 text-xs text-slate-400">
                      {project.road_length} km x {project.road_width} m • Soil: {project.soil_type}
                    </p>
                    <div className="mt-4 space-y-3">
                      <input
                        type="number"
                        placeholder="Bid amount"
                        value={bidDrafts[project.id] || ''}
                        onChange={(e) => setBidDrafts((prev) => ({ ...prev, [project.id]: e.target.value }))}
                        className="w-full rounded-xl border border-white/10 bg-slate-950/55 px-4 py-3 text-sm text-slate-100 outline-none focus:border-sky-300/45 focus:ring-4 focus:ring-sky-400/10"
                      />
                      <textarea
                        rows="3"
                        placeholder="Proposal summary"
                        value={proposalDrafts[project.id] || ''}
                        onChange={(e) => setProposalDrafts((prev) => ({ ...prev, [project.id]: e.target.value }))}
                        className="w-full rounded-xl border border-white/10 bg-slate-950/55 px-4 py-3 text-sm text-slate-100 outline-none focus:border-sky-300/45 focus:ring-4 focus:ring-sky-400/10"
                      />
                      <Button onClick={() => handleApply(project.id)} disabled={loading}>
                        <Send className="h-4 w-4" />
                        Apply
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card title="My Applications" subtitle="Live status of your submitted bids.">
            <div className="space-y-4">
              {myApplications.length === 0 ? (
                <p className="text-sm text-slate-400">You have not submitted any applications yet.</p>
              ) : (
                myApplications.map((application) => (
                  <div key={application.id} className="rounded-[1.3rem] border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-slate-100">{application.project_name}</p>
                        <p className="mt-1 text-xs text-slate-400">
                          {application.city}, {application.district}
                        </p>
                      </div>
                      <StatusBadge status={application.status} />
                    </div>
                    <p className="mt-3 text-xs text-slate-400">Bid: Rs {Number(application.bid_amount || 0).toLocaleString()}</p>
                    {application.proposal_text && <p className="mt-2 text-sm text-slate-300">{application.proposal_text}</p>}
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card title="Assigned Projects" subtitle="Projects already approved for your execution team.">
            <div className="space-y-4">
              {assignedProjects.length === 0 ? (
                <p className="text-sm text-slate-400">No projects have been assigned yet.</p>
              ) : (
                assignedProjects.map((project) => (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => navigate(`/contractor/projects/${project.id}`)}
                    className="surface-hover flex w-full items-center justify-between gap-4 rounded-[1.3rem] border border-white/8 bg-white/[0.03] p-4 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl border border-white/10 bg-white/6 p-3 text-sky-200">
                        <FolderKanban className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-100">{project.name}</p>
                        <p className="mt-1 text-xs text-slate-400">{project.city}, {project.district}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={project.status} />
                      <FileText className="h-4 w-4 text-slate-600" />
                    </div>
                  </button>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
