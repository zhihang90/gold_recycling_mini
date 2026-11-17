import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AddressCard } from '@/components/AddressCard'
import { AgreementCheck } from '@/components/AgreementCheck'
import { Badge } from '@/components/Badge'
import { BottomSheet } from '@/components/BottomSheet'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { DetailPage } from '@/components/DetailPage'
import { InlineNotice } from '@/components/InlineNotice'
import { KeyValueRow } from '@/components/KeyValueRow'
import { PriceText } from '@/components/PriceText'
import { ResultStatus } from '@/components/ResultStatus'
import { RuleSheet } from '@/components/RuleSheet'
import { SelectField } from '@/components/SelectField'
import { TextLink } from '@/components/TextLink'
import {
  maskPhone,
  readAddresses,
  readSelectedAddressId,
  selectAddress,
} from '@/mocks/addressBook'
import { readOrderDraft, writeOrderDraft } from '@/mocks/orderFlow'
import { calculateQuote, formatClock } from '@/mocks/quote'
import { PRICE_PROTECTION_RULES } from '@/mocks/rules'
import { PICKUP_SLOTS, SHIPPING_RULES } from '@/mocks/shipping'
import { paths } from '@/routes/paths'

/**
 * 寄件信息与强制保价：
 * - 寄件人从地址簿选择，快递方式与取件时间在同一页确认；
 * - 保价金额取物品预估货值，保价费 0.1%；
 * - 未确认保价或保价校验失败时，禁止进入下一步。
 */
