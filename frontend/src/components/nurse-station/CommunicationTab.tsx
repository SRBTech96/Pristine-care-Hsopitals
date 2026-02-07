'use client';

import React, { useState, useEffect } from 'react';
import { InpatientAdmission, Ward } from '@/types/nurse-station';
import { nurseStationAPI } from '@/lib/nurse-station-api';
import { MessageSquare, Send, AlertCircle, Phone, Mail, Clock } from 'lucide-react';

interface CommunicationTabProps {
  admission: InpatientAdmission;
  ward?: Ward;
  userRole: string;
  currentUser?: { id: string; firstName: string; lastName: string };
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  message: string;
  timestamp: Date;
  recipientIds: string[];
  type: 'general' | 'alert' | 'reminder';
}

export default function CommunicationTab({
  admission,
  ward,
  userRole,
  currentUser,
}: CommunicationTabProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [messageType, setMessageType] = useState<'general' | 'alert' | 'reminder'>(
    'general'
  );

  useEffect(() => {
    loadMessages();
    // Set up auto-refresh every 10 seconds
    const interval = setInterval(loadMessages, 10000);
    return () => clearInterval(interval);
  }, [admission.id]);

  const loadMessages = async () => {
    try {
      setLoading(false);
      // Simulating message fetch
      const mockMessages: Message[] = [
        {
          id: '1',
          senderId: 'nurse-1',
          senderName: 'Sarah Johnson',
          senderRole: 'Staff Nurse',
          message: 'Patient vitals stable. Ready for discharge consultation.',
          timestamp: new Date(Date.now() - 3600000),
          recipientIds: ['doctor-1'],
          type: 'general',
        },
        {
          id: '2',
          senderId: 'doctor-1',
          senderName: 'Dr. Smith',
          senderRole: 'Senior Doctor',
          message:
            'Schedule for discharge tomorrow morning. Provide discharge medications.',
          timestamp: new Date(Date.now() - 1800000),
          recipientIds: ['nurse-1'],
          type: 'alert',
        },
      ];
      setMessages(mockMessages);
    } catch (err: any) {
      setError('Failed to load messages');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) {
      setError('Message cannot be empty');
      return;
    }

    try {
      setSending(true);
      // Send message to API
      await nurseStationAPI.sendWardMessage({
        wardId: admission.wardId,
        patientId: admission.patientId,
        message: messageText,
        messageType: messageType,
        recipients: selectedRecipients,
      });

      setMessageText('');
      setSelectedRecipients([]);
      setMessageType('general');
      await loadMessages();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const getMessageTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      general: '💬',
      alert: '🚨',
      reminder: '📌',
    };
    return icons[type] || '💬';
  };

  const getMessageTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      general: 'bg-blue-50 border-blue-200',
      alert: 'bg-red-50 border-red-200',
      reminder: 'bg-yellow-50 border-yellow-200',
    };
    return colors[type] || 'bg-gray-50 border-gray-200';
  };

  const getMessageTypeTextColor = (type: string) => {
    const colors: { [key: string]: string } = {
      general: 'text-blue-700',
      alert: 'text-red-700',
      reminder: 'text-yellow-700',
    };
    return colors[type] || 'text-gray-700';
  };

  return (
    <div className="p-4 space-y-4 flex flex-col h-full">
      {error && (
        <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Contact Information */}
      <div className="grid grid-cols-2 gap-2 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
        <div>
          <p className="text-xs text-gray-600 font-semibold">📞 Doctor</p>
          <p className="text-sm font-medium text-gray-900">
            {admission.attendingDoctor?.firstName || 'Assigned Doctor'}
          </p>
          <p className="text-xs text-gray-600 mt-0.5">
            {admission.attendingDoctor?.phoneNumber || 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600 font-semibold">🏥 Ward</p>
          <p className="text-sm font-medium text-gray-900">
            {ward?.wardName || 'Ward'}
          </p>
          <p className="text-xs text-gray-600 mt-0.5">
            Bed {admission.bedId}
          </p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto space-y-2 bg-white rounded-lg border border-gray-200 p-3">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No messages yet</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`border rounded-lg p-3 ${getMessageTypeColor(msg.type)}`}>
              {/* Message Header */}
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {getMessageTypeIcon(msg.type)}
                    </span>
                    <p className="font-semibold text-sm text-gray-900">
                      {msg.senderName}
                    </p>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        msg.type === 'alert'
                          ? 'bg-red-100 text-red-700'
                          : msg.type === 'reminder'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {msg.senderRole}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              {/* Message Content */}
              <p className="text-sm text-gray-800">{msg.message}</p>
            </div>
          ))
        )}
      </div>

      {/* Message Composer */}
      <form onSubmit={handleSendMessage} className="space-y-2 border-t border-gray-200 pt-3">
        {/* Message Type Selection */}
        <div className="flex gap-1">
          {(['general', 'alert', 'reminder'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setMessageType(type)}
              className={`flex-1 px-2 py-1.5 rounded text-xs font-semibold transition-colors ${
                messageType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type === 'general'
                ? '💬 Message'
                : type === 'alert'
                  ? '🚨 Alert'
                  : '📌 Reminder'}
            </button>
          ))}
        </div>

        {/* Message Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type message to ward staff..."
            maxLength={500}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={sending || !messageText.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold transition-colors flex items-center gap-1"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Character Count */}
        <p className="text-xs text-gray-500">
          {messageText.length}/500 characters
        </p>
      </form>
    </div>
  );
}
