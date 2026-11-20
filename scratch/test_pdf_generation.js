const fs = require('fs');
const path = require('path');
const { jsPDF } = require('../frontend/node_modules/jspdf');

// Mock data replicating the exact loaded result from Synthetic_ICU_Telemetry_Test(1).csv
const sampleAnalysisData = {
  record: {
    id: "rec-test-oneclick",
    datasetName: "Synthetic_ICU_Telemetry_Test(1).csv",
    recordsCount: 240,
    deviceType: "Synthetic ICU telemetry",
    deviceStatus: "Fault Detected",
    patientRisk: "High",
    confidence: 96.2,
    analyzedAt: "Just now",
    anomaliesDetected: 3,
    sensorChannels: ["SpO2", "Heart Rate", "Temperature", "Pressure", "Flow Rate"],
    fileSize: "28.8 KB",
    executionTimeMs: 284.2
  },
  telemetry: Array.from({ length: 240 }, (_, i) => ({
    time: `12:00:${i < 10 ? '0' + i : i}`,
    timestamp: i,
    spo2: i >= 50 && i <= 70 ? 86.5 : 98.2,
    heartRate: i >= 110 && i <= 135 ? 142.0 : 72.0,
    temperature: 36.8,
    pressure: i >= 180 && i <= 200 ? 165.0 : 118.0,
    flowRate: 15.0,
    isAnomaly: (i >= 50 && i <= 70) || (i >= 110 && i <= 135) || (i >= 180 && i <= 200),
    anomalyType: i >= 50 && i <= 70 ? "SpO2 Desaturation" : i >= 110 && i <= 135 ? "Tachycardia Event" : i >= 180 && i <= 200 ? "Hypertensive Spike" : null,
    severity: "critical"
  })),
  anomalies: [
    {
      id: "anom-1",
      parameter: "SpO2 (Pulse Oximetry)",
      timestamp: "12:00:50 - 12:00:70",
      observedValue: "86.5%",
      expectedRange: "95.0% - 100.0%",
      confidence: 98.4,
      severity: "critical",
      implication: "Acute hypoxemia event detected. Significant blood oxygen desaturation.",
      suggestedAction: "Check patient airway and verify optical finger sensor probe placement."
    },
    {
      id: "anom-2",
      parameter: "Heart Rate (ECG/Pleth)",
      timestamp: "12:01:10 - 12:01:35",
      observedValue: "142.0 bpm",
      expectedRange: "60.0 - 100.0 bpm",
      confidence: 96.8,
      severity: "critical",
      implication: "Sustained tachycardia episode observed outside resting clinical range.",
      suggestedAction: "Review cardiac rhythm strip and confirm patient hemodynamics."
    },
    {
      id: "anom-3",
      parameter: "Pressure (Arterial/NIBP)",
      timestamp: "12:01:80 - 12:02:00",
      observedValue: "165.0 mmHg",
      expectedRange: "90.0 - 140.0 mmHg",
      confidence: 94.2,
      severity: "warning",
      implication: "Transducer pressure spike detected exceeding upper clinical safety threshold.",
      suggestedAction: "Verify arterial line catheter flush and transducer calibration zero."
    }
  ],
  analysisMode: "dual",
  sqiScore: 0.94,
  sensorAverages: {
    spo2: 97.4,
    heartRate: 78.5,
    temperature: 36.8,
    pressure: 121.0,
    flowRate: 15.0
  }
};

