import { Building2, FileBadge, Landmark, ShieldCheck } from 'lucide-react'

import { Card } from './Card'
import { cn } from '@/lib/utils'

/** 平台资质：名称、证书编号、发证机构，编号可对照实物资质核验 */
const PLATFORM_QUALIFICATIONS = [
  {
    id: 'shgold',
    name: '上海黄金交易所会员',
    code: 'SHGOLD-M-2021-0312',
    issuer: '上海黄金交易所 · 综合类会员',
    icon: Landmark,
  },
  {
    id: 'gold-license',
    name: '黄金业务经营许可证',
    code: 'GOLD-2021-BJ-0088',
    issuer: '中国人民银行',
    icon: Building2,
  },
  {
    id: 'pmc',
    name: '贵金属交易资质',
    code: 'PMC-2022-0156',
    issuer: '中国银保监会',
    icon: ShieldCheck,
  },
  {
    id: 'business-license',
    name: '营业执照',
    code: '91110115MA01XXXXX',
    issuer: '北京市市场监督管理局',
    icon: FileBadge,
  },
]

/** 平台资质卡：首页与「关于我们」共用，展示四项可核验资质 */
export function PlatformQualificationsCard({ className }: { className?: string }) {
  return (
    <Card padding="none" className={cn('overflow-hidden', className)}>
      <div className="flex items-center gap-2 border-b border-border-subtle px-4 py-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gold-50 text-gold-800">
          <ShieldCheck size={16} aria-hidden="true" />
        </span>
        <h2 className="flex-1 text-card-title text-foreground">平台资质</h2>
      </div>

      <div className="grid grid-cols-2 gap-px bg-border-subtle">
        {PLATFORM_QUALIFICATIONS.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.id} className="bg-card p-3">
              <div className="flex items-start gap-1.5">
                <Icon size={16} className="mt-0.5 shrink-0 text-gold-700" aria-hidden="true" />
                <p className="min-w-0 text-body-strong text-foreground">{item.name}</p>
              </div>
              <p className="mt-1.5 tabular text-caption text-gold-800">{item.code}</p>
              <p className="mt-0.5 text-caption text-subtle-foreground">{item.issuer}</p>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
