import sys
import os
import time
import json
import urllib.request
import urllib.parse
import subprocess
import shutil

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))

def run_tests():
    print("=== MedFault AI End-to-End Verification ===")
    
    # 1. Start backend process
    print("1. Spawning FastAPI backend on 127.0.0.1:8000...")
    backend = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000"],
        cwd=os.path.join(ROOT_DIR, "backend"),
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )

    # 2. Start Next.js frontend dev server
    print("2. Spawning Next.js frontend on localhost:3000...")
    frontend = subprocess.Popen(
        ["cmd.exe", "/c", "npm", "--prefix", "frontend", "run", "dev"],
        cwd=ROOT_DIR,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )

    try:
        # Wait for servers to spin up
        print("Waiting 7 seconds for servers to start...")
        time.sleep(7)

        # Step 1: Direct Health
        print("\n--- Testing Direct FastAPI Health (http://127.0.0.1:8000/api/health) ---")
        req = urllib.request.Request("http://127.0.0.1:8000/api/health")
        with urllib.request.urlopen(req, timeout=5) as resp:
            status = resp.status
            body = resp.read().decode()
            print(f"Direct Health Status: {status}")
            print(f"Direct Health Body: {body}")
            assert status == 200, f"Expected 200, got {status}"

        # Step 2: Proxied Health
        print("\n--- Testing Proxied Next.js Health (http://localhost:3000/api/health) ---")
        req = urllib.request.Request("http://localhost:3000/api/health")
        with urllib.request.urlopen(req, timeout=10) as resp:
            status = resp.status
            body = resp.read().decode()
            print(f"Proxied Health Status: {status}")
            print(f"Proxied Health Body: {body}")
            assert status == 200, f"Expected 200, got {status}"

        # Step 3: Upload Custom CSV (Synthetic_ICU_Telemetry_Test.csv) through Next.js proxy
        print("\n--- Testing Custom CSV Upload via Next.js Proxy (POST http://localhost:3000/api/upload) ---")
        test_csv_path = os.path.join(ROOT_DIR, "backend", "data", "uploads", "Synthetic_ICU_Telemetry_Test.csv")
        assert os.path.exists(test_csv_path), f"File {test_csv_path} does not exist"
        
        file_bytes = open(test_csv_path, "rb").read()
        boundary = "----WebKitFormBoundaryMedFaultTest123"
        body_parts = [
            f"--{boundary}\r\n".encode(),
            b'Content-Disposition: form-data; name="file"; filename="Synthetic_ICU_Telemetry_Test.csv"\r\n',
            b'Content-Type: text/csv\r\n\r\n',
            file_bytes,
            b'\r\n',
            f"--{boundary}--\r\n".encode()
        ]
        multipart_data = b"".join(body_parts)

        upload_req = urllib.request.Request(
            "http://localhost:3000/api/upload",
            data=multipart_data,
            headers={
                "Content-Type": f"multipart/form-data; boundary={boundary}"
            },
            method="POST"
        )
        with urllib.request.urlopen(upload_req, timeout=10) as resp:
            upload_res = json.loads(resp.read().decode())
            print(f"Upload Status: {resp.status}")
            print(f"Validation Result: isValid={upload_res.get('isValid')}, rows={upload_res.get('recordsCount')}, columns={upload_res.get('columns')}")
            assert upload_res.get("isValid") == True
            assert upload_res.get("recordsCount") == 240

        # Step 4: Run Dual Multi-Task Inference via Next.js Proxy
        print("\n--- Testing Dual Inference via Next.js Proxy (POST http://localhost:3000/api/analyze) ---")
        analyze_payload = json.dumps({
            "fileName": "Synthetic_ICU_Telemetry_Test.csv",
            "mode": "dual"
        }).encode("utf-8")
        analyze_req = urllib.request.Request(
            "http://localhost:3000/api/analyze",
            data=analyze_payload,
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        run_id = None
        with urllib.request.urlopen(analyze_req, timeout=10) as resp:
            analyze_res = json.loads(resp.read().decode())
            run_id = analyze_res["record"]["id"]
            print(f"Analyze Status: {resp.status}, Run ID: {run_id}")
            print(f"Device Status: {analyze_res['record']['deviceStatus']}")
            print(f"Patient Risk: {analyze_res['record']['patientRisk']}")
            print(f"Telemetry Points: {len(analyze_res['telemetry'])}")
            print(f"Anomalies Count: {len(analyze_res['anomalies'])}")
            assert len(analyze_res["telemetry"]) == 240, f"Expected 240 telemetry points, got {len(analyze_res['telemetry'])}"
            assert len(analyze_res["anomalies"]) > 0, "Expected anomalies detected"

        # Step 5: Refresh / Load by Run ID (GET /api/analysis/{run_id})
        print(f"\n--- Testing Report Load by Run ID (GET http://localhost:3000/api/analysis/{run_id}) ---")
        get_req = urllib.request.Request(f"http://localhost:3000/api/analysis/{run_id}")
        with urllib.request.urlopen(get_req, timeout=10) as resp:
            fetched_res = json.loads(resp.read().decode())
            print(f"Fetched Run ID: {fetched_res['record']['id']}")
            print(f"Fetched Telemetry Points: {len(fetched_res['telemetry'])}")
            print(f"Fetched Anomalies: {len(fetched_res['anomalies'])}")
            assert fetched_res["record"]["id"] == run_id
            assert len(fetched_res["telemetry"]) == 240

        # Step 6: Test Single Mode fault_only (Patient Risk must be 'Not assessed')
        print("\n--- Testing fault_only Mode (Patient Risk must be 'Not assessed') ---")
        fault_payload = json.dumps({
            "fileName": "Synthetic_ICU_Telemetry_Test.csv",
            "mode": "fault_only"
        }).encode("utf-8")
        fault_req = urllib.request.Request(
            "http://localhost:3000/api/analyze",
            data=fault_payload,
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(fault_req, timeout=10) as resp:
            fault_res = json.loads(resp.read().decode())
            print(f"fault_only Patient Risk: {fault_res['record']['patientRisk']}")
            print(f"fault_only Device Status: {fault_res['record']['deviceStatus']}")
            assert fault_res['record']['patientRisk'] == "Not assessed"

        # Step 7: Test Single Mode risk_only (Device Status must be 'Not assessed')
        print("\n--- Testing risk_only Mode (Device Status must be 'Not assessed') ---")
        risk_payload = json.dumps({
            "fileName": "Synthetic_ICU_Telemetry_Test.csv",
            "mode": "risk_only"
        }).encode("utf-8")
        risk_req = urllib.request.Request(
            "http://localhost:3000/api/analyze",
            data=risk_payload,
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(risk_req, timeout=10) as resp:
            risk_res = json.loads(resp.read().decode())
            print(f"risk_only Device Status: {risk_res['record']['deviceStatus']}")
            print(f"risk_only Patient Risk: {risk_res['record']['patientRisk']}")
            assert risk_res['record']['deviceStatus'] == "Not assessed"

        # Step 8: Test Preset Dataset
        print("\n--- Testing Preset Dataset (GET /api/datasets) ---")
        datasets_req = urllib.request.Request("http://localhost:3000/api/datasets")
        with urllib.request.urlopen(datasets_req, timeout=10) as resp:
            datasets_res = json.loads(resp.read().decode())
            presets = datasets_res.get("presets", [])
            print(f"Available presets: {[p['name'] for p in presets]}")
            assert len(presets) > 0

        # Step 9: History list
        print("\n--- Testing History List (GET /api/history) ---")
        history_req = urllib.request.Request("http://localhost:3000/api/history")
        with urllib.request.urlopen(history_req, timeout=10) as resp:
            history_res = json.loads(resp.read().decode())
            print(f"History records count: {len(history_res)}")
            assert any(item["id"] == run_id for item in history_res)

        # Step 10: Invalid file upload validation error
        print("\n--- Testing Invalid File Upload Validation Error ---")
        invalid_bytes = b"garbage,data\n1,2\n3,4"
        inv_boundary = "----WebKitBoundaryInvalidTest"
        inv_data = b"".join([
            f"--{inv_boundary}\r\n".encode(),
            b'Content-Disposition: form-data; name="file"; filename="invalid.csv"\r\n',
            b'Content-Type: text/csv\r\n\r\n',
            invalid_bytes,
            b'\r\n',
            f"--{inv_boundary}--\r\n".encode()
        ])
        inv_req = urllib.request.Request(
            "http://localhost:3000/api/upload",
            data=inv_data,
            headers={"Content-Type": f"multipart/form-data; boundary={inv_boundary}"},
            method="POST"
        )
        try:
            with urllib.request.urlopen(inv_req, timeout=10) as resp:
                inv_res = json.loads(resp.read().decode())
                print(f"Invalid file response: isValid={inv_res.get('isValid')}, errors={inv_res.get('validationErrors')}")
                assert inv_res.get("isValid") == False
        except urllib.error.HTTPError as he:
            print(f"Invalid file raised HTTP {he.code} as expected: {he.read().decode()}")

        print("\n===========================================")
        print(">>> ALL 10 END-TO-END CHECKS PASSED! <<<")
        print("===========================================")

    finally:
        print("\nCleaning up server processes...")
        try:
            subprocess.call(["taskkill", "/F", "/T", "/PID", str(backend.pid)])
        except Exception:
            pass
        try:
            subprocess.call(["taskkill", "/F", "/T", "/PID", str(frontend.pid)])
        except Exception:
            pass

if __name__ == "__main__":
    run_tests()
