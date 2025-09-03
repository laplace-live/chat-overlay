#!/usr/bin/env ts-node

import { execSync } from 'child_process'
import { existsSync, mkdirSync } from 'fs'
import path from 'path'

// macOS icon sizes for .icns (as per Apple's guidelines)
const macOSSizes = [
  { size: 16, scale: 1, name: 'icon_16x16.png' },
  { size: 16, scale: 2, name: 'icon_16x16@2x.png' },
  { size: 32, scale: 1, name: 'icon_32x32.png' },
  { size: 32, scale: 2, name: 'icon_32x32@2x.png' },
  { size: 128, scale: 1, name: 'icon_128x128.png' },
  { size: 128, scale: 2, name: 'icon_128x128@2x.png' },
  { size: 256, scale: 1, name: 'icon_256x256.png' },
  { size: 256, scale: 2, name: 'icon_256x256@2x.png' },
  { size: 512, scale: 1, name: 'icon_512x512.png' },
  { size: 512, scale: 2, name: 'icon_512x512@2x.png' },
]

// Windows icon sizes for .ico
const windowsSizes = [16, 24, 32, 48, 64, 128, 256]

// Icon configurations for different purposes
const iconConfigs = {
  prod: {
    source: 'src/assets/icon.png',
    outputDir: 'src/assets/icons/prod',
    description: 'Production',
  },
  dev: {
    source: 'src/assets/icon-dev.png',
    outputDir: 'src/assets/icons/dev',
    description: 'Development',
  },
  installer: {
    source: 'src/assets/icon-installer.png',
    outputDir: 'src/assets/icons/installer',
    description: 'Installer',
  },
  // Future extensibility examples:
  // uninstaller: {
  //   source: 'src/assets/icon-uninstaller.png',
  //   outputDir: 'src/assets/icons/uninstaller',
  //   description: 'Uninstaller'
  // }
}

function ensureDirectoryExists(dir: string) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
}

function generateMacOSIcon(sourceIcon: string, outputDir: string, description: string) {
  console.log(`Generating ${description} macOS icon...`)

  ensureDirectoryExists(outputDir)

  // Generate individual PNG files for .icns creation
  const tempDir = path.join(outputDir, 'temp')
  ensureDirectoryExists(tempDir)

  // Generate all required sizes
  for (const { size, scale, name } of macOSSizes) {
    const actualSize = size * scale
    const outputPath = path.join(tempDir, name)

    try {
      execSync(`magick "${sourceIcon}" -resize ${actualSize}x${actualSize} "${outputPath}"`, { stdio: 'inherit' })
    } catch (error) {
      console.error(`Failed to generate ${name}:`, error)
    }
  }

  // Create .icns file using iconutil (macOS only)
  const iconsetDir = path.join(tempDir, 'icon.iconset')
  ensureDirectoryExists(iconsetDir)

  // Copy files to iconset with proper naming
  for (const { name } of macOSSizes) {
    const srcPath = path.join(tempDir, name)
    const dstPath = path.join(iconsetDir, name)
    if (existsSync(srcPath)) {
      execSync(`cp "${srcPath}" "${dstPath}"`)
    }
  }

  try {
    const icnsPath = path.join(outputDir, 'icon.icns')
    execSync(`iconutil -c icns "${iconsetDir}" -o "${icnsPath}"`, { stdio: 'inherit' })
    console.log(`✓ Generated ${description} icon.icns`)

    // Clean up temp files
    execSync(`rm -rf "${tempDir}"`)
  } catch (error) {
    console.error(
      `Failed to create ${description} .icns file. Make sure you are running on macOS with iconutil available.`
    )
    console.log('Individual PNG files are available in:', tempDir)
  }
}

