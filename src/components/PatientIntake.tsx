import React, { useState } from 'react';
import { api } from '../utils/api';
import { useToast } from '../context/ToastContext';
import { Send, RotateCcw } from 'lucide-react';

interface PatientIntakeProps {
  onSubmissionSuccess: () => void;
}

export const PatientIntake: React.FC<PatientIntakeProps> = ({ onSubmissionSuccess }) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    gender: 'Male',
    email: '',
    phone: '',
    reason: '',
    symptoms: '',
    medications: '',
    allergies: '',
    medicalConditions: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Full Name is required';
    if (!formData.dob) newErrors.dob = 'Date of Birth is required';
    if (!formData.gender) newErrors.gender = 'Gender selection is required';
    if (!formData.reason.trim()) newErrors.reason = 'Reason for visit is required';
    if (!formData.symptoms.trim()) newErrors.symptoms = 'Current Symptoms description is required';

    // Basic email check if email is provided
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleClear = () => {
    setFormData({
      name: '',
      dob: '',
      gender: 'Male',
      email: '',
      phone: '',
      reason: '',
      symptoms: '',
      medications: '',
      allergies: '',
      medicalConditions: ''
    });
    setErrors({});
    showToast('Form cleared', 'info');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast('Please correct the highlighted validation errors.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.submitPatient(formData);
      if (response.success) {
        showToast(response.message, 'success');
        // Clear form after success
        setFormData({
          name: '',
          dob: '',
          gender: 'Male',
          email: '',
          phone: '',
          reason: '',
          symptoms: '',
          medications: '',
          allergies: '',
          medicalConditions: ''
        });
        onSubmissionSuccess();
      } else {
        showToast(response.message || 'Submission failed.', 'error');
      }
    } catch (err) {
      showToast('An error occurred while submitting the patient intake information.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-slate-800">Pre-Visit Patient Intake Form</h2>
          <p className="text-sm text-slate-500 mt-1">Please fill in your current medical details to speed up your pre-visit triage process.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Full Name <span className="text-rose-500">*</span></label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.name ? 'border-rose-300 focus:ring-rose-200' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-400'}`}
                placeholder="Johnathan Doe"
              />
              {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
            </div>

            {/* DOB */}
            <div>
              <label htmlFor="dob" className="block text-sm font-medium text-slate-700 mb-1">Date of Birth <span className="text-rose-500">*</span></label>
              <input
                type="date"
                id="dob"
                name="dob"
                value={formData.dob}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.dob ? 'border-rose-300 focus:ring-rose-200' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-400'}`}
              />
              {errors.dob && <p className="text-xs text-rose-500 mt-1">{errors.dob}</p>}
            </div>

            {/* Gender */}
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-slate-700 mb-1">Gender <span className="text-rose-500">*</span></label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                placeholder="(555) 000-0000"
              />
            </div>

            {/* Email */}
            <div className="md:col-span-2">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.email ? 'border-rose-300 focus:ring-rose-200' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-400'}`}
                placeholder="example@patient.org"
              />
              {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
            </div>

            {/* Reason for Visit */}
            <div className="md:col-span-2">
              <label htmlFor="reason" className="block text-sm font-medium text-slate-700 mb-1">Reason for Visit <span className="text-rose-500">*</span></label>
              <input
                type="text"
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.reason ? 'border-rose-300 focus:ring-rose-200' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-400'}`}
                placeholder="Briefly state why you want to see a clinician (e.g. checkup, throat pain, follow-up)"
              />
              {errors.reason && <p className="text-xs text-rose-500 mt-1">{errors.reason}</p>}
            </div>

            {/* Current Symptoms */}
            <div className="md:col-span-2">
              <label htmlFor="symptoms" className="block text-sm font-medium text-slate-700 mb-1">Current Symptoms <span className="text-rose-500">*</span></label>
              <textarea
                id="symptoms"
                name="symptoms"
                rows={4}
                value={formData.symptoms}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.symptoms ? 'border-rose-300 focus:ring-rose-200' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-400'}`}
                placeholder="Describe your current symptoms in detail (intensity, duration, triggering factors, etc.)"
              ></textarea>
              {errors.symptoms && <p className="text-xs text-rose-500 mt-1">{errors.symptoms}</p>}
            </div>

            {/* Medications */}
            <div>
              <label htmlFor="medications" className="block text-sm font-medium text-slate-700 mb-1">Current Medications</label>
              <textarea
                id="medications"
                name="medications"
                rows={2}
                value={formData.medications}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                placeholder="List any daily/as-needed medications with dosages"
              ></textarea>
            </div>

            {/* Allergies */}
            <div>
              <label htmlFor="allergies" className="block text-sm font-medium text-slate-700 mb-1">Allergies</label>
              <textarea
                id="allergies"
                name="allergies"
                rows={2}
                value={formData.allergies}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                placeholder="List any food or drug allergies"
              ></textarea>
            </div>

            {/* Existing Medical Conditions */}
            <div className="md:col-span-2">
              <label htmlFor="medicalConditions" className="block text-sm font-medium text-slate-700 mb-1">Existing Medical Conditions</label>
              <textarea
                id="medicalConditions"
                name="medicalConditions"
                rows={2}
                value={formData.medicalConditions}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                placeholder="List any chronic conditions (e.g. asthma, diabetes, hypertension)"
              ></textarea>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center justify-center gap-2 px-6 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Clear Form
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Information
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
