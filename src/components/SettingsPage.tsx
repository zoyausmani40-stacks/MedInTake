import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import type { AppSettings } from '../utils/api';
import { useToast } from '../context/ToastContext';
import { Save, Settings, Sparkles, Server, Building2, Mail } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<AppSettings>({
    n8nWebhookUrl: '',
    apiBaseUrl: '',
    hospitalName: '',
    emailSettings: '',
    googleSheetUrl: ''
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load initial settings
    const current = api.getSettings();
    setSettings(current);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      api.saveSettings(settings);
      showToast('Settings configuration saved successfully.', 'success');
    } catch (err) {
      showToast('Failed to save settings configurations.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <Settings className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="text-xl font-semibold text-slate-800">System Settings</h3>
            <p className="text-xs text-slate-500 mt-0.5 font-sans">Configure webhook links, API paths, and medical clinic details.</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-4">
            {/* Hospital Name */}
            <div>
              <label htmlFor="hospitalName" className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1">
                <Building2 className="w-4 h-4 text-slate-400" />
                Hospital / Clinic Name
              </label>
              <input
                type="text"
                id="hospitalName"
                name="hospitalName"
                value={settings.hospitalName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-sm"
                placeholder="St. Mary General Hospital"
                required
              />
            </div>

            {/* n8n Webhook URL */}
            <div>
              <label htmlFor="n8nWebhookUrl" className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1">
                <Sparkles className="w-4 h-4 text-teal-500" />
                n8n Webhook URL
              </label>
              <input
                type="url"
                id="n8nWebhookUrl"
                name="n8nWebhookUrl"
                value={settings.n8nWebhookUrl}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-sm font-mono"
                placeholder="https://n8n-domain.com/webhook/patient"
                required
              />
              <p className="text-[11px] text-slate-400 mt-1">This endpoint receives a POST request with the structured JSON patient intake profile upon form submission.</p>
            </div>

            {/* API Base URL */}
            <div>
              <label htmlFor="apiBaseUrl" className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1">
                <Server className="w-4 h-4 text-blue-500" />
                REST API Base URL
              </label>
              <input
                type="text"
                id="apiBaseUrl"
                name="apiBaseUrl"
                value={settings.apiBaseUrl}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-sm font-mono"
                placeholder="http://localhost:5000/api"
                required
              />
              <p className="text-[11px] text-slate-400 mt-1">Base path for fetching patient logs and review records (/patients, /patient/id, /review).</p>
            </div>

            {/* Email Settings */}
            <div>
              <label htmlFor="emailSettings" className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1">
                <Mail className="w-4 h-4 text-slate-400" />
                Email Alerts Receiver
              </label>
              <input
                type="email"
                id="emailSettings"
                name="emailSettings"
                value={settings.emailSettings}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-sm"
                placeholder="triage-alerts@hospital.org"
                required
              />
            </div>

            {/* Google Sheets Export URL */}
            <div>
              <label htmlFor="googleSheetUrl" className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1">
                <Server className="w-4 h-4 text-emerald-500" />
                Google Sheets Export URL (CSV Format)
              </label>
              <input
                type="url"
                id="googleSheetUrl"
                name="googleSheetUrl"
                value={settings.googleSheetUrl || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-sm font-mono"
                placeholder="https://docs.google.com/spreadsheets/d/.../export?format=csv&gid=0"
                required
              />
              <p className="text-[11px] text-slate-400 mt-1">Make sure the Google Sheet is published to web or link-sharing is set to "Anyone with the link can view".</p>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm focus:outline-none disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving Configurations...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
