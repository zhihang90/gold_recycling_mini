import { useState } from 'react'
import { ChevronDown, Recycle } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { PROTOTYPE_MENU } from '@/routes/prototypeMenu'
import { cn } from '@/lib/utils'

/**
 * 桌面演示左栏（D26）：仅 PC 演示可见，不进入正式页面内容。
 * ≥ 900px 才出现，窄窗口自动隐藏，避免和内容抢空间。
 */
export function PrototypeNav() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[340px] flex-col border-r border-border bg-card/95 px-4 py-4 backdrop-blur min-[900px]:flex">
      <div className="mb-4 flex items-start gap-3 px-1">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary-active">
          <Recycle size={16} />
        </div>
        <div className="min-w-0">
          <div className="font-serif text-body-strong text-foreground">
            安盛华 · 黄金买卖平台
          </div>
          <div className="mt-1 text-caption text-subtle-foreground">H5 原型 · 页面导航</div>
        </div>
      </div>

      <div className="hide-scrollbar min-h-0 flex-1 overflow-y-auto pr-1">
        {PROTOTYPE_MENU.map((group) => {
          const groupActive = group.sections.some((section) =>
            section.items.some((item) => item.path.split('?')[0] === pathname),
          )

          return (
            <div
              key={group.title}
              className="mb-3 rounded-lg bg-surface/70 ring-1 ring-border-subtle"
            >
              <button
                type="button"
                aria-expanded={!collapsed[group.title]}
                onClick={() =>
                  setCollapsed((prev) => ({ ...prev, [group.title]: !prev[group.title] }))
                }
                className="flex w-full items-center justify-between px-3 py-2"
              >
                <span className="flex items-center gap-2 text-caption-strong text-foreground">
                  {group.title}
                  {groupActive ? <span className="h-1.5 w-1.5 rounded-full bg-primary" /> : null}
                </span>
                <ChevronDown
                  size={16}
                  className={cn(
                    'text-subtle-foreground transition-transform',
                    collapsed[group.title] && '-rotate-90',
                  )}
                />
              </button>

              {!collapsed[group.title] ? (
                <div className="pb-1">
                  {group.sections.map((section) => (
                    <div key={section.title ?? 'default'} className="mt-1 first:mt-0">
                      {section.title ? (
                        <div className="px-3 pb-1.5 pt-1 text-caption text-subtle-foreground">
                          {section.title}
                        </div>
                      ) : null}
                      <div className="grid grid-cols-4 gap-1.5 px-2 pb-2">
                        {section.items.map((item) => {
                          const active = item.path.split('?')[0] === pathname
                          return (
                            <button
                              key={item.path}
                              type="button"
                              title={item.label}
                              aria-current={active ? 'page' : undefined}
                              onClick={() => navigate(item.path)}
                              className={cn(
                                'flex min-h-10 w-full items-center justify-center rounded-md px-1 py-1.5 text-center text-caption leading-tight transition',
                                active
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-card text-muted-foreground ring-1 ring-border hover:text-foreground',
                              )}
                            >
                              {item.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          )
        })}
      </div>

      <div className="mt-3 border-t border-border-subtle px-1 pt-3 text-caption text-subtle-foreground">
        点击条目直达对应页面
        <br />
        窗口宽度 ≥ 900px 时显示此栏
      </div>
    </aside>
  )
}
