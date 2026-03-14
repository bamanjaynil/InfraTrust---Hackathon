import React, { useEffect, useState, useMemo } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import { Truck, Search, Filter } from 'lucide-react';
import useContractorStore from '../../../store/contractorStore';
import { useAuthStore } from '../../../store/authStore';
import Card from '../../../components/Card';
import Button from '../../../components/Button';

export default function ContractorDeliveries() {
  const { user } = useAuthStore();
  const { deliveries, fetchDeliveries, loading } = useContractorStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchDeliveries();
    }
  }, [user?.id, fetchDeliveries]);

  const filteredDeliveries = useMemo(() => {
    return deliveries.filter(delivery => {
      const matchesSearch = 
        delivery.project_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        delivery.driver_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        delivery.material_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        delivery.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter ? delivery.status === statusFilter : true;
      return matchesSearch && matchesStatus;
    });
  }, [deliveries, searchQuery, statusFilter]);

  return (
    <DashboardLayout 
      title="Deliveries" 
      roleName="Contractor"
      badgeColorClass="bg-blue-500/10 text-blue-500 border-blue-500/20"
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Search deliveries..." 
                className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-blue-500 transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select 
              className="bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-blue-500 px-4 py-2"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="pb-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Delivery ID</th>
                  <th className="pb-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Project</th>
                  <th className="pb-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Driver</th>
                  <th className="pb-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Material</th>
                  <th className="pb-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Quantity</th>
                  <th className="pb-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Dispatch Time</th>
                  <th className="pb-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {loading && deliveries.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-zinc-500">Loading deliveries...</td>
                  </tr>
                ) : filteredDeliveries.length > 0 ? (
                  filteredDeliveries.map((delivery) => (
                    <tr key={delivery.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-zinc-900 text-blue-500">
                            <Truck className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium text-zinc-200">{delivery.id.substring(0, 8)}...</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="text-sm text-zinc-400">{delivery.project_name}</span>
                      </td>
                      <td className="py-4">
                        <span className="text-sm text-zinc-400">{delivery.driver_name || 'Unassigned'}</span>
                      </td>
                      <td className="py-4">
                        <span className="text-sm text-zinc-400">{delivery.material_type}</span>
                      </td>
                      <td className="py-4">
                        <span className="text-sm text-zinc-400">{delivery.volume} t</span>
                      </td>
                      <td className="py-4">
                        <span className="text-sm text-zinc-400">
                          {new Date(delivery.timestamp).toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                          delivery.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                          delivery.status === 'IN_TRANSIT' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                          'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
                        }`}>
                          {delivery.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-zinc-500">No deliveries found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
