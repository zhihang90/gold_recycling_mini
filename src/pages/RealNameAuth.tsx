import {
  BrandMark,
  BottomSheet,
  Button,
  Card,
  DetailPage,
  FormField,
  PhotoUploader,
} from '@/components'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Landmark, ScanFace, ShieldCheck } from 'lucide-react'
import { images } from '@/assets/images'
import { readMember, saveMember, savePendingRealNameAuth } from '@/mocks/member'
import { paths } from '@/routes/paths'

type AuthErrors = {
  photos?: string
  name?: string
  idNo?: string
}

/** 演示预填：进入即带好表单与证件照，方便快速走完认证流程 */
const MOCK_AUTH = {
  name: '陈智航',
  idNo: '440300199001011234',
}

/** 演示直达且未登录时用于建立会话的手机号 */
const DEMO_PHONE = '13800138000'

/** 实名认证第一步：填写信息；校验通过后进入人脸识别 */
export function RealNameAuthPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  /** 从确认订单进入时带上回跳地址；其余来源人脸识别完成后回个人中心 */
  const redirect = searchParams.get('redirect')

  // 进入第二步时把回跳地址一并带过去，识别成功后再跳来源页
  const facePath = redirect
    ? `${paths.meAuthFace}?redirect=${encodeURIComponent(redirect)}`
    : paths.meAuthFace

  return <AuthFlow onContinue={() => navigate(facePath)} />
}

function AuthFlow({ onContinue }: { onContinue: () => void }) {
  const member = readMember()
  const saved = member?.realNameAuth
  const [idFront, setIdFront] = useState<string[]>([images.idCardFront])
  const [idBack, setIdBack] = useState<string[]>([images.idCardBack])
  const [name, setName] = useState(saved?.name ?? MOCK_AUTH.name)
  const [idNo, setIdNo] = useState(saved?.idNo ?? MOCK_AUTH.idNo)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<AuthErrors>({})
  /** 表单通过后先弹半屏确认，再进入人脸识别 */
  const [confirmOpen, setConfirmOpen] = useState(false)

  const nameValid = name.trim().length >= 2
  const idValid = /^\d{17}[\dXx]$/.test(idNo.trim())

  const handleSubmit = () => {
    const next: AuthErrors = {
      photos: idFront.length > 0 && idBack.length > 0 ? undefined : '请上传身份证人像面与国徽面',
      name: nameValid ? undefined : '请输入真实姓名（至少 2 个字符）',
      idNo: idValid ? undefined : '请输入正确的 18 位身份证号',
    }
    setErrors(next)
    if (Object.values(next).some(Boolean)) return

    setSubmitting(true)
    window.setTimeout(() => {
      // 演示直达可能没有登录态：建立会话后认证结果才能落库
      if (!readMember()) saveMember(DEMO_PHONE)
      savePendingRealNameAuth({
        name: name.trim(),
        idNo: idNo.trim().toUpperCase(),
        phone: readMember()?.phone ?? DEMO_PHONE,
      })
      // 关闭按钮 loading，弹出半屏确认
      setSubmitting(false)
      setConfirmOpen(true)
    }, 600)
  }

  return (
    <DetailPage
      title="实名认证"
      footer={
        <Button size="lg" block loading={submitting} onClick={handleSubmit}>
          提交认证
        </Button>
      }
    >
      <Card padding="md">
        <div className="flex items-start gap-3">
          <BrandMark icon={ShieldCheck} size="sm" />
          <div className="min-w-0 flex-1">
            <h2 className="text-card-title text-foreground">为什么要实名认证</h2>
            <p className="mt-1 text-caption text-subtle-foreground">监管要求 · 安全交易</p>
          </div>
        </div>
        <p className="mt-3 text-body leading-relaxed text-muted-foreground">
          根据《贵金属和宝石从业机构反洗钱管理办法》及《移动互联网应用程序信息服务管理规定》，
          贵金属交易需履行反洗钱义务，按“后台实名、前台自愿”原则，对您进行真实身份信息核验。
        </p>
      </Card>

      <Card padding="md">
        <h2 className="text-card-title text-foreground">上传身份证照片</h2>
        <p className="mt-1 text-caption text-muted-foreground">
          拍摄时保证证件四角完整、文字清晰，避免反光与遮挡。
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <PhotoUploader
              value={idFront}
              onChange={(next) => {
                setIdFront(next)
                setErrors((prev) => ({ ...prev, photos: undefined }))
              }}
              max={1}
              columns={1}
              aspect="wide"
              showCount={false}
              addLabel="点击上传"
              addIcon={ScanFace}
            />
            <p className="text-center text-caption text-muted-foreground">人像面</p>
          </div>
          <div className="space-y-1.5">
            <PhotoUploader
              value={idBack}
              onChange={(next) => {
                setIdBack(next)
                setErrors((prev) => ({ ...prev, photos: undefined }))
              }}
              max={1}
              columns={1}
              aspect="wide"
              showCount={false}
              addLabel="点击上传"
              addIcon={Landmark}
            />
            <p className="text-center text-caption text-muted-foreground">国徽面</p>
          </div>
        </div>
        {errors.photos ? (
          <p className="mt-2 text-caption text-destructive">{errors.photos}</p>
        ) : null}
      </Card>

      <Card padding="md">
        <h2 className="mb-4 text-card-title text-foreground">填写实名信息</h2>
        <div className="space-y-4">
          <FormField
            label="真实姓名"
            placeholder="请输入身份证上的姓名"
            value={name}
            onChange={(value) => {
              setName(value)
              setErrors((prev) => ({ ...prev, name: undefined }))
            }}
            maxLength={20}
            autoComplete="name"
            required
            disabled={submitting}
            hideLabel
            error={errors.name}
          />
          <FormField
            label="身份证号"
            placeholder="请输入 18 位身份证号"
            value={idNo}
            onChange={(value) => {
              setIdNo(value.toUpperCase())
              setErrors((prev) => ({ ...prev, idNo: undefined }))
            }}
            maxLength={18}
            inputMode="text"
            autoComplete="off"
            required
            disabled={submitting}
            hideLabel
            error={errors.idNo}
          />
        </div>
      </Card>

      <BottomSheet
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="实名认证"
      >
        <div className="pt-4 pb-[calc(16px+env(safe-area-inset-bottom))] text-center">
          <ScanFace size={72} strokeWidth={1.3} className="mx-auto text-gold-500" aria-hidden="true" />
          <p className="mt-5 text-card-title text-foreground">请确认是收款本人认证</p>
          <p className="mt-3 text-caption leading-relaxed text-subtle-foreground">
            根据国家相关政策法规要求，贵金属购买和回收需用户实名登记；安盛华平台已获得
            ISO《隐私信息管理体系认证证书》，将依据《隐私政策》保护用户的个人信息。
          </p>
          <Button
            size="lg"
            block
            className="mt-6"
            onClick={() => {
              setConfirmOpen(false)
              onContinue()
            }}
          >
            立即认证
          </Button>
        </div>
      </BottomSheet>
    </DetailPage>
  )
}
