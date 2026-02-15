"use client";

import React, { useState } from "react";
import { Invoice, Payment } from "@/types";
import { billingApi } from "@/lib/billing-api";

interface PaymentFormProps {
  invoice: Invoice;
  onPaymentProcessed: (payment: Payment) => void;
}

export function PaymentForm({ invoice, onPaymentProcessed }: PaymentFormProps) {
  const [amount, setAmount] = useState<string>(
    invoice.dueAmount?.toString() ?? "0"
  );
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "card" | "check" | "upi" | "bank_transfer"
  >("cash");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (numAmount > (invoice.dueAmount ?? 0)) {
      setError("Amount cannot exceed due amount");
      return;
    }

    setIsProcessing(true);
    try {
      const payment = await billingApi.createPayment({
        invoiceId: invoice.id,
        amount: numAmount,
        paymentMethod,
        referenceNumber: referenceNumber || undefined,
        notes: notes || undefined,
      });
      if (payment) onPaymentProcessed(payment);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to process payment"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Process Payment</h3>

      <div className="bg-gray-50 rounded p-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Invoice Total</span>
          <span className="font-medium">
            ₹{invoice.totalAmount?.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Paid</span>
          <span className="font-medium text-green-600">
            ₹{invoice.paidAmount?.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between border-t pt-1 mt-1">
          <span className="text-gray-800 font-medium">Due</span>
          <span className="font-bold text-red-600">
            ₹{invoice.dueAmount?.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Amount (₹)
        </label>
        <input
          type="number"
          step="0.01"
          min="0.01"
          max={invoice.dueAmount ?? 0}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      {/* Payment Method */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Payment Method
        </label>
        <select
          value={paymentMethod}
          onChange={(e) =>
            setPaymentMethod(
              e.target.value as
                | "cash"
                | "card"
                | "check"
                | "upi"
                | "bank_transfer"
            )
          }
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="upi">UPI</option>
          <option value="bank_transfer">Bank Transfer</option>
          <option value="check">Cheque</option>
        </select>
      </div>

      {/* Reference Number */}
      {paymentMethod !== "cash" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reference Number
          </label>
          <input
            type="text"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            placeholder="Transaction / Cheque number"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      )}

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded p-2">{error}</p>
      )}

      <button
        type="submit"
        disabled={isProcessing}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors text-sm"
      >
        {isProcessing ? "Processing..." : `Pay ₹${amount || "0"}`}
      </button>
    </form>
  );
}
