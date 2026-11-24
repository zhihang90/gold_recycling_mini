import { useEffect, useState } from 'react'
import { Check, ChevronRight, CreditCard, Plus } from 'lucide-react'

import { maskCardNo, type BankAccount } from '@/mocks/bankAccounts'
import { cn } from '@/lib/utils'

import { BottomSheet } from './BottomSheet'
import { Button } from './Button'
import { Toast } from './Toast'

/**
 * 收款方式选择抽屉：复用收款账户列表，单选取账户。
 * 无账户或需要新卡时，通过「绑定银行卡」进入添加页；确认后回填到调用方。
 */
export function BankAccountPickerSheet({
  open,
  onClose,
  accounts,
  selectedId,
  onConfirm,
  onBind,
}: {
  open: boolean
  onClose: () => void
  accounts: BankAccount[]
  selectedId: string | null
  onConfirm: (account: BankAccount) => void
  onBind: () => void
}) {
  const [draftId, setDraftId] = useState<string | null>(selectedId)
  const [toast, setToast] = useState<string | null>(null)

  // 每次打开回到已选账户，未选时保持空，由用户主动选择
  useEffect(() => {
    if (open) setDraftId(selectedId)
  }, [open, selectedId])

  const draft = accounts.find((account) => account.id === draftId) ?? null

  return (
    <>
      <BottomSheet
        open={open}
        onClose={onClose}
        title="选择收款方式"
        footer={
          <Button
            size="lg"
            block
            onClick={() => {
              if (!draft) {
                setToast('请选择收款账户')
                return
              }
              onConfirm(draft)
            }}
          >
            确认
          </Button>
        }
      >
        <div className="space-y-3 pb-2">
          {accounts.map((account) => {
            const active = account.id === draftId
            return (
              <button
                key={account.id}
                type="button"
                onClick={() => setDraftId(account.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-md bg-card px-4 py-4 text-left ring-1 transition',
                  active ? 'bg-primary-soft/50 ring-primary-border' : 'ring-border-subtle',
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition',
                    active
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-icon-muted bg-card',
                  )}
                >
                  {active ? <Check size={13} strokeWidth={3} /> : null}
                </span>
                <span className="flex min-w-0 flex-1 items-center gap-3">
                  <CreditCard size={20} className="shrink-0 text-icon-strong" />
                  <span className="min-w-0">
                    <span className="block truncate text-body-strong text-foreground">
                      {account.bank} 储蓄卡
                    </span>
                    <span className="mt-0.5 block text-caption text-subtle-foreground tabular">
                      {maskCardNo(account.cardNo)}
                    </span>
                  </span>
                </span>
                {account.isDefault ? (
                  <span className="shrink-0 rounded-xs bg-gold-50 px-1.5 py-0.5 text-caption text-gold-700 ring-1 ring-gold-200">
                    默认
                  </span>
                ) : null}
              </button>
            )
          })}

          {accounts.length === 0 ? (
            <p className="px-1 text-caption text-subtle-foreground">
              还没有绑定银行卡，绑定后回收款将打入该账户
            </p>
          ) : null}

          <button
            type="button"
            onClick={onBind}
            className="flex w-full items-center gap-3 rounded-md border border-dashed border-border-subtle px-4 py-4 text-left transition active:bg-surface-2"
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center text-muted-foreground">
              <Plus size={18} />
            </span>
            <span className="min-w-0 flex-1 text-body text-foreground">
              绑定银行卡
              {accounts.length > 0 ? (
                <span className="ml-1 text-caption text-subtle-foreground">（最多 5 张）</span>
              ) : null}
            </span>
            <ChevronRight size={16} className="shrink-0 text-icon-muted" />
          </button>
        </div>
      </BottomSheet>

      <Toast open={!!toast} message={toast ?? ''} onClose={() => setToast(null)} />
    </>
  )
}
