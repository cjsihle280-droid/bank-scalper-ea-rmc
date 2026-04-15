# Web Deployment Guide - Vercel (Recommended)

## Why Vercel?
- **Fastest**: Deploys in seconds
- **Free tier**: Perfect for starting out
- **Auto-updates**: Push to GitHub = automatic deployment
- **Global CDN**: Fast everywhere
- **No servers to manage**: Completely serverless

## Step 1: Connect GitHub

```bash
# Push your code to GitHub
git remote add origin https://github.com/your-username/bank-scalper-ea.git
git push -u origin main
```

## Step 2: Deploy with Vercel

### Option A: Web Dashboard (Easiest)
1. Go to https://vercel.com
2. Click "Import Project"
3. Connect GitHub account
4. Select your repository
5. Click "Deploy"

✅ Done! Your app is live at `your-project.vercel.app`

### Option B: CLI (Command Line)
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

## Step 3: Configure Custom Domain

1. In Vercel Dashboard → Settings → Domains
2. Enter your custom domain: `bankscalper.com`
3. Add CNAME record to your domain registrar

```
CNAME: cname.vercel-dns.com
```

## Step 4: Environment Variables

In Vercel Dashboard:
1. Go to Settings → Environment Variables
2. Add production variables:

```
VITE_API_URL=https://api.bankscalper.com
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_KEY=your_supabase_key
```

## Auto-Deployment

Every time you push to GitHub:
```bash
git add .
git commit -m "Update app"
git push origin main
```

✅ Vercel automatically builds and deploys!

## Monitoring

- **View Logs**: `vercel logs`
- **View Analytics**: Vercel Dashboard → Analytics
- **Check Build Status**: Vercel Dashboard → Recent Deployments

---

# Web Deployment Guide - Netlify

## Quick Deploy

```bash
npm i -g netlify-cli
netlify login
netlify deploy --prod --dir=dist
```

## Connect Git Repository

1. Go to https://netlify.com
2. Click "New site from Git"
3. Connect GitHub
4. Select your repo
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click "Deploy"

## Environment Variables

Settings → Build & Deploy → Environment:
```
VITE_API_URL=https://api.bankscalper.com
VITE_SUPABASE_URL=your_supabase_url
```

---

# Web Deployment Guide - AWS (Self-Hosted)

## Step 1: Build App
```bash
npm run build
# Creates dist/ folder
```

## Step 2: Upload to S3
```bash
# Create S3 bucket
aws s3 mb s3://bankscalper-ea --region us-east-1

# Upload app
aws s3 sync dist/ s3://bankscalper-ea/ --delete

# Enable static site
aws s3 website s3://bankscalper-ea/ \
  --index-document index.html \
  --error-document index.html
```

## Step 3: Enable CloudFront CDN
```bash
# Create CloudFront distribution
aws cloudfront create-distribution --distribution-config file://config.json
```

## Step 4: Add Custom Domain
Update Route 53 to point to CloudFront domain.

---

# Web Deployment Guide - Docker (Self-Hosted)

## Create Dockerfile

```dockerfile
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:latest
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Deploy with Docker

```bash
# Build image
docker build -t bankscalper-ea .

# Run container
docker run -d -p 80:80 bankscalper-ea

# Or with Docker Compose
docker-compose up -d
```

---

# Web Deployment Comparison

| Platform | Cost | Setup Time | Auto-Deploy | Custom Domain |
|----------|------|-----------|-------------|--------------|
| **Vercel** | Free | 2 min | ✅ Yes | ✅ Yes |
| **Netlify** | Free | 2 min | ✅ Yes | ✅ Yes |
| **GitHub Pages** | Free | 5 min | ✅ Yes | ✅ Yes |
| **AWS** | Pay-as-you-go | 30 min | ❌ Manual | ✅ Yes |
| **Docker** | Self-hosted | 20 min | ❌ Manual | ✅ Yes |
| **Firebase** | Free tier | 5 min | ✅ Yes | ✅ Yes |

---

## Post-Deployment Checklist

- [ ] App loads correctly
- [ ] All API endpoints working
- [ ] Notifications enabled
- [ ] License verification working
- [ ] Charts rendering
- [ ] Auto-analysis running
- [ ] Performance acceptable
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Analytics/monitoring set up

