#!/usr/bin/env bash
# =============================================================================
#  One-command runner for the BAC-Labs workshop lab.
#
#  After cloning the repo:
#      bash run.sh
#
#  Auto-picks free ports (no fixed 3000/3001), so it still works when those
#  ports are already taken on the participant's machine. Safe to stop (Ctrl+C)
#  and re-run — each run finds fresh free ports.
#
#  Starts four targets on separate ports:
#    1. main app      (BAC-Labs)               -> printed
#    2. TiketLab      (AI practice target)     -> printed
#    3. SQLi MySQL    (sqlmap full dump)       -> printed (port 3005)
#    4. recon         (legacy-report-service)  -> hidden, find it with nmap
#
#  On WSL it also prints the WSL IP and the Windows host IP, and best-effort
#  opens the Windows firewall for those ports so the lab is reachable from
#  Windows / the LAN.
#
#  Options:
#    bash run.sh --reset   wipe the database before starting (fresh lab)
#
#  Stop with Ctrl+C (all services stop together).
# =============================================================================
set -euo pipefail
cd "$(dirname "$0")"

# --- 1. Node check ----------------------------------------------------------
if ! command -v node >/dev/null 2>&1; then
  echo "[!] Node.js not found. Install Node.js 22 LTS first:"
  echo "    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -"
  echo "    sudo apt-get install -y nodejs"
  exit 1
fi

NODE_MAJOR="$(node -v | sed 's/^v//' | cut -d. -f1)"
if [ "$NODE_MAJOR" -lt 22 ]; then
  echo "[!] Node.js 22 LTS or newer required (found $(node -v)). BAC-Labs fails on Node 20."
  exit 1
fi
echo "[+] Node.js $(node -v)"

# --- 2. Find free ports (probe 127.0.0.1, first free wins) ------------------
find_free_port() {
  local port="${1:-3000}"
  while (exec 3<>"/dev/tcp/127.0.0.1/$port") 2>/dev/null; do
    port=$((port + 1))
  done
  echo "$port"
}

MAIN_PORT="$(find_free_port 3000)"
RECON_PORT="$(find_free_port $((MAIN_PORT + 1)))"
TIKETLAB_PORT="$(find_free_port $((RECON_PORT + 1)))"

# --- 3. Network addresses (WSL + Windows host) + firewall -------------------
# Primary non-loopback IP, portable across Linux / WSL / macOS.
WSL_IP="$(hostname -I 2>/dev/null | awk '{print $1}')"                                   # Linux / WSL
[ -z "$WSL_IP" ] && WSL_IP="$(ipconfig getifaddr en0 2>/dev/null)"                      # macOS
[ -z "$WSL_IP" ] && WSL_IP="$(ifconfig 2>/dev/null | awk '/inet / && $2 != "127.0.0.1" {print $2; exit}')"  # BSD / other

# Windows host IP via interop (exclude loopback, APIPA 169.x, and WSL 172.x).
WIN_IP="$(ipconfig.exe 2>/dev/null | tr -d '\r' | grep -i 'IPv4' | grep -oE '([0-9]{1,3}\.){3}[0-9]{1,3}' | grep -vE '^172\.|^169\.|^127\.' | head -1)"

# Best-effort: allow Windows to reach the WSL services on these ports.
# New-NetFirewallRule needs an elevated terminal; if it fails, localhost
# forwarding still works from the Windows browser, so this is non-fatal.
if command -v powershell.exe >/dev/null 2>&1; then
  powershell.exe -NoProfile -Command \
    "New-NetFirewallRule -DisplayName 'BAC-Labs Workshop' -Direction Inbound -Protocol TCP -LocalPort $MAIN_PORT,$RECON_PORT,$TIKETLAB_PORT,3005 -Action Allow -ErrorAction SilentlyContinue" \
    >/dev/null 2>&1 || true
fi

# --- 4. Docker + SQLi MySQL lab (full sqlmap practice) -----------------------
SQLI_MYSQL_UP=0
SQLI_MYSQL_PORT="$(find_free_port 3005)"
# Write the chosen port so the BAC-Labs dashboard card can link to it.
echo "$SQLI_MYSQL_PORT" > .sqli-mysql-port

