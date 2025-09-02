# macOS Notarization Setup Guide

This guide explains how to set up code signing and notarization for macOS builds to enable auto-updates.

## Prerequisites

1. An Apple Developer account ($99/year)
2. A valid Developer ID Application certificate
3. An App Store Connect API key

## Steps

### 1. Create Developer ID Application Certificate

1. Log in to [Apple Developer](https://developer.apple.com)
2. Go to Certificates, Identifiers & Profiles
3. Click the + button to create a new certificate
4. Select "Developer ID Application" and follow the prompts
5. Download and install the certificate on your Mac

### 2. Create App Store Connect API Key

1. Log in to [App Store Connect](https://appstoreconnect.apple.com)
2. Go to Users and Access > Integrations > Keys
3. Click the + button to create a new key
4. Give it a name and select "Admin" role
5. Download the .p8 key file (you can only download it once!)
6. Note down the Key ID and Issuer ID

### 3. Export Your Certificate

You need to export your Developer ID certificate so GitHub Actions can use it:

1. On your Mac, run the helper script:

   ```bash
   bash scripts/export-certificate.sh
   ```

2. Follow the script's instructions to export your certificate:

   ```bash
   # Export the certificate (replace YOUR_PASSWORD with a strong password)
   security export -t identities -f pkcs12 -k ~/Library/Keychains/login.keychain-db \
     -P YOUR_PASSWORD -o ~/Desktop/Certificates.p12

   # Convert to base64 and copy to clipboard
   base64 -i ~/Desktop/Certificates.p12 | pbcopy

   # IMPORTANT: Delete the certificate file after copying
   rm ~/Desktop/Certificates.p12
   ```

3. Note down:
   - The base64-encoded certificate (now in your clipboard)
   - The password you used when exporting
   - The full certificate name (e.g., "Developer ID Application: Your Name (TEAMID)")

### 4. Set GitHub Repository Secrets

In your GitHub repository, go to Settings > Secrets and variables > Actions, and add:

- `APPLE_CERTIFICATE`: The base64-encoded certificate from step 3 (from clipboard)
- `APPLE_CERTIFICATE_PASSWORD`: The password you used when exporting the certificate
- `APPLE_IDENTITY`: The full certificate name from step 3 (e.g., "Developer ID Application: Your Name (TEAMID)")
- `APPLE_API_KEY`: The contents of the .p8 file from step 2
- `APPLE_API_KEY_ID`: The Key ID from step 2
- `APPLE_API_ISSUER`: The Issuer ID from step 2

## How It Works

1. When you create a new release with a tag starting with `v` (e.g., `v1.0.6`), the GitHub Actions workflow will:
   - Build the application for all platforms
   - Sign the macOS build with your Developer ID certificate
   - Notarize the macOS build with Apple
   - Upload the signed and notarized builds to the GitHub release

2. The auto-updater in the app will:
   - Check for updates from update.electronjs.org
   - Download and install updates automatically (with user confirmation)
   - Only work with properly signed builds on macOS

## Testing

To test auto-updates:

1. Install a released version of your app
2. Create a new release with a higher version number
3. Wait for the build to complete
4. Launch the installed app - it should detect and download the update

## Troubleshooting

### Certificate Not Found in GitHub Actions

- Ensure you've added both `APPLE_CERTIFICATE` and `APPLE_CERTIFICATE_PASSWORD` secrets
- Verify the certificate was exported correctly with: `security find-identity -v -p codesigning`
- Check the debug output in GitHub Actions to see if the certificate is being imported

### Certificate Not Found Locally

- Ensure the certificate is installed in your Keychain
- Use the exact name as shown in `security find-identity`

### Notarization Fails

- Check that your API key has Admin role
- Verify the key file path is correct
- Ensure the entitlements.plist file is present

### Updates Not Working

- Check that your app is properly signed: `codesign -dv --verbose=4 /path/to/app`
- Verify the update server URL in the app logs
- Ensure GitHub releases are public (not drafts)
