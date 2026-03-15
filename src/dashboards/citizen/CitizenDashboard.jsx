import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import useCitizenStore from '../../store/citizenStore';
import DashboardLayout from '../../components/DashboardLayout';
import { Map, Navigation, Globe, AlertTriangle, FileText, Activity, MapPin } from 'lucide-react';
import { getAreaProjects, getNearbyProjects, getAllProjects } from '../../services/projectService';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';
import { Link } from 'react-router-dom';

export default function CitizenDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { userLocation } = useCitizenStore();
  const [stats, setStats] = useState({
    areaProjects: 0,
    nearbyProjects: 0,
    totalProjects: 0,
  });
  const [districtProjects, setDistrictProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [area, all] = await Promise.all([
          user?.district && user?.city ? getAreaProjects(user.district, user.city) : Promise.resolve({ projects: [] }),
          getAllProjects(),
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
          totalProjects: all.projects?.length || 0,
        });
        setDistrictProjects((area.projects || []).slice(0, 3));
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, userLocation]);

  return (
    <DashboardLayout title="Citizen Dashboard" roleName="Citizen" badgeColorClass="border-emerald-300/20 bg-emerald-400/10 text-emerald-100">
      <section className="relative mb-8 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_60px_rgba(2,6,23,0.32)] backdrop-blur-xl sm:p-8">
        <div className="aurora-spot right-[-6%] top-[-12%] h-56 w-56 bg-emerald-300/20" />
        <div className="relative z-10 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200/80">Transparency Network</p>
          <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Welcome back, {user?.name}!</h2>
          <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
            Track infrastructure work around you, inspect public project details, and raise issues through a cleaner citizen-facing view.
          </p>

          {user?.city && user?.district && (
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/18 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-100">
              <MapPin className="h-4 w-4" />
              Your location: {user.city}, {user.district}, {user.state}
            </div>
          )}
        </div>
      </section>

      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-100">
        <Activity className="h-5 w-5 text-emerald-200" />
        Quick Overview
      </h3>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {[
          {
            key: 'area',
            title: 'Projects in Your Area',
            subtitle: 'Based on your registered city and district',
            icon: Map,
            tone: 'text-sky-200',
            value: stats.areaProjects,
          },
          {
            key: 'nearby',
            title: 'Nearby Projects',
            subtitle: 'Within 20km of your GPS location',
            icon: Navigation,
            tone: 'text-emerald-200',
            value: stats.nearbyProjects,
          },
          {
            key: 'all',
            title: 'All India Projects',
            subtitle: 'National infrastructure tracking',
            icon: Globe,
            tone: 'text-indigo-200',
            value: stats.totalProjects,
          },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => navigate('/citizen/projects', { state: { tab: item.key } })}
            className="glass-panel surface-hover group flex flex-col justify-between rounded-[1.75rem] p-6 text-left"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className={`rounded-[1.2rem] border border-white/10 bg-white/6 p-3 ${item.tone}`}>
                <item.icon className="h-6 w-6" />
              </div>
              {loading ? (
                <div className="shimmer-line h-9 w-14 rounded-xl" />
              ) : (
                <span className="text-4xl font-semibold tracking-tight text-slate-50">{item.value}</span>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-200">{item.title}</p>
              <p className="mt-2 text-sm text-slate-400">{item.subtitle}</p>
            </div>
          </button>
        ))}
      </div>

      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-100">
        <AlertTriangle className="h-5 w-5 text-amber-200" />
        Citizen Action
      </h3>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <button
          type="button"
          onClick={() => navigate('/citizen/report')}
          className="glass-panel surface-hover group flex items-center gap-4 rounded-[1.75rem] p-6 text-left"
        >
          <div className="rounded-full border border-amber-300/20 bg-amber-400/10 p-4 text-amber-200">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-medium text-slate-100">Report Road Issue</h4>
            <p className="mt-1 text-sm text-slate-400">Found a pothole or incomplete work? Report it with a photo.</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate('/citizen/reports')}
          className="glass-panel surface-hover group flex items-center gap-4 rounded-[1.75rem] p-6 text-left"
        >
          <div className="rounded-full border border-white/10 bg-white/6 p-4 text-slate-200">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-medium text-slate-100">My Reports</h4>
            <p className="mt-1 text-sm text-slate-400">Track the status of issues you have previously reported.</p>
          </div>
        </button>
      </div>

      <div className="mt-8">
        <Card title="Projects In Your District" subtitle="Transparency-first view of nearby work, assignments, and estimated cost.">
          <div className="space-y-4">
            {districtProjects.length === 0 ? (
              <p className="text-sm text-slate-400">No district projects available yet.</p>
            ) : (
              districtProjects.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="block rounded-[1.25rem] border border-white/8 bg-white/[0.03] p-4 transition hover:bg-white/[0.05]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-100">{project.name}</p>
                      <p className="mt-1 text-xs text-slate-400">{project.city}, {project.district}</p>
                      <p className="mt-3 text-xs text-slate-300">Contractor: {project.contractor_name || 'Pending assignment'}</p>
                      <p className="mt-1 text-xs text-slate-300">Estimated material cost: Rs {Number(project.estimated_budget || 0).toLocaleString()}</p>
                    </div>
                    <StatusBadge status={project.status} />
                  </div>
                </Link>
              ))
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
