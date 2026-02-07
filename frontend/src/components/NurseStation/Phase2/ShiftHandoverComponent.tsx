// frontend/src/components/NurseStation/Phase2/ShiftHandoverComponent.tsx
import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Send,
  Eye,
  Download,
} from 'lucide-react';

interface CriticalItem {
  patientId: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface HandoverData {
  id?: string;
  wardId: string;
  fromNurseId: string;
  toNurseId: string;
  notes: string;
  criticalItems: CriticalItem[];
  status: 'pending' | 'acknowledged' | 'reviewed';
  createdAt?: Date;
  acknowledgedAt?: Date;
  reviewedAt?: Date;
}

export const ShiftHandoverComponent: React.FC<{
  wardId: string;
  currentNurseId: string;
  onHandoverSubmit: (data: HandoverData) => void;
}> = ({ wardId, currentNurseId, onHandoverSubmit }) => {
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [handoverNotes, setHandoverNotes] = useState('');
  const [criticalItems, setCriticalItems] = useState<CriticalItem[]>([]);
  const [newItem, setNewItem] = useState<CriticalItem>({
    patientId: '',
    description: '',
    severity: 'medium',
  });
  const [selectedHandover, setSelectedHandover] = useState<HandoverData | null>(
    null
  );
  const [acknowledgedNotes, setAcknowledgedNotes] = useState('');
  const [handovers, setHandovers] = useState<HandoverData[]>([]);

  const handleAddCriticalItem = () => {
    if (newItem.patientId && newItem.description) {
      setCriticalItems([...criticalItems, newItem]);
      setNewItem({ patientId: '', description: '', severity: 'medium' });
    }
  };

  const handleRemoveCriticalItem = (index: number) => {
    setCriticalItems(criticalItems.filter((_, i) => i !== index));
  };

  const handleSubmitHandover = () => {
    const handover: HandoverData = {
      wardId,
      fromNurseId: currentNurseId,
      toNurseId: '', // Would be selected from incoming nurse
      notes: handoverNotes,
      criticalItems,
      status: 'pending',
    };
    onHandoverSubmit(handover);
    setHandoverNotes('');
    setCriticalItems([]);
  };

  const handleAcknowledgeHandover = () => {
    if (selectedHandover) {
      // API call to acknowledge
      console.log('Acknowledging handover:', selectedHandover.id);
    }
  };

  const getSeverityColor = (
    severity: 'low' | 'medium' | 'high' | 'critical'
  ) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-800">Shift Handover</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'create'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Create Handover
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            History
          </button>
        </div>
      </div>

      {activeTab === 'create' && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Handover Notes
            </label>
            <textarea
              value={handoverNotes}
              onChange={(e) => setHandoverNotes(e.target.value)}
              placeholder="Document outgoing nurse's observations, pending tasks, and important notes..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={5}
            />
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Critical Items for Incoming Nurse
            </h3>

            <div className="space-y-3 mb-4">
              {criticalItems.map((item, index) => (
                <div
                  key={index}
                  className={`p-3 rounded border-l-4 ${getSeverityColor(
                    item.severity
                  )}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Patient {item.patientId}</p>
                      <p className="text-sm mt-1">{item.description}</p>
                      <span className="inline-block mt-2 text-xs px-2 py-1 rounded bg-white bg-opacity-50">
                        {item.severity.toUpperCase()}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveCriticalItem(index)}
                      className="text-red-600 hover:bg-red-50 p-1 rounded"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Patient ID
                  </label>
                  <input
                    type="text"
                    value={newItem.patientId}
                    onChange={(e) =>
                      setNewItem({ ...newItem, patientId: e.target.value })
                    }
                    placeholder="e.g., P001"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Severity
                  </label>
                  <select
                    value={newItem.severity}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        severity: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={newItem.description}
                  onChange={(e) =>
                    setNewItem({ ...newItem, description: e.target.value })
                  }
                  placeholder="Describe the critical issue..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <button
                onClick={handleAddCriticalItem}
                className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition font-medium"
              >
                Add Critical Item
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={handleSubmitHandover}
              disabled={!handoverNotes.trim()}
              className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-medium flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Submit Handover
            </button>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          {handovers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No handover history available</p>
            </div>
          ) : (
            handovers.map((h) => (
              <div
                key={h.id}
                className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedHandover(h)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      {h.status === 'reviewed' && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                      {h.status === 'acknowledged' && (
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      )}
                      {h.status === 'pending' && (
                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                      )}
                      <h3 className="font-semibold">Shift Handover</h3>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(h.createdAt || '').toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      Status:{' '}
                      <span className="font-medium capitalize">{h.status}</span>
                    </p>
                  </div>
                  <Eye className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {selectedHandover && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white flex justify-between items-center">
              <h3 className="text-lg font-bold">Handover Details</h3>
              <button
                onClick={() => setSelectedHandover(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-semibold capitalize">{selectedHandover.status}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Notes</p>
                <p className="text-gray-700">{selectedHandover.notes}</p>
              </div>

              {selectedHandover.criticalItems.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-3">Critical Items</p>
                  <div className="space-y-2">
                    {selectedHandover.criticalItems.map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded border-l-4 ${getSeverityColor(
                          item.severity
                        )}`}
                      >
                        <p className="font-medium">Patient {item.patientId}</p>
                        <p className="text-sm mt-1">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedHandover.status === 'pending' && (
                <div className="border-t pt-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Acknowledgement Notes
                    </label>
                    <textarea
                      value={acknowledgedNotes}
                      onChange={(e) => setAcknowledgedNotes(e.target.value)}
                      placeholder="Confirm you have reviewed and understood this handover..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      rows={3}
                    />
                  </div>
                  <button
                    onClick={handleAcknowledgeHandover}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium"
                  >
                    Acknowledge Handover
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
