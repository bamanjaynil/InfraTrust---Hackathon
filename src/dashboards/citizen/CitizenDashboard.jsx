import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import useCitizenStore from '../../store/citizenStore';
import DashboardLayout from '../../components/DashboardLayout';
import { Map, Navigation, Globe, AlertTriangle, FileText, Activity, MapPin } from 'lucide-react';
import { getAreaProjects, getNearbyProjects, getAllProjects } from '../../services/projectService';

export default function CitizenDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { userLocation } = useCitizenStore();
  const [stats, setStats] = useState({
    areaProjects: 0,
    nearbyProjects: 0,
    totalProjects: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [area, all] = await Promise.all([
          user?.district && user?.city ? getAreaProjects(user.district, user.city) : Promise.resolve({ projects: [] }),
          getAllProjects()
        ]);
        
        let nearby = { projects: [] };
        const lat = userLocation?.latitude || user?.latitude;
        const lng = userLocation?.longitude || user?.longitude;
        if (lat && lng) {
          nearby = await getNearbyProjects(lat, lng, 20);
        }

        setStats({
          areaProjects: area.projects?.length || 0,
          nearbyProjects: nearby.projects?.length || 0,
          totalProjects: all.projects?.length || 0
        });
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, userLocation]);

  return (
    <DashboardLayout 
      title="Citizen Dashboard" 
      roleName="Citizen" 
      badgeColorClass="border-emerald-500/30 text-emerald-400" 
    >
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-zinc-100 mb-2">Welcome back, {user?.name}!</h2>
          <p className="text-zinc-400 max-w-2xl">
            InfraTrust is committed to transparency. Track ongoing and completed public infrastructure projects in your area, view material costs, and report issues directly to the authorities.
          </p>
          
          {user?.city && user?.district && (
            <div className="mt-6 flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-lg inline-flex">
              <MapPin className="w-4 h-4" />
              Your location: {user.city}, {user.district}, {user.state}
            </div>
          )}
        </div>
      </div>

      <h3 className="text-lg font-semibold text-zinc-200 mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-emerald-500" />
        Quick Overview
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div 
          onClick={() => navigate('/citizen/projects', { state: { tab: 'area' } })}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col justify-between hover:bg-zinc-800/50 hover:border-zinc-700 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400 group-hover:bg-blue-500/20 transition-colors">
              <Map className="w-6 h-6" />
            </div>
            {loading ? (
              <div className="animate-pulse bg-zinc-800 h-8 w-12 rounded"></div>
            ) : (
              <span className="text-3xl font-bold text-zinc-100">{stats.areaProjects}</span>
            )}
          </div>
          <div>
            <p className="text-sm text-zinc-400 font-medium group-hover:text-zinc-300 transition-colors">Projects in Your Area</p>
            <p className="text-xs text-zinc-500 mt-1">Based on your registered city and district</p>
          </div>
        </div>

        <div 
          onClick={() => navigate('/citizen/projects', { state: { tab: 'nearby' } })}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col justify-between hover:bg-zinc-800/50 hover:border-zinc-700 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
              <Navigation className="w-6 h-6" />
            </div>
            {loading ? (
              <div className="animate-pulse bg-zinc-800 h-8 w-12 rounded"></div>
            ) : (
              <span className="text-3xl font-bold text-zinc-100">{stats.nearbyProjects}</span>
            )}
          </div>
          <div>
            <p className="text-sm text-zinc-400 font-medium group-hover:text-zinc-300 transition-colors">Nearby Projects</p>
            <p className="text-xs text-zinc-500 mt-1">Within 20km of your GPS location</p>
          </div>
        </div>

        <div 
          onClick={() => navigate('/citizen/projects', { state: { tab: 'all' } })}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col justify-between hover:bg-zinc-800/50 hover:border-zinc-700 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400 group-hover:bg-purple-500/20 transition-colors">
              <Globe className="w-6 h-6" />
            </div>
            {loading ? (
              <div className="animate-pulse bg-zinc-800 h-8 w-12 rounded"></div>
            ) : (
              <span className="text-3xl font-bold text-zinc-100">{stats.totalProjects}</span>
            )}
          </div>
          <div>
            <p className="text-sm text-zinc-400 font-medium group-hover:text-zinc-300 transition-colors">All India Projects</p>
            <p className="text-xs text-zinc-500 mt-1">National infrastructure tracking</p>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-zinc-200 mb-4 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-amber-500" />
        Citizen Action
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          onClick={() => navigate('/citizen/report')}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex items-center gap-4 hover:bg-zinc-800/50 hover:border-zinc-700 transition-all cursor-pointer group"
        >
          <div className="p-4 bg-amber-500/10 rounded-full text-amber-500 group-hover:bg-amber-500/20 transition-colors">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-zinc-100 font-medium group-hover:text-white transition-colors">Report Road Issue</h4>
            <p className="text-sm text-zinc-500 mt-1">Found a pothole or incomplete work? Report it with a photo.</p>
          </div>
        </div>

        <div 
          onClick={() => navigate('/citizen/reports')}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex items-center gap-4 hover:bg-zinc-800/50 hover:border-zinc-700 transition-all cursor-pointer group"
        >
          <div className="p-4 bg-zinc-800 rounded-full text-zinc-400 group-hover:bg-zinc-700 transition-colors">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-zinc-100 font-medium group-hover:text-white transition-colors">My Reports</h4>
            <p className="text-sm text-zinc-500 mt-1">Track the status of issues you have previously reported.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
