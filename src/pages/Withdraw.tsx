import { Button, DetailPage, EmptyState } from '@/components'
import { Banknote } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { paths } from '@/routes/paths'

/** 提现：独立全屏占位页，后续补充金额与到账银行卡表单 */
export function WithdrawPage() {
  const navigate = useNavigate()

  return (
    <DetailPage title="提现" onBack={() => navigate(paths.meHoldings)}>
      <EmptyState
        icon={Banknote}
        title="提现功能开发中"
        description="后续可将账户余额提现到已绑定的银行卡，预计 1 个工作日内到账。"
        action={<Button onClick={() => navigate(paths.meHoldings)}>返回我的资产</Button>}
      />
    </DetailPage>
  )
}
