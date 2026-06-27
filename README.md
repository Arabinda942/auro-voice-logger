# AURO Limited — Voice Logger v2.0

Enterprise voice call management system with SIP routing, call recording, agent dashboards, and admin control.

---

## Stack
| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6 |
| Backend | FastAPI (Python 3.11) |
| Database | PostgreSQL (via SQLAlchemy) |
| Auth | JWT (python-jose + bcrypt) |
| Deploy | Render.com |

---

## Local Development

### 1. Clone & setup backend
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Create local PostgreSQL database
```bash
createdb auro_voice_logger
```

### 3. Set environment variable
```bash
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/auro_voice_logger"
export SECRET_KEY="your-secret-key-here"
```

### 4. Seed the database (run once)
```bash
python seed.py
```
This creates:
- **Admin:** `admin` / `admin123`
- **Agents:** `rahul/rahul123`, `amit/amit123`, `suman/suman123`, `priya/priya123`, `rakesh/rakesh123`
- Sample branches, SIP lines, clients, call logs

### 5. Start backend
```bash
uvicorn main:app --reload --port 8000
```
API docs: http://localhost:8000/docs

### 6. Setup frontend
```bash
cd ../frontend
npm install
```

### 7. Set frontend env
```bash
cp .env.example .env
# Edit .env: REACT_APP_API_URL=http://localhost:8000
```

### 8. Start frontend
```bash
npm start
```
App: http://localhost:3000

---

## Deploy to Render.com (One-click)

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "AURO Voice Logger v2.0"
git remote add origin https://github.com/YOUR_USERNAME/auro-voice-logger.git
git push -u origin main
```

### Step 2 — Deploy on Render
1. Go to https://render.com → **New** → **Blueprint**
2. Connect your GitHub repo
3. Render reads `render.yaml` and auto-creates:
   - PostgreSQL database
   - FastAPI backend service
   - React frontend (static site)
4. Click **Apply** — done!

### Step 3 — Seed the database on Render
After first deploy, open the backend service **Shell** tab on Render and run:
```bash
python seed.py
```

### Environment variables set automatically by render.yaml:
| Variable | Value |
|---|---|
| `DATABASE_URL` | Auto from Render PostgreSQL |
| `SECRET_KEY` | Auto-generated |
| `REACT_APP_API_URL` | Auto from backend service URL |

---

## Project Structure
```
auro-voice-logger/
├── render.yaml                    ← Render deployment blueprint
├── backend/
│   ├── main.py                    ← FastAPI app + all routes
│   ├── models.py                  ← SQLAlchemy ORM models
│   ├── schemas.py                 ← Pydantic request/response schemas
│   ├── crud.py                    ← Database operations
│   ├── auth.py                    ← JWT authentication
│   ├── database.py                ← DB connection
│   ├── seed.py                    ← Initial data seed
│   └── requirements.txt
└── frontend/
    ├── public/index.html
    └── src/
        ├── App.js                 ← Root + routing + auth guards
        ├── styles/global.css      ← AURO classic theme
        ├── utils/
        │   ├── api.js             ← Axios + all API calls
        │   └── AuthContext.js     ← Login/logout state
        ├── components/
        │   ├── AdminSidebar.js
        │   ├── AgentSidebar.js
        │   ├── Modal.js
        │   ├── Toast.js
        │   └── ConfirmDialog.js
        └── pages/
            ├── LoginPage.js       ← Shared login (Admin + Agent)
            ├── admin/
            │   ├── AdminLayout.js
            │   ├── Dashboard.js
            │   ├── LiveMonitor.js
            │   ├── Users.js       ← Full CRUD + password mgmt
            │   ├── Branches.js
            │   ├── Dealers.js     ← Multi-number, hunt rings, failover
            │   ├── Clients.js     ← UCC, SIP mapping, preferred agent
            │   ├── SIPLines.js
            │   ├── CallLogs.js
            │   ├── Recordings.js
            │   ├── MissedCalls.js
            │   ├── ExcelUpload.js
            │   └── Reports.js
            └── agent/
                ├── AgentLayout.js
                ├── AgentDashboard.js  ← Incoming call banner, live timer, number switch
                ├── DialPad.js
                ├── MyCalls.js
                ├── AgentMissed.js
                ├── MyNumbers.js       ← Configure hunt numbers + rings
                ├── PriorityFailover.js
                └── AgentRecordings.js
```

---

## Default Login Credentials
| Role | Login ID | Password |
|---|---|---|
| Super Admin | `admin` | `admin123` |
| Agent | `rahul` | `rahul123` |
| Agent | `amit` | `amit123` |
| Agent | `suman` | `suman123` |

> **Change all passwords after first login via Admin → User Accounts → Edit**

---

## Key Features
- ✅ Single login page for Admin and Agent (role-based redirect)
- ✅ Admin sets login ID + password for every user
- ✅ 50 branches, 200+ dealers supported
- ✅ Per-dealer multi-number hunt with configurable rings per number
- ✅ Failover dealer chain mapping
- ✅ Client ↔ preferred agent + SIP line mapping
- ✅ UCC code per client
- ✅ Excel import for agents and clients
- ✅ Live call monitoring with agent status
- ✅ Call logs with filters (date, type, branch, agent)
- ✅ Recording play + WAV/MP3 download
- ✅ Missed calls with callback action
- ✅ Agent: mid-call number switching
- ✅ Agent: live call timer, mute, hold, transfer
- ✅ JWT auth with 12-hour sessions
- ✅ PostgreSQL with full relational schema
