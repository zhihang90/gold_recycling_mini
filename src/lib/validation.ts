/** 表单校验纯函数：规则集中在这里，页面只负责何时展示错误。 */

/** 手机号：11 位，以 1 开头 */
export function isPhoneNumber(value: string) {
  if (!value) return false
  return /^1\d{10}$/.test(value)
}

/** 短信验证码：6 位数字 */
export function isSmsCode(value: string) {
  return /^\d{6}$/.test(value)
}

/** 预估重量（克）：必填，0.1–1000；返回错误文案，合法时返回 undefined */
export function validateWeight(value: string) {
  if (!value || value.trim() === '') return '请输入预估重量'
  const weight = Number(value)
  if (!Number.isFinite(weight) || weight <= 0 || weight > 1000) {
    return '请输入 0.1–1000 克之间的重量'
  }
  return undefined
}

/**
 * 中国大陆居民身份证号验证：
 * - 18 位：前 17 位数字 + 最后一位数字或 X
 * - 生日位 6 位必须是合法日期（如 19900101）
 * 不做精确的校验码算法，原型场景够用。
 */
export function isIdCard(value: string) {
  if (!value) return false
  const v = value.trim()
  if (!/^\d{17}[\dXx]$/.test(v)) return false
  const yyyy = Number(v.slice(6, 10))
  const mm = Number(v.slice(10, 12))
  const dd = Number(v.slice(12, 14))
  if (yyyy < 1900 || yyyy > new Date().getFullYear()) return false
  if (mm < 1 || mm > 12) return false
  const lastDay = new Date(yyyy, mm, 0).getDate()
  if (dd < 1 || dd > lastDay) return false
  return true
}
