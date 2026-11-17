import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface CarouselSlide {
  id: string
  image: string
  title: string
  subtitle?: string
  /** 自定义帧内容；提供后不渲染默认的文图结构 */
  content?: ReactNode
}

/**
 * 轻量轮播：左右滑动 / 自动播放 / 循环 / 指示点（无第三方库）。
 * - 自动播放 4.5s；手动滑动、页面不可见、prefers-reduced-motion 时不计时
 * - 动效使用 --motion-slow / --ease-* token
 */
export function Carousel({
  slides,
  onSelect,
  ariaLabel,
  className,
  autoPlayMs = 4500,
}: {
  slides: CarouselSlide[]
  onSelect: (slide: CarouselSlide) => void
  ariaLabel: string
  className?: string
  autoPlayMs?: number
}) {
  const [index, setIndex] = useState(0)
  const [drag, setDrag] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [reduce, setReduce] = useState(false)
  const startX = useRef<number | null>(null)
  const moved = useRef(false)

  useEffect(() => {
    setHidden(document.hidden)
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduce(motion.matches)
    const onVisibility = () => setHidden(document.hidden)
    const onMotion = () => setReduce(motion.matches)
    document.addEventListener('visibilitychange', onVisibility)
    motion.addEventListener('change', onMotion)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      motion.removeEventListener('change', onMotion)
    }
  }, [])

  useEffect(() => {
    if (hidden || reduce || dragging || slides.length < 2) return
    const timer = window.setTimeout(() => {
      setIndex((current) => (current + 1) % slides.length)
    }, autoPlayMs)
    return () => window.clearTimeout(timer)
  }, [index, hidden, reduce, dragging, slides.length, autoPlayMs])

  const go = (next: number) => {
    setIndex(((next % slides.length) + slides.length) % slides.length)
  }

  return (
    <section
      aria-label={ariaLabel}
      aria-roledescription="carousel"
      className={cn(
        'relative touch-pan-y overflow-hidden rounded-lg bg-card shadow-sm ring-1 ring-border-subtle',
        className,
      )}
      onPointerDown={(event) => {
        startX.current = event.clientX
        moved.current = false
        setDragging(true)
      }}
      onPointerMove={(event) => {
        if (startX.current === null) return
        const dx = event.clientX - startX.current
        if (Math.abs(dx) > 6) {
          moved.current = true
          event.currentTarget.setPointerCapture?.(event.pointerId)
        }
        setDrag(dx)
      }}
      onPointerUp={() => {
        if (startX.current === null) return
        if (drag <= -40) go(index + 1)
        else if (drag >= 40) go(index - 1)
        setDrag(0)
        setDragging(false)
        startX.current = null
      }}
      onPointerCancel={() => {
        startX.current = null
        setDrag(0)
        setDragging(false)
      }}
    >
      <div
        className={cn(
          'flex',
          !dragging &&
            'transition-transform duration-[var(--motion-slow)] ease-[var(--ease-standard)]',
        )}
        style={{ transform: `translateX(calc(${-index * 100}% + ${drag}px))` }}
      >
        {slides.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            aria-hidden={i !== index}
            tabIndex={i === index ? 0 : -1}
            onClick={() => {
              if (!moved.current) onSelect(slide)
            }}
            className="relative aspect-[2/1] w-full shrink-0 overflow-hidden bg-card text-left"
          >
            {slide.content ? (
              <>
                <div className="pointer-events-none absolute -top-10 -right-8 h-28 w-28 rounded-full border border-gold-200/60" />
                <div className="absolute inset-0 z-10 flex flex-col justify-between px-4 py-4 text-left">
                  {slide.content}
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex items-center gap-3 px-4">
                <div className="min-w-0 flex-1">
                  {slide.subtitle ? (
                    <div className="text-label text-gold-700">{slide.subtitle}</div>
                  ) : null}
                  <div className="line-clamp-2 text-card-title text-foreground">{slide.title}</div>
                  <div className="mt-2 text-label text-primary">立即查看 ›</div>
                </div>
                <div className="h-3/4 aspect-square shrink-0 overflow-hidden rounded-md bg-surface">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    loading={i === 0 ? 'eager' : 'lazy'}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="absolute right-4 bottom-4 z-10 flex items-center rounded-full bg-card/70 px-2 ring-1 ring-black/5 backdrop-blur">
        {slides.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => go(i)}
            aria-label={`第 ${i + 1} 张：${slide.title}`}
            aria-current={i === index}
            className="flex h-6 w-6 items-center justify-center"
          >
            <span
              className={cn(
                'block rounded-full transition-all duration-[var(--motion-fast)]',
                i === index ? 'h-2 w-2 bg-primary' : 'h-1.5 w-1.5 bg-ink-900/25',
              )}
            />
          </button>
        ))}
      </div>
    </section>
  )
}
