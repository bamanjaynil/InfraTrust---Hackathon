import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { Navigation, CheckCircle, Truck, Activity, ArrowRight } from 'lucide-react';
import useDriverStore from '../../store/driverStore';
import { useAuthStore } from '../../store/authStore';
import StatCard from '../../components/StatCard';
import Card from '../../components/Card';
import Button from '../../components/Button';

export default function DriverDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { driverDeliveries, fetchDriverDeliveries, loading } = useDriverStore();

  useEffect(() => {
    if (user?.id) {
      fetchDriverDeliveries(user.id);
    }
  }, [user?.id, fetchDriverDeliveries]);

  const stats = useMemo(() => {
    const safeDeliveries = Array.isArray(driverDeliveries) ? driverDeliveries : [];
    return {
      active: safeDeliveries.filter(d => d.status === 'ASSIGNED' || d.status === 'IN_TRANSIT' || d.status === 'ARRIVED').length,
      completed: safeDeliveries.filter(d => d.status === 'COMPLETED' || d.status === 'VERIFIED').length,
      truck: safeDeliveries.length > 0 ? safeDeliveries[0].truck_number : 'N/A'
    };
  }, [driverDeliveries]);

  const recentDeliveries = useMemo(() => {
    const safeDeliveries = Array.isArray(driverDeliveries) ? driverDeliveries : [];
    return safeDeliveries.slice(0, 5);
  }, [driverDeliveries]);

  return (
    <DashboardLayout 
      title="Driver Dashboard" 
      roleName="Driver"
      badgeColorClass="bg-blue-500/10 text-blue-500 border-blue-500/20"
    >
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-zinc-100">Welcome back, {user?.name}</h2>
            <p className="text-zinc-500 text-sm mt-1">You have {stats.active} active deliveries today.</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Active Deliveries" value={stats.active} icon={Navigation} color="blue" />
          <StatCard title="Completed" value={stats.completed} icon={CheckCircle} color="emerald" />
          <StatCard title="Current Truck" value={stats.truck} icon={Truck} color="purple" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            <Card title="Quick Actions">
              <div className="space-y-3">
                <Button 
                  onClick={() => navigate('/driver/deliveries')}
                  className="w-full justify-start bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700"
                >
                  <Navigation className="w-4 h-4 mr-3 text-blue-500" />
                  View Active Deliveries
                </Button>
                <Button 
                  onClick={() => navigate('/driver/history')}
                  className="w-full justify-start bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700"
                >
                  <Activity className="w-4 h-4 mr-3 text-zinc-500" />
                  Delivery History
                </Button>
              </div>
            </Card>
          </div>

          {/* Recent Deliveries */}
          <div className="lg:col-span-2">
            <Card title="Recent Deliveries">
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8 text-zinc-500">Loading deliveries...</div>
                ) : recentDeliveries.length > 0 ? (
                  recentDeliveries.map((delivery) => (
                    <div 
                      key={delivery.id} 
                      className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer group"
                      onClick={() => navigate(`/driver/deliveries/${delivery.id}`)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-zinc-900 text-blue-500">
                          <Truck className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-zinc-200">{delivery.material_type}</p>
                          <p className="text-xs text-zinc-500">{delivery.project_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                          delivery.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                          delivery.status === 'IN_TRANSIT' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                          'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
                        }`}>
                          {delivery.status}
                        </div>
                        <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-zinc-500">No deliveries found.</div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
