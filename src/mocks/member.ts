import { isPhoneNumber } from '@/lib/validation'
import { readSession, removeSession, writeSession } from './storage'

const MEMBER_KEY = 'gold-recycling.member'

export interface Member {
  phone: string
  loginAt: number
}

/** 登录态只保存在当前浏览器会话，刷新保留、关闭标签页后失效 */
export function readMember(): Member | null {
  const member = readSession<Member>(MEMBER_KEY)
  return member && isPhoneNumber(member.phone) ? member : null
}

export function saveMember(phone: string) {
  writeSession(MEMBER_KEY, { phone, loginAt: Date.now() })
}

export function clearMember() {
  removeSession(MEMBER_KEY)
}

/** 个人中心展示用：保留前三后四，中间脱敏 */
export function maskPhone(phone: string) {
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`
}
