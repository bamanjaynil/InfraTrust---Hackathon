import React, { useEffect } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import { FileText, Truck, Search, Calendar } from 'lucide-react';
import useDriverStore from '../../../store/driverStore';
import { useAuthStore } from '../../../store/authStore';
import Card from '../../../components/Card';
import StatusBadge from '../../../components/StatusBadge';
import { useState } from 'react';

export default function DriverHistory() {
  const { user } = useAuthStore();
  const { driverDeliveries, fetchDriverDeliveries, loading, error } = useDriverStore();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchDriverDeliveries(user.id);
    }
  }, [user?.id, fetchDriverDeliveries]);

  const completedDeliveries = Array.isArray(driverDeliveries) 
    ? driverDeliveries.filter(d => d.status === 'COMPLETED')
    : [];

  const filteredDeliveries = completedDeliveries.filter(d => 
    d.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.material_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout 
      title="Delivery History" 
      roleName="Driver"
      badgeColorClass="bg-blue-500/10 text-blue-500 border-blue-500/20"
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search history..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 pl-10 pr-4 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <Card noPadding>
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-zinc-400 text-sm">Loading history...</p>
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
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Project</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Material</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Arrival Time</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Completion Time</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 bg-zinc-900">
                  {filteredDeliveries.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <Calendar className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                        <p className="text-zinc-500">No completed deliveries found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredDeliveries.map((delivery) => (
                      <tr key={delivery.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm font-medium text-zinc-200">{delivery.project_name}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-zinc-400">{delivery.material_type}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">
                          {delivery.volume} m³
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-sm text-zinc-300">
                              {delivery.arrival_time ? new Date(delivery.arrival_time).toLocaleDateString() : 'N/A'}
                            </span>
                            <span className="text-xs text-zinc-500">
                              {delivery.arrival_time ? new Date(delivery.arrival_time).toLocaleTimeString() : ''}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-sm text-zinc-300">
                              {delivery.completion_time ? new Date(delivery.completion_time).toLocaleDateString() : 'N/A'}
                            </span>
                            <span className="text-xs text-zinc-500">
                              {delivery.completion_time ? new Date(delivery.completion_time).toLocaleTimeString() : ''}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={delivery.status} />
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
