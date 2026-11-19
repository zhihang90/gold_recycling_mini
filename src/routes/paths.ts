/**
 * 路由表：路径唯一来源。
 */
export const paths = {
  home: '/home',
  buy: '/buy',
  buyDetail: '/buy/:productId',
  cart: '/cart',
  checkout: '/checkout',
  checkoutSuccess: '/checkout/success',
  orders: '/orders',
  orderDetail: '/orders/:orderId',
  /** 消息中心：订单列表右上角入口进入；消息详情为独立二级页 */
  messages: '/messages',
  messageDetail: '/messages/:id',
  /** 购买订单详情：按状态各一条路由，供需求评审逐状态查看 */
  orderBuy: {
    pendingPayment: '/orders/buy/pending-payment',
    pendingShipment: '/orders/buy/pending-shipment',
    pendingReceipt: '/orders/buy/pending-receipt',
    completed: '/orders/buy/completed',
    afterSale: '/orders/buy/after-sale',
    cancelled: '/orders/buy/cancelled',
  },
  /** 回收订单详情：按系统主状态各一条路由 */
  orderRecycle: {
    review: '/orders/recycle/review',
    pendingShip: '/orders/recycle/pending-ship',
    pendingReceipt: '/orders/recycle/pending-receipt',
    testing: '/orders/recycle/testing',
    pendingConfirm: '/orders/recycle/pending-confirm',
    pendingPayment: '/orders/recycle/pending-payment',
    completed: '/orders/recycle/completed',
    cancelled: '/orders/recycle/cancelled',
    closed: '/orders/recycle/closed',
  },
  me: '/me',
  meProfile: '/me/profile',
  meAuth: '/me/auth',
  /** 收款账户：列表与添加银行卡各占一条路由 */
  meAccounts: '/me/accounts',
  meAccountForm: '/me/accounts/new',
  login: '/login',
  quote: '/quote',
  quoteAgreement: '/quote/agreement',
  submitResult: '/quote/submit-result',
  ship: {
    addresses: '/ship/addresses',
    addressForm: '/ship/addresses/form',
  },
  guide: {
    common: '/style-guide/common',
    form: '/style-guide/form',
    feedback: '/style-guide/feedback',
    display: '/style-guide/display',
    quote: '/style-guide/quote',
    assay: '/style-guide/assay',
    order: '/style-guide/order',
    trade: '/style-guide/trade',
    states: '/style-guide/states',
  },
}

/** 商品详情：购物车、商品卡共用同一条跳转规则。 */
export function buyDetailPath(productId: string) {
  return `/buy/${productId}`
}

/** 买金订单详情：订单列表唯一入口。 */
export function orderDetailPath(orderId: string) {
  return `/orders/${orderId}`
}

/** 回收订单详情：订单列表按状态进入对应详情页。 */
export function recycleOrderDetailPath(status: string) {
  return `/orders/recycle/${status}`
}

/** 个人中心订单入口：带业务类型与状态直达订单列表。 */
export function ordersFilterPath(type: 'sales' | 'recycle', status: string) {
  return `/orders?type=${type}&status=${status}`
}

/** 消息详情：消息中心卡片点击进入。 */
export function messageDetailPath(id: string) {
  return `/messages/${id}`
}

