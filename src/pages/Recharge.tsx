import { Button, DetailPage, EmptyState } from '@/components'
import { Wallet } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { paths } from '@/routes/paths'

/** 充值：独立全屏占位页，后续补充金额与支付方式表单 */
export function RechargePage() {
  const navigate = useNavigate()

  return (
    <DetailPage title="充值" onBack={() => navigate(paths.meHoldings)}>
      <EmptyState
        icon={Wallet}
        title="充值功能开发中"
        description="后续可选择充值金额与支付方式，到账后计入账户余额。"
        action={<Button onClick={() => navigate(paths.meHoldings)}>返回我的资产</Button>}
      />
    </DetailPage>
  )
}
