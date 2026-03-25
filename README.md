# GlucoX

GlucoX is a full-stack diabetes risk intelligence platform that combines machine learning predictions, OCR-based lab report parsing, and a modern health dashboard.

## Features

- Authentication with JWT-based session handling
- Diabetes risk prediction from structured clinical inputs
- OCR extraction of glucose, HbA1c, and cholesterol from reports
- Advanced lifestyle assessment and profile view
- Timeline, charts, and actionable health insights
- Responsive UI with light and dark themes

## Tech Stack

- Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS, Recharts, Framer Motion
- Backend: FastAPI, Prisma Client Python, PostgreSQL
- ML: scikit-learn (Logistic Regression baseline)
- OCR: pytesseract + pypdf (with poppler support for scanned PDFs)

## Repository Structure

```text
HealthSense/
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

## Quick Start

### Prerequisites

- Python 3.13 recommended
- Node.js 20+
- PostgreSQL 15+
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
uvicorn app.main:app --host 127.0.0.1 --port 8010 --reload
```

### 3) Frontend setup

```bash
cd ../frontend
npm install
```

Create frontend/.env.local:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8010/api
```

Run frontend:

```bash
npm run dev -- --port 3001
```

Open app:

- Frontend: http://127.0.0.1:3001
- Backend docs: http://127.0.0.1:8010/docs

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
- POST /api/reports/analyze
- GET /api/records/dashboard

## Example API Calls

Signup:

```bash
curl -X POST http://127.0.0.1:8010/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Aarav Shah",
    "email": "aarav@example.com",
    "password": "StrongPass123"
  }'
```

Predict risk:

```bash
curl -X POST http://127.0.0.1:8010/api/predict \
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

## License

Add your preferred license information here (for example: MIT).
