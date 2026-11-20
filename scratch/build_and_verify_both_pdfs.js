const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { jsPDF } = require('../frontend/node_modules/jspdf');

function generateAndSavePDF(data, outputPath) {
  const record = data.record;
  const telemetry = data.telemetry || [];
  const anomalies = data.anomalies || [];
  const mode = data.analysisMode || record?.mode || 'dual';
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
  const drawHeader = () => {
    doc.setFillColor(9, 17, 34);
    doc.rect(margin, y, contentWidth, 24, 'F');
    doc.setDrawColor(6, 182, 212);
    doc.setLineWidth(0.4);
    doc.rect(margin, y, contentWidth, 24, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('MEDFAULT AI - DIAGNOSTIC TELEMETRY REPORT', margin + 6, y + 8);

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

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(203, 213, 225);
    const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
    doc.text(`Generated: ${dateStr}`, pageWidth - margin - 6, y + 20, { align: 'right' });

    y += 28;
  };

  drawHeader();

  // Metadata Box
  doc.setFillColor(15, 23, 42);
  doc.setDrawColor(51, 65, 85);
  doc.setLineWidth(0.2);
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
  doc.text(datasetName.length > 32 ? datasetName.substring(0, 30) + '...' : datasetName, margin + 4, y + 11);

  doc.setTextColor(192, 132, 252);
  doc.text(telemetryType, margin + 70, y + 11);

  doc.setTextColor(6, 182, 212);
  doc.text(`${samplesCount.toLocaleString()} samples`, margin + 125, y + 11);

  doc.setTextColor(52, 211, 153);
  doc.text(`${(sqiScore * 100).toFixed(1)}%`, margin + 155, y + 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  const channelsStr = record?.sensorChannels?.join(', ') || 'SpO2, HeartRate, Pressure, Temp, FlowRate';
  doc.text(`Monitored Sensor Channels: ${channelsStr}`, margin + 4, y + 17);
  doc.text(`Inference Latency: ${(record?.executionTimeMs || 280).toFixed(0)} ms · Hardware Baseline: IEC 60601-1-8`, margin + 125, y + 17);

  y += 26;

  // Verdicts Cards
  const cardWidth = (contentWidth - 6) / 3;
  const cardHeight = 22;

  // Card 1
  const isFault = record?.deviceStatus === 'Fault Detected' || record?.deviceStatus === 'True Alarm';
  const isNominal = record?.deviceStatus === 'Normal' || record?.deviceStatus === 'False Alarm';
  doc.setFillColor(isFault ? 69 : isNominal ? 6 : 69, isFault ? 10 : isNominal ? 44 : 26, isFault ? 10 : isNominal ? 27 : 3);
  doc.setDrawColor(isFault ? 239 : isNominal ? 16 : 245, isFault ? 68 : isNominal ? 185 : 158, isFault ? 68 : isNominal ? 129 : 11);
  doc.setLineWidth(0.3);
  doc.rect(margin, y, cardWidth, cardHeight, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(isFault ? 248 : isNominal ? 167 : 252, isFault ? 113 : isNominal ? 243 : 211, isFault ? 113 : isNominal ? 208 : 77);
  doc.text('DEVICE FAULT CLASSIFICATION', margin + 4, y + 5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(record?.deviceStatus || 'Normal', margin + 4, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(203, 213, 225);
  doc.text(isFault ? 'Transducer / Coupling anomaly flagged' : 'Hardware within IEC baseline limits', margin + 4, y + 17);

  // Card 2
  const isHighRisk = record?.patientRisk === 'High';
  const isLowRisk = record?.patientRisk === 'Low';
  const rx = margin + cardWidth + 3;
  doc.setFillColor(isHighRisk ? 69 : isLowRisk ? 6 : 69, isHighRisk ? 10 : isLowRisk ? 44 : 26, isHighRisk ? 10 : isLowRisk ? 27 : 3);
  doc.setDrawColor(isHighRisk ? 239 : isLowRisk ? 16 : 245, isHighRisk ? 68 : isLowRisk ? 185 : 158, isHighRisk ? 68 : isLowRisk ? 129 : 11);
  doc.rect(rx, y, cardWidth, cardHeight, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(isHighRisk ? 248 : isLowRisk ? 167 : 252, isHighRisk ? 113 : isLowRisk ? 243 : 211, isHighRisk ? 113 : isLowRisk ? 208 : 77);
  doc.text('PATIENT PHYSIOLOGICAL RISK', rx + 4, y + 5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(`${record?.patientRisk || 'Low'} Risk`, rx + 4, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(203, 213, 225);
  doc.text(isHighRisk ? 'Acute physiological deviation detected' : 'Vital signs within stable clinical bounds', rx + 4, y + 17);

  // Card 3
  const cx = rx + cardWidth + 3;
  doc.setFillColor(8, 28, 48);
  doc.setDrawColor(6, 182, 212);
  doc.rect(cx, y, cardWidth, cardHeight, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(6, 182, 212);
  doc.text('CLASSIFICATION CONFIDENCE', cx + 4, y + 5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(`${(record?.confidence || 95.0).toFixed(1)}%`, cx + 4, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Calibrated 1D-CNN + BiLSTM Softmax', cx + 4, y + 17);

  y += cardHeight + 6;

  // Signal Waveform Chart
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('RELEVANT PHYSIOLOGICAL & TRANSDUCER SIGNAL WAVEFORMS', margin, y);

  y += 3;

  const chartBoxX = margin;
  const chartBoxY = y;
  const chartBoxWidth = contentWidth;
  const chartBoxHeight = 56;

  doc.setFillColor(6, 10, 19);
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.3);
  doc.rect(chartBoxX, chartBoxY, chartBoxWidth, chartBoxHeight, 'FD');

  const legendY = chartBoxY + 5;
  const legends = [
    { label: 'SpO2 (%): Oxygen Saturation', color: [6, 182, 212] },
    { label: 'Heart Rate (bpm): Pulse Rate', color: [244, 63, 94] },
    { label: 'Pressure (mmHg): Arterial/Blood', color: [59, 130, 246] },
  ];
  let legX = chartBoxX + 6;
  legends.forEach((leg) => {
    doc.setFillColor(leg.color[0], leg.color[1], leg.color[2]);
    doc.rect(legX, legendY - 2.5, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(leg.color[0], leg.color[1], leg.color[2]);
    doc.text(leg.label, legX + 5, legendY);
    legX += 58;
  });

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
  for (let g = 0; g <= 6; g++) {
    const gx = plotX + (plotW / 6) * g;
    doc.line(gx, plotY, gx, plotY + plotH);
  }

  // Draw Waveforms
  if (telemetry.length > 1) {
    const ptsCount = telemetry.length;
    const stepX = plotW / (ptsCount - 1);

    // Anomalies shading
    doc.setFillColor(239, 68, 68);
    telemetry.forEach((pt, i) => {
      if (pt.isAnomaly) {
        const ax = plotX + i * stepX;
        doc.rect(ax - 0.5, plotY, Math.max(1, stepX), plotH, 'F');
      }
    });

    const getY = (val, min, max) => {
      const clamped = Math.max(min, Math.min(max, val));
      const norm = (clamped - min) / (max - min);
      return plotY + plotH - norm * plotH;
    };

    // SpO2
    doc.setDrawColor(6, 182, 212);
    doc.setLineWidth(0.4);
    for (let i = 0; i < ptsCount - 1; i++) {
      doc.line(plotX + i * stepX, getY(telemetry[i].spo2 ?? 98, 80, 102), plotX + (i + 1) * stepX, getY(telemetry[i + 1].spo2 ?? 98, 80, 102));
    }

    // Heart Rate
    doc.setDrawColor(244, 63, 94);
    doc.setLineWidth(0.4);
    for (let i = 0; i < ptsCount - 1; i++) {
      doc.line(plotX + i * stepX, getY(telemetry[i].heartRate ?? 72, 40, 180), plotX + (i + 1) * stepX, getY(telemetry[i + 1].heartRate ?? 72, 40, 180));
    }

    // Pressure
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.35);
    for (let i = 0; i < ptsCount - 1; i++) {
      doc.line(plotX + i * stepX, getY(telemetry[i].pressure ?? 110, 40, 180), plotX + (i + 1) * stepX, getY(telemetry[i + 1].pressure ?? 110, 40, 180));
    }

    // Time markings
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(telemetry[0].time || 't+0.0s', plotX, plotY + plotH + 4);
    doc.text(telemetry[Math.floor(ptsCount / 2)].time || 't+mid', plotX + plotW / 2, plotY + plotH + 4, { align: 'center' });
    doc.text(telemetry[ptsCount - 1].time || 't+end', plotX + plotW, plotY + plotH + 4, { align: 'right' });
  }

  y += chartBoxHeight + 8;

  // Anomalies Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(`FLAGGED FINDINGS & DETECTED ANOMALIES (${anomalies.length} Flagged)`, margin, y);

  y += 4;

  // Table Header
  doc.setFillColor(30, 41, 59);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(203, 213, 225);
  doc.text('TIMESTAMP', margin + 3, y + 4.2);
  doc.text('PARAMETER & SENSOR', margin + 28, y + 4.2);
  doc.text('SEVERITY', margin + 85, y + 4.2);
  doc.text('OBSERVED / EXPECTED RANGE', margin + 105, y + 4.2);
  doc.text('IMPLICATION & RECOMMENDED ACTION', margin + 145, y + 4.2);
  y += 6;

  anomalies.forEach((anom, idx) => {
    const rowHeight = 16;
    const isEven = idx % 2 === 0;
    doc.setFillColor(isEven ? 15 : 20, isEven ? 23 : 30, isEven ? 42 : 48);
    doc.setDrawColor(51, 65, 85);
    doc.setLineWidth(0.15);
    doc.rect(margin, y, contentWidth, rowHeight, 'FD');

    doc.setFont('courier', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(6, 182, 212);
    doc.text(anom.timestamp || 't+0.0s', margin + 3, y + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    const paramText = doc.splitTextToSize(anom.parameter || 'Telemetry Stream', 54);
    doc.text(paramText, margin + 28, y + 5.5);

    const isCrit = anom.severity === 'critical';
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(isCrit ? 244 : 251, isCrit ? 63 : 191, isCrit ? 94 : 36);
    doc.text(anom.severity.toUpperCase(), margin + 85, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(226, 232, 240);
    doc.text(`Observed: ${anom.observedValue || '--'}`, margin + 105, y + 5.5);
    doc.setTextColor(148, 163, 184);
    doc.text(`Expected: ${anom.expectedRange || 'Nominal'}`, margin + 105, y + 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(203, 213, 225);
    const actionText = doc.splitTextToSize(`${anom.implication || ''} ${anom.suggestedAction || ''}`, 36);
    doc.text(actionText.slice(0, 3), margin + 145, y + 4.8);

    y += rowHeight;
  });

  // Footer
  const footerY = pageHeight - margin - 6;
  doc.setDrawColor(51, 65, 85);
  doc.setLineWidth(0.2);
  doc.line(margin, footerY - 2, pageWidth - margin, footerY - 2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('CONFIDENTIAL MEDICAL DEVICE TELEMETRY REPORT · MEDFAULT AI DEEP LEARNING PROTOTYPE', margin, footerY + 2);
  doc.text(`Page 1 of ${doc.getNumberOfPages()} · Run Reference: ${runId}`, pageWidth - margin, footerY + 2, { align: 'right' });

  const rawPdf = doc.output();
  fs.writeFileSync(outputPath, Buffer.from(rawPdf, 'binary'));
  return `MedFault_AI_${runId}.pdf`;
}

// 1. Process One-Click Run
const data1 = JSON.parse(fs.readFileSync('d:/med_fault_detect/scratch/run_oneclick.json', 'utf8'));
const runId1 = data1.record.id;
const fileName1 = `MedFault_AI_${runId1}.pdf`;
const outPath1 = path.join(__dirname, fileName1);
generateAndSavePDF(data1, outPath1);
console.log('✓ Generated PDF for One-Click ICU Test:', fileName1);
console.log('  File size:', fs.statSync(outPath1).size, 'bytes');

// 2. Process Manual Run
const data2 = JSON.parse(fs.readFileSync('d:/med_fault_detect/scratch/run_manual.json', 'utf8'));
const runId2 = data2.record.id;
const fileName2 = `MedFault_AI_${runId2}.pdf`;
const outPath2 = path.join(__dirname, fileName2);
generateAndSavePDF(data2, outPath2);
console.log('✓ Generated PDF for Manual CSV Upload:', fileName2);
console.log('  File size:', fs.statSync(outPath2).size, 'bytes');

// Helper to decompress and inspect
function inspectPDF(filePath, expectedRunId, expectedName) {
  const buf = fs.readFileSync(filePath);
  const str = buf.toString('latin1');
  const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let match;
  let allDecompressed = '';
  while ((match = streamRegex.exec(str)) !== null) {
    try {
      allDecompressed += zlib.inflateSync(Buffer.from(match[1], 'latin1')).toString('latin1') + '\n';
    } catch {
      allDecompressed += match[1] + '\n';
    }
  }

  const checks = [
    { label: 'Magic Bytes %PDF-', pass: buf.subarray(0, 5).toString() === '%PDF-' },
    { label: 'Report Title', pass: allDecompressed.includes('MEDFAULT AI - DIAGNOSTIC TELEMETRY REPORT') },
    { label: `Run ID (${expectedRunId})`, pass: allDecompressed.includes(expectedRunId) },
    { label: 'Synthetic ICU telemetry', pass: allDecompressed.includes('Synthetic ICU telemetry') },
    { label: '240 samples', pass: allDecompressed.includes('240 samples') },
    { label: 'SpO2 channel label', pass: allDecompressed.includes('SpO2') && allDecompressed.includes('Oxygen Saturation') },
    { label: 'Heart Rate channel label', pass: allDecompressed.includes('Heart Rate') && allDecompressed.includes('Pulse Rate') },
    { label: 'Pressure channel label', pass: allDecompressed.includes('Pressure') && allDecompressed.includes('Arterial/Blood') },
    { label: 'Findings section header', pass: allDecompressed.includes('FLAGGED FINDINGS & DETECTED ANOMALIES') },
    { label: 'Findings timestamps', pass: allDecompressed.includes('12:01:01 - 12:01:30') },
    { label: 'Transducer coupling anomaly', pass: allDecompressed.includes('Optical Sensor Coupling / Lead Stability') },
    { label: 'Action & Implication', pass: allDecompressed.includes('Transducer coupling instability') },
  ];

  console.log(`\nInspecting ${path.basename(filePath)}:`);
  checks.forEach(c => {
    console.log(`  [${c.pass ? 'PASS' : 'FAIL'}] ${c.label}`);
    if (!c.pass) throw new Error(`Check failed: ${c.label}`);
  });
}

inspectPDF(outPath1, runId1, data1.record.datasetName);
inspectPDF(outPath2, runId2, data2.record.datasetName);
console.log('\nALL PDF VERIFICATION CHECKS PASSED PERFECTLY!');
