import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import useCitizenStore from '../../../store/citizenStore';
import { getAreaProjects, getNearbyProjects, getAllProjects } from '../../../services/projectService';
import DashboardLayout from '../../../components/DashboardLayout';
import ProjectCard from '../../../components/ProjectCard';
import { MapPin, Navigation, Globe, Search, Filter, AlertCircle } from 'lucide-react';
import Button from '../../../components/Button';

export default function Projects() {
  const location = useLocation();
  const { user } = useAuthStore();
  const { citizenProjects, setCitizenProjects, userLocation } = useCitizenStore();
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'area');

  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [radius, setRadius] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state?.tab]);

  const fetchProjects = async () => {
    setLoading(true);
    setError('');
    try {
      let response;
      if (activeTab === 'area') {
        if (user?.district && user?.city) {
          response = await getAreaProjects(user.district, user.city);
          setCitizenProjects(response.projects || []);
        } else {
          setError('Please update your profile with your district and city to see area projects.');
          setCitizenProjects([]);
        }
      } else if (activeTab === 'nearby') {
        const lat = userLocation?.latitude || user?.latitude;
        const lng = userLocation?.longitude || user?.longitude;
        if (lat && lng) {
          response = await getNearbyProjects(lat, lng, radius);
          setCitizenProjects(response.projects || []);
        } else {
          setError('Location not available. Please update your profile with GPS coordinates or use Auto Detect GPS in Report Road Issue.');
          setCitizenProjects([]);
        }
      } else if (activeTab === 'all') {
        response = await getAllProjects();
        setCitizenProjects(response.projects || []);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load projects.');
      setCitizenProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [activeTab, user, userLocation, radius]);

  useEffect(() => {
    let result = citizenProjects;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(term) ||
          p.city?.toLowerCase().includes(term) ||
          p.district?.toLowerCase().includes(term) ||
          p.state?.toLowerCase().includes(term)
      );
    }

    if (stateFilter) {
      result = result.filter((p) => p.state === stateFilter);
    }

    if (statusFilter) {
      result = result.filter((p) => p.status === statusFilter);
    }

    setFilteredProjects(result);
  }, [searchTerm, stateFilter, statusFilter, citizenProjects]);

  const uniqueStates = [...new Set(citizenProjects.map((p) => p.state).filter(Boolean))].sort();

  return (
    <DashboardLayout title="Projects" roleName="Citizen" badgeColorClass="border-emerald-300/20 bg-emerald-400/10 text-emerald-100">
      <div className="mb-8">
        <h2 className="flex items-center gap-3 text-3xl font-semibold text-white">
          <div className="rounded-2xl border border-white/10 bg-white/6 p-3 text-emerald-200">
            <Globe className="h-6 w-6" />
          </div>
          Infrastructure Projects
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-slate-400 sm:text-base">Explore and track road construction projects through a clearer discovery experience.</p>
      </div>

      <div className="mb-6 grid gap-3 rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-2 sm:grid-cols-3">
        {[
          ['area', 'My Area', MapPin],
          ['nearby', 'Nearby', Navigation],
          ['all', 'All India', Globe],
        ].map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center justify-center gap-2 rounded-[1.2rem] px-4 py-3 text-sm font-medium transition ${
              activeTab === key
                ? 'bg-gradient-to-r from-emerald-300/18 via-teal-300/10 to-transparent text-white shadow-[0_14px_30px_rgba(16,185,129,0.12)]'
                : 'text-slate-400 hover:bg-white/6 hover:text-slate-100'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="mb-8 flex flex-col gap-4 rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl lg:flex-row">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Search className="h-4 w-4 text-slate-500" />
          </div>
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="min-h-12 w-full rounded-xl border border-white/10 bg-slate-950/55 py-3 pl-11 pr-4 text-sm text-slate-100 outline-none transition duration-200 placeholder:text-slate-500 focus:border-emerald-300/45 focus:bg-slate-950/72 focus:ring-4 focus:ring-emerald-400/10"
          />
        </div>

        <div className="flex flex-wrap gap-4">
          {activeTab === 'nearby' && (
            <div className="relative min-w-[130px]">
              <select
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="min-h-12 w-full rounded-xl border border-white/10 bg-slate-950/55 px-4 py-3 text-sm text-slate-100 outline-none transition duration-200 focus:border-emerald-300/45 focus:bg-slate-950/72 focus:ring-4 focus:ring-emerald-400/10"
              >
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={20}>20 km</option>
                <option value={50}>50 km</option>
                <option value={100}>100 km</option>
              </select>
            </div>
          )}

          {activeTab === 'all' && (
            <div className="relative min-w-[170px]">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Filter className="h-4 w-4 text-slate-500" />
              </div>
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="min-h-12 w-full rounded-xl border border-white/10 bg-slate-950/55 py-3 pl-11 pr-4 text-sm text-slate-100 outline-none transition duration-200 focus:border-emerald-300/45 focus:bg-slate-950/72 focus:ring-4 focus:ring-emerald-400/10"
              >
                <option value="">All States</option>
                {uniqueStates.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="relative min-w-[170px]">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Filter className="h-4 w-4 text-slate-500" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="min-h-12 w-full rounded-xl border border-white/10 bg-slate-950/55 py-3 pl-11 pr-4 text-sm text-slate-100 outline-none transition duration-200 focus:border-emerald-300/45 focus:bg-slate-950/72 focus:ring-4 focus:ring-emerald-400/10"
            >
              <option value="">All Statuses</option>
              <option value="OPEN_FOR_BIDDING">Open for Bidding</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-14">
          <div className="shimmer-line h-10 w-10 rounded-full" />
        </div>
      ) : error ? (
        <div className="flex items-start gap-3 rounded-[1.5rem] border border-rose-400/20 bg-rose-500/10 p-4 text-rose-100">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-12 text-center">
          <Globe className="mx-auto mb-4 h-16 w-16 text-slate-700" />
          <h3 className="text-xl font-medium text-slate-200">No Projects Found</h3>
          <p className="mx-auto mt-2 max-w-md text-slate-400">Try adjusting your search terms or filters to find what you&apos;re looking for.</p>
          {(searchTerm || stateFilter || statusFilter) && (
            <Button
              onClick={() => {
                setSearchTerm('');
                setStateFilter('');
                setStatusFilter('');
              }}
              variant="outline"
              className="mx-auto mt-6"
              fullWidth={false}
            >
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-slate-400">
            Showing {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
