# Finance Dashboard - Complete Deployment Guide

## ✅ Project Requirements Verification

Your backend successfully meets **ALL** core requirements:

### 1. ✅ User and Role Management

**Location:** `backend/src/modules/auth/` & `backend/src/modules/users/`

- **Roles Implemented:** VIEWER, ANALYST, ADMIN
- **Features:** User creation, role assignment, status management (ACTIVE/INACTIVE)
- **Implementation:** JWT authentication with bcrypt password hashing

### 2. ✅ Financial Records Management

**Location:** `backend/src/modules/records/`

- **Fields:** Amount, Type (INCOME/EXPENSE), Category, Date, Notes
- **Operations:** Create, Read, Update, Delete (CRUD)
- **Features:** Filtering by date range, category, type; Pagination; Soft delete

### 3. ✅ Dashboard Summary APIs

**Location:** `backend/src/modules/dashboard/`

- `GET /api/dashboard/summary` → Total income, expenses, net balance
- `GET /api/dashboard/by-category` → Category-wise totals
- `GET /api/dashboard/trend?period=monthly` → 5-month trend data
- `GET /api/dashboard/recent` → Last 10 transactions

### 4. ✅ Access Control Logic

**Location:** `backend/src/middleware/roleGuard.js`

- Role-based middleware enforcement
- Viewer: View-only access
- Analyst: Can create records, view data
- Admin: Full management access
- Implemented via `roleGuard(roles)` middleware

### 5. ✅ Validation and Error Handling

**Location:** `backend/src/modules/records/records.validation.js` & middleware

- Zod schema validation for all inputs
- Proper HTTP status codes
- Meaningful error messages
- Global error handler middleware

### 6. ✅ Data Persistence

**Location:** `backend/prisma/schema.prisma`

- SQLite database via Prisma ORM
- Clean data modeling with relations
- Migration support

### Optional Enhancements (Included)

- ✅ JWT Authentication with refresh support
- ✅ Pagination for record listings
- ✅ Search/Filter support
- ✅ Soft delete functionality
- ✅ API health check endpoint

---

## 🚀 Deployment Instructions

### Part 1: Backend Deployment (Render)

#### Step 1: Prepare Backend for Production

##### Create `.env.production` file in `backend/` directory:

```env
# Database (Render automatically provides PostgreSQL - optional switch from SQLite)
DATABASE_URL="file:./prod.db"

# Or use PostgreSQL on Render:
# DATABASE_URL="postgresql://user:password@host/dbname"

# JWT Configuration
JWT_SECRET="your-very-secure-secret-key-min-32-chars-randomize-this"
JWT_EXPIRES_IN="7d"

# Server Port
PORT=5050

# Allow open registration (only for first user)
ALLOW_OPEN_REGISTER="false"

# CORS
CORS_ORIGIN="https://your-frontend-vercel-url.vercel.app"
```

##### Update `backend/package.json` scripts:

```json
{
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "build": "prisma generate && prisma migrate deploy",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:seed": "node prisma/seed.js"
  }
}
```

##### Create `backend/.env.example` for reference:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-key"
JWT_EXPIRES_IN="7d"
PORT=8000
ALLOW_OPEN_REGISTER="true"
CORS_ORIGIN="http://localhost:5173"
```

#### Step 2: Create Render Web Service for Backend

1. **Visit:** https://render.com
2. **Sign up/Login** with GitHub account
3. **Create New Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Choose the repository

4. **Configure Render Settings:**

| Setting            | Value                                               |
| ------------------ | --------------------------------------------------- |
| **Name**           | finance-dashboard-api                               |
| **Environment**    | Node                                                |
| **Build Command**  | `npm install && npm run build`                      |
| **Start Command**  | `npm start`                                         |
| **Root Directory** | `backend`                                           |
| **Plan**           | Free (or Starter $7/month for more reliable uptime) |

5. **Add Environment Variables (in Render Dashboard):**
   - Click "Environment"
   - Add these variables:
     - `DATABASE_URL`: `file:./prod.db` (or your PostgreSQL URL)
     - `JWT_SECRET`: Generate a strong 32+ character key
     - `JWT_EXPIRES_IN`: `7d`
     - `PORT`: `8000`
     - `ALLOW_OPEN_REGISTER`: `false`
     - `CORS_ORIGIN`: (Leave empty for now, update after frontend is deployed)

6. **Deploy:**
   - Click "Create Web Service"
   - Render will automatically deploy
   - Your backend URL will be: `https://finance-dashboard-api-xxxxx.onrender.com`

7. **Test Backend:**

```bash
# Health check
curl https://your-render-url.onrender.com/api/health

# Should return:
# {"success":true,"data":{"status":"ok"}}
```

---

### Part 2: Frontend Deployment (Vercel)

#### Step 1: Prepare Frontend for Production

##### Update `frontend/src/services/api.js` (if not already done):

```javascript
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://your-render-backend-url.onrender.com/api"
    : "http://localhost:8000/api");

export default API_BASE_URL;
```

##### Create `frontend/.env.production` file:

```env
VITE_API_BASE_URL=https://finance-dashboard-api-xxxxx.onrender.com/api
```

