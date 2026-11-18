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
  /** 购买订单详情：按状态各一条路由，供需求评审逐状态查看 */
  orderBuy: {
    pendingPayment: '/orders/buy/pending-payment',
    pendingShipment: '/orders/buy/pending-shipment',
    pendingReceipt: '/orders/buy/pending-receipt',
    completed: '/orders/buy/completed',
    afterSale: '/orders/buy/after-sale',
    cancelled: '/orders/buy/cancelled',
  },
  /** 回收订单详情：按状态各一条路由 */
  orderRecycle: {
    pendingShip: '/orders/recycle/pending-ship',
    testing: '/orders/recycle/testing',
    pendingConfirm: '/orders/recycle/pending-confirm',
    pendingPayment: '/orders/recycle/pending-payment',
    completed: '/orders/recycle/completed',
  },
  me: '/me',
  meProfile: '/me/profile',
  meAuth: '/me/auth',
  login: '/login',
  quote: '/quote',
  quoteAgreement: '/quote/agreement',
  submitResult: '/quote/submit-result',
  pickupDetail: '/quote/pickup',
  ship: {
    info: '/ship/info',
    addresses: '/ship/addresses',
    addressForm: '/ship/addresses/form',
    photos: '/ship/photos',
    contract: '/ship/contract',
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

