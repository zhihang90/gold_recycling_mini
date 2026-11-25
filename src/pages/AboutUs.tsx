import { Card, DetailPage, PlatformQualificationsCard } from '@/components'

const ABOUT_HONORS = [
  '上海黄金交易所会员单位',
  '中国黄金协会副会长单位',
  '中国珠宝玉石首饰行业协会副会长单位',
  '民营企业进出口 500 强',
]

export function AboutUsPage() {
  return (
    <DetailPage title="关于我们">
      <Card padding="md" className="space-y-3">
        <p className="text-body text-muted-foreground">
          安盛华集团深耕黄金珠宝与贵金属贸易，经营黄金、白银、铂金及珠宝饰品的购销与进出口，
          是上海黄金交易所会员单位。回收业务以集团标准检测、全程录像与透明计价为基础，
          让每一克的来源与重量都可追溯。
        </p>

        <h2 className="pt-1 text-body-strong text-foreground">资质与荣誉</h2>
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

      <PlatformQualificationsCard />

      <Card padding="md" className="space-y-2">
        <h2 className="text-body-strong text-foreground">联系我们</h2>
        <dl className="space-y-2 text-caption text-muted-foreground">
          <div className="flex justify-between gap-3">
            <dt className="shrink-0 text-subtle-foreground">客服热线</dt>
            <dd className="tabular text-foreground">400-888-8888</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="shrink-0 text-subtle-foreground">服务时间</dt>
            <dd className="text-foreground">周一至周日 9:00 - 21:00</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="shrink-0 text-subtle-foreground">公司地址</dt>
            <dd className="text-right text-foreground">上海市黄浦区外滩金融中心</dd>
          </div>
        </dl>
      </Card>
    </DetailPage>
  )
}
