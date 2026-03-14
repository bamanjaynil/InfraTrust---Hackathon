import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import { Users, Plus, Search, Filter } from 'lucide-react';
import useContractorStore from '../../../store/contractorStore';
import Card from '../../../components/Card';
import Button from '../../../components/Button';

export default function ContractorDrivers() {
  const { drivers, fetchDrivers, createDriver, loading } = useContractorStore();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    truck_plate: ''
  });

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.truck_plate) {
      alert('Please fill all fields');
      return;
    }

    await createDriver(formData);
    setShowForm(false);
    setFormData({ name: '', email: '', phone: '', truck_plate: '' });
  };

  return (
    <DashboardLayout 
      title="Drivers" 
      roleName="Contractor"
      badgeColorClass="bg-blue-500/10 text-blue-500 border-blue-500/20"
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-zinc-100">Driver Management</h2>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Driver
          </Button>
        </div>

        {showForm && (
          <Card title="Add New Driver">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Email</label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Truck Plate</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
                    value={formData.truck_plate}
                    onChange={(e) => setFormData({...formData, truck_plate: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Driver'}
                </Button>
              </div>
            </form>
          </Card>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Search drivers..." 
                className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <Button variant="outline" className="shrink-0">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="pb-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Driver Name</th>
                  <th className="pb-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Email</th>
                  <th className="pb-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Phone</th>
                  <th className="pb-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Truck Plate</th>
                  <th className="pb-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {loading && drivers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-zinc-500">Loading drivers...</td>
                  </tr>
                ) : drivers.length > 0 ? (
                  drivers.map((driver) => (
                    <tr key={driver.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-zinc-900 text-blue-500">
                            <Users className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium text-zinc-200">{driver.name}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="text-sm text-zinc-400">{driver.email}</span>
                      </td>
                      <td className="py-4">
                        <span className="text-sm text-zinc-400">{driver.phone || 'N/A'}</span>
                      </td>
                      <td className="py-4">
                        <span className="text-sm text-zinc-400">{driver.truck_plate || 'N/A'}</span>
                      </td>
                      <td className="py-4">
                        <span className="inline-flex px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                          ACTIVE
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-zinc-500">No drivers found.</td>
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
