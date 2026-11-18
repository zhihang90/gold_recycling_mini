import { DetailPage, Button, Card } from '@/components'
import { useNavigate } from 'react-router-dom'

import { paths } from '@/routes/paths'

/**
 * 邮寄回收订单提交结果页（阅宝图 4）。
 * 提交成功后进入，用户可跳转到待取件详情或返回首页。
 */
export function SubmitResultPage() {
  const navigate = useNavigate()

  return (
    <DetailPage header={false}>
      {/* 金色渐变 hero */}
      <section className="relative mx-4 mt-4 overflow-hidden rounded-xl bg-gradient-to-br from-gold-100 via-gold-50 to-gold-100 px-4 py-6">
        <div className="absolute right-2 top-2 text-[72px] leading-none opacity-35" aria-hidden="true"> {/* ui-allow: 大号 emoji 装饰 */}
          🤖
        </div>
        <span className="inline-block rounded-full bg-ink-900/70 px-2 py-0.5 text-caption text-paper">
          请您耐心等待
        </span>
        <h1 className="mt-3 font-serif text-title leading-tight text-ink-900">
          订单提交成功
        </h1>
        <p className="mt-1 text-body text-ink-800/80">
          我们将在一个工作日内审核订单信息
        </p>
      </section>

      {/* 结果卡 */}
      <section className="px-4 pt-4 pb-12">
        <Card padding="lg" className="flex flex-col items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gold-50 text-gold-600 ring-1 ring-gold-200">
            <svg
              viewBox="0 0 64 64"
              className="h-12 w-12"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="14" y="8" width="36" height="48" rx="4" />
              <path d="M22 24h20M22 32h20M22 40h14" />
              <path d="M40 10l6 6-6 6" />
            </svg>
          </div>
          <div className="flex w-full flex-col gap-3">
            <Button size="lg" block onClick={() => navigate(paths.pickupDetail)}>
              查看详情
            </Button>
            <Button
              size="lg"
              block
              variant="tertiary"
              onClick={() => navigate(paths.home, { replace: true })}
            >
              返回首页
            </Button>
          </div>
        </Card>
      </section>
    </DetailPage>
  )
}
