/** What `screenshots.mts` hands the harness it launches, as JSON in {@link CONFIG_ENV}. */
export interface HarnessConfig {
  /** Chromium's profile parent, so the run never shares the real app's userData or settings. */
  appData: string
  /** The committed screenshots folder. */
  out: string
  /** Shot names to take; empty means all. */
  only: string[]
  /** The loopback port the made-up Event Bridge listens on. */
  port: number
}

export const CONFIG_ENV = 'CHAT_OVERLAY_SCREENSHOTS'
