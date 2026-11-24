// ui-allow-file: 本文件是 PC 评审用的设备外壳，固定高度/圆角/边框不属于页面 UI
import { useEffect, useRef, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { useViewportFit } from '@/lib/useViewportFit'
import { BottomTabNav } from './BottomTabNav'
import { ReviewStatePanel } from './ReviewStatePanel'

/**
 * 演示外壳：
 * - < 900px：内容列最大 430 宽并居中，不做全宽拉伸（PC 窄窗口 / 平板都不失真）
 * - ≥ 900px：左侧 340px 演示导航 + 393px 设备框（净内容宽 375 = 设计基准）
 * - 高度用 .app-h 双声明（先 vh 后 dvh），旧内核也有兜底
 * - 键盘弹起时用 --keyboard-inset 收掉底部，避免吸底栏压住输入框
 */
export function Layout({ children, showTab }: { children: ReactNode; showTab: boolean }) {
  const { pathname } = useLocation()
  const scrollRef = useRef<HTMLDivElement>(null)
  useViewportFit()

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
    // 页面内层滚动区（DetailPage / ListPage）不会随路由卸载重置时，这里统一回到顶部
    scrollRef.current
      ?.querySelectorAll<HTMLElement>('[data-page-scroll]')
      .forEach((el) => el.scrollTo({ top: 0 }))
  }, [pathname])

  return (
    <div className="app-h w-full bg-canvas min-[900px]:flex min-[900px]:items-center min-[900px]:justify-center min-[900px]:bg-surface-2 min-[900px]:pl-[340px]">
      <ReviewStatePanel />
      {/* ui-allow: PC 评审设备外框，圆角与固定高度属于演示壳，不是页面 UI */}
      <div
        data-phone-frame
        style={{ paddingBottom: 'var(--keyboard-inset)' }}
        className="relative mx-auto flex h-full w-full max-w-[430px] flex-col overflow-hidden bg-background min-[900px]:h-[830px] min-[900px]:w-[393px] min-[900px]:max-w-none min-[900px]:rounded-[40px] min-[900px]:border-[9px] min-[900px]:border-ink-900 min-[900px]:shadow-lg"
      >
        <div className="hidden h-6 shrink-0 items-center justify-center bg-background min-[900px]:flex">
          <span className="h-3.5 w-20 rounded-full bg-ink-900" />
        </div>
        <div
          ref={scrollRef}
          data-phone-scroll
          className="hide-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain"
        >
          {children}
        </div>
        {showTab ? <BottomTabNav /> : null}
      </div>
    </div>
  )
}
