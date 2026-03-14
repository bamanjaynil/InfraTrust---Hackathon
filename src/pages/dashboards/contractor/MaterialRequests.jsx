import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import { FileText, Plus } from 'lucide-react';
import useContractorStore from '../../../store/contractorStore';
import { useAuthStore } from '../../../store/authStore';
import Card from '../../../components/Card';
import Button from '../../../components/Button';

export default function MaterialRequests() {
  const { user } = useAuthStore();
  const { 
    contractorProjects, 
    materialRequests, 
    fetchContractorProjects, 
    fetchMaterialRequests, 
    createMaterialRequest,
    updateMaterialRequestStatus,
    loading 
  } = useContractorStore();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    project_id: '',
    material_type: '',
    quantity: '',
    requested_date: '',
    priority: 'NORMAL'
  });

  useEffect(() => {
    if (user?.id) {
      if (contractorProjects.length === 0) {
        fetchContractorProjects();
      }
      fetchMaterialRequests();
    }
  }, [user?.id, fetchContractorProjects, fetchMaterialRequests, contractorProjects.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.project_id || !formData.material_type || !formData.quantity || !formData.requested_date) {
      alert('Please fill all fields');
      return;
    }

    await createMaterialRequest({
      ...formData
    });
    
    setShowForm(false);
    setFormData({ project_id: '', material_type: '', quantity: '', requested_date: '' });
  };

  return (
    <DashboardLayout 
      title="Material Requests" 
      roleName="Contractor"
      badgeColorClass="bg-blue-500/10 text-blue-500 border-blue-500/20"
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-zinc-100">Material Requests</h2>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-2" />
            New Request
          </Button>
        </div>

        {showForm && (
          <Card title="Create Material Request">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Project</label>
                  <select 
                    className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
                    value={formData.project_id}
                    onChange={(e) => setFormData({...formData, project_id: e.target.value})}
                  >
                    <option value="">Select Project</option>
                    {contractorProjects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Material Type</label>
                  <select 
                    className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
                    value={formData.material_type}
                    onChange={(e) => setFormData({...formData, material_type: e.target.value})}
                  >
                    <option value="">Select Material</option>
                    <option value="Bitumen">Bitumen</option>
                    <option value="Aggregate">Aggregate</option>
                    <option value="Cement">Cement</option>
                    <option value="Sand">Sand</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Quantity (tons)</label>
                  <input 
                    type="number" 
                    min="0.1"
                    step="0.1"
                    className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Requested Date</label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
                    value={formData.requested_date}
                    onChange={(e) => setFormData({...formData, requested_date: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </form>
          </Card>
        )}

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="pb-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Request ID</th>
                  <th className="pb-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Project</th>
                  <th className="pb-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Material</th>
                  <th className="pb-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Quantity</th>
                  <th className="pb-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Requested Date</th>
                  <th className="pb-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                  <th className="pb-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {loading && materialRequests.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-zinc-500">Loading requests...</td>
                  </tr>
                ) : materialRequests.length > 0 ? (
                  materialRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-zinc-900 text-blue-500">
                            <FileText className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium text-zinc-200">{req.id.substring(0, 8)}...</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="text-sm text-zinc-400">{req.project_name}</span>
                      </td>
                      <td className="py-4">
                        <span className="text-sm text-zinc-400">{req.material_type}</span>
                      </td>
                      <td className="py-4">
                        <span className="text-sm text-zinc-400">{req.quantity} t</span>
                      </td>
                      <td className="py-4">
                        <span className="text-sm text-zinc-400">{new Date(req.requested_date).toLocaleDateString()}</span>
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                          req.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                          req.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                          'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="py-4">
                        {(!req.status || req.status === 'PENDING') && (
                          <select 
                            className="bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-blue-500 px-2 py-1"
                            onChange={(e) => updateMaterialRequestStatus(req.id, e.target.value)}
                            defaultValue=""
                          >
                            <option value="" disabled>Update Status</option>
                            <option value="APPROVED">Approve</option>
                            <option value="REJECTED">Reject</option>
                            <option value="DELIVERED">Delivered</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-zinc-500">No material requests found.</td>
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
