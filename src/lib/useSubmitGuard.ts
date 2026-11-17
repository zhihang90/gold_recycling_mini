import { useState } from 'react'

/**
 * 提交守卫：首次点击「下一步 / 计算」后才展示字段错误。
 * attempt(valid) 统一记录「已提交」并返回是否继续，reset() 在用户修改后收起错误。
 */
export function useSubmitGuard() {
  const [submitted, setSubmitted] = useState(false)

  return {
    submitted,
    attempt(valid: boolean) {
      setSubmitted(true)
      return valid
    },
    reset() {
      setSubmitted(false)
    },
  }
}
