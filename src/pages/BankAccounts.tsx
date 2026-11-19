import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, Plus, X } from 'lucide-react'

import {
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  InlineNotice,
  ListPage,
  TextLink,
  Toast,
} from '@/components'
import {
  MAX_BANK_ACCOUNTS,
  maskCardNo,
  readBankAccounts,
  removeBankAccount,
  setDefaultBankAccount,
  tailNo,
  type BankAccount,
} from '@/mocks/bankAccounts'
import { paths } from '@/routes/paths'

/**
 * 收款账户列表：展示本人已绑定的银行卡，支持设为默认与删除。
 * 账户由「我的 → 收款账户」进入；新增走独立路由，保证一屏一任务。
 */
export function BankAccountsPage() {
  const navigate = useNavigate()
  const [accounts, setAccounts] = useState<BankAccount[]>(() => readBankAccounts())
  const [managing, setManaging] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const target = accounts.find((account) => account.id === pendingDelete) ?? null
  const full = accounts.length >= MAX_BANK_ACCOUNTS

  const goAdd = () => {
    if (full) {
      setToast(`最多可添加 ${MAX_BANK_ACCOUNTS} 张银行卡`)
      return
    }
    navigate(paths.meAccountForm)
  }

  const handleDelete = () => {
    if (!pendingDelete) return
    removeBankAccount(pendingDelete)
    const next = readBankAccounts()
    setAccounts(next)
    setPendingDelete(null)
    if (next.length === 0) setManaging(false)
    setToast('已删除该银行卡')
  }

  const handleSetDefault = (id: string) => {
    setDefaultBankAccount(id)
    setAccounts(readBankAccounts())
    setToast('已设为默认收款账户')
  }

  return (
    <>
      <ListPage
        title="收款账户"
        showBack
        isEmpty={accounts.length === 0}
        empty={
          <EmptyState
            icon={CreditCard}
            title="还没有收款账户"
            description="添加本人银行卡后，回收款将默认打入该账户。"
            action={
              <Button onClick={goAdd} className="mt-4">
                添加银行卡
              </Button>
            }
          />
        }
        footer={
          accounts.length > 0 ? (
            <div className="space-y-2">
              <p className="text-center text-caption text-subtle-foreground">
                最多可添加 {MAX_BANK_ACCOUNTS} 张银行卡，回收款默认打入标有「默认」的账户
              </p>
              <Button
                size="lg"
                block
                variant={managing ? 'secondary' : 'primary'}
                onClick={() => setManaging((value) => !value)}
              >
                {managing ? '完成' : '管理银行卡'}
              </Button>
            </div>
          ) : null
        }
      >
        <InlineNotice tone="warning">
          部分银行或支行暂不支持线上验证，如添加不成功，建议更换另一张银行卡再试。
        </InlineNotice>

        {accounts.map((account) => (
          <Card key={account.id} padding="md">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gold-50 text-gold-700">
                <CreditCard size={20} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-body-strong text-foreground">{account.bank}</p>
                <p className="mt-1 text-caption tabular-nums text-subtle-foreground">
                  {maskCardNo(account.cardNo)}
                </p>
              </div>
              {account.isDefault ? (
                <span className="shrink-0 rounded-xs bg-gold-50 px-2 py-1 text-caption text-gold-800">
                  默认
                </span>
              ) : null}
            </div>

            {managing ? (
              <div className="mt-3 flex items-center justify-end gap-4 border-t border-border-subtle pt-2">
                {account.isDefault ? null : (
                  <TextLink tone="primary" onClick={() => handleSetDefault(account.id)}>
                    设为默认
                  </TextLink>
                )}
                <TextLink onClick={() => setPendingDelete(account.id)}>删除</TextLink>
              </div>
            ) : null}
          </Card>
        ))}

        <Card padding="none">
          <button
            type="button"
            onClick={goAdd}
            className="flex min-h-14 w-full items-center justify-center gap-2 text-body-strong text-foreground active:bg-surface-2"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold-50 text-gold-700">
              {full ? <X size={14} aria-hidden="true" /> : <Plus size={14} aria-hidden="true" />}
            </span>
            添加银行卡
          </button>
        </Card>

        <p className="px-1 text-caption text-subtle-foreground">
          仅支持绑定开户人为本人的储蓄卡，信用卡暂不支持。
        </p>
      </ListPage>

      <ConfirmDialog
        open={!!target}
        tone="danger"
        title="删除银行卡"
        description={
          target
            ? accounts.length === 1
              ? `确定删除${target.bank}（尾号 ${tailNo(target.cardNo)}）吗？删除后将没有可用的收款账户。`
              : `确定删除${target.bank}（尾号 ${tailNo(target.cardNo)}）吗？删除后回收款将打入剩余的默认账户。`
            : ''
        }
        confirmText="删除"
        onConfirm={handleDelete}
        onClose={() => setPendingDelete(null)}
      />

      <Toast open={!!toast} message={toast ?? ''} onClose={() => setToast(null)} />
    </>
  )
}
