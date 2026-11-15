import { Farmer, MonthlySurvey, CropHealthRecord, EmergencyCase, SchemeEnrollment, CropInsuranceRecord } from '../types';

function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeCsv(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

export const ReportService = {
  // CSV Exports
  exportFarmersCsv(farmers: Farmer[]): void {
    const headers = [
      'Farmer ID',
      'Full Name',
      'Father/Husband Name',
      'Age',
      'Gender',
      'Phone',
      'Masked Aadhaar',
      'Village',
      'Mandal',
      'District',
      'Land Area (Acres)',
      'Soil Type',
      'Water Source',
      'Primary Crop',
      'Crop Variety',
      'Registration Date',
      'Status'
    ];

    const rows = farmers.map(f => [
      f.id,
      f.fullName,
      f.fatherSpouseName,
      f.age,
      f.gender,
      f.phone,
      f.aadhaarMasked,
      f.village,
      f.mandal,
      f.district,
      f.landAreaAcres,
      f.soilType,
      f.waterSource,
      f.primaryCrop,
      f.cropVariety,
      f.registrationDate,
      f.status
    ]);

    const csvContent = '\uFEFF' + [
      headers.map(escapeCsv).join(','),
      ...rows.map(row => row.map(escapeCsv).join(','))
    ].join('\r\n');

    downloadFile(`FWMS_Farmers_Report_${new Date().toISOString().slice(0, 10)}.csv`, csvContent, 'text/csv;charset=utf-8;');
  },

  exportSurveysCsv(surveys: MonthlySurvey[]): void {
    const headers = [
      'Survey ID',
      'Farmer ID',
      'Farmer Name',
      'Village',
      'Survey Month',
      'Survey Date',
      'Crop',
      'Crop Variety',
      'Growth Stage',
      'Crop Condition',
      'Disease Symptoms',
      'Pest Details',
      'Water Availability',
      'Fertilizer Used',
      'Remarks',
      'Coordinator Notes'
    ];

    const rows = surveys.map(s => [
      s.id,
      s.farmerId,
      s.farmerName,
      s.village,
      s.month,
      s.surveyDate,
      s.crop,
      s.cropVariety,
      s.growthStage,
      s.cropCondition,
      s.diseaseSymptoms,
      s.pestDetails,
      s.waterAvailability,
      s.fertilizerUsed,
      s.remarks,
      s.coordinatorNotes
    ]);

    const csvContent = '\uFEFF' + [
      headers.map(escapeCsv).join(','),
      ...rows.map(row => row.map(escapeCsv).join(','))
    ].join('\r\n');

    downloadFile(`FWMS_Surveys_Report_${new Date().toISOString().slice(0, 10)}.csv`, csvContent, 'text/csv;charset=utf-8;');
  },

  exportEmergenciesCsv(emergencies: EmergencyCase[]): void {
    const headers = [
      'Emergency ID',
      'Farmer ID',
      'Farmer Name',
      'Village',
      'Contact Phone',
      'Problem Type',
      'Crop',
      'Priority',
      'Status',
      'Problem Description',
      'Prescribed Solution',
      'Prescribed Medicine',
      'Recommended Fertilizer',
      'Follow-up Date',
      'Logged At',
      'Last Updated'
    ];

    const rows = emergencies.map(e => [
      e.id,
      e.farmerId,
      e.farmerName,
      e.village,
      e.contactPhone,
      e.problemType,
      e.crop,
      e.priority,
      e.status,
      e.problemDescription,
      e.solution || '',
      e.medicinePrescribed || '',
      e.fertilizerRecommended || '',
      e.followUpDate || '',
      e.createdAt,
      e.updatedAt
    ]);

    const csvContent = '\uFEFF' + [
      headers.map(escapeCsv).join(','),
      ...rows.map(row => row.map(escapeCsv).join(','))
    ].join('\r\n');

    downloadFile(`FWMS_Emergency_Cases_${new Date().toISOString().slice(0, 10)}.csv`, csvContent, 'text/csv;charset=utf-8;');
  },

  exportSchemesCsv(enrollments: SchemeEnrollment[]): void {
    const headers = [
      'Enrollment ID',
      'Farmer ID',
      'Farmer Name',
      'Village',
      'Scheme Code',
      'Scheme Name',
      'Eligibility',
      'Application Status',
      'Applied Date',
      'Verification Status',
      'Approval Status',
      'Benefit Received',
      'Notes'
    ];

    const rows = enrollments.map(s => [
      s.id,
      s.farmerId,
      s.farmerName,
      s.village,
      s.schemeCode,
      s.schemeName,
      s.applicationStatus === 'Not Eligible' ? 'Not Eligible' : 'Eligible',
      s.applicationStatus,
      s.appliedDate || '',
      s.verificationStatus,
      s.approvalStatus,
      s.benefitReceived || '',
      s.notes
    ]);

    const csvContent = '\uFEFF' + [
      headers.map(escapeCsv).join(','),
      ...rows.map(row => row.map(escapeCsv).join(','))
    ].join('\r\n');

    downloadFile(`FWMS_Government_Schemes_${new Date().toISOString().slice(0, 10)}.csv`, csvContent, 'text/csv;charset=utf-8;');
  },

  exportCropHealthCsv(healthRecords: CropHealthRecord[]): void {
    const headers = [
      'Record ID',
      'Farmer ID',
      'Farmer Name',
      'Village',
      'Observation Date',
      'Crop',
      'Crop Variety',
      'Symptoms',
      'Detected Condition',
      'Severity',
      'Status',
      'Prescribed Treatment',
      'Follow-up Date',
      'AI Assisted',
      'Coordinator Observation'
    ];

    const rows = healthRecords.map(h => [
      h.id,
      h.farmerId,
      h.farmerName,
      h.village,
      h.observationDate,
      h.crop,
      h.cropVariety,
      h.symptoms,
      h.detectedCondition,
      h.severity,
      h.status,
      h.treatmentPrescribed,
      h.followUpDate || '',
      h.aiAssisted ? 'Yes' : 'No',
      h.coordinatorObservation
    ]);

    const csvContent = '\uFEFF' + [
      headers.map(escapeCsv).join(','),
      ...rows.map(row => row.map(escapeCsv).join(','))
    ].join('\r\n');

    downloadFile(`FWMS_Crop_Health_${new Date().toISOString().slice(0, 10)}.csv`, csvContent, 'text/csv;charset=utf-8;');
  },

  exportInsuranceCsv(insuranceRecords: CropInsuranceRecord[]): void {
    const headers = [
      'Insurance ID',
      'Farmer ID',
      'Farmer Name',
      'Village',
      'Crop',
      'Season',
      'Insurance Scheme',
      'Insured Land (Acres)',
      'Premium Status',
      'Damage Type',
      'Damage Date',
      'Damage Description',
      'Claim Application Date',
      'Claim Status',
      'Approved Compensation (INR)',
      'Payment Status',
      'Coordinator Remarks',
      'Registration Date'
    ];

    const rows = insuranceRecords.map(r => [
      r.id,
      r.farmerId,
      r.farmerName,
      r.village,
      r.crop,
      r.season,
      r.insuranceScheme,
      r.insuredLandAreaAcres,
      r.premiumStatus,
      r.damageType || 'None',
      r.damageDate || '',
      r.damageDescription || '',
      r.claimApplicationDate || '',
      r.claimStatus,
      r.approvedClaimAmount !== undefined ? r.approvedClaimAmount : 'Pending',
      r.paymentStatus,
      r.coordinatorRemarks,
      r.createdAt.slice(0, 10)
    ]);

    const csvContent = '\uFEFF' + [
      headers.map(escapeCsv).join(','),
      ...rows.map(row => row.map(escapeCsv).join(','))
    ].join('\r\n');

    downloadFile(`FWMS_Crop_Insurance_${new Date().toISOString().slice(0, 10)}.csv`, csvContent, 'text/csv;charset=utf-8;');
  },

  // Printable Official Dossier for Cluster
  printMonthlyClusterReport(
    farmers: Farmer[], 
    surveys: MonthlySurvey[], 
    emergencies: EmergencyCase[], 
    schemes: SchemeEnrollment[]
  ): void {
    const openEmergencies = emergencies.filter(e => e.status === 'Open' || e.status === 'In Progress');
    const approvedSchemes = schemes.filter(s => s.approvalStatus === 'Approved');

    const summaryStats = [
      { label: 'Registered Farmers', value: farmers.length },
      { label: 'Monthly Surveys Logged', value: surveys.length },
      { label: 'Active Crop Emergencies', value: openEmergencies.length },
      { label: 'Approved Scheme Beneficiaries', value: approvedSchemes.length }
    ];

    const surveyRows = surveys.slice(0, 15).map(s => `
      <tr>
        <td><strong>${s.id}</strong></td>
        <td>${s.farmerName} (${s.village})</td>
        <td>${s.crop} - ${s.cropVariety}</td>
        <td>${s.growthStage}</td>
        <td><span class="badge">${s.cropCondition}</span></td>
        <td>${s.surveyDate}</td>
        <td>${s.hasDiseaseAlert ? '<span style="color:#b91c1c;font-weight:bold;">ALERT</span>' : 'Normal'}</td>
      </tr>
    `).join('');

    const emergencyRows = openEmergencies.map(e => `
      <tr>
        <td><strong>${e.id}</strong></td>
        <td>${e.farmerName} (${e.village})</td>
        <td>${e.crop}</td>
        <td><span style="color:${e.priority === 'Critical' ? '#b91c1c' : '#b45309'};font-weight:bold;">${e.priority}</span></td>
        <td>${e.problemType}</td>
        <td>${e.medicinePrescribed || 'Pending Assessment'}</td>
        <td>${e.followUpDate || 'None Scheduled'}</td>
      </tr>
    `).join('');

    const tableHtml = `
      <h3 style="font-size: 13px; color: #1e293b; margin-top: 16px; margin-bottom: 6px; font-weight: 700;">1. Active Crop Emergency Queue</h3>
      <table>
        <thead>
          <tr>
            <th>Case ID</th>
            <th>Farmer & Village</th>
            <th>Crop</th>
            <th>Priority</th>
            <th>Problem Type</th>
            <th>Prescribed Care</th>
            <th>Follow-up Date</th>
          </tr>
        </thead>
        <tbody>
          ${emergencyRows.length > 0 ? emergencyRows : '<tr><td colspan="7" style="text-align:center;color:#64748b;padding:12px;">No active emergency cases in this cluster.</td></tr>'}
        </tbody>
      </table>

      <h3 style="font-size: 13px; color: #1e293b; margin-top: 20px; margin-bottom: 6px; font-weight: 700;">2. Monthly Crop Inspection Register</h3>
      <table>
        <thead>
          <tr>
            <th>Survey ID</th>
            <th>Farmer & Village</th>
            <th>Crop Variety</th>
            <th>Growth Stage</th>
            <th>Condition</th>
            <th>Inspection Date</th>
            <th>Pest Status</th>
          </tr>
        </thead>
        <tbody>
          ${surveyRows.length > 0 ? surveyRows : '<tr><td colspan="7" style="text-align:center;color:#64748b;padding:12px;">No monthly surveys logged yet.</td></tr>'}
        </tbody>
      </table>
    `;

    this.generatePrintableDocument(
      'VILLAGE CLUSTER AGRICULTURAL COORDINATION DOSSIER',
      `Monthly Operational Dossier for Kankipadu Sub-Division - Coverage: ${farmers.length} Registered Landholders`,
      tableHtml,
      summaryStats
    );
  },

  // Printable Official Report Generator
  generatePrintableDocument(title: string, subtitle: string, tableHtml: string, summaryStats: { label: string; value: string | number }[]): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up was blocked. Please enable pop-ups for printable document generation.');
      return;
    }

    const statsCards = summaryStats.map(s => `
      <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px 14px; background: #f8fafc; min-width: 140px;">
        <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; letter-spacing: 0.5px;">${s.label}</div>
        <div style="font-size: 20px; font-weight: 700; color: #1e293b; margin-top: 4px;">${s.value}</div>
      </div>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title} - FWMS Official Record</title>
        <style>
          @page { size: landscape; margin: 12mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #1e293b; line-height: 1.4; margin: 0; padding: 15px; }
          .header-box { border-bottom: 2px solid #1e40af; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-end; }
          .title-area h1 { margin: 0; font-size: 20px; color: #1e40af; font-weight: 700; }
          .title-area h2 { margin: 4px 0 0 0; font-size: 13px; color: #475569; font-weight: 500; }
          .meta-box { text-align: right; font-size: 11px; color: #64748b; }
          .stats-row { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 8px; }
          th { background: #f1f5f9; color: #0f172a; font-weight: 600; text-align: left; padding: 8px 10px; border: 1px solid #cbd5e1; }
          td { padding: 7px 10px; border: 1px solid #e2e8f0; vertical-align: top; }
          tr:nth-child(even) { background-color: #fafaf9; }
          .badge { display: inline-block; padding: 2px 6px; font-size: 10px; font-weight: 600; border-radius: 4px; border: 1px solid #cbd5e1; }
          .footer { margin-top: 24px; padding-top: 12px; border-top: 1px dashed #cbd5e1; font-size: 10px; color: #64748b; display: flex; justify-content: space-between; }
          @media print {
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 16px; padding: 10px; background: #e0f2fe; border: 1px solid #bae6fd; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 13px; color: #0369a1; font-weight: 500;">Press the button on the right to Print or Save this official report as PDF.</span>
          <button onclick="window.print()" style="background: #1e40af; color: white; border: none; padding: 8px 16px; border-radius: 4px; font-weight: 600; cursor: pointer; font-size: 13px;">Print / Save as PDF</button>
        </div>

        <div class="header-box">
          <div class="title-area">
            <h1>GOVERNMENT OF ANDHRA PRADESH - AGRICULTURE DEPARTMENT</h1>
            <h2>FARMER WELFARE MANAGEMENT SYSTEM (FWMS) - OFFICIAL PORTAL RECORD</h2>
            <div style="font-size: 13px; font-weight: 600; color: #0f172a; margin-top: 6px;">${title}</div>
            <div style="font-size: 12px; color: #64748b;">${subtitle}</div>
          </div>
          <div class="meta-box">
            <div><strong>Generated:</strong> ${new Date().toLocaleString()}</div>
            <div><strong>Jurisdiction:</strong> Kankipadu Agricultural Sub-Division</div>
            <div><strong>Officer:</strong> Srikanth Varma, Village Agriculture Coordinator</div>
          </div>
        </div>

        <div class="stats-row">
          ${statsCards}
        </div>

        <div>
          ${tableHtml}
        </div>

        <div class="footer">
          <div>Report generated from FWMS Database. Synthetic Demonstration Record - Valid for Village Coordination.</div>
          <div>Authorized Field Signature: _________________________</div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  }
};
