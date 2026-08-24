import assert from 'node:assert/strict'
import test from 'node:test'

import { mergePersistedSettings, omitTransientSettings } from '../src/store/settingsPersistence.ts'

test('持久化设置时排除点击穿透状态', () => {
  const persisted = omitTransientSettings({
    clickThrough: true,
    opacity: 80,
    alwaysOnTop: false,
  })

  assert.deepEqual(persisted, { opacity: 80, alwaysOnTop: false })
  assert.equal('clickThrough' in persisted, false)
})

test('读取旧设置时重置已保存的点击穿透状态', () => {
  const merged = mergePersistedSettings(
    { clickThrough: true, opacity: 90 },
    { clickThrough: false, opacity: 80, alwaysOnTop: false }
  )

  assert.equal(merged.clickThrough, false)
  assert.equal(merged.opacity, 90)
  assert.equal(merged.alwaysOnTop, false)
})

test('无效持久化数据不会改变默认的运行时状态', () => {
  const currentState = { clickThrough: false, opacity: 80 }

  assert.deepEqual(mergePersistedSettings(null, currentState), currentState)
})
