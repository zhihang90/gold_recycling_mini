import { useSyncExternalStore } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { TAB_PATHS, TAB_ROUTES } from '@/routes/routes.config'
import { cartCount, subscribeCart } from '@/mocks/cart'
import { cn } from '@/lib/utils'

/**
 * 底部 Tab 栏：首页 / 行情 / 买金 / 购物车 / 我的五个主入口。
 * 标签、图标、顺序全部来自 routes.config 的 tab 元数据，这里不再维护第二份列表。
 * 买金是中间主入口（核心交易业务）：做成上浮的金色胶囊，图标 + 文字都在胶囊内，
 * 用高光与投影把它从四个普通 Tab 中区分出来；购物车回到普通 Tab，用角标提示件数。
 * 高度 52 + 安全区：微信 iOS 有 Home 指示条，用 max() 保证不支持 env() 的内核仍有 6px。
 */
export function BottomTabNav() {
  const { pathname } = useLocation()
  const count = useSyncExternalStore(subscribeCart, cartCount, () => 0)

  if (!TAB_PATHS.includes(pathname)) return null

  return (
    <nav className="z-30 flex shrink-0 items-stretch border-t border-border-subtle bg-card px-1 pb-[max(6px,env(safe-area-inset-bottom))] backdrop-blur">
      {TAB_ROUTES.map((route) => {
        const active = pathname === route.path
        const Icon = route.tab.icon

        if (route.tab.emphasis) {
          return (
            <Link
              key={route.path}
              to={route.path}
              aria-current={active ? 'page' : undefined}
              aria-label={route.tab.label}
              className="flex min-w-0 flex-1 items-center justify-center"
            >
              <span
                className={cn(
                  'relative flex h-14 w-14 -translate-y-3 flex-col items-center justify-center gap-0.5 rounded-full bg-gradient-to-b from-gold-400 via-gold-500 to-gold-700 text-gold-50 ring-[3px] ring-card transition active:scale-95',
                  'shadow-[0_6px_16px_-2px_rgba(122,86,32,0.45)]',
                  active &&
                    'from-gold-300 via-gold-400 to-gold-600 shadow-[0_8px_22px_-2px_rgba(122,86,32,0.6)]',
                )}
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/25 to-transparent"
                />
                <Icon size={20} strokeWidth={2.2} className="relative" />
                <span className="relative text-[10px] leading-none font-medium tracking-wide">
                  {route.tab.label}
                </span>
              </span>
            </Link>
          )
        }

        return (
          <Link
            key={route.path}
            to={route.path}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex min-h-[52px] min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-lg px-1 text-caption transition',
              active ? 'text-primary' : 'text-subtle-foreground',
            )}
          >
            <span className="relative">
              <Icon
                size={20}
                strokeWidth={active ? 2.4 : 1.9}
                className={cn('transition-transform', active && 'scale-105')}
              />
              {route.id === 'cart' && count > 0 ? (
                <span className="absolute -top-1.5 -right-2 min-w-4 rounded-full bg-primary px-1 text-center text-[10px] leading-4 text-primary-foreground">
                  {count > 99 ? '99+' : count}
                </span>
              ) : null}
            </span>
            <span className={cn('whitespace-nowrap', active && 'font-medium')}>
              {route.tab.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
