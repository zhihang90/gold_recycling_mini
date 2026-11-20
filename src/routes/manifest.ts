import { paths } from './paths'

/** 桌面演示菜单的分组顺序，同时决定左栏展示顺序 */
export const ROUTE_GROUPS = ['业务页面', '组件库', '黄金回收组件'] as const

export type RouteGroup = (typeof ROUTE_GROUPS)[number]

/** 底部 Tab 图标名：在这里只存字符串，真正的图标组件由 routes.config 映射 */
export type TabIconName = 'home' | 'bag' | 'cart' | 'orders' | 'user'

export interface TabMeta {
  label: string
  icon: TabIconName
  order: number
  /** 视觉强化：底部栏中间入口用凸起金色按钮，区别于普通 Tab */
  emphasis?: boolean
}

/**
 * 路由清单：新增页面只改两处——paths.ts 加一行路径、这里加一条记录。
 * 路由注册、左栏菜单、底部 Tab、视觉基线都从本清单派生，不再各自维护。
 */
export interface RouteMeta {
  /** 唯一标识，用点分层级；默认也用作视觉基线文件名（点转横线） */
  id: string
  path: string
  /** 桌面左栏展示用的名称 */
  label: string
  /** 页面自身标题（浏览器标题用它）；缺省回落到 label */
  pageTitle?: string
  group: RouteGroup
  /** 左栏二级分组；缺省时页面直接挂在分组下 */
  section?: string
  /** 左栏排序，越小越靠前；缺省排在组尾 */
  order?: number
  /** 左栏演示入口；带动态参数的页面填一个可用的示例路径，缺省用 path */
  menuPath?: string
  /** 底部 Tab 元数据；有 tab 的就是一级页 */
  tab?: TabMeta
  /**
   * src/pages 下的模块路径（不含扩展名）。
   * 业务页约定导出「文件名 + Page」，组件库页约定导出「文件名 + GuidePage」。
   */
  page: string
  /** 视觉基线文件名；缺省由 id 生成。基线已存在时不要随意改动 */
  shot?: string
  /** 是否参与视觉回归；缺省参与。依赖交互状态、首屏不稳定的页面设为 false */
  visual?: boolean
  /** 视觉回归时追加的查询串，用于通过 ?demo= 直达确定性演示状态 */
  visualQuery?: string
  /** 路由存在但从演示菜单隐藏（如从列表进入的真实详情页） */
  hidden?: boolean
}

