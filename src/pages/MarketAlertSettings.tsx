import {
  Badge,
  BottomSheet,
  Button,
  Card,
  ConfirmDialog,
  DetailPage,
  FormField,
  PickerSheet,
  SegmentedTabs,
  SwitchField,
  Toast,
} from '@/components'
import {
  ALERT_PRODUCT_TABS,
  PUSH_INTERVAL_HELP,
  PUSH_INTERVAL_OPTIONS,
  PUSH_TIME_PRESETS,
  PRICE_CHANGE_HELP,
  PRICE_CHANGE_OPTIONS,
  type AlertDirection,
  type AlertSettings,
  addAlert,
  quoteByCode,
  quoteName,
  readAlertSettings,
  readAlerts,
  removeAlert,
  writeAlertSettings,
} from '@/mocks/market'
import { formatDateTime } from '@/lib/money'
import { CircleHelp, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

type TopTab = 'setup' | 'list'

/**
 * 金价涨跌提醒设置（独立全屏二级页）。
 * 顶部：商品 SegmentedTabs（黄金/白银/铂金/K金） + 右侧「我的提醒」pill
 * 核心卡片：switch + 推送时机 + 提醒金价(销售价/回购价) + 目标价 + 推送间隔/价格波动 + 勿扰时间
 */
export function MarketAlertSettingsPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [topTab, setTopTab] = useState<TopTab>(() => (params.get('tab') === 'list' ? 'list' : 'setup'))
  const [draft, setDraft] = useState<AlertSettings>(() => readAlertSettings())

  // 每个商品独立管理目标价（按 productCode 存），避免切 tab 互相覆盖
  const [targetsByProduct, setTargetsByProduct] = useState<Record<string, { high: string; low: string }>>(() => {
    const init: Record<string, { high: string; low: string }> = {}
    ALERT_PRODUCT_TABS.forEach((t) => {
      init[t.code] = { high: '', low: '' }
    })
    return init
  })

  const [pushTimeOpen, setPushTimeOpen] = useState(false)
  const [dndOpen, setDndOpen] = useState(false)
  const [intervalHelpOpen, setIntervalHelpOpen] = useState(false)
  const [priceChangeHelpOpen, setPriceChangeHelpOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  const showToast = (message: string) => {
    setToast(message)
    setToastOpen(true)
  }

  const currentQuote = useMemo(
    () => quoteByCode(draft.productCode),
    [draft.productCode],
  )

  /** 当前参考价：跟随 priceMode（销售价 / 回购价）切换 */
  const currentRefPrice = useMemo(() => {
    if (!currentQuote) return null
    if (draft.priceMode === 'sale') {
      return currentQuote.salePrice ?? currentQuote.basePrice
    }
    return currentQuote.buybackPrice ?? currentQuote.basePrice
  }, [currentQuote, draft.priceMode])

  const currentTarget = targetsByProduct[draft.productCode] ?? { high: '', low: '' }
  const pushIntervalLabel =
    PUSH_INTERVAL_OPTIONS.find((o) => o.value === draft.pushInterval)?.label ?? ''
  const priceChangeLabel =
    PRICE_CHANGE_OPTIONS.find((o) => o.value === draft.priceChange)?.label ?? ''

  const highValid =
    currentTarget.high.trim() === '' || /^\d+(\.\d{1,2})?$/.test(currentTarget.high.trim())
  const lowValid =
    currentTarget.low.trim() === '' || /^\d+(\.\d{1,2})?$/.test(currentTarget.low.trim())
  const hasAnyTarget = currentTarget.high.trim() !== '' || currentTarget.low.trim() !== ''
  const canSave = draft.enabled && hasAnyTarget && highValid && lowValid

  // 进入页面时刷新我的提醒列表（list 模式下切 productCode 也重算以实时过滤）
  const [alertListVersion, setAlertListVersion] = useState(0)
  const allAlerts = useMemo(() => readAlerts(), [alertListVersion, draft.productCode])
  const filteredAlerts = allAlerts.filter((a) => a.code === draft.productCode)

  const handleSave = () => {
    if (!canSave || !currentQuote) return
    writeAlertSettings(draft)
    // 清掉同 productCode 已有的提醒（保持目标价最新）
    allAlerts
      .filter((a) => a.code === draft.productCode)
      .forEach((a) => removeAlert(a.id))
    if (currentTarget.high.trim() !== '') {
      addAlert({
        code: draft.productCode,
        direction: 'above' as AlertDirection,
        target: Number(currentTarget.high.trim()),
      })
    }
    if (currentTarget.low.trim() !== '') {
      addAlert({
        code: draft.productCode,
        direction: 'below' as AlertDirection,
        target: Number(currentTarget.low.trim()),
      })
    }
    setAlertListVersion((v) => v + 1)
    showToast('提醒已开启')
    setTopTab('list')
  }

  const priceUnit = currentQuote?.unit ?? '元/克'
  const productLabel = ALERT_PRODUCT_TABS.find((t) => t.code === draft.productCode)?.label ?? ''
  const priceModeLabel = draft.priceMode === 'sale' ? '销售价' : '回购价'

  return (
    <>
      <DetailPage
        title="金价涨跌提醒"
        onBack={() => navigate(-1)}
        footer={
          topTab === 'setup' ? (
            <Button block variant="primary" disabled={!canSave} onClick={handleSave}>
              设置提醒
            </Button>
          ) : undefined
        }
      >
        {/* 顶部：商品 Tab + 我的提醒 pill */}
        <div className="mb-3 flex items-center justify-between">
          <SegmentedTabs
            items={ALERT_PRODUCT_TABS.map((t) => ({ value: t.code, label: t.label }))}
            value={draft.productCode}
            onChange={(v) => setDraft((d) => ({ ...d, productCode: v }))}
            variant="underline"
            fill
            className="min-w-0 flex-1 bg-transparent px-0"
          />
          <button
            type="button"
            onClick={() => setTopTab((t) => (t === 'list' ? 'setup' : 'list'))}
            className={
              topTab === 'list'
                ? 'ml-2 rounded-full bg-primary px-3 py-1 text-caption text-primary-foreground'
                : 'ml-2 rounded-full bg-surface-2 px-3 py-1 text-caption text-subtle-foreground'
            }
          >
            {topTab === 'list' ? '返回设置' : '我的提醒'}
          </button>
        </div>

        {topTab === 'setup' ? (
          <SettingsContent
            draft={draft}
            setDraft={setDraft}
            currentQuote={currentQuote}
            currentRefPrice={currentRefPrice}
            productLabel={productLabel}
            priceModeLabel={priceModeLabel}
            priceUnit={priceUnit}
            currentTarget={currentTarget}
            setCurrentTarget={(t) =>
              setTargetsByProduct((m) => ({ ...m, [draft.productCode]: t }))
            }
            pushIntervalLabel={pushIntervalLabel}
            priceChangeLabel={priceChangeLabel}
            onPushTimeOpen={() => setPushTimeOpen(true)}
            onDndOpen={() => setDndOpen(true)}
            onIntervalHelp={() => setIntervalHelpOpen(true)}
            onPriceChangeHelp={() => setPriceChangeHelpOpen(true)}
          />
        ) : (
          <AlertsListContent
            alerts={filteredAlerts}
            autoDeleteTriggered={draft.autoDeleteTriggered}
            onToggleAuto={(v) => {
              const next = { ...draft, autoDeleteTriggered: v }
              setDraft(next)
              writeAlertSettings(next)
            }}
            onDelete={(id) => {
              removeAlert(id)
              setAlertListVersion((v) => v + 1)
              showToast('已删除提醒')
            }}
            onAddNew={() => setTopTab('setup')}
          />
        )}
      </DetailPage>

      <PickerSheet
        open={pushTimeOpen}
        onClose={() => setPushTimeOpen(false)}
        title="推送时机"
        options={PUSH_TIME_PRESETS.map((o) => ({ value: o.value, label: o.label }))}
        value={draft.pushTime}
        onConfirm={(v) => setDraft((d) => ({ ...d, pushTime: v }))}
        footnote="每日将按所选时机推送价格通知"
      />

      <DoNotDisturbSheet
        open={dndOpen}
        onClose={() => setDndOpen(false)}
        value={draft.doNotDisturb}
        onConfirm={(v) => setDraft((d) => ({ ...d, doNotDisturb: v }))}
        onClear={() => setDraft((d) => ({ ...d, doNotDisturb: null }))}
      />

      <ConfirmDialog
        open={intervalHelpOpen}
        title="推送间隔说明"
        description={PUSH_INTERVAL_HELP}
        confirmOnly
        confirmText="知道了"
        onClose={() => setIntervalHelpOpen(false)}
        onConfirm={() => setIntervalHelpOpen(false)}
      />

      <ConfirmDialog
        open={priceChangeHelpOpen}
        title="价格波动说明"
        description={PRICE_CHANGE_HELP}
        confirmOnly
        confirmText="知道了"
        onClose={() => setPriceChangeHelpOpen(false)}
        onConfirm={() => setPriceChangeHelpOpen(false)}
      />

      <Toast open={toastOpen} message={toast} onClose={() => setToastOpen(false)} />
    </>
  )
}

// ============ 设置面板（左侧商品 Tab 内容） ============

function SettingsContent({
  draft,
  setDraft,
  currentQuote,
  currentRefPrice,
  productLabel,
  priceModeLabel,
  priceUnit,
  currentTarget,
  setCurrentTarget,
  pushIntervalLabel,
  priceChangeLabel,
  onPushTimeOpen,
  onDndOpen,
  onIntervalHelp,
  onPriceChangeHelp,
}: {
  draft: AlertSettings
  setDraft: (updater: (d: AlertSettings) => AlertSettings) => void
  currentQuote: ReturnType<typeof quoteByCode>
  currentRefPrice: number | null
  productLabel: string
  priceModeLabel: string
  priceUnit: string
  currentTarget: { high: string; low: string }
  setCurrentTarget: (t: { high: string; low: string }) => void
  pushIntervalLabel: string
  priceChangeLabel: string
  onPushTimeOpen: () => void
  onDndOpen: () => void
  onIntervalHelp: () => void
  onPriceChangeHelp: () => void
}) {
  const highValid =
    currentTarget.high.trim() === '' || /^\d+(\.\d{1,2})?$/.test(currentTarget.high.trim())
  const lowValid =
    currentTarget.low.trim() === '' || /^\d+(\.\d{1,2})?$/.test(currentTarget.low.trim())

  const fmtPrice = (value: number | null) =>
    value == null ? '--' : value.toFixed(currentQuote?.precision ?? 2)

  return (
    <div className="space-y-3">
      {/* ============ 卡片 1：开关 + 推送时机 ============ */}
      <Card padding="md" className="space-y-0">
        <SwitchField
          label="每日价格提醒"
          description="开启后按您所选的时机推送价格通知"
          checked={draft.enabled}
          onChange={(enabled) => setDraft((d) => ({ ...d, enabled }))}
        />

        {draft.enabled && (
          <>
            <div className="my-3 h-px bg-border-subtle" />
            <div className="flex items-center justify-between">
              <p className="text-body text-foreground">推送时机</p>
              <button
                type="button"
                onClick={onPushTimeOpen}
                className="flex items-center gap-1 text-caption text-primary active:text-primary-active"
              >
                <span className="tabular">{draft.pushTime}</span>
                <span>设置</span>
              </button>
            </div>
            <p className="mt-1 text-caption text-subtle-foreground">
              每日 {draft.pushTime} 推送价格通知
            </p>
          </>
        )}
      </Card>

      {/* ============ 卡片 2：提醒金价 + 目标价 ============ */}
      {draft.enabled && (
        <Card padding="md" className="space-y-4">
          {/* 提醒金价 SegmentedTabs */}
          <div className="space-y-2">
            <p className="text-body text-foreground">提醒金价</p>
            <SegmentedTabs
              items={[
                { value: 'sale', label: '销售价' },
                { value: 'buyback', label: '回购价' },
              ]}
              value={draft.priceMode}
              onChange={(v) => setDraft((d) => ({ ...d, priceMode: v as 'sale' | 'buyback' }))}
              variant="pill"
              fill
              className="bg-surface-2"
            />
          </div>

          {/* 当前参考价（跟随模式切换） */}
          <div className="rounded-sm bg-surface-2 px-3 py-2.5">
            <p className="text-caption text-subtle-foreground">
              当前 {productLabel}{priceModeLabel}
            </p>
            <p className="mt-1 text-body-strong tabular text-price">
              ¥{fmtPrice(currentRefPrice)} {priceUnit}
            </p>
          </div>

          {/* 目标价输入（上涨至 / 下跌至） */}
          <div className="space-y-3">
            <FormField
              label={`${productLabel}高于`}
              value={currentTarget.high}
              onChange={(v) => setCurrentTarget({ ...currentTarget, high: v })}
              unit={`${priceUnit}提醒`}
              inputMode="decimal"
              placeholder="0.00"
              error={!highValid ? '请输入正确的目标价（最多 2 位小数）' : undefined}
            />
            <FormField
              label={`${productLabel}低于`}
              value={currentTarget.low}
              onChange={(v) => setCurrentTarget({ ...currentTarget, low: v })}
              unit={`${priceUnit}提醒`}
              inputMode="decimal"
              placeholder="0.00"
              error={!lowValid ? '请输入正确的目标价（最多 2 位小数）' : undefined}
            />
          </div>
        </Card>
      )}

      {/* ============ 卡片 3：推送间隔 + 价格波动 + 勿扰时间 ============ */}
      {draft.enabled && (
        <Card padding="md" className="space-y-4">
          <HelpRow
            label="推送间隔"
            hint="触发后推送 1 次"
            icon={<CircleHelp size={14} />}
            iconTitle="查看说明"
            value={draft.pushInterval}
            options={PUSH_INTERVAL_OPTIONS}
            displayValue={pushIntervalLabel}
            onChange={(v) => setDraft((d) => ({ ...d, pushInterval: v }))}
            onHelp={onIntervalHelp}
          />
          <HelpRow
            label="价格波动"
            hint="触发后推送 1 次"
            icon={<CircleHelp size={14} />}
            iconTitle="查看说明"
            value={draft.priceChange}
            options={PRICE_CHANGE_OPTIONS}
            displayValue={priceChangeLabel}
            onChange={(v) => setDraft((d) => ({ ...d, priceChange: v }))}
            onHelp={onPriceChangeHelp}
          />
          <div className="h-px bg-border-subtle" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body text-foreground">勿扰时间</p>
              <p className="mt-0.5 text-caption text-subtle-foreground">
                勿扰时段内不推送价格通知
              </p>
            </div>
            <button
              type="button"
              onClick={onDndOpen}
              className="text-caption text-primary active:text-primary-active"
            >
              {draft.doNotDisturb ? '已设置' : '设置'}
            </button>
          </div>
          {draft.doNotDisturb && (
            <div className="rounded-sm bg-surface-2 px-3 py-2.5 text-body tabular text-muted-foreground">
              {draft.doNotDisturb.start} 至 {draft.doNotDisturb.end}
            </div>
          )}
        </Card>
      )}

      {/* ============ 底部说明 ============ */}
      {draft.enabled && (
        <p className="text-center text-caption text-subtle-foreground">
          提醒通过「微信服务通知」下发，开启后需在微信内允许订阅消息
        </p>
      )}

      {/* ============ 关闭后空态提示 ============ */}
      {!draft.enabled && (
        <Card padding="lg" className="text-center">
          <p className="text-body text-muted-foreground">
            开启每日价格提醒后可设置推送条件
          </p>
        </Card>
      )}
    </div>
  )
}

// ============ 帮助行（label + ? + select + hint） ============

function HelpRow({
  label,
  hint,
  icon,
  iconTitle,
  value,
  options,
  displayValue,
  onChange,
  onHelp,
}: {
  label: string
  hint: string
  icon: React.ReactNode
  iconTitle?: string
  value: string
  options: { value: string; label: string }[]
  displayValue: string
  onChange: (value: string) => void
  onHelp: () => void
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onHelp}
        title={iconTitle}
        className="flex items-center gap-1 text-body text-foreground"
      >
        <span>{label}</span>
        <span className="text-icon-muted">{icon}</span>
      </button>
      <div className="flex-1" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-sm bg-surface-2 px-3 text-body text-foreground tabular outline-none active:bg-surface-3"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <p className="min-w-[72px] text-right text-caption text-subtle-foreground">{hint}</p>
    </div>
  )
}

