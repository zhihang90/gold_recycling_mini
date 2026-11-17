import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/**
 * 自定义字号 role（display/title/section/card-title/body/body-strong/label/caption/caption-strong）
 * 默认不在 tailwind-merge 的字号组里，会与 `text-primary` 等颜色类误判为同组而被丢弃。
 * 这里显式注册，保证 `cn('text-caption', 'text-primary')` 仍保留字号。
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
            'display',
            'title',
            'section',
            'card-title',
            'body',
            'body-strong',
            'label',
            'caption',
            'caption-strong',
          ],
        },
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
