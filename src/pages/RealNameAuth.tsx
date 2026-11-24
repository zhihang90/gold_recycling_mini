import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { IdCard, Landmark, ScanFace, ShieldCheck } from 'lucide-react'

import {
  BottomSheet,
  Button,
  Card,
  DetailPage,
  FormField,
  PhotoUploader,
  Toast,
} from '@/components'
import { readMember, saveMember, submitRealNameAuth, DEMO_REAL_NAME } from '@/mocks/member'
import { paths } from '@/routes/paths'

const DEMO_PHONE = '13800138000'

/** ===== 个人实名认证 ===== */
export function RealNameAuthPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect')

  const member = readMember()
  const saved = member?.realNameAuth
  const isDemo = member?.phone === DEMO_PHONE
  // 演示用户且还未通过 → 展示预填；已通过则回显实际值
  const prefill = isDemo && !saved?.verifiedAt ? DEMO_REAL_NAME : undefined

  const [toast, setToast] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const facePath = redirect
    ? `${paths.meAuthFace}?redirect=${encodeURIComponent(redirect)}`
    : paths.meAuthFace
  const goFace = () => navigate(facePath)

  return (
    <>
      <DetailPage title="实名认证">
        <Card>
          <div className="flex items-start gap-3">
            <ShieldCheck size={22} className="mt-0.5 text-gold-600" />
            <div>
              <h2 className="font-semibold">为什么要实名认证</h2>
              <p className="mt-1 text-caption leading-relaxed text-muted-foreground">
                根据《贵金属和宝石从业机构反洗钱管理办法》及《移动互联网应用程序信息服务管理规定》，
                贵金属交易需履行反洗钱义务，按"后台实名、前台自愿"原则，对您进行真实身份信息核验。
              </p>
            </div>
          </div>
        </Card>

        <Card padding="lg" className="space-y-3">
          <h2 className="font-semibold">上传身份证照片</h2>
          <p className="text-caption text-muted-foreground">
            拍摄时保证证件四角完整、文字清晰，避免反光与遮挡。
          </p>
          <IdPhotoFields saved={saved} prefill={prefill} onToast={setToast} />
        </Card>

        <Card padding="lg" className="space-y-3">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-semibold">上传港澳通行证照片</h2>
            <span className="text-caption text-subtle-foreground">选填</span>
          </div>
          <p className="text-caption text-muted-foreground">
            使用港澳通行证办理时，请上传证件正面与反面；不上传不影响本次认证。
          </p>
          <PermitPhotoFields />
        </Card>

        <Card padding="lg" className="space-y-4">
          <h2 className="font-semibold">填写实名信息</h2>
          <NameIdFields
            saved={saved}
            prefill={prefill}
            onToast={setToast}
            onAllValid={() => setConfirmOpen(true)}
          />
        </Card>
      </DetailPage>

      <BottomSheet open={confirmOpen} onClose={() => setConfirmOpen(false)} title="实名认证">
        <div className="pt-4 pb-[calc(16px+env(safe-area-inset-bottom))] text-center">
          <ScanFace size={72} strokeWidth={1.3} className="mx-auto text-gold-500" />
          <p className="mt-5 font-semibold">认证通过</p>
          <p className="mt-2 text-caption text-muted-foreground">
            您已完成个人实名认证，可正常使用全部服务
          </p>
          <Button size="lg" block className="mt-6" onClick={goFace}>
            前往人脸核验 →
          </Button>
        </div>
      </BottomSheet>

      <Toast open={!!toast} message={toast ?? ''} onClose={() => setToast(null)} />
    </>
  )
}

interface Saved {
  name: string
  idNo: string
  permitNo?: string
  verifiedAt: number
}

interface Prefill {
  name: string
  idNo: string
  photos: { front: string[]; back: string[] }
}

