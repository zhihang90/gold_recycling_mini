import { Button, Card, DetailPage, ListItem, Toast } from '@/components'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, ShieldX } from 'lucide-react'
import {
  clearMember,
  isMemberVerified,
  maskIdCard,
  maskName,
  maskPhone,
  readMember,
  revokeRealNameAuth,
} from '@/mocks/member'
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
    <DetailPage title="个人中心" contentClassName="space-y-3">
      <Card className="overflow-hidden">
        <ListItem
          title="头像"
          showArrow
          right={
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-50 text-caption font-medium text-gold-800">
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

      <section>
        <p className="mb-1 px-1 text-caption text-subtle-foreground">账号安全</p>
        <Card className="overflow-hidden">
          <ListItem
            title="手机号"
            right={member ? maskPhone(member.phone) : ''}
            showArrow
            divider
            onClick={() => setToast('暂不支持换绑手机号')}
          />
          {verified && member?.realNameAuth ? (
            <>
              <ListItem title="真实姓名" right={maskName(member.realNameAuth.name)} divider />
              <ListItem title="身份证号" right={maskIdCard(member.realNameAuth.idNo)} divider />
            </>
          ) : null}
          <ListItem
            title="实名认证"
            icon={verified ? ShieldCheck : ShieldX}
            right={
              <span className={verified ? 'text-success' : 'text-destructive'}>
                {verified ? '已认证' : '未认证'}
              </span>
            }
            showArrow
            divider={false}
            onClick={() =>
              verified
                ? handleRevokeAuth() // 演示用：点击已认证可撤销
                : navigate(paths.meAuth)
            }
          />
        </Card>
      </section>

      <Button variant="secondary" block onClick={handleLogout} disabled={!member}>
        退出登录
      </Button>

      <Toast
        open={toast !== null}
        message={toast ?? ''}
        onClose={() => setToast(null)}
      />
    </DetailPage>
  )
}
