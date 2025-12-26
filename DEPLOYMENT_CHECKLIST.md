# Deployment Checklist

## ✅ Pre-Deployment Verification

### 1. Environment Variables (Production)

Ensure all required environment variables are set on Render:

```env
# Server
NODE_ENV=production
PORT=4000
API_VERSION=v1

# Supabase (✅ Already configured)
SUPABASE_URL=https://yyatwsmkwenmawkocmuo.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Polymarket
POLYMARKET_API_URL=https://gamma-api.polymarket.com
POLYMARKET_CLOB_API_URL=https://clob.polymarket.com
POLYMARKET_CHAIN_ID=137

# Polymarket Builder Credentials (✅ Already configured)
POLYMARKET_BUILDER_API_KEY=019b0006-4209-7adf-bcd2-3ffa76b7979b
POLYMARKET_BUILDER_SECRET=oUUUfnRb5z3jBAJ98dRhjNSkU3ceP0RYQ4BXoFuGrT4=
POLYMARKET_BUILDER_PASSPHRASE=ce46ed53b4dea23e2b3d7073142f20391a49365db8e074ca9449508c26fa17a6

# CORS (Update with your frontend domain)
ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://hollymarket.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 2. Render Configuration

Your `render.yaml` is configured with:
- ✅ Build command: `yarn install --frozen-lockfile`
- ✅ Start command: `yarn start`
- ✅ Postinstall script: Automatically runs `yarn build`

### 3. Health Checks

Test these endpoints after deployment:

```bash
# 1. Health check
curl https://your-api.render.com/api/v1/health

# 2. Builder info
curl https://your-api.render.com/api/v1/polymarket/builder-info

# 3. Remote signing (test)
curl -X POST https://your-api.render.com/api/v1/polymarket/sign \
  -H 'Content-Type: application/json' \
  -d '{"method":"GET","path":"/orderbook","body":""}'
```

---

## 🚀 Deployment Steps

### Option 1: Deploy via Render Dashboard

1. **Connect GitHub Repository**
   - Go to Render Dashboard
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**
   - Name: `hollymarket-api`
   - Environment: `Node`
   - Build Command: `yarn install --frozen-lockfile`
   - Start Command: `yarn start`

3. **Add Environment Variables**
   - Copy all variables from `.env`
   - Update `ALLOWED_ORIGINS` with your frontend URL

4. **Deploy**
   - Click "Create Web Service"
   - Wait for build to complete

### Option 2: Deploy via render.yaml (Automatic)

1. **Commit render.yaml**
   ```bash
   git add render.yaml
   git commit -m "Add Render configuration"
   git push
   ```

2. **Connect to Render**
   - Render will detect `render.yaml`
   - Automatically configure service
   - Deploy from main branch

---

## 🧪 Post-Deployment Testing

### 1. Test All Endpoints

```bash
export API_URL=https://your-api.render.com/api/v1

# Health
curl $API_URL/health

# Markets
curl "$API_URL/markets/events?limit=5"

# Tags
curl $API_URL/markets/tags

# Comments
curl "$API_URL/comments?limit=5"

# Builder Info
curl $API_URL/polymarket/builder-info

# Remote Signing
curl -X POST $API_URL/polymarket/sign \
  -H 'Content-Type: application/json' \
  -d '{"method":"POST","path":"/order","body":""}'
```

### 2. Test Authentication Flow

```bash
# Send OTP
curl -X POST $API_URL/auth/signin \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com"}'

# Check email for OTP, then verify
curl -X POST $API_URL/auth/verify \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","token":"123456"}'
```

### 3. Monitor Logs

```bash
# On Render Dashboard:
# - Go to your service
# - Click "Logs" tab
# - Watch for startup messages

# Expected logs:
# ✅ "Builder signing service initialized"
# ✅ "Express app configured successfully"
# ✅ "HollyMarket API Server"
# ✅ "Ready to accept requests!"
```

---

## 📊 Performance Monitoring

### Metrics to Watch

1. **Response Times**
   - Health endpoint: < 100ms
   - Markets API: < 500ms
   - CLOB API: < 1000ms

2. **Error Rates**
   - Target: < 1% error rate
   - Monitor 4xx (client errors) vs 5xx (server errors)

3. **Memory Usage**
   - Should stay < 512MB for basic instance
   - Upgrade if consistently near limits

### Set Up Alerts

On Render Dashboard:
1. Go to service settings
2. Enable "Deploy Notifications"
3. Set up Slack/Discord webhooks (optional)

---

## 🔒 Security Checklist

- [x] Builder credentials stored in environment variables (not in code)
- [x] HTTPS enabled (automatic on Render)
- [x] CORS configured with allowed origins
- [x] Rate limiting enabled
- [x] Input validation with Zod
- [x] Helmet security headers
- [x] No secrets in git repository
- [x] Environment variables validated on startup

---

## 🔄 CI/CD Setup

### Automatic Deployments

Render automatically deploys when you push to `main` branch:

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

### Manual Deployments

On Render Dashboard:
1. Go to your service
2. Click "Manual Deploy"
3. Select branch (usually `main`)
4. Click "Deploy"

---

## 🐛 Troubleshooting

### Issue: Build Fails

**Symptom:** "Cannot find module '/opt/render/project/src/dist/server.js'"

**Solution:** 
- ✅ Fixed with `postinstall` script in package.json
- Ensures `yarn build` runs automatically

### Issue: Environment Variables Missing

**Symptom:** "Missing or invalid environment variables"

**Solution:**
1. Check Render Dashboard → Environment
2. Ensure all required vars are set
3. Redeploy after adding variables

### Issue: CORS Errors

**Symptom:** Frontend shows "CORS policy blocked"

**Solution:**
1. Update `ALLOWED_ORIGINS` on Render
2. Include your frontend domain
3. Redeploy

### Issue: Builder Signature Fails

**Symptom:** "Failed to generate signature"

**Solution:**
1. Verify builder credentials are correct
2. Check `/polymarket/builder-info` endpoint
3. Ensure secret is base64 encoded

---

## 📱 Frontend Integration

After backend is deployed, provide your frontend developer with:

1. **API Base URL**
   ```
   https://your-api.render.com/api/v1
   ```

2. **Remote Signing URL**
   ```
   https://your-api.render.com/api/v1/polymarket/sign
   ```

3. **Documentation**
   - [FRONTEND_REQUIREMENTS.md](FRONTEND_REQUIREMENTS.md)
   - [POLYMARKET_CLOB_INTEGRATION.md](POLYMARKET_CLOB_INTEGRATION.md)

---

## ✅ Deployment Complete!

Your HollyMarket API is now live and ready to:
- ✅ Authenticate users with Supabase
- ✅ Fetch Polymarket events and markets
- ✅ Display community comments
- ✅ Enable trading with builder attribution
- ✅ Sign CLOB requests remotely

**Next:** Implement frontend integration using the guides provided.

---

## 📞 Support

- **Render Docs:** https://render.com/docs
- **Polymarket Docs:** https://docs.polymarket.com
- **Your Implementation Guide:** See POLYMARKET_CLOB_INTEGRATION.md
