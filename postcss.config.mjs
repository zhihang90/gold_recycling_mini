/**
 * Tailwind 4 会把全部规则包进 @layer（properties / theme / base / components / utilities）。
 * iOS < 15.4、Chromium < 99 不认 @layer，会整块丢弃 → 页面无样式。
 * 这里用 @csstools/postcss-cascade-layers 在构建期把层展开成普通规则（用 :not(#\#) 提升选择器权重模拟层序）。
 * 顺序：先展开层，再加厂商前缀。
 */
import cascadeLayers from '@csstools/postcss-cascade-layers'
import autoprefixer from 'autoprefixer'

export default {
  plugins: [cascadeLayers(), autoprefixer()],
}
