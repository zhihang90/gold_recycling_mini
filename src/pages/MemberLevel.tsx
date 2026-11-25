import { Badge, Card, DetailPage } from '@/components'
import { cn } from '@/lib/utils'
import { MEMBER_LEVELS, nextMemberLevel, readMemberLevel } from '@/mocks/member'
import { Sparkles } from 'lucide-react'

/** 额度不带小数，避免「¥50,000.00」这类噪声 */
function formatLimit(value: number) {
  return `¥${value.toLocaleString('zh-CN')}`
}

/**
 * 会员等级说明：当前等级 + 四档等级与单日限额 + 规则。
 * 注册登录即普通会员，等级由累计买入金额自动评定。
 */
export function MemberLevelPage() {
  const current = readMemberLevel()
  const next = nextMemberLevel(current)

  return (
    <DetailPage title="会员等级">
      {/* 当前等级 */}
      <Card padding="md" className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-caption text-subtle-foreground">当前等级</p>
            <div className="mt-1 flex items-center gap-2">
              <p className="text-section text-foreground">{current.name}</p>
              <Badge tone="gold">{current.id}</Badge>
            </div>
          </div>
          <div className="shrink-0 rounded-md bg-primary-soft px-3 py-2 text-right ring-1 ring-primary-border">
            <p className="text-caption text-muted-foreground">单日累计买入额度</p>
            <p className="mt-0.5 tabular text-card-title text-primary">
              {formatLimit(current.dailyLimit)}
            </p>
          </div>
        </div>

        {next ? (
          <div className="flex items-center gap-2 rounded-md bg-surface-2 px-3 py-2">
            <Sparkles size={16} className="shrink-0 text-gold-700" aria-hidden="true" />
            <p className="text-caption text-muted-foreground">
              累计买入满{' '}
              <span className="tabular text-foreground">{formatLimit(next.threshold)}</span>{' '}
              自动升级为{next.name}
            </p>
          </div>
        ) : null}
      </Card>

      {/* 四档等级与额度 */}
      <Card padding="none" className="overflow-hidden">
        <div className="px-4 pt-4 pb-2">
          <h2 className="text-card-title text-foreground">会员等级与交易额度</h2>
          <p className="mt-0.5 text-caption text-subtle-foreground">等级越高，单日可买入金额越高</p>
        </div>
        <ul>
          {MEMBER_LEVELS.map((level, index) => {
            const active = level.id === current.id
            return (
              <li key={level.id} className={cn(index > 0 && 'border-t border-border-subtle')}>
                <div
                  className={cn(
                    'flex items-center gap-3 px-4 py-3',
                    active && 'bg-primary-soft/50',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-caption-strong',
                      active ? 'bg-primary text-primary-foreground' : 'bg-gold-50 text-gold-800',
                    )}
                  >
                    {level.id}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-body-strong text-foreground">{level.name}</p>
                      {active ? <Badge tone="primary">当前</Badge> : null}
                    </div>
                    <p className="mt-0.5 text-caption text-subtle-foreground">{level.condition}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-caption text-subtle-foreground">单日额度</p>
                    <p className="tabular text-body-strong text-foreground">
                      {formatLimit(level.dailyLimit)}
                    </p>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </Card>

      {/* 规则 */}
      <Card padding="md" className="space-y-2">
        <h2 className="text-card-title text-foreground">等级规则</h2>
        <ul className="space-y-1.5 text-caption text-muted-foreground">
          <li>注册登录即为普通会员。</li>
          <li>等级按账户累计买入金额自动评定，每日更新一次，无需申请。</li>
          <li>单日累计额度指单个自然日内买入黄金的累计金额上限。</li>
          <li>黄金回收（卖出）不影响会员等级。</li>
          <li>等级权益与额度以平台最新规则为准。</li>
        </ul>
      </Card>
    </DetailPage>
  )
}
