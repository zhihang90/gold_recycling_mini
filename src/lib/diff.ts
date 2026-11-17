/**
 * 差异显著判定。
 *
 * 阈值默认 5%，是**可配置假设值，待产品最终确认**；如需调整只改这里，
 * 不要在页面或组件里分散写 0.05 / 5 / 1.05 之类的魔法数字。
 *
 * 约定：`CompareRows` 自身不内置阈值、不做比较，是否高亮由页面用本函数
 * 算出 `highlight` 后传入，保证展示层无业务规则。
 */
export const DEFAULT_DIFF_THRESHOLD = 0.05

export function isSignificantDiff(
  estimated: number | null | undefined,
  actual: number | null | undefined,
  threshold: number = DEFAULT_DIFF_THRESHOLD,
): boolean {
  if (typeof estimated !== 'number' || typeof actual !== 'number') return false
  if (!Number.isFinite(estimated) || !Number.isFinite(actual)) return false
  if (estimated === 0) return actual !== 0
  return Math.abs(actual - estimated) / Math.abs(estimated) >= threshold
}
