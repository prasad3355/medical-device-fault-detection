import urllib.request
import json
import os
import subprocess

def fetch_json(url, data=None, headers=None):
    req = urllib.request.Request(url, data=data, headers=headers or {})
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

def fetch_text(url):
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as resp:
        return resp.read().decode('utf-8')

print("==================================================")
print("  STEP 1: VERIFY ONE-CLICK ICU TEST & PDF DATA")
print("==================================================")

sample_data = fetch_text("http://localhost:3000/samples/Synthetic_ICU_Telemetry_Test(1).csv")
rows = [r.strip() for r in sample_data.strip().split('\n') if r.strip()]
print(f"Sample file rows: {len(rows)} (1 header + {len(rows)-1} samples)")

boundary = "----Flow1OneClickPDFTest"
body = (
    f"--{boundary}\r\n"
    f'Content-Disposition: form-data; name="file"; filename="Synthetic_ICU_Telemetry_Test(1).csv"\r\n'
    f"Content-Type: text/csv\r\n\r\n"
).encode('utf-8') + sample_data.encode('utf-8') + f"\r\n--{boundary}--\r\n".encode('utf-8')

upload_res = fetch_json(
    "http://localhost:3000/api/upload",
    data=body,
    headers={"Content-Type": f"multipart/form-data; boundary={boundary}"}
)
print("Upload result:", upload_res["fileName"], f"Records: {upload_res['recordsCount']}")

analyze_res = fetch_json(
    "http://localhost:3000/api/analyze",
    data=json.dumps({"fileName": upload_res["fileName"], "mode": "dual"}).encode('utf-8'),
    headers={"Content-Type": "application/json"}
)
run_id_oneclick = analyze_res["record"]["id"]
print("Analysis result:")
print(f"  Run ID: {run_id_oneclick}")
print(f"  Dataset: {analyze_res['record']['datasetName']}")
print(f"  Samples: {analyze_res['record']['recordsCount']}")
print(f"  Device Type: {analyze_res['record']['deviceType']}")
print(f"  Device Status: {analyze_res['record']['deviceStatus']}")
print(f"  Patient Risk: {analyze_res['record']['patientRisk']}")
print(f"  Confidence: {analyze_res['record']['confidence']}%")
print(f"  Telemetry Count: {len(analyze_res['telemetry'])}")
print(f"  Anomalies Flagged: {len(analyze_res['anomalies'])}")

# Save JSON so node script can run the exact generateAnalysisPDF logic
json_path_1 = "d:/med_fault_detect/scratch/run_oneclick.json"
with open(json_path_1, "w") as f:
    json.dump(analyze_res, f)

print("\n==================================================")
print("  STEP 2: VERIFY MANUAL CSV UPLOAD & PDF DATA")
print("==================================================")

boundary2 = "----Flow2ManualPDFTest"
body2 = (
    f"--{boundary2}\r\n"
    f'Content-Disposition: form-data; name="file"; filename="Synthetic_ICU_Telemetry_Test(1).csv"\r\n'
    f"Content-Type: text/csv\r\n\r\n"
).encode('utf-8') + sample_data.encode('utf-8') + f"\r\n--{boundary2}--\r\n".encode('utf-8')

upload_res2 = fetch_json(
    "http://localhost:3000/api/upload",
    data=body2,
    headers={"Content-Type": f"multipart/form-data; boundary={boundary2}"}
)
analyze_res2 = fetch_json(
    "http://localhost:3000/api/analyze",
    data=json.dumps({"fileName": upload_res2["fileName"], "mode": "dual"}).encode('utf-8'),
    headers={"Content-Type": "application/json"}
)
run_id_manual = analyze_res2["record"]["id"]
print(f"Manual Run ID: {run_id_manual}, Samples: {analyze_res2['record']['recordsCount']}")

json_path_2 = "d:/med_fault_detect/scratch/run_manual.json"
with open(json_path_2, "w") as f:
    json.dump(analyze_res2, f)

print("\nBoth run payloads exported to scratch directory for PDF generation verification.")
