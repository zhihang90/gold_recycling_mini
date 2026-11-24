import { STORAGE_KEYS } from './keys'
import { isPhoneNumber, isIdCard } from '@/lib/validation'
import { readSession, removeSession, writeSession } from './storage'

/** 客户类型 */
export type CustomerType = 'individual' | 'enterprise'

/** KYC 审核状态（架构文档 §状态机） */
export type KycStatus =
  | 'draft' // 0 草稿
  | 'pending' // 1 待审核
  | 'reviewing' // 2 审核中
  | 'passed' // 3 已通过
  | 'rejected' // 4 已驳回
  | 'manual' // 5 人工审核中

/** 企业类型下拉选项 */
export const ENTERPRISE_TYPES = [
  '有限责任公司',
  '股份有限公司',
  '个体工商户',
  '合伙企业',
  '外商投资企业',
  '国有企业',
  '其他',
] as const

/** 企业基本信息（含法人信息，OCR 从营业执照自动识别） */
export interface EnterpriseBaseInfo {
  companyName: string
  creditCode: string // 统一社会信用代码 18 位
  licenseNo: string // 营业执照编号（三证合一已免填，保留字段兼容）
  companyType: string // 下拉选填
  capital: string // 注册资本 选填
  // 法定代表人（OCR 自动带出，可手动调整）
  legalName: string
  legalIdNo: string
  legalPhone: string
}

/** 营业执照照片 */
export interface EnterpriseLicensePhotos {
  front: string[] // 必填，正面
  back: string[] // 选填，反面
}

/** 法定代表人信息（保留字段，兼容旧代码；已合进 base-info 页） */
export interface EnterpriseLegalPerson {
  name: string
  idNo: string
  phone: string
  idFront: string[]
  idBack: string[]
  holdPhoto: string[]
  faceVerified: boolean
  faceScore?: number
}

/** 对公银行账户 */
export interface EnterpriseBankAccount {
  bankName: string // 开户行名称（含支行）
  accountNo: string // 对公账号
  /** 打款验证状态 */
  verifyStatus: 'pending' | 'waiting' | 'verified' | 'failed'
  /** 系统打出的金额（发起打款时后端返回） */
  verifyAmount?: number
  /** 用户输入的确认金额 */
  userAmount?: number
}

/** 企业客户完整 KYC 信息 */
export interface EnterpriseKyc {
  baseInfo: EnterpriseBaseInfo
  license: EnterpriseLicensePhotos
  legal: EnterpriseLegalPerson
  bank: EnterpriseBankAccount
  /** 3 份协议勾选 */
  agreements: {
    customerId: boolean
    aml: boolean
    privacy: boolean
  }
}

