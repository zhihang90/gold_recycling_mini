/** 表单字段的 aria-describedby 计算：与 FieldFrame 的提示/错误 id 约定保持一致 */
export function fieldDescribedBy(id: string, error?: string, hint?: string) {
  return error ? `${id}-error` : hint ? `${id}-hint` : undefined
}
