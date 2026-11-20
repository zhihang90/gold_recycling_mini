import { STORAGE_KEYS } from "./keys"
import { isPhoneNumber, isIdCard } from '@/lib/validation'
import { readSession, removeSession, writeSession } from './storage'

export interface Member {
  phone: string
  loginAt: number
  /** 实名认证信息；缺失 = 未实名 */
  realNameAuth?: RealNameAuth
}

export interface RealNameAuth {
  name: string
  idNo: string
  verifiedAt: number
}

/** 人脸识别步骤的暂存信息：表单校验通过后写入，识别成功再落库 */
export interface PendingRealNameAuth {
  name: string
  idNo: string
  phone: string
}

export function savePendingRealNameAuth(auth: PendingRealNameAuth) {
  writeSession(STORAGE_KEYS.PENDING_AUTH, auth)
}

export function readPendingRealNameAuth(): PendingRealNameAuth | null {
  const auth = readSession<PendingRealNameAuth>(STORAGE_KEYS.PENDING_AUTH)
  return auth && auth.name && auth.idNo ? auth : null
}

export function clearPendingRealNameAuth() {
  removeSession(STORAGE_KEYS.PENDING_AUTH)
}

/** 登录态只保存在当前浏览器会话，刷新保留、关闭标签页后失效 */
export function readMember(): Member | null {
  const member = readSession<Member>(STORAGE_KEYS.MEMBER)
  return member && isPhoneNumber(member.phone) ? member : null
}

export function saveMember(phone: string) {
  writeSession(STORAGE_KEYS.MEMBER, { phone, loginAt: Date.now() })
}

export function clearMember() {
  removeSession(STORAGE_KEYS.MEMBER)
}

/** 是否已完成实名认证 */
export function isMemberVerified(member: Member | null): boolean {
  return !!member?.realNameAuth?.verifiedAt
}

/** 提交实名认证；姓名/身份证号都必须合法 */
export function submitRealNameAuth(name: string, idNo: string): Member {
  if (!name.trim() || name.trim().length < 2) throw new Error('请输入真实姓名')
  if (!isIdCard(idNo)) throw new Error('身份证号格式不正确')
  const member = readMember()
  if (!member) throw new Error('请先登录')
  const updated: Member = {
    ...member,
    realNameAuth: { name: name.trim(), idNo: idNo.trim(), verifiedAt: Date.now() },
  }
  writeSession(STORAGE_KEYS.MEMBER, updated)
  return updated
}

/** 注销实名认证（用于演示/回滚） */
export function revokeRealNameAuth() {
  const member = readMember()
  if (!member) return
  const { realNameAuth: _omit, ...rest } = member
  writeSession(STORAGE_KEYS.MEMBER, rest)
}

/** 个人中心展示用：保留前三后四，中间脱敏 */
export function maskPhone(phone: string) {
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`
}

/** 身份证号展示用：前 4 位 + 后 4 位，中间脱敏 */
export function maskIdCard(idNo: string) {
  if (idNo.length < 10) return idNo
  return `${idNo.slice(0, 4)}********${idNo.slice(-4)}`
}

/** 姓名展示用：保留首字，其余用 * 替代（陈智航 → 陈**） */
export function maskName(name: string) {
  if (name.length <= 1) return name
  return `${name.slice(0, 1)}${'*'.repeat(name.length - 1)}`
}
