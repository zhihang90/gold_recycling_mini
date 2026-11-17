import { ClipboardList } from 'lucide-react'
import { ListPage } from '@/components/ListPage'
import { EmptyState } from '@/components/EmptyState'

/** 订单：底部 Tab 一级页。订单列表内容待补充，先保留空态。 */
export function OrdersPage() {
  return (
    <ListPage
      title="订单"
      isEmpty
      empty={
        <EmptyState
          icon={ClipboardList}
          title="暂无回收订单"
          description="估价与检测进度将在订单列表中展示。"
        />
      }
    />
  )
}
