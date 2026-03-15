import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../components/DashboardLayout';
import { Truck, ExternalLink, Search } from 'lucide-react';
import useDriverStore from '../../../store/driverStore';
import { useAuthStore } from '../../../store/authStore';
import Card from '../../../components/Card';
import StatusBadge from '../../../components/StatusBadge';

export default function DriverDeliveries() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { driverDeliveries, fetchDriverDeliveries, loading, error } = useDriverStore();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchDriverDeliveries(user.id);
    }
  }, [user?.id, fetchDriverDeliveries]);

  const activeDeliveries = Array.isArray(driverDeliveries)
    ? driverDeliveries.filter((delivery) => !['COMPLETED', 'VERIFIED'].includes(delivery.status))
    : [];

  const filteredDeliveries = activeDeliveries.filter((delivery) =>
    delivery.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    delivery.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    delivery.material_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout
      title="Active Deliveries"
      roleName="Driver"
      badgeColorClass="bg-blue-500/10 text-blue-500 border-blue-500/20"
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by ID, project, or material..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 pl-10 pr-4 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <Card noPadding>
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-zinc-400 text-sm">Loading deliveries...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-400">
              <p>{error}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-800">
                <thead className="bg-zinc-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Delivery ID</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Project</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Material</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Dispatch Time</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 bg-zinc-900">
                  {filteredDeliveries.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center">
                        <Truck className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                        <p className="text-zinc-500">No active deliveries assigned to you</p>
                      </td>
                    </tr>
                  ) : (
                    filteredDeliveries.map((delivery) => (
                      <tr key={delivery.id} className="hover:bg-zinc-800/30 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-mono text-zinc-400">#{delivery.id.substring(0, 8)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm font-medium text-zinc-200">{delivery.project_name}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-zinc-400">{delivery.material_type}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">
                          {delivery.volume} units
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-sm text-zinc-300">
                              {delivery.dispatch_time ? new Date(delivery.dispatch_time).toLocaleDateString() : 'N/A'}
                            </span>
                            <span className="text-xs text-zinc-500">
                              {delivery.dispatch_time ? new Date(delivery.dispatch_time).toLocaleTimeString() : ''}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={delivery.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => navigate(`/driver/deliveries/${delivery.id}`)}
                            className="p-2 text-zinc-500 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
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
}
