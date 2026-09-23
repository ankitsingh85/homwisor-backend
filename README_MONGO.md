# HomWisor — MongoDB Guide

You now have **two backends** — file (default) and MongoDB (hybrid). No frontend change needed.

## Option A — Keep file DB (current, zero setup)
- Just run `node server.js` — uses `backend/data/db.json` (auto-created from defaultData: 25 properties, 10 builders, 4 testimonials, etc.)
- Works offline, instant. Good for demo.

## Option B — Use MongoDB (production)

### 1. Get a MongoDB URI
**Atlas (free, recommended):**
1. Go to https://cloud.mongodb.com → Create free cluster (M0)
2. Database Access → Add user (`homwisor` / password)
3. Network Access → Add IP `0.0.0.0/0` (allow all) or your server IP
4. Database → Connect → Drivers → Copy URI:
   `mongodb+srv://homwisor:PASSWORD@cluster0.xxxxx.mongodb.net/homwisor?retryWrites=true&w=majority`

**Local:**
```bash
docker run -d -p 27017:27017 --name mongo mongo:7
# URI = mongodb://localhost:27017/homwisor
```

### 2. Configure backend
```bash
cd backend
cp .env.example .env
# edit .env → set MONGODB_URI
nano .env
```
`.env` example:
```
PORT=5000
JWT_SECRET=HomWisor-secret-key-2026
MONGODB_URI=mongodb+srv://homwisor:PASSWORD@cluster0.xxxxx.mongodb.net/homwisor
```

### 3. Install deps (already done in this zip)
```bash
npm install   # mongoose + dotenv already in package.json
```

### 4. Seed (first time only)
The Mongo backend auto-seeds on first run if collections empty. Or manually:
```bash
MONGODB_URI="mongodb+srv://..." node seed.mongo.js
# you should see: Inserted 25 properties, 10 builders, etc.
```

### 5. Run Mongo backend
You have two ways:

**Hybrid (recommended) — `server.mongo.js`:**
```bash
node server.mongo.js
# If MONGODB_URI set → uses MongoDB, else falls back to file
# Logs: Backend running on ... — storage: MongoDB
```
Update `package.json` if you want it as default:
```json
"scripts": { "start": "node server.mongo.js" }
```

**Or replace original:**
```bash
cp server.mongo.js server.js
node server.js
```

**Health check:**
```bash
curl http://localhost:5000/api/health
# {"status":"ok","storage":"mongodb"}  ← confirms Mongo
curl http://localhost:5000/api/properties | jq length  # 25
```

### 6. Frontend — no change
Frontend still calls `GET /api/properties`, `/api/builders`, etc. Just ensure `frontend/src/utils/api.js` points to your backend URL.

### 7. Switching back to file
Just remove `MONGODB_URI` from `.env` and restart:
```bash
# in .env comment it out:
# MONGODB_URI=
node server.mongo.js
# → storage: file
```

## Files added for MongoDB
- `backend/.env.example` — env template
- `backend/models.js` — Mongoose schemas (Property, Snap, AppData, Enquiry)
- `backend/seed.mongo.js` — seed script
- `backend/server.mongo.js` — hybrid server (Mongo when URI present)
- `backend/README_MONGO.md` — this file

All data shapes match file DB — admin panel (`/admin` → `admin`/`admin123`) works identically: creates/updates go to Mongo when enabled.

## Deploy (e.g., Render / Railway / VPS)
1. Set env var `MONGODB_URI` in dashboard
2. Build: `npm install`
3. Start: `node server.mongo.js`
4. On first request collections auto-seed; or run seed script once.
