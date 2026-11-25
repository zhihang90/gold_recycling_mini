import { BottomSheet, Button, Card, DetailPage, FormField, ListItem, Toast } from '@/components'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, ShieldCheck, ShieldX } from 'lucide-react'
import {
  clearMember,
  getEnterpriseAuthStatus,
  maskIdCard,
  maskName,
  maskPhone,
  readMember,
  readMemberLevel,
  readNickname,
  revokeRealNameAuth,
  saveNickname,
  type EnterpriseAuthStatus,
} from '@/mocks/member'
import { paths } from '@/routes/paths'

const ENTERPRISE_STATUS_LABEL: Record<EnterpriseAuthStatus, string> = {
  unstarted: '去认证',
  draft: '待完善',
  pending: '审核中',
  reviewing: '审核中',
  manual: '人工审核',
  rejected: '已驳回',
  passed: '已认证',
}

/** 个人信息页：头像昵称、账号安全（手机/实名/注销）、退出登录。 */
export function ProfileInfoPage() {
  const navigate = useNavigate()
  const [member, setMember] = useState(() => readMember())
  const [toast, setToast] = useState<string | null>(null)
  const [nicknameOpen, setNicknameOpen] = useState(false)
  const [nicknameInput, setNicknameInput] = useState('')
  const [nicknameError, setNicknameError] = useState<string | undefined>()

  const personalVerified = Boolean(member?.realNameAuth?.verifiedAt)
  const enterpriseStatus = getEnterpriseAuthStatus(member)
  const enterpriseStatusClass =
    enterpriseStatus === 'passed'
      ? 'text-success'
      : enterpriseStatus === 'rejected' || enterpriseStatus === 'unstarted'
        ? 'text-destructive'
        : 'text-primary'

  const handleLogout = () => {
    clearMember()
    setMember(null)
    navigate(paths.login, { replace: true })
  }

  const handleRevokeAuth = () => {
    revokeRealNameAuth()
    setMember(readMember())
    setToast('已撤销实名认证（演示）')
  }

  const openNicknameSheet = () => {
    setNicknameInput(member?.nickname ?? '')
    setNicknameError(undefined)
    setNicknameOpen(true)
  }

  const handleSaveNickname = () => {
    const name = nicknameInput.trim()
    if (!name) {
      setNicknameError('请输入昵称')
      return
    }
    saveNickname(name)
    setMember(readMember())
    setNicknameOpen(false)
    setToast('昵称已修改')
  }

  return (
    <DetailPage title="个人中心" contentClassName="space-y-3" onBack={() => navigate(paths.me)}>
      <Card className="overflow-hidden">
        <ListItem
          title="头像"
          right={
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-50 text-caption font-medium text-gold-800">
              G
            </span>
          }
        />
        <ListItem
          title="昵称"
          right={readNickname(member)}
          showArrow
          divider
          onClick={openNicknameSheet}
        />
        <ListItem
          title="会员等级"
          right={readMemberLevel().name}
          showArrow
          onClick={() => navigate(paths.meMemberLevel)}
        />
      </Card>

      <section>
        <p className="mb-1 px-1 text-caption text-subtle-foreground">账号安全</p>
        <Card className="overflow-hidden">
          <ListItem title="手机号" right={member ? maskPhone(member.phone) : ''} divider />
          {personalVerified && member?.realNameAuth ? (
            <>
              <ListItem title="真实姓名" right={maskName(member.realNameAuth.name)} divider />
              <ListItem title="身份证号" right={maskIdCard(member.realNameAuth.idNo)} divider />
            </>
          ) : null}
          <ListItem
            title="个人实名认证"
            icon={personalVerified ? ShieldCheck : ShieldX}
            right={
              <span className={personalVerified ? 'text-success' : 'text-destructive'}>
                {personalVerified ? '已认证' : '未认证'}
              </span>
            }
            showArrow
            divider
            onClick={() =>
              personalVerified
                ? handleRevokeAuth() // 演示用：点击已认证可撤销
                : navigate(paths.meAuth)
            }
          />
          <ListItem
            title="企业实名认证"
            description={enterpriseStatus === 'unstarted' ? '可直接认证为企业用户' : undefined}
            icon={Building2}
            right={
              <span className={enterpriseStatusClass}>
                {ENTERPRISE_STATUS_LABEL[enterpriseStatus]}
              </span>
            }
            showArrow
            onClick={() => navigate(paths.meEnterpriseAuth)}
          />
        </Card>
      </section>

      <Button variant="secondary" block onClick={handleLogout} disabled={!member}>
        退出登录
      </Button>

      <Toast open={toast !== null} message={toast ?? ''} onClose={() => setToast(null)} />

      <BottomSheet
        open={nicknameOpen}
        onClose={() => setNicknameOpen(false)}
        title="修改昵称"
        subtitle="1-12 个字符，修改后立即生效"
        footer={
          <Button block onClick={handleSaveNickname}>
            保存
          </Button>
        }
      >
        <FormField
          label="昵称"
          required
          placeholder="请输入昵称"
          maxLength={12}
          value={nicknameInput}
          error={nicknameError}
          onChange={(value) => {
            setNicknameInput(value)
            if (nicknameError) setNicknameError(undefined)
          }}
        />
      </BottomSheet>
    </DetailPage>
  )
}
