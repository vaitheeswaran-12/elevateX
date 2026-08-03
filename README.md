# ElevateX — Learn. Build. Get Hired.

ElevateX is a production-ready, ultra-modern, all-in-one EdTech + Career Placement Platform. It unites premium technical instruction, auto-evaluated coding assignments, verifiable cryptographic credentials, and dynamic ATS matching pipelines under a singular cohesive ecosystem.

---

## 🚀 Project Overview

ElevateX provides four distinct interactive user portals designed to streamline technical education and accelerate career progression:
1. **Students**: Learn skills through modular course structures, take timers-backed quizzes, write personal lesson notes, complete assignments, download verifiably-secured credentials, search jobs through advanced catalog filters, and track candidate pipeline states step-by-step.
2. **Instructors**: Orchestrate interactive curriculums, design structured modules, author quiz assessments, view student lists, and monitor analytics insights.
3. **Recruiters**: Manage candidate applications in an ATS (Applicant Tracking System) environment, perform bulk publication/deletion, clone/duplicate listings, and shortlist applicants.
4. **Platform Administrators**: Moderate users, verify certificates, audit jobs, review security audit logs, configure global platform metadata, and monitor system analytics.

---

## 🛠️ Tech Stack

### Frontend:
- **Core Library**: React (Vite-backed client compilation)
- **Styling**: Tailwind CSS (Premium SaaS UI design)
- **State Management**: React Context API
- **Visual Analytics**: Recharts
- **Icons**: Lucide React
- **E2E Visual Verification**: Playwright Engine

### Backend:
- **Core Server**: Node.js + Express.js REST API
- **Database Engine**: PostgreSQL (fully normalized, pool-managed)
- **Security & Authorization**: JSON Web Tokens (JWT) + Google OAuth mock
- **Security Hardening**: Helmet, CORS, Gzip Compression, Request size limits
- **DDoS Safeguards**: Express-rate-limit middleware
- **Structured Logging**: Winston + Morgan stream integration
- **Documentation Engine**: Swagger / OpenAPI 3.0 UI

---

## 📂 Folder Structure

```
elevatex-platform/
├── .github/
│   └── workflows/
│       └── ci.yml                     # Multi-stage GitHub Actions CI Pipeline
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                  # Pool connection manager & translations
│   │   │   ├── schema.sql             # Base database tables and schema
│   │   │   ├── migrations.sql         # Table upgrades & index enhancements
│   │   │   ├── seed_data.js           # default seed generator
│   │   │   └── init_db.js             # Database setup orchestrator
│   │   ├── controllers/               # Business handlers (Auth, Jobs, Learning)
│   │   ├── middleware/                # Security validators (Auth token checks)
│   │   ├── models/                    # Data models
│   │   ├── routes/                    # API router configurations
│   │   ├── utils/
│   │   │   ├── logger.js              # Centralized Winston production logger
│   │   │   └── jwt.js                 # JWT encoding helpers
│   │   ├── app.js                     # Express app configuration & middleware
│   │   └── server.js                  # Production server entrypoint
│   ├── tests/                         # Backend integration & unit Jest tests
│   ├── Dockerfile                     # Optimized production multi-stage Docker build
│   ├── .env.example
│   ├── .env.development
│   └── .env.production
├── frontend/
│   ├── src/
│   │   ├── components/                # Reusable layouts & dashboard wrappers
│   │   ├── context/                   # Context states (Auth, Theme)
│   │   ├── pages/                     # Interactive Views (Student, Recruiter, Admin)
│   │   ├── App.jsx                    # Core page routing table
│   │   └── main.jsx                   # React bootloader
│   ├── nginx.conf                     # Production-grade reverse proxy configuration
│   ├── Dockerfile                     # Vite compiler & Nginx hosting container
│   ├── .env.example
│   ├── .env.development
│   ├── .env.production
│   └── vercel.json                    # Single-Page-App deployment configurations
├── docker-compose.yml                 # Root container orchestration setup
└── README.md                          # Platform instruction manual
```

---

## 📦 Environment Variables

### Backend Configuration (`backend/.env`):
- `DATABASE_URL`: PostgreSQL connection string (Supabase / local container).
- `PORT`: Port the Express server listens on (Default: `5000`).
- `JWT_SECRET`: Strong secret key used for signing JWT access tokens.
- `NODE_ENV`: Runtime stage (`development` or `production`).

### Frontend Configuration (`frontend/.env`):
- `VITE_API_URL`: Root endpoint for client-side queries (Default: `/api`).

---

## 🐳 Docker Setup & Containers

To spin up the complete ElevateX ecosystem in one unified command (including PostgreSQL database, Express.js backend, and Nginx-hosted Vite frontend), execute:

```bash
docker compose up --build -d
```

### Access Ports:
- **Frontend Client**: `http://localhost:3000`
- **Backend API Server**: `http://localhost:5000`
- **PostgreSQL Database**: `localhost:5432`

---

## 🔧 Local Development Setup

To run services locally without containerization:

### Prerequisites:
- Node.js v22+
- PostgreSQL active daemon

### 1. Database Setup:
Configure your local environment variables in `backend/.env` and execute:

```bash
cd backend
npm install
node src/config/init_db.js
node src/config/seed_data.js
```

### 2. Run Backend Server:
```bash
npm start
```

### 3. Run Frontend Server:
```bash
cd ../frontend
npm install
npm run dev
```

---

## 🔒 Production Hardening & Monitoring

ElevateX implements elite, production-grade security and logging structures:
- **Helmet Headers**: Guards against standard security vulnerabilities (XSS, Clickjacking, MIME sniffing).
- **Express Rate Limiting**: Mitigates brute-force attacks by limiting requests per client.
- **Centralized Logs**: All HTTP traffic, server actions, and runtime errors are formatted into JSON logs under `backend/logs/combined.log` and `backend/logs/error.log` via Winston.
- **Health Probes**: Automated orchestrators can ping `/health`, `/ready`, and `/live` endpoints to check database connectivity and liveness.

---

## 📄 API Documentation (Swagger)

A beautiful, interactive Swagger-UI displaying all endpoints (Authentication, Portals, Jobs, Courses) is compiled and hosted at:

```
http://localhost:5000/api/docs
```

---

## 🧪 Testing & Verification

### Run Backend Jest Tests:
```bash
cd backend
npm test
```

### Run Frontend ES-Lint Audit:
```bash
cd frontend
npm run lint
```

### Run Playwright Visual Verifications:
```bash
python /home/jules/verification/verify_elevatex.py
```

---

## 🚀 Deployment Guide

### Frontend on Vercel:
1. Link your repository on the [Vercel Dashboard](https://vercel.com).
2. Set Framework Preset to **Vite**.
3. Set the Root Directory to `frontend`.
4. Configure environment variables (`VITE_API_URL`).
5. Click Deploy.

### Backend on Render:
1. Connect repository on [Render](https://render.com).
2. Choose **Web Service** node environment.
3. Set build command to `cd backend && npm install`.
4. Set start command to `cd backend && npm start`.
5. Populate environment variables (`DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`).

---

## 📄 License

This project is licensed under the terms of the MIT License.
