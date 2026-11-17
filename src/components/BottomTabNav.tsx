import { useSyncExternalStore } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { TAB_PATHS, TAB_ROUTES } from '@/routes/routes.config'
import { cartCount, subscribeCart } from '@/mocks/cart'
import { cn } from '@/lib/utils'

/**
 * 底部 Tab 栏：首页 / 买金 / 购物车 / 订单 / 我的五个主入口。
 * 标签、图标、顺序全部来自 routes.config 的 tab 元数据，这里不再维护第二份列表。
 * 购物车是中间主入口：只放图标，做成悬浮金色圆形按钮，避免胶囊内图标与三字标签挤在一起；
 * 名称保留在 aria-label 与读屏文本中，不牺牲可访问性。
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
                  'relative flex h-12 w-12 -translate-y-1 items-center justify-center rounded-full bg-gradient-to-b from-gold-500 to-gold-700 text-gold-50 shadow-lg ring-4 ring-card transition',
                  active && 'scale-105 from-gold-400 to-gold-600',
                )}
              >
                <Icon size={22} strokeWidth={active ? 2.4 : 2} />
                <span className="sr-only">{route.tab.label}</span>
                {count > 0 ? (
                  <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-primary px-1.5 py-0.5 text-center text-caption leading-none text-primary-foreground ring-2 ring-card">
                    {count > 99 ? '99+' : count}
                  </span>
                ) : null}
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
            <Icon
              size={20}
              strokeWidth={active ? 2.4 : 1.9}
              className={cn('transition-transform', active && 'scale-105')}
            />
            <span className={cn('whitespace-nowrap', active && 'font-medium')}>
              {route.tab.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
