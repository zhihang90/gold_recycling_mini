import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface PromoSlide {
  key: string
  /** 供读屏与圆点按钮使用，如「集团背书」 */
  label: string
  content: ReactNode
}

/**
 * 首页宣传轮播：横向 scroll-snap，支持滑动、圆点跳转与自动播放。
 * 自动播放 5 秒一张；悬停、聚焦与「减少动态效果」时暂停。
 */
export function PromoCarousel({
  slides,
  className,
}: {
  slides: PromoSlide[]
  className?: string
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  const scrollToSlide = useCallback((index: number) => {
    const track = trackRef.current
    if (!track) return
    track.scrollTo({ left: track.clientWidth * index, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    if (paused || slides.length < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const timer = window.setTimeout(() => {
      scrollToSlide((active + 1) % slides.length)
    }, 5000)

    return () => window.clearTimeout(timer)
  }, [active, paused, slides.length, scrollToSlide])

  return (
    <section
      aria-roledescription="carousel"
      aria-label="首页推荐"
      className={cn('relative', className)}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div
        ref={trackRef}
        onScroll={() => {
          const track = trackRef.current
          if (!track) return
          const next = Math.round(track.scrollLeft / track.clientWidth)
          setActive((prev) => (prev === next ? prev : next))
        }}
        className="hide-scrollbar flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-lg"
      >
        {slides.map((slide, index) => (
          <div
            key={slide.key}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} / ${slides.length} ${slide.label}`}
            className="w-full shrink-0 snap-center"
          >
            {slide.content}
          </div>
        ))}
      </div>

      <div className="absolute bottom-2 right-2 flex items-center rounded-full bg-card/85 px-1 py-0.5">
        {slides.map((slide, index) => (
          <button
            key={slide.key}
            type="button"
            aria-label={`查看第 ${index + 1} 张：${slide.label}`}
            aria-current={index === active ? 'true' : undefined}
            onClick={() => scrollToSlide(index)}
            className="flex h-6 w-6 items-center justify-center"
          >
            <span
              className={cn(
                'h-1.5 rounded-full transition-all',
                index === active ? 'w-4 bg-primary' : 'w-1.5 bg-ink-400/70',
              )}
            />
          </button>
        ))}
      </div>
    </section>
  )
}
