# MedIntake – AI Patient Pre-Visit Triage & Brief Generator

MedIntake is a modern, responsive web application built with **React**, **TypeScript**, and **Tailwind CSS**. It serves as a professional clinical dashboard for healthcare staff to manage patient intake workflows, review AI-generated diagnostic briefs, and verify incomplete profiles.

## Key Features

1. **Patient Intake Form**: Detailed pre-visit registration form containing demographics, reasons for visits, current symptoms, allergies, medications, and chronic conditions. Submits structured payloads directly to your **n8n Webhook**.
2. **Clinical Triage Dashboard**: Dashboard with statistics cards, live urgency breakdowns, and a searchable clinical patient table.
3. **AI Doctor Brief**: Comprehensive clinical summary layout showing severity, Chief Complaints, Suggested Department routing, and clinical descriptions. Built-in actions to download briefs as text files or trigger system printing.
4. **Nurse Review Queue**: Automatically displays incomplete patient records where `nurse_review_required === true`, featuring an editor to complete missing data fields.
5. **System Settings**: Configurable input panel to dynamically change the n8n Webhook URL, API paths, Hospital Branding names, and Google Sheets live data URLs without rebuilding.
6. **Live Google Sheets Integration**: Custom built-in parser fetches and deserializes patient records from a Google Sheet (CSV format) with a 15-second auto-refresh and manual refresh capabilities.

---

## Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone <YOUR_GITHUB_REPO_URL>
   cd medintake
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start local development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173/` in your browser.

4. **Production Build**:
   ```bash
   npm run build
   ```

---

## Google Sheet Configuration

To connect live data to your spreadsheet:
1. Open your Google Sheet.
2. Share the document: Click **File > Share > Publish to web**.
3. Choose **Comma-separated values (.csv)** as the format, and copy the link.
4. Or use the format: `https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/export?format=csv&gid=0`
5. Paste this URL into the **Google Sheets Export URL** input on the **System Settings** page of MedIntake.
