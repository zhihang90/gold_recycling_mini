import { cn } from '@/lib/utils'

const RATIO = {
  square: 'aspect-square',
  wide: 'aspect-video',
  tall: 'aspect-4/3',
  card: 'aspect-square',
}

/**
 * 媒体图容器：固定宽高比 + lazy 加载 + 加载淡入 + 失败隐藏。
 * 图片放 public/ 下用相对路径引用；业务页只读图片映射表，不硬编码路径。
 */
export function MediaVisual({
  src,
  ratio = 'square',
  className,
  alt = '',
  priority = false,
}: {
  src: string
  ratio?: keyof typeof RATIO
  className?: string
  alt?: string
  priority?: boolean
}) {
  return (
    <div className={cn('relative overflow-hidden bg-surface', RATIO[ratio], className)}>
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-[var(--motion-fast)]"
        onLoad={(event) => {
          event.currentTarget.style.opacity = '1'
        }}
        onError={(event) => {
          event.currentTarget.style.opacity = '0'
        }}
      />
    </div>
  )
}
