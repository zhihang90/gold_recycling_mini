import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { useSearchParams } from 'react-router-dom'

import { REVIEW_STATES, type ReviewStateGroup } from '@/routes/reviewStates'

const DESKTOP_QUERY = '(min-width: 900px)'
const STORAGE_PREFIX = 'review-state:'
const PARAM_PREFIX = 'rv_'
const CHANGE_EVENT = 'review-state:change'

interface ReviewStateChange {
  routeId: string
  values: Record<string, string>
}

/** 同一路由的页面与评审面板各持有一个 hook 实例，切换后需要广播才能保持一致 */
function emitChange(routeId: string, values: Record<string, string>) {
  window.dispatchEvent(
    new CustomEvent<ReviewStateChange>(CHANGE_EVENT, { detail: { routeId, values } }),
  )
}

function subscribeDesktop(callback: () => void) {
  const media = window.matchMedia(DESKTOP_QUERY)
  media.addEventListener('change', callback)
  return () => media.removeEventListener('change', callback)
}

function getDesktopSnapshot() {
  return window.matchMedia(DESKTOP_QUERY).matches
}

/** 与 Layout 的桌面断点保持一致；手机端不启用评审状态 */
export function useIsDesktop() {
  return useSyncExternalStore(subscribeDesktop, getDesktopSnapshot, () => false)
}

function optionValues(group: ReviewStateGroup) {
  const sectionValues =
    group.sections?.flatMap((section) => section.options.map((option) => option.value)) ?? []
  return [...group.options.map((option) => option.value), ...sectionValues]
}

function readStored(routeId: string): Record<string, string> {
  try {
    const raw = sessionStorage.getItem(`${STORAGE_PREFIX}${routeId}`)
    return raw ? (JSON.parse(raw) as Record<string, string>) : {}
  } catch {
    return {}
  }
}

function writeStored(routeId: string, values: Record<string, string>) {
  try {
    sessionStorage.setItem(`${STORAGE_PREFIX}${routeId}`, JSON.stringify(values))
  } catch {
    // 存储不可用时只保留本次会话内的页内状态
  }
}

function resolveInitial(
  groups: ReviewStateGroup[],
  routeId: string,
  searchParams: URLSearchParams,
  enabled: boolean,
): Record<string, string> {
  const stored = enabled ? readStored(routeId) : {}
  return groups.reduce<Record<string, string>>((result, group) => {
    const fromUrl = searchParams.get(`${PARAM_PREFIX}${group.id}`)
    const candidate = fromUrl ?? stored[group.id]
    result[group.id] =
      candidate && optionValues(group).includes(candidate) ? candidate : group.defaultValue
    return result
  }, {})
}

/**
 * 桌面评审状态：URL 优先、sessionStorage 兜底，默认跟随真实业务状态。
 * 只影响展示分支，不写入任何业务数据。
 */
export function useReviewState(routeId: string) {
  const groups = REVIEW_STATES[routeId] ?? []
  const isDesktop = useIsDesktop()
  const [searchParams, setSearchParams] = useSearchParams()
  const [storedValues, setStoredValues] = useState<Record<string, string>>(() =>
    resolveInitial(groups, routeId, searchParams, isDesktop),
  )

  useEffect(() => {
    if (!isDesktop) return
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<ReviewStateChange>).detail
      if (detail?.routeId === routeId) setStoredValues(detail.values)
    }
    window.addEventListener(CHANGE_EVENT, handler)
    return () => window.removeEventListener(CHANGE_EVENT, handler)
  }, [isDesktop, routeId])

  const values = useMemo(() => {
    if (isDesktop) return storedValues
    return groups.reduce<Record<string, string>>((result, group) => {
      result[group.id] = group.defaultValue
      return result
    }, {})
  }, [groups, isDesktop, storedValues])

  const setValue = useCallback(
    (groupId: string, value: string) => {
      if (!isDesktop) return
      const group = groups.find((item) => item.id === groupId)
      if (!group || !optionValues(group).includes(value)) return

      const nextValues = { ...storedValues, [groupId]: value }
      setStoredValues(nextValues)
      writeStored(routeId, nextValues)
      emitChange(routeId, nextValues)

      const nextParams = new URLSearchParams(searchParams)
      const key = `${PARAM_PREFIX}${groupId}`
      if (value === group.defaultValue) {
        nextParams.delete(key)
      } else {
        nextParams.set(key, value)
      }
      setSearchParams(nextParams, { replace: true })
    },
    [groups, isDesktop, routeId, searchParams, setSearchParams, storedValues],
  )

  const reset = useCallback(() => {
    if (!isDesktop) return
    const defaults = groups.reduce<Record<string, string>>((result, group) => {
      result[group.id] = group.defaultValue
      return result
    }, {})
    setStoredValues(defaults)
    writeStored(routeId, defaults)
    emitChange(routeId, defaults)

    const nextParams = new URLSearchParams(searchParams)
    groups.forEach((group) => nextParams.delete(`${PARAM_PREFIX}${group.id}`))
    setSearchParams(nextParams, { replace: true })
  }, [groups, isDesktop, routeId, searchParams, setSearchParams])

  const active = groups.some((group) => values[group.id] !== group.defaultValue)

  return { groups, values, setValue, reset, active, isDesktop }
}
