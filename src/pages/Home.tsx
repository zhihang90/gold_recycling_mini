import { PromoCarousel, Card, Chip, TabPage, MediaVisual, RateBoard } from '@/components'
import type { PromoSlide } from '@/components'
import { useState } from 'react'
import { ChevronDown, Factory, Layers, Truck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { images } from '@/assets/images'
import { FAQ_CATEGORIES, FAQ_ITEMS } from '@/mocks/faq'
import type { FaqCategory } from '@/mocks/faq'
import { GOLD_RATE, RATE_SERIES } from '@/mocks/quote'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'

const BRAND_TAGS = ['交易所会员', '权威检测', '顺丰保价']

const ABOUT_HONORS = [
  '上海黄金交易所会员单位',
  '中国黄金协会副会长单位',
  '中国珠宝玉石首饰行业协会副会长单位',
  '民营企业进出口 500 强',
]

const ADVANTAGES = [
  {
    icon: Layers,
    title: '不限品类 高价回收',
    text: '足金首饰、投资金条、金币均可回收，按实时金价计价',
  },
  {
    icon: Truck,
    title: '简单 方便 快捷',
    text: '在线估价，顺丰上门取件，全程保价可查',
  },
  {
    icon: Factory,
    title: '直达精炼厂',
    text: '没有中间商差价，确认终价当天发起打款',
  },
]

const BRANDS = [
  '上海黄金交易所',
  '山东黄金',
  '紫金矿业',
  '广西黄金',
  '广东黄金',
  '中国黄金协会',
  '顺丰速运',
  '支付宝',
  '微信支付',
  '京东',
  '交通银行',
  '安盛华检测',
]

/**
 * 首页：品牌头 + 检测 Banner + 信任标签 + 金价看板 + 信任与答疑三板块。
 * 金价看板的行动按钮即回收入口；浏览与估价不需要登录。
 */
export function HomePage() {
  const navigate = useNavigate()
  const [faqCategory, setFaqCategory] = useState<FaqCategory | 'all'>('all')
  const [openFaq, setOpenFaq] = useState<string | null>(null)

  const faqItems = FAQ_ITEMS.filter(
    (item) => faqCategory === 'all' || item.category === faqCategory,
  )

  const slides: PromoSlide[] = [
    {
      key: 'brand',
      label: '品牌',
      content: (
        <div className="relative h-48 w-full overflow-hidden bg-ink-900">
          <MediaVisual
            src={images.heroBrand}
            alt="金条与金饰陈列在深色丝绒上"
            priority
            className="absolute inset-0 h-full w-full"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-900/95 via-ink-900/55 to-ink-900/5" />
          <div className="relative flex h-full flex-col justify-center gap-2 p-4">
            <h1 className="font-serif text-title leading-tight text-paper">
              安盛华 · 黄金买卖平台
            </h1>
            <p className="text-caption text-paper/70">买金与回收共用同一账户与订单</p>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {BRAND_TAGS.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-paper/10 px-2 py-0.5 text-caption text-gold-100 ring-1 ring-gold-200/40"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'live',
      label: '检测直播',
      content: (
        <div className="relative h-48 w-full overflow-hidden bg-ink-900">
          <MediaVisual
            src={images.heroLive}
            alt="检测工位：金条与首饰在镜头下称重、验金"
            className="absolute inset-0 h-full w-full"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-900/95 via-ink-900/65 to-ink-900/10" />
          <div className="relative flex h-full flex-col justify-center gap-1.5 p-4">
            <p className="text-caption text-gold-200">集团检测 · 过程可见</p>
            <p className="font-serif text-section leading-snug text-paper">
              检测全程直播
              <br />
              录像存档 3 年
            </p>
            <p className="text-caption text-paper/70">破检前 30 分钟通知 · 每个价格节点可查</p>
          </div>
        </div>
      ),
    },
  ]

  return (
    <TabPage>
      <PromoCarousel slides={slides} />

      <RateBoard
        price={GOLD_RATE.price}
        source={GOLD_RATE.source}
        updatedAt={GOLD_RATE.updatedAt}
        series={RATE_SERIES}
        onRecover={() => navigate(paths.quote)}
        onBuy={() => navigate(paths.buy)}
      />

      <section className="space-y-2">
        <SectionTitle title="回收优势" note="为什么选择我们" />
        <Card padding="none" className="divide-y divide-border-subtle overflow-hidden">
          {ADVANTAGES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-center gap-3 px-4 py-3.5">
              <div className="min-w-0 flex-1">
                <p className="text-body-strong text-foreground">{title}</p>
                <p className="mt-1 text-caption text-subtle-foreground">{text}</p>
              </div>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-50 text-gold-700 ring-1 ring-gold-200">
                <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
              </span>
            </div>
          ))}
        </Card>
      </section>

      <section className="space-y-2">
        <SectionTitle title="合作品牌" note="渠道与资质" />
        <Card padding="none" className="overflow-hidden">
          <div className="marquee">
            <ul className="marquee-track py-2.5">
              {[...BRANDS, ...BRANDS].map((brand, index) => (
                <li
                  key={`${brand}-${index}`}
                  aria-hidden={index >= BRANDS.length ? true : undefined}
                  className="flex shrink-0 items-center gap-1.5 px-3 text-caption-strong text-muted-foreground"
                >
                  <span className="h-1 w-1 rounded-full bg-gold-300" aria-hidden="true" />
                  {brand}
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </section>

      <section className="space-y-2">
        <SectionTitle title="大家都在问" note={`${FAQ_ITEMS.length} 个高频问题`} />
        <Card padding="none" className="overflow-hidden">
          <div className="hide-scrollbar flex gap-2 overflow-x-auto px-4 py-3">
            {FAQ_CATEGORIES.map((category) => (
              <Chip
                key={category.value}
                active={category.value === faqCategory}
                onClick={() => {
                  setFaqCategory(category.value)
                  setOpenFaq(null)
                }}
              >
                {category.label}
              </Chip>
            ))}
          </div>

          <ul className="border-t border-border-subtle">
            {faqItems.map((item, index) => {
              const expanded = openFaq === item.id
              const panelId = `faq-${item.id}`
              return (
                <li
                  key={item.id}
                  className="border-b border-border-subtle last:border-b-0"
                >
                  <button
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={panelId}
                    onClick={() => setOpenFaq(expanded ? null : item.id)}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm bg-primary-soft text-caption-strong text-primary tabular">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="flex-1 text-body text-foreground">{item.question}</span>
                    <ChevronDown
                      size={16}
                      className={cn(
                        'mt-0.5 shrink-0 text-subtle-foreground transition',
                        expanded && 'rotate-180',
                      )}
                      aria-hidden="true"
                    />
                  </button>
                  {expanded ? (
                    <p id={panelId} className="px-4 pb-3 pl-12 text-caption text-muted-foreground">
                      {item.answer}
                    </p>
                  ) : null}
                </li>
              )
            })}
          </ul>
        </Card>
      </section>

      <section className="space-y-2">
        <SectionTitle title="关于安盛华" note="集团背景" />
        <Card padding="md" className="space-y-3">
          <p className="text-body text-muted-foreground">
            安盛华集团深耕黄金珠宝与贵金属贸易，经营黄金、白银、铂金及珠宝饰品的购销与进出口，
            是上海黄金交易所会员单位。回收业务以集团标准检测、全程录像与透明计价为基础，
            让每一克的来源与重量都可追溯。
          </p>

          <ul className="flex flex-wrap gap-1.5">
            {ABOUT_HONORS.map((honor) => (
              <li
                key={honor}
                className="rounded-full bg-gold-50 px-2.5 py-1 text-caption text-gold-800 ring-1 ring-gold-200"
              >
                {honor}
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </TabPage>
  )
}

/** 首页板块标题：左标题右注脚，保持与商品页同一条视觉基线。 */
function SectionTitle({ title, note }: { title: string; note?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <h2 className="text-card-title text-foreground">{title}</h2>
      {note ? <span className="text-caption text-subtle-foreground">{note}</span> : null}
    </div>
  )
}
