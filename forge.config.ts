import path from 'node:path'
import { FuseV1Options, FuseVersion } from '@electron/fuses'
import { MakerDeb, type MakerDebConfigOptions } from '@electron-forge/maker-deb'
import { MakerRpm } from '@electron-forge/maker-rpm'
import { MakerSquirrel } from '@electron-forge/maker-squirrel'
import { MakerZIP } from '@electron-forge/maker-zip'
import { FusesPlugin } from '@electron-forge/plugin-fuses'
import { VitePlugin } from '@electron-forge/plugin-vite'
import type { ForgeConfig } from '@electron-forge/shared-types'

const LINUX_OZONE_PLATFORM_ARG = '--ozone-platform=x11'

// Environment-specific app icon without extension: Packager picks the format per platform, and
// the Windows installer reuses the .ico
const APP_ICON = `src/assets/icons/${process.env.NODE_ENV === 'development' ? 'dev' : 'prod'}/icon`

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    icon: APP_ICON,
    executableName: 'chat-overlay',
    appBundleId: 'live.laplace.chat-overlay',
    osxSign: process.env.APPLE_IDENTITY
      ? {
          identity: process.env.APPLE_IDENTITY,
        }
      : undefined,
    osxNotarize:
      process.env.APPLE_API_KEY_ID && process.env.APPLE_API_ISSUER
        ? {
            appleApiKey: `~/private_keys/AuthKey_${process.env.APPLE_API_KEY_ID}.p8`,
            appleApiKeyId: process.env.APPLE_API_KEY_ID,
            appleApiIssuer: process.env.APPLE_API_ISSUER,
          }
        : undefined,
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({
      // https://www.electronforge.io/config/makers/squirrel.windows?q=setAppUserModelId#spaces-in-the-app-name
      name: 'LAPLACEChatOverlay',
      authors: 'LAPLACE Live!',
      description: 'A modern, transparent chat overlay application for Bilibili live streaming',
      setupIcon: `${APP_ICON}.ico`,
    }),
    new MakerZIP(
      {
        macUpdateManifestBaseUrl: 'https://github.com/laplace-live/chat-overlay/releases/latest/download',
      },
      ['darwin']
    ),
    // Launch under XWayland rather than native Wayland, where always on top and
    // click pass-through are both inert. src/main.ts relaunches itself with the
    // same flag for launches that don't go through the desktop entry.
    new MakerRpm({
      options: {
        execArguments: [LINUX_OZONE_PLATFORM_ARG],
      },
    }),
    new MakerDeb({
      // `execArguments` is untyped for Debian because upstream's desktop
      // template ignores it, but the value still reaches the template context —
      // and ours reads it, the same way electron-installer-redhat's does.
      options: {
        execArguments: [LINUX_OZONE_PLATFORM_ARG],
        desktopTemplate: path.resolve('resources/desktop.ejs'),
      } as MakerDebConfigOptions,
    }),
  ],
  plugins: [
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: 'src/main.ts',
          config: 'vite.main.config.mts',
          target: 'main',
        },
        {
          entry: 'src/preload.ts',
          config: 'vite.preload.config.mts',
          target: 'preload',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.mts',
        },
      ],
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
}

export default config
