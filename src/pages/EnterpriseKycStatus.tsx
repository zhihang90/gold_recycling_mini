import { BadgeCheck, CheckCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button, Card, EnterpriseKycStepPage } from '@/components'
import { useEnterpriseKyc } from '@/hooks/useEnterpriseKyc'
import { MOCK_ENTERPRISE_KYC } from '@/mocks/member'
import { paths } from '@/routes/paths'

const BENEFITS = [
  '企业专属金价，支持批量采购与回收',
  '对公结算，可开具增值税专用发票',
  '专属客户经理提供 1v1 服务',
]

/** 企业认证结果页：静态成功页，直接进入即展示全部步骤完成。 */
export function EnterpriseKycStatusPage() {
  const navigate = useNavigate()
  const { member } = useEnterpriseKyc()
  const base = member?.enterpriseKyc?.baseInfo ?? MOCK_ENTERPRISE_KYC.baseInfo
  const verifiedAt = new Date(member?.kycSubmitAt ?? Date.now()).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  return (
    <EnterpriseKycStepPage
      step="submit"
      completedIndices={[0, 1, 2, 3, 4]}
      footer={null}
      showCurrentCompleted
    >
      <Card padding="lg" className="space-y-4 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
          <BadgeCheck size={38} className="text-success" />
        </div>
        <div className="space-y-1">
          <p className="text-body-lg font-semibold text-foreground">认证成功</p>
          <p className="text-body font-medium text-foreground">{base.companyName}</p>
          <p className="text-caption text-subtle-foreground leading-relaxed">
            已完成企业实名认证，企业专属权益已开通。
          </p>
        </div>
        <p className="text-caption text-subtle-foreground">认证时间：{verifiedAt}</p>
      </Card>

      <Card padding="lg" className="space-y-3">
        <p className="text-card-title text-foreground">已开通权益</p>
        {BENEFITS.map((item) => (
          <div key={item} className="flex items-start gap-2">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-success" />
            <p className="text-body text-foreground">{item}</p>
          </div>
        ))}
      </Card>

      <div className="flex gap-2 pt-1">
        <Button variant="secondary" className="flex-1" onClick={() => navigate(paths.meProfile)}>
          返回个人中心
        </Button>
        <Button className="flex-[1.4]" onClick={() => navigate(paths.buy)}>
          去买金
        </Button>
      </div>
    </EnterpriseKycStepPage>
  )
}
