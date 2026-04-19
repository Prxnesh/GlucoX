# GlucoX

GlucoX is a full-stack diabetes risk intelligence platform that combines machine learning predictions, OCR-based lab report parsing, and a modern health dashboard.

## Features

- Authentication with JWT-based session handling
- Diabetes risk prediction from structured clinical inputs
- OCR extraction of glucose, HbA1c, and cholesterol from reports
- Advanced lifestyle assessment and profile view
- Personalized AI health chat backed by a local Ollama model
- Timeline, charts, and actionable health insights
- Responsive UI with light and dark themes

## Tech Stack

- Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS, Recharts, Framer Motion
- Backend: FastAPI, Prisma Client Python, PostgreSQL
- ML: scikit-learn (Logistic Regression baseline)
- OCR: pytesseract + pypdf (with poppler support for scanned PDFs)
- Local AI: Ollama chat API

## Repository Structure

```text
GlucoX/
├── frontend/
│   ├── app/
│   ├── components/
│   ├── features/
│   ├── lib/
│   └── styles/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── ml/
│   │   ├── ocr/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── utils/
│   ├── prisma/
│   └── scripts/
└── docker-compose.yml
```

## Architecture Diagram Guide

Use this section to draw a complete system architecture for the project.

### 1) Layers and components to include

- Client layer (frontend, Next.js)
  - Auth UI
  - Risk Predictor UI
  - Report Upload UI
  - Dashboard, History, and Insights UI
- API layer (backend, FastAPI)
  - `/api/auth/signup`
  - `/api/auth/login`
  - `/api/chat`
  - `/api/predict`
  - `/api/reports/analyze`
  - `/api/records/dashboard`
- Service layer (backend services)
  - Auth Service (JWT issue/verify)
  - Chat Service (personalized context + Ollama)
  - Prediction Service (validation + inference + persistence)
  - Report Service (OCR parse + extraction + persistence)
  - History Service (dashboard aggregation)
- ML/OCR layer
  - ML inference pipeline and trained artifact loading
  - OCR extractor with `pytesseract` + `pypdf`
- Data layer
  - Prisma Client Python
  - PostgreSQL
  - Entities: `User`, `HealthRecord`, `ReportExtraction`
- Runtime/infrastructure
  - Frontend on `3000`
  - Backend on `8000`
  - PostgreSQL on `5432`

### 2) Key data flows to draw

1. Authentication flow
   - Frontend sends credentials to auth endpoint
   - Backend validates and returns JWT
   - Frontend sends bearer token for protected routes
2. Prediction flow
   - Frontend posts vitals to `/api/predict`
   - Backend runs ML inference and creates prediction insights
   - Backend stores `HealthRecord` and returns response
3. OCR report flow
   - Frontend uploads file to `/api/reports/analyze`
   - Backend extracts text/biomarkers with OCR parsing
   - Backend stores `ReportExtraction` and linked `HealthRecord`
4. Dashboard flow
   - Frontend requests `/api/records/dashboard`
   - Backend aggregates latest prediction + timeline + reports
5. AI assistant flow
   - Frontend sends chat history and local lifestyle-profile facts to `/api/chat`
   - Backend enriches the prompt with saved predictions and reports
   - Ollama generates a personalized reply from that health context

### 3) Container diagram (Mermaid)

```mermaid
flowchart LR
  U[User]

  subgraph FE[Frontend - Next.js]
    A[Auth UI]
    P[Risk Predictor UI]
    R[Report Upload UI]
    D[Dashboard UI]
  end

  subgraph BE[Backend - FastAPI]
    AR[Auth Routes]
    CR[Chat Routes]
    PR[Prediction Routes]
    RR[Report Routes]
    DR[Dashboard Routes]

    AS[Auth Service]
    CS[Chat Service]
    PS[Prediction Service]
    RS[Report Service]
    HS[History Service]

    ML[ML Inference Engine]
    LLM[Ollama Local Model]
    OCR[OCR Extractor]
    ORM[Prisma Client Python]
  end

  subgraph DB[Data Layer]
    PG[(PostgreSQL)]
  end

  U --> FE
  A --> AR --> AS
  D --> CR --> CS --> LLM
  P --> PR --> PS --> ML
  R --> RR --> RS --> OCR
  D --> DR --> HS

  AS --> ORM
  CS --> ORM
  PS --> ORM
  RS --> ORM
  HS --> ORM
  ORM --> PG
```

### 4) Sequence diagram: prediction

```mermaid
sequenceDiagram
  autonumber
  participant UI as Frontend (Risk Predictor)
  participant API as FastAPI (/api/predict)
  participant SVC as Prediction Service
  participant ML as ML Pipeline
  participant DB as PostgreSQL (via Prisma)

  UI->>API: POST /api/predict (vitals + bearer token)
  API->>SVC: validate input and authorize user
  SVC->>ML: run inference (risk, category, confidence)
  ML-->>SVC: prediction output
  SVC->>DB: insert HealthRecord
  DB-->>SVC: record id + timestamp
  SVC-->>API: PredictionResponse
  API-->>UI: risk score + confidence + insights
```

