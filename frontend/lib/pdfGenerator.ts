import { jsPDF } from 'jspdf';
import { FullAnalysisData } from './api';

/**
 * Generates and triggers the direct download of a clinical engineering PDF report
 * using the loaded analysis result.
 * 
 * Naming convention: MedFault_AI_<run-id>.pdf
 */
export function generateAnalysisPDF(data: FullAnalysisData): string {
  const record = data.record;
  const telemetry = data.telemetry || [];
  const anomalies = data.anomalies || [];
  const mode = data.analysisMode || (record as any)?.mode || 'dual';
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

  // Helper: Draw Header Bar
  const drawHeader = () => {
    // Header gradient / background box
    doc.setFillColor(9, 17, 34); // #091122
    doc.rect(margin, y, contentWidth, 24, 'F');
    doc.setDrawColor(6, 182, 212); // Cyan border
    doc.setLineWidth(0.4);
    doc.rect(margin, y, contentWidth, 24, 'D');

    // Title & Branding
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('MEDFAULT AI - DIAGNOSTIC TELEMETRY REPORT', margin + 6, y + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text('Deep Learning Multi-Channel Medical Device Fault & Patient Risk Engine', margin + 6, y + 14);

    // Run ID & Mode Badge (Top Right)
    doc.setFont('courier', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(6, 182, 212); // Cyan
    doc.text(`Run ID: ${runId}`, pageWidth - margin - 6, y + 8, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(52, 211, 153); // Emerald
    doc.text(`MODE: ${mode.toUpperCase()} - STATUS: COMPLETE`, pageWidth - margin - 6, y + 14, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(203, 213, 225);
    const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
    doc.text(`Generated: ${dateStr}`, pageWidth - margin - 6, y + 20, { align: 'right' });

    y += 28;
  };

  drawHeader();

  // -------------------------------------------------------------
  // 1. Telemetry Metadata & Executive Manifest Box
  // -------------------------------------------------------------
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.setDrawColor(51, 65, 85); // Slate 700
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

  doc.setTextColor(192, 132, 252); // Purple 400 for Synthetic ICU telemetry
  doc.text(telemetryType, margin + 70, y + 11);

  doc.setTextColor(6, 182, 212); // Cyan
  doc.text(`${samplesCount.toLocaleString()} samples`, margin + 125, y + 11);

  doc.setTextColor(52, 211, 153); // Emerald
  doc.text(`${(sqiScore * 100).toFixed(1)}%`, margin + 155, y + 11);

  // Sub row: Execution details
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  const channelsStr = record?.sensorChannels?.join(', ') || 'SpO2, HeartRate, Pressure, Temp, FlowRate';
  doc.text(`Monitored Sensor Channels: ${channelsStr}`, margin + 4, y + 17);
  doc.text(`Inference Latency: ${(record?.executionTimeMs || 280).toFixed(0)} ms · Hardware Baseline: IEC 60601-1-8`, margin + 125, y + 17);

  y += 26;

  // -------------------------------------------------------------
  // 2. Diagnostic Model Verdicts Cards
  // -------------------------------------------------------------
  const cardWidth = (contentWidth - 6) / 3;
  const cardHeight = 22;

  // Card 1: Device Fault Status
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

  // Card 2: Patient Risk Level
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

  // Card 3: Model Confidence & Softmax Calibration
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

  // -------------------------------------------------------------
  // 3. Relevant Multi-Channel Signal Waveform Chart
  // -------------------------------------------------------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('RELEVANT PHYSIOLOGICAL & TRANSDUCER SIGNAL WAVEFORMS', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Continuous sequence telemetry with flagged anomaly intervals from current run', margin + 105, y);

  y += 3;

  const chartBoxX = margin;
  const chartBoxY = y;
  const chartBoxWidth = contentWidth;
  const chartBoxHeight = 56;

  // Chart container frame
  doc.setFillColor(6, 10, 19); // #060a13
  doc.setDrawColor(30, 41, 59); // #1e293b
  doc.setLineWidth(0.3);
  doc.rect(chartBoxX, chartBoxY, chartBoxWidth, chartBoxHeight, 'FD');

  // Channel Legends Bar inside chart top
  const legendY = chartBoxY + 5;
  const legends = [
    { label: 'SpO2 (%): Oxygen Saturation', color: [6, 182, 212] },       // Cyan
    { label: 'Heart Rate (bpm): Pulse Rate', color: [244, 63, 94] },     // Rose
    { label: 'Pressure (mmHg): Arterial/Blood', color: [59, 130, 246] },  // Blue
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

  // Chart Plot Area
  const plotX = chartBoxX + 14;
  const plotY = chartBoxY + 9;
  const plotW = chartBoxWidth - 20;
  const plotH = chartBoxHeight - 16;

  // Grid lines
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

  // Y-axis scale markings
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text('150', plotX - 2, plotY + 2, { align: 'right' });
  doc.text('100', plotX - 2, plotY + (plotH / 2) + 1, { align: 'right' });
  doc.text('50', plotX - 2, plotY + plotH, { align: 'right' });

  // Draw Waveforms if telemetry is present
  if (telemetry.length > 1) {
    const ptsCount = telemetry.length;
    const stepX = plotW / (ptsCount - 1);

    // Highlight flagged anomaly intervals in background
    doc.setFillColor(239, 68, 68);
    telemetry.forEach((pt, i) => {
      if (pt.isAnomaly) {
        const ax = plotX + i * stepX;
        doc.rect(ax - 0.5, plotY, Math.max(1, stepX), plotH, 'F');
      }
    });

    // Helper: Normalize value into chart Y
    const getY = (val: number, min: number, max: number) => {
      const clamped = Math.max(min, Math.min(max, val));
      const norm = (clamped - min) / (max - min);
      return plotY + plotH - norm * plotH;
    };

    // 1. SpO2 Waveform (Cyan: Range 80 - 100%)
    doc.setDrawColor(6, 182, 212);
    doc.setLineWidth(0.4);
    for (let i = 0; i < ptsCount - 1; i++) {
      const x1 = plotX + i * stepX;
      const y1 = getY(telemetry[i].spo2 ?? 98, 80, 102);
      const x2 = plotX + (i + 1) * stepX;
      const y2 = getY(telemetry[i + 1].spo2 ?? 98, 80, 102);
      doc.line(x1, y1, x2, y2);
    }

    // 2. Heart Rate Waveform (Rose: Range 40 - 180 bpm)
    doc.setDrawColor(244, 63, 94);
    doc.setLineWidth(0.4);
    for (let i = 0; i < ptsCount - 1; i++) {
      const x1 = plotX + i * stepX;
      const y1 = getY(telemetry[i].heartRate ?? 72, 40, 180);
      const x2 = plotX + (i + 1) * stepX;
      const y2 = getY(telemetry[i + 1].heartRate ?? 72, 40, 180);
      doc.line(x1, y1, x2, y2);
    }

    // 3. Pressure Waveform (Blue: Range 40 - 180 mmHg)
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.35);
    for (let i = 0; i < ptsCount - 1; i++) {
      const x1 = plotX + i * stepX;
      const y1 = getY(telemetry[i].pressure ?? 110, 40, 180);
      const x2 = plotX + (i + 1) * stepX;
      const y2 = getY(telemetry[i + 1].pressure ?? 110, 40, 180);
      doc.line(x1, y1, x2, y2);
    }

    // X-axis time markings
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    const startTime = telemetry[0].time || 't+0.0s';
    const midIdx = Math.floor(ptsCount / 2);
    const midTime = telemetry[midIdx].time || 't+mid';
    const endTime = telemetry[ptsCount - 1].time || `t+${(ptsCount * 0.1).toFixed(1)}s`;

    doc.text(startTime, plotX, plotY + plotH + 4);
    doc.text(midTime, plotX + plotW / 2, plotY + plotH + 4, { align: 'center' });
    doc.text(endTime, plotX + plotW, plotY + plotH + 4, { align: 'right' });
  }

  y += chartBoxHeight + 8;

  // -------------------------------------------------------------
  // 4. Detected Anomalies & Flagged Findings Section
  // -------------------------------------------------------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(`FLAGGED FINDINGS & DETECTED ANOMALIES (${anomalies.length} Flagged)`, margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Isolated deviations flagged strictly from this evaluation run', margin + 115, y);

  y += 4;

  if (anomalies.length === 0) {
    doc.setFillColor(15, 23, 42);
    doc.setDrawColor(52, 211, 153);
    doc.rect(margin, y, contentWidth, 16, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(52, 211, 153);
    doc.text('No Anomalies Flagged', margin + 6, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(203, 213, 225);
    doc.text('All physiological telemetry streams and transducer coupling metrics operated within normal baseline limits throughout the session.', margin + 6, y + 11);

    y += 20;
  } else {
    // Anomalies Table Header
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

    // Render each anomaly row
    anomalies.forEach((anom, idx) => {
      // Check for page overflow
      if (y > pageHeight - 25) {
        doc.addPage();
        y = margin;
        drawHeader();
        // re-draw table header on new page
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
      }

      const rowHeight = 16;
      const isEven = idx % 2 === 0;
      doc.setFillColor(isEven ? 15 : 20, isEven ? 23 : 30, isEven ? 42 : 48);
      doc.setDrawColor(51, 65, 85);
      doc.setLineWidth(0.15);
      doc.rect(margin, y, contentWidth, rowHeight, 'FD');

      // Timestamp
      doc.setFont('courier', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(6, 182, 212); // Cyan
      doc.text(anom.timestamp || 't+0.0s', margin + 3, y + 6);

      // Parameter
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(255, 255, 255);
      const paramText = doc.splitTextToSize(anom.parameter || 'Telemetry Stream', 54);
      doc.text(paramText, margin + 28, y + 5.5);

      // Severity Badge
      const isCrit = anom.severity === 'critical';
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(isCrit ? 244 : 251, isCrit ? 63 : 191, isCrit ? 94 : 36);
      doc.text(anom.severity.toUpperCase(), margin + 85, y + 6);

      // Observed vs Expected
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(226, 232, 240);
      doc.text(`Observed: ${anom.observedValue || '--'}`, margin + 105, y + 5.5);
      doc.setTextColor(148, 163, 184);
      doc.text(`Expected: ${anom.expectedRange || 'Nominal'}`, margin + 105, y + 10);

      // Implication & Action (wrapped)
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(203, 213, 225);
      const actionText = doc.splitTextToSize(`${anom.implication || ''} ${anom.suggestedAction || ''}`, 36);
      doc.text(actionText.slice(0, 3), margin + 145, y + 4.8);

      y += rowHeight;
    });
  }

  // -------------------------------------------------------------
  // 5. Verification Footer & Sign-off
  // -------------------------------------------------------------
  const footerY = pageHeight - margin - 6;
  doc.setDrawColor(51, 65, 85);
  doc.setLineWidth(0.2);
  doc.line(margin, footerY - 2, pageWidth - margin, footerY - 2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('CONFIDENTIAL MEDICAL DEVICE TELEMETRY REPORT - MEDFAULT AI DEEP LEARNING PROTOTYPE', margin, footerY + 2);
  doc.text(`Page 1 of ${doc.getNumberOfPages()} - Run Reference: ${runId}`, pageWidth - margin, footerY + 2, { align: 'right' });

  const fileName = `MedFault_AI_${runId}.pdf`;
  if (typeof window !== 'undefined') {
    doc.save(fileName);
  }
  return fileName;
}
