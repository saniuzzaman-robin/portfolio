# Deployment Guide

This document provides step-by-step instructions for deploying the portfolio to production.

## Prerequisites

- Node.js 18+ installed
- pnpm 9.0.0+ installed
- Git repository initialized and pushed to GitHub

## Available Deployment Scripts

```bash
# Run pre-build checks (linting + type-checking)
pnpm pre-build

# Build production bundle with pre-build checks
pnpm build:prod

# Start the production server (requires .next build directory)
pnpm start:prod

# Analyze bundle size
ANALYZE=true pnpm build
```

## Deployment Platforms

### 1. Vercel (Recommended for Next.js)

**Automatic Deployment:**

1. Connect repository: https://github.com/saniuzzaman-robin/portfolio
2. Vercel automatically detects Next.js and uses `vercel.json` configuration
3. Set environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SITE_URL`: Your production domain

**Manual Deployment:**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

**Production Domain Setup:**

- Configure custom domain in Vercel dashboard
- Enable automatic preview deployments for PRs
- Set production branch to `main`

### 2. Netlify

**Manual Deployment:**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build
pnpm build:prod

# Deploy
netlify deploy --prod --dir=.next
```

**netlify.toml Configuration:**

Create `netlify.toml` in root:

```toml
[build]
  command = "pnpm build:prod"
  publish = ".next"

[functions]
  node_bundler = "esbuild"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 3. Self-Hosted (VPS/Docker)

**Build and Run:**

```bash
# Install dependencies
pnpm install

# Build for production
pnpm build:prod

# Start production server
pnpm start:prod
```

**Docker Deployment:**

Create `Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY pnpm-lock.yaml package.json ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build
RUN pnpm build:prod

EXPOSE 3000

CMD ["pnpm", "start:prod"]
```

Build and run:

```bash
docker build -t portfolio .
docker run -p 3000:3000 portfolio
```

## Environment Variables

Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_SITE_NAME="Your Name - Portfolio"
```

## Pre-Deployment Checklist

- [ ] All tests passing (if applicable)
- [ ] ESLint checks passing: `pnpm lint`
- [ ] TypeScript type-checking passing: `pnpm type-check`
- [ ] Production build successful: `pnpm build:prod`
- [ ] Environment variables configured
- [ ] Git changes committed and pushed
- [ ] .env.local is in .gitignore (not committed)

## Post-Deployment Verification

1. Visit production URL
2. Check home page loads correctly
3. Verify all pages accessible
4. Test navigation menu
5. Check responsive design on mobile
6. Verify SEO metadata in page source
7. Test social media links
8. Monitor build logs for any warnings

## Performance Monitoring

### Bundle Analysis

```bash
ANALYZE=true pnpm build
```

### Core Web Vitals

Monitor in production:

- Vercel Analytics Dashboard
- Google Search Console
- PageSpeed Insights

## Rollback

If issues occur:

```bash
# Revert to previous commit
git revert <commit-hash>
git push origin main

# Vercel redeploys automatically
# Or manually trigger from Vercel dashboard
```

## Troubleshooting

**Build fails locally but succeeds in deployment:**

- Check Node.js version: `node --version`
- Clear cache: `rm -rf node_modules .next && pnpm install`
- Verify environment variables are set

**Production site shows outdated content:**

- Clear Vercel cache in dashboard
- Hard refresh browser (Cmd+Shift+R or Ctrl+Shift+F5)

**Performance issues:**

- Run bundle analysis
- Check Core Web Vitals
- Monitor server response times

## Continuous Integration

All commits trigger:

1. Pre-commit hook: ESLint + Prettier
2. Pre-push hook: Full lint + production build
3. Post-push: Deployment service builds and deploys

See `.husky/` directory for Git hook configurations.
