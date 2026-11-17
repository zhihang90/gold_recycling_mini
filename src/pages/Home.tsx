import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calculator, ChevronRight, Coins, Gem, Headphones, ScrollText } from 'lucide-react'
import { TabPage } from '@/components/TabPage'
import { BottomSheet } from '@/components/BottomSheet'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { ListItem } from '@/components/ListItem'
import { MediaVisual } from '@/components/MediaVisual'
import { PromoCarousel } from '@/components/PromoCarousel'
import type { PromoSlide } from '@/components/PromoCarousel'
import { RuleSheet } from '@/components/RuleSheet'
import { TextLink } from '@/components/TextLink'
import { images } from '@/assets/images'
import { GOLD_RATE } from '@/mocks/quote'
import { HOME_RULE_SUMMARY } from '@/mocks/rules'
import { paths } from '@/routes/paths'

const FLOW_STEPS = [
  { key: 'quote', label: '估价' },
  { key: 'ship', label: '寄出' },
  { key: 'live', label: '检测直播' },
  { key: 'confirm', label: '确认终价' },
  { key: 'pay', label: '收款' },
]

/**
 * 首页：品牌头 + 三张宣传轮播（集团背书 / 回收流程 / 今日金价）
 * + 立即估价 + 直接寄件 + 品类与主体信息。
 * 浏览与估价不需要登录；到店、上门与企业入口均不出现。
 */
export function HomePage() {
  const navigate = useNavigate()
  const [goldOpen, setGoldOpen] = useState(false)
  const [rulesOpen, setRulesOpen] = useState(false)
  const [serviceOpen, setServiceOpen] = useState(false)

  const slides: PromoSlide[] = [
    {
      key: 'endorse',
      label: '集团背书',
      content: (
        <div className="relative h-44 w-full overflow-hidden bg-ink-900">
          <MediaVisual
            src={images.heroEndorse}
            alt="安盛华集团检测背书"
            priority
            className="absolute inset-0 h-full w-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900/90 via-ink-900/35 to-ink-900/5" />
          <div className="relative flex h-full flex-col justify-end p-4">
            <p className="text-caption text-paper/70">安盛华集团 · 检测背书</p>
            <p className="mt-1 font-serif text-section text-paper">
              集团标准检测
              <br />
              每克来源与重量可追溯
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'flow',
      label: '回收流程',
      content: (
        <div className="flex h-44 w-full flex-col justify-center gap-3 bg-primary-soft px-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-card-title text-foreground">回收流程</h2>
            <span className="text-caption text-muted-foreground">五步完成</span>
          </div>
          <ol className="grid grid-cols-5 gap-1">
            {FLOW_STEPS.map((step, index) => (
              <li key={step.key} className="flex flex-col items-center gap-1.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-card text-caption-strong text-primary ring-1 ring-primary-border">
                  {index + 1}
                </span>
                <span className="whitespace-nowrap text-caption text-ink-700">{step.label}</span>
              </li>
            ))}
          </ol>
          <p className="pr-20 text-caption text-subtle-foreground">
            检测全程直播，录像保存 3 年；每个价格节点都可查。
          </p>
        </div>
      ),
    },
    {
      key: 'rate',
      label: '今日金价',
      content: (
        <div className="flex h-44 w-full flex-col justify-center gap-2 bg-ink-900 px-4">
          <p className="text-caption text-paper/60">今日上海实时金价</p>
          <div className="flex items-baseline gap-1.5">
            <span className="font-serif text-title tabular text-paper">¥{GOLD_RATE.price}</span>
            <span className="text-caption text-paper/60">元/克</span>
          </div>
          <p className="text-caption text-paper/60">
            {GOLD_RATE.source} · {GOLD_RATE.updatedAt}
          </p>
          <p className="pr-20 text-caption text-paper/50">
            参考价，非最终结算价；实际结算以检测完成时点金价为准。
          </p>
        </div>
      ),
    },
  ]

  return (
    <TabPage>
      <header className="pt-1">
        <h1 className="font-serif text-title leading-tight text-foreground">安盛华黄金回收</h1>
        <p className="mt-1 text-caption text-subtle-foreground">
          集团检测背书 · 全程直播 · 计价透明
        </p>
      </header>

      <PromoCarousel slides={slides} />

      <Card padding="md" className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-card-title text-foreground">先估价，再决定</h2>
            <p className="mt-1 text-body text-muted-foreground">
              按克重与纯度预估，检测完成后确认终价；浏览与估价无需登录。
            </p>
          </div>
          <TextLink onClick={() => setGoldOpen(true)} className="shrink-0">
            金价说明
          </TextLink>
        </div>
        <Button size="lg" block onClick={() => navigate(paths.quote)}>
          <Calculator size={18} />
          立即估价
        </Button>
        <Button
          size="lg"
          variant="text"
          block
          onClick={() => navigate(paths.login, { state: { from: 'home' } })}
        >
          我有东西要卖，直接寄件
          <ChevronRight size={16} />
        </Button>
      </Card>

      <div className="space-y-2">
        <Card className="overflow-hidden">
          <div className="px-4 pt-3">
            <h2 className="text-card-title text-foreground">可回收品类</h2>
          </div>
          <ListItem
            title="足金首饰"
            description="项链、手镯、戒指、吊坠等"
            icon={Gem}
            showArrow
            divider
            onClick={() => navigate(`${paths.quote}?category=jewelry`)}
          />
          <ListItem
            title="投资金条 / 金币"
            description="按原料金口径回收，不承诺溢价"
            icon={Coins}
            showArrow
            onClick={() => navigate(`${paths.quote}?category=bar`)}
          />
        </Card>
        <p className="text-caption text-subtle-foreground">
          不支持：K 金、镶嵌类、含非金配件；误寄将被拒收退回。
        </p>
      </div>

      <Card className="overflow-hidden">
        <ListItem
          title="回收规则"
          description="品类、费用、保价、破检与退回"
          icon={ScrollText}
          showArrow
          divider
          onClick={() => setRulesOpen(true)}
        />
        <ListItem
          title="联系客服"
          description="工作时间在线，订单问题优先在订单详情发起"
          icon={Headphones}
          showArrow
          onClick={() => setServiceOpen(true)}
        />
      </Card>

      <BottomSheet
        open={goldOpen}
        onClose={() => setGoldOpen(false)}
        title="金价说明"
        footer={
          <Button block onClick={() => setGoldOpen(false)}>
            知道了
          </Button>
        }
      >
        <div className="space-y-3 text-body text-muted-foreground">
          <p>
            参考金价来源：{GOLD_RATE.source}，更新时间：{GOLD_RATE.updatedAt}。
          </p>
          <p>
            预估货值 = 参考金价 × 纯度折算 × 重量 × 数量；最终按检测完成时点金价与实际可熔重量、纯度结算。
          </p>
          <p>页面金价为参考价，不是最终结算价，也不构成成交承诺。</p>
        </div>
      </BottomSheet>

      <RuleSheet
        open={rulesOpen}
        onClose={() => setRulesOpen(false)}
        title="回收规则"
        sections={HOME_RULE_SUMMARY}
      />

      <BottomSheet
        open={serviceOpen}
        onClose={() => setServiceOpen(false)}
        title="联系客服"
        footer={
          <Button block onClick={() => setServiceOpen(false)}>
            知道了
          </Button>
        }
      >
        <p className="text-body text-muted-foreground">
          客服工作时间内在线。已下单用户可在订单详情内联系客服，咨询报价、结算或退回问题；登录后也可在「我的」中查看服务入口。
        </p>
      </BottomSheet>
    </TabPage>
  )
}
