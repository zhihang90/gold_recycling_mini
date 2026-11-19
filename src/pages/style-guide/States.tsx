import { useNavigate } from 'react-router-dom'

import { Card, DetailPage, InlineNotice, ListItem } from '@/components'
import { groupSheetStates } from '@/routes/sheetStates'

/**
 * 弹层状态总览：把「页面 + 弹层 + 状态」整理成可点击的清单，
 * 供需求评审、设计走查与开发自测直接跳转到对应界面。
 * 数据来自 routes/sheetStates.ts，与左侧「弹层状态」分组同源。
 */
export function StatesGuidePage() {
  const navigate = useNavigate()
  const sections = groupSheetStates()

  return (
    <DetailPage title="弹层状态总览" contentClassName="space-y-3">
      <InlineNotice tone="info">
        弹层不单独占用路由，点击条目会打开所属页面并自动展开对应弹层；链接可直接分享给设计、开发和测试。
      </InlineNotice>

      {sections.map((section) => (
        <section key={section.title}>
          <p className="mb-1 px-1 text-caption text-subtle-foreground">{section.title}</p>
          <Card className="overflow-hidden">
            {section.items.map((item, index) => (
              <ListItem
                key={item.id}
                title={item.label}
                description={item.note}
                showArrow
                divider={index < section.items.length - 1}
                onClick={() => navigate(item.menuPath)}
              />
            ))}
          </Card>
        </section>
      ))}
    </DetailPage>
  )
}
