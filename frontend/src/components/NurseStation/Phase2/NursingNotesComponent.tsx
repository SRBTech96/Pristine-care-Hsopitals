// frontend/src/components/NurseStation/Phase2/NursingNotesComponent.tsx
import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Clock,
  Edit2,
  Eye,
  MessageSquare,
} from 'lucide-react';

interface SOAPData {
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
}

interface NursingNote {
  id?: string;
  patientId: string;
  wardId: string;
  noteType: 'soap' | 'free_text';
  content?: string;
  soapData?: SOAPData;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
}

export const NursingNotesComponent: React.FC<{
  wardId: string;
  currentNurseId: string;
  patientId?: string;
  onNoteSubmit: (note: NursingNote) => void;
}> = ({ wardId, currentNurseId, patientId, onNoteSubmit }) => {
  const [activeTab, setActiveTab] = useState<'create' | 'view'>('create');
  const [noteType, setNoteType] = useState<'soap' | 'free_text'>('soap');
  const [selectedPatientId, setSelectedPatientId] = useState(patientId || '');
  const [notes, setNotes] = useState<NursingNote[]>([]);
  const [selectedNote, setSelectedNote] = useState<NursingNote | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // SOAP Form State
  const [soapData, setSoapData] = useState<SOAPData>({
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
  });

  // Free-text Form State
  const [freeText, setFreeText] = useState('');

  const handleSubmitNote = () => {
    if (!selectedPatientId.trim()) {
      alert('Please enter patient ID');
      return;
    }

    if (noteType === 'soap' && !Object.values(soapData).some((v) => v?.trim())) {
      alert('Please fill at least one SOAP field');
      return;
    }

    if (noteType === 'free_text' && !freeText.trim()) {
      alert('Please enter note content');
      return;
    }

    const newNote: NursingNote = {
      patientId: selectedPatientId,
      wardId,
      noteType,
      ...(noteType === 'soap' && { soapData }),
      ...(noteType === 'free_text' && { content: freeText }),
      createdAt: new Date(),
      createdBy: currentNurseId,
    };

    onNoteSubmit(newNote);
    setSelectedPatientId('');
    setSoapData({ subjective: '', objective: '', assessment: '', plan: '' });
    setFreeText('');
  };

  const handleEditNote = () => {
    if (selectedNote) {
      setIsEditing(true);
    }
  };

  const handleSaveEdit = () => {
    // API call to update note
    console.log('Saving edited note:', selectedNote);
    setIsEditing(false);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-800">Nursing Notes</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
              activeTab === 'create'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            <Plus className="w-4 h-4" />
            New Note
          </button>
          <button
            onClick={() => setActiveTab('view')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'view'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            View Notes
          </button>
        </div>
      </div>

      {activeTab === 'create' && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Patient ID
            </label>
            <input
              type="text"
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              placeholder="e.g., P001"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Note Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="soap"
                  checked={noteType === 'soap'}
                  onChange={(e) => setNoteType(e.target.value as 'soap')}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">SOAP Format</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="free_text"
                  checked={noteType === 'free_text'}
                  onChange={(e) => setNoteType(e.target.value as 'free_text')}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Free Text</span>
              </label>
            </div>
          </div>

          {noteType === 'soap' ? (
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subjective (Patient's report)
                </label>
                <textarea
                  value={soapData.subjective || ''}
                  onChange={(e) =>
                    setSoapData({ ...soapData, subjective: e.target.value })
                  }
                  placeholder="What is the patient reporting? Complaints, symptoms, concerns..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Objective (Observed facts)
                </label>
                <textarea
                  value={soapData.objective || ''}
                  onChange={(e) =>
                    setSoapData({ ...soapData, objective: e.target.value })
                  }
                  placeholder="Vital signs, physical examination findings, lab results..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assessment (Diagnosis/Current status)
                </label>
                <textarea
                  value={soapData.assessment || ''}
                  onChange={(e) =>
                    setSoapData({ ...soapData, assessment: e.target.value })
                  }
                  placeholder="Clinical assessment, diagnostic impression, care plan changes..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan (Next steps)
                </label>
                <textarea
                  value={soapData.plan || ''}
                  onChange={(e) =>
                    setSoapData({ ...soapData, plan: e.target.value })
                  }
                  placeholder="Actions to be taken, follow-up required, medications, interventions..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  rows={3}
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note Content
              </label>
              <textarea
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                placeholder="Enter your nursing note here..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                rows={8}
              />
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={handleSubmitNote}
              className="flex-1 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition font-medium flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Save Note
            </button>
          </div>
        </div>
      )}

      {activeTab === 'view' && (
        <div className="space-y-4">
          {notes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No notes available</p>
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedNote(note)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded font-medium">
                        {note.noteType === 'soap' ? 'SOAP' : 'Free Text'}
                      </span>
                      <h3 className="font-semibold">Patient {note.patientId}</h3>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(note.createdAt || '').toLocaleString()}
                    </p>
                    {note.content && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {note.content}
                      </p>
                    )}
                  </div>
                  <Eye className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {selectedNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">
                  {selectedNote.noteType === 'soap' ? 'SOAP Note' : 'Note'}
                </h3>
                <p className="text-sm text-gray-500">Patient {selectedNote.patientId}</p>
              </div>
              <div className="flex gap-2">
                {!isEditing && (
                  <button
                    onClick={handleEditNote}
                    className="text-blue-600 hover:bg-blue-50 p-2 rounded"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={() => setSelectedNote(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-gray-500">
                Created {new Date(selectedNote.createdAt || '').toLocaleString()}
              </p>

              {selectedNote.noteType === 'soap' && selectedNote.soapData ? (
                <div className="space-y-4">
                  {selectedNote.soapData.subjective && (
                    <div>
                      <p className="font-semibold text-gray-700">Subjective</p>
                      <p className="text-gray-600 text-sm mt-1 whitespace-pre-wrap">
                        {selectedNote.soapData.subjective}
                      </p>
                    </div>
                  )}
                  {selectedNote.soapData.objective && (
                    <div>
                      <p className="font-semibold text-gray-700">Objective</p>
                      <p className="text-gray-600 text-sm mt-1 whitespace-pre-wrap">
                        {selectedNote.soapData.objective}
                      </p>
                    </div>
                  )}
                  {selectedNote.soapData.assessment && (
                    <div>
                      <p className="font-semibold text-gray-700">Assessment</p>
                      <p className="text-gray-600 text-sm mt-1 whitespace-pre-wrap">
                        {selectedNote.soapData.assessment}
                      </p>
                    </div>
                  )}
                  {selectedNote.soapData.plan && (
                    <div>
                      <p className="font-semibold text-gray-700">Plan</p>
                      <p className="text-gray-600 text-sm mt-1 whitespace-pre-wrap">
                        {selectedNote.soapData.plan}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {selectedNote.content}
                  </p>
                </div>
              )}

              {isEditing && (
                <div className="border-t pt-4 flex gap-3">
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition font-medium"
                  >
                    Cancel
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
