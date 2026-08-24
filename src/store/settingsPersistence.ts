type ClickThroughState = {
  clickThrough: boolean
}

export function omitTransientSettings<T extends ClickThroughState>(state: T): Omit<T, 'clickThrough'> {
  const { clickThrough, ...persistedState } = state
  void clickThrough
  return persistedState
}

export function mergePersistedSettings<T extends ClickThroughState>(persistedState: unknown, currentState: T): T {
  const persisted =
    persistedState && typeof persistedState === 'object' ? (persistedState as Partial<T>) : ({} as Partial<T>)

  return {
    ...currentState,
    ...persisted,
    // 点击穿透是窗口运行时状态，重启后必须从关闭状态开始。
    clickThrough: false,
  } as T
}
