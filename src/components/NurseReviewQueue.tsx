import React, { useState } from 'react';
import { api } from '../utils/api';
import type { Patient } from '../utils/api';
import { useToast } from '../context/ToastContext';
import { AlertCircle, FileEdit, Check, ArrowRight } from 'lucide-react';

interface NurseReviewQueueProps {
  patients: Patient[];
  onRefresh: () => void;
}

export const NurseReviewQueue: React.FC<NurseReviewQueueProps> = ({ patients, onRefresh }) => {
  const { showToast } = useToast();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  // Edit form states
  const [editForm, setEditForm] = useState<Partial<Patient>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Filter patients: only display patients whose information requires review (nurse_review_required === true)
  const incompletePatients = patients.filter(p => p.nurse_review_required);

  const handleReviewClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setEditForm({ ...patient });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !editForm.name) return;

    setIsSaving(true);
    try {
      // Pass the updated details to the API
      await api.updatePatient(editForm as Patient);
      showToast(`Patient record for ${editForm.name} reviewed & updated successfully.`, 'success');
      setSelectedPatient(null);
      onRefresh(); // Refresh patient database on complete
    } catch (err) {
      showToast('Failed to save patient review updates.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center gap-3 mb-2">
          <AlertCircle className="w-5 h-5 text-amber-500" />
          <h3 className="text-lg font-semibold text-slate-800 font-sans">Nurse Intake Review Queue</h3>
        </div>
        <p className="text-sm text-slate-500">
          This queue displays patients whose pre-visit triage reports have incomplete fields or conflicting responses. Nurse reviews are required to authorize patient checklist clearances.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Queue Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden lg:col-span-2">
          {incompletePatients.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              <Check className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              All pre-visit intake records are complete. No patients require nurse review.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase">
                    <th className="px-6 py-4">Patient Name</th>
                    <th className="px-6 py-4">Reason for Visit</th>
                    <th className="px-6 py-4">Missing Fields</th>
                    <th className="px-6 py-4">Submitted Time</th>
                    <th className="px-6 py-4 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {incompletePatients.map((patient) => (
                    <tr
                      key={patient.id}
                      className={`hover:bg-slate-50/50 transition-colors ${
                        selectedPatient?.id === patient.id ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {patient.name || <span className="text-slate-400 font-normal italic">Anonymous</span>}
                      </td>
                      <td className="px-6 py-4 text-slate-600 truncate max-w-[150px]">
                        {patient.reason || <span className="text-slate-400 font-normal italic">Unspecified</span>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {patient.missingFields?.map((field, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200"
                            >
                              {field}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {new Date(patient.submittedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleReviewClick(patient)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium transition-colors"
                        >
                          <FileEdit className="w-3.5 h-3.5" />
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Review Editor Sidebar/Card Panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h4 className="text-sm font-semibold text-slate-700 mb-4 border-b border-slate-100 pb-3">
            Review Worksheet
          </h4>

          {selectedPatient ? (
            <form onSubmit={handleSaveReview} className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-1 mb-2">
                <span className="font-semibold text-slate-600 block">Identified Inconsistencies:</span>
                <p className="text-slate-500">
                  Please resolve empty values for: <strong className="text-slate-700">{selectedPatient.missingFields?.join(', ')}</strong>.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editForm.email || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={editForm.phone || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Reason for Visit</label>
                <input
                  type="text"
                  name="reason"
                  value={editForm.reason || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Symptoms Description</label>
                <textarea
                  name="symptoms"
                  rows={2}
                  value={editForm.symptoms || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Medications</label>
                <input
                  type="text"
                  name="medications"
                  value={editForm.medications || ''}
                  onChange={handleInputChange}
                  placeholder="e.g. None"
                  className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Allergies</label>
                <input
                  type="text"
                  name="allergies"
                  value={editForm.allergies || ''}
                  onChange={handleInputChange}
                  placeholder="e.g. Penicillin"
                  className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Existing Medical Conditions</label>
                <input
                  type="text"
                  name="medicalConditions"
                  value={editForm.medicalConditions || ''}
                  onChange={handleInputChange}
                  placeholder="e.g. Asthma"
                  className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedPatient(null)}
                  className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-1 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  {isSaving ? 'Saving...' : (
                    <>
                      Save Changes
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              Select a patient from the review queue list to populate the worksheet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
