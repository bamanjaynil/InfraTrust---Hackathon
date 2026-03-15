import React, { useEffect } from 'react';
import { Package, Truck, Search, Filter } from 'lucide-react';
import DashboardLayout from '../../../components/DashboardLayout';
import useAdminStore from '../../../store/adminStore';
import Card from '../../../components/Card';
import StatusBadge from '../../../components/StatusBadge';
import Button from '../../../components/Button';

export default function AdminDeliveries() {
  const { deliveries, fetchDeliveries, loading, error } = useAdminStore();

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  return (
    <DashboardLayout
      title="Material Deliveries"
      roleName="Administrator"
      badgeColorClass="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search deliveries by ID, material, project..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 pl-10 pr-4 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800 w-auto">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        <Card noPadding>
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-zinc-400 text-sm">Loading deliveries...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-400">
              <p>{error}</p>
              <Button onClick={() => fetchDeliveries()} className="mt-4 w-auto mx-auto">Retry</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-800">
                <thead className="bg-zinc-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Delivery Info</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Project</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 bg-zinc-900">
                  {deliveries.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <Truck className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                        <p className="text-zinc-500">No material deliveries found</p>
                      </td>
                    </tr>
                  ) : (
                    deliveries.map((delivery) => (
                      <tr key={delivery.id} className="hover:bg-zinc-800/30 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded bg-zinc-800 text-zinc-400 group-hover:text-blue-500 transition-colors">
                              <Package className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-zinc-200">{delivery.material_type}</p>
                              <p className="text-xs text-zinc-500 mt-0.5 font-mono">ID: #{delivery.id.substring(0, 8)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-zinc-300">{delivery.project_name || `Project #${delivery.project_id}`}</p>
                          <p className="text-xs text-zinc-500 mt-0.5">Truck: {delivery.truck_number || 'Pending assignment'}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm font-mono text-zinc-200">{delivery.volume} units</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={delivery.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-zinc-500">
                            {new Date(delivery.dispatch_time || delivery.timestamp).toLocaleString(undefined, {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </p>
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