### 5) Sequence diagram: OCR report analysis

```mermaid
sequenceDiagram
  autonumber
  participant UI as Frontend (Report Upload)
  participant API as FastAPI (/api/reports/analyze)
  participant SVC as Report Service
  participant OCR as OCR Extractor
  participant DB as PostgreSQL (via Prisma)

  UI->>API: POST /api/reports/analyze (file + bearer token)
  API->>SVC: validate file and authorize user
  SVC->>OCR: parse PDF/image and extract text/metrics
  OCR-->>SVC: glucose, HbA1c, cholesterol, raw text
  SVC->>DB: insert ReportExtraction
  SVC->>DB: insert linked HealthRecord
  DB-->>SVC: saved entities
  SVC-->>API: ReportExtractionResponse
  API-->>UI: extracted values + insights
```

### 6) ER diagram (Mermaid)

```mermaid
erDiagram
  USER ||--o{ HEALTH_RECORD : has
  USER ||--o{ REPORT_EXTRACTION : has
  REPORT_EXTRACTION o|--|| HEALTH_RECORD : linked_to

  USER {
    string id PK
    string name
    string email
    string passwordHash
    datetime createdAt
  }

  HEALTH_RECORD {
    string id PK
    string userId FK
    string source
    float riskScore
    string category
    float confidence
    float glucose
    float hba1c
    float cholesterol
    datetime recordedAt
  }

  REPORT_EXTRACTION {
    string id PK
    string userId FK
    float glucose
    float hba1c
    float cholesterol
    string rawText
    datetime createdAt
  }
```

## Quick Start

### Prerequisites

- Python 3.13 recommended
- Node.js 20+
- PostgreSQL 15+
- Ollama installed locally with a pulled chat model
- Prisma CLI
- (Optional but recommended) tesseract and poppler for OCR

### 1) Start PostgreSQL

Use Docker:

```bash
docker compose up -d
```

If your machine uses the legacy command, use:

```bash
docker-compose up -d
```

### 2) Backend setup

```bash
cd backend
cp .env.example .env
```

Suggested local values in backend/.env:

```env
DATABASE_URL=postgresql://diasense:diasense@localhost:5432/diasense
JWT_SECRET=replace-this-with-a-long-secret
JWT_ALGORITHM=HS256
JWT_EXPIRES_MINUTES=1440
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001
MODEL_PATH=app/ml/artifacts/diabetes_model.pkl
TESSERACT_CMD=/opt/homebrew/bin/tesseract
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.2:latest
OLLAMA_TIMEOUT_SECONDS=90
OLLAMA_TEMPERATURE=0.3
```

Install dependencies, generate Prisma client, push schema, and train model:

```bash
pip3 install -e .
prisma generate --schema=prisma/schema.prisma
prisma db push --schema=prisma/schema.prisma
python3 scripts/train_model.py
```

Run API:

```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Start Ollama in another terminal and pull a local model once:

```bash
ollama pull llama3.2
ollama serve
```

### 3) Frontend setup

```bash
cd ../frontend
npm install
```

Create frontend/.env.local:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

Run frontend:

```bash
npm run dev
```

Open app:

- Frontend: http://127.0.0.1:3000
- Backend docs: http://127.0.0.1:8000/docs
- Ollama: http://127.0.0.1:11434

## OCR Requirements

For scanned images/PDF OCR support, install:

```bash
brew install tesseract poppler
```

Text-based PDFs are still parsed directly using pypdf.

## ML Pipeline

- Dataset: backend/app/ml/data/pima-indians-diabetes.csv
- Baseline model: Logistic Regression
- Pipeline: median imputation + feature scaling + classifier
- Artifact output: backend/app/ml/artifacts/diabetes_model.pkl

Optional model training variant:

```bash
python3 scripts/train_model.py --model-kind xgboost
```

## Core API Endpoints

- POST /api/auth/signup
- POST /api/auth/login
- POST /api/predict
- POST /api/chat
- POST /api/reports/analyze
- GET /api/records/dashboard

## Example API Calls

Signup:

```bash
curl -X POST http://127.0.0.1:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Aarav Shah",
    "email": "aarav@example.com",
    "password": "StrongPass123"
  }'
```

Predict risk:

```bash
curl -X POST http://127.0.0.1:8000/api/predict \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT" \
  -d '{
    "age": 38,
    "bmi": 29.4,
    "glucose": 146,
    "blood_pressure": 86,
    "insulin": 92,
    "family_history": true
  }'
```

## Development Scripts

Frontend:

```bash
npm run dev
npm run typecheck
npm run lint
npm run build
```

Backend:

```bash
python3 scripts/train_model.py
prisma generate --schema=prisma/schema.prisma
prisma db push --schema=prisma/schema.prisma
uvicorn app.main:app --reload
```

## Notes

- If ports 3001 or 8010 are in use, switch to free ports and update frontend/.env.local accordingly.
- Current advanced assessment/profile persistence is browser-local (localStorage) on the frontend.
- The AI assistant is personalized with server-side health history plus the locally saved advanced profile on the active device.

## License

Add your preferred license information here (for example: MIT).
