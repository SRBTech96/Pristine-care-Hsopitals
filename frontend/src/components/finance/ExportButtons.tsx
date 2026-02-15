"use client";

import React from "react";
import { exportToExcel, exportToPdf, ExportData, ExportFilters } from "@/lib/export-utils";
import { AlertCircle, CheckCircle } from "lucide-react";

interface ExportButtonsProps {
  report: string;
  data: ExportData;
  filters: ExportFilters;
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({ report, data, filters }) => {
  const [loadingPdf, setLoadingPdf] = React.useState(false);
  const [loadingXls, setLoadingXls] = React.useState(false);
  const [status, setStatus] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

  const handlePdf = async () => {
    try {
      setLoadingPdf(true);
      setStatus(null);
      const result = await exportToPdf(report, data, filters, `${report}_${new Date().getTime()}.pdf`);
      if (result.success) {
        setStatus({
          type: "success",
          message: `PDF exported successfully (${result.method === "backend" ? "server-generated" : "client-generated"})`,
        });
        setTimeout(() => setStatus(null), 4000);
      } else {
        setStatus({ type: "error", message: ('error' in result ? result.error : undefined) || "PDF export failed" });
      }
    } catch (err) {
      setStatus({ type: "error", message: String(err) });
    } finally {
      setLoadingPdf(false);
    }
  };

  const handleExcel = async () => {
    try {
      setLoadingXls(true);
      setStatus(null);
      const result = await exportToExcel(report, data, filters, `${report}_${new Date().getTime()}.xlsx`);
      if (result.success) {
        setStatus({
          type: "success",
          message: `Excel exported successfully (${result.method === "backend" ? "server-generated" : "client-generated"})`,
        });
        setTimeout(() => setStatus(null), 4000);
      } else {
        setStatus({ type: "error", message: ('error' in result ? result.error : undefined) || "Excel export failed" });
      }
    } catch (err) {
      setStatus({ type: "error", message: String(err) });
    } finally {
      setLoadingXls(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <button
          onClick={handlePdf}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded disabled:opacity-50"
          disabled={loadingPdf || loadingXls}
        >
          {loadingPdf ? "Exporting PDF..." : "Export PDF"}
        </button>
        <button
          onClick={handleExcel}
          className="bg-gray-800 hover:bg-gray-900 text-white px-3 py-2 rounded disabled:opacity-50"
          disabled={loadingXls || loadingPdf}
        >
          {loadingXls ? "Exporting Excel..." : "Export Excel"}
        </button>
      </div>

      {status && (
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded text-sm ${
            status.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {status.type === "success" ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span>{status.message}</span>
        </div>
      )}
    </div>
  );
};