// ============ 我的提醒（右侧 Tab 内容） ============

function AlertsListContent({
  alerts,
  autoDeleteTriggered,
  onToggleAuto,
  onDelete,
  onAddNew,
}: {
  alerts: ReturnType<typeof readAlerts>
  autoDeleteTriggered: boolean
  onToggleAuto: (v: boolean) => void
  onDelete: (id: string) => void
  onAddNew: () => void
}) {
  return (
    <div className="space-y-3">
      <Card padding="md">
        <div className="flex items-center justify-between">
          <p className="text-body text-foreground">
            我的提醒 <span className="tabular text-subtle-foreground">共 {alerts.length} 条</span>
          </p>
          <SwitchField
            label="开启后自动删除已触发提醒"
            checked={autoDeleteTriggered}
            onChange={onToggleAuto}
            className="!rounded-sm !bg-surface-2 !ring-0"
          />
        </div>
      </Card>

      {alerts.length === 0 ? (
        <Card padding="lg" className="text-center">
          <p className="text-body text-muted-foreground">还没有设置提醒</p>
          <Button variant="secondary" size="sm" className="mt-3" onClick={onAddNew}>
            去设置
          </Button>
        </Card>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert) => {
            const productLabel = ALERT_PRODUCT_TABS.find((t) => t.code === alert.code)?.label ?? quoteName(alert.code)
            const direction = alert.direction === 'above' ? '上涨至' : '下跌至'
            return (
              <Card key={alert.id} padding="md" className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge tone={alert.status === 'pending' ? 'info' : 'success'}>{productLabel}</Badge>
                    <Badge tone={alert.status === 'pending' ? 'info' : 'success'}>
                      {alert.status === 'pending' ? '监控中' : '已触发'}
                    </Badge>
                  </div>
                  <p className="text-caption text-subtle-foreground tabular">
                    {formatDateTime(alert.createdAt)}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-body-strong text-foreground tabular">
                    {direction} {alert.target.toFixed(2)}
                  </p>
                  <button
                    type="button"
                    onClick={() => onDelete(alert.id)}
                    className="inline-flex items-center gap-1 text-caption text-destructive active:text-destructive/80"
                  >
                    <Trash2 size={12} />
                    删除
                  </button>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ============ 勿扰时间 Sheet ============

function DoNotDisturbSheet({
  open,
  onClose,
  value,
  onConfirm,
  onClear,
}: {
  open: boolean
  onClose: () => void
  value: { start: string; end: string } | null
  onConfirm: (v: { start: string; end: string }) => void
  onClear: () => void
}) {
  const [start, setStart] = useState(value?.start ?? '22:00')
  const [end, setEnd] = useState(value?.end ?? '08:00')

  useEffect(() => {
    if (open) {
      setStart(value?.start ?? '22:00')
      setEnd(value?.end ?? '08:00')
    }
  }, [open, value])

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="勿扰时间"
      footer={
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              onClear()
              onClose()
            }}
          >
            不设置
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="flex-1"
            onClick={() => {
              onConfirm({ start, end })
              onClose()
            }}
          >
            确定
          </Button>
        </div>
      }
    >
      <div className="flex items-center justify-center gap-3 py-2">
        <div className="flex flex-col items-center gap-1">
          <span className="text-caption text-subtle-foreground">开始</span>
          <input
            type="time"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="rounded-sm bg-surface-2 px-3 py-2 text-body tabular outline-none"
          />
        </div>
        <span className="text-body text-muted-foreground">至</span>
        <div className="flex flex-col items-center gap-1">
          <span className="text-caption text-subtle-foreground">结束</span>
          <input
            type="time"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="rounded-sm bg-surface-2 px-3 py-2 text-body tabular outline-none"
          />
        </div>
      </div>
    </BottomSheet>
  )
}
