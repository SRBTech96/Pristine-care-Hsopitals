"use client";

import React from "react";

export const RevenueTable: React.FC<{ rows: { label: string; amount: number }[] }> = ({ rows }) => {
  return (
    <div className="bg-white rounded shadow-sm overflow-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {rows.map((r, idx) => (
            <tr key={idx}>
              <td className="px-4 py-2 text-sm text-gray-700">{r.label}</td>
              <td className="px-4 py-2 text-sm text-gray-900 text-right">${r.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const SimpleTable: React.FC<{ columns: string[]; rows: any[] }> = ({ columns, rows }) => {
  return (
    <div className="bg-white rounded shadow-sm overflow-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((c) => (
              <th key={c} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {rows.map((r, idx) => (
            <tr key={idx}>
              {columns.map((c, i) => (
                <td key={i} className="px-4 py-2 text-sm text-gray-700">{r[c] ?? ''}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
