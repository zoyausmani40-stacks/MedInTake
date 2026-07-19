import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import type { Patient } from '../utils/api';
import { Users, AlertCircle, HeartPulse, Search, ShieldAlert, ChevronRight, RefreshCw, Clock } from 'lucide-react';

interface DashboardProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  isLoading: boolean;
  onRefresh: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ patients, onSelectPatient, isLoading, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Stats Calculation
  const totalToday = patients.length;
  const urgentCases = patients.filter(p => p.urgency === 'Urgent').length;
  const sameDayCases = patients.filter(p => p.urgency === 'Same Day').length;
  const routineCases = patients.filter(p => p.urgency === 'Routine').length;
  const needsNurseReview = patients.filter(p => p.nurse_review_required).length;

  // 2. Charts Calculations
  // Today's Visits (hourly chart mock/real)
  const hourlyData = [
    { name: '08:00', patients: 2 },
    { name: '10:00', patients: 5 },
    { name: '12:00', patients: 8 },
    { name: '14:00', patients: patients.filter(p => p.appointmentTime && p.appointmentTime >= '13:00' && p.appointmentTime < '15:00').length + 3 },
    { name: '16:00', patients: patients.filter(p => p.appointmentTime && p.appointmentTime >= '15:00').length + 1 },
  ];

  // Patients by Department
  const deptMap: Record<string, number> = {};
  patients.forEach(p => {
    const dept = p.department.split('/')[0].trim();
    deptMap[dept] = (deptMap[dept] || 0) + 1;
  });
  const departmentData = Object.keys(deptMap).map(key => ({
    name: key,
    value: deptMap[key]
  }));

  // Urgency Distribution
  const urgencyMap = { Urgent: 0, 'Same Day': 0, Routine: 0, 'Pending Review': 0 };
  patients.forEach(p => {
    if (urgencyMap[p.urgency] !== undefined) {
      urgencyMap[p.urgency]++;
    } else {
      urgencyMap['Pending Review']++;
    }
  });
  const urgencyData = [
    { name: 'Urgent', value: urgencyMap['Urgent'], color: '#ef4444' },
    { name: 'Same Day', value: urgencyMap['Same Day'], color: '#f97316' },
    { name: 'Routine', value: urgencyMap['Routine'], color: '#10b981' },
    { name: 'Pending Review', value: urgencyMap['Pending Review'], color: '#94a3b8' }
  ];

  // 3. Search and filter table
  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUrgencyBadge = (urgency: Patient['urgency']) => {
    switch (urgency) {
      case 'Urgent':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">Red - Urgent</span>;
      case 'Same Day':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">Orange - Same Day</span>;
      case 'Routine':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Green - Routine</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200">Grey - Pending</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Manual Refresh */}
      <div className="flex justify-between items-center bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Triage Center</h3>
          <p className="text-xs text-slate-500">Live feed updates every 15s</p>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Patients */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center space-x-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-medium text-slate-450 uppercase tracking-wider">Total Patients Today</p>
            <h3 className="text-xl font-bold text-slate-800 mt-0.5">{isLoading ? '...' : totalToday}</h3>
          </div>
        </div>

        {/* Urgent Cases */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center space-x-3">
          <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-medium text-slate-450 uppercase tracking-wider">Urgent Cases</p>
            <h3 className="text-xl font-bold text-slate-800 mt-0.5">{isLoading ? '...' : urgentCases}</h3>
          </div>
        </div>

        {/* Same Day Cases */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center space-x-3">
          <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-medium text-slate-450 uppercase tracking-wider">Same Day Cases</p>
            <h3 className="text-xl font-bold text-slate-800 mt-0.5">{isLoading ? '...' : sameDayCases}</h3>
          </div>
        </div>

        {/* Routine Cases */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-medium text-slate-450 uppercase tracking-wider">Routine Cases</p>
            <h3 className="text-xl font-bold text-slate-800 mt-0.5">{isLoading ? '...' : routineCases}</h3>
          </div>
        </div>

        {/* Needs Nurse Review */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center space-x-3">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-medium text-slate-450 uppercase tracking-wider">Needs Nurse Review</p>
            <h3 className="text-xl font-bold text-slate-800 mt-0.5">{isLoading ? '...' : needsNurseReview}</h3>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Visits Chart */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 lg:col-span-2">
          <h4 className="text-sm font-semibold text-slate-700 mb-4">Visits Intake Load (Today)</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="patients" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorVisits)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie / Urgency & Department Breakdown */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-4">Urgency Distribution</h4>
            <div className="h-44 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={urgencyData} layout="vertical" margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={10} hide />
                  <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={12}>
                    {urgencyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="border-t border-slate-50 pt-4 mt-2">
            <h5 className="text-xs font-semibold text-slate-500 uppercase mb-2">Patients by Department</h5>
            <div className="space-y-1.5 max-h-24 overflow-y-auto">
              {departmentData.length === 0 ? (
                <p className="text-xs text-slate-400">No triage data recorded yet.</p>
              ) : (
                departmentData.map((d, i) => (
                  <div key={i} className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 truncate mr-2">{d.name}</span>
                    <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-full">{d.value}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Searchable Patient Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h4 className="text-lg font-semibold text-slate-800">Clinic Patient Roster</h4>
            <p className="text-xs text-slate-500 mt-0.5">List of patients checked in and waiting triage or physician reviews.</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, reason, dept..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-sm"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-slate-500 mt-4">Fetching active triage cases...</p>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            No matching patient intake entries found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase">
                  <th className="px-6 py-4">Patient Name</th>
                  <th className="px-6 py-4">Chief Complaint</th>
                  <th className="px-6 py-4">Urgency</th>
                  <th className="px-6 py-4">Suggested Department</th>
                  <th className="px-6 py-4">Confidence</th>
                  <th className="px-6 py-4">Doctor Summary</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Submission Time</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    onClick={() => onSelectPatient(patient)}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4 font-medium text-slate-800 group-hover:text-blue-600 transition-colors">
                      {patient.name}
                    </td>
                    <td className="px-6 py-4 text-slate-600 truncate max-w-[150px]">
                      {patient.chiefComplaint || patient.reason || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      {getUrgencyBadge(patient.urgency)}
                    </td>
                    <td className="px-6 py-4 text-slate-600 truncate max-w-[150px]">
                      {patient.department}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {patient.confidenceScore ? `${patient.confidenceScore}%` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-slate-500 truncate max-w-[200px]" title={patient.clinicalSummary}>
                      {patient.clinicalSummary || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        patient.status === 'Completed' || patient.status === 'Ready'
                          ? 'bg-emerald-50 text-emerald-700'
                          : patient.status === 'Under Review'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {patient.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(patient.submittedTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors ml-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