export const ROUTE_MANIFEST: RouteMeta[] = [
  {
    id: 'home',
    path: paths.home,
    label: '首页',
    pageTitle: '安盛华黄金回收',
    group: '业务页面',
    section: '入口',
    order: 1,
    tab: { label: '首页', icon: 'home', order: 1 },
    page: 'Home',
  },
  {
    id: 'quote',
    path: paths.quote,
    label: '回收预约',
    group: '业务页面',
    section: '黄金回收',
    order: 10,
    page: 'Quote',
  },
  {
    id: 'quote.agreement',
    path: paths.quoteAgreement,
    label: '阅读并同意须知',
    pageTitle: '阅读并同意相关须知',
    group: '业务页面',
    section: '黄金回收',
    order: 11,
    page: 'QuoteAgreement',
    // 依赖滚动阅读进度，视觉基线不参与
    visual: false,
  },
  {
    id: 'quote.submitResult',
    path: paths.submitResult,
    label: '提交结果',
    group: '业务页面',
    section: '黄金回收',
    order: 12,
    page: 'SubmitResult',
  },
  {
    id: 'login',
    path: paths.login,
    label: '登录授权',
    pageTitle: '用户登录',
    group: '业务页面',
    section: '入口',
    order: 2,
    page: 'Login',
  },
  {
    id: 'buy',
    path: paths.buy,
    label: '买金',
    group: '业务页面',
    section: '黄金购买',
    order: 20,
    tab: { label: '买金', icon: 'bag', order: 2 },
    page: 'Buy',
  },
  {
    id: 'buy.detail',
    path: paths.buyDetail,
    label: '商品详情',
    group: '业务页面',
    section: '黄金购买',
    order: 21,
    // 评审入口指向在售商品，避免落到「商品不存在」空态
    menuPath: paths.buyDetail.replace(':productId', 'bar-sheet'),
    page: 'BuyDetail',
    // 依赖动态商品参数，视觉基线走 /buy 列表页覆盖，详情页单独手工验收
    visual: false,
  },
  {
    id: 'cart',
    path: paths.cart,
    label: '购物车',
    group: '业务页面',
    section: '黄金购买',
    order: 22,
    tab: { label: '购物车', icon: 'cart', order: 3, emphasis: true },
    page: 'Cart',
  },
  {
    id: 'checkout',
    path: paths.checkout,
    label: '确认订单',
    pageTitle: '确认订单',
    group: '业务页面',
    section: '黄金购买',
    order: 23,
    // 评审入口直达样例订单，避免落到「没有待结算商品」空态
    menuPath: `${paths.checkout}?demo=checkout`,
    page: 'BuyCheckout',
    visual: false,
  },
  {
    id: 'checkout.success',
    path: paths.checkoutSuccess,
    label: '支付成功',
    pageTitle: '支付成功',
    group: '业务页面',
    section: '黄金购买',
    order: 24,
    // 评审入口直达成功态，不依赖刚完成的支付
    menuPath: `${paths.checkoutSuccess}?demo=success`,
    page: 'BuyCheckoutSuccess',
    visual: false,
  },
  {
    id: 'orders',
    path: paths.orders,
    label: '订单列表',
    group: '业务页面',
    section: '订单列表',
    order: 30,
    tab: { label: '订单', icon: 'orders', order: 4 },
    page: 'Orders',
  },
  {
    id: 'messages',
    path: paths.messages,
    label: '消息中心',
    pageTitle: '消息中心',
    group: '业务页面',
    section: '消息中心',
    order: 30.5,
    // 首屏含倒计时（终价置顶卡），随时间漂移，不参与视觉基线
    visual: false,
    page: 'Messages',
  },
  {
    id: 'messages.detail',
    path: paths.messageDetail,
    label: '消息详情',
    pageTitle: '消息详情',
    group: '业务页面',
    section: '消息中心',
    order: 30.6,
    // 从消息中心进入的真实详情页，不在演示菜单重复展示
    hidden: true,
    menuPath: paths.messageDetail.replace(':id', 'm-quote-pending'),
    visual: false,
    page: 'MessageDetail',
  },
  {
    id: 'orders.detail',
    path: paths.orderDetail,
    label: '订单详情',
    pageTitle: '订单详情',
    group: '业务页面',
    section: '购买订单详情',
    order: 41,
    // 从订单列表进入的真实订单详情，不在演示菜单重复展示
    hidden: true,
    // 评审入口指向演示订单（待收货，可看到物流卡片）
    menuPath: paths.orderDetail.replace(':orderId', 'SO20261105003'),
    page: 'BuyOrderDetail',
    visual: false,
  },
  {
    id: 'orders.recycle.review',
    path: paths.orderRecycle.review,
    label: '审核中',
    group: '业务页面',
    section: '回收订单详情',
    order: 30.5,
    page: 'RecycleOrderStatus',
    visual: false,
  },
  {
    id: 'orders.recycle.pendingShip',
    path: paths.orderRecycle.pendingShip,
    label: '待寄出',
    group: '业务页面',
    section: '回收订单详情',
    order: 31,
    page: 'RecycleOrderStatus',
    visual: false,
  },
  {
    id: 'orders.recycle.pendingReceipt',
    path: paths.orderRecycle.pendingReceipt,
    label: '待签收',
    group: '业务页面',
    section: '回收订单详情',
    order: 31.5,
    page: 'RecycleOrderStatus',
    visual: false,
  },
  {
    id: 'orders.recycle.testing',
    path: paths.orderRecycle.testing,
    label: '检测中',
    group: '业务页面',
    section: '回收订单详情',
    order: 32,
    page: 'RecycleOrderStatus',
    visual: false,
  },
  {
    id: 'orders.recycle.pendingConfirm',
    path: paths.orderRecycle.pendingConfirm,
    label: '待确认',
    group: '业务页面',
    section: '回收订单详情',
    order: 33,
    page: 'RecycleOrderStatus',
    visual: false,
  },
  {
    id: 'orders.recycle.pendingPayment',
    path: paths.orderRecycle.pendingPayment,
    label: '待打款',
    group: '业务页面',
    section: '回收订单详情',
    order: 34,
    page: 'RecycleOrderStatus',
    visual: false,
  },
  {
    id: 'orders.recycle.completed',
    path: paths.orderRecycle.completed,
    label: '已完成',
    group: '业务页面',
    section: '回收订单详情',
    order: 35,
    page: 'RecycleOrderStatus',
    visual: false,
  },
  {
    id: 'orders.recycle.cancelled',
    path: paths.orderRecycle.cancelled,
    label: '已取消',
    group: '业务页面',
    section: '回收订单详情',
    order: 35.2,
    page: 'RecycleOrderStatus',
    visual: false,
  },
  {
    id: 'orders.recycle.closed',
    path: paths.orderRecycle.closed,
    label: '已关闭',
    group: '业务页面',
    section: '回收订单详情',
    order: 35.4,
    page: 'RecycleOrderStatus',
    visual: false,
  },
  {
    id: 'orders.buy.pendingPayment',
    path: paths.orderBuy.pendingPayment,
    label: '待付款',
    group: '业务页面',
    section: '购买订单详情',
    order: 36,
    page: 'BuyOrderStatus',
    visual: false,
  },
  {
    id: 'orders.buy.pendingShipment',
    path: paths.orderBuy.pendingShipment,
    label: '待发货',
    group: '业务页面',
    section: '购买订单详情',
    order: 37,
    page: 'BuyOrderStatus',
    visual: false,
  },
  {
    id: 'orders.buy.pendingReceipt',
    path: paths.orderBuy.pendingReceipt,
    label: '待收货',
    group: '业务页面',
    section: '购买订单详情',
    order: 38,
    page: 'BuyOrderStatus',
    visual: false,
  },
  {
    id: 'orders.buy.completed',
    path: paths.orderBuy.completed,
    label: '已完成',
    group: '业务页面',
    section: '购买订单详情',
    order: 39,
    page: 'BuyOrderStatus',
    visual: false,
  },
  {
    id: 'orders.buy.afterSale',
    path: paths.orderBuy.afterSale,
    label: '售后中',
    group: '业务页面',
    section: '购买订单详情',
    order: 40,
    page: 'BuyOrderStatus',
    visual: false,
  },
  {
    id: 'orders.buy.cancelled',
    path: paths.orderBuy.cancelled,
    label: '已取消',
    group: '业务页面',
    section: '购买订单详情',
    order: 41.5,
    page: 'BuyOrderStatus',
    visual: false,
  },
  {
    id: 'me',
    path: paths.me,
    label: '我的',
    group: '业务页面',
    section: '账户',
    order: 40,
    tab: { label: '我的', icon: 'user', order: 5 },
    page: 'Me',
  },
  {
    id: 'me.profile',
    path: paths.meProfile,
    label: '个人中心',
    group: '业务页面',
    section: '账户',
    order: 41,
    page: 'ProfileInfo',
    visual: false,
  },
  {
    id: 'me.auth',
    path: paths.meAuth,
    label: '实名认证',
    group: '业务页面',
    section: '账户',
    order: 42,
    page: 'RealNameAuth',
    visual: false,
  },
  {
    id: 'me.authFace',
    path: paths.meAuthFace,
    label: '人脸识别',
    group: '业务页面',
    section: '账户',
    order: 42.1,
    page: 'RealNameAuthFace',
    visual: false,
  },
  {
    id: 'me.accounts',
    path: paths.meAccounts,
    label: '收款账户',
    group: '业务页面',
    section: '账户',
    order: 42.5,
    page: 'BankAccounts',
    visual: false,
  },
  {
    id: 'me.accountForm',
    path: paths.meAccountForm,
    label: '添加银行卡',
    group: '业务页面',
    section: '账户',
    order: 42.6,
    page: 'BankCardForm',
    visual: false,
  },
  {
    id: 'ship.addresses',
    path: paths.ship.addresses,
    label: '我的地址',
    group: '业务页面',
    section: '账户',
    order: 43,
    page: 'AddressBook',
    shot: 'addresses',
  },
  {
    id: 'ship.addressForm',
    path: paths.ship.addressForm,
    label: '新增地址',
    group: '业务页面',
    section: '账户',
    order: 44,
    page: 'AddressForm',
    shot: 'address-form',
  },
  {
    id: 'guide.states',
    path: paths.guide.states,
    label: '弹层状态总览',
    pageTitle: '弹层状态总览',
    group: '组件库',
    order: 9,
    page: 'style-guide/States',
    // 靠交互触发的入口集合，不做视觉基线
    visual: false,
  },
  {
    id: 'guide.common',
    path: paths.guide.common,
    label: '公共组件',
    group: '组件库',
    order: 10,
    page: 'style-guide/Common',
  },
  {
    id: 'guide.form',
    path: paths.guide.form,
    label: '表单组件',
    group: '组件库',
    order: 11,
    page: 'style-guide/Form',
  },
  {
    id: 'guide.feedback',
    path: paths.guide.feedback,
    label: '反馈组件',
    group: '组件库',
    order: 12,
    page: 'style-guide/Feedback',
  },
  {
    id: 'guide.display',
    path: paths.guide.display,
    label: '展示组件',
    group: '组件库',
    order: 13,
    page: 'style-guide/Display',
    visual: false,
  },
  {
    id: 'guide.quote',
    path: paths.guide.quote,
    label: '报价与估价',
    group: '黄金回收组件',
    order: 20,
    page: 'style-guide/Quote',
    visual: false,
  },
  {
    id: 'guide.assay',
    path: paths.guide.assay,
    label: '检测与合规',
    group: '黄金回收组件',
    order: 21,
    page: 'style-guide/Assay',
    visual: false,
  },
  {
    id: 'guide.order',
    path: paths.guide.order,
    label: '订单与状态',
    group: '黄金回收组件',
    order: 22,
    page: 'style-guide/Order',
    visual: false,
  },
  {
    id: 'guide.trade',
    path: paths.guide.trade,
    label: '交易与收货',
    group: '黄金回收组件',
    order: 23,
    page: 'style-guide/Trade',
    visual: false,
  },
]

/** 视觉基线文件名：显式 shot 优先，否则 id 中的点转横线 */
export function shotName(route: RouteMeta) {
  return route.shot ?? route.id.replace(/\./g, '-')
}

/** 视觉回归路由表：构建时写入 dist/routes.json，由 scripts/visual.mjs 读取 */
export const SCREENSHOT_ROUTES = ROUTE_MANIFEST.filter((route) => route.visual !== false).map(
  (route) => ({
    name: shotName(route),
    path: route.visualQuery ? `${route.path}?${route.visualQuery}` : route.path,
  }),
)
