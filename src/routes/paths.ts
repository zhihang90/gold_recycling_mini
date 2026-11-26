import { ROUTE_MANIFEST, type RouteId } from './manifest'

/**
 * 按路由 ID 获取路径。新增页面在 manifest.ts 登记后直接使用本函数，
 * 不再需要在下方 paths 中补充兼容别名。
 */
export function routePath(id: RouteId): string {
  const route = ROUTE_MANIFEST.find((item) => item.id === id)
  if (!route) throw new Error(`未注册的路由 ID：${id}`)
  return route.path
}

/**
 * 既有页面的路径别名兼容层；路径字面量只在 manifest.ts 维护。
 * 新代码请使用 routePath('route.id')，不要继续扩充这里的别名。
 */
export const paths = {
  home: routePath('home'),
  market: routePath('market'),
  marketNewsList: routePath('market.news'),
  marketNewsDetail: routePath('market.newsDetail'),
  marketAlertSettings: routePath('market.alertSettings'),
  buy: routePath('buy'),
  buyDetail: routePath('buy.detail'),
  cart: routePath('cart'),
  checkout: routePath('checkout'),
  checkoutSuccess: routePath('checkout.success'),
  orders: routePath('orders'),
  orderDetail: routePath('orders.detail'),
  messages: routePath('messages'),
  messageDetail: routePath('messages.detail'),
  orderBuy: {
    pendingPayment: routePath('orders.buy.pendingPayment'),
    pendingShipment: routePath('orders.buy.pendingShipment'),
    pendingReceipt: routePath('orders.buy.pendingReceipt'),
    completed: routePath('orders.buy.completed'),
    afterSale: routePath('orders.buy.afterSale'),
    cancelled: routePath('orders.buy.cancelled'),
  },
  orderRecycle: {
    review: routePath('orders.recycle.review'),
    pendingShip: routePath('orders.recycle.pendingShip'),
    pendingReceipt: routePath('orders.recycle.pendingReceipt'),
    testing: routePath('orders.recycle.testing'),
    pendingConfirm: routePath('orders.recycle.pendingConfirm'),
    pendingPayment: routePath('orders.recycle.pendingPayment'),
    completed: routePath('orders.recycle.completed'),
    cancelled: routePath('orders.recycle.cancelled'),
    closed: routePath('orders.recycle.closed'),
  },
  me: routePath('me'),
  meProfile: routePath('me.profile'),
  meAbout: routePath('me.about'),
  meMemberLevel: routePath('me.memberLevel'),
  meHoldings: routePath('me.holdings'),
  meRecharge: routePath('me.recharge'),
  meWithdraw: routePath('me.withdraw'),
  meAuth: routePath('me.auth'),
  meAuthFace: routePath('me.authFace'),
  meEnterpriseAuth: routePath('me.enterprise'),
  meEnterpriseStepBaseInfo: routePath('me.enterprise.base-info'),
  meEnterpriseFace: routePath('me.enterprise.face'),
  meEnterpriseStepBank: routePath('me.enterprise.bank'),
  meEnterpriseBankVerify: routePath('me.enterprise.bankVerify'),
  meKycStatus: routePath('me.enterprise.status'),
  meAgreementCustomerEnterprise: routePath('me.agreement.enterprise.customer'),
  meAgreementAmlEnterprise: routePath('me.agreement.enterprise.aml'),
  meAgreementPrivacyEnterprise: routePath('me.agreement.enterprise.privacy'),
  meAccounts: routePath('me.accounts'),
  meAccountForm: routePath('me.accountForm'),
  login: routePath('login'),
  loginAgreementService: routePath('login.agreement.service'),
  loginAgreementPrivacy: routePath('login.agreement.privacy'),
  quote: routePath('quote'),
  quoteAgreement: routePath('quote.agreement'),
  submitResult: routePath('quote.submitResult'),
  ship: {
    addresses: routePath('ship.addresses'),
    addressForm: routePath('ship.addressForm'),
  },
  guide: {
    common: routePath('guide.common'),
    form: routePath('guide.form'),
    feedback: routePath('guide.feedback'),
    display: routePath('guide.display'),
    quote: routePath('guide.quote'),
    assay: routePath('guide.assay'),
    order: routePath('guide.order'),
    trade: routePath('guide.trade'),
    states: routePath('guide.states'),
  },
}

/** 行情资讯列表：底部卡片“更多”入口。 */
export function marketNewsListPath() {
  return paths.marketNewsList
}

/** 行情资讯详情：列表页条目唯一入口。 */
export function marketNewsDetailPath(newsId: string) {
  return routePath('market.newsDetail').replace(':newsId', newsId)
}

/** 商品详情：购物车、商品卡共用同一条跳转规则。 */
export function buyDetailPath(productId: string) {
  return routePath('buy.detail').replace(':productId', productId)
}

/** 登录回跳：记录进入登录页前的 hash 路径，登录成功后原路返回。 */
export function loginRedirectState(): { from: string } {
  const from = window.location.hash.replace(/^#/, '')
  return { from: from || '/' }
}

/** 买金订单详情：订单列表唯一入口。 */
export function orderDetailPath(orderId: string) {
  return routePath('orders.detail').replace(':orderId', orderId)
}

/** 回收订单详情：复用已注册状态页的路径前缀，仅替换状态段。 */
export function recycleOrderDetailPath(status: string) {
  return routePath('orders.recycle.review').replace(/[^/]+$/, status)
}

/** 个人中心订单入口：带业务类型与状态直达订单列表。 */
export function ordersFilterPath(type: 'sales' | 'recycle', status: string) {
  return `${paths.orders}?type=${type}&status=${status}`
}

/** 消息详情：消息中心卡片点击进入。 */
export function messageDetailPath(id: string) {
  return routePath('messages.detail').replace(':id', id)
}
