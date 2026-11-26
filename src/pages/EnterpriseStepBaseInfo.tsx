import { Camera, ImageIcon, ShieldCheck, User } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  AgreementCheck,
  Button,
  Card,
  ConfirmDialog,
  DetailPage,
  EmptyState,
  EnterpriseKycStepPage,
  FormField,
  PhotoUploader,
  SelectField,
  TextLink,
  Toast,
} from '@/components'
import { useEnterpriseKyc } from '@/hooks/useEnterpriseKyc'
import { loginRedirectState, paths } from '@/routes/paths'

/** 营业执照 OCR 模拟结果：企业信息 + 法人信息自动带出 */
const MOCK_OCR_RESULT = {
  companyName: '安盛华黄金珠宝有限公司',
  creditCode: '91440300MA5D8X9X8X',
  companyType: '有限责任公司',
  capital: '500 万元',
  legalName: '张三',
  legalIdNo: '440300199001011234',
  legalPhone: '13800138000',
}

export function EnterpriseStepBaseInfoPage() {
  const navigate = useNavigate()
  const { member, draft, update, save, completedIndices } = useEnterpriseKyc({ seedMock: true })
  const [toast, setToast] = useState<string | null>(null)
  const [cameraDialogOpen, setCameraDialogOpen] = useState(false)

  // 返回直接回“我的”；face 步骤通过独立的人脸识别页完成，base-info "保存并下一步" 始终弹摄像头权限框 → 进入 face
  const prevPath = paths.me

  if (!member) {
    return (
      <DetailPage title="企业认证">
        <div className="px-4 pt-10">
          <EmptyState
            icon={ShieldCheck}
            title="请先登录"
            description="登录后可直接进行企业实名认证，无需先完成个人实名。"
            action={
              <Button onClick={() => navigate(paths.login, { state: loginRedirectState() })}>
                去登录
              </Button>
            }
          />
        </div>
      </DetailPage>
    )
  }

  const b = draft.baseInfo
  const l = draft.legal
  // 基础字段 + 证件照是否完整
  const baseComplete = Boolean(
    b.companyName?.trim() &&
    b.creditCode?.trim() &&
    b.legalName?.trim() &&
    b.legalIdNo?.trim() &&
    b.legalPhone?.trim() &&
    draft.license.front.length > 0 &&
    l.idFront.length > 0 &&
    l.idBack.length > 0 &&
    l.holdPhoto.length > 0,
  )
  // 3 份协议是否都勾选
  const agreementsChecked = Boolean(
    draft.agreements.customerId && draft.agreements.aml && draft.agreements.privacy,
  )

  const handleNext = () => {
    if (!baseComplete) {
      if (!draft.license.front.length) setToast('请先上传营业执照')
      else if (!b.companyName?.trim()) setToast('请填写企业名称')
      else if (!b.creditCode?.trim()) setToast('请填写统一社会信用代码')
      else if (!b.legalName?.trim()) setToast('请填写法人姓名')
      else if (!b.legalIdNo?.trim()) setToast('请填写法人身份证号')
      else if (!l.idFront.length) setToast('请上传法人身份证人像面')
      else if (!l.idBack.length) setToast('请上传法人身份证国徽面')
      else if (!l.holdPhoto.length) setToast('请上传手持身份证照片')
      else setToast('请补全必填信息')
      return
    }
    if (!agreementsChecked) {
      setToast('请先阅读并勾选三份协议')
      return
    }
    // 原型演示：始终弹摄像头权限框 → 进入人脸识别页，每一步都可演示
    setCameraDialogOpen(true)
  }

  const handleCameraAllow = () => {
    setCameraDialogOpen(false)
    // mock 预览数据在进入下一步时落库，后续步骤直接沿用
    save()
    // 进入企业法人人脸识别独立页面（带企业 KYC 进度条）
    navigate(paths.meEnterpriseFace, { replace: false })
  }

  const handleLicenseChange = (files: string[]) => {
    update('license', { front: files })
    // 模拟 OCR：首次上传且企业名为空 → 自动填充全部
    if (files.length > 0 && !b.companyName?.trim()) {
      update('baseInfo', {
        companyName: MOCK_OCR_RESULT.companyName,
        creditCode: MOCK_OCR_RESULT.creditCode,
        companyType: MOCK_OCR_RESULT.companyType,
        capital: MOCK_OCR_RESULT.capital,
        legalName: MOCK_OCR_RESULT.legalName,
        legalIdNo: MOCK_OCR_RESULT.legalIdNo,
        legalPhone: MOCK_OCR_RESULT.legalPhone,
      })
    }
  }

  const footer = (
    <div className="space-y-3">
      {/* 3 份协议合并为一个勾选框 */}
      <AgreementCheck
        checked={draft.agreements.customerId && draft.agreements.aml && draft.agreements.privacy}
        onChange={(v) => update('agreements', { customerId: v, aml: v, privacy: v })}
        shape="circle"
        align="center"
      >
        <span className="text-caption text-muted-foreground">
          我已阅读并同意
          <TextLink
            onClick={() => navigate(paths.meAgreementCustomerEnterprise)}
            inline
            className="text-caption text-link"
          >
            《企业客户身份识别协议》
          </TextLink>
          <TextLink
            onClick={() => navigate(paths.meAgreementAmlEnterprise)}
            inline
            className="text-caption text-link"
          >
            《反洗钱告知书》
          </TextLink>
          <TextLink
            onClick={() => navigate(paths.meAgreementPrivacyEnterprise)}
            inline
            className="text-caption text-link"
          >
            《信息使用授权书》
          </TextLink>
        </span>
      </AgreementCheck>

      <div className="flex gap-3">
        <Button variant="tertiary" size="lg" className="flex-1" onClick={() => navigate(prevPath)}>
          返回
        </Button>
        <Button size="lg" className="flex-[2]" onClick={handleNext}>
          保存并下一步
        </Button>
      </div>
    </div>
  )

  return (
    <>
      <EnterpriseKycStepPage step="base-info" completedIndices={completedIndices} footer={footer}>
        {/* 温馨提示：内容区最上方 */}
        <div className="rounded-lg bg-muted/60 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
          温馨提示：仅限珠宝、金银相关经营范围内的企业或个体工商户，详情请联系在线客服。
        </div>

        {/* 卡片 1：企业基本信息（营业执照 OCR + 企业字段） */}
        <Card padding="lg" className="space-y-4">
          <p className="text-body font-medium text-foreground flex items-center gap-1.5">
            <ImageIcon size={15} className="text-gold-600" />
            企业基本信息
          </p>

          {/* 大尺寸营业执照上传区 */}
          <PhotoUploader
            value={draft.license.front}
            onChange={handleLicenseChange}
            max={1}
            columns={1}
            aspect="wide"
            addLabel="点击上传营业执照"
            addIcon={ImageIcon}
            showCount={false}
            className="[&_button]:!h-[200px] [&_button]:!w-full [&_button]:!rounded-xl [&_button_svg]:!size-10 [&_button_span]:!text-sm"
          />

          <div className="h-px bg-border/60 -mx-1" />

          <div className="space-y-3">
            <FormField
              label="企业名称"
              required
              value={b.companyName}
              placeholder="OCR 自动识别或手动输入"
              onChange={(v) => update('baseInfo', { companyName: v })}
            />
            <FormField
              label="统一社会信用代码"
              required
              value={b.creditCode}
              placeholder="18 位统一社会信用代码"
              maxLength={18}
              onChange={(v) => update('baseInfo', { creditCode: v.toUpperCase() })}
            />
            <SelectField
              label="企业类型"
              value={b.companyType}
              placeholder="请选择企业类型（选填）"
              options={[
                { label: '有限责任公司', value: '有限责任公司' },
                { label: '股份有限公司', value: '股份有限公司' },
                { label: '个体工商户', value: '个体工商户' },
                { label: '合伙企业', value: '合伙企业' },
                { label: '外商投资企业', value: '外商投资企业' },
                { label: '国有企业', value: '国有企业' },
                { label: '其他', value: '其他' },
              ]}
              onChange={(v) => update('baseInfo', { companyType: v })}
            />
            <FormField
              label="注册资本"
              value={b.capital}
              placeholder="例如：人民币 100 万元（选填）"
              onChange={(v) => update('baseInfo', { capital: v })}
            />
          </div>
        </Card>

        {/* 卡片 2：法定代表人（证件 + 信息） */}
        <Card padding="lg" className="space-y-4">
          <p className="text-body font-medium text-foreground flex items-center gap-1.5">
            <User size={15} className="text-gold-600" />
            法定代表人
          </p>

          {/* 3 张证件照片一行 */}
          <div className="grid grid-cols-3 gap-2">
            <PhotoUploader
              value={l.idFront}
              onChange={(v) => update('legal', { idFront: v })}
              max={1}
              columns={1}
              aspect="wide"
              addLabel="人像面"
              showCount={false}
              className="[&_p]:hidden"
            />
            <PhotoUploader
              value={l.idBack}
              onChange={(v) => update('legal', { idBack: v })}
              max={1}
              columns={1}
              aspect="wide"
              addLabel="国徽面"
              showCount={false}
              className="[&_p]:hidden"
            />
            <PhotoUploader
              value={l.holdPhoto}
              onChange={(v) => update('legal', { holdPhoto: v })}
              max={1}
              columns={1}
              aspect="wide"
              addLabel="手持证"
              showCount={false}
              className="[&_p]:hidden"
            />
          </div>
          <p className="text-caption text-subtle-foreground">身份证人像面 / 国徽面 / 手持身份证</p>

          <div className="h-px bg-border/60 -mx-1" />

          <div className="space-y-3">
            <FormField
              label="姓名"
              required
              value={b.legalName}
              placeholder="OCR 自动识别或手动输入"
              onChange={(v) => update('baseInfo', { legalName: v })}
            />
            <FormField
              label="身份证号"
              required
              value={b.legalIdNo}
              placeholder="18 位身份证号"
              maxLength={18}
              onChange={(v) => update('baseInfo', { legalIdNo: v.toUpperCase() })}
            />
            <FormField
              label="手机号"
              required
              value={b.legalPhone}
              placeholder="11 位手机号"
              inputMode="numeric"
              maxLength={11}
              onChange={(v) => update('baseInfo', { legalPhone: v.replace(/\D/g, '') })}
            />
          </div>
        </Card>
      </EnterpriseKycStepPage>

      {/* 摄像头权限确认框 */}
      <ConfirmDialog
        open={cameraDialogOpen}
        title="需要调用摄像头"
        description="下一步将进入人脸识别页面，系统需要申请摄像头权限以完成法人人脸核验。"
        icon={<Camera className="text-gold-600" size={28} />}
        confirmText="允许"
        cancelText="暂不允许"
        onConfirm={handleCameraAllow}
        onClose={() => setCameraDialogOpen(false)}
      />

      <Toast open={!!toast} message={toast ?? ''} onClose={() => setToast(null)} />
    </>
  )
}