function generateWindowsIcon(sourceIcon: string, outputDir: string, description: string) {
  console.log(`Generating ${description} Windows icon...`)

  ensureDirectoryExists(outputDir)

  // Generate individual PNG files
  const pngFiles: string[] = []
  const tempDir = path.join(outputDir, 'temp')
  ensureDirectoryExists(tempDir)

  for (const size of windowsSizes) {
    const outputPath = path.join(tempDir, `icon_${size}x${size}.png`)
    pngFiles.push(outputPath)

    try {
      execSync(`magick "${sourceIcon}" -resize ${size}x${size} "${outputPath}"`, { stdio: 'inherit' })
    } catch (error) {
      console.error(`Failed to generate ${size}x${size} PNG:`, error)
    }
  }

  // Create .ico file
  try {
    const icoPath = path.join(outputDir, 'icon.ico')
    const pngList = pngFiles.filter(f => existsSync(f)).join(' ')
    execSync(`magick ${pngList} "${icoPath}"`, { stdio: 'inherit' })
    console.log(`✓ Generated ${description} icon.ico`)

    // Clean up temp files
    execSync(`rm -rf "${tempDir}"`)
  } catch (error) {
    console.error(`Failed to create ${description} .ico file:`, error)
  }
}

function generateOtherPlatformIcon(sourceIcon: string, outputDir: string, description: string) {
  console.log(`Generating ${description} other platforms icon...`)

  ensureDirectoryExists(outputDir)

  try {
    const outputPath = path.join(outputDir, 'icon.png')
    // Create a 512x512 version for other platforms
    execSync(`magick "${sourceIcon}" -resize 512x512 "${outputPath}"`, { stdio: 'inherit' })
    console.log(`✓ Generated ${description} icon.png`)
  } catch (error) {
    console.error(`Failed to create ${description} PNG:`, error)
  }
}

function generateIconsForEnvironment(environment: string) {
  const config = iconConfigs[environment as keyof typeof iconConfigs]
  if (!config) {
    console.error(`Unknown environment: ${environment}`)
    return
  }

  if (!existsSync(config.source)) {
    console.error(`Source icon not found: ${config.source}`)
    return
  }

  console.log(`🎨 Generating ${config.description} icons from ${config.source}...`)

  generateMacOSIcon(config.source, config.outputDir, config.description)
  generateWindowsIcon(config.source, config.outputDir, config.description)
  generateOtherPlatformIcon(config.source, config.outputDir, config.description)

  console.log(`✅ ${config.description} icon generation complete!`)
  console.log(`Generated files in: ${config.outputDir}/`)
  console.log(`  - icon.icns (macOS)`)
  console.log(`  - icon.ico (Windows)`)
  console.log(`  - icon.png (Other platforms)`)
  console.log('')
}

function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.log('🎨 Generating icons for all environments...')
    console.log('')

    // Check if ImageMagick is available
    try {
      execSync('magick -version', { stdio: 'pipe' })
    } catch (error) {
      console.error('ImageMagick is required but not found. Please install ImageMagick:')
      console.error('  macOS: brew install imagemagick')
      console.error('  Ubuntu/Debian: sudo apt-get install imagemagick')
      console.error('  Windows: Download from https://imagemagick.org/script/download.php#windows')
      process.exit(1)
    }

    // Generate icons for all environments
    Object.keys(iconConfigs).forEach(env => {
      generateIconsForEnvironment(env)
    })

    console.log('🎉 All icon generation complete!')
    console.log('')
    console.log('Available environments:')
    Object.entries(iconConfigs).forEach(([env, config]) => {
      console.log(`  ${env}: ${config.description} icons from ${config.source}`)
    })
  } else if (args.length === 1) {
    const environment = args[0]

    // Check if ImageMagick is available
    try {
      execSync('magick -version', { stdio: 'pipe' })
    } catch (error) {
      console.error('ImageMagick is required but not found. Please install ImageMagick:')
      console.error('  macOS: brew install imagemagick')
      console.error('  Ubuntu/Debian: sudo apt-get install imagemagick')
      console.error('  Windows: Download from https://imagemagick.org/script/download.php#windows')
      process.exit(1)
    }

    generateIconsForEnvironment(environment)
  } else {
    console.log('Usage:')
    console.log('  npm run generate-icons              # Generate icons for all environments')
    console.log('  npm run generate-icons prod         # Generate production icons only')
    console.log('  npm run generate-icons dev          # Generate development icons only')
    console.log('')
    console.log('Available environments:')
    Object.entries(iconConfigs).forEach(([env, config]) => {
      console.log(`  ${env}: ${config.description} icons from ${config.source}`)
    })
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}
