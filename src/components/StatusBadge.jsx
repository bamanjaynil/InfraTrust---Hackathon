import React from 'react';

const StatusBadge = ({ status }) => {
  const getStatusStyles = (status) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
      case 'DISPATCHED':
      case 'RESOLVED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'COMPLETED':
      case 'DELIVERED':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'FAILED':
      case 'CANCELLED':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'OPEN':
      case 'PENDING':
      case 'PLANNED':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
  };

  return (
    <span className={`px-2.5 py-1 inline-flex text-xs font-medium rounded-full border ${getStatusStyles(status)}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
