import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

export interface GalleryImage {
  src: string
  alt: string
}

/** 与 --motion-slow / --ease-enter 保持一致 */
const DURATION = 320
const easeEnter = (t: number) => 1 - Math.pow(1 - t, 3)

/**
 * 横滑图库（原生滚动 + scroll-snap，无第三方轮播库）。
 * - 触摸滑动由浏览器负责吸附，鼠标拖拽与方向键走自定义补间
 * - 切换只做位移、不做缩放；右下角计数器指示当前位置
 * - 加载失败回退到第 1 张，不出现破图
 */
export function Gallery({
  images,
  className,
  label = '图片，左右滑动查看',
}: {
  images: GalleryImage[]
  className?: string
  label?: string
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<number | null>(null)
  const dragRef = useRef<{ x: number; left: number; moved: boolean } | null>(null)
  const [active, setActive] = useState(0)

  const stop = () => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    frameRef.current = null
  }

  useEffect(() => stop, [])

  const scrollTo = useCallback(
    (target: number) => {
      const el = trackRef.current
      if (!el) return
      const index = Math.min(Math.max(target, 0), images.length - 1)
      const to = index * el.clientWidth
      const from = el.scrollLeft
      stop()
      el.style.scrollSnapType = 'none'
      if (Math.abs(to - from) < 2) {
        el.scrollLeft = to
        el.style.scrollSnapType = ''
        setActive(index)
        return
      }
      const start = performance.now()
      const step = (now: number) => {
        const progress = Math.min((now - start) / DURATION, 1)
        el.scrollLeft = from + (to - from) * easeEnter(progress)
        if (progress < 1) {
          frameRef.current = requestAnimationFrame(step)
        } else {
          el.style.scrollSnapType = ''
          frameRef.current = null
          setActive(index)
        }
      }
      frameRef.current = requestAnimationFrame(step)
    },
    [images.length],
  )

  if (images.length === 0) return null

  return (
    <div className={cn('relative', className)}>
      <div
        ref={trackRef}
        tabIndex={0}
        role="group"
        aria-label={label}
        onScroll={(event) => {
          const el = event.currentTarget
          if (frameRef.current !== null) return
          setActive(Math.round(el.scrollLeft / el.clientWidth))
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
            event.preventDefault()
            scrollTo(active + (event.key === 'ArrowRight' ? 1 : -1))
          }
        }}
        onPointerDown={(event) => {
          if (event.pointerType !== 'mouse') return
          const el = event.currentTarget
          dragRef.current = { x: event.clientX, left: el.scrollLeft, moved: false }
          el.setPointerCapture(event.pointerId)
          el.style.scrollSnapType = 'none'
        }}
        onPointerMove={(event) => {
          const drag = dragRef.current
          if (!drag || event.pointerType !== 'mouse') return
          const distance = event.clientX - drag.x
          if (Math.abs(distance) > 4) drag.moved = true
          if (drag.moved) event.currentTarget.scrollLeft = drag.left - distance
        }}
        onPointerUp={(event) => {
          const drag = dragRef.current
          if (!drag) return
          dragRef.current = null
          event.currentTarget.style.scrollSnapType = ''
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId)
          }
          scrollTo(Math.round(event.currentTarget.scrollLeft / event.currentTarget.clientWidth))
        }}
        className="hide-scrollbar flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
      >
        {images.map((image, index) => (
          <div
            key={image.src}
            className="relative aspect-square w-full shrink-0 snap-center overflow-hidden bg-surface"
          >
            <img
              src={image.src}
              alt={image.alt}
              loading={index === 0 ? 'eager' : 'lazy'}
              draggable={false}
              onError={(event) => {
                const img = event.currentTarget
                if (index === 0 || img.dataset.fallback) return
                img.dataset.fallback = '1'
                img.src = images[0]!.src
              }}
              className="absolute inset-0 h-full w-full select-none object-cover"
            />
          </div>
        ))}
      </div>
      {images.length > 1 ? (
        <>
          <div className="pointer-events-none absolute right-2 bottom-2 rounded-full bg-foreground/55 px-2 py-0.5 text-caption-strong text-paper tabular">
            {active + 1}/{images.length}
          </div>
          <div
            className="absolute inset-x-0 bottom-1 flex items-center justify-center"
            onPointerDown={(event) => event.stopPropagation()}
          >
            {images.map((image, index) => (
              <button
                key={image.src}
                type="button"
                aria-label={`查看第 ${index + 1} 张图片`}
                aria-current={active === index ? 'true' : undefined}
                onClick={() => scrollTo(index)}
                className="flex h-5 w-5 items-center justify-center"
              >
                <span
                  className={cn(
                    'h-1.5 rounded-full transition-all',
                    active === index ? 'w-4 bg-gold-700' : 'w-1.5 bg-foreground/25',
                  )}
                />
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}