watch_sqli_mysql() {
  local tries=0
  while [ "$tries" -lt 120 ]; do
    if [ "$(curl -s -o /dev/null -w '%{http_code}' --max-time 2 "http://localhost:$SQLI_MYSQL_PORT/search?q=laptop" 2>/dev/null)" = "200" ]; then
      echo
      echo "[+] SQLi MySQL lab READY: http://localhost:$SQLI_MYSQL_PORT/search?q=laptop"
      return 0
    fi
    tries=$((tries + 1))
    sleep 2
    if [ $((tries % 5)) -eq 0 ]; then
      echo "[.] SQLi MySQL lab still building... ($((tries * 2))s elapsed)"
    fi
  done
  echo
  echo "[!] SQLi MySQL lab still building after ~4 min. Check: sqli-mysql/.sqli-mysql.log"
}

start_sqli_mysql() {
  (cd sqli-mysql && SQLI_MYSQL_PORT="$SQLI_MYSQL_PORT" docker compose up -d --build > .sqli-mysql.log 2>&1 &)
  SQLI_MYSQL_UP=1
  echo "[+] SQLi MySQL lab building on http://localhost:$SQLI_MYSQL_PORT (watch below for READY)"
  watch_sqli_mysql &
}

if docker info >/dev/null 2>&1; then
  echo "[+] Docker ready. Starting the SQLi MySQL lab..."
  start_sqli_mysql
elif command -v docker >/dev/null 2>&1; then
  echo "[!] Docker CLI is present but the daemon is not reachable."
  echo "    If you run Docker Desktop on Windows, enable WSL integration for this"
  echo "    distro: Docker Desktop -> Settings -> Resources -> WSL Integration."
  echo "    Skipping the MySQL SQLi lab; everything else still runs."
else
  echo "[+] Docker not found. Installing Docker Engine (best-effort)..."
  if command -v apt-get >/dev/null 2>&1; then
    sudo apt-get install -y docker.io docker-compose-v2 >/dev/null 2>&1 || true
    (sudo systemctl start docker 2>/dev/null || sudo service docker start 2>/dev/null || (sudo dockerd >/tmp/dockerd.log 2>&1 &)) || true
    sleep 5
  fi
  if docker info >/dev/null 2>&1; then
    echo "[+] Docker ready. Starting the SQLi MySQL lab..."
    start_sqli_mysql
  else
    echo "[!] Could not start Docker automatically. Skipping the MySQL SQLi lab."
    echo "    Manual: cd sqli-mysql && docker compose up --build"
  fi
fi

# --- 4. Optional DB reset ---------------------------------------------------
if [ "${1:-}" = "--reset" ]; then
  echo "[+] Wiping database (fresh lab)..."
  rm -f database.db database.db-shm database.db-wal
fi

# --- 5. Install on first run ------------------------------------------------
if [ ! -d node_modules ]; then
  echo "[+] Installing dependencies (first run, ~2 min)..."
  npm install
fi

# --- 6. Start background services (recon + TiketLab) -----------------------
# The recon service's stdout goes to a log so its port stays a surprise.
PORT="$RECON_PORT" node recon-service/server.js > .recon-service.log 2>&1 &
RECON_PID=$!

# TiketLab challenge target (its URL is printed so participants can solve it).
HOST=0.0.0.0 PORT="$TIKETLAB_PORT" node tiketlab/server.js > .tiketlab.log 2>&1 &
TIKETLAB_PID=$!

# Stop both background services when this script exits (e.g. main app stops).
cleanup() {
  kill "$RECON_PID" 2>/dev/null || true
  kill "$TIKETLAB_PID" 2>/dev/null || true
}
trap cleanup EXIT

echo
echo "  Main app       : http://localhost:$MAIN_PORT/login   (user/user123)"
echo "  TiketLab       : http://localhost:$TIKETLAB_PORT      (AI practice target)"
if [ "$SQLI_MYSQL_UP" = 1 ]; then
  echo "  SQLi MySQL lab : http://localhost:$SQLI_MYSQL_PORT/search?q=laptop   (building... see READY below)"
fi
if [ -n "$WSL_IP" ]; then
  echo "  WSL IP         : http://$WSL_IP:$MAIN_PORT   (from Windows / other WSL)"
fi
if [ -n "$WIN_IP" ]; then
  echo "  Windows LAN IP : $WIN_IP   (other machines need a port proxy + firewall rule)"
fi
echo "  Second service : running on another port — find it with:  nmap -p- localhost"
echo "  Stop           : Ctrl+C"
echo

# --- 7. Start the main app (foreground, on its found port) ------------------
npm run dev -- -p "$MAIN_PORT"
