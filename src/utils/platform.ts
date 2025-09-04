/**
 * Platform detection utilities
 */

/**
 * Check if the app is running on macOS
 */
export const isMacOS = (): boolean => {
  return window.electronAPI.getPlatform() === 'darwin'
}

/**
 * Check if the app is running on Windows
 */
export const isWindows = (): boolean => {
  return window.electronAPI.getPlatform() === 'win32'
}

/**
 * Check if the app is running on Linux
 */
export const isLinux = (): boolean => {
  return window.electronAPI.getPlatform() === 'linux'
}
