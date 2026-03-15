import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Calendar, CheckCircle2, AlertCircle, Clock3, MapPin } from 'lucide-react';

export default function ProjectCard({ project }) {
  const navigate = useNavigate();

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200';
      case 'IN_PROGRESS':
      case 'ACTIVE':
      case 'ONGOING':
      case 'ASSIGNED':
        return 'border-sky-400/20 bg-sky-400/10 text-sky-200';
      case 'OPEN_FOR_BIDDING':
        return 'border-amber-400/20 bg-amber-400/10 text-amber-200';
      case 'DELAYED':
      case 'FAILED':
        return 'border-rose-400/20 bg-rose-400/10 text-rose-200';
      case 'PLANNED':
        return 'border-white/12 bg-white/6 text-slate-300';
      default:
        return 'border-white/12 bg-white/6 text-slate-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className="mr-1 h-3.5 w-3.5" />;
      case 'IN_PROGRESS':
      case 'ACTIVE':
      case 'ONGOING':
      case 'ASSIGNED':
        return <Clock3 className="mr-1 h-3.5 w-3.5" />;
      case 'OPEN_FOR_BIDDING':
        return <Clock3 className="mr-1 h-3.5 w-3.5" />;
      case 'DELAYED':
      case 'FAILED':
        return <AlertCircle className="mr-1 h-3.5 w-3.5" />;
      default:
        return null;
    }
  };

  return (
    <button
      type="button"
      onClick={() => navigate(`/projects/${project.id}`)}
      className="glass-panel surface-hover group flex h-full w-full flex-col overflow-hidden rounded-[1.75rem] p-6 text-left"
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="mb-3 inline-flex rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">
            {project.road_type || 'Road Project'}
          </div>
          <h3 className="text-xl font-semibold leading-tight text-slate-50">{project.name}</h3>
        </div>
        <span
          className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${getStatusColor(project.status)}`}
        >
          {getStatusIcon(project.status)}
          {project.status?.replace('_', ' ') || 'UNKNOWN'}
        </span>
      </div>

      <div className="space-y-3 text-sm text-slate-400">
        <div className="flex items-start gap-3">
          <div className="rounded-xl border border-white/10 bg-white/6 p-2 text-slate-200">
            <MapPin className="h-4 w-4" />
          </div>
          <span className="line-clamp-2">
            {project.city}, {project.district}, {project.state}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-white/10 bg-white/6 p-2 text-slate-200">
            <Calendar className="h-4 w-4" />
          </div>
          <span>Created {new Date(project.created_at || Date.now()).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-white/8 pt-5">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Transparency View</p>
          <p className="mt-1 text-sm text-slate-300">Audit details, location, and material data</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-teal-200 transition-transform duration-200 group-hover:translate-x-1">
          View
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </button>
  );
}
