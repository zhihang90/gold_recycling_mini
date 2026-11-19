import { useEffect, useState } from 'react'
import { BottomSheet } from './BottomSheet'
import { cn } from '@/lib/utils'

/** 上门取件时间：dayIndex 0/1/2 对应 今天/明天/后天，slot 形如 09:00-10:00 */
export interface PickupTimeSlot {
  dayIndex: number
  slot: string
}

export interface PickupDay {
  label: string
  weekday: string
  date: string
}

const DAY_LABELS = ['今天', '明天', '后天']

/** 可选时段：早 9 点到晚 8 点，每小时一档 */
export const PICKUP_TIME_SLOTS = [
  '09:00-10:00',
  '10:00-11:00',
  '11:00-12:00',
  '12:00-13:00',
  '13:00-14:00',
  '14:00-15:00',
  '15:00-16:00',
  '16:00-17:00',
  '17:00-18:00',
  '18:00-19:00',
  '19:00-20:00',
]

/** 今天 / 明天 / 后天，附带星期与日期文案 */
export function buildPickupDays(base = new Date()): PickupDay[] {
  return DAY_LABELS.map((label, index) => {
    const day = new Date(base)
    day.setDate(day.getDate() + index)
    return {
      label,
      weekday: `周${'日一二三四五六'[day.getDay()]}`,
      date: `${day.getMonth() + 1}月${day.getDate()}日`,
    }
  })
}

/** 列表行展示：后天（周五）19:00 – 20:00 */
export function formatPickupTime(value: PickupTimeSlot) {
  const day = buildPickupDays()[value.dayIndex] ?? buildPickupDays()[0]
  return `${day.label}（${day.weekday}）${value.slot.replace('-', ' – ')}`
}

/** 上门取件时间选择：左侧选日期，右侧选时段，点中即回填并关闭 */
export function PickupTimeSheet({
  open,
  onClose,
  value,
  onSelect,
}: {
  open: boolean
  onClose: () => void
  value: PickupTimeSlot | null
  onSelect: (value: PickupTimeSlot) => void
}) {
  const [dayIndex, setDayIndex] = useState(value?.dayIndex ?? 0)
  const days = buildPickupDays()

  // 每次打开回到已选日期，未选时默认落在今天
  useEffect(() => {
    if (open) setDayIndex(value?.dayIndex ?? 0)
  }, [open, value])

  return (
    <BottomSheet open={open} onClose={onClose} title="请选择上门取件时间">
      <div className="flex overflow-hidden rounded-md ring-1 ring-border-subtle">
        {/* 左侧：日期 */}
        <div className="w-24 shrink-0 bg-surface-2 py-2">
          {days.map((day, index) => {
            const active = index === dayIndex
            return (
              <button
                key={day.label}
                type="button"
                onClick={() => setDayIndex(index)}
                className={cn(
                  'flex w-full flex-col items-start gap-0.5 border-l-2 py-3 pl-3 pr-2 text-left transition',
                  active
                    ? 'border-primary bg-card text-foreground'
                    : 'border-transparent text-muted-foreground',
                )}
              >
                <span className={cn('text-body', active && 'font-medium')}>{day.label}</span>
                <span className="text-caption text-subtle-foreground">{day.date}</span>
              </button>
            )
          })}
        </div>

        {/* 右侧：时段 */}
        <div className="relative grid min-w-0 flex-1 grid-cols-2 content-start gap-2 bg-card p-3">
          {PICKUP_TIME_SLOTS.map((slot) => {
            const active = value?.dayIndex === dayIndex && value.slot === slot
            return (
              <button
                key={slot}
                type="button"
                onClick={() => onSelect({ dayIndex, slot })}
                className={cn(
                  'rounded-sm px-2 py-2.5 text-center text-caption tabular transition',
                  active
                    ? 'bg-primary-soft font-medium text-primary ring-1 ring-primary-border'
                    : 'bg-surface-2 text-foreground active:bg-surface-3',
                )}
              >
                {slot.replace('-', ' – ')}
              </button>
            )
          })}
        </div>
      </div>
    </BottomSheet>
  )
}
