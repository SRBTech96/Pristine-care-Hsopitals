"use client";

import React, { useState } from "react";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { InvoiceLineItem } from "@/types";
import { billingApi } from "@/lib/billing-api";

interface LineItemEditorProps {
  lineItems: Omit<InvoiceLineItem, "id" | "invoiceId" | "createdAt" | "updatedAt">[];
  onLineItemsChange: (
    items: Omit<InvoiceLineItem, "id" | "invoiceId" | "createdAt" | "updatedAt">[]
  ) => void;
  readonly?: boolean;
}

const SERVICE_TYPES = [
  { value: "consultation", label: "Consultation" },
  { value: "procedure", label: "Procedure" },
  { value: "medication", label: "Medication" },
  { value: "investigation", label: "Investigation" },
  { value: "bed_charge", label: "Bed Charge" },
  { value: "other", label: "Other" },
];

export const LineItemEditor: React.FC<LineItemEditorProps> = ({
  lineItems,
  onLineItemsChange,
  readonly = false,
}) => {
  const [newItem, setNewItem] = useState({
    description: "",
    quantity: 1,
    unitPrice: 0,
    taxRate: 18,
    serviceType: "consultation",
  });
  const [error, setError] = useState<string | null>(null);

  const handleAddItem = () => {
    setError(null);

    if (!newItem.description || newItem.quantity < 1 || newItem.unitPrice < 0) {
      setError("Please fill in all fields correctly");
      return;
    }

    const item = {
      ...newItem,
      total: newItem.quantity * newItem.unitPrice * (1 + newItem.taxRate / 100),
    };

    onLineItemsChange([...lineItems, item]);

    setNewItem({
      description: "",
      quantity: 1,
      unitPrice: 0,
      taxRate: 18,
      serviceType: "consultation",
    });
  };

  const handleRemoveItem = (index: number) => {
    onLineItemsChange(lineItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: string,
    value: any
  ) => {
    const updated = [...lineItems];
    (updated[index] as any)[field] = value;

    // Recalculate total
    if (field === "quantity" || field === "unitPrice" || field === "taxRate") {
      updated[index].total =
        updated[index].quantity *
        updated[index].unitPrice *
        (1 + updated[index].taxRate / 100);
    }

    onLineItemsChange(updated);
  };

  const totals = billingApi.calculateTotals(
    lineItems as InvoiceLineItem[],
    0
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Line Items</h3>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Line items table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-300 bg-gray-50">
              <th className="text-left p-3 font-medium text-gray-700">
                Description
              </th>
              <th className="text-right p-3 font-medium text-gray-700">
                Quantity
              </th>
              <th className="text-right p-3 font-medium text-gray-700">
                Unit Price
              </th>
              <th className="text-right p-3 font-medium text-gray-700">
                Tax %
              </th>
              <th className="text-right p-3 font-medium text-gray-700">
                Total
              </th>
              {!readonly && (
                <th className="text-center p-3 font-medium text-gray-700">
                  Action
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, index) => (
              <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="p-3">
                  {readonly ? (
                    <span className="text-gray-900">{item.description}</span>
                  ) : (
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) =>
                        handleItemChange(index, "description", e.target.value)
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-pristine-500"
                    />
                  )}
                </td>
                <td className="p-3 text-right">
                  {readonly ? (
                    <span className="text-gray-900">{item.quantity}</span>
                  ) : (
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "quantity",
                          Math.max(1, parseInt(e.target.value) || 1)
                        )
                      }
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-pristine-500"
                    />
                  )}
                </td>
                <td className="p-3 text-right">
                  {readonly ? (
                    <span className="text-gray-900">
                      {billingApi.formatCurrency(item.unitPrice)}
                    </span>
                  ) : (
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) =>
                        handleItemChange(index, "unitPrice", parseFloat(e.target.value) || 0)
                      }
                      className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-pristine-500"
                    />
                  )}
                </td>
                <td className="p-3 text-right">
                  {readonly ? (
                    <span className="text-gray-900">{item.taxRate}%</span>
                  ) : (
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={item.taxRate}
                      onChange={(e) =>
                        handleItemChange(index, "taxRate", parseFloat(e.target.value) || 0)
                      }
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-pristine-500"
                    />
                  )}
                </td>
                <td className="p-3 text-right font-medium text-gray-900">
                  {billingApi.formatCurrency(item.total)}
                </td>
                {!readonly && (
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleRemoveItem(index)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add new item form */}
      {!readonly && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <h4 className="font-medium text-gray-900">Add New Item</h4>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <input
                type="text"
                placeholder="Description"
                value={newItem.description}
                onChange={(e) =>
                  setNewItem({ ...newItem, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pristine-500"
              />
            </div>

            <div>
              <input
                type="number"
                placeholder="Qty"
                min="1"
                value={newItem.quantity}
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    quantity: Math.max(1, parseInt(e.target.value) || 1),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pristine-500"
              />
            </div>

            <div>
              <input
                type="number"
                placeholder="Unit Price"
                min="0"
                step="0.01"
                value={newItem.unitPrice}
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    unitPrice: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pristine-500"
              />
            </div>

            <button
              onClick={handleAddItem}
              className="flex items-center justify-center gap-2 bg-pristine-600 hover:bg-pristine-700 text-white font-medium py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
        </div>
      )}

      {/* Totals summary */}
      <div className="bg-pristine-50 rounded-lg p-4 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-700">Subtotal:</span>
          <span className="font-medium text-gray-900">
            {billingApi.formatCurrency(totals.subtotal)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-700">Tax:</span>
          <span className="font-medium text-gray-900">
            {billingApi.formatCurrency(totals.taxAmount)}
          </span>
        </div>
        <div className="border-t border-pristine-200 pt-2">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-900">Total:</span>
            <span className="text-xl font-bold text-pristine-600">
              {billingApi.formatCurrency(totals.totalAmount)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
