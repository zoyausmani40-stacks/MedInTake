export interface Patient {
  id: string;
  name: string;
  dob: string;
  gender: string;
  email: string;
  phone: string;
  reason: string;
  symptoms: string;
  medications: string;
  allergies: string;
  medicalConditions: string;
  urgency: 'Urgent' | 'Same Day' | 'Routine' | 'Pending Review';
  department: string;
  status: 'Checked In' | 'Under Review' | 'Completed' | 'Ready' | string;
  submittedTime: string;
  appointmentTime: string;
  duration?: string;
  severity?: 'Mild' | 'Moderate' | 'Severe' | 'Critical' | string;
  clinicalSummary?: string;
  confidenceScore?: number;
  chiefComplaint?: string;
  missingFields?: string[];
  isContradictoryOrIncomplete?: boolean;
  nurse_review_required?: boolean;
}

export interface AppSettings {
  n8nWebhookUrl: string;
  apiBaseUrl: string;
  hospitalName: string;
  emailSettings: string;
  googleSheetUrl: string;
}

const SETTINGS_KEY = 'medintake_settings';

const DEFAULT_SETTINGS: AppSettings = {
  n8nWebhookUrl: 'https://primary-n8n.webhook.endpoint/patient',
  apiBaseUrl: 'http://localhost:5000/api',
  hospitalName: 'St. Mary General Hospital',
  emailSettings: 'triage-alerts@stmaryhospital.org',
  googleSheetUrl: 'https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/export?format=csv&gid=0'
};

export function getSettings(): AppSettings {
  const settingsStr = localStorage.getItem(SETTINGS_KEY);
  if (settingsStr) {
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(settingsStr) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// Parses CSV string to array of objects
function parseCSV(csvText: string): Record<string, string>[] {
  const lines = csvText.split(/\r?\n/);
  if (lines.length === 0) return [];
  
  // Simple CSV parser supporting quotes
  const parseRow = (line: string) => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseRow(lines[0]);
  const rows: Record<string, string>[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = parseRow(lines[i]);
    const obj: Record<string, string> = {};
    headers.forEach((header, index) => {
      // Map columns header safely
      const cleanHeader = header.replace(/^"|"$/g, '').trim();
      const val = values[index] ? values[index].replace(/^"|"$/g, '').trim() : '';
      if (cleanHeader) {
        obj[cleanHeader] = val;
      }
    });
    rows.push(obj);
  }
  return rows;
}

// Maps spreadsheet raw keys to standard Patient schema
function mapRowToPatient(row: Record<string, string>, index: number): Patient {
  // Normalize row keys (lowercasing, removing underscores)
  const normalized: Record<string, string> = {};
  Object.keys(row).forEach(k => {
    const normKey = k.toLowerCase().replace(/[^a-z0-9]/g, '');
    normalized[normKey] = row[k];
  });

  const id = normalized.id || normalized.patientid || `sheet-${index}`;
  const name = normalized.name || normalized.patientname || normalized.fullname || 'Unknown Patient';
  const dob = normalized.dob || normalized.dateofbirth || '';
  const gender = normalized.gender || 'Other';
  const email = normalized.email || normalized.emailaddress || '';
  const phone = normalized.phone || normalized.phonenumber || '';
  const reason = normalized.reason || normalized.reasonforvisit || '';
  const symptoms = normalized.symptoms || normalized.currentsymptoms || '';
  const medications = normalized.medications || normalized.currentmedications || '';
  const allergies = normalized.allergies || '';
  const medicalConditions = normalized.medicalconditions || normalized.existingmedicalconditions || '';
  
  // Triage parameters
  let urgencyRaw = normalized.urgency || normalized.urgencyrating || 'Routine';
  // Standardize case
  let urgency: Patient['urgency'] = 'Routine';
  if (/urgent/i.test(urgencyRaw)) urgency = 'Urgent';
  else if (/same/i.test(urgencyRaw)) urgency = 'Same Day';
  else if (/pending/i.test(urgencyRaw)) urgency = 'Pending Review';
  
  const department = normalized.department || normalized.suggesteddepartment || 'Primary Care';
  const status = normalized.status || 'Ready';
  const submittedTime = normalized.submittedtime || normalized.submissiontime || new Date().toISOString();
  const appointmentTime = normalized.appointmenttime || '10:00';
  const duration = normalized.duration || '';
  const severity = normalized.severity || 'Mild';
  const clinicalSummary = normalized.clinicalsummary || normalized.aidoctorsummary || normalized.aisummary || '';
  const confidenceScore = parseInt(normalized.confidencescore || '90', 10);
  const chiefComplaint = normalized.chiefcomplaint || reason;
  
  const nurseReviewVal = normalized.nursereviewrequired || '';
  const nurse_review_required = nurseReviewVal.toLowerCase() === 'true' || nurseReviewVal === '1';
  const isContradictoryOrIncomplete = nurse_review_required;

  return {
    id,
    name,
    dob,
    gender,
    email,
    phone,
    reason,
    symptoms,
    medications,
    allergies,
    medicalConditions,
    urgency,
    department,
    status,
    submittedTime,
    appointmentTime,
    duration,
    severity,
    clinicalSummary,
    confidenceScore,
    chiefComplaint,
    isContradictoryOrIncomplete,
    nurse_review_required,
    missingFields: isContradictoryOrIncomplete ? ['Verification Pending'] : []
  };
}

export const api = {
  getSettings,
  saveSettings,

  async getPatients(): Promise<Patient[]> {
    const settings = getSettings();
    try {
      const response = await fetch(settings.googleSheetUrl);
      if (!response.ok) throw new Error('Sheet network response failure');
      const csvText = await response.text();
      const parsedRows = parseCSV(csvText);
      return parsedRows.map((row, index) => mapRowToPatient(row, index));
    } catch (e) {
      console.warn("Direct Google Sheet fetch failed or CORS blocked. Simulating with fallback API or empty states:", e);
      // If failed, try REST backend fallback if configured
      if (settings.apiBaseUrl && settings.apiBaseUrl.startsWith('http')) {
        const response = await fetch(`${settings.apiBaseUrl}/patients`);
        if (response.ok) return await response.json();
      }
      throw e; // Bubble error for UI handling
    }
  },

  async getPatientById(id: string): Promise<Patient | null> {
    const patients = await this.getPatients();
    return patients.find(p => p.id === id || String(p.id) === String(id)) || null;
  },

  async getReviewQueue(): Promise<Patient[]> {
    const patients = await this.getPatients();
    return patients.filter(p => p.nurse_review_required);
  },

  async submitPatient(formData: any): Promise<{ success: boolean; message: string; patient?: Patient }> {
    const settings = getSettings();
    const response = await fetch(settings.n8nWebhookUrl.startsWith('http') ? settings.n8nWebhookUrl : `${settings.apiBaseUrl}/webhook/patient-intake`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    if (!response.ok) throw new Error('Webhook intake POST request failed');
    return {
      success: true,
      message: "Patient information submitted successfully."
    };
  },

  async updatePatient(updatedPatient: Patient): Promise<Patient> {
    // Write back / review overrides
    const settings = getSettings();
    if (settings.apiBaseUrl && settings.apiBaseUrl.startsWith('http')) {
      const response = await fetch(`${settings.apiBaseUrl}/patient/${updatedPatient.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPatient)
      });
      if (response.ok) return await response.json();
    }
    return updatedPatient;
  }
};
