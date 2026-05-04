# مساعد السيرة الذاتية الذكي | CV Optimizer AI

نظام ذكي متكامل لتحليل وتحسين السير الذاتية باستخدام الذكاء الاصطناعي، مبني على هندسة معمارية حديثة.

## Architecture

```
Frontend (Next.js / React) 
        ↓
API Layer (NestJS REST)
        ↓  
Business Logic (Modules)
        ↓
Database (PostgreSQL via TypeORM)
        ↓
Cache / Queue (Redis + Bull)
        ↓
Storage (S3 / Local Filesystem)
```

## المميزات التقنية

- **Next.js 14** – React framework with App Router, TypeScript, Tailwind CSS
- **NestJS** – Modular backend with dependency injection
- **PostgreSQL** – Relational database via TypeORM
- **Redis** – Caching & job queue (Bull)
- **S3/MinIO** – Object storage for CV files
- **Google Gemini AI** – Advanced CV analysis and optimization
- **DOCX Generation** – Download optimized resume in Word format
- **Async Job Processing** – Queue-based long-running analysis

## Prerequisites

- Node.js 20+ 
- PostgreSQL 14+
- Redis 7+
- (Optional) MinIO or AWS S3 for file storage

## Quick Start

### 1. Clone and Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Configuration

**Backend (.env)**
```env
# Server
PORT=3000
NODE_ENV=development

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=yourpassword
DB_DATABASE=cv_optimizer

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash

# Storage (local for development)
USE_LOCAL_STORAGE=true
UPLOAD_DIR=./uploads

# CORS
FRONTEND_URL=http://localhost:3001
```

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 3. Database Setup

Create the PostgreSQL database:

```bash
createdb cv_optimizer
# Or using psql:
psql -U postgres -c "CREATE DATABASE cv_optimizer;"
```

### 4. Start Services

**Start Redis:**
```bash
# Using Docker (recommended)
docker run -d -p 6379:6379 redis:alpine

# Or install locally
redis-server
```

**Start Backend (development):**
```bash
cd backend
npm run start:dev
```
The API will be available at `http://localhost:3000`
Bull dashboard at `http://localhost:3000/queues`

**Start Frontend (development):**
```bash
cd frontend
npm run dev
```
The app will be available at `http://localhost:3001`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/cv/analyze` | Upload CV and get immediate analysis |
| POST | `/cv/analyze-async` | Queue CV for background processing |
| GET | `/cv/history` | Retrieve analysis history |
| GET | `/cv/:id` | Get specific analysis result |
| GET | `/cv/status/:id` | Check job status |
| POST | `/cv/download` | Download optimized CV as DOCX |

### Example Request (cURL)

```bash
curl -X POST http://localhost:3000/cv/analyze \
  -F "file=@resume.pdf" \
  -F "jobDescription=Senior React Developer with 5+ years experience" \
  -F "additionalNotes=Focus on TypeScript and performance"
```

## Project Structure

```
backend/
├── src/
│   ├── ai/
│   │   ├── ai.module.ts
│   │   └── ai.service.ts        # Gemini AI integration
│   ├── cv/
│   │   ├── cv.controller.ts     # API endpoints
│   │   ├── cv.entity.ts         # Database entity
│   │   ├── cv.module.ts
│   │   └── cv.service.ts        # Business logic
│   ├── queue/
│   │   ├── cv.processor.ts      # Bull job processor
│   │   └── queue.module.ts
│   ├── storage/
│   │   ├── s3.service.ts        # S3/MinIO client
│   │   └── storage.module.ts
│   ├── app.module.ts
│   └── main.ts
├── .env
├── package.json
└── tsconfig.json

frontend/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx             # Main page component
│   ├── components/
│   │   ├── CVUploader.tsx
│   │   ├── HistorySection.tsx
│   │   └── ResultsSection.tsx
│   ├── lib/
│   │   └── api.ts               # Axios API client
│   └── types/
│       └── index.ts             # TypeScript interfaces
├── .env.local
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

## Docker Deployment (Optional)

**docker-compose.yml**

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: cv_optimizer
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - DB_HOST=postgres
      - REDIS_HOST=redis
    depends_on:
      - postgres
      - redis

  frontend:
    build: ./frontend
    ports:
      - "3001:3000"
    depends_on:
      - backend

volumes:
  postgres_data:
```

## Production Considerations

- Use AWS S3 or MinIO for file storage
- Enable Redis persistence
- Set up proper CORS whitelist
- Use managed PostgreSQL (RDS, CloudSQL, etc.)
- Configure log aggregation (Winston/Pino)
- Add rate limiting
- Use HTTPS with valid certificates
- Set `NODE_ENV=production` and run compiled dist

## Troubleshooting

**Error: ERRCONNECT** – Ensure PostgreSQL is running and credentials in `.env` are correct.

**Error: ENOTFOUND redis** – Start Redis server before starting backend.

**File upload fails** – Check `UPLOAD_DIR` exists and is writable.

**Gemini API errors** – Verify `GEMINI_API_KEY` is valid and has quotas.

**Build fails** – Ensure Node.js v20+ and run `npm ci` for clean install.

## License

MIT