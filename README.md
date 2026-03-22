# GlucoX

GlucoX is a production-oriented diabetes risk prediction and health insights platform built with a clean frontend/backend split:

- `frontend`: Next.js App Router, TypeScript, Tailwind CSS, Recharts, Framer Motion
- `backend`: FastAPI, modular REST routes, Prisma-backed PostgreSQL, OCR services, and scikit-learn ML

The product flow covers:

- JWT auth with persistent frontend sessions
- Diabetes risk prediction from structured health inputs
- OCR extraction of glucose, HbA1c, and cholesterol from reports
- Health dashboards with custom charts and timeline history
- Human-readable insights generated from rule-based health logic

## Project Structure

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

## Local Setup

### 1. Start PostgreSQL

```bash
docker-compose up -d
```

### 2. Configure the backend

```bash
cd backend
cp .env.example .env
```

Recommended local `.env` values:

```env
DATABASE_URL=postgresql://diasense:diasense@localhost:5432/diasense
JWT_SECRET=replace-this-with-a-long-secret
JWT_ALGORITHM=HS256
JWT_EXPIRES_MINUTES=1440
CORS_ORIGINS=http://localhost:3000
MODEL_PATH=app/ml/artifacts/diabetes_model.pkl
TESSERACT_CMD=/opt/homebrew/bin/tesseract
```

Install dependencies, generate Prisma client, sync the schema, and train the model:

```bash
pip3 install -e .
prisma generate --schema=prisma/schema.prisma
prisma db push --schema=prisma/schema.prisma
python3 scripts/train_model.py
uvicorn app.main:app --reload
```

### 3. Configure the frontend

```bash
cd ../frontend
cp .env.example .env.local
npm install
npm run dev
```

Frontend environment:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

## OCR Requirements

For image OCR and scanned PDF support, install:

- `tesseract`
- `poppler`

On macOS with Homebrew:

```bash
brew install tesseract poppler
```

Text-based PDFs will still parse directly through `pypdf`.

## ML Pipeline

The training script uses the real PIMA Indians Diabetes dataset, stored locally at:

- `backend/app/ml/data/pima-indians-diabetes.csv`

The current baseline model:

- Uses `LogisticRegression`
- Applies median imputation and feature scaling
- Tracks `accuracy`, `precision`, and `recall`
- Saves the serialized model bundle to `backend/app/ml/artifacts/diabetes_model.pkl`

You can upgrade later with:

```bash
python3 scripts/train_model.py --model-kind xgboost
```

## Sample API Calls

### Signup

```bash
curl -X POST http://127.0.0.1:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Aarav Shah",
    "email": "aarav@example.com",
    "password": "StrongPass123"
  }'
```

### Login

```bash
curl -X POST http://127.0.0.1:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "aarav@example.com",
    "password": "StrongPass123"
  }'
```

### Predict Risk

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

### Analyze Report

```bash
curl -X POST http://127.0.0.1:8000/api/reports/analyze \
  -H "Authorization: Bearer YOUR_JWT" \
  -F "file=@/absolute/path/to/report.pdf"
```

### Fetch Dashboard

```bash
curl http://127.0.0.1:8000/api/records/dashboard \
  -H "Authorization: Bearer YOUR_JWT"
```

## Verification

Validated locally during setup:

- `frontend`: `npm run lint`
- `frontend`: `npm run typecheck`
- `frontend`: `npm run build`
- `backend`: `python3 -m compileall app`
- `backend`: `pip3 install -e .`
- `backend`: `prisma generate --schema=prisma/schema.prisma`
- `backend`: `python3 scripts/train_model.py`

The OCR extraction regex was also smoke-tested against a sample report string.
# HealthSense
