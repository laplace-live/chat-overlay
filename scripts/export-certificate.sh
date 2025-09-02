#!/bin/bash

# Script to export Developer ID certificate for GitHub Actions
# This helps prepare your certificate for use in CI/CD

echo "=== macOS Certificate Export Helper ==="
echo ""
echo "This script will help you export your Developer ID certificate for use in GitHub Actions."
echo ""

# List available Developer ID certificates
echo "Available Developer ID certificates:"
security find-identity -v -p codesigning | grep "Developer ID Application"

echo ""
echo "To export your certificate, run the following command:"
echo ""
echo "security export -t identities -f pkcs12 -k ~/Library/Keychains/login.keychain-db -P YOUR_PASSWORD -o ~/Desktop/Certificates.p12"
echo ""
echo "Replace YOUR_PASSWORD with a strong password (you'll add this as APPLE_CERTIFICATE_PASSWORD in GitHub secrets)"
echo ""
echo "Then encode the certificate file to base64:"
echo "base64 -i ~/Desktop/Certificates.p12 | pbcopy"
echo ""
echo "This copies the base64-encoded certificate to your clipboard."
echo ""
echo "Add the following secrets to your GitHub repository:"
echo "  - APPLE_CERTIFICATE: The base64-encoded certificate (from clipboard)"
echo "  - APPLE_CERTIFICATE_PASSWORD: The password you used when exporting"
echo ""
echo "IMPORTANT: Delete the Certificates.p12 file from your Desktop after adding to GitHub secrets!"
