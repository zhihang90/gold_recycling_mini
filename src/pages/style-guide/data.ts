/** 组件库样张的演示数据：只被 style-guide 下的样张页引用 */
import { images } from '@/assets/images'

export const RED = [
  { name: 'red-50', className: 'bg-red-50' },
  { name: 'red-100', className: 'bg-red-100' },
  { name: 'red-300', className: 'bg-red-300' },
  { name: 'red-500', className: 'bg-red-500' },
  { name: 'red-600', className: 'bg-red-600' },
  { name: 'red-700', className: 'bg-red-700' },
  { name: 'red-900', className: 'bg-red-900' },
]

export const GOLD = [
  { name: 'gold-100', className: 'bg-gold-100' },
  { name: 'gold-300', className: 'bg-gold-300' },
  { name: 'gold-500', className: 'bg-gold-500' },
  { name: 'gold-700', className: 'bg-gold-700' },
]

export const INK = [
  { name: 'ink-900', className: 'bg-ink-900' },
  { name: 'ink-500', className: 'bg-ink-500' },
  { name: 'ink-400', className: 'bg-ink-400' },
  { name: 'line', className: 'bg-line' },
]

export const TYPE_SCALE = [
  { role: 'display 36', sample: '¥ 1,286.50', className: 'text-display tabular' },
  { role: 'title 28', sample: '今日回收价', className: 'text-title' },
  { role: 'section 21', sample: '检测流程', className: 'text-section' },
  { role: 'card-title 16', sample: '足金 999 手镯', className: 'text-card-title' },
  { role: 'body 14', sample: '按实测克重结算，服务费单独列示', className: 'text-body' },
  { role: 'caption 12', sample: '数据为演示样例，不接真实接口', className: 'text-caption' },
]

export const CHECKS = [
  { label: '@layer 展开', value: '已处理', tone: 'success' as const },
  { label: 'dvh / vh 兜底', value: '已处理', tone: 'success' as const },
  { label: '发版缓存', value: '已处理', tone: 'success' as const },
  { label: '真机微信', value: '未验证', tone: 'warning' as const },
]

export const ASSAY_IMAGES = [images.sampleRing, images.sampleBracelet, images.sampleBar]
