import React, { useState, useEffect } from 'react';
import { api, getSettings } from './utils/api';
import type { Patient } from './utils/api';
import { ToastProvider, useToast } from './context/ToastContext';
import { PatientIntake } from './components/PatientIntake';
import { Dashboard } from './components/Dashboard';
import { DoctorBrief } from './components/DoctorBrief';
import { NurseReviewQueue } from './components/NurseReviewQueue';
import { SettingsPage } from './components/SettingsPage';
import { 
  LayoutDashboard, 
  ClipboardList, 
  FileHeart, 
  Users, 
  Settings, 
  Menu, 
  X,
  Stethoscope
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'intake' | 'dashboard' | 'brief' | 'review' | 'settings'>('dashboard');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const settings = getSettings();

  // Load patient list from local storage / configured REST endpoints
  const loadPatients = async (showSilently = false) => {
    if (!showSilently) setIsLoading(true);
    try {
      const data = await api.getPatients();
      setPatients(data);
      // Keep selected patient in sync with updated records
      if (selectedPatient) {
        const updated = data.find(p => p.id === selectedPatient.id);
        if (updated) {
          setSelectedPatient(updated);
        }
      }
    } catch (err) {
      showToast('Error syncing patient triage roster.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial Load
  useEffect(() => {
    loadPatients();
  }, []);

  // Auto Refresh Dashboard data every 15 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      loadPatients(true);
    }, 15000);

    return () => clearInterval(timer);
  }, [selectedPatient]);

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setActiveTab('brief');
  };

  const handleIntakeSuccess = () => {
    loadPatients();
    // Redirect to dashboard to review new submission
    setActiveTab('dashboard');
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Triage Dashboard', icon: LayoutDashboard },
    { id: 'intake', label: 'Patient Intake Form', icon: ClipboardList },
    { id: 'brief', label: 'Doctor Clinical Brief', icon: FileHeart },
    { id: 'review', label: 'Nurse Review Queue', icon: Users, badge: patients.filter(p => p.nurse_review_required).length },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar - Desktop Layout */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-100 p-5 sticky top-0 h-screen select-none">
        <div className="flex items-center gap-2 px-2 pb-6 border-b border-slate-100">
          <div className="p-1.5 bg-blue-600 text-white rounded-lg">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-slate-800 tracking-tight text-base font-sans block">MedIntake</span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block">AI Pre-Visit Triage</span>
          </div>
        </div>

        <nav className="flex-1 py-6 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50/80 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    isActive ? 'bg-blue-200 text-blue-800' : 'bg-rose-50 text-rose-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400">
          <p className="font-medium text-slate-500 truncate">{settings.hospitalName}</p>
          <p className="mt-0.5">Triage Panel v1.0.0</p>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-blue-600" />
          <span className="font-bold text-slate-800 text-base">MedIntake</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-600"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Overlay Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-white z-30 p-4 space-y-2 flex flex-col justify-between">
          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-2 py-0.5 bg-rose-50 text-rose-700 rounded-full text-xs font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
          <div className="border-t border-slate-100 pt-4 text-xs text-slate-400 text-center">
            {settings.hospitalName}
          </div>
        </div>
      )}

      {/* Main Panel Content Area */}
      <main className="flex-1 p-4 sm:p-8 pt-20 md:pt-8 max-w-7xl mx-auto w-full overflow-x-hidden">
        {activeTab === 'dashboard' && (
          <Dashboard
            patients={patients}
            onSelectPatient={handlePatientSelect}
            isLoading={isLoading}
            onRefresh={() => loadPatients(false)}
          />
        )}
        {activeTab === 'intake' && (
          <PatientIntake onSubmissionSuccess={handleIntakeSuccess} />
        )}
        {activeTab === 'brief' && (
          <DoctorBrief
            patient={selectedPatient}
            onBackToDashboard={() => setActiveTab('dashboard')}
          />
        )}
        {activeTab === 'review' && (
          <NurseReviewQueue
            patients={patients}
            onRefresh={loadPatients}
          />
        )}
        {activeTab === 'settings' && <SettingsPage />}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
