# Deployment Guide - Cloudflare Pages

This guide explains how to deploy the Wallet Mnemonic Generator to Cloudflare Pages.

## Prerequisites

- A Cloudflare account (free tier works fine)
- Wrangler CLI installed (already in devDependencies)

## Deployment Steps

### First Time Setup

1. **Login to Cloudflare**
   ```bash
   pnpm wrangler login
   ```
   This will open your browser to authenticate with Cloudflare.

2. **Deploy the Application**
   ```bash
   pnpm deploy
   ```
   
   This command will:
   - Build the web application (`pnpm build:web`)
   - Deploy the `dist-web` folder to Cloudflare Pages
   - Create a project named `wallet-mnemonic-generator`

3. **First Deployment**
   On first run, Wrangler will ask you to confirm the project creation. Just follow the prompts.

### Subsequent Deployments

After the first deployment, just run:
```bash
pnpm deploy
```

## Access Your Deployed App

After deployment, Wrangler will provide you with:
- Production URL: `https://wallet-mnemonic-generator.pages.dev`
- Deployment URL: A unique URL for this specific deployment

## Custom Domain (Optional)

To add a custom domain:

1. Go to your [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Pages** → **wallet-mnemonic-generator** → **Custom domains**
3. Click **Set up a custom domain**
4. Follow the instructions to add your domain

## Environment & Security Notes

- The app runs 100% in the browser (client-side only)
- No backend or API keys needed
- All crypto operations happen locally
- Perfect for Cloudflare Pages static hosting

## Alternative: Git-based Deployment

If you prefer automatic deployments:

1. Push your code to GitHub/GitLab
2. Go to [Cloudflare Pages Dashboard](https://dash.cloudflare.com/?to=/:account/pages)
3. Click **Create a project** → **Connect to Git**
4. Select your repository
5. Configure build settings:
   - **Build command**: `pnpm build:web`
   - **Build output directory**: `dist-web`
   - **Framework preset**: Vite
6. Click **Save and Deploy**

Every push to your main branch will trigger an automatic deployment.

## Troubleshooting

### Authentication Issues
If `wrangler login` fails, try:
```bash
pnpm wrangler logout
pnpm wrangler login
```

### Build Errors
Make sure the build works locally first:
```bash
pnpm build:web
```

### Project Already Exists
If the project name is taken, edit `package.json` and change the `--project-name` in the deploy script.
