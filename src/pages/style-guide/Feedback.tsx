import { useState } from 'react'
import { Button } from '@/components/Button'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { ResultStatus } from '@/components/ResultStatus'
import { Skeleton } from '@/components/Skeleton'
import { GuideFooter, GuidePage, Section } from './shared'

/** 反馈组件：加载、确认与结果页 */
export function FeedbackGuidePage() {
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <GuidePage title="反馈组件">
      <Section title="加载态 Skeleton">
        <div className="flex items-center gap-3">
          <Skeleton variant="circle" />
          <Skeleton variant="text" lines={2} className="flex-1" />
        </div>
        <Skeleton variant="text" lines={3} />
        <Skeleton variant="rect" className="h-24" />
      </Section>

      <Section title="确认框 ConfirmDialog">
        <Button variant="secondary" block onClick={() => setConfirmOpen(true)}>
          打开确认框
        </Button>
        <div className="text-caption text-subtle-foreground">
          只用于「确认后不可撤销」的动作，普通说明留在页面内。
        </div>
      </Section>

      <Section title="结果页 ResultStatus">
        <ResultStatus
          status="success"
          title="示例：提交成功"
          description="这里放下一步说明，例如查看订单或返回首页。"
          primaryAction={<Button block>查看订单</Button>}
          secondaryAction={
            <Button variant="secondary" block>
              返回首页
            </Button>
          }
        />
      </Section>

      <GuideFooter>反馈组件不新增 toast，所有提示留在页面内</GuideFooter>

      <ConfirmDialog
        open={confirmOpen}
        title="示例：确认操作"
        description="确认后继续，取消则保持当前状态。"
        confirmText="确认"
        onConfirm={() => setConfirmOpen(false)}
        onClose={() => setConfirmOpen(false)}
      />
    </GuidePage>
  )
}
