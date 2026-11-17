/** 原型本地会话存储：统一读写与异常兜底，隐私模式下降级为内存态。 */
export function readSession<T>(key: string): T | null {
  try {
    const raw = window.sessionStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function writeSession(key: string, value: unknown) {
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value))
  } catch {
    // 隐私模式下 storage 可能不可用，原型降级为内存态即可
  }
}

export function removeSession(key: string) {
  try {
    window.sessionStorage.removeItem(key)
  } catch {
    // 同上
  }
}
