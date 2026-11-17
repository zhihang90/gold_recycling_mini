import { useState } from 'react'
import { Button } from '@/components/Button'
import { CountdownBar } from '@/components/CountdownBar'
import { OrderCard } from '@/components/OrderCard'
import { StatusSteps } from '@/components/StatusSteps'
import { StatusTimeline } from '@/components/StatusTimeline'
import { GuideFooter, GuidePage, Section } from './shared'

const STEPS = [
  { key: 'created', label: '待寄出' },
  { key: 'received', label: '待签收' },
  { key: 'testing', label: '检测中' },
  { key: 'confirm', label: '待确认' },
  { key: 'paying', label: '待打款' },
  { key: 'done', label: '已完成' },
]

const TIMELINE = [
  {
    key: '1',
    title: '示例：顺丰已揽收',
    description: '运单号与保价信息在订单详情可查。',
    time: '11-15 10:20',
    state: 'done' as const,
  },
  {
    key: '2',
    title: '示例：平台已签收',
    description: '签收后进入检测，破检前会再次提示不可还原。',
    time: '11-16 09:10',
    state: 'done' as const,
  },
  {
    key: '3',
    title: '示例：检测中',
    description: '检测完成后生成终价，确认窗口内可接受或拒绝。',
    state: 'current' as const,
  },
]

/** 黄金回收 · 订单与状态域 */
export function OrderGuidePage() {
  const [deadline] = useState(() => Date.now() + 2 * 3600 * 1000 + 15 * 60 * 1000)

  return (
    <GuidePage title="订单与状态">
      <Section title="订单卡与状态 OrderCard / StatusSteps">
        <OrderCard
          orderNo="示例单号 0000 0000"
          statusLabel="检测中"
          statusTone="info"
          title="足金首饰 · 示例物品"
          meta="示例重量 12.68 克 · 足金 999"
          amountLabel="预估金额"
          amount={7962.3}
          actions={
            <Button size="sm" variant="secondary">
              查看详情
            </Button>
          }
        />
        <StatusSteps steps={STEPS} currentIndex={2} />
        <div className="text-caption text-subtle-foreground">
          邮寄单状态分六步展示；下单不做六步分页，StepIndicator 仅预留。
        </div>
      </Section>

      <Section title="事件时间轴 StatusTimeline">
        <StatusTimeline items={TIMELINE} />
      </Section>

      <Section title="倒计时 CountdownBar">
        <CountdownBar deadline={deadline} />
        <div className="text-caption text-subtle-foreground">
          到点只触发一次 onEnd，不自动修改订单状态。
        </div>
      </Section>

      <GuideFooter>状态文案由业务页映射，组件不内置订单状态枚举</GuideFooter>
    </GuidePage>
  )
}
