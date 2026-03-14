import React from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import { User, Mail, Shield } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import Card from '../../../components/Card';

export default function DriverProfile() {
  const { user } = useAuthStore();

  return (
    <DashboardLayout 
      title="My Profile" 
      roleName="Driver"
      badgeColorClass="bg-blue-500/10 text-blue-500 border-blue-500/20"
    >
      <div className="max-w-2xl mx-auto">
        <Card>
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center text-4xl font-bold text-zinc-300 border-4 border-zinc-900 shadow-xl">
              {user?.name?.charAt(0) || 'D'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-zinc-100">{user?.name || 'Driver User'}</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border bg-blue-500/10 text-blue-500 border-blue-500/20">
                  {user?.role || 'DRIVER'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-6 border-t border-zinc-800 pt-6">
            <div className="flex items-center gap-4 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
              <div className="p-3 rounded-lg bg-zinc-800 text-zinc-400">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Full Name</p>
                <p className="text-sm font-medium text-zinc-200 mt-1">{user?.name || 'Driver User'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
              <div className="p-3 rounded-lg bg-zinc-800 text-zinc-400">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Email Address</p>
                <p className="text-sm font-medium text-zinc-200 mt-1">{user?.email || 'driver@example.com'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
              <div className="p-3 rounded-lg bg-zinc-800 text-zinc-400">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Account Status</p>
                <p className="text-sm font-medium text-emerald-500 mt-1">Active & Verified</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
