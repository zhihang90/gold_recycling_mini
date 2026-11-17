import { useEffect } from 'react'

/**
 * 微信内置浏览器 / iOS Safari 的视口与键盘基础适配。
 *
 * 做两件事：
 * 1. 监听 visualViewport，把「布局视口 - 可视视口」的高度差写进 --keyboard-inset，
 *    Layout 用它收掉设备框底部（安卓 X5 是 resize 模式，该值保持 0，不会重复收缩）。
 * 2. 输入控件聚焦后延迟滚动到可视区中部 —— 键盘弹起是异步的，立即滚动会被顶回去。
 *
 * 注意：真机（微信 iOS / 安卓）上的实际表现未验证，这里只做不破坏布局的基础处理。
 */
export function useViewportFit() {
  useEffect(() => {
    const vv = window.visualViewport
    const root = document.documentElement

    const sync = () => {
      if (!vv) return
      const inset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
      root.style.setProperty('--keyboard-inset', `${Math.round(inset)}px`)
    }

    const onFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement | null
      if (!target || !/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return
      window.setTimeout(() => {
        target.scrollIntoView({ block: 'center', behavior: 'smooth' })
      }, 300)
    }

    sync()
    vv?.addEventListener('resize', sync)
    vv?.addEventListener('scroll', sync)
    document.addEventListener('focusin', onFocusIn)

    return () => {
      vv?.removeEventListener('resize', sync)
      vv?.removeEventListener('scroll', sync)
      document.removeEventListener('focusin', onFocusIn)
      root.style.removeProperty('--keyboard-inset')
    }
  }, [])
}
