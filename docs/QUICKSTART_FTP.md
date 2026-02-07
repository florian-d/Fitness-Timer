# Quick Start: FTP Deployment

## Required GitHub Secrets

Before using the FTP deployment, add these secrets in GitHub Settings → Secrets and variables → Actions:

1. **FTP_SERVER** - Your FTP server hostname (e.g., `ftp.example.com`)
2. **FTP_USERNAME** - Your FTP username
3. **FTP_PASSWORD** - Your FTP password
4. **FTP_SERVER_DIR** - Target directory on server (e.g., `/public_html/`)

## How to Deploy

### Option 1: Create a Release Tag
```bash
git tag v1.0.0
git push origin v1.0.0
```

### Option 2: Create GitHub Release
Go to Releases → Create new release → Publish

### Option 3: Manual Trigger
Actions → Release and Deploy to FTP → Run workflow

## Full Documentation

See [docs/FTP_DEPLOYMENT.md](FTP_DEPLOYMENT.md) for detailed setup instructions, troubleshooting, and advanced configuration.
