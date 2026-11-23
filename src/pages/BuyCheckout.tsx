import { AddressPickerSheet, AgreementCheck, BottomActionBar, BottomSheet, Button, Card, ConfirmDialog, FormField, MediaVisual, PageHeader, PageShell, PaymentPasswordSheet, PriceText, Stepper, SummaryActionBar, TextLink, Toast } from '@/components'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { BellRing, ChevronRight, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { images } from '@/assets/images'

import {
  maskPhone,
  readAddresses,
  readSelectedAddress,
  selectAddress,
  DEFAULT_ADDRESSES,
  type ShippingAddress,
} from '@/mocks/addressBook'
import { readCheckout, type CheckoutEntry, type CheckoutItem } from '@/mocks/checkout'
import { clearCheckout, writeCheckout, writeCheckoutResult } from '@/mocks/checkout'
import {
  clearCheckoutDraft,
  clearCheckoutResume,
  readCheckoutDraft,
  readCheckoutResume,
  writeCheckoutDraft,
  writeCheckoutResume,
} from '@/mocks/checkout'
import { isMemberVerified, readMember } from '@/mocks/member'
import { DEMO_CART, readCart, writeCart } from '@/mocks/cart'
import { findProduct, variantsOf, type GoldProduct, type GoldVariant } from '@/mocks/goldShop'
import { useDemoScene } from '@/lib/useDemoScene'
import {
  createSalesOrder,
  readSalesOrders,
  salesTimeNow,
  updateSalesOrder,
  writeSalesOrders,
} from '@/mocks/salesOrders'
import { orderDetailPath, paths } from '@/routes/paths'

type PayMethod = 'wechat' | 'alipay' | 'unionpay'

/** 三个支付方式的品牌图标（使用项目内图片资源） */
function PayIcon({ method }: { method: PayMethod }) {
  const src =
    method === 'wechat'
      ? images.payWechat
      : method === 'alipay'
        ? images.payAlipay
        : images.payUnionpay
  const alt = method === 'wechat' ? '微信支付' : method === 'alipay' ? '支付宝' : '云闪付'
  return (
    <MediaVisual
      src={src}
      alt={alt}
      className="h-[22px] w-[22px] shrink-0 rounded-sm bg-transparent"
    />
  )
}

const PAY_OPTIONS: { id: PayMethod; label: string }[] = [
  { id: 'wechat', label: '微信支付' },
  { id: 'alipay', label: '支付宝' },
  { id: 'unionpay', label: '云闪付' },
]

/** 《金银制品购买须知》完整条款 */
const NOTICE_PARAGRAPHS: { title?: string; body: ReactNode }[] = [
  {
    body: (
      <>
        根据《移动互联网应用程序信息服务管理规定》，将选择拒绝提供订单，订单支付完成将无法退款的风险提示。
        在您下单购买前请仔细、审慎阅读本须知，下单即视为您已理解并同意本须知全部条款。
      </>
    ),
  },
  {
    title: '1. 订单取消与退款规则',
    body: (
      <>
        黄金属于贵金属特殊品类，根据国家法律法规、《中华人民共和国民法典》及《中华人民共和国消费者权益保护法》
        相关规定，金银类商品不支持"七天无理由退换货"。商品发货后如无质量问题，不支持退货退款、换货；
        如商品存在质量问题，经商家确认后可协商处理。下单前请您仔细核对商品信息，审慎下单。
      </>
    ),
  },
  {
    title: '2. 金价波动相关规定',
    body: (
      <>
        黄金属于特殊商品，具有较高的市场波动性。由于金价波动产生的差额，商家不承担赔付义务。
        如您在下单后因金价波动申请退款或拒收，已支付的订单将无法处理，需按订单总价支付违约金，
        违约金标准按金价差额绝对值收取，违约金不足 100 元按 100 元收取。请您在下单前关注实时金价，审慎下单。
      </>
    ),
  },
  {
    title: '3. 收货与检验要求',
    body: (
      <>
        签收商品时请您当面验收商品及包装，如有破损、掉包、少货等情况，请当场拒收并拍照留证，同时联系商家客服处理。
        签收后如未及时反馈上述问题，视为您已确认商品完好无损，后续出现此类问题商家不予受理。请您在验货后再签收，保护您的合法权益。
      </>
    ),
  },
  {
    title: '4. 证书相关说明',
    body: (
      <>
        黄金商品均附带国家认可机构出具的检验证书（如 NGTC 国检证书），一物一证，证书编号可通过官方渠道查询。
        如您未收到证书或证书信息与商品不符，请及时联系商家客服。证书为商品保值、售后服务的重要凭证，请妥善保管，遗失补发需支付相应费用。
      </>
    ),
  },
  {
    title: '5. 线下提货规则',
    body: (
      <>
        本商品默认支持线上邮寄配送，部分城市可到店自取。选择到店自取的客户需提前预约，携带本人有效身份证件到指定门店提货。
        提货时请当场检验商品质量，确认无误后签字离开。提货后如无质量问题，不支持退换。
      </>
    ),
  },
  {
    title: '6. 异常订单处理',
    body: (
      <>
        为维护正常交易秩序及平台公平，如发现订单存在异常交易行为（包括但不限于：同一人多账号注册下单、频繁大额交易、
        短期内频繁拒收退货、疑似刷单行为等），经平台核实认定后，平台有权对该类订单采取包括但不限于：订单取消、不予交付、
        限制交易、永久封号等措施，相关解释权归平台所有。
      </>
    ),
  },
  {
    title: '7. 系统异常订单处置',
    body: (
      <>
        如因系统故障、网络延迟、支付异常、数据错误等不可抗力因素，导致出现异常订单（包括但不限于：重复扣款、
        未扣款却显示已支付、已扣款却显示支付失败、订单信息错误等），请您及时联系商家客服说明情况。
        商家将核实后进行相应处理，但处理方式需以商家最终方案为准，请您谅解。
      </>
    ),
  },
  {
    title: '8. 下单人脸识别验证',
    body: (
      <>
        为保障您的账户与交易安全，您在提交订单前需完成一次人脸识别验证。下单时进行的人脸识别，
        需与当前账号的实名认证信息保持一致，验证通过后方可继续提交订单。如当前刷脸人与账号实名信息不一致，
        系统将无法完成下单，请由账号实名认证本人操作。如人脸识别失败或识别超时，可根据页面提示重新识别；
        在识别通过前，无法继续后续购买流程。
      </>
    ),
  },
]

/** 全屏确认订单页（立即购买与购物车结算共用） */
export function BuyCheckoutPage() {
  const navigate = useNavigate()
  /** 演示直达：?demo=checkout 用购物车样例渲染，不依赖上一步数据 */
  const demo = useDemoScene() === 'checkout'
  /** 现场快照：去实名认证前写入，返回时恢复商品数量、地址与表单项 */
  const [resume] = useState(() => (demo ? readCheckoutResume() : null))
  const [demoItems, setDemoItems] = useState<CheckoutItem[]>(() =>
    demo ? toCheckoutItems(resume?.items.length ? resume.items : DEMO_CART) : [],
  )
  const [address, setAddress] = useState<ShippingAddress | null>(() => {
    if (!demo) return readSelectedAddress()
    const resumed = resume?.addressId
      ? readAddresses().find((item) => item.id === resume.addressId)
      : undefined
    return resumed ?? DEFAULT_ADDRESSES[0] ?? null
  })
  const [addressSheet, setAddressSheet] = useState(false)
  /** 表单草稿：去添加/编辑收货地址后返回，备注、支付方式与协议勾选不丢 */
  const [draft] = useState(() => (demo ? null : readCheckoutDraft()))
  const [note, setNote] = useState(resume?.note ?? draft?.note ?? '')
  const [payMethod, setPayMethod] = useState<PayMethod>(() => {
    const candidate = resume?.payMethod ?? draft?.payMethod
    return PAY_OPTIONS.some((option) => option.id === candidate)
      ? (candidate as PayMethod)
      : 'wechat'
  })
  const [agree, setAgree] = useState(resume?.agree ?? draft?.agree ?? false)
  const [toast, setToast] = useState<string | null>(null)
  /** 提交前拦截：未实名时弹窗引导先去认证 */
  const [authDialog, setAuthDialog] = useState(false)
  /** 提交中：按钮转圈并禁用，避免重复创建订单 */
  const [submitting, setSubmitting] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [noticeSheet, setNoticeSheet] = useState(false)
  const [noticeSeconds, setNoticeSeconds] = useState(0)
  const [payOpen, setPayOpen] = useState(false)
  /** 拉起支付前已落单，取消支付时用它进入订单详情 */
  const [payOrderId, setPayOrderId] = useState<string | null>(null)

  // 购买须知抽屉：打开后 5 秒倒计时，到 0 按钮自动可点
  useEffect(() => {
    if (!noticeSheet) return
    setNoticeSeconds(5)
    const timer = window.setInterval(() => {
      setNoticeSeconds((s) => {
        if (s <= 1) {
          window.clearInterval(timer)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [noticeSheet])

  // 内层滚动容器 ref：传给 BottomSheet 额外锁住，避免打开期间内层仍可滚
  const innerScrollRef = useRef<HTMLDivElement>(null)

  // 还原 checkout items（reloadKey 用于数量变化后强制刷新）
  const storedItems = useMemo<CheckoutItem[]>(() => {
    const raw = readCheckout()
    return raw ? toCheckoutItems(raw) : []
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey])

  const items = demo ? demoItems : storedItems

  // 表单草稿：离开本页去添加/编辑地址后返回，重挂载时恢复备注、支付方式与协议勾选
  useEffect(() => {
    if (demo) return
    writeCheckoutDraft({ note, payMethod, agree })
  }, [demo, note, payMethod, agree])

  useEffect(() => {
    // 现场快照只在从实名认证返回的这一次挂载使用，读完即清，避免下次进入带入旧数据
    clearCheckoutResume()
  }, [])

  const total = items.reduce((sum, item) => sum + item.variant.price * item.quantity, 0)
  const count = items.reduce((sum, item) => sum + item.quantity, 0)
  const shipping = 0 // 免运费

  const updateQuantity = (variantId: string, value: number) => {
    if (demo) {
      // 演示直达只改内存，不写 checkout / cart
      setDemoItems((prev) =>
        prev.map((item) => (item.variant.id === variantId ? { ...item, quantity: value } : item)),
      )
      return
    }

    const raw = readCheckout() ?? []
    const next = raw.map((r) =>
      r.variantId === variantId ? { ...r, quantity: value } : r,
    )
    writeCheckout(next)

    const cart = readCart()
    const cartNext = cart.map((c) =>
      c.variantId === variantId ? { ...c, quantity: value } : c,
    )
    writeCart(cartNext)

    setReloadKey((k) => k + 1)
  }

  const openAddressSheet = () => setAddressSheet(true)

  /** 去实名认证：先存现场快照，认证完成返回后原样恢复 */
  const goAuth = () => {
    if (demo) {
      writeCheckoutResume({
        items: items.map(({ product, variant, quantity }) => ({
          productId: product.id,
          variantId: variant.id,
          quantity,
        })),
        addressId: address?.id ?? null,
        note,
        payMethod,
        agree,
      })
    }
    setAuthDialog(false)
    // replace 掉弹层压入的历史记录，认证成功后按 redirect 回到本页
    const target = demo ? `${paths.checkout}?demo=checkout` : paths.checkout
    navigate(`${paths.meAuth}?redirect=${encodeURIComponent(target)}`, { replace: true })
  }

  /** 提交即创建待付款订单，再拉起支付密码面板 */
  const submit = () => {
    // 必须先实名认证：未实名时弹窗引导，认证完成返回后才能继续提交
    if (!isMemberVerified(readMember())) {
      setAuthDialog(true)
      return
    }
    if (!address) {
      setToast('请先选择收货地址')
      return
    }
    if (!agree) {
      setToast('请先同意《金银制品购买须知》')
      return
    }

    // 提交中：按钮转圈并禁用，避免重复创建订单
    setSubmitting(true)

    window.setTimeout(() => {
      const order = createSalesOrder({
        address,
        note,
        payMethod,
        lines: items.map(({ product, variant, quantity }) => ({
          productId: product.id,
          variantId: variant.id,
          spec: variant.label,
          quantity,
          price: variant.price,
        })),
      })
      writeSalesOrders([order, ...readSalesOrders()])

      // 订单已承接商品明细，清掉购物车与结算数据，避免重复下单
      const raw = readCheckout()
      if (raw) {
        const variantIds = new Set(raw.map((r) => r.variantId))
        writeCart(readCart().filter((item) => !variantIds.has(item.variantId)))
      }
      clearCheckout()
      // 订单已提交：清空表单草稿，避免下次结算带出上一次的备注与勾选
      clearCheckoutDraft()

      setSubmitting(false)
      setPayOrderId(order.id)
      setPayOpen(true)
    }, 500)
  }

  /** 支付成功：订单转为待发货，写入结果快照后进入支付成功页 */
  const completePayment = () => {
    if (payOrderId) {
      updateSalesOrder(payOrderId, { status: 'pending-shipment', paidAt: salesTimeNow() })
    }
    writeCheckoutResult({ amount: total + shipping, count, createdAt: Date.now() })
    setPayOpen(false)
    // 成功页是独立路由：replace 掉确认订单，返回时不会回到已清空的结算页
    navigate(paths.checkoutSuccess, { replace: true })
  }

  /** 取消支付：订单已创建，直接进入详情页继续付款 */
  const cancelPayment = () => {
    setPayOpen(false)
    if (payOrderId) {
      navigate(orderDetailPath(payOrderId), {
        replace: true,
        state: { fromCheckout: true },
      })
    }
  }

  if (items.length === 0) {
    return (
      <PageShell>
        <PageHeader title="确认订单" />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-center">
          <p className="text-body text-muted-foreground">没有待结算的商品</p>
          <TextLink onClick={() => navigate(paths.buy)}>去买金看看</TextLink>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell padded={false} className="relative h-full overflow-hidden box-border">
      <PageHeader title="确认订单" />

      {/* 滚动容器：flex + min-h-0 让子项不会撑爆，overflow-y-auto 成为唯一滚动源
          底部 pb-32 给 absolute 定位的 BottomActionBar（含协议行）预留空间，避免内容被遮挡 */}
      <div className="flex min-h-0 flex-1 flex-col">
        <div ref={innerScrollRef} className="hide-scrollbar min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-32">
          {/* 收货地址 */}
          <Card padding="none" className="overflow-hidden">
            <button
              type="button"
              onClick={openAddressSheet}
              className="block w-full p-4 text-left transition active:bg-surface-2"
            >
              {address ? (
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-body-strong text-foreground">{address.name}</span>
                      <span className="text-body text-muted-foreground">{maskPhone(address.phone)}</span>
                      {address.tag ? (
                        <span className="rounded bg-gold-100 px-1.5 py-0.5 text-[10px] text-gold-800">{/* ui-allow: 地址标签 */}
                          {address.tag}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 line-clamp-2 text-caption text-subtle-foreground">
                      {address.region} {address.place}
                      {address.doorNo ? ` ${address.doorNo}` : ''}
                    </p>
                  </div>
                  <ChevronRight size={18} className="mt-1 shrink-0 text-muted-foreground" />
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-body text-subtle-foreground">
                    <span>请选择收货地址</span>
                    <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] text-destructive">{/* ui-allow: 必填标记 */}
                      必填
                    </span>
                  </div>
                  <ChevronRight size={18} className="shrink-0 text-muted-foreground" />
                </div>
              )}
            </button>
          </Card>

          {/* 保障说明（商品卡片上方） */}
          <div className="mt-3 flex items-center gap-1.5 rounded-md bg-gold-50 px-3 py-2 text-caption text-gold-800">
            <ShieldCheck size={14} className="shrink-0" />
            顺丰保价 · 一物一证 · 不支持 7 天无理由
          </div>

          {/* 商品列表 */}
          <Card padding="md" className="mt-3">
            <div className="space-y-3">
              {items.map(({ product, variant, quantity }) => (
                <CheckoutRow
                  key={variant.id}
                  product={product}
                  variant={variant}
                  quantity={quantity}
                  onQuantityChange={(value) => updateQuantity(variant.id, value)}
                />
              ))}
            </div>
          </Card>

          {/* 配送方式 */}
          <div className="mt-3">
            <Row label="配送" value="顺丰速运" />
          </div>

          {/* 备注 */}
          <FormField
            label="备注"
            value={note}
            onChange={setNote}
            inline
            bare
            placeholder="选填，200字以内"
            maxLength={200}
            className="mt-3"
          />

          {/* 金额明细 */}
          <Card padding="md" className="mt-3">
            <AmountRow label="订单总金额" value={total} />
            <AmountRow label="运费" value={shipping} />
            <div className="mt-2 flex items-center justify-between border-t border-border-subtle pt-2">
              <span className="text-body text-foreground">小计</span>
              <PriceText value={total + shipping} size="section" tone="price" />
            </div>
          </Card>

          {/* 选择支付方式 */}
          <Card padding="md" className="mt-3">
            <p className="mb-3 text-body-strong text-foreground">选择支付方式</p>
            <div className="space-y-1">
              {PAY_OPTIONS.map((opt) => {
                const selected = payMethod === opt.id
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPayMethod(opt.id)}
                    aria-pressed={selected}
                    className="flex h-12 w-full items-center gap-3 rounded-md px-3 text-left transition active:bg-surface-2"
                  >
                    <PayIcon method={opt.id} />
                    <span className="flex-1 text-body text-foreground">{opt.label}</span>
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        selected
                          ? 'border-gold-700 bg-gold-700'
                          : 'border-icon-muted bg-card'
                      }`}
                    >
                      {selected ? <span className="h-2 w-2 rounded-full bg-card" /> : null}
                    </span>
                  </button>
                )
              })}
            </div>
          </Card>

          {/* 购买须知改为随吸底栏常驻，与回收预约页保持一致 */}
        </div>
      </div>

      {/* 吸底操作栏：absolute 贴 PageShell 底部，永远可见，不跟随任何滚动 */}
      <BottomActionBar className="absolute bottom-0 left-0 right-0">
        <AgreementCheck
          align="center"
          checked={agree}
          onChange={() => {
            setNoticeSheet(true)
          }}
        >
          <span className="text-caption text-muted-foreground">
            我已阅读并同意
            <TextLink
              onClick={() => {
                setNoticeSheet(true)
              }}
              inline
              className="text-caption text-link"
            >
              《金银制品购买须知》
            </TextLink>
          </span>
        </AgreementCheck>

        {/* 协议与金额区之间的分割线，通栏铺满吸底栏 */}
        <div className="-mx-4 mt-1 border-t border-border-subtle" />

        <SummaryActionBar
          className="pt-3"
          label="合计"
          amount={total + shipping}
          onAction={submit}
          actionLabel="提交订单"
          actionLoading={submitting}
        />
      </BottomActionBar>

      {/* 地址选择抽屉—— disablePortal 就地渲染 */}
      <AddressPickerSheet
        open={addressSheet}
        onClose={() => setAddressSheet(false)}
        addresses={readAddresses()}
        selectedId={address?.id ?? null}
        onSelect={(item) => {
          selectAddress(item.id)
          setAddress(item)
          setAddressSheet(false)
        }}
        onAdd={() => navigate(paths.ship.addressForm)}
        extraScrollLocks={[innerScrollRef]}
        disablePortal
      />

      {/* 购买须知抽屉（5 秒倒计时后可同意） */}
      <BottomSheet
        open={noticeSheet}
        onClose={() => setNoticeSheet(false)}
        title="金银制品购买须知"
        disablePortal
        extraScrollLocks={[innerScrollRef]}
        footer={
          <Button
            block
            disabled={noticeSeconds > 0}
            onClick={() => {
              setAgree(true)
              setNoticeSheet(false)
            }}
          >
            {noticeSeconds > 0 ? `${noticeSeconds} 秒后可同意` : '同意'}
          </Button>
        }
      >
        <div className="space-y-4">
          <p className="text-caption text-subtle-foreground">
            根据《移动互联网应用程序信息服务管理规定》，将选择拒绝提供订单，订单支付完成将无法退款的风险提示。
            在您下单购买前请仔细、审慎阅读本须知，下单即视为您已理解并同意本须知全部条款。
          </p>

          {NOTICE_PARAGRAPHS.map((p, i) => (
            <div key={i}>
              {p.title ? <h3 className="mb-1 text-body-strong text-foreground">{p.title}</h3> : null}
              <p className="text-caption leading-relaxed text-subtle-foreground">{p.body}</p>
            </div>
          ))}

          <div className="rounded-md bg-gold-50 p-3">
            <p className="text-caption leading-relaxed text-gold-800">
              <span className="font-medium">温馨提示：</span>
              请您在下单购买前仔细、审慎阅读本须知，下单即视为您已理解并同意本须知全部条款。
            </p>
          </div>
        </div>
      </BottomSheet>

      <PaymentPasswordSheet
        open={payOpen}
        amount={total + shipping}
        channel={PAY_OPTIONS.find((option) => option.id === payMethod)?.label}
        onClose={cancelPayment}
        onPaid={completePayment}
      />

      {/* 未实名拦截：先认证再下单 */}
      <ConfirmDialog
        open={authDialog}
        icon={
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft">
            <BellRing size={26} className="text-primary" aria-hidden="true" />
          </span>
        }
        title="请先完成实名认证"
        cancelText="取消认证"
        confirmText="去认证"
        onConfirm={goAuth}
        onClose={() => setAuthDialog(false)}
      />

      <Toast open={Boolean(toast)} message={toast ?? ''} onClose={() => setToast(null)} />
    </PageShell>
  )
}

/** 把轻量条目还原成完整商品对象，无法匹配的条目直接丢弃 */
function toCheckoutItems(entries: CheckoutEntry[]): CheckoutItem[] {
  const result: CheckoutItem[] = []
  for (const entry of entries) {
    const product = findProduct(entry.productId)
    if (!product) continue
    const variant = variantsOf(product).find((v) => v.id === entry.variantId)
    if (!variant) continue
    result.push({ product, variant, quantity: entry.quantity })
  }
  return result
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-body text-foreground">{label}</span>
      <span className={`text-body ${muted ? 'text-muted-foreground' : 'text-foreground'}`}>{value}</span>
    </div>
  )
}

function AmountRow({ label, value, prefix }: { label: string; value: number; prefix?: string }) {
  if (prefix) {
    return (
      <div className="flex items-center justify-between py-0.5">
        <span className="text-body text-muted-foreground">{label}</span>
        <span className="text-body text-foreground tabular">
          {prefix}
          {Math.abs(value).toFixed(2)}
        </span>
      </div>
    )
  }
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-body text-muted-foreground">{label}</span>
      <PriceText value={value} size="body" tone="ink" />
    </div>
  )
}

function CheckoutRow({
  product,
  variant,
  quantity,
  onQuantityChange,
}: {
  product: GoldProduct
  variant: GoldVariant
  quantity: number
  onQuantityChange: (value: number) => void
}) {
  return (
    <div className="flex gap-3 border-b border-border-subtle pb-3 last:border-0 last:pb-0">
      <MediaVisual
        src={product.image}
        alt={product.name}
        className="h-20 w-20 shrink-0 rounded-md bg-gold-50"
      />
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-body-strong text-foreground">{product.name}</p>
        <p className="mt-1 text-caption text-subtle-foreground">标称金重 {variant.label}</p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <PriceText value={variant.price} size="body" tone="price" />
          <Stepper
            size="sm"
            value={quantity}
            max={Math.min(20, variant.stock)}
            onChange={onQuantityChange}
          />
        </div>
      </div>
    </div>
  )
}

