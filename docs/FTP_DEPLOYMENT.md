# FTP Deployment Setup Guide

This guide explains how to configure the automated FTP deployment pipeline for the Fitness Timer app.

## Overview

The release pipeline automatically builds and deploys the app to your hosting provider via FTP when:
- A new Git tag is pushed (e.g., `v1.0.0`)
- A GitHub release is published
- The workflow is manually triggered

## Prerequisites

- GitHub repository access with permissions to add secrets
- FTP credentials from your hosting provider
- FTP server address and deployment directory path

## Setup Instructions

### 1. Obtain FTP Credentials

Get the following information from your hosting provider:
- **FTP Server**: The hostname or IP address (e.g., `ftp.yourhost.com`)
- **FTP Username**: Your FTP account username
- **FTP Password**: Your FTP account password
- **Server Directory**: The target directory path (e.g., `/public_html/` or `/www/`)

### 2. Configure GitHub Secrets

Add your FTP credentials as GitHub repository secrets:

1. Navigate to your repository on GitHub
2. Go to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add the following secrets:

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `FTP_SERVER` | FTP server hostname or IP | `ftp.example.com` |
| `FTP_USERNAME` | FTP account username | `user@example.com` |
| `FTP_PASSWORD` | FTP account password | `your-secure-password` |
| `FTP_SERVER_DIR` | Target directory on server | `/public_html/` or `/` |

**Important Security Notes:**
- Never commit FTP credentials directly to the repository
- Use strong, unique passwords for FTP access
- Consider using SFTP if your hosting provider supports it
- Regularly rotate your FTP passwords

### 3. Test the Deployment

#### Option A: Create a Git Tag
```bash
# Create and push a version tag
git tag v1.0.0
git push origin v1.0.0
```

#### Option B: Create a GitHub Release
1. Go to your repository on GitHub
2. Click **Releases** → **Create a new release**
3. Choose a tag (or create a new one like `v1.0.0`)
4. Add release notes
5. Click **Publish release**

#### Option C: Manual Trigger
1. Go to **Actions** tab in your repository
2. Select **Release and Deploy to FTP** workflow
3. Click **Run workflow**
4. Select the branch and click **Run workflow**

### 4. Monitor Deployment

1. Navigate to the **Actions** tab in your repository
2. Find the running workflow
3. Click on it to view progress and logs
4. Verify successful deployment in the logs
5. Test your app at the hosting provider's URL

## Workflow Details

### Build Process
1. Checks out the code
2. Sets up Node.js 20.x
3. Installs dependencies with `npm ci`
4. Runs tests with coverage
5. Builds the production app with `npm run build`

### Deployment Process
- Deploys the contents of the `build/` directory
- Uploads only changed files (incremental deployment)
- Excludes `.git*` and `node_modules` directories
- Preserves existing files not in the build (safe mode)

## Troubleshooting

### Connection Issues
- Verify FTP server address is correct (no `ftp://` prefix needed)
- Check that your hosting provider allows FTP connections
- Ensure firewall/security rules allow GitHub Actions IPs

### Authentication Failures
- Double-check FTP username and password in GitHub Secrets
- Verify credentials work by testing with an FTP client (e.g., FileZilla)
- Check if your hosting provider requires special authentication

### Permission Errors
- Ensure the FTP user has write permissions to the target directory
- Verify `FTP_SERVER_DIR` path is correct and writable
- Check directory structure on your hosting provider

### Build Failures
- Review the workflow logs in the Actions tab
- Ensure all tests pass locally with `npm test`
- Verify the build succeeds locally with `npm run build`

## Advanced Configuration

### Custom Deployment Paths
To deploy to a subdirectory or custom path, update the `FTP_SERVER_DIR` secret:
- Root directory: `/`
- Public HTML: `/public_html/`
- Subdirectory: `/public_html/fitness-timer/`
- HTTPDOCS: `/httpdocs/`

### Excluding Files
To exclude specific files from deployment, edit `.github/workflows/release-ftp.yml`:
```yaml
exclude: |
  **/.git*
  **/.git*/**
  **/node_modules/**
  **/*.map
  **/test/**
```

### Using SFTP
If your hosting provider supports SFTP (recommended for security), you can modify the workflow to use SFTP instead:
1. Change the FTP action to an SFTP action
2. Add SSH key configuration
3. Update the secrets accordingly

## Deployment Best Practices

1. **Test Locally First**: Always build and test locally before creating a release
2. **Use Semantic Versioning**: Follow semver for tags (e.g., `v1.0.0`, `v1.1.0`, `v2.0.0`)
3. **Write Release Notes**: Document changes in GitHub releases
4. **Monitor First Deployment**: Watch the first deployment closely to catch any issues
5. **Backup**: Keep backups of your hosting provider's files before major deployments
6. **Staging Environment**: Consider setting up a staging server for testing

## Support

If you encounter issues:
1. Check the workflow logs in the GitHub Actions tab
2. Review the FTP server logs from your hosting provider
3. Test FTP credentials with a local FTP client
4. Consult your hosting provider's documentation for FTP setup

## Related Files

- Workflow file: `.github/workflows/release-ftp.yml`
- Build configuration: `package.json`
- Main README: `README.md`
