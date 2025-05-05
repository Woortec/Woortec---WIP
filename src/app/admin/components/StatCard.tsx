// src/app/admin/components/StatCard.tsx
import React from 'react';

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  accent?: 'indigo' | 'green' | 'teal' | 'yellow';
}

const accentMap = {
  indigo: 'border-indigo-500',
  green:  'border-green-500',
  teal:   'border-teal-500',
  yellow: 'border-yellow-500',
};

export function StatCard({
  title,
  value,
  icon,
  accent = 'indigo',
}: StatCardProps) {
  return (
    <div
      className={`flex items-center bg-white rounded-lg shadow p-6 border-l-4 ${accentMap[accent]}`}
    >
      {icon && <div className="mr-4 text-3xl text-gray-400">{icon}</div>}
      <div>
        <h3 className="text-sm font-medium text-gray-500 uppercase">{title}</h3>
        <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
