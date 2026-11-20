import urllib.request
import uuid
import json
import pandas as pd
import io

def test_csv_upload():
    boundary = '----Boundary' + uuid.uuid4().hex
    csv_bytes = b"time,spo2,heartRate,temperature,pressure,flowRate\n10:00,98.2,72,36.8,14.2,45.0\n10:05,98.0,74,36.9,14.3,45.1\n"
    
    parts = []
    parts.append(f'--{boundary}\r\n'.encode('utf-8'))
    parts.append(b'Content-Disposition: form-data; name="file"; filename="patient_monitor_upload.csv"\r\n')
    parts.append(b'Content-Type: text/csv\r\n\r\n')
    parts.append(csv_bytes)
    parts.append(f'\r\n--{boundary}--\r\n'.encode('utf-8'))
    
    body = b''.join(parts)
    req = urllib.request.Request(
        'http://127.0.0.1:8000/api/upload',
        data=body,
        headers={'Content-Type': f'multipart/form-data; boundary={boundary}'}
    )
    res = urllib.request.urlopen(req)
    data = json.loads(res.read().decode('utf-8'))
    print("CSV UPLOAD RESULT: isValid =", data.get("isValid"), "recordsCount =", data.get("recordsCount"))
    assert data.get("isValid") == True
    assert data.get("recordsCount") == 2

def test_fault_only_mode():
    req_data = json.dumps({'fileName': 'patient_monitor_upload.csv', 'mode': 'fault_only'}).encode('utf-8')
    req = urllib.request.Request('http://127.0.0.1:8000/api/analyze', data=req_data, headers={'Content-Type': 'application/json'})
    res = urllib.request.urlopen(req)
    data = json.loads(res.read().decode('utf-8'))
    print("FAULT_ONLY MODE RESULT: deviceStatus =", data['record']['deviceStatus'], "patientRisk =", data['record']['patientRisk'])
    assert data['record']['patientRisk'] == 'Low'

def test_risk_only_mode():
    req_data = json.dumps({'fileName': 'patient_monitor_upload.csv', 'mode': 'risk_only'}).encode('utf-8')
    req = urllib.request.Request('http://127.0.0.1:8000/api/analyze', data=req_data, headers={'Content-Type': 'application/json'})
    res = urllib.request.urlopen(req)
    data = json.loads(res.read().decode('utf-8'))
    print("RISK_ONLY MODE RESULT: deviceStatus =", data['record']['deviceStatus'], "patientRisk =", data['record']['patientRisk'])
    assert data['record']['deviceStatus'] == 'Normal'

if __name__ == "__main__":
    test_csv_upload()
    test_fault_only_mode()
    test_risk_only_mode()
    print("ALL API CHECKS PASSED.")
