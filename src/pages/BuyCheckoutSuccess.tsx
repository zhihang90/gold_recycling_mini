import { Button, EmptyState, PageHeader, PageShell } from '@/components'
import { ReceiptText, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { readCheckoutResult } from '@/mocks/checkout'
import { useDemoScene } from '@/lib/useDemoScene'
import { paths } from '@/routes/paths'

/** 订单提交成功：独立全屏结果页，不挂在确认订单路由内 */
export function BuyCheckoutSuccessPage() {
  const navigate = useNavigate()
  /** 演示直达：?demo=success 直接渲染成功态，不写存储 */
  const demo = useDemoScene() === 'success'
  const result = demo ? { amount: 0, count: 0, createdAt: Date.now() } : readCheckoutResult()
  const backToOrders = () => navigate(paths.orders, { replace: true })

  if (!result) {
    return (
      <PageShell>
        <PageHeader title="支付成功" onBack={backToOrders} />
        <EmptyState
          icon={ReceiptText}
          title="没有可展示的支付结果"
          description="支付完成后，可在这里查看结果与订单进度。"
          action={<Button onClick={backToOrders}>查看我的订单</Button>}
        />
      </PageShell>
    )
  }

  return (
    <PageShell>
      <PageHeader title="支付成功" onBack={backToOrders} />
      <div className="flex flex-1 flex-col items-center gap-4 px-4 pt-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-50">
          <ShieldCheck size={32} strokeWidth={1.5} className="text-gold-700" />
        </div>
        <h2 className="text-section text-foreground">支付成功</h2>
        <p className="text-body text-muted-foreground">我们已收到您的付款，将尽快安排发货</p>
        <div className="mt-6 grid w-full grid-cols-2 gap-3">
          <Button
            variant="secondary"
            block
            className="rounded-full"
            onClick={backToOrders}
          >
            查看订单
          </Button>
          <Button block className="rounded-full" onClick={() => navigate(paths.buy)}>
            继续买金
          </Button>
        </div>
      </div>
    </PageShell>
  )
}