/** 身份证照片上传（两面） */
function IdPhotoFields({
  saved,
  prefill,
  onToast,
}: {
  saved?: Saved
  prefill?: Prefill
  onToast: (msg: string) => void
}) {
  const [idFront, setIdFront] = useState<string[]>(saved ? [] : (prefill?.photos.front ?? []))
  const [idBack, setIdBack] = useState<string[]>(saved ? [] : (prefill?.photos.back ?? []))
  const [errors, setErrors] = useState<{ photos?: string }>({})

  return (
    <div className="space-y-1">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <PhotoUploader
            value={idFront}
            onChange={(v) => {
              setIdFront(v)
              setErrors((p) => ({ ...p, photos: undefined }))
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
            onChange={(v) => {
              setIdBack(v)
              setErrors((p) => ({ ...p, photos: undefined }))
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
      {errors.photos && <p className="text-caption text-destructive">{errors.photos}</p>}
    </div>
  )
}

/** 港澳通行证照片上传（正反面，选填） */
function PermitPhotoFields() {
  const [front, setFront] = useState<string[]>([])
  const [back, setBack] = useState<string[]>([])

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1.5">
        <PhotoUploader
          value={front}
          onChange={setFront}
          max={1}
          columns={1}
          aspect="wide"
          showCount={false}
          addLabel="点击上传"
          addIcon={IdCard}
        />
        <p className="text-center text-caption text-muted-foreground">正面</p>
      </div>
      <div className="space-y-1.5">
        <PhotoUploader
          value={back}
          onChange={setBack}
          max={1}
          columns={1}
          aspect="wide"
          showCount={false}
          addLabel="点击上传"
          addIcon={Landmark}
        />
        <p className="text-center text-caption text-muted-foreground">反面</p>
      </div>
    </div>
  )
}

/** 姓名 + 身份证号 + 提交按钮 */
function NameIdFields({
  saved,
  prefill,
  onToast,
  onAllValid,
}: {
  saved?: Saved
  prefill?: Prefill
  onToast: (msg: string) => void
  onAllValid: () => void
}) {
  const [name, setName] = useState(saved?.name ?? prefill?.name ?? '')
  const [idNo, setIdNo] = useState(saved?.idNo ?? prefill?.idNo ?? '')
  const [permitNo, setPermitNo] = useState(saved?.permitNo ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ name?: string; idNo?: string }>({})

  const handleSubmit = () => {
    const next = {
      name: name.trim().length >= 2 ? undefined : '请输入真实姓名（至少 2 个字符）',
      idNo: /^\d{17}[\dXx]$/.test(idNo.trim()) ? undefined : '请输入正确的 18 位身份证号',
    }
    setErrors(next)
    if (Object.values(next).some(Boolean)) return
    setSubmitting(true)
    window.setTimeout(() => {
      if (!readMember()) saveMember(DEMO_PHONE)
      submitRealNameAuth(name.trim(), idNo.trim().toUpperCase(), permitNo)
      setSubmitting(false)
      onAllValid()
    }, 500)
  }

  return (
    <>
      <FormField
        label="真实姓名"
        placeholder="请输入身份证上的姓名"
        value={name}
        onChange={(v) => {
          setName(v)
          setErrors((p) => ({ ...p, name: undefined }))
        }}
        maxLength={20}
        required
        error={errors.name}
      />
      <FormField
        label="身份证号"
        placeholder="请输入 18 位身份证号"
        value={idNo}
        onChange={(v) => {
          setIdNo(v.toUpperCase())
          setErrors((p) => ({ ...p, idNo: undefined }))
        }}
        maxLength={18}
        inputMode="text"
        required
        error={errors.idNo}
      />
      <FormField
        label="港澳通行证号码（选填）"
        placeholder="请输入港澳通行证号码"
        value={permitNo}
        onChange={setPermitNo}
        maxLength={20}
        inputMode="text"
      />
      <Button size="lg" block loading={submitting} onClick={handleSubmit}>
        提交认证
      </Button>
    </>
  )
}