##### Create `frontend/.env.development` file:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

##### Update `frontend/vite.config.js`:

```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});
```

#### Step 2: Deploy Frontend to Vercel

1. **Visit:** https://vercel.com
2. **Sign up/Login** with GitHub account
3. **Import Project:**
   - Click "Add New" → "Project"
   - Select your GitHub repository
   - Click "Import"

4. **Configure Project:**

| Setting              | Value             |
| -------------------- | ----------------- |
| **Project Name**     | finance-dashboard |
| **Framework Preset** | Vite              |
| **Root Directory**   | `frontend`        |
| **Build Command**    | `npm run build`   |
| **Output Directory** | `dist`            |

5. **Add Environment Variables (in Vercel Dashboard):**
   - Go to "Settings" → "Environment Variables"
   - Add: `VITE_API_BASE_URL` = `https://your-render-backend-url.onrender.com/api`

6. **Deploy:**
   - Click "Deploy"
   - Vercel will build and deploy automatically
   - Your frontend URL will be: `https://finance-dashboard-xxxxx.vercel.app`

7. **Test Frontend:**
   - Visit the URL in browser
   - Should load the dashboard
   - Try login with seeded credentials

---

## 🔄 Post-Deployment Configuration

### Step 1: Update Backend CORS

1. Go to Render Dashboard for your backend
2. Go to "Environment" settings
3. Update `CORS_ORIGIN` to your Vercel frontend URL:
   ```
   CORS_ORIGIN=https://finance-dashboard-xxxxx.vercel.app
   ```
4. Redeploy backend (Render will rebuild automatically)

### Step 2: Initialize Database on Render

If using SQLite (first time):

1. Go to Render Web Service for backend
2. Open "Shell" tab
3. Run these commands:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   npm run prisma:seed
   ```

If using PostgreSQL:

1. Create PostgreSQL database on Render
2. Update `DATABASE_URL` in environment variables
3. Run migration commands via Shell

---

## 🧪 Testing Production Deployment

### 1. Test Backend Health

```bash
curl https://your-render-url.onrender.com/api/health
```

### 2. Test Registration (First User Bootstrap)

```bash
curl -X POST https://your-render-url.onrender.com/api/auth/register/open \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin",
    "email": "admin@example.com",
    "password": "SecurePass@123"
  }'
```

### 3. Test Login

```bash
curl -X POST https://your-render-url.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SecurePass@123"
  }'
```

### 4. Test Dashboard API

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-render-url.onrender.com/api/dashboard/summary
```

### 5. Test Frontend

- Visit your Vercel URL
- Login with credentials
- Create records
- View dashboard

---

## 🛠 Troubleshooting

### Backend not responding

- Check Render deployment logs
- Ensure DATABASE_URL is correct
- Verify environment variables are set

### CORS errors

- Update `CORS_ORIGIN` in backend environment
- Ensure frontend URL matches exactly
- Check browser console for error details

### Database errors

- Run migrations: `npm run prisma:migrate`
- Seed database: `npm run prisma:seed`
- Check Prisma schema is correct

### Frontend won't load

- Verify `VITE_API_BASE_URL` in Vercel env vars
- Check network tab for API errors
- Ensure backend is responding

---

## 📊 Monitoring

### Render Dashboard

- View logs in real-time
- Monitor CPU/Memory usage
- Check deployment history
- Set up error notifications

### Vercel Dashboard

- Monitor build logs
- Check analytics
- View deployment history
- Edge function monitoring

---

## 🔐 Security Recommendations

1. **Production JWT_SECRET:**

   ```bash
   # Generate strong secret
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Database:**
   - Consider moving from SQLite to PostgreSQL for production
   - Enable automatic backups
   - Use strong passwords

3. **CORS:**
   - Only allow your frontend domain
   - Don't use wildcard `*` in production

4. **Rate Limiting:**
   - Already configured via `express-rate-limit`
   - Adjust limits based on usage

5. **Environment Variables:**
   - Never commit `.env` files
   - Keep secrets in Render/Vercel dashboard only

---

## 📈 Scaling Considerations

### For More Users:

1. **Database:** Upgrade to PostgreSQL (Render offers managed PostgreSQL)
2. **Backend:** Upgrade Render plan from Free to Starter/Standard
3. **Frontend:** Vercel auto-scales (free tier handles significant traffic)
4. **Caching:** Add Redis for dashboard aggregations
5. **CDN:** Vercel already includes Edge caching

---

## 🎯 Project Summary

**Backend Status:** ✅ Production-Ready

- All requirements met
- Clean architecture
- Proper error handling
- Role-based access control

**Frontend Status:** ✅ Production-Ready

- Responsive design (recently updated)
- All features functional
- Proper API integration

**Deployment Options:**

- Backend: Render (Node.js)
- Frontend: Vercel (React/Vite)
- Database: SQLite (local) or PostgreSQL (managed)

---

## 📞 Support

- **Render Docs:** https://render.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **Express Docs:** https://expressjs.com

---

**Deployment Completed! Your Finance Dashboard is ready for production.** 🚀
