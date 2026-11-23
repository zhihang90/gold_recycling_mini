import { DetailPage, AgreementCheck, Button, FormField, BrandMark, TextLink, Toast } from '@/components'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Scale } from 'lucide-react'

import { isPhoneNumber, isSmsCode } from '@/lib/validation'
import { saveMember } from '@/mocks/member'
import { paths } from '@/routes/paths'

/**
 * 登录：手机号 + 验证码单列表单，不使用微信授权。
 * 协议不默认勾选；登录成功后进入买金，不立刻要求实名。
 */
export function LoginPage() {
  const navigate = useNavigate()
  const [phone, setPhone] = useState('13800138000')
  const [phoneError, setPhoneError] = useState('')
  const [code, setCode] = useState('123456')
  const [codeError, setCodeError] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [hintVisible, setHintVisible] = useState(false)
  const [hintTick, setHintTick] = useState(0)
  const [countdown, setCountdown] = useState(0)
  /** 登录中：按钮转圈并禁用，避免重复提交 */
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown((seconds) => seconds - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  const handleSendCode = () => {
    if (!isPhoneNumber(phone)) {
      setPhoneError('请输入正确的 11 位手机号')
      return
    }
    setPhoneError('')
    setCodeError('')
    setCountdown(60)
  }

  const handleLogin = () => {
    let valid = true
    if (!agreed) {
      setHintVisible(true)
      setHintTick((tick) => tick + 1)
      valid = false
    }
    if (!isPhoneNumber(phone)) {
      setPhoneError('请输入正确的 11 位手机号')
      valid = false
    }
    if (!isSmsCode(code)) {
      setCodeError('请输入 6 位验证码')
      valid = false
    }
    if (!valid) return

    // 登录中：按钮转圈并禁用，避免重复提交
    setSubmitting(true)
    saveMember(phone)
    window.setTimeout(() => navigate(paths.buy, { replace: true }), 600)
  }

  return (
    <DetailPage header={false} padded={false} contentClassName="flex flex-1 flex-col px-4">
      <div className="flex flex-col items-center pb-8 pt-10">
        <BrandMark icon={Scale} />
        <h1 className="mt-3 text-section text-foreground">安盛华 黄金买卖平台</h1>
      </div>

      <form
        className="flex flex-1 flex-col"
        onSubmit={(event) => {
          event.preventDefault()
          handleLogin()
        }}
      >
        <div className="space-y-3">
          <FormField
            inline
            label="手机号"
            value={phone}
            onChange={(next) => {
              setPhone(next)
              if (phoneError) setPhoneError('')
            }}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={11}
            placeholder="请输入手机号"
            error={phoneError}
          />

          <FormField
            inline
            label="验证码"
            value={code}
            onChange={(next) => {
              setCode(next)
              if (codeError) setCodeError('')
            }}
            type="tel"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="请输入验证码"
            error={codeError}
            hint={countdown > 0 ? '验证码已发送，请注意查收' : undefined}
            trailing={
              <span className="flex w-20 justify-end">
                {countdown > 0 ? (
                  <span className="text-caption text-subtle-foreground tabular">
                    {countdown}s 后重发
                  </span>
                ) : (
                  <TextLink tone="primary" onClick={handleSendCode}>
                    获取验证码
                  </TextLink>
                )}
              </span>
            }
          />
        </div>

        <div className="mt-5">
          <AgreementCheck
            shape="circle"
            checked={agreed}
            onChange={(next) => {
              setAgreed(next)
              if (next) setHintVisible(false)
            }}
          >
            <span className="text-muted-foreground">
              我已阅读并同意
              <TextLink inline tone="link" onClick={() => navigate(paths.loginAgreementService)}>
                用户协议、
              </TextLink>
              <TextLink inline tone="link" onClick={() => navigate(paths.loginAgreementPrivacy)}>
                隐私政策
              </TextLink>{' '}
              未注册绑定的手机号验证成功后自动注册
            </span>
          </AgreementCheck>

          <Toast
            key={hintTick}
            open={hintVisible}
            message="请勾选同意用户协议和隐私协议"
            onClose={() => setHintVisible(false)}
          />
        </div>

        <div className="mt-6 space-y-3">
          <Button type="submit" size="lg" block loading={submitting}>
            登录
          </Button>
          <Button size="lg" variant="secondary" block onClick={() => navigate(paths.home)}>
            回到首页
          </Button>
        </div>
      </form>
    </DetailPage>
  )
}
