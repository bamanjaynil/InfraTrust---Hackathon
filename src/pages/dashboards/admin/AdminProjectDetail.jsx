import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, Package, Truck } from 'lucide-react';
import DashboardLayout from '../../../components/DashboardLayout';
import adminService from '../../../services/adminService';
import StatusBadge from '../../../components/StatusBadge';
import Button from '../../../components/Button';
import Card from '../../../components/Card';

export default function AdminProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [passportDrafts, setPassportDrafts] = useState({});

  const loadProject = async () => {
    try {
      setLoading(true);
      const response = await adminService.getProjectById(id);
      setProjectData(response.data);
      setError('');
    } catch (_error) {
      setError('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [id]);

  const handleStatusChange = async (status) => {
    await adminService.updateProjectStatus(id, status);
    await loadProject();
  };

  const handleApprove = async (applicationId) => {
    await adminService.approveProjectApplication(applicationId);
    await loadProject();
  };

  const handleCreatePassport = async () => {
    const draft = passportDrafts[id] || {};
    if (!draft.material_type || !draft.quantity || !draft.truck_number) {
      return;
    }

    await adminService.createMaterialPassport({
      project_id: id,
      material_type: draft.material_type,
      quantity: Number(draft.quantity),
      truck_number: draft.truck_number,
      driver_id: draft.driver_id || null,
    });
    await loadProject();
  };

  if (loading) {
    return <DashboardLayout title="Project Detail"><div className="py-12 text-center text-slate-400">Loading project details...</div></DashboardLayout>;
  }

  if (error || !projectData?.project) {
    return <DashboardLayout title="Project Detail"><div className="py-12 text-center text-rose-300">{error || 'Project not found'}</div></DashboardLayout>;
  }

  const { project, boq, deliveries, applications, passports } = projectData;

  return (
    <DashboardLayout title={project.name} roleName="Administrator" badgeColorClass="border-teal-300/20 bg-teal-400/10 text-teal-100">
      <button onClick={() => navigate('/admin/projects')} className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white">
        <ArrowLeft className="h-4 w-4" />
        Back to projects
      </button>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <Card title="Project Overview" subtitle="Published road project and AI estimation summary.">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Location</p>
                <p className="mt-2 text-sm text-slate-100">{project.city}, {project.district}, {project.state}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Status</p>
                <div className="mt-2 flex items-center gap-3">
                  <StatusBadge status={project.status} />
                  <select
                    value={project.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="rounded-xl border border-white/10 bg-slate-950/65 px-3 py-2 text-xs text-slate-200 outline-none"
                  >
                    <option value="OPEN_FOR_BIDDING">Open for bidding</option>
                    <option value="ASSIGNED">Assigned</option>
                    <option value="IN_PROGRESS">In progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Road Geometry</p>
                <p className="mt-2 text-sm text-slate-100">{project.road_length} km x {project.road_width} m</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Assigned Contractor</p>
                <p className="mt-2 text-sm text-slate-100">{project.contractor_name || 'Not assigned yet'}</p>
              </div>
            </div>

            <div className="mt-6 rounded-[1.25rem] border border-white/8 bg-white/[0.03] p-4">
              <div className="mb-4 flex items-center gap-2 text-slate-100">
                <Package className="h-4 w-4 text-teal-200" />
                AI Material Estimation
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-xl border border-white/8 bg-slate-950/45 p-3 text-sm text-slate-200">Bitumen: {boq?.bitumen}</div>
                <div className="rounded-xl border border-white/8 bg-slate-950/45 p-3 text-sm text-slate-200">Aggregate: {boq?.aggregate}</div>
                <div className="rounded-xl border border-white/8 bg-slate-950/45 p-3 text-sm text-slate-200">Sand: {boq?.sand}</div>
                <div className="rounded-xl border border-white/8 bg-slate-950/45 p-3 text-sm text-slate-200">Cement: {boq?.cement}</div>
                <div className="rounded-xl border border-emerald-300/15 bg-emerald-400/10 p-3 text-sm text-emerald-100">
                  Estimated Cost: Rs {Number(boq?.estimated_cost || 0).toLocaleString()}
                </div>
                <div className="rounded-xl border border-white/8 bg-slate-950/45 p-3 text-sm text-slate-200">
                  Soil Report: {project.soil_report_file || 'Text summary only'}
                </div>
              </div>
            </div>
          </Card>

          <Card title="Contractor Applications" subtitle="Review bids and assign the selected contractor.">
            <div className="space-y-4">
              {applications.length === 0 ? (
                <p className="text-sm text-slate-400">No contractor applications yet.</p>
              ) : (
                applications.map((application) => (
                  <div key={application.id} className="rounded-[1.3rem] border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-slate-100">{application.contractor_name}</p>
                        <p className="mt-1 text-xs text-slate-400">{application.contractor_email}</p>
                      </div>
                      <StatusBadge status={application.status} />
                    </div>
                    <p className="mt-3 text-sm text-slate-300">Bid Amount: Rs {Number(application.bid_amount || 0).toLocaleString()}</p>
                    <p className="mt-2 text-sm text-slate-400">{application.proposal_text || 'No proposal text provided.'}</p>
                    {application.status === 'PENDING' && (
                      <Button className="mt-4" onClick={() => handleApprove(application.id)}>
                        Approve Contractor
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Material Passport QR" subtitle="Generate QR-backed delivery passports for approved materials.">
            <div className="space-y-3">
              <input
                placeholder="Material type"
                value={passportDrafts[id]?.material_type || ''}
                onChange={(e) => setPassportDrafts((prev) => ({ ...prev, [id]: { ...prev[id], material_type: e.target.value } }))}
                className="w-full rounded-xl border border-white/10 bg-slate-950/55 px-4 py-3 text-sm text-slate-100 outline-none"
              />
              <input
                placeholder="Quantity"
                type="number"
                value={passportDrafts[id]?.quantity || ''}
                onChange={(e) => setPassportDrafts((prev) => ({ ...prev, [id]: { ...prev[id], quantity: e.target.value } }))}
                className="w-full rounded-xl border border-white/10 bg-slate-950/55 px-4 py-3 text-sm text-slate-100 outline-none"
              />
              <input
                placeholder="Truck number"
                value={passportDrafts[id]?.truck_number || ''}
                onChange={(e) => setPassportDrafts((prev) => ({ ...prev, [id]: { ...prev[id], truck_number: e.target.value } }))}
                className="w-full rounded-xl border border-white/10 bg-slate-950/55 px-4 py-3 text-sm text-slate-100 outline-none"
              />
              <input
                placeholder="Driver ID (optional)"
                value={passportDrafts[id]?.driver_id || ''}
                onChange={(e) => setPassportDrafts((prev) => ({ ...prev, [id]: { ...prev[id], driver_id: e.target.value } }))}
                className="w-full rounded-xl border border-white/10 bg-slate-950/55 px-4 py-3 text-sm text-slate-100 outline-none"
              />
              <Button onClick={handleCreatePassport}>Generate QR Passport</Button>
            </div>

            <div className="mt-6 space-y-3">
              {passports.length === 0 ? (
                <p className="text-sm text-slate-400">No material passports generated yet.</p>
              ) : (
                passports.map((passport) => (
                  <div key={passport.id} className="rounded-[1.25rem] border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-slate-100">{passport.material_type}</p>
                        <p className="mt-1 text-xs text-slate-400">{passport.quantity} units • {passport.truck_number}</p>
                      </div>
                      <StatusBadge status={passport.status} />
                    </div>
                    {passport.qr_code ? <img src={passport.qr_code} alt="Material passport QR" className="mt-4 h-32 w-32 rounded-lg bg-white p-2" /> : null}
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card title="Delivery History" subtitle="Driver and passport verification trail.">
            <div className="space-y-3">
              {deliveries.length === 0 ? (
                <p className="text-sm text-slate-400">No deliveries have been created for this project yet.</p>
              ) : (
                deliveries.map((delivery) => (
                  <div key={delivery.id} className="rounded-[1.25rem] border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Truck className="h-4 w-4 text-sky-200" />
                        <div>
                          <p className="text-sm font-medium text-slate-100">{delivery.material_type}</p>
                          <p className="mt-1 text-xs text-slate-400">{delivery.truck_number || 'Truck pending'} • {delivery.volume} units</p>
                        </div>
                      </div>
                      <StatusBadge status={delivery.status} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
