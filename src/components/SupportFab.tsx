import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Headset } from 'lucide-react'
import { Link } from 'react-router-dom'

import { routePath } from '@/routes/paths'

/**
 * 在线客服悬浮入口：首页、买金等一级页直达客服首页。
 * 挂载到演示设备框内，PC 评审时不飘出手机；位置在底部 Tab 栏之上。
 */
export function SupportFab() {
  const [host, setHost] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setHost(document.querySelector<HTMLElement>('[data-phone-frame]'))
  }, [])

  if (!host) return null

  return createPortal(
    <Link
      to={routePath('support.home')}
      aria-label="在线客服"
      className="absolute bottom-[76px] right-4 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-b from-gold-500 to-gold-700 text-gold-50 shadow-lg ring-1 ring-gold-300/60 transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2"
    >
      <Headset size={20} strokeWidth={2.2} aria-hidden="true" />
    </Link>,
    host,
  )
}
