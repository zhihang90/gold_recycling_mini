/** 表单校验纯函数：规则集中在这里，页面只负责何时展示错误。 */

/** 手机号：11 位，以 1 开头 */
export function isPhoneNumber(value: string) {
  return /^1\d{10}$/.test(value)
}

/** 短信验证码：6 位数字 */
export function isSmsCode(value: string) {
  return /^\d{6}$/.test(value)
}

/** 预估重量（克）：必填，0.1–1000；返回错误文案，合法时返回 undefined */
export function validateWeight(value: string) {
  if (value.trim() === '') return '请输入预估重量'
  const weight = Number(value)
  if (!Number.isFinite(weight) || weight <= 0 || weight > 1000) {
    return '请输入 0.1–1000 克之间的重量'
  }
  return undefined
}
