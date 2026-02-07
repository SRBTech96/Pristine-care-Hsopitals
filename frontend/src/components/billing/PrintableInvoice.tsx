"use client";

import React, { useState } from "react";
import { Printer, CheckCircle, AlertCircle, Loader } from "lucide-react";
import { Invoice } from "@/types";
import { billingApi } from "@/lib/billing-api";
import { printInvoice, PrintResult } from "@/lib/printer-service";

interface PrintableInvoiceProps {
  invoice: Invoice;
  onPrint?: () => void;
}

type PrinterType = "thermal" | "a4";

export const PrintableInvoice: React.FC<PrintableInvoiceProps> = ({
  invoice,
  onPrint,
}) => {
  const [printerType, setPrinterType] = useState<PrinterType>("a4");
  const [printStatus, setPrintStatus] = useState<PrintResult | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const getPrintableHTML = (): string => {
    const patient = invoice.patient;
    
    const paymentRows = invoice.payments && invoice.payments.length > 0 
      ? `
        <div style="margin-bottom: 24px; background-color: #f0fdf4; border: 1px solid #86efac; padding: 16px; border-radius: 6px;">
          <h4 style="font-weight: 600; color: #111827; margin-bottom: 8px;">Payment Information</h4>
          <div style="font-size: 14px; line-height: 1.6;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: #374151;">Amount Due:</span>
              <span style="font-weight: 500; color: #111827;">${billingApi.formatCurrency(invoice.totalAmount).replace('$', '')}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: #374151;">Amount Paid:</span>
              <span style="font-weight: 500; color: #16a34a;">${billingApi.formatCurrency(invoice.paidAmount).replace('$', '')}</span>
            </div>
            ${invoice.dueAmount > 0 ? `
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #374151;">Amount Due:</span>
                <span style="font-weight: 500; color: #dc2626;">${billingApi.formatCurrency(invoice.dueAmount).replace('$', '')}</span>
              </div>
            ` : ''}
          </div>
        </div>
      ` : '';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Invoice ${invoice.invoiceNumber}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background: white;
            color: #1f2937;
            line-height: 1.5;
          }
          .invoice-container {
            max-width: 900px;
            margin: 0 auto;
            padding: 32px;
            background: white;
          }
          @page {
            ${printerType === 'thermal' 
              ? 'size: 80mm 200mm; margin: 0.25in;'
              : 'size: A4; margin: 0.5in;'
            }
          }
          .header {
            border-bottom: 2px solid #111827;
            padding-bottom: 24px;
            margin-bottom: 24px;
          }
          .header-flex {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 24px;
          }
          .hospital-name {
            font-size: 24px;
            font-weight: bold;
            color: #111827;
          }
          .tagline {
            color: #6b7280;
            font-size: 13px;
          }
          .invoice-num {
            text-align: right;
          }
          .invoice-label {
            font-size: 13px;
            font-weight: 600;
            color: #111827;
          }
          .invoice-number {
            font-size: 18px;
            font-weight: bold;
            color: #0369a1;
          }
          .header-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 32px;
            font-size: 13px;
          }
          .header-section p {
            font-weight: 600;
            color: #111827;
            margin-bottom: 8px;
          }
          .header-section p:last-of-type {
            margin-bottom: 0;
          }
          .header-detail {
            color: #374151;
            margin-bottom: 2px;
          }
          .patient-section {
            margin-bottom: 24px;
          }
          .section-title {
            font-size: 13px;
            font-weight: 600;
            color: #111827;
            margin-bottom: 8px;
          }
          .patient-box {
            background-color: #f3f4f6;
            padding: 16px;
            border-radius: 6px;
            font-size: 13px;
          }
          .patient-name {
            font-weight: 600;
            color: #111827;
          }
          .patient-detail {
            color: #6b7280;
            margin-bottom: 2px;
          }
          table {
            width: 100%;
            font-size: 13px;
            border-collapse: collapse;
            margin-bottom: 24px;
          }
          thead tr {
            background-color: #1f2937;
            color: white;
          }
          th {
            text-align: left;
            padding: 12px;
            font-weight: 600;
          }
          td {
            padding: 12px;
            border-bottom: 1px solid #d1d5db;
          }
          tbody tr:hover {
            background-color: #f9fafb;
          }
          .text-right {
            text-align: right;
          }
          .font-medium {
            font-weight: 500;
          }
          .description {
            color: #111827;
          }
          .service-type {
            font-size: 12px;
            color: #6b7280;
          }
          .totals-container {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 24px;
          }
          .totals-box {
            width: 384px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            font-size: 13px;
            margin-bottom: 8px;
          }
          .total-label {
            color: #6b7280;
          }
          .total-value {
            color: #111827;
            font-weight: 500;
          }
          .total-border {
            border-top: 2px solid #111827;
            padding-top: 8px;
            margin-bottom: 8px;
          }
          .grand-total {
            font-weight: bold;
            font-size: 16px;
            color: #0369a1;
          }
          .payment-section {
            margin-bottom: 24px;
            background-color: #f0fdf4;
            border: 1px solid #86efac;
            padding: 16px;
            border-radius: 6px;
          }
          .payment-title {
            font-weight: 600;
            color: #111827;
            margin-bottom: 8px;
          }
          .notes-section {
            margin-bottom: 24px;
          }
          .notes-content {
            font-size: 13px;
            color: #374151;
            background-color: #f9fafb;
            padding: 12px;
            border-radius: 6px;
          }
          .footer {
            border-top: 2px solid #111827;
            padding-top: 24px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
          }
          .footer p {
            margin-bottom: 8px;
          }
          .negative {
            color: #dc2626;
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <!-- Header -->
          <div class="header">
            <div class="header-flex">
              <div>
                <div class="hospital-name">PRISTINE HOSPITAL</div>
                <p class="tagline">Healthcare Excellence • Compassionate Care</p>
              </div>
              <div class="invoice-num">
                <p class="invoice-label">INVOICE</p>
                <p class="invoice-number">${invoice.invoiceNumber}</p>
              </div>
            </div>

            <!-- Contact info -->
            <div class="header-grid">
              <div class="header-section">
                <p>Hospital Details</p>
                <p class="header-detail">123 Medical Plaza, Healthcare City</p>
                <p class="header-detail">State 123456, India</p>
                <p class="header-detail">Phone: +91 (123) 456-7890</p>
                <p class="header-detail">Email: billing@pristinehospital.com</p>
              </div>
              <div class="header-section">
                <p>Invoice Details</p>
                <p class="header-detail">
                  <span>Invoice Date: </span>
                  <strong>${billingApi.formatDate(invoice.invoiceDate)}</strong>
                </p>
                ${invoice.dueDate ? `
                  <p class="header-detail">
                    <span>Due Date: </span>
                    <strong>${billingApi.formatDate(invoice.dueDate)}</strong>
                  </p>
                ` : ''}
                <p class="header-detail">
                  <span>Status: </span>
                  <strong>${invoice.status.toUpperCase()}</strong>
                </p>
              </div>
            </div>
          </div>

          <!-- Patient details -->
          ${patient ? `
            <div class="patient-section">
              <h3 class="section-title">Bill To:</h3>
              <div class="patient-box">
                <p class="patient-name">${patient.firstName} ${patient.lastName}</p>
                ${patient.uhid ? `<p class="patient-detail">UHID: ${patient.uhid}</p>` : ''}
                ${patient.phone ? `<p class="patient-detail">Phone: ${patient.phone}</p>` : ''}
                ${patient.email ? `<p class="patient-detail">Email: ${patient.email}</p>` : ''}
                ${patient.address ? `
                  <p class="patient-detail">
                    ${patient.address}${patient.city ? `, ${patient.city}` : ''}${patient.state ? `, ${patient.state}` : ''}${patient.zipCode ? ` ${patient.zipCode}` : ''}
                  </p>
                ` : ''}
              </div>
            </div>
          ` : ''}

          <!-- Line items table -->
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Unit Price</th>
                <th class="text-right">Tax %</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.lineItems?.map((item) => `
                <tr>
                  <td>
                    <p class="description">${item.description}</p>
                    <p class="service-type">Service: ${item.serviceType}</p>
                  </td>
                  <td class="text-right">${item.quantity}</td>
                  <td class="text-right">${billingApi.formatCurrency(item.unitPrice).replace('$', '')}</td>
                  <td class="text-right">${item.taxRate}%</td>
                  <td class="text-right font-medium">${billingApi.formatCurrency(item.total).replace('$', '')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <!-- Totals section -->
          <div class="totals-container">
            <div class="totals-box">
              <div class="total-row">
                <span class="total-label">Subtotal:</span>
                <span class="total-value">${billingApi.formatCurrency(invoice.subtotal).replace('$', '')}</span>
              </div>
              <div class="total-row">
                <span class="total-label">Tax (GST):</span>
                <span class="total-value">${billingApi.formatCurrency(invoice.taxAmount).replace('$', '')}</span>
              </div>
              ${invoice.discountAmount > 0 ? `
                <div class="total-row">
                  <span class="total-label">Discount:</span>
                  <span class="total-value negative">-${billingApi.formatCurrency(invoice.discountAmount).replace('$', '')}</span>
                </div>
              ` : ''}
              <div class="total-row total-border">
                <span class="total-label" style="font-weight: bold;">Total Amount:</span>
                <span class="grand-total">${billingApi.formatCurrency(invoice.totalAmount).replace('$', '')}</span>
              </div>
            </div>
          </div>

          <!-- Payment section -->
          ${paymentRows}

          <!-- Notes -->
          ${invoice.notes ? `
            <div class="notes-section">
              <p class="section-title">Notes:</p>
              <p class="notes-content">${invoice.notes}</p>
            </div>
          ` : ''}

          <!-- Footer -->
          <div class="footer">
            <p>Thank you for choosing Pristine Hospital for your healthcare needs.</p>
            <p>For queries, contact: billing@pristinehospital.com</p>
            <p style="color: #9ca3af; margin-top: 8px;">This is a computer-generated invoice and does not require a signature.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return html;
  };

  const handlePrint = async () => {
    try {
      setIsPrinting(true);
      setPrintStatus(null);

      const html = getPrintableHTML();
      const result = await printInvoice({
        html,
        printerType,
        invoiceNumber: invoice.invoiceNumber,
      });

      setPrintStatus(result);
      onPrint?.();

      // Clear status after 4 seconds unless it's an error
      if (result.success) {
        setTimeout(() => {
          setPrintStatus(null);
        }, 4000);
      }
    } catch (error) {
      console.error("Print error:", error);
      setPrintStatus({
        success: false,
        method: "browser",
        message: "Print failed. Using browser print.",
      });
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Print status message */}
      {printStatus && (
        <div
          className={`flex items-center gap-3 p-4 rounded-lg border ${
            printStatus.success
              ? "bg-green-50 border-green-500 text-green-700"
              : "bg-red-50 border-red-500 text-red-700"
          }`}
        >
          {printStatus.success ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <div>
            <p className="font-medium">{printStatus.message}</p>
            <p className="text-sm">
              Method: <span className="font-semibold">{printStatus.method}</span>
            </p>
          </div>
        </div>
      )}

      {/* Print controls */}
      <div className="flex items-center gap-4 print:hidden bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Printer Type
          </label>
          <select
            value={printerType}
            onChange={(e) => setPrinterType(e.target.value as PrinterType)}
            disabled={isPrinting}
            className="w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pristine-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="a4">A4 (Standard Paper)</option>
            <option value="thermal">Thermal (80mm Receipt)</option>
          </select>
        </div>
        <button
          onClick={handlePrint}
          disabled={isPrinting}
          className="flex items-center gap-2 bg-pristine-600 hover:bg-pristine-700 disabled:bg-gray-400 text-white font-semibold px-4 py-2 rounded-lg transition-colors disabled:cursor-not-allowed h-fit"
        >
          {isPrinting ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Printing...
            </>
          ) : (
            <>
              <Printer className="w-4 h-4" />
              Print Invoice
            </>
          )}
        </button>
      </div>

      {/* Invoice content - visible in print */}
      <div className="bg-white p-8 print:p-0">
        {/* Header */}
        <div className="border-b-2 border-gray-900 pb-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                PRISTINE HOSPITAL
              </h1>
              <p className="text-gray-600 text-sm">
                Healthcare Excellence • Compassionate Care
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">INVOICE</p>
              <p className="text-lg font-bold text-pristine-600">
                {invoice.invoiceNumber}
              </p>
            </div>
          </div>

          {/* Contact info */}
          <div className="grid grid-cols-2 gap-8 text-sm text-gray-700">
            <div>
              <p className="font-semibold text-gray-900 mb-2">Hospital Details</p>
              <p>123 Medical Plaza, Healthcare City</p>
              <p>State 123456, India</p>
              <p>Phone: +91 (123) 456-7890</p>
              <p>Email: billing@pristinehospital.com</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-2">Invoice Details</p>
              <p>
                <span className="text-gray-600">Invoice Date:</span>{" "}
                <span className="font-medium">
                  {billingApi.formatDate(invoice.invoiceDate)}
                </span>
              </p>
              {invoice.dueDate && (
                <p>
                  <span className="text-gray-600">Due Date:</span>{" "}
                  <span className="font-medium">
                    {billingApi.formatDate(invoice.dueDate)}
                  </span>
                </p>
              )}
              <p>
                <span className="text-gray-600">Status:</span>{" "}
                <span className={`font-medium px-2 py-1 rounded text-xs ${
                  invoice.status === "paid"
                    ? "bg-green-100 text-green-800"
                    : invoice.status === "partial"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}>
                  {invoice.status.toUpperCase()}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Patient details */}
        {patient && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Bill To:
            </h3>
            <div className="bg-gray-50 p-4 rounded">
              <p className="font-semibold text-gray-900">
                {patient.firstName} {patient.lastName}
              </p>
              {patient.uhid && (
                <p className="text-sm text-gray-600">UHID: {patient.uhid}</p>
              )}
              {patient.phone && (
                <p className="text-sm text-gray-600">Phone: {patient.phone}</p>
              )}
              {patient.email && (
                <p className="text-sm text-gray-600">Email: {patient.email}</p>
              )}
              {patient.address && (
                <p className="text-sm text-gray-600">
                  {patient.address}
                  {patient.city && `, ${patient.city}`}
                  {patient.state && `, ${patient.state}`}
                  {patient.zipCode && ` ${patient.zipCode}`}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Line items table */}
        <div className="mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-900 text-white">
                <th className="text-left p-3 font-semibold">Description</th>
                <th className="text-right p-3 font-semibold">Qty</th>
                <th className="text-right p-3 font-semibold">Unit Price</th>
                <th className="text-right p-3 font-semibold">Tax %</th>
                <th className="text-right p-3 font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems?.map((item, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-300 hover:bg-gray-50"
                >
                  <td className="text-left p-3">
                    <p className="font-medium text-gray-900">
                      {item.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      Service: {item.serviceType}
                    </p>
                  </td>
                  <td className="text-right p-3">{item.quantity}</td>
                  <td className="text-right p-3">
                    {billingApi.formatCurrency(item.unitPrice)}
                  </td>
                  <td className="text-right p-3">{item.taxRate}%</td>
                  <td className="text-right p-3 font-medium text-gray-900">
                    {billingApi.formatCurrency(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals section */}
        <div className="flex justify-end mb-6">
          <div className="w-96">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700">Subtotal:</span>
                <span className="text-gray-900 font-medium">
                  {billingApi.formatCurrency(invoice.subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Tax (GST):</span>
                <span className="text-gray-900 font-medium">
                  {billingApi.formatCurrency(invoice.taxAmount)}
                </span>
              </div>
              {invoice.discountAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-700">Discount:</span>
                  <span className="text-gray-900 font-medium">
                    -{billingApi.formatCurrency(invoice.discountAmount)}
                  </span>
                </div>
              )}
              <div className="border-t-2 border-gray-900 pt-2 flex justify-between">
                <span className="text-gray-900 font-bold">Total Amount:</span>
                <span className="text-lg font-bold text-pristine-600">
                  {billingApi.formatCurrency(invoice.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment section */}
        {invoice.payments && invoice.payments.length > 0 && (
          <div className="mb-6 bg-green-50 border border-green-300 p-4 rounded">
            <h4 className="font-semibold text-gray-900 mb-2">
              Payment Information
            </h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-700">Amount Due:</span>
                <span className="font-medium text-gray-900">
                  {billingApi.formatCurrency(invoice.totalAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Amount Paid:</span>
                <span className="font-medium text-green-700">
                  {billingApi.formatCurrency(invoice.paidAmount)}
                </span>
              </div>
              {invoice.dueAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-700">Amount Due:</span>
                  <span className="font-medium text-red-700">
                    {billingApi.formatCurrency(invoice.dueAmount)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {invoice.notes && (
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-900 mb-2">Notes:</p>
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
              {invoice.notes}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="border-t-2 border-gray-900 pt-6 text-center text-xs text-gray-600">
          <p>Thank you for choosing Pristine Hospital for your healthcare needs.</p>
          <p className="mt-2">For queries, contact: billing@pristinehospital.com</p>
          <p className="mt-4 text-gray-500">
            This is a computer-generated invoice and does not require a signature.
          </p>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            background: white;
            color: black;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .print\\:p-0 {
            padding: 0 !important;
          }
          
          @page {
            size: A4;
            margin: 0.5in;
          }
          
          table {
            break-inside: avoid;
          }
          
          tr {
            break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
};
