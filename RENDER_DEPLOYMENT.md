# Render Deployment Guide

## Quick Deploy

### Option 1: Using render.yaml (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for Render deployment"
   git push origin main
   ```

2. **Connect to Render**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml` and create both services

3. **Set Environment Variables**
   
   For **chat-api** (Backend):
   ```
   MONGODB_URI=your_mongodb_atlas_uri
   JWT_SECRET=your_secure_jwt_secret_min_32_chars
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   RESEND_API_KEY=your_resend_api_key
   CLIENT_URL=https://your-frontend-url.onrender.com
   ```
   
   For **chat-frontend** (Frontend):
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   ```

### Option 2: Manual Deployment

#### Deploy Backend

1. **Create Web Service**
   - New → Web Service
   - Connect your repository
   - Configure:
     - **Name:** chat-api
     - **Region:** Oregon (or closest to you)
     - **Branch:** main
     - **Root Directory:** server
     - **Environment:** Node
     - **Build Command:** `npm install`
     - **Start Command:** `node server.js`
     - **Plan:** Free

2. **Add Environment Variables** (same as above)

#### Deploy Frontend

1. **Create Static Site**
   - New → Static Site
   - Connect your repository
   - Configure:
     - **Name:** chat-frontend
     - **Region:** Oregon
     - **Branch:** main
     - **Root Directory:** client
     - **Build Command:** `npm install && npm run build`
     - **Publish Directory:** dist
     - **Plan:** Free

2. **Add Environment Variables** (same as above)

3. **Add Rewrite Rule**
   - In Static Site settings → Redirects/Rewrites
   - Add rule: `/*` → `/index.html` (for React Router)

## MongoDB Setup

### Using MongoDB Atlas (Recommended)

1. **Create Free Cluster**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create free M0 cluster
   - Create database user
   - Whitelist all IPs: `0.0.0.0/0` (for Render)

2. **Get Connection String**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/chatapp?retryWrites=true&w=majority
   ```

3. **Add to Render Environment Variables**
   - Set `MONGODB_URI` in backend service

## Google OAuth Setup

1. **Update Authorized Origins**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Add your Render URLs:
     - `https://your-frontend-url.onrender.com`
     - `https://your-backend-url.onrender.com`

2. **Update Redirect URIs**
   - Add: `https://your-frontend-url.onrender.com`

## Post-Deployment

### Update Environment Variables

After both services are deployed, update the URLs:

**Backend (`CLIENT_URL`):**
```
CLIENT_URL=https://your-frontend-url.onrender.com
```

**Frontend (`VITE_API_URL`):**
```
VITE_API_URL=https://your-backend-url.onrender.com
```

### Verify Deployment

1. **Check Backend Health**
   ```
   https://your-backend-url.onrender.com/health
   ```
   Should return: `{"status":"ok",...}`

2. **Check Frontend**
   ```
   https://your-frontend-url.onrender.com
   ```
   Should load the landing page

3. **Test Features**
   - Sign up with email
   - Login with Google
   - Send messages
   - Add friends

## Important Notes

### Free Tier Limitations

- **Backend:** Spins down after 15 minutes of inactivity
- **First request:** May take 30-60 seconds (cold start)
- **Database:** MongoDB Atlas free tier has 512MB storage
- **Build time:** Limited to 10 minutes

### Performance Tips

1. **Keep Services Warm**
   - Use a service like [UptimeRobot](https://uptimerobot.com/) to ping your backend every 14 minutes

2. **Optimize Build**
   - Frontend build is cached by Render
   - Backend restarts on every deploy

3. **Monitor Logs**
   - Check Render dashboard for errors
   - View real-time logs for debugging

## Troubleshooting

### Backend Won't Start

**Check:**
- All environment variables are set
- MongoDB connection string is correct
- Port is set to `10000` or use `process.env.PORT`

**Solution:**
```bash
# In server/server.js, ensure:
const PORT = process.env.PORT || 3000;
```

### Frontend Shows 404 on Refresh

**Check:**
- Rewrite rule is configured: `/*` → `/index.html`

**Solution:**
- Add in Render Static Site → Redirects/Rewrites

### CORS Errors

**Check:**
- `CLIENT_URL` in backend matches frontend URL exactly
- No trailing slashes

**Solution:**
```javascript
// In server/server.js
const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://your-frontend-url.onrender.com'
];
```

### Google OAuth Not Working

**Check:**
- Authorized origins include Render URLs
- Redirect URIs include Render URLs
- `GOOGLE_CLIENT_ID` matches in both frontend and backend

### WebSocket Connection Failed

**Check:**
- Backend URL is correct
- Using `https://` not `http://`
- Socket.IO is configured for production

**Solution:**
```javascript
// In client/src/services/socket.js
const socket = io(import.meta.env.VITE_API_URL, {
  transports: ['websocket', 'polling']
});
```

### Database Connection Failed

**Check:**
- MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Connection string is correct
- Database user has read/write permissions

## Updating Your App

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Render will automatically:
# 1. Detect the push
# 2. Rebuild the services
# 3. Deploy the new version
```

## Custom Domain (Optional)

1. **Add Custom Domain in Render**
   - Go to service settings
   - Add custom domain
   - Update DNS records

2. **Update Environment Variables**
   - Update `CLIENT_URL` and `VITE_API_URL` with custom domain

3. **Update Google OAuth**
   - Add custom domain to authorized origins

## Cost Optimization

**Free Tier:**
- Backend: Free (with cold starts)
- Frontend: Free
- MongoDB: Free (512MB)
- Total: $0/month

**Paid Tier ($7/month per service):**
- No cold starts
- Always-on instances
- Better performance
- Custom domains included

## Security Checklist

- [ ] Strong JWT_SECRET (32+ characters)
- [ ] MongoDB user has limited permissions
- [ ] Environment variables are not in code
- [ ] HTTPS enabled (automatic on Render)
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Google OAuth restricted to your domains

## Support

- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com/)
- [MongoDB Atlas Support](https://www.mongodb.com/cloud/atlas/support)

---

**Deployment Time:** ~10-15 minutes
**First Deploy:** May take longer due to dependency installation
