"use client";

import React from "react";
import { Printer } from "lucide-react";
import { Invoice } from "@/types";
import { billingApi } from "@/lib/billing-api";

interface PrintableInvoiceProps {
  invoice: Invoice;
  onPrint?: () => void;
}

export const PrintableInvoice: React.FC<PrintableInvoiceProps> = ({
  invoice,
  onPrint,
}) => {
  const handlePrint = () => {
    window.print();
    onPrint?.();
  };

  const patient = invoice.patient;

  return (
    <div className="space-y-4">
      {/* Print button - hidden in print */}
      <div className="flex justify-end print:hidden">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-pristine-600 hover:bg-pristine-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Printer className="w-4 h-4" />
          Print Invoice
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
