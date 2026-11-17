import { Card, ListItem, PageShell, PageHeader, Button, Toast } from '@/components'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, ShieldX } from 'lucide-react'
import { clearMember, isMemberVerified, maskPhone, readMember, revokeRealNameAuth } from '@/mocks/member'
import { paths } from '@/routes/paths'

/** 个人信息页：头像昵称、账号安全（手机/实名/注销）、退出登录。 */
export function ProfileInfoPage() {
  const navigate = useNavigate()
  const [member, setMember] = useState(() => readMember())
  const [toast, setToast] = useState<string | null>(null)

  const verified = isMemberVerified(member)

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

  return (
    <PageShell padded>
      <PageHeader title="个人中心" />

      <Card className="overflow-hidden">
        <ListItem
          title="头像"
          showArrow
          right={
            <span className="h-9 w-9 rounded-full bg-gold-50 text-gold-800 flex items-center justify-center text-caption font-medium">
              G
            </span>
          }
          onClick={() => setToast('头像修改暂未开放')}
        />
        <ListItem
          title="昵称"
          right={member ? `黄金用户 ${member.phone.slice(-4)}` : ''}
          showArrow
          divider
          onClick={() => setToast('昵称修改暂未开放')}
        />
      </Card>

      <Card className="mt-3 overflow-hidden">
        <p className="px-4 pt-3 text-caption text-subtle-foreground">账号安全</p>
        <ListItem
          title="修改手机号码"
          right={member ? maskPhone(member.phone) : ''}
          showArrow
          divider
          onClick={() => setToast('暂不支持换绑手机号')}
        />
        <ListItem
          title="实名认证"
          icon={verified ? ShieldCheck : ShieldX}
          right={
            <span className={verified ? 'text-emerald-600' : 'text-destructive'}>
              {verified ? '已认证' : '未认证'}
            </span>
          }
          showArrow
          divider
          onClick={() =>
            verified
              ? handleRevokeAuth() // 演示用：点击已认证可撤销
              : navigate(paths.meAuth)
          }
        />
        <ListItem
          title="注销账户"
          showArrow
          divider={false}
          onClick={() => setToast('注销账户请联系客服')}
        />
      </Card>

      <div className="mt-3 text-center text-caption text-subtle-foreground">
        注销后无法恢复，请谨慎操作
      </div>

      <div className="mt-6 px-4">
        <Button
          variant="secondary"
          className="w-full"
          onClick={handleLogout}
          disabled={!member}
        >
          退出登录
        </Button>
      </div>

      <Toast
        open={toast !== null}
        message={toast ?? ''}
        onClose={() => setToast(null)}
      />
    </PageShell>
  )
}
