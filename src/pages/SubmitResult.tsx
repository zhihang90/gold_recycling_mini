import { Button, PageHeader, PageShell, ResultStatus } from '@/components'
import { useNavigate } from 'react-router-dom'

import { paths } from '@/routes/paths'

/**
 * 邮寄回收订单提交成功过渡页。
 * 只保留结果反馈与下一步入口，不再承载订单明细；详情统一由待取件详情页展示。
 */
export function SubmitResultPage() {
  const navigate = useNavigate()
  const backHome = () => navigate(paths.home, { replace: true })

  return (
    <PageShell>
      <PageHeader title="提交成功" onBack={backHome} />
      <div className="flex flex-1 flex-col px-4 pt-12">
        <ResultStatus
          status="success"
          title="订单提交成功"
          description="我们将在 1 个工作日内完成审核，请留意站内消息"
          primaryAction={
            <div className="flex w-full flex-col gap-3">
              <Button block onClick={() => navigate(paths.pickupDetail)}>
                查看订单
              </Button>
              <Button variant="secondary" block onClick={backHome}>
                返回首页
              </Button>
            </div>
          }
        />
      </div>
    </PageShell>
  )
}
