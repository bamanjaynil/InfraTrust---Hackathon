import React, { useEffect } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import { Shield, TrendingUp, TrendingDown, AlertTriangle, Info } from 'lucide-react';
import useAdminStore from '../../../store/adminStore';

export default function AdminTrustScores() {
  const { contractors, fetchContractors, loading } = useAdminStore();

  useEffect(() => {
    fetchContractors();
  }, []);

  const getScoreStatus = (score) => {
    if (score >= 90) return { label: 'Excellent', color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
    if (score >= 75) return { label: 'Good', color: 'text-blue-500', bg: 'bg-blue-500/10' };
    if (score >= 60) return { label: 'Fair', color: 'text-amber-500', bg: 'bg-amber-500/10' };
    return { label: 'Poor', color: 'text-red-500', bg: 'bg-red-500/10' };
  };

  return (
    <DashboardLayout 
      title="Trust Score Analytics" 
      roleName="Administrator"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-zinc-200 font-semibold">Average Trust Score</h3>
          </div>
          <p className="text-3xl font-bold text-zinc-100">84.2</p>
          <p className="text-xs text-zinc-500 mt-2">+2.4% from last month</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-zinc-200 font-semibold">Low Score Alerts</h3>
          </div>
          <p className="text-3xl font-bold text-zinc-100">3</p>
          <p className="text-xs text-zinc-500 mt-2">Contractors below 60%</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-zinc-200 font-semibold">Total Audits</h3>
          </div>
          <p className="text-3xl font-bold text-zinc-100">128</p>
          <p className="text-xs text-zinc-500 mt-2">Completed this quarter</p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
          <h3 className="text-zinc-200 font-semibold">Contractor Performance Ranking</h3>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Info className="w-4 h-4" />
            Scores are calculated based on delivery accuracy, project timelines, and citizen reports.
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-800/50">
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Contractor</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Current Score</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-zinc-500">Loading analytics...</td>
                </tr>
              ) : contractors.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-zinc-500">No data available</td>
                </tr>
              ) : (
                contractors
                  .sort((a, b) => (b.trust_score || 100) - (a.trust_score || 100))
                  .map((contractor, index) => {
                    const status = getScoreStatus(contractor.trust_score || 100);
                    return (
                      <tr key={contractor.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-zinc-500">#{index + 1}</td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-zinc-200 font-medium">{contractor.name}</div>
                          <div className="text-xs text-zinc-500">{contractor.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`text-lg font-bold ${status.color}`}>{contractor.trust_score || 100}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color} border border-current opacity-80`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {index % 2 === 0 ? (
                            <div className="flex items-center gap-1 text-emerald-500 text-xs">
                              <TrendingUp className="w-3 h-3" /> +1.2%
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-red-500 text-xs">
                              <TrendingDown className="w-3 h-3" /> -0.5%
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
