"use client";

import { financeApi } from "./finance-api";

/**
 * Export utilities with backend-first, client-side fallback
 * Supports Excel (.xlsx) and PDF (.pdf) formats
 * Lazy-loads heavy libraries (xlsx, jsPDF) only when needed
 */

export interface ExportData {
  dailyRevenue?: Array<{ date: string; total: number }>;
  monthlyRevenue?: Array<{ date: string; total: number }>;
  revenueByDoctor?: Array<{ key: string; amount: number }>;
  revenueByDepartment?: Array<{ key: string; amount: number }>;
  expenses?: Array<{ date: string; total: number }>;
  pnl?: { revenue: number; expenses: number; profit: number };
}

export interface ExportFilters {
  startDate?: string;
  endDate?: string;
  doctorId?: string;
  departmentId?: string;
}

/**
 * Attempt backend export first, fall back to client-side
 */
export async function exportToExcel(
  report: string,
  data: ExportData,
  filters: ExportFilters,
  filename: string
) {
  try {
    // Try backend first
    const blob = await financeApi.exportReportExcel(report, filters);
    downloadBlob(blob, filename);
    return { success: true, method: "backend" };
  } catch (err) {
    console.warn("Backend Excel export failed, using client-side", err);
    // Fall back to client-side
    return generateExcelClientSide(data, filters, filename);
  }
}

/**
 * Attempt backend PDF export first, fall back to client-side
 */
export async function exportToPdf(
  report: string,
  data: ExportData,
  filters: ExportFilters,
  filename: string
) {
  try {
    // Try backend first
    const blob = await financeApi.exportReportPdf(report, filters);
    downloadBlob(blob, filename);
    return { success: true, method: "backend" };
  } catch (err) {
    console.warn("Backend PDF export failed, using client-side", err);
    // Fall back to client-side
    return generatePdfClientSide(data, filters, filename);
  }
}

/**
 * Generate Excel client-side using SheetJS (lazy-loaded)
 */
