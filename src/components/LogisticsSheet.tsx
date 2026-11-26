import { BottomSheet } from './BottomSheet'
import { Button } from './Button'
import { TextLink } from './TextLink'
import type { LogisticsInfo } from '@/mocks/logistics'

/**
 * 物流进度弹层：承运方 + 运单号 + 收货地址 + 分组轨迹。
 * 订单列表与订单详情共用，保证两处内容完全一致。
 */
export function LogisticsSheet({
  open,
  info,
  onCopy,
  onClose,
}: {
  open: boolean
  info: LogisticsInfo | null
  onCopy: (trackingNo: string) => void
  onClose: () => void
}) {
  return (
    <BottomSheet
      open={open && Boolean(info)}
      onClose={onClose}
      title="物流进度"
      footer={
        <Button block onClick={onClose}>
          知道了
        </Button>
      }
    >
      {info ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 rounded-md bg-surface-2 px-3 py-2">
            <div className="min-w-0">
              <p className="text-body-strong text-foreground">{info.carrier}</p>
              <p className="mt-0.5 truncate tabular text-caption text-subtle-foreground">
                {info.trackingNo}
              </p>
            </div>
            <TextLink onClick={() => onCopy(info.trackingNo)}>复制</TextLink>
          </div>

          {info.address ? (
            <div className="flex gap-2 text-caption">
              <span className="shrink-0 text-subtle-foreground">收货地址</span>
              <span className="min-w-0 leading-relaxed text-foreground/85">{info.address}</span>
            </div>
          ) : null}

          <ol className="space-y-4">
            {info.groups.map((group) => (
              <li key={group.status}>
                <div className="flex items-center gap-2">
                  <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-gold-700" />
                  <p className="text-body-strong text-foreground">{group.status}</p>
                </div>
                <ul className="mt-2 space-y-2.5 border-l border-border-subtle pl-3">
                  {group.entries.map((entry) => (
                    <li key={`${entry.time}-${entry.text}`}>
                      <p className="text-caption leading-relaxed text-foreground/85">
                        {entry.text}
                      </p>
                      <p className="mt-0.5 text-micro tabular text-subtle-foreground">
                        {entry.time}
                      </p>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </BottomSheet>
  )
}
