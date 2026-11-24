import { useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { useLocation } from 'react-router-dom'

import { Button, Chip, ChipRow, IconButton, TextLink } from '@/components'
import { useReviewState } from '@/lib/useReviewState'
import { matchRoute, type AppRoute } from '@/routes/routes.config'

/**
 * 桌面评审状态面板：只在设备框外的空白区出现，手机端不渲染。
 * 状态优先写 URL，便于分享到具体评审场景；不参与真实业务流程。
 */
export function ReviewStatePanel() {
  const { pathname } = useLocation()
  const route = matchRoute(pathname)
  if (!route) return null
  return <ReviewStatePanelForRoute key={route.id} route={route} />
}

function ReviewStatePanelForRoute({ route }: { route: AppRoute }) {
  const { groups, values, setValue, reset, active, isDesktop } = useReviewState(route.id)
  const [open, setOpen] = useState(() =>
    typeof window === 'undefined' ? true : window.matchMedia('(min-width: 1400px)').matches,
  )

  if (!isDesktop || groups.length === 0) return null

  const currentGroup = groups.find((group) => values[group.id] !== group.defaultValue)
  const currentOption = currentGroup?.options.find(
    (option) => option.value === values[currentGroup.id],
  )
  const summary = currentGroup && currentOption ? currentOption.label : '跟随业务'

  return (
    <div className="fixed left-[356px] top-1/2 z-50 hidden -translate-y-1/2 min-[900px]:block">
      {open ? (
        <section className="w-60 rounded-lg bg-card p-3 shadow-lg ring-1 ring-border-subtle">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-caption-strong text-foreground">
              <SlidersHorizontal size={14} className="text-primary" aria-hidden="true" />
              评审状态
            </span>
            <IconButton
              icon={X}
              label="收起评审状态"
              className="h-8 w-8"
              onClick={() => setOpen(false)}
            />
          </div>

          <p className="mt-1 truncate text-caption text-subtle-foreground">
            {route.pageTitle ?? route.label}
          </p>

          <div className="mt-3 space-y-3">
            {groups.map((group) => (
              <div key={group.id}>
                <p className="text-caption text-muted-foreground">{group.label}</p>
                <ChipRow className="mt-1.5">
                  {group.options.map((option) => (
                    <Chip
                      key={option.value}
                      active={values[group.id] === option.value}
                      onClick={() => setValue(group.id, option.value)}
                    >
                      {option.label}
                    </Chip>
                  ))}
                </ChipRow>
                {group.hint ? (
                  <p className="mt-1.5 text-caption text-subtle-foreground">{group.hint}</p>
                ) : null}
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-end justify-between gap-2 border-t border-border-subtle pt-2">
            <span className="text-caption text-subtle-foreground">仅桌面评审，手机端不生效</span>
            <TextLink onClick={reset} className="shrink-0">
              恢复默认
            </TextLink>
          </div>
        </section>
      ) : (
        <Button
          variant="secondary"
          size="sm"
          className="flex-col gap-1 px-3 py-2"
          aria-label="打开评审状态面板"
          onClick={() => setOpen(true)}
        >
          <SlidersHorizontal size={14} className="text-primary" aria-hidden="true" />
          <span className="text-caption-strong">评审状态</span>
          <span className="max-w-20 truncate text-caption text-subtle-foreground">{summary}</span>
          {active ? <span className="h-1 w-1 rounded-full bg-primary" aria-hidden="true" /> : null}
        </Button>
      )}
    </div>
  )
}
