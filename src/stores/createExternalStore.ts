import { useSyncExternalStore } from 'react'

/**
 * 轻量外部 store：页面用 useStore() 订阅，动作直接调用返回的方法。
 * 回收流程的状态（估价草稿、检测进度）在业务页面落地时再用，不引入额外状态库。
 */
export function createExternalStore<T>(initial: T) {
  let state = initial
  const listeners = new Set<() => void>()

  const emit = () => {
    listeners.forEach((listener) => listener())
  }

  const getState = () => state

  const replace = (next: T) => {
    state = next
    emit()
  }

  const update = (fn: (prev: T) => T) => {
    replace(fn(state))
  }

  const subscribe = (listener: () => void) => {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }

  const useStore = () => useSyncExternalStore(subscribe, getState, getState)

  return { getState, replace, update, subscribe, useStore }
}
