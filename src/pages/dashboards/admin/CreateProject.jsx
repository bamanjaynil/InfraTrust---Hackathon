import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '../../../services/adminService';
import DashboardLayout from '../../../components/DashboardLayout';
import Button from '../../../components/Button';
import Card from '../../../components/Card';

const CreateProject = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [contractors, setContractors] = useState([]);
  const [loadingContractors, setLoadingContractors] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    start_lat: '',
    start_lng: '',
    end_lat: '',
    end_lng: '',
    state: '',
    district: '',
    city: '',
    soil_type: 'NORMAL',
    road_type: 'RURAL',
    length: '',
    width: '',
    contractor_id: ''
  });

  useEffect(() => {
    const fetchContractors = async () => {
      try {
        const response = await adminService.getContractors();
        setContractors(response.contractors || []);
      } catch (err) {
        console.error('Failed to fetch contractors:', err);
      } finally {
        setLoadingContractors(false);
      }
    };

    fetchContractors();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        start_lat: parseFloat(formData.start_lat) || 0,
        start_lng: parseFloat(formData.start_lng) || 0,
        end_lat: parseFloat(formData.end_lat) || 0,
        end_lng: parseFloat(formData.end_lng) || 0,
        length: parseFloat(formData.length),
        width: parseFloat(formData.width),
        contractor_id: formData.contractor_id || null
      };

      await adminService.createProject(payload);
      navigate('/admin/projects');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout 
      title="Create New Project" 
      roleName="Administrator" 
      badgeColorClass="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
    >
      <div className="max-w-3xl mx-auto">
        <Card>
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Basic Information</h3>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-zinc-400 text-xs font-medium mb-1.5 uppercase tracking-wider" htmlFor="name">
                    Project Name
                  </label>
                  <input
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 px-4 text-zinc-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    id="name" name="name" type="text" required
                    placeholder="e.g. NH-44 Highway Expansion"
                    value={formData.name} onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-zinc-400 text-xs font-medium mb-1.5 uppercase tracking-wider" htmlFor="state">State</label>
                  <input
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 px-4 text-zinc-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    id="state" name="state" type="text" required
                    value={formData.state} onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-xs font-medium mb-1.5 uppercase tracking-wider" htmlFor="district">District</label>
                  <input
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 px-4 text-zinc-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    id="district" name="district" type="text" required
                    value={formData.district} onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-xs font-medium mb-1.5 uppercase tracking-wider" htmlFor="city">City</label>
                  <input
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 px-4 text-zinc-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    id="city" name="city" type="text" required
                    value={formData.city} onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-zinc-800 space-y-4">
              <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Technical Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-zinc-400 text-xs font-medium mb-1.5 uppercase tracking-wider" htmlFor="length">Length (meters)</label>
                  <input
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 px-4 text-zinc-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    id="length" name="length" type="number" step="any" required
                    value={formData.length} onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-xs font-medium mb-1.5 uppercase tracking-wider" htmlFor="width">Width (meters)</label>
                  <input
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 px-4 text-zinc-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    id="width" name="width" type="number" step="any" required
                    value={formData.width} onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-zinc-400 text-xs font-medium mb-1.5 uppercase tracking-wider" htmlFor="soil_type">Soil Type</label>
                  <select
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 px-4 text-zinc-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    id="soil_type" name="soil_type" required
                    value={formData.soil_type} onChange={handleChange}
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="CLAY">Clay</option>
                    <option value="SANDY">Sandy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 text-xs font-medium mb-1.5 uppercase tracking-wider" htmlFor="road_type">Road Type</label>
                  <select
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 px-4 text-zinc-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    id="road_type" name="road_type" required
                    value={formData.road_type} onChange={handleChange}
                  >
                    <option value="RURAL">Rural</option>
                    <option value="HIGHWAY">Highway</option>
                    <option value="URBAN">Urban</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-zinc-800 space-y-4">
              <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Assignment</h3>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-zinc-400 text-xs font-medium mb-1.5 uppercase tracking-wider" htmlFor="contractor_id">
                    Assign Contractor
                  </label>
                  <select
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 px-4 text-zinc-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    id="contractor_id" name="contractor_id"
                    value={formData.contractor_id} onChange={handleChange}
                    disabled={loadingContractors}
                  >
                    <option value="">-- Select a Contractor --</option>
                    {contractors.map(contractor => (
                      <option key={contractor.id} value={contractor.id}>
                        {contractor.name} ({contractor.email})
                      </option>
                    ))}
                  </select>
                  {loadingContractors && <p className="text-xs text-zinc-500 mt-1">Loading contractors...</p>}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-6 border-t border-zinc-800">
              <Button
                type="submit"
                loading={loading}
                className="w-auto px-8"
              >
                Create Project & Generate BoQ
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CreateProject;
