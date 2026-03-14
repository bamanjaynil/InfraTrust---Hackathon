import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export default function ProjectCard({ project }) {
  const navigate = useNavigate();

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'IN_PROGRESS': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'DELAYED': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'PLANNED': return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
      default: return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle2 className="w-3 h-3 mr-1" />;
      case 'IN_PROGRESS': return <Clock className="w-3 h-3 mr-1" />;
      case 'DELAYED': return <AlertCircle className="w-3 h-3 mr-1" />;
      default: return null;
    }
  };

  return (
    <div 
      onClick={() => navigate(`/projects/${project.id}`)}
      className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 hover:bg-zinc-800/50 hover:border-zinc-700 transition-all cursor-pointer flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-zinc-100 line-clamp-2 flex-1 pr-4">
          {project.name}
        </h3>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center whitespace-nowrap ${getStatusColor(project.status)}`}>
          {getStatusIcon(project.status)}
          {project.status?.replace('_', ' ') || 'UNKNOWN'}
        </span>
      </div>

      <div className="space-y-2.5 flex-1">
        <div className="flex items-start gap-2 text-sm text-zinc-400">
          <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
          <span className="line-clamp-2">{project.city}, {project.district}, {project.state}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Calendar className="w-4 h-4 shrink-0" />
          <span>
            Created: {new Date(project.created_at || Date.now()).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-zinc-800/50 flex justify-between items-center">
        <div className="text-sm">
          <span className="text-zinc-500">Type: </span>
          <span className="font-medium text-zinc-300">{project.road_type}</span>
        </div>
        <div className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
          View Details →
        </div>
      </div>
    </div>
  );
}
