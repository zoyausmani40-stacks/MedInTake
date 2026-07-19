import React from 'react';
import { getSettings } from '../utils/api';
import type { Patient } from '../utils/api';
import { Download, Printer, Activity, FileText, AlertTriangle, ShieldCheck, Clock } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface DoctorBriefProps {
  patient: Patient | null;
  onBackToDashboard?: () => void;
}

export const DoctorBrief: React.FC<DoctorBriefProps> = ({ patient, onBackToDashboard }) => {
  const { showToast } = useToast();
  const settings = getSettings();

  if (!patient) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center text-slate-500">
        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h4 className="font-semibold text-slate-700">No Patient Selected</h4>
        <p className="text-sm text-slate-400 mt-1">Select a patient from the clinical dashboard to view their AI-generated medical summary and pre-visit brief.</p>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    showToast('Preparing clinical brief PDF for download...', 'info');
    // Simulated PDF export action
    setTimeout(() => {
      const element = document.createElement('a');
      const file = new Blob([
        `MEDINTAKE CLINICAL BRIEF - ${settings.hospitalName}\n` +
        `==================================================\n` +
        `Patient Name: ${patient.name}\n` +
        `Date of Birth: ${patient.dob}\n` +
        `Gender: ${patient.gender}\n` +
        `Urgency Rating: ${patient.urgency}\n` +
        `Department: ${patient.department}\n` +
        `Chief Complaint: ${patient.chiefComplaint || patient.reason}\n\n` +
        `AI Clinical Summary:\n${patient.clinicalSummary}\n\n` +
        `Confidence Level: ${patient.confidenceScore}%\n`
      ], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `MedIntake_Brief_${patient.name.replace(/\s+/g, '_')}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      showToast('Clinical brief document generated successfully.', 'success');
    }, 1200);
  };

  const getUrgencyColor = (urgency: Patient['urgency']) => {
    switch (urgency) {
      case 'Urgent':
        return 'text-rose-600 bg-rose-50 border-rose-200';
      case 'Same Day':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Routine':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Action buttons */}
      <div className="flex flex-wrap justify-between items-center gap-4 no-print">
        {onBackToDashboard && (
          <button
            onClick={onBackToDashboard}
            className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
          >
            &larr; Back to Dashboard
          </button>
        )}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-sm font-medium text-slate-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Brief
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </div>

      {/* Printable Clinical Case Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 card-print">
        {/* Header Block */}
        <div className="border-b border-slate-100 pb-6 mb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-widest">{settings.hospitalName}</span>
            <h2 className="text-2xl font-bold text-slate-800 mt-1">Pre-Visit Triage & Brief</h2>
            <p className="text-xs text-slate-400 mt-1">Generated: {new Date(patient.submittedTime).toLocaleString()}</p>
          </div>
          <div className="flex flex-col items-end">
            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${getUrgencyColor(patient.urgency)}`}>
              Triage: {patient.urgency}
            </span>
            {patient.confidenceScore && (
              <span className="text-xs text-slate-400 mt-2">
                Triage Confidence: <strong className="text-slate-800">{patient.confidenceScore}%</strong>
              </span>
            )}
          </div>
        </div>

        {/* Patient Demographics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-slate-50/50 rounded-xl p-5 border border-slate-100 mb-6">
          <div>
            <h5 className="text-xs font-medium text-slate-400 uppercase">Patient Name</h5>
            <p className="text-sm font-semibold text-slate-800 mt-1">{patient.name}</p>
          </div>
          <div>
            <h5 className="text-xs font-medium text-slate-400 uppercase">Date of Birth</h5>
            <p className="text-sm font-semibold text-slate-800 mt-1">{patient.dob} (Age: {new Date().getFullYear() - new Date(patient.dob).getFullYear()})</p>
          </div>
          <div>
            <h5 className="text-xs font-medium text-slate-400 uppercase">Gender</h5>
            <p className="text-sm font-semibold text-slate-800 mt-1">{patient.gender}</p>
          </div>
          <div>
            <h5 className="text-xs font-medium text-slate-400 uppercase">Contact Details</h5>
            <p className="text-sm font-semibold text-slate-800 mt-1 truncate">{patient.phone || 'N/A'}</p>
            <p className="text-xs text-slate-500 truncate">{patient.email || 'N/A'}</p>
          </div>
        </div>

        {/* Symptoms, Severity, Duration Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="border border-slate-100 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1.5 mb-2">
              <Activity className="w-3.5 h-3.5 text-blue-500" />
              Chief Complaint
            </h4>
            <p className="text-sm text-slate-800 font-medium">{patient.chiefComplaint || patient.reason}</p>
          </div>
          <div className="border border-slate-100 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1.5 mb-2">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              Symptoms Duration
            </h4>
            <p className="text-sm text-slate-800 font-medium">{patient.duration || 'Not specified'}</p>
          </div>
          <div className="border border-slate-100 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1.5 mb-2">
              <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
              Triage Severity
            </h4>
            <p className={`text-sm font-bold uppercase ${
              patient.severity === 'Critical' ? 'text-rose-600' : patient.severity === 'Severe' ? 'text-orange-600' : 'text-slate-800'
            }`}>{patient.severity || 'Mild'}</p>
          </div>
        </div>

        {/* Detailed clinical summary */}
        <div className="border border-slate-100 rounded-xl p-5 mb-6 bg-blue-50/20">
          <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-3">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            AI Clinical Triage Summary
          </h4>
          <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-line">
            {patient.clinicalSummary || 'Awaiting clinical parser ingestion.'}
          </p>
        </div>

        {/* Clinical History & Medical Context */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Reported Symptoms</h4>
              <p className="text-sm text-slate-700 mt-1 whitespace-pre-line bg-slate-50 p-3 rounded-lg border border-slate-100">
                {patient.symptoms}
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Suggested Department Specialty</h4>
              <p className="text-sm text-slate-800 font-semibold mt-1">
                {patient.department}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Allergies</h4>
              <div className={`text-sm mt-1 p-3 rounded-lg border ${
                patient.allergies && patient.allergies.toLowerCase() !== 'none'
                  ? 'bg-rose-50/50 border-rose-100 text-rose-800 font-medium'
                  : 'bg-slate-50 border-slate-100 text-slate-700'
              }`}>
                {patient.allergies || 'None declared'}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Current Medications</h4>
              <p className="text-sm text-slate-700 mt-1 p-3 bg-slate-50 rounded-lg border border-slate-100">
                {patient.medications || 'None declared'}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Existing Medical Conditions</h4>
              <p className="text-sm text-slate-700 mt-1 p-3 bg-slate-50 rounded-lg border border-slate-100">
                {patient.medicalConditions || 'None declared'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer verification disclaimer */}
        <div className="border-t border-slate-100 pt-6 mt-8 text-center text-[10px] text-slate-400">
          This AI-generated brief parses patient pre-visit entries. Medical practitioners must independently verify all history, allergies, and symptom severity prior to clinical actions.
        </div>
      </div>
    </div>
  );
};
