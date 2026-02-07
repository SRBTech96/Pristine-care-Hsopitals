"use client";

import React from "react";

interface SummaryCardProps {
  title: string;
  subtitle?: string;
  amount: number;
  delta?: number;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ title, subtitle, amount, delta }) => {
  return (
    <div className="bg-white p-4 rounded shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">{title}</div>
          <div className="text-2xl font-semibold text-gray-900">${amount.toFixed(2)}</div>
          {subtitle && <div className="text-sm text-gray-400">{subtitle}</div>}
        </div>
        {typeof delta === "number" && (
          <div className={`px-3 py-1 rounded ${delta >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {delta >= 0 ? '+' : ''}{(delta*100).toFixed(1)}%
          </div>
        )}
      </div>
    </div>
  );
};
