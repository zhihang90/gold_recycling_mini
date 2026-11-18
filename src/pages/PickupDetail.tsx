import {
  BottomSheet,
  Button,
  Card,
  DetailPage,
  IconButton,
  KeyValueRow,
  MediaVisual,
  PriceText,
  StatusSteps,
  TextLink,
  Toast,
} from '@/components'
import { FlaskConical, PackageCheck, Phone } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { images } from '@/assets/images'
import { paths } from '@/routes/paths'

const PICKUP_STEPS = [
  { key: 'audit', label: '订单审核' },
  { key: 'transport', label: '包裹运输' },
  { key: 'inspect', label: '专业检测' },
  { key: 'confirm', label: '确认金额' },
  { key: 'finish', label: '交易完成' },
]

/**
 * 邮寄回收待取件 / 物流跟踪详情（阅宝图 5）。
 * 展示 5 步状态、物流信息、订单信息，底部提供取消订单入口。
 */
export function PickupDetailPage() {
  const navigate = useNavigate()
  const [cancelOpen, setCancelOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  return (
    <DetailPage
      title="订单详情"
      footer={
        <div className="flex justify-end">
          <Button variant="tertiary" onClick={() => setCancelOpen(true)}>
            取消订单
          </Button>
        </div>
      }
    >
      {/* 金色渐变 hero */}
      <section className="relative overflow-hidden rounded-lg bg-gradient-to-br from-gold-100 via-gold-50 to-gold-100 px-4 py-5">
        <PackageCheck
          size={28}
          className="absolute right-3 top-3 text-gold-700/60"
          aria-hidden="true"
        />
        <h1 className="font-serif text-title leading-tight text-ink-900">待取件</h1>
        <p className="mt-1 text-body text-ink-800/80">快递小哥正在赶来的路上</p>
      </section>

      {/* 5 步状态条 */}
      <Card padding="md">
        <StatusSteps steps={PICKUP_STEPS} currentIndex={1} />
      </Card>

      {/* 物流信息 */}
      <Card padding="md" className="space-y-3">
        <p className="text-body-strong text-foreground">物流信息</p>
        <div className="space-y-2">
          <div className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-2 text-caption text-muted-foreground ring-1 ring-border-subtle">
              寄
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-body-strong text-foreground">
                陈先生{' '}
                <span className="ml-1 text-caption text-subtle-foreground tabular">
                  176****5090
                </span>
              </p>
              <p className="mt-0.5 text-caption text-muted-foreground">
                广东省深圳市盐田区梧桐路太平洋工业区 3 栋 6 楼
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold-100 text-caption text-gold-700 ring-1 ring-gold-200">
              收
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-body-strong text-foreground">南京国检中心</p>
                <IconButton
                  icon={Phone}
                  label="联系检测中心"
                  onClick={() => setToast('正在为您接入检测中心客服')}
                  className="text-gold-700"
                />
              </div>
              <p className="mt-0.5 text-caption text-muted-foreground">
                广东省深圳市罗湖区金展珠宝广场 A 座 19 楼南检大厅 1 号窗口
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-md bg-gold-50 px-3 py-2 text-caption text-gold-800 ring-1 ring-gold-200 tabular">
          取件时间：11 月 20 日 【后天】 19:00 – 20:00
        </div>
      </Card>

      {/* 南京国检推广卡 */}
      <Card
        padding="sm"
        className="flex items-center gap-3 bg-gradient-to-r from-gold-100 via-gold-50 to-gold-100 ring-gold-200"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-card text-gold-700 ring-1 ring-gold-200">
          <FlaskConical size={18} aria-hidden="true" />
        </span>
        <p className="min-w-0 flex-1 text-body-strong text-ink-900">
          南京国检将为您提供专业的检测服务
        </p>
      </Card>

      {/* 常见问题 */}
      <Card padding="md" className="space-y-3">
        <p className="text-body-strong text-foreground">常见问题</p>
        <div className="space-y-1.5 rounded-md bg-surface-2 p-3">
          <p className="text-body text-foreground">
            <span className="mr-1 text-caption text-gold-700">问</span>
            关于邮寄回收运费和保险说明？
          </p>
          <p className="text-caption text-muted-foreground">
            <span className="mr-1 text-caption text-ink-500">答</span>
            当黄金材料达到 20
            克时，将自动享受运费和保险费全免服务。若不足 20
            克，系统会自动测算需承担的部分费用，从回收款项中扣除。
          </p>
        </div>
      </Card>

      {/* 订单信息 */}
      <Card padding="md" className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-body text-muted-foreground">预估回收金额</p>
            <PriceText value={5763.55} size="title" tone="price" className="mt-1" />
          </div>
          <TextLink
            onClick={() => navigate(paths.quote)}
            showArrow
            className="shrink-0 text-caption"
          >
            估价明细
          </TextLink>
        </div>
        <p className="text-caption text-muted-foreground">
          预估回收金额是基于您下单时的金价、预估克重、运费、保险费等综合计算的参考价格，不代表最终成交金额。
        </p>
        <div className="flex gap-2">
          {[images.productBar1g, images.productBar5g].map((src, index) => (
            <div
              key={src}
              className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-surface-2 ring-1 ring-border-subtle"
            >
              <MediaVisual
                src={src}
                alt={`物品图 ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
          <div className="flex min-w-0 flex-1 flex-col items-end justify-center text-right">
            <span className="text-body-strong text-foreground">金条</span>
            <span className="text-caption text-muted-foreground tabular">共 10.00 g</span>
          </div>
        </div>

        <div className="border-t border-border-subtle pt-2">
          <KeyValueRow
            label="订单编号"
            value={<span className="tabular">2122894358855286784</span>}
          />
          <KeyValueRow label="订单类型" value="邮寄回收" />
          <KeyValueRow label="实名信息" value="陈*航（已实名）" />
          <KeyValueRow label="收款方式" value="银行卡" />
          <KeyValueRow
            label="收款账号"
            value={<span className="tabular">深发 / 平安银行 **** 9455</span>}
          />
          <KeyValueRow label="下单时间" value={<span className="tabular">2026-11-18 11:27</span>} />
        </div>
      </Card>

      <BottomSheet
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="取消订单"
        footer={
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" block onClick={() => setCancelOpen(false)}>
              再想想
            </Button>
            <Button
              variant="danger"
              block
              onClick={() => {
                setCancelOpen(false)
                navigate(paths.orders, { replace: true })
              }}
            >
              确认取消
            </Button>
          </div>
        }
      >
        <p className="text-body text-muted-foreground">
          取件已安排，取消后本单将关闭。如仍需回收，可重新预约取件。
        </p>
      </BottomSheet>

      <Toast open={Boolean(toast)} message={toast ?? ''} onClose={() => setToast(null)} />
    </DetailPage>
  )
}
