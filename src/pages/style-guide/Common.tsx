import { Badge, Button, IconButton, Card, InlineNotice, PriceText } from '@/components'
import type { BadgeTone } from '@/components'
import { Heart, Share2 } from 'lucide-react'

import { CHECKS, GOLD, INK, RED, TYPE_SCALE } from './data'
import { GuideFooter, GuidePage, Section, SwatchRow } from './shared'

const BADGE_TONES: { tone: BadgeTone; label: string }[] = [
  { tone: 'primary', label: 'primary' },
  { tone: 'neutral', label: 'neutral' },
  { tone: 'gold', label: 'gold' },
  { tone: 'success', label: 'success' },
  { tone: 'warning', label: 'warning' },
  { tone: 'danger', label: 'danger' },
  { tone: 'info', label: 'info' },
  { tone: 'violet', label: 'violet' },
  { tone: 'muted', label: 'muted' },
  { tone: 'outline', label: 'outline' },
]

/** 公共组件：设计 token 与基础控件，所有业务域共用 */
export function CommonGuidePage() {
  return (
    <GuidePage title="公共组件">
      <Card className="bg-red-50 p-4 ring-red-100">
        <div className="text-title text-red-800">骨架已可运行</div>
        <div className="mt-2 text-body text-red-700/90">
          本页用于验收构建、样式 token 与演示外壳，不属于业务流程页面。
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge tone="primary">React 19</Badge>
          <Badge tone="primary">Vite 7</Badge>
          <Badge tone="primary">Tailwind 4</Badge>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge tone="outline">HashRouter</Badge>
        </div>
      </Card>

      <Card className="space-y-4 p-4">
        <SwatchRow title="品牌红（行动 / 选中）" items={RED} />
        <SwatchRow title="品质金（克重 / 成色）" items={GOLD} />
        <SwatchRow title="中性（暖墨）" items={INK} />
      </Card>

      <Card className="p-4">
        <div className="mb-3 text-caption-strong text-subtle-foreground">字号角色</div>
        <div className="space-y-3">
          {TYPE_SCALE.map((item) => (
            <div key={item.role} className="flex items-baseline justify-between gap-3">
              <div className={`min-w-0 truncate ${item.className}`}>{item.sample}</div>
              <div className="shrink-0 text-caption text-subtle-foreground">{item.role}</div>
            </div>
          ))}
        </div>
      </Card>

      <Section title="按钮 Button">
        <div className="flex flex-wrap gap-2">
          <Button>主行动</Button>
          <Button variant="secondary">次行动</Button>
          <Button variant="tertiary">取消</Button>
          <Button variant="text">文字链</Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="lg">大号 48</Button>
          <Button size="md">中号 44</Button>
          <Button size="sm">小号 36</Button>
          <Button disabled>禁用</Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="danger">危险操作</Button>
          <Button loading>提交中</Button>
          <Button size="icon" aria-label="收藏">
            <Heart size={20} />
          </Button>
          <IconButton icon={Heart} label="收藏" />
          <IconButton icon={Share2} label="分享" variant="outline" />
        </div>
        <Button block>整行主行动</Button>
      </Section>

      <Section title="卡片内边距 Card">
        <Card padding="sm">
          <div className="text-body text-foreground">sm · 12</div>
        </Card>
        <Card padding="md">
          <div className="text-body text-foreground">md · 16（默认业务卡片）</div>
        </Card>
        <Card padding="lg">
          <div className="text-body text-foreground">lg · 20（强调卡片）</div>
        </Card>
      </Section>

      <Section title="标签 Badge">
        <div className="flex flex-wrap gap-2">
          {BADGE_TONES.map((item) => (
            <Badge key={item.tone} tone={item.tone}>
              {item.label}
            </Badge>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge size="md" tone="gold">
            大号 24
          </Badge>
          <Badge size="md" tone="outline">
            outline
          </Badge>
        </div>
      </Section>

      <Section title="金额与金价 PriceText">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-caption text-subtle-foreground">今日参考金价</span>
          <PriceText value={628.5} size="section" tone="gold" suffix="/克" />
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-caption text-subtle-foreground">页面主数字</span>
          <PriceText value={1286.5} size="display" tone="price" />
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-caption text-subtle-foreground">卡内金额</span>
          <PriceText value={3888} size="card-title" tone="ink" />
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-caption text-subtle-foreground">克重</span>
          <PriceText value="12.68" prefix="" suffix="克" size="body" tone="gold" decimals={2} />
        </div>
      </Section>

      <Section title="行内提示 InlineNotice">
        <InlineNotice tone="info">说明：金价 × 含金量 × 可熔重量 − 服务费，结果页可展开查看。</InlineNotice>
        <InlineNotice tone="warning" title="差异显著">
          实测克重与预估相差超过 5%，确认前请先核对检测记录。
        </InlineNotice>
        <InlineNotice tone="danger">页面内错误说明用本组件，不使用 toast。</InlineNotice>
        <InlineNotice tone="success">已完成：仅在页面内说明结果，不弹窗打断。</InlineNotice>
      </Section>

      <Card className="p-4">
        <div className="mb-3 text-caption-strong text-subtle-foreground">兼容项状态</div>
        <div className="space-y-2">
          {CHECKS.map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <span className="text-body text-foreground">{item.label}</span>
              <Badge tone={item.tone}>{item.value}</Badge>
            </div>
          ))}
        </div>
      </Card>

      <InlineNotice tone="info" title="下一步">
        组件按业务域拆到独立样张页，业务页面按功能清单逐步接入。
      </InlineNotice>

      <GuideFooter>演示数据均为本地示例，不接外部接口</GuideFooter>
    </GuidePage>
  )
}
