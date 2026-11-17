import { useState } from 'react'
import { images } from '@/assets/images'
import { AddressCard } from '@/components/AddressCard'
import { AmountSummary } from '@/components/AmountSummary'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { LegalDocument } from '@/components/LegalDocument'
import { LocationField, type LocationOption } from '@/components/LocationField'
import { OrderStatusHeader } from '@/components/OrderStatusHeader'
import { RuleSheet } from '@/components/RuleSheet'
import { UploadGroup } from '@/components/UploadGroup'
import { GuideFooter, GuidePage, Section } from './shared'

const LOCATIONS: LocationOption[] = [
  { key: 'taiping', label: '太平洋工业区', detail: '广东省 深圳市 盐田区 深盐路2088号' },
  { key: 'caitian', label: '彩田工业园', detail: '广东省 深圳市 福田区 彩田路7006号' },
]

/** 黄金回收 · 交易与收货域 */
export function TradeGuidePage() {
  const [photos, setPhotos] = useState<string[]>([])
  const [invoices, setInvoices] = useState<string[]>([])
  const [selectedAddress, setSelectedAddress] = useState('home')
  const [rulesOpen, setRulesOpen] = useState(false)
  const [location, setLocation] = useState<LocationOption>(LOCATIONS[0])
  const [doorNo, setDoorNo] = useState('3栋')

  return (
    <GuidePage title="交易与收货">
      <Section title="订单状态头部 OrderStatusHeader">
        <OrderStatusHeader status="待打款" note="请确认收款账户，到账时间以银行为准" />
        <OrderStatusHeader status="已完成" tone="success" reason="款项已转入尾号 0000 的银行卡" />
        <OrderStatusHeader
          status="交易取消"
          tone="destructive"
          reason="取消原因：交易时间不方便"
        />
      </Section>

      <Section title="金额明细 AmountSummary">
        <AmountSummary
          rows={[
            { label: '商品价值', value: 8253.9, hint: '按预估克重 10 克 × 今日金价' },
            { label: '总服务费', value: -74.3, hint: '实际服务费 7.43 元/克' },
            {
              label: '优惠券抵扣',
              value: -90.8,
              hint: '黄金邮寄回收服务费折扣券（4.5 折）',
              tone: 'muted',
            },
          ]}
          total={{
            label: '总回收价',
            value: 8179.6,
            badge: <Badge tone="warning">预估</Badge>,
            note: '以上为预估价格',
          }}
          footnote="结算金价按检测完成时点的上海黄金交易所 Au99.99 为准，多退少补。"
        />
      </Section>

      <Section title="收货地址 AddressCard">
        <AddressCard
          name="陈先生"
          phone="176****5090"
          region="广东省 深圳市 盐田区"
          detail="深盐路2088号 太平洋工业区3栋"
          tag="默认"
          onAction={() => setSelectedAddress('home')}
        />
        <div className="text-caption text-subtle-foreground">选择形态：整卡可点，选中换主色描边。</div>
        <AddressCard
          mode="select"
          name="陈先生"
          phone="176****5090"
          region="广东省 深圳市 盐田区"
          detail="深盐路2088号 太平洋工业区3栋"
          tag="默认"
          selected={selectedAddress === 'home'}
          onClick={() => setSelectedAddress('home')}
        />
        <AddressCard
          mode="select"
          name="陈女士"
          phone="138****2046"
          region="广东省 深圳市 福田区"
          detail="彩田路7006号 彩田工业园2栋"
          selected={selectedAddress === 'office'}
          onClick={() => setSelectedAddress('office')}
        />
      </Section>

      <Section title="分组上传 UploadGroup">
        <UploadGroup
          title="黄金实物图"
          description="请上传黄金实物图片，需最少 1 张正面图、1 张反面图"
          required
          min={2}
          max={6}
          examples={[
            { src: images.sampleRing, alt: '正面示例' },
            { src: images.sampleBracelet, alt: '反面示例' },
          ]}
          value={photos}
          onChange={setPhotos}
        />
        <UploadGroup
          title="电子或纸质发票"
          description="下单克重需与发票一致，找不到发票可以不传"
          max={2}
          value={invoices}
          onChange={setInvoices}
        />
      </Section>

      <Section title="条款排版 LegalDocument">
        <LegalDocument
          title="熔检服务协议及合法来源承诺"
          preamble="《熔检服务协议》（以下简称「本协议」）由用户与平台在订单提交环节确认签署，签署后不可修改。"
          sections={[
            {
              key: 'definition',
              title: '第一条 相关定义',
              paragraphs: [
                '1.1 「转转」指本协议项下提供回收服务的平台运营方。',
                '1.2 「熔检」指对回收物品进行破坏性检测，检测后品相不可还原。',
              ],
            },
            {
              key: 'promise',
              title: '第二条 合法来源承诺',
              paragraphs: [
                '2.1 您承诺所提交物品来源合法，且为本人有权处分的财产。',
                '2.2 如因物品来源产生争议，由您承担全部责任。',
              ],
            },
          ]}
          footer="示例文本仅用于版式演示，不构成真实协议。"
        />
      </Section>

      <Section title="规则弹层 RuleSheet / DataTable">
        <Button variant="secondary" onClick={() => setRulesOpen(true)}>
          查看运保费规则
        </Button>
        <div className="text-caption text-subtle-foreground">
          分节标题 + 有序列表 + 三列表格；底部默认「我知道了」。
        </div>
      </Section>

      <Section title="地址选择 LocationField">
        <LocationField
          address={location.label}
          region={location.detail}
          doorNo={doorNo}
          onDoorNoChange={setDoorNo}
          options={LOCATIONS}
          onSelect={setLocation}
          required
        />
        <div className="text-caption text-subtle-foreground">
          点地址打开模拟选址弹层；地图缩略图仅为占位，不接入地图 SDK。
        </div>
      </Section>

      <GuideFooter>状态、金额、规则文案均由业务页映射，组件不内置业务枚举</GuideFooter>

      <RuleSheet
        open={rulesOpen}
        onClose={() => setRulesOpen(false)}
        title="运保费规则"
        sections={[
          {
            key: 'freight',
            title: '① 运费说明',
            items: [
              '邮寄回收过程中运费按固定标准收取：广东省内 18 元/单，省外 23 元/单。',
              '保价金额为您预估回收金额的千分之一，确认下单即认可该标准，双方按此标准结算。',
            ],
          },
          {
            key: 'concept',
            title: '② 概念解释',
            items: [
              '运费：指快递运输过程中产生的费用。',
              '保险费：指为确保快递运输过程中的安全，针对可能发生的丢失、损坏等风险，向快递公司支付的一定保险费用。',
            ],
            note: '寄出时按用户填写的预估克重上保，最终按检测后的实际克重为准。',
          },
          {
            key: 'bear',
            title: '③ 运费承担规则',
            table: {
              columns: [
                { key: 'weight', label: '克重标准' },
                { key: 'deal', label: '成交' },
                { key: 'return', label: '退货' },
              ],
              rows: [
                { weight: '检测后克重 ≥ 20 克', deal: '平台承担', return: '用户承担' },
                { weight: '检测后克重 < 20 克', deal: '用户承担', return: '用户承担' },
              ],
            },
          },
        ]}
      />
    </GuidePage>
  )
}
