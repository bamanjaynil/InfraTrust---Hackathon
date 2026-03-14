import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { FolderKanban, Plus, Users, Activity, AlertTriangle, CheckCircle, Navigation } from 'lucide-react';
import useAdminStore from '../../store/adminStore';
import StatCard from '../../components/StatCard';
import Card from '../../components/Card';
import Button from '../../components/Button';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { projects, reports, deliveries, fetchProjects, fetchReports, fetchDeliveries, loading } = useAdminStore();

  useEffect(() => {
    fetchProjects();
    fetchReports();
    fetchDeliveries();
  }, [fetchProjects, fetchReports, fetchDeliveries]);

  const stats = useMemo(() => {
    const safeProjects = Array.isArray(projects) ? projects : [];
    const safeReports = Array.isArray(reports) ? reports : [];
    
    return {
      totalProjects: safeProjects.length,
      activeProjects: safeProjects.filter(p => p.status === 'ACTIVE').length,
      completedProjects: safeProjects.filter(p => p.status === 'COMPLETED').length,
      pendingReports: safeReports.filter(r => r.status === 'OPEN').length,
      trustAlerts: 0 // Mock for now
    };
  }, [projects, reports]);

const recentActivity = useMemo(() => {
  const safeProjects = Array.isArray(projects) ? projects : [];
  const safeDeliveries = Array.isArray(deliveries) ? deliveries : [];
  const safeReports = Array.isArray(reports) ? reports : [];

  return [
    ...safeProjects.slice(0, 3).map(p => ({
      id: `p-${p.id}`,
      type: 'PROJECT',
      title: `New Project: ${p.name}`,
      time: p.created_at,
      icon: FolderKanban,
      color: 'text-emerald-500'
    })),

    ...safeDeliveries.slice(0, 3).map(d => ({
      id: `d-${d.id}`,
      type: 'DELIVERY',
      title: `Delivery: ${d.material_type} to ${d.project_id}`,
      time: d.timestamp,
      icon: Navigation,
      color: 'text-blue-500'
    })),

    ...safeReports.slice(0, 3).map(r => ({
      id: `r-${r.id}`,
      type: 'REPORT',
      title: `Report: ${r.description.substring(0, 30)}...`,
      time: r.created_at,
      icon: AlertTriangle,
      color: 'text-amber-500'
    }))
  ]
  .sort((a, b) => new Date(b.time) - new Date(a.time))
  .slice(0, 6);

}, [projects, deliveries, reports]);

  return (
    <DashboardLayout 
      title="Admin Dashboard" 
      roleName="Administrator" 
      badgeColorClass="bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <StatCard title="Total Projects" value={stats.totalProjects} icon={FolderKanban} color="emerald" />
        <StatCard title="Active Projects" value={stats.activeProjects} icon={Activity} color="blue" />
        <StatCard title="Completed" value={stats.completedProjects} icon={CheckCircle} color="purple" />
        <StatCard title="Pending Reports" value={stats.pendingReports} icon={AlertTriangle} color="amber" />
        <StatCard title="Trust Alerts" value={stats.trustAlerts} icon={Activity} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
          <Card title="Quick Actions">
            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/admin/projects/create')}
                className="justify-start bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700"
              >
                <Plus className="w-4 h-4 mr-3 text-emerald-500" />
                Create New Project
              </Button>
              <Button 
                onClick={() => navigate('/admin/reports')}
                className="justify-start bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700"
              >
                <AlertTriangle className="w-4 h-4 mr-3 text-amber-500" />
                Review Reports
              </Button>
              <Button 
                onClick={() => navigate('/admin/contractors')}
                className="justify-start bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700"
              >
                <Users className="w-4 h-4 mr-3 text-blue-500" />
                Manage Contractors
              </Button>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card title="Recent Activity">
            <div className="space-y-6">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg bg-zinc-800 ${activity.color}`}>
                      <activity.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-zinc-200 font-medium">{activity.title}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {new Date(activity.time).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                  <p className="text-zinc-500 text-sm">No recent activity found</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