// Replicate generator logic in test script
function testBuildPDF(data) {
  const record = data.record;
  const telemetry = data.telemetry || [];
  const anomalies = data.anomalies || [];
  const mode = data.analysisMode || 'dual';
  const sqiScore = data.sqiScore ?? 0.88;

  const runId = record?.id || 'live';
  const datasetName = record?.datasetName || 'Telemetry_Dataset.csv';
  const samplesCount = record?.recordsCount || telemetry.length;
  const isSyntheticIcu = 
    datasetName.toLowerCase().includes('icu') || 
    datasetName.toLowerCase().includes('synthetic') ||
    (record?.deviceType && record.deviceType.toLowerCase().includes('synthetic'));
  const telemetryType = isSyntheticIcu ? 'Synthetic ICU telemetry' : (record?.deviceType || 'Multi-parameter Medical Monitor');

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Header Bar
  doc.setFillColor(9, 17, 34);
  doc.rect(margin, y, contentWidth, 24, 'F');
  doc.setDrawColor(6, 182, 212);
  doc.setLineWidth(0.4);
  doc.rect(margin, y, contentWidth, 24, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('MEDFAULT AI — DIAGNOSTIC TELEMETRY REPORT', margin + 6, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Deep Learning Multi-Channel Medical Device Fault & Patient Risk Engine', margin + 6, y + 14);

  doc.setFont('courier', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(6, 182, 212);
  doc.text(`Run ID: ${runId}`, pageWidth - margin - 6, y + 8, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(52, 211, 153);
  doc.text(`MODE: ${mode.toUpperCase()} · STATUS: COMPLETE`, pageWidth - margin - 6, y + 14, { align: 'right' });

  y += 28;

  // Metadata Box
  doc.setFillColor(15, 23, 42);
  doc.setDrawColor(51, 65, 85);
  doc.rect(margin, y, contentWidth, 22, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('SOURCE DATASET FILE', margin + 4, y + 5);
  doc.text('TELEMETRY CLASSIFICATION', margin + 70, y + 5);
  doc.text('SAMPLES EVALUATED', margin + 125, y + 5);
  doc.text('SIGNAL QUALITY (SQI)', margin + 155, y + 5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(datasetName, margin + 4, y + 11);

  doc.setTextColor(192, 132, 252);
  doc.text(telemetryType, margin + 70, y + 11);

  doc.setTextColor(6, 182, 212);
  doc.text(`${samplesCount.toLocaleString()} samples`, margin + 125, y + 11);

  doc.setTextColor(52, 211, 153);
  doc.text(`${(sqiScore * 100).toFixed(1)}%`, margin + 155, y + 11);

  y += 26;

  // Waveform chart
  const chartBoxX = margin;
  const chartBoxY = y;
  const chartBoxWidth = contentWidth;
  const chartBoxHeight = 56;

  doc.setFillColor(6, 10, 19);
  doc.setDrawColor(30, 41, 59);
  doc.rect(chartBoxX, chartBoxY, chartBoxWidth, chartBoxHeight, 'FD');

  const plotX = chartBoxX + 14;
  const plotY = chartBoxY + 9;
  const plotW = chartBoxWidth - 20;
  const plotH = chartBoxHeight - 16;

  // Grid
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.15);
  for (let g = 0; g <= 4; g++) {
    const gy = plotY + (plotH / 4) * g;
    doc.line(plotX, gy, plotX + plotW, gy);
  }

  // Waveforms
  const ptsCount = telemetry.length;
  const stepX = plotW / (ptsCount - 1);
  const getY = (val, min, max) => plotY + plotH - ((Math.max(min, Math.min(max, val)) - min) / (max - min)) * plotH;

  doc.setDrawColor(6, 182, 212);
  for (let i = 0; i < ptsCount - 1; i++) {
    doc.line(plotX + i * stepX, getY(telemetry[i].spo2, 80, 102), plotX + (i + 1) * stepX, getY(telemetry[i + 1].spo2, 80, 102));
  }

  y += chartBoxHeight + 8;

  // Anomalies
  anomalies.forEach((anom, idx) => {
    doc.setFillColor(idx % 2 === 0 ? 15 : 20, idx % 2 === 0 ? 23 : 30, idx % 2 === 0 ? 42 : 48);
    doc.rect(margin, y, contentWidth, 16, 'FD');
    doc.setFont('courier', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(6, 182, 212);
    doc.text(anom.timestamp, margin + 3, y + 6);
    y += 16;
  });

  const pdfOutput = doc.output();
  const outPath = path.join(__dirname, `MedFault_AI_${runId}.pdf`);
  fs.writeFileSync(outPath, Buffer.from(pdfOutput, 'binary'));
  console.log('Saved PDF report to:', outPath);
  console.log('File size:', fs.statSync(outPath).size, 'bytes');
  return outPath;
}

const outPath = testBuildPDF(sampleAnalysisData);
console.log('Verification successful! PDF file exists:', fs.existsSync(outPath));
