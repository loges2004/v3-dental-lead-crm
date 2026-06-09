import * as XLSX from 'xlsx';

export function exportLeadsToExcel(leads, filename = 'v3-dental-clinic-leads.xlsx') {
  const rows = leads.map((l) => ({
    Name: l.patientName,
    'Mobile Number': l.mobileNumber,
    Treatment: l.treatmentRequired,
    'Lead Source': l.leadSource,
    'Clinic Branch': l.clinicBranch,
    'Lead Date': l.leadDate,
    'Follow-up Date': l.followUpDate,
    Status: l.status,
    Notes: l.notes,
  }));
  const sheet = XLSX.utils.json_to_sheet(rows);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, 'Leads');
  XLSX.writeFile(book, filename);
}
