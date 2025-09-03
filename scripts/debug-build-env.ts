#!/usr/bin/env tsx

/**
 * Debug script to check build environment for macOS notarization issues
 */

import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

const isDev = process.env.NODE_ENV === 'development'
const environment = isDev ? 'dev' : 'prod'

console.log('=== Build Environment Debug Information ===\n')

// 1. System Information
console.log('1. System Information:')
console.log(`   Platform: ${os.platform()}`)
console.log(`   Environment: ${environment}`)
console.log(`   Architecture: ${os.arch()}`)
console.log(`   Node Version: ${process.version}`)
console.log(`   Current Directory: ${process.cwd()}`)
console.log('')

// 2. Environment Variables
console.log('2. Apple-related Environment Variables:')
const appleEnvVars = [
  'APPLE_IDENTITY',
  'APPLE_API_KEY',
  'APPLE_API_KEY_ID',
  'APPLE_API_ISSUER',
  'APPLE_ID',
  'APPLE_PASSWORD',
  'CSC_LINK',
  'CSC_KEY_PASSWORD',
]

appleEnvVars.forEach(envVar => {
  const value = process.env[envVar]
  if (value) {
    // Mask sensitive values
    const maskedValue = value.length > 8 ? `${value.substring(0, 4)}...${value.substring(value.length - 4)}` : '[SET]'
    console.log(`   ${envVar}: ${maskedValue}`)
  } else {
    console.log(`   ${envVar}: [NOT SET]`)
  }
})
console.log('')

// 3. Check for API Key file
console.log('3. Apple API Key File:')
if (process.env.APPLE_API_KEY_ID) {
  const keyPath = path.join(os.homedir(), 'private_keys', `AuthKey_${process.env.APPLE_API_KEY_ID}.p8`)
  console.log(`   Expected path: ${keyPath}`)
  console.log(`   File exists: ${fs.existsSync(keyPath)}`)
  if (fs.existsSync(keyPath)) {
    const stats = fs.statSync(keyPath)
    console.log(`   File size: ${stats.size} bytes`)
    console.log(`   File permissions: ${stats.mode.toString(8)}`)
  }
} else {
  console.log('   No API key ID provided')
}
console.log('')

// 4. macOS Specific Checks
if (os.platform() === 'darwin') {
  console.log('4. macOS Certificate Information:')

  try {
    // List all code signing identities
    console.log('   Available Code Signing Identities:')
    const identities = execSync('security find-identity -v -p codesigning', { encoding: 'utf8' })
    const lines = identities.split('\n').filter(line => line.includes(')'))
    lines.forEach(line => {
      // Mask the certificate hash but show the name
      const match = line.match(/\s+\d+\)\s+([A-F0-9]+)\s+"(.+)"/)
      if (match) {
        const [, hash, name] = match
        console.log(`     - ${hash.substring(0, 8)}... "${name}"`)
      }
    })

    // Check if the specified identity exists
    if (process.env.APPLE_IDENTITY) {
      const hasIdentity = identities.includes(process.env.APPLE_IDENTITY)
      console.log(`\n   Specified identity "${process.env.APPLE_IDENTITY}" found: ${hasIdentity}`)
    }
  } catch (error) {
    console.log('   Error checking certificates:', (error as Error).message)
  }

  console.log('')

  // Check keychain status
  console.log('5. Keychain Information:')
  try {
    const keychains = execSync('security list-keychains', { encoding: 'utf8' })
    console.log('   Available keychains:')
    keychains
      .split('\n')
      .filter(line => line.trim())
      .forEach(line => {
        console.log(`     ${line.trim()}`)
      })

    // Check default keychain
    const defaultKeychain = execSync('security default-keychain', { encoding: 'utf8' })
    console.log(`   Default keychain: ${defaultKeychain.trim()}`)
  } catch (error) {
    console.log('   Error checking keychains:', (error as Error).message)
  }
} else {
  console.log('4. Not running on macOS, skipping certificate checks')
}
console.log('')

// 5. Project Structure
console.log('6. Project Structure:')
const importantFiles = [
  'package.json',
  'forge.config.ts',
  'entitlements.plist',
  `src/assets/icons/${environment}icon.icns`,
  `src/assets/icons/${environment}icon.png`,
  `src/assets/icons/${environment}icon.ico`,
]

importantFiles.forEach(file => {
  const exists = fs.existsSync(file)
  console.log(`   ${file}: ${exists ? 'EXISTS' : 'MISSING'}`)
})
console.log('')

// 6. Electron Forge Configuration
console.log('7. Forge Configuration:')
try {
  const forgeConfigPath = path.join(process.cwd(), 'forge.config.ts')
  if (fs.existsSync(forgeConfigPath)) {
    const configContent = fs.readFileSync(forgeConfigPath, 'utf8')

    // Check for osxSign configuration
    if (configContent.includes('osxSign:')) {
      console.log('   osxSign: CONFIGURED')
      // Check if it's conditional
      if (configContent.includes('process.env.APPLE_IDENTITY')) {
        console.log('   osxSign condition: Based on APPLE_IDENTITY env var')
      }
    } else {
      console.log('   osxSign: NOT CONFIGURED')
    }

    // Check for osxNotarize configuration
    if (configContent.includes('osxNotarize:')) {
      console.log('   osxNotarize: CONFIGURED')
      // Check conditions
      const notarizeMatch = configContent.match(/osxNotarize:\s*([^?]+)\?/)
      if (notarizeMatch) {
        console.log(`   osxNotarize condition: ${notarizeMatch[1].trim()}`)
      }
    } else {
      console.log('   osxNotarize: NOT CONFIGURED')
    }
  }
} catch (error) {
  console.log('   Error reading forge config:', (error as Error).message)
}
console.log('')

// 7. GitHub Actions specific
if (process.env.GITHUB_ACTIONS) {
  console.log('8. GitHub Actions Environment:')
  console.log(`   Runner OS: ${process.env.RUNNER_OS}`)
  console.log(`   Runner Arch: ${process.env.RUNNER_ARCH}`)
  console.log(`   GitHub Ref: ${process.env.GITHUB_REF}`)
  console.log(`   GitHub Event: ${process.env.GITHUB_EVENT_NAME}`)
  console.log(`   Is Tag: ${process.env.GITHUB_REF?.startsWith('refs/tags/')}`)
  console.log(`   Is Release: ${process.env.GITHUB_REF?.startsWith('refs/tags/v')}`)
}

console.log('\n=== End of Debug Information ===')
