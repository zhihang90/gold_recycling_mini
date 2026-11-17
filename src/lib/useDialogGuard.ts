import { useEffect, useRef } from 'react'

/**
 * 弹层守卫：锁滚动 + Esc + popstate + focus 归还。
 * BottomSheet / ConfirmDialog / PickerSheet 等所有模态弹层共用，避免各处重复写同一套 useEffect。
 *
 * 用法：
 * ```ts
 * const panelRef = useRef<HTMLDivElement>(null)
 * useDialogGuard({ open, onClose, panelRef })
 * ```
 */
export function useDialogGuard({
  open,
  onClose,
  panelRef,
  historyKey = '__dialog',
  disableEsc = false,
  /** 额外需要锁滚动的容器（除默认 [data-phone-scroll] 外）。
   *  BuyCheckout 这类页面有内层 overflow-y-auto 时，需传入以避免 BottomSheet 打开期间内层仍可滚 */
  extraScrollLocks = [] as React.RefObject<HTMLElement | null>[],
}: {
  open: boolean
  onClose: () => void
  panelRef: React.RefObject<HTMLElement | null>
  /** history state 的标志 key，区分不同弹层类型 */
  historyKey?: string
  /** 特殊场景禁用 Esc 关闭（如强制阅读页） */
  disableEsc?: boolean
  extraScrollLocks?: React.RefObject<HTMLElement | null>[]
}) {
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) return

    // 1) 锁滚动：默认 [data-phone-scroll] + 调用方传入的额外容器
    const locks: { el: HTMLElement; prev: string }[] = []
    const root = document.querySelector('[data-phone-scroll]') as HTMLElement | null
    if (root) {
      locks.push({ el: root, prev: root.style.overflowY })
      root.style.overflowY = 'hidden'
    }
    for (const ref of extraScrollLocks) {
      const el = ref.current
      if (!el) continue
      locks.push({ el, prev: el.style.overflowY })
      el.style.overflowY = 'hidden'
    }

    // 2) 记录当前聚焦元素，关闭后归还
    const previousFocus = document.activeElement as HTMLElement | null

    // 3) Esc 关闭
    const onKeyDown = (event: KeyboardEvent) => {
      if (!disableEsc && event.key === 'Escape') onCloseRef.current()
    }
    window.addEventListener('keydown', onKeyDown)

    // 4) 拦截浏览器返回 → 关闭弹层（不离开页面）
    let pushed = false
    try {
      window.history.pushState({ ...(window.history.state ?? {}), [historyKey]: true }, '')
      pushed = true
    } catch {
      pushed = false
    }
    const onPop = () => onCloseRef.current()
    window.addEventListener('popstate', onPop)

    // 5) 焦点移入弹层面板
    const focusTimer = window.setTimeout(() => panelRef.current?.focus(), 0)

    return () => {
      window.clearTimeout(focusTimer)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('popstate', onPop)
      // 恢复所有锁住的滚动容器
      for (const { el, prev } of locks) {
        el.style.overflowY = prev
      }
      previousFocus?.focus?.()
      // 只有本 hook push 的 state 才回退，避免吃掉下一层 history
      if (pushed && window.history.state?.[historyKey]) window.history.back()
    }
  }, [open, historyKey, disableEsc, panelRef])
}
