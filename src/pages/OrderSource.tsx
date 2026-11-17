import { useState } from 'react'
import { AgreementCheck } from '@/components/AgreementCheck'
import { BottomSheet } from '@/components/BottomSheet'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { ChoiceGroup } from '@/components/ChoiceGroup'
import { DetailPage } from '@/components/DetailPage'
import { FormField } from '@/components/FormField'
import { InlineNotice } from '@/components/InlineNotice'
import { TextLink } from '@/components/TextLink'
import { useSubmitGuard } from '@/lib/useSubmitGuard'
import {
  DECLARATION_VERSION,
  SOURCE_DECLARATION,
  SOURCE_OPTIONS,
  readOrderDraft,
  writeOrderDraft,
} from '@/mocks/orderFlow'
import { formatClock } from '@/mocks/quote'
import { useOrderStep } from '@/flows/orderSteps'

/** 合法来源声明：来源选择与声明勾选只在本页完成，P-10 仅展示已确认版本与时间。 */
export function OrderSourcePage() {
  const { nextLabel, goNext } = useOrderStep('source')
  const [draft] = useState(readOrderDraft)
  const [source, setSource] = useState(draft.source)
  const [note, setNote] = useState(draft.sourceNote)
  const [confirmed, setConfirmed] = useState(Boolean(draft.sourceConfirmedAt))
  const { submitted, attempt, reset } = useSubmitGuard()
  const [fullOpen, setFullOpen] = useState(false)

  const noteRequired = source === 'other'
  const sourceError = submitted && !source ? '请选择物品来源' : undefined
  const noteError =
    submitted && noteRequired && note.trim() === '' ? '请补充说明物品来源' : undefined
  const agreementError = submitted && !confirmed ? '请勾选并确认来源声明' : undefined

  const handleNext = () => {
    const valid = Boolean(source) && (!noteRequired || note.trim() !== '') && confirmed
    if (!attempt(valid)) return

    writeOrderDraft({
      source,
      sourceNote: note,
      sourceConfirmedAt: formatClock(),
    })
    goNext?.()
  }

  return (
    <DetailPage
      title="合法来源声明"
      footer={
        <Button size="lg" block onClick={handleNext}>
          {nextLabel}
        </Button>
      }
    >
      <InlineNotice tone="info" title="为什么需要声明来源">
        黄金回收需履行来源核查义务。声明仅用于本笔交易，平台会按隐私政策保护您的信息。
      </InlineNotice>

      <Card padding="md" className="space-y-4">
        <ChoiceGroup
          label="物品来源"
          value={source}
          onChange={(next) => {
            setSource(next)
            if (submitted) reset()
          }}
          options={SOURCE_OPTIONS}
          columns={2}
          error={sourceError}
          required
        />

        <FormField
          label={noteRequired ? '来源补充说明' : '补充说明'}
          value={note}
          onChange={setNote}
          multiline
          placeholder={
            noteRequired ? '请描述物品来源，如：朋友赠送并附购买记录' : '可补充购买时间、渠道等信息（选填）'
          }
          error={noteError}
          hint={noteRequired ? '选择其他合法来源时必须填写' : '选填，有助于加快核查'}
          required={noteRequired}
        />
      </Card>

      <Card padding="md" className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-card-title text-foreground">声明内容</h2>
          <TextLink onClick={() => setFullOpen(true)}>查看完整声明</TextLink>
        </div>

        <p className="text-body text-muted-foreground">{SOURCE_DECLARATION}</p>

        <AgreementCheck
          checked={confirmed}
          onChange={(next) => {
            setConfirmed(next)
            if (next) reset()
          }}
          error={agreementError}
        >
          我已阅读并同意上述来源声明，确认所填来源真实、合法。
        </AgreementCheck>

        <p className="text-caption text-subtle-foreground">
          {DECLARATION_VERSION}
          {draft.sourceConfirmedAt ? ` · 上次确认：${draft.sourceConfirmedAt}` : ' · 确认后将记录时间并与本订单绑定'}
        </p>
      </Card>

      <Card padding="md" className="space-y-2">
        <h2 className="text-card-title text-foreground">确认前请自查</h2>
        <ul className="list-disc space-y-1 pl-5 text-body text-muted-foreground">
          <li>物品为本人有权处分的财产。</li>
          <li>不属于盗窃、抢劫、诈骗等违法来源。</li>
          <li>如有购买凭证或继承材料，可在寄件时一并提供。</li>
        </ul>
      </Card>

      <BottomSheet
        open={fullOpen}
        onClose={() => setFullOpen(false)}
        title="合法来源声明全文"
        footer={
          <Button block onClick={() => setFullOpen(false)}>
            知道了
          </Button>
        }
      >
        <div className="space-y-3 text-body text-muted-foreground">
          <p>{SOURCE_DECLARATION}</p>
          <p>
            如声明不实，平台有权拒绝回收、暂停结算，并依法向有关部门报告；由此产生的退回费用与法律责任由声明人承担。
          </p>
          <p className="text-caption text-subtle-foreground">{DECLARATION_VERSION}</p>
        </div>
      </BottomSheet>
    </DetailPage>
  )
}
