"use client";

import React, { useState } from "react";
import {
  Plus,
  Save,
  AlertCircle,
  CheckCircle,
  FileText,
  Loader,
} from "lucide-react";
import { Patient, Invoice, InvoiceLineItem, Payment } from "@/types";
import { billingApi } from "@/lib/billing-api";
import { PatientSearch } from "./PatientSearch";
import { LineItemEditor } from "./LineItemEditor";
import { PaymentForm } from "./PaymentForm";
import { PrintableInvoice } from "./PrintableInvoice";

type EditMode = "create" | "view" | "edit";

interface BillingCounterProps {
  initialInvoiceId?: string;
}

export const BillingCounter: React.FC<BillingCounterProps> = ({
  initialInvoiceId,
}) => {
  const [mode, setMode] = useState<EditMode>("create");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [lineItems, setLineItems] = useState<
    Omit<InvoiceLineItem, "id" | "invoiceId" | "createdAt" | "updatedAt">[]
  >([]);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [invoiceNotes, setInvoiceNotes] = useState("");
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPrint, setShowPrint] = useState(false);

  // Load invoice if initialInvoiceId provided
  React.useEffect(() => {
    if (initialInvoiceId && mode === "create") {
      loadInvoice(initialInvoiceId);
    }
  }, [initialInvoiceId, mode]);

  const loadInvoice = async (invoiceId: string) => {
    setLoading(true);
    setError(null);

    try {
      const invoice = await billingApi.getInvoice(invoiceId);
      if (invoice) {
        setCurrentInvoice(invoice);
        setSelectedPatient(invoice.patient || null);
        setLineItems(
          invoice.lineItems?.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            taxRate: item.taxRate,
            serviceType: item.serviceType,
            total: item.total,
          })) || []
        );
        setDiscountAmount(invoice.discountAmount);
        setInvoiceNotes(invoice.notes || "");
        setMode("view");
      }
    } catch (err) {
      setError("Failed to load invoice");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async () => {
    setError(null);
    setSuccess(false);

    // Validation
    if (!selectedPatient) {
      setError("Please select a patient");
      return;
    }

    if (lineItems.length === 0) {
      setError("Please add at least one line item");
      return;
    }

    setLoading(true);

    try {
      const invoice = await billingApi.createInvoice({
        patientId: selectedPatient.id,
        lineItems: lineItems.map((item) => ({
          ...item,
          serviceType: item.serviceType,
        })),
        discountAmount,
        notes: invoiceNotes,
      });

      if (invoice) {
        setCurrentInvoice(invoice);
        setMode("view");
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create invoice");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetForm = () => {
    setSelectedPatient(null);
    setLineItems([]);
    setDiscountAmount(0);
    setInvoiceNotes("");
    setCurrentInvoice(null);
    setMode("create");
    setError(null);
    setSuccess(false);
  };

  const handlePaymentProcessed = (payment: Payment) => {
    // Reload invoice to get updated totals
    if (currentInvoice) {
      loadInvoice(currentInvoice.id);
    }
  };

  if (loading && mode !== "create") {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="w-6 h-6 animate-spin text-pristine-600" />
      </div>
    );
  }

  // Invoice view/payment mode
  if (mode === "view" && currentInvoice) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Invoice {currentInvoice.invoiceNumber}
            </h1>
            <p className="text-gray-600">
              Patient: {currentInvoice.patient?.firstName}{" "}
              {currentInvoice.patient?.lastName}
            </p>
          </div>
          <button
            onClick={handleResetForm}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg transition-colors"
          >
            New Invoice
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-500 text-red-700 p-4 rounded-lg">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Success message */}
        {success && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-500 text-green-700 p-4 rounded-lg">
            <CheckCircle className="w-5 h-5" />
            Invoice created successfully!
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Printable invoice */}
          <div className="lg:col-span-2">
            <PrintableInvoice invoice={currentInvoice} />
          </div>

          {/* Payment form sidebar */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 h-fit">
            <PaymentForm
              invoice={currentInvoice}
              onPaymentProcessed={handlePaymentProcessed}
            />
          </div>
        </div>
      </div>
    );
  }

  // Create invoice mode
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create Invoice</h1>
        <p className="text-gray-600">Fast invoice creation for hospital cashier</p>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-500 text-red-700 p-4 rounded-lg">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-500 text-green-700 p-4 rounded-lg">
          <CheckCircle className="w-5 h-5" />
          Invoice created successfully!
        </div>
      )}

      {/* Main form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="space-y-6">
          {/* Patient search */}
          <div>
            <PatientSearch
              onPatientSelect={setSelectedPatient}
              disabled={loading}
            />
            {selectedPatient && (
              <div className="mt-4 p-4 bg-pristine-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {selectedPatient.firstName} {selectedPatient.lastName}
                    </p>
                    {selectedPatient.uhid && (
                      <p className="text-sm text-gray-600">
                        UHID: {selectedPatient.uhid}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">
                      {selectedPatient.phone}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedPatient(null)}
                    className="text-sm text-pristine-600 hover:text-pristine-700 font-medium"
                  >
                    Change
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Line items editor */}
          {selectedPatient && (
            <LineItemEditor
              lineItems={lineItems}
              onLineItemsChange={setLineItems}
            />
          )}

          {/* Discount and notes */}
          {lineItems.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Discount Amount (Optional)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pristine-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Invoice Notes (Optional)
                </label>
                <input
                  type="text"
                  value={invoiceNotes}
                  onChange={(e) => setInvoiceNotes(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pristine-500"
                  placeholder="Add any notes..."
                />
              </div>
            </div>
          )}

          {/* Action buttons */}
          {lineItems.length > 0 && (
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleCreateInvoice}
                disabled={!selectedPatient || loading}
                className="flex-1 flex items-center justify-center gap-2 bg-pristine-600 hover:bg-pristine-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Create Invoice
                  </>
                )}
              </button>
              <button
                onClick={handleResetForm}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                Reset
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
