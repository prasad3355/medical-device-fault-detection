export const MOCK_HISTORY = [
    { id: "1", dataset: "medical_sensor_24.csv", type: "Device Fault Detection", records: 1250, status: "Normal", risk: "Low", confidence: "96.4%", date: "Today" },
    { id: "2", dataset: "device_batch_08.xlsx", type: "Device Fault Detection", records: 980, status: "Possible Anomaly", risk: "Moderate", confidence: "91.8%", date: "Yesterday" },
    { id: "3", dataset: "sensor_data_17.csv", type: "Patient Risk Analysis", records: 2430, status: "Fault Detected", risk: "High", confidence: "94.2%", date: "Sep 21" },
    { id: "4", dataset: "clinic_03_export.csv", type: "Combined Analysis", records: 450, status: "Normal", risk: "Low", confidence: "98.1%", date: "Sep 19" },
    { id: "5", dataset: "ward_A_night.xlsx", type: "Patient Risk Analysis", records: 3120, status: "Possible Anomaly", risk: "Low", confidence: "89.5%", date: "Sep 18" },
];

export const MOCK_SENSOR_TRENDS = [
    { time: "00:00", heartRate: 72, spo2: 98, temp: 36.6, bp_sys: 120, bp_dia: 80 },
    { time: "04:00", heartRate: 68, spo2: 99, temp: 36.5, bp_sys: 118, bp_dia: 78 },
    { time: "08:00", heartRate: 75, spo2: 98, temp: 36.7, bp_sys: 122, bp_dia: 82 },
    { time: "12:00", heartRate: 82, spo2: 97, temp: 36.9, bp_sys: 125, bp_dia: 85 },
    { time: "16:00", heartRate: 78, spo2: 98, temp: 36.8, bp_sys: 124, bp_dia: 84 },
    { time: "20:00", heartRate: 74, spo2: 99, temp: 36.7, bp_sys: 121, bp_dia: 81 },
];

export const MOCK_ANOMALY_TRENDS = [
    { time: "00:00", heartRate: 72, expected: 75 },
    { time: "04:00", heartRate: 68, expected: 70 },
    { time: "08:00", heartRate: 75, expected: 78 },
    { time: "10:00", heartRate: 110, expected: 80 }, // Anomaly
    { time: "10:15", heartRate: 135, expected: 82 }, // Fault
    { time: "10:30", heartRate: 125, expected: 80 }, // Fault
    { time: "12:00", heartRate: 85, expected: 78 },
    { time: "16:00", heartRate: 78, expected: 75 },
];

export const MOCK_DETAILED_RESULTS = [
    { id: "r1", time: "10:00:24", param: "Heart Rate", observed: "110 bpm", expected: "60-100", status: "Possible Anomaly", confidence: "85%" },
    { id: "r2", time: "10:15:00", param: "Heart Rate", observed: "135 bpm", expected: "60-100", status: "Fault Detected", confidence: "94%" },
    { id: "r3", time: "10:30:12", param: "Heart Rate", observed: "125 bpm", expected: "60-100", status: "Fault Detected", confidence: "92%" },
    { id: "r4", time: "11:45:00", param: "SpO2", observed: "92%", expected: "95-100", status: "Possible Anomaly", confidence: "78%" },
];