/** 扩展后的 Member：兼容已有 realNameAuth + 新增企业客户字段 */
export interface Member {
  phone: string
  loginAt: number
  /** 用户昵称；未设置时展示默认昵称 */
  nickname?: string
  /** 客户类型；缺失或 individual = 个人 */
  customerType?: CustomerType
  /** 个人实名认证信息 */
  realNameAuth?: RealNameAuth
  /** 企业客户 KYC 信息 */
  enterpriseKyc?: EnterpriseKyc
  /** KYC 审核状态 */
  kycStatus?: KycStatus
  /** 审核备注（驳回原因等） */
  kycRemark?: string
  /** 提交时间 */
  kycSubmitAt?: number
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

/* ========== 存取层 ========== */

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

/** 演示预填：个人实名快速展示 */
export const DEMO_REAL_NAME = {
  name: '陈智航',
  idNo: '440300199001011234',
  photos: {
    front: ['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600'],
    back: ['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600'],
  },
}

/** 登录态只保存在当前浏览器会话，刷新保留、关闭标签页后失效 */
export function readMember(): Member | null {
  const member = readSession<Member>(STORAGE_KEYS.MEMBER)
  return member && isPhoneNumber(member.phone) ? member : null
}
export function saveMember(phone: string) {
  // Demo 用户：登录即 seed 个人实名认证已通过 + 企业认证预填草稿（Me 页面才会出现企业认证入口卡）
  if (phone === '13800138000') {
    const existing = readSession<Member>(STORAGE_KEYS.MEMBER) as Member | null
    const base: Member = {
      phone,
      loginAt: Date.now(),
    }
    if (!existing?.realNameAuth?.verifiedAt) {
      base.realNameAuth = {
        name: DEMO_REAL_NAME.name,
        idNo: DEMO_REAL_NAME.idNo,
        verifiedAt: Date.now() - 86400000,
      }
    } else {
      base.realNameAuth = existing.realNameAuth
    }
    // 种子企业 KYC 预填草稿（所有步骤已填但未提交）
    if (!existing?.enterpriseKyc) {
      base.enterpriseKyc = withEnterpriseMock(null)
      base.kycStatus = 'draft'
    } else {
      base.enterpriseKyc = existing.enterpriseKyc
      base.kycStatus = existing.kycStatus
    }
    base.customerType = existing?.customerType ?? 'individual'
    writeSession(STORAGE_KEYS.MEMBER, base)
    return
  }
  writeSession(STORAGE_KEYS.MEMBER, { phone, loginAt: Date.now() })
}
export function clearMember() {
  // 原型 demo：退出登录时清掉所有 sessionStorage，下一次登录就是干净状态
  sessionStorage.clear()
}

export type EnterpriseAuthStatus = KycStatus | 'unstarted'

/** 企业认证状态与个人实名分开判断，兼容早期仅有企业草稿的登录数据。 */
export function getEnterpriseAuthStatus(member: Member | null): EnterpriseAuthStatus {
  if (member?.customerType === 'enterprise') return member.kycStatus ?? 'draft'
  return member?.enterpriseKyc ? 'draft' : 'unstarted'
}

/** 个人实名或企业认证任一通过，即已完成平台客户身份识别。 */
export function isMemberVerified(member: Member | null): boolean {
  return Boolean(
    member?.realNameAuth?.verifiedAt ||
    (member?.customerType === 'enterprise' && member.kycStatus === 'passed'),
  )
}

/** 提交个人实名：不修改企业认证类型与审核状态。 */
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

/** 提交企业 KYC：状态机进入 pending，架构文档规定企业一律转人工 */
export function submitEnterpriseKyc(kyc: EnterpriseKyc): Member {
  // 基础校验
  if (!kyc.baseInfo.companyName?.trim()) throw new Error('请输入企业名称')
  if (!/^[0-9A-HJ-NPQRTUWXY]{18}$/i.test(kyc.baseInfo.creditCode))
    throw new Error('统一社会信用代码格式不正确')
  if (!kyc.legal.faceVerified) throw new Error('请完成法人人脸核验')
  if (kyc.license.front.length === 0) throw new Error('请上传营业执照正面')
  if (kyc.bank.verifyStatus !== 'verified') throw new Error('请完成对公账户打款验证')
  if (!(kyc.agreements.customerId && kyc.agreements.aml && kyc.agreements.privacy)) {
    throw new Error('请勾选全部协议')
  }

  const member = readMember()
  if (!member) throw new Error('请先登录')

  // 打款验证完成即视为整条企业认证流程通过
  const updated: Member = {
    ...member,
    customerType: 'enterprise',
    enterpriseKyc: kyc,
    kycStatus: 'passed',
    kycSubmitAt: Date.now(),
    kycRemark: '企业认证已通过',
  }
  writeSession(STORAGE_KEYS.MEMBER, updated)
  return updated
}

/** 读取当前登录用户的企业 KYC 草稿（含已提交的最终版） */
export function readEnterpriseKyc(): EnterpriseKyc | null {
  const member = readMember()
  if (member?.enterpriseKyc) return member.enterpriseKyc
  // Demo 用户首次进企业认证：自动 seed 预填，省去演示重新登录
  if (member?.phone === '13800138000') {
    // 写回 session，后续直接命中缓存；企业认证不依赖个人实名状态
    const enterpriseKyc = withEnterpriseMock(null)
    const seeded: Member = {
      ...member,
      enterpriseKyc,
      kycStatus: member.customerType === 'enterprise' ? (member.kycStatus ?? 'draft') : 'draft',
      customerType: member.customerType ?? 'individual',
    }
    writeSession(STORAGE_KEYS.MEMBER, seeded)
    return enterpriseKyc
  }
  return null
}

/** 更新企业 KYC 草稿（暂存功能） */
export function saveEnterpriseKycDraft(kyc: EnterpriseKyc): Member {
  const member = readMember()
  if (!member) throw new Error('请先登录')
  const updated: Member = {
    ...member,
    customerType: 'enterprise',
    enterpriseKyc: kyc,
    kycStatus: member.customerType === 'enterprise' ? (member.kycStatus ?? 'draft') : 'draft',
  }
  writeSession(STORAGE_KEYS.MEMBER, updated)
  return updated
}

/** 对公账户打款：更新 bank.verifyStatus + verifyAmount */
export function markBankTransferSent(amount: number): Member {
  const member = readMember()
  if (!member?.enterpriseKyc) throw new Error('未找到企业 KYC 信息')
  const updated: Member = {
    ...member,
    enterpriseKyc: {
      ...member.enterpriseKyc,
      bank: { ...member.enterpriseKyc.bank, verifyStatus: 'waiting', verifyAmount: amount },
    },
  }
  writeSession(STORAGE_KEYS.MEMBER, updated)
  return updated
}

/** 对公账户打款确认金额：更新为 verified */
export function markBankTransferVerified(): Member {
  const member = readMember()
  if (!member?.enterpriseKyc) throw new Error('未找到企业 KYC 信息')
  const updated: Member = {
    ...member,
    enterpriseKyc: {
      ...member.enterpriseKyc,
      bank: { ...member.enterpriseKyc.bank, verifyStatus: 'verified' },
    },
  }
  writeSession(STORAGE_KEYS.MEMBER, updated)
  return updated
}

/** 注销个人实名（用于演示/回滚），不影响企业认证草稿与审核状态。 */
export function revokeRealNameAuth() {
  const member = readMember()
  if (!member) return
  const updated = { ...member }
  delete updated.realNameAuth
  writeSession(STORAGE_KEYS.MEMBER, updated)
}

/** 昵称展示：未设置时按手机尾号生成默认昵称 */
export function readNickname(member: Member | null): string {
  if (!member) return ''
  return member.nickname || `黄金用户 ${member.phone.slice(-4)}`
}

/** 修改昵称：1-12 个字符，去掉首尾空格后保存 */
export function saveNickname(nickname: string): Member {
  const name = nickname.trim()
  if (!name) throw new Error('请输入昵称')
  if (name.length > 12) throw new Error('昵称最多 12 个字符')
  const member = readMember()
  if (!member) throw new Error('请先登录')
  const updated: Member = { ...member, nickname: name }
  writeSession(STORAGE_KEYS.MEMBER, updated)
  return updated
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

/* ========== 企业 KYC 默认草稿 ========== */

export function emptyEnterpriseKyc(): EnterpriseKyc {
  return {
    baseInfo: {
      companyName: '',
      creditCode: '',
      licenseNo: '',
      companyType: '',
      capital: '',
      legalName: '',
      legalIdNo: '',
      legalPhone: '',
    },
    license: { front: [], back: [] },
    legal: {
      name: '',
      idNo: '',
      phone: '',
      idFront: [],
      idBack: [],
      holdPhoto: [],
      faceVerified: false,
    },
    bank: {
      bankName: '',
      accountNo: '',
      verifyStatus: 'pending',
    },
    agreements: { customerId: false, aml: false, privacy: false },
  }
}

/** 演示预填：直接进入企业认证页面时展示，避免空白表单 */
export const MOCK_ENTERPRISE_KYC: EnterpriseKyc = {
  baseInfo: {
    companyName: '安盛华黄金珠宝有限公司',
    creditCode: '91440300MA5D8X9X8X',
    licenseNo: '',
    companyType: '有限责任公司',
    capital: '500 万元',
    legalName: '陈智航',
    legalIdNo: '440300199001011234',
    legalPhone: '13800138000',
  },
  license: {
    front: ['https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600'],
    back: [],
  },
  legal: {
    name: '陈智航',
    idNo: '440300199001011234',
    phone: '13800138000',
    idFront: ['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600'],
    idBack: ['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600'],
    holdPhoto: ['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600'],
    faceVerified: false, // 人脸未核验 → 停在 legal 步
  },
  bank: {
    bankName: '中国工商银行深圳福田支行',
    accountNo: '4000023409200078901',
    verifyStatus: 'pending',
  },
  agreements: { customerId: false, aml: false, privacy: false },
}

/**
 * 直接进入企业认证页面时的 mock 兜底：只补齐空白区块，已有数据优先。
 * 用于开发/领导免填表预览页面，不会覆盖流程中已填写的内容。
 */
export function withEnterpriseMock(current: EnterpriseKyc | null): EnterpriseKyc {
  const mock = MOCK_ENTERPRISE_KYC
  if (!current) {
    return {
      baseInfo: { ...mock.baseInfo },
      license: { front: [...mock.license.front], back: [...mock.license.back] },
      legal: {
        ...mock.legal,
        idFront: [...mock.legal.idFront],
        idBack: [...mock.legal.idBack],
        holdPhoto: [...mock.legal.holdPhoto],
      },
      bank: { ...mock.bank },
      agreements: { ...mock.agreements },
    }
  }
  return {
    baseInfo: current.baseInfo?.companyName?.trim() ? current.baseInfo : mock.baseInfo,
    license: current.license?.front.length ? current.license : mock.license,
    legal: current.legal?.idFront.length
      ? current.legal
      : { ...mock.legal, faceVerified: current.legal?.faceVerified ?? false },
    bank: current.bank?.bankName?.trim() ? current.bank : mock.bank,
    agreements: current.agreements ?? mock.agreements,
  }
}
