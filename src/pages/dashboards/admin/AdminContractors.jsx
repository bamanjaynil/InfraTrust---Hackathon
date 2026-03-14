import React, { useEffect } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import { Users, Shield, Star, AlertTriangle, ExternalLink, Mail, Phone, Search, Filter } from 'lucide-react';
import useAdminStore from '../../../store/adminStore';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import StatusBadge from '../../../components/StatusBadge';

export default function AdminContractors() {
  const { contractors, fetchContractors, loading, error } = useAdminStore();

  useEffect(() => {
    fetchContractors();
  }, [fetchContractors]);

  const getTrustScoreColor = (score) => {
    if (score >= 90) return 'text-emerald-500';
    if (score >= 70) return 'text-blue-500';
    if (score >= 50) return 'text-amber-500';
    return 'text-red-500';
  };

  const getTrustScoreBg = (score) => {
    if (score >= 90) return 'bg-emerald-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <DashboardLayout 
      title="Contractor Management" 
      roleName="Administrator"
      badgeColorClass="bg-blue-500/10 text-blue-500 border-blue-500/20"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search contractors by name, email, ID..." 
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 pl-10 pr-4 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 transition-colors"
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
              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-zinc-400 text-sm">Loading contractors...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-400">
              <p>{error}</p>
              <Button onClick={() => fetchContractors()} className="mt-4 w-auto mx-auto">Retry</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-800">
                <thead className="bg-zinc-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Contractor</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Contact Details</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">InfraTrust Score</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 bg-zinc-900">
                  {contractors.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <Users className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                        <p className="text-zinc-500">No contractors found</p>
                      </td>
                    </tr>
                  ) : (
                    contractors.map((contractor) => {
                      const score = contractor.infra_trust_score || 100;
                      return (
                        <tr key={contractor.id} className="hover:bg-zinc-800/30 transition-colors group">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 border border-zinc-700 group-hover:border-blue-500/50 transition-colors">
                                <Users className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-zinc-200">{contractor.name}</p>
                                <p className="text-xs text-zinc-500 mt-0.5 font-mono">ID: {contractor.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-xs text-zinc-400">
                                <Mail className="w-3 h-3" /> {contractor.email}
                              </div>
                              {contractor.phone && (
                                <div className="flex items-center gap-2 text-xs text-zinc-400">
                                  <Phone className="w-3 h-3" /> {contractor.phone}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className={`text-lg font-bold ${getTrustScoreColor(score)}`}>
                                {score}
                              </div>
                              <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${getTrustScoreBg(score)}`}
                                  style={{ width: `${score}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status="ACTIVE" />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <Button className="p-2 w-auto bg-transparent hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })
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