export function OrderShippingPage() {
  const navigate = useNavigate()
  const [draft] = useState(readOrderDraft)
  const [addresses] = useState(readAddresses)
  const [addressId, setAddressId] = useState(readSelectedAddressId)
  const [pickup, setPickup] = useState(PICKUP_SLOTS[0].value)
  const [insuranceConfirmed, setInsuranceConfirmed] = useState(false)
  const [confirmedAt, setConfirmedAt] = useState('')
  const [addressSheet, setAddressSheet] = useState(false)
  const [shippingRuleSheet, setShippingRuleSheet] = useState(false)
  const [insuranceRuleSheet, setInsuranceRuleSheet] = useState(false)
  const [done, setDone] = useState(false)

  const address = addresses.find((item) => item.id === addressId) ?? addresses[0] ?? null
  const quote = calculateQuote({
    category: draft.category,
    weight: draft.weight,
    purity: draft.purity,
    quantity: draft.quantity,
  })
  const insuredAmount = quote?.estimatedValue ?? null
  const insuranceFee = quote?.insuranceFee ?? null
  const hasPhotos = draft.photos.overall.length > 0
  const canSubmit = Boolean(address && quote && insuranceConfirmed)

  const handleSelectAddress = (id: string) => {
    selectAddress(id)
    setAddressId(id)
    setAddressSheet(false)
  }

  const handleInsuranceChange = (next: boolean) => {
    setInsuranceConfirmed(next)
    setConfirmedAt(next ? formatClock() : '')
  }

  const handleConfirm = () => {
    if (!address || !quote || !insuranceConfirmed) return

    writeOrderDraft({
      shipping: {
        name: address.name,
        phone: address.phone,
        region: address.region,
        detail: `${address.place}${address.doorNo}`,
        courier: '顺丰速运',
        pickup,
        insuredAmount,
        insuranceFee,
        confirmedAt,
      },
    })
    setDone(true)
  }

  if (done) {
    return (
      <DetailPage title="寄件信息与强制保价">
        <ResultStatus
          status="success"
          title="寄件信息已确认"
          description={
            <>
              请按预约时间将物品交给快递员，寄出后可查看检测进度。
              <br />
              保价金额与保价费已随订单保存。
            </>
          }
          primaryAction={
            <Button size="lg" block onClick={() => navigate(paths.home)}>
              返回首页
            </Button>
          }
          secondaryAction={
            <Button size="lg" block variant="secondary" onClick={() => setDone(false)}>
              继续修改寄件信息
            </Button>
          }
        />
      </DetailPage>
    )
  }

  return (
    <DetailPage
      title="寄件信息与强制保价"
      footer={
        <div className="space-y-2">
          {!insuranceConfirmed ? (
            <p className="text-center text-caption text-subtle-foreground">
              未确认保价：勾选下方「强制保价」确认后再提交
            </p>
          ) : null}
          <Button size="lg" block disabled={!canSubmit} onClick={handleConfirm}>
            确认寄件与保价
          </Button>
        </div>
      }
    >
      <InlineNotice tone="warning" title="强制保价">
        寄件必须完成保价确认；未确认或保价校验失败时无法提交订单。
      </InlineNotice>

      {!quote ? (
        <InlineNotice
          tone="warning"
          title="尚未完成物品信息"
          action={
            <Button variant="secondary" size="sm" onClick={() => navigate(paths.order.item)}>
              返回第 1 步
            </Button>
          }
        >
          保价金额需以物品预估货值为基础，请先填写物品信息。
        </InlineNotice>
      ) : null}

      <section className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-card-title text-foreground">寄件人</h2>
          <TextLink onClick={() => setAddressSheet(true)}>更换</TextLink>
        </div>
        {address ? (
          <AddressCard
            name={address.name}
            phone={maskPhone(address.phone)}
            region={address.region}
            detail={`${address.place}${address.doorNo}`}
            tag={address.tag}
            actionLabel="更换"
            onAction={() => setAddressSheet(true)}
            onClick={() => setAddressSheet(true)}
          />
        ) : (
          <Card padding="md">
            <p className="text-body text-muted-foreground">请先添加寄件地址。</p>
          </Card>
        )}
      </section>

      <Card padding="md" className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-card-title text-foreground">取件方式</h2>
          <TextLink onClick={() => setShippingRuleSheet(true)}>运保费规则</TextLink>
        </div>
        <KeyValueRow label="快递公司" value="顺丰速运" />
        <KeyValueRow label="取件方式" value="上门取件" />
        <SelectField
          label="上门取件时间"
          value={pickup}
          onChange={setPickup}
          options={PICKUP_SLOTS}
          required
        />
      </Card>

      <Card padding="md" className="space-y-1">
        <h2 className="text-card-title text-foreground">随寄材料</h2>
        <KeyValueRow
          label="实物照片"
          value={
            <Badge tone={hasPhotos ? 'success' : 'warning'}>
              {hasPhotos ? '已上传' : '未上传'}
            </Badge>
          }
        />
        <KeyValueRow label="购买发票 / 凭证" value="选填" />
        <KeyValueRow label="鉴定证书 / 质保卡" value="选填" />
        <p className="pt-1 text-caption text-subtle-foreground">
          请勿随寄无关贵重物品；证书与发票如有请一并寄出。
        </p>
      </Card>

      <Card padding="md" className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-card-title text-foreground">强制保价</h2>
          <Badge tone={insuranceConfirmed ? 'success' : 'warning'}>
            {insuranceConfirmed ? '已确认' : '待确认'}
          </Badge>
        </div>

        <div className="space-y-1">
          <KeyValueRow
            label="保价金额"
            value={
              insuredAmount !== null ? (
                <PriceText value={insuredAmount} size="body" />
              ) : (
                '待物品信息完成后测算'
              )
            }
          />
          <KeyValueRow
            label="保价费"
            value={
              insuranceFee !== null ? (
                <PriceText value={insuranceFee} size="body" />
              ) : (
                '以协议为准'
              )
            }
            hint={insuranceFee !== null ? '0.1%' : undefined}
          />
          <KeyValueRow label="赔付基数" value="以协议为准" />
          <KeyValueRow
            label="免责条件"
            value={<TextLink onClick={() => setInsuranceRuleSheet(true)}>查看保价规则</TextLink>}
          />
          <KeyValueRow label="处理时限" value="以协议为准" />
        </div>

        <AgreementCheck checked={insuranceConfirmed} onChange={handleInsuranceChange}>
          我已阅读并确认强制保价规则，知悉未确认保价将无法提交订单。
        </AgreementCheck>

        {confirmedAt ? (
          <p className="text-caption text-subtle-foreground">已确认 · {confirmedAt}</p>
        ) : null}
      </Card>

      <p className="text-caption text-subtle-foreground">
        寄件信息与保价确认随订单保存，可在订单详情查看。
      </p>

      <BottomSheet
        open={addressSheet}
        onClose={() => setAddressSheet(false)}
        title="选择寄件地址"
        footer={
          <Button block variant="secondary" onClick={() => setAddressSheet(false)}>
            取消
          </Button>
        }
      >
        <div className="space-y-2">
          {addresses.map((item) => (
            <AddressCard
              key={item.id}
              name={item.name}
              phone={maskPhone(item.phone)}
              region={item.region}
              detail={`${item.place}${item.doorNo}`}
              tag={item.tag}
              mode="select"
              selected={item.id === addressId}
              onClick={() => handleSelectAddress(item.id)}
            />
          ))}
        </div>
      </BottomSheet>

      <RuleSheet
        open={shippingRuleSheet}
        onClose={() => setShippingRuleSheet(false)}
        title="运保费规则"
        sections={SHIPPING_RULES}
      />
      <RuleSheet
        open={insuranceRuleSheet}
        onClose={() => setInsuranceRuleSheet(false)}
        title="保价规则"
        sections={PRICE_PROTECTION_RULES}
      />
    </DetailPage>
  )
}
