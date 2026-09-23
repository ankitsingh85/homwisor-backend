# HomWisor Backend — Express + MongoDB (MVC)

**Proper MVC structure as requested: `server` + `models/` per schema + `routes/` per resource + `middleware/` + `config/` + `utils/`**

```
backend/
├── server.js              # MVC entry — Express + MongoDB (requires MONGODB_URI)
├── server.file.js         # File DB fallback (zero-config demo, uses data/db.json)
├── server.mongo.js        # Legacy hybrid (optional)
├── config/
│   └── db.js              # mongoose connect
├── models/                # one file per schema
│   ├── Property.js        # 25 luxury/commercial/SCO properties
│   ├── Banner.js          # hero + small banners
│   ├── Location.js        # prime locations
│   ├── Offer.js           # festival offers
│   ├── Builder.js         # popular builders (10)
│   ├── Testimonial.js     # 4 testimonials
│   ├── Snap.js            # vertical reels
│   ├── Enquiry.js         # leads
│   └── Settings.js        # siteName, contact
├── routes/                # one file per resource
│   ├── propertyRoutes.js  # GET / POST / PUT / DELETE
│   ├── snapRoutes.js
│   ├── bannerRoutes.js
│   ├── locationRoutes.js
│   ├── offerRoutes.js
│   ├── builderRoutes.js
│   ├── testimonialRoutes.js
│   ├── enquiryRoutes.js
│   ├── settingsRoutes.js
│   ├── authRoutes.js      # POST /api/admin/login
│   └── adminRoutes.js     # GET /stats, POST /reset
├── middleware/
│   └── auth.js            # JWT protect + generateToken
├── utils/
│   ├── seedData.js        # defaultData (all demo data)
│   └── seed.js            # seedIfEmpty / seedForce
├── .env.example
├── package.json
└── data/
    └── db.json            # used only by server.file.js fallback
```

## Quick Start

### File DB (current demo, no Mongo needed)
```bash
npm install
npm start              # = node server.file.js → http://localhost:5000 (file)
# or
npm run dev
```

### MongoDB (production — proper MVC)

**1. Create Atlas cluster (free):**
- https://cloud.mongodb.com → Create M0 → Database Access → Add user → Network Access → Allow `0.0.0.0/0` → Connect → Drivers → copy URI

**2. Configure:**
```bash
cp .env.example .env
# edit .env:
# MONGODB_URI=mongodb+srv://homwisor:PASS@cluster0.xxxxx.mongodb.net/homwisor?retryWrites=true&w=majority
# JWT_SECRET=HomWisor-secret-key-2026
# PORT=5000
```

**3. Install & Seed:**
```bash
npm install   # mongoose, dotenv already in package.json
# auto-seeds on first start if empty, or manual:
npm run seed:mongo      # or: MONGODB_URI="..." node seed.mongo.js
# or
node utils/seed.js      # called via server.js on start
```

**4. Run MVC server:**
```bash
npm run start:mongo   # = node server.js → MongoDB
# or
npm run dev:mongo     # watch
```

Check:
```bash
curl http://localhost:5000/api/health
# {"status":"ok","db":"mongo"}

curl http://localhost:5000/api/properties | jq length  # 25
curl http://localhost:5000/api/builders | jq length    # 10
```

### Frontend — no change
`frontend/src/utils/api.js` → `http://localhost:5000/api/*`

Admin: `http://localhost:5173/admin` → `admin` / `admin123`

### Switching back
```bash
npm start          # file DB
npm run start:mongo # mongo DB
```

## Models — Schemas

All schemas match file DB shape so frontend needs zero changes. Example:

- **Property:** `id, title, price, priceRange, location, image (600×400), logo (200×80), brandColor, developer, highlights[], gallery[] (800×500), category, tag, rera, bhk, type, status`
- **Snap:** `videoUrl, thumbnail, phone, demandText, activeBuyers, monthlyRental, roi, badge`
- **Builder:** `name, logo, projects, count`
- **Testimonial:** `initials, color, rating, text`

## Deploy (Render / Railway / VPS)

- Set env var `MONGODB_URI` in dashboard
- Build: `npm install`
- Start: `npm run start:mongo`
- First request auto-seeds; or run `npm run seed:mongo` once

## Legacy files kept for reference
- `server.file.js` — old monolith file DB
- `server.mongo.js` — previous hybrid (file↔mongo)
- `models.js` — combined models (replaced by `models/` folder)

See `README_MONGO.md` for Atlas troubleshooting.