async function generateExcelClientSide(
  data: ExportData,
  filters: ExportFilters,
  filename: string
) {
  try {
    // Lazy-load xlsx only when needed
    const XLSX = (await import("xlsx")).default;

    const wb = XLSX.utils.book_new();

    // Summary sheet
    const summaryData = [
      ["PRISTINE HOSPITAL - FINANCIAL REPORT"],
      [],
      ["Report Generated", new Date().toLocaleString()],
      ...(filters.startDate || filters.endDate
        ? [
            [
              "Date Range",
              filters.startDate && filters.endDate
                ? `${filters.startDate} to ${filters.endDate}`
                : filters.startDate
                  ? `From ${filters.startDate}`
                  : `Until ${filters.endDate}`,
            ],
          ]
        : []),
      [],
    ];

    if (data.pnl) {
      summaryData.push(["PROFIT & LOSS SUMMARY"], [], [
        "Revenue",
        String(data.pnl.revenue),
      ]);
      summaryData.push(["Expenses", String(data.pnl.expenses)]);
      summaryData.push(["Profit", String(data.pnl.profit)]);
    }

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    summarySheet["!cols"] = [{ wch: 25 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");

    // Daily Revenue sheet
    if (data.dailyRevenue?.length) {
      const dailyData = [["Date", "Revenue"]];
      data.dailyRevenue.forEach((r) => dailyData.push([r.date, String(r.total)]));
      const dailySheet = XLSX.utils.aoa_to_sheet(dailyData);
      dailySheet["!cols"] = [{ wch: 15 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, dailySheet, "Daily Revenue");
    }

    // Monthly Revenue sheet
    if (data.monthlyRevenue?.length) {
      const monthlyData = [["Month", "Revenue"]];
      data.monthlyRevenue.forEach((r) => monthlyData.push([r.date, String(r.total)]));
      const monthlySheet = XLSX.utils.aoa_to_sheet(monthlyData);
      monthlySheet["!cols"] = [{ wch: 15 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, monthlySheet, "Monthly Revenue");
    }

    // Revenue by Doctor sheet
    if (data.revenueByDoctor?.length) {
      const doctorData = [["Doctor", "Revenue"]];
      data.revenueByDoctor.forEach((r) => doctorData.push([r.key, String(r.amount)]));
      const doctorSheet = XLSX.utils.aoa_to_sheet(doctorData);
      doctorSheet["!cols"] = [{ wch: 25 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, doctorSheet, "By Doctor");
    }

    // Revenue by Department sheet
    if (data.revenueByDepartment?.length) {
      const deptData = [["Department", "Revenue"]];
      data.revenueByDepartment.forEach((r) => deptData.push([r.key, String(r.amount)]));
      const deptSheet = XLSX.utils.aoa_to_sheet(deptData);
      deptSheet["!cols"] = [{ wch: 25 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, deptSheet, "By Department");
    }

    // Expenses sheet
    if (data.expenses?.length) {
      const expData = [["Date", "Amount"]];
      data.expenses.forEach((e) => expData.push([e.date, String(e.total)]));
      const expSheet = XLSX.utils.aoa_to_sheet(expData);
      expSheet["!cols"] = [{ wch: 15 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, expSheet, "Expenses");
    }

    XLSX.writeFile(wb, filename);
    return { success: true, method: "client-side" };
  } catch (err) {
    console.error("Excel generation failed:", err);
    return { success: false, error: String(err) };
  }
}

/**
 * Generate PDF client-side using jsPDF + autoTable (lazy-loaded)
 */
async function generatePdfClientSide(
  data: ExportData,
  filters: ExportFilters,
  filename: string
) {
  try {
    // Lazy-load jsPDF and autoTable
    const jsPDFModule = await import("jspdf");
    const { jsPDF } = jsPDFModule;
    await import("jspdf-autotable");

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    // Cast doc as any to access autoTable from jspdf-autotable
    const docAny = doc as any;
    let yPosition = 20;

    // Header
    doc.setFontSize(18);
    doc.text("PRISTINE HOSPITAL", 105, yPosition, { align: "center" });
    yPosition += 8;
    doc.setFontSize(12);
    doc.text("Financial Report", 105, yPosition, { align: "center" });
    yPosition += 8;

    // Report info
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, yPosition);
    yPosition += 6;

    if (filters.startDate || filters.endDate) {
      const dateRange =
        filters.startDate && filters.endDate
          ? `${filters.startDate} to ${filters.endDate}`
          : filters.startDate
            ? `From ${filters.startDate}`
            : `Until ${filters.endDate}`;
      doc.text(`Date Range: ${dateRange}`, 20, yPosition);
      yPosition += 6;
    }

    yPosition += 4; // spacing

    // P&L Summary
    if (data.pnl) {
      doc.setFontSize(12);
      doc.text("Profit & Loss Summary", 20, yPosition);
      yPosition += 7;

      const pnlData = [
        ["Category", "Amount"],
        ["Revenue", `$${data.pnl.revenue.toFixed(2)}`],
        ["Expenses", `$${data.pnl.expenses.toFixed(2)}`],
        [
          "Profit",
          `$${data.pnl.profit.toFixed(2)}`,
        ],
      ];

      doc.setFontSize(10);
      docAny.autoTable({
        head: [pnlData[0]],
        body: pnlData.slice(1),
        startY: yPosition,
        theme: "grid",
        headerStyles: { fillColor: [51, 65, 85], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
      });

      yPosition = docAny.lastAutoTable.finalY + 10;
    }

    // Revenue by Doctor
    if (data.revenueByDoctor?.length) {
      doc.setFontSize(12);
      doc.text("Revenue by Doctor", 20, yPosition);
      yPosition += 7;

      const tableData = [
        ["Doctor", "Revenue"],
        ...data.revenueByDoctor.map((r) => [r.key, `$${r.amount.toFixed(2)}`]),
      ];

      doc.setFontSize(10);
      docAny.autoTable({
        head: [tableData[0]],
        body: tableData.slice(1),
        startY: yPosition,
        theme: "grid",
        headerStyles: { fillColor: [51, 65, 85], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
      });

      yPosition = docAny.lastAutoTable.finalY + 10;
    }

    // Revenue by Department
    if (data.revenueByDepartment?.length && yPosition < 250) {
      doc.setFontSize(12);
      doc.text("Revenue by Department", 20, yPosition);
      yPosition += 7;

      const tableData = [
        ["Department", "Revenue"],
        ...data.revenueByDepartment.map((r) => [
          r.key,
          `$${r.amount.toFixed(2)}`,
        ]),
      ];

      doc.setFontSize(10);
      docAny.autoTable({
        head: [tableData[0]],
        body: tableData.slice(1),
        startY: yPosition,
        theme: "grid",
        headerStyles: { fillColor: [51, 65, 85], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
      });
    }

    // Footer
    const pageCount = docAny.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      docAny.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Page ${i} of ${pageCount}`,
        105,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      );
    }

    doc.save(filename);
    return { success: true, method: "client-side" };
  } catch (err) {
    console.error("PDF generation failed:", err);
    return { success: false, error: String(err) };
  }
}

/**
 * Helper: download blob as file
 */
function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
