import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import useCitizenStore from '../../../store/citizenStore';
import { getAreaProjects, getNearbyProjects, getAllProjects } from '../../../services/projectService';
import DashboardLayout from '../../../components/DashboardLayout';
import ProjectCard from '../../../components/ProjectCard';
import { MapPin, Navigation, Globe, Search, Filter, AlertCircle } from 'lucide-react';

export default function Projects() {
  const location = useLocation();
  const { user } = useAuthStore();
  const { citizenProjects, setCitizenProjects, userLocation } = useCitizenStore();
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'area'); // 'area', 'nearby', 'all'
  
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
      result = result.filter(p => 
        p.name?.toLowerCase().includes(term) || 
        p.city?.toLowerCase().includes(term) ||
        p.district?.toLowerCase().includes(term) ||
        p.state?.toLowerCase().includes(term)
      );
    }

    if (stateFilter) {
      result = result.filter(p => p.state === stateFilter);
    }

    if (statusFilter) {
      result = result.filter(p => p.status === statusFilter);
    }

    setFilteredProjects(result);
  }, [searchTerm, stateFilter, statusFilter, citizenProjects]);

  const uniqueStates = [...new Set(citizenProjects.map(p => p.state).filter(Boolean))].sort();

  return (
    <DashboardLayout title="Projects" roleName="Citizen" badgeColorClass="border-emerald-500/30 text-emerald-400">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
          <Globe className="w-6 h-6 text-emerald-500" />
          Infrastructure Projects
        </h2>
        <p className="text-zinc-400 mt-2">Explore and track road construction projects.</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-zinc-900/50 p-1 rounded-xl mb-6 border border-zinc-800">
        <button
          onClick={() => setActiveTab('area')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'area' ? 'bg-zinc-800 text-emerald-400 shadow-sm' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          }`}
        >
          <MapPin className="w-4 h-4" />
          My Area
        </button>
        <button
          onClick={() => setActiveTab('nearby')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'nearby' ? 'bg-zinc-800 text-emerald-400 shadow-sm' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          }`}
        >
          <Navigation className="w-4 h-4" />
          Nearby
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'all' ? 'bg-zinc-800 text-emerald-400 shadow-sm' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          }`}
        >
          <Globe className="w-4 h-4" />
          All India
        </button>
      </div>

      {/* Filters */}
      <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl mb-8 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-zinc-500" />
          </div>
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        <div className="flex flex-wrap gap-4">
          {activeTab === 'nearby' && (
            <div className="relative min-w-[120px]">
              <select 
                value={radius} 
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full pl-4 pr-8 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none appearance-none"
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
            <div className="relative min-w-[150px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-4 w-4 text-zinc-500" />
              </div>
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="w-full pl-10 pr-8 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none appearance-none"
              >
                <option value="">All States</option>
                {uniqueStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
          )}

          <div className="relative min-w-[150px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-zinc-500" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-8 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none appearance-none"
            >
              <option value="">All Statuses</option>
              <option value="PLANNED">Planned</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>
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
      ) : filteredProjects.length === 0 ? (
        <div className="bg-zinc-900/50 border border-zinc-800 p-12 rounded-xl text-center">
          <Globe className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-zinc-300 mb-2">No Projects Found</h3>
          <p className="text-zinc-500 max-w-md mx-auto">Try adjusting your search terms or filters to find what you're looking for.</p>
          {(searchTerm || stateFilter || statusFilter) && (
            <button 
              onClick={() => { setSearchTerm(''); setStateFilter(''); setStatusFilter(''); }}
              className="mt-6 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="text-sm text-zinc-400 mb-4">Showing {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
