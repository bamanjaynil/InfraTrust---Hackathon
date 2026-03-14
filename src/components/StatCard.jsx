import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = 'emerald' }) => {
  const colors = {
    emerald: 'text-emerald-500 bg-emerald-500/10',
    blue: 'text-blue-500 bg-blue-500/10',
    purple: 'text-purple-500 bg-purple-500/10',
    amber: 'text-amber-500 bg-amber-500/10',
    red: 'text-red-500 bg-red-500/10',
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
      <div className={`p-2 w-fit rounded-lg mb-4 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-sm text-zinc-400 font-medium">{title}</p>
      <p className="text-2xl font-bold text-zinc-100 mt-1">{value}</p>
    </div>
  );
};

export default StatCard;
