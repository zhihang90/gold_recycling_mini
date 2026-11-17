import { AddressCard, Button, Card, DetailPage, InlineNotice, KeyValueRow, RuleSheet, SelectField, TextLink } from '@/components'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { maskPhone, readAddresses, readSelectedAddress } from '@/mocks/addressBook'
import { PICKUP_SLOTS, SHIPPING_RULES } from '@/mocks/shipping'
import { paths } from '@/routes/paths'

/**
 * 寄件信息：寄件人 / 地址簿入口 / 上门取件时间。
 * 首期只做顺丰邮寄与上门取件，不提供到店或自送。
 */
export function ShipInfoPage() {
  const navigate = useNavigate()
  const [address] = useState(() => readSelectedAddress() ?? readAddresses()[0])
  const [pickup, setPickup] = useState(PICKUP_SLOTS[0].value)
  const [rulesOpen, setRulesOpen] = useState(false)

  const goAddressBook = () => navigate(paths.ship.addresses)

  return (
    <DetailPage
      title="寄件信息"
      footer={
        <Button size="lg" block onClick={() => navigate(paths.ship.photos)}>
          下一步：上传实物照片
        </Button>
      }
    >
      <InlineNotice tone="warning" title="请在 7 天内寄出">
        超时订单将自动取消；寄出后平台自动投保，请勿自行额外保价。
      </InlineNotice>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-card-title text-foreground">寄件人</h2>
          <TextLink onClick={goAddressBook} showArrow>
            地址簿
          </TextLink>
        </div>
        <AddressCard
          name={address.name}
          phone={maskPhone(address.phone)}
          region={address.region}
          detail={`${address.place}${address.doorNo}`}
          tag={address.tag}
          actionLabel="更改"
          onClick={goAddressBook}
          onAction={goAddressBook}
        />
      </div>

      <Card padding="md" className="space-y-2">
        <h2 className="text-card-title text-foreground">取件方式</h2>
        <KeyValueRow label="快递公司" value="顺丰速运" />
        <KeyValueRow label="取件方式" value="上门取件" />
        <SelectField
          label="上门取件时间"
          value={pickup}
          onChange={setPickup}
          options={PICKUP_SLOTS}
          required
        />
        <div className="flex items-center justify-between gap-3 border-t border-border-subtle pt-2">
          <span className="text-caption text-subtle-foreground">
            运费与保价按平台标准结算
          </span>
          <TextLink onClick={() => setRulesOpen(true)} showArrow>
            运保费规则
          </TextLink>
        </div>
      </Card>

      <RuleSheet
        open={rulesOpen}
        onClose={() => setRulesOpen(false)}
        title="运保费规则"
        sections={SHIPPING_RULES}
      />
    </DetailPage>
  )
}
