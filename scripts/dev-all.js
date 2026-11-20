const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const isWindows = process.platform === 'win32';
const rootDir = path.resolve(__dirname, '..');

// Kill any stale process holding port 3000 or 8000
function killPort(port) {
  if (isWindows) {
    try {
      const stdout = execSync(`netstat -ano | findstr :${port}`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString();
      const lines = stdout.trim().split('\n');
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && pid !== '0' && !isNaN(pid) && parseInt(pid, 10) !== process.pid) {
          try {
            execSync(`taskkill /pid ${pid} /f /t`, { stdio: 'ignore' });
          } catch { }
        }
      }
    } catch { }
  }
}

console.log('\x1b[36m%s\x1b[0m', '==================================================');
console.log('\x1b[36m%s\x1b[0m', '   Starting MedFault AI Full-Stack Services');
console.log('\x1b[36m%s\x1b[0m', '   Frontend: http://localhost:3000');
console.log('\x1b[36m%s\x1b[0m', '   Backend:  http://localhost:8000');
console.log('\x1b[36m%s\x1b[0m', '==================================================\n');

killPort(3000);
killPort(8000);

// 1. Start Backend (FastAPI / Uvicorn)
const venvPython = isWindows
  ? path.join(rootDir, '.venv', 'Scripts', 'python.exe')
  : path.join(rootDir, '.venv', 'bin', 'python');
const backendCmd = fs.existsSync(venvPython) ? venvPython : (isWindows ? 'python' : 'python3');
const backendArgs = ['-m', 'uvicorn', 'app.main:app', '--host', '0.0.0.0', '--port', '8000', '--reload'];
const backendProcess = spawn(backendCmd, backendArgs, {
  cwd: path.join(rootDir, 'backend'),
  shell: isWindows,
  stdio: 'pipe'
});

backendProcess.stdout.on('data', (data) => {
  process.stdout.write(`\x1b[34m[backend]\x1b[0m ${data}`);
});

backendProcess.stderr.on('data', (data) => {
  process.stderr.write(`\x1b[34m[backend]\x1b[0m ${data}`);
});

backendProcess.on('error', (err) => {
  console.error('\x1b[31m[backend error]\x1b[0m Failed to start backend process:', err.message);
});

// 2. Start Frontend (Next.js)
const npmCmd = isWindows ? 'npm.cmd' : 'npm';
const frontendArgs = ['--prefix', 'frontend', 'run', 'dev'];
const frontendProcess = spawn(npmCmd, frontendArgs, {
  cwd: rootDir,
  shell: isWindows,
  stdio: 'pipe'
});

frontendProcess.on('error', (err) => {
  console.error('\x1b[31m[frontend error]\x1b[0m Failed to start frontend process:', err.message);
});

frontendProcess.stdout.on('data', (data) => {
  process.stdout.write(`\x1b[32m[frontend]\x1b[0m ${data}`);
});

frontendProcess.stderr.on('data', (data) => {
  process.stderr.write(`\x1b[32m[frontend]\x1b[0m ${data}`);
});

// Clean shutdown handler
function shutdown() {
  console.log('\n\x1b[33m%s\x1b[0m', 'Shutting down MedFault AI services...');

  if (isWindows) {
    if (backendProcess && backendProcess.pid) {
      try { spawn('taskkill', ['/pid', backendProcess.pid, '/f', '/t'], { stdio: 'ignore' }); } catch { }
    }
    if (frontendProcess && frontendProcess.pid) {
      try { spawn('taskkill', ['/pid', frontendProcess.pid, '/f', '/t'], { stdio: 'ignore' }); } catch { }
    }
    killPort(3000);
    killPort(8000);
  } else {
    try { backendProcess.kill('SIGTERM'); } catch { }
    try { frontendProcess.kill('SIGTERM'); } catch { }
  }

  setTimeout(() => {
    process.exit(0);
  }, 1000);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('exit', shutdown);
