import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CircleCheck, ScanLine, TriangleAlert } from 'lucide-react'

import {
  Button,
  Card,
  ConfirmDialog,
  DetailPage,
  FormField,
  IconButton,
  PickerSheet,
  Toast,
} from '@/components'
import {
  BANK_CITY_OPTIONS,
  MAX_BANK_ACCOUNTS,
  RECOMMENDED_BANKS,
  addBankAccount,
  detectBank,
  formatCardNo,
  readBankAccounts,
} from '@/mocks/bankAccounts'
import { readMember } from '@/mocks/member'
import { paths } from '@/routes/paths'
import { cn } from '@/lib/utils'

/** 演示用卡号：6222 02 开头可被识别为工商银行 */
const DEMO_CARD_NO = '6222021234567890'

/**
 * 添加银行卡：姓名取实名信息只读，卡号自动识别发卡行，开户城市走底部选择器。
 * 提交成功后弹「添加成功」，回列表页由列表负责展示与删除。
 */
export function BankCardFormPage() {
  const navigate = useNavigate()
  const member = readMember()

  const [cardNo, setCardNo] = useState('')
  const [bank, setBank] = useState('')
  const [city, setCity] = useState('')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [codeCountdown, setCodeCountdown] = useState(0)
  const [cityOpen, setCityOpen] = useState(false)
  const [tipOpen, setTipOpen] = useState(true)
  const [tipSeconds, setTipSeconds] = useState(3)
  const [successOpen, setSuccessOpen] = useState(false)
  /** 提交中：按钮转圈并禁用，避免重复添加 */
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const holder = member?.realNameAuth?.name ?? '陈智航'
  const full = readBankAccounts().length >= MAX_BANK_ACCOUNTS

  useEffect(() => {
    if (!tipOpen || tipSeconds === 0) return
    const timer = window.setTimeout(() => setTipSeconds((value) => value - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [tipOpen, tipSeconds])

  // 验证码倒计时
  useEffect(() => {
    if (codeCountdown <= 0) return
    const timer = window.setTimeout(() => setCodeCountdown((v) => v - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [codeCountdown])

  const handleCardNo = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 19)
    setCardNo(digits)
    const detected = detectBank(digits)
    if (detected) setBank(detected)
  }

  const handleScan = () => {
    setCardNo(DEMO_CARD_NO)
    setBank(detectBank(DEMO_CARD_NO))
    setToast('已识别银行卡号，请核对信息')
  }

  const validPhone = /^1[3-9]\d{9}$/.test(phone)
  const valid =
    cardNo.length >= 16 && cardNo.length <= 19 && !!bank && !!city && validPhone && code.length === 6

  const handleSendCode = () => {
    if (!validPhone) {
      setToast('请输入正确的手机号')
      return
    }
    setCodeSent(true)
    setCodeCountdown(60)
    setToast(`验证码已发送至 ${phone}`)
  }

  const handleSubmit = () => {
    if (full) {
      setToast(`最多可添加 ${MAX_BANK_ACCOUNTS} 张银行卡`)
      return
    }
    // 提交中：按钮转圈并禁用，避免重复添加
    setSubmitting(true)
    addBankAccount({ holder, cardNo, bank, city })
    window.setTimeout(() => {
      setSubmitting(false)
      setSuccessOpen(true)
    }, 500)
  }

  return (
    <>
      <DetailPage
        title="添加银行卡"
        footer={
          <Button size="lg" block loading={submitting} disabled={!valid} onClick={handleSubmit}>
            确定
          </Button>
        }
      >
        <Card padding="lg" className="space-y-3">
          <FormField label="姓名" value={holder} readOnly hint="开户人须与实名认证信息一致" />
          <FormField
            label="银行卡号"
            value={formatCardNo(cardNo)}
            onChange={handleCardNo}
            inputMode="numeric"
            placeholder="请输入本人银行卡号"
            trailing={<IconButton icon={ScanLine} label="识别银行卡" onClick={handleScan} />}
          />
          <FormField
            label="银行名称"
            value={bank}
            onChange={setBank}
            placeholder="输入卡号后自动识别"
          />

          <div>
            <p className="text-caption text-muted-foreground">开户城市</p>
            <button
              type="button"
              onClick={() => setCityOpen(true)}
              className="mt-1 flex h-11 w-full items-center justify-between gap-3 rounded-sm bg-card px-3 text-left ring-1 ring-border transition active:bg-surface-2"
            >
              <span className={cn('text-body', city ? 'text-foreground' : 'text-subtle-foreground')}>
                {city || '请选择开户城市'}
              </span>
              <span className="text-body text-icon-muted">选择</span>
            </button>
          </div>

          <FormField
            label="银行预留手机号"
            value={phone}
            onChange={(v) => setPhone(v.replace(/\D/g, '').slice(0, 11))}
            inputMode="numeric"
            placeholder="请输入手机号"
            error={phone.length > 0 && !validPhone ? '请输入正确的手机号' : undefined}
          />

          <FormField
            label="验证码"
            value={code}
            onChange={(v) => setCode(v.replace(/\D/g, '').slice(0, 6))}
            inputMode="numeric"
            placeholder="请输入"
            trailing={
              <button
                type="button"
                disabled={codeCountdown > 0}
                onClick={handleSendCode}
                className="shrink-0 rounded-sm bg-primary px-3 py-1.5 text-caption text-primary-foreground transition active:bg-primary-active disabled:bg-muted disabled:text-muted-foreground"
              >
                {codeCountdown > 0 ? `${codeCountdown}s 后重发` : '获取验证码'}
              </button>
            }
          />

          <p className="text-caption text-subtle-foreground">* 建议使用国有六大行或九大商业银行</p>
        </Card>

        <Card padding="lg" className="space-y-3">
          <p className="text-body-strong text-foreground">建议使用以下银行</p>
          <div className="grid grid-cols-2 gap-2">
            {RECOMMENDED_BANKS.map((name) => {
              const selected = bank === name
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setBank(name)}
                  className={cn(
                    'flex min-h-11 items-center justify-center rounded-sm px-2 text-body transition',
                    selected
                      ? 'bg-primary-soft text-primary-active ring-1 ring-primary-border'
                      : 'text-foreground ring-1 ring-border active:bg-surface-2',
                  )}
                >
                  {name}
                </button>
              )
            })}
          </div>
        </Card>
      </DetailPage>

      <PickerSheet
        open={cityOpen}
        onClose={() => setCityOpen(false)}
        title="选择开户城市"
        options={BANK_CITY_OPTIONS}
        value={city}
        onConfirm={setCity}
      />

      <ConfirmDialog
        open={tipOpen}
        icon={
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/10 text-warning">
            <TriangleAlert size={24} aria-hidden="true" />
          </span>
        }
        title="温馨提示"
        description="请使用本人一类储蓄卡收款。若使用二类卡，单日入账可能受 1 万元限额影响，导致大额回收款需要分多日到账。"
        confirmOnly
        confirmText={tipSeconds > 0 ? `我知道了（${tipSeconds}s）` : '我知道了'}
        confirmDisabled={tipSeconds > 0}
        onConfirm={() => setTipOpen(false)}
        onClose={() => setTipOpen(false)}
      />

      <ConfirmDialog
        open={successOpen}
        icon={
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
            <CircleCheck size={26} aria-hidden="true" />
          </span>
        }
        title="添加成功"
        description="您已成功添加银行卡，回收款将默认打入该账户。"
        confirmOnly
        confirmText="我知道了"
        onConfirm={() => navigate(paths.meAccounts, { replace: true })}
        onClose={() => navigate(paths.meAccounts, { replace: true })}
      />

      <Toast open={!!toast} message={toast ?? ''} onClose={() => setToast(null)} />
    </>
  )
}
