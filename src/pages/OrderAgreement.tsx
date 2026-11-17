import { AgreementCheck, Badge, BottomSheet, Button, Card, DetailPage, InlineNotice, RuleSheet, TextLink } from '@/components'
import { useState } from 'react'

import {
  AGREEMENT_VERSIONS,
  readOrderDraft,
  sourceLabel,
  writeOrderDraft,
} from '@/mocks/orderFlow'
import { formatClock } from '@/mocks/quote'
import {
  DESTRUCTIVE_AUTHORIZATION_RULES,
  DESTRUCTIVE_CONFIRM_POINTS,
  PRICE_PROTECTION_RULES,
  SERVICE_AGREEMENT_RULES,
} from '@/mocks/rules'
import { useOrderStep } from '@/flows/orderSteps'

/**
 * 协议与破检授权：
 * - 服务协议、保价规则分别勾选；
 * - 来源声明只读展示（P-09 已确认）；
 * - 破检授权单独勾选并二次确认，任何一项缺失都不能进入下一步。
 */
export function OrderAgreementPage() {
  const { nextLabel, goNext, goBack } = useOrderStep('agreement')
  const [draft] = useState(readOrderDraft)
  const [serviceAgreed, setServiceAgreed] = useState(draft.serviceAgreed)
  const [protectionAgreed, setProtectionAgreed] = useState(draft.insuranceRuleAgreed)
  const [destructive, setDestructive] = useState(draft.destructiveAuthorized)
  const [destructiveAt, setDestructiveAt] = useState(draft.destructiveConfirmedAt)
  const [serviceSheet, setServiceSheet] = useState(false)
  const [protectionSheet, setProtectionSheet] = useState(false)
  const [destructiveRuleSheet, setDestructiveRuleSheet] = useState(false)
  const [destructiveConfirmSheet, setDestructiveConfirmSheet] = useState(false)

  const sourceReady = Boolean(draft.sourceConfirmedAt && draft.source)
  const canSubmit = sourceReady && serviceAgreed && protectionAgreed && destructive

  const missing = [
    !sourceReady ? '合法来源声明（第 2 步）' : '',
    !serviceAgreed ? '回收服务协议' : '',
    !protectionAgreed ? '保价规则' : '',
    !destructive ? '破检授权' : '',
  ].filter(Boolean)

  const handleDestructiveChange = (next: boolean) => {
    if (!next) {
      setDestructive(false)
      setDestructiveAt('')
      return
    }
    setDestructiveConfirmSheet(true)
  }

  const confirmDestructive = () => {
    setDestructive(true)
    setDestructiveAt(formatClock())
    setDestructiveConfirmSheet(false)
  }

  const handleNext = () => {
    if (!canSubmit) return

    writeOrderDraft({
      serviceAgreed,
      insuranceRuleAgreed: protectionAgreed,
      agreementsConfirmedAt: formatClock(),
      destructiveAuthorized: destructive,
      destructiveConfirmedAt: destructiveAt,
    })
    goNext?.()
  }

  return (
    <DetailPage
      title="协议与破检授权"
      footer={
        <Button size="lg" block disabled={!canSubmit} onClick={handleNext}>
          {nextLabel}
        </Button>
      }
    >
      <Card padding="md" className="space-y-2">
        <h2 className="text-card-title text-foreground">关键条款速览</h2>
        <ul className="list-disc space-y-1 pl-5 text-body text-muted-foreground">
          <li>默认破检：检测会熔炼取样，检测后品相不可还原。</li>
          <li>非金配件不计入可熔重量，最终按实际检测克重与纯度结算。</li>
          <li>最终金额按检测完成时点金价计算，需您在 30 分钟内确认。</li>
          <li>检测全程直播，录像保存 3 年。</li>
        </ul>
      </Card>

      <Card padding="md" className="space-y-3">
        <h2 className="text-card-title text-foreground">协议确认</h2>

        <div className="space-y-2">
          <AgreementCheck checked={serviceAgreed} onChange={setServiceAgreed}>
            我已阅读并同意《回收服务协议》· {AGREEMENT_VERSIONS.service}
          </AgreementCheck>
          <div className="flex justify-end">
            <TextLink onClick={() => setServiceSheet(true)}>查看全文</TextLink>
          </div>
        </div>

        <div className="space-y-2 border-t border-border-subtle pt-3">
          <AgreementCheck checked={protectionAgreed} onChange={setProtectionAgreed}>
            我已阅读并同意《保价规则》· {AGREEMENT_VERSIONS.protection}
          </AgreementCheck>
          <div className="flex justify-end">
            <TextLink onClick={() => setProtectionSheet(true)}>查看全文</TextLink>
          </div>
        </div>

        <div className="border-t border-border-subtle pt-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-body-strong text-foreground">合法来源声明</p>
              <p className="mt-1 text-caption text-subtle-foreground">
                {sourceReady
                  ? `${sourceLabel(draft.source)} · ${AGREEMENT_VERSIONS.source} · ${draft.sourceConfirmedAt}`
                  : '尚未完成，请返回第 2 步'}
              </p>
            </div>
            <Badge tone={sourceReady ? 'success' : 'warning'}>
              {sourceReady ? '已确认' : '待完成'}
            </Badge>
          </div>
        </div>
      </Card>

      {!sourceReady ? (
        <Card padding="md" className="space-y-2">
          <p className="text-body-strong text-foreground">来源声明尚未完成</p>
          <p className="text-body text-muted-foreground">
            请先返回第 2 步完成来源选择与声明勾选，再继续本页。
          </p>
          <Button variant="secondary" onClick={() => goBack?.()}>
            返回第 2 步
          </Button>
        </Card>
      ) : null}

      <Card padding="md" className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-card-title text-foreground">破检授权</h2>
          <Badge tone={destructive ? 'success' : 'warning'}>
            {destructive ? '已授权' : '需单独确认'}
          </Badge>
        </div>
        <p className="text-body text-muted-foreground">
          检测会熔炼取样，检测后品相不可还原，请单独确认授权。
        </p>
        <AgreementCheck checked={destructive} onChange={handleDestructiveChange}>
          我已知悉破检不可还原，并单独授权平台进行破坏性检测。
        </AgreementCheck>
        <div className="flex justify-end">
          <TextLink onClick={() => setDestructiveRuleSheet(true)}>查看破检授权全文</TextLink>
        </div>
        {destructiveAt ? (
          <p className="text-caption text-subtle-foreground">已确认 · {destructiveAt}</p>
        ) : null}
      </Card>

      {missing.length > 0 ? (
        <InlineNotice tone="info" title="还需完成">
          {missing.join('、')}
        </InlineNotice>
      ) : null}

      <RuleSheet
        open={serviceSheet}
        onClose={() => setServiceSheet(false)}
        title={`回收服务协议 · ${AGREEMENT_VERSIONS.service}`}
        sections={SERVICE_AGREEMENT_RULES}
      />
      <RuleSheet
        open={protectionSheet}
        onClose={() => setProtectionSheet(false)}
        title={`保价规则 · ${AGREEMENT_VERSIONS.protection}`}
        sections={PRICE_PROTECTION_RULES}
      />
      <RuleSheet
        open={destructiveRuleSheet}
        onClose={() => setDestructiveRuleSheet(false)}
        title={`破检授权 · ${AGREEMENT_VERSIONS.destructive}`}
        sections={DESTRUCTIVE_AUTHORIZATION_RULES}
      />

      <BottomSheet
        open={destructiveConfirmSheet}
        onClose={() => setDestructiveConfirmSheet(false)}
        title="确认破检授权"
        footer={
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              block
              onClick={() => setDestructiveConfirmSheet(false)}
            >
              暂不授权
            </Button>
            <Button block onClick={confirmDestructive}>
              确认授权
            </Button>
          </div>
        }
      >
        <p className="text-body text-muted-foreground">
          检测后品相不可还原，请确认你已理解以下内容：
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-body text-muted-foreground">
          {DESTRUCTIVE_CONFIRM_POINTS.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
        <p className="mt-3 text-caption text-subtle-foreground">
          确认后将记录授权时间，并与本订单绑定。
        </p>
      </BottomSheet>
    </DetailPage>
  )
}
