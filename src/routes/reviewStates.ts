export interface ReviewStateOption {
  value: string
  label: string
}

export interface ReviewStateSection {
  label: string
  options: ReviewStateOption[]
}

export interface ReviewStateGroup {
  /** 同一页面内唯一，也作为 URL 查询参数后缀 */
  id: string
  label: string
  /** 补充说明，解释该状态影响哪些区域 */
  hint?: string
  options: ReviewStateOption[]
  /** 互斥分组展示：用于「类型 + 状态」这类一处选择决定两个维度的开关 */
  sections?: ReviewStateSection[]
  defaultValue: string
}

/**
 * 桌面评审状态注册表：只登记「同一路由内可切换的运行时状态」。
 * 手机端不读取这里的状态，路由型多状态页面继续通过已有路由进入。
 */
export const REVIEW_STATES: Record<string, ReviewStateGroup[]> = {
  me: [
    {
      id: 'account',
      label: '登录状态',
      hint: '影响头部账户卡与各入口行的点击行为',
      defaultValue: 'auto',
      options: [
        { value: 'auto', label: '跟随真实' },
        { value: 'guest', label: '未登录' },
        { value: 'member', label: '已登录' },
      ],
    },
    {
      id: 'verify',
      label: '认证状态',
      hint: '影响头部认证标签展示',
      defaultValue: 'auto',
      options: [
        { value: 'auto', label: '跟随真实' },
        { value: 'none', label: '未实名' },
        { value: 'personal', label: '个人已实名' },
        { value: 'enterprise', label: '企业已认证' },
      ],
    },
  ],
  orders: [
    {
      id: 'scope',
      label: '订单类型与状态',
      hint: '选择后同时切换订单类型与状态筛选',
      defaultValue: 'auto',
      options: [{ value: 'auto', label: '跟随页面' }],
      sections: [
        {
          label: '购买订单',
          options: [
            { value: 'sales:all', label: '全部' },
            { value: 'sales:pending-payment', label: '待付款' },
            { value: 'sales:pending-shipment', label: '待发货' },
            { value: 'sales:pending-receipt', label: '待收货' },
            { value: 'sales:completed', label: '已完成' },
            { value: 'sales:after-sale', label: '售后' },
          ],
        },
        {
          label: '回收订单',
          options: [
            { value: 'recycle:all', label: '全部' },
            { value: 'recycle:pending-ship', label: '待寄出' },
            { value: 'recycle:pending-confirm', label: '待确认' },
            { value: 'recycle:completed', label: '已完成' },
            { value: 'recycle:after-sale', label: '售后' },
          ],
        },
      ],
    },
    {
      id: 'data',
      label: '数据量',
      hint: '用于演示列表空态',
      defaultValue: 'auto',
      options: [
        { value: 'auto', label: '跟随真实' },
        { value: 'empty', label: '空态' },
      ],
    },
  ],
  messages: [
    {
      id: 'filter',
      label: '消息分类',
      hint: '影响左侧分类与右侧列表',
      defaultValue: 'auto',
      options: [
        { value: 'auto', label: '跟随页面' },
        { value: 'all', label: '全部' },
        { value: 'alert', label: '金价提醒' },
        { value: 'order', label: '订单进度' },
        { value: 'live', label: '检测直播' },
        { value: 'quote', label: '终价提醒' },
        { value: 'fund', label: '资金通知' },
        { value: 'service', label: '售后服务' },
        { value: 'system', label: '系统通知' },
      ],
    },
    {
      id: 'read',
      label: '阅读状态',
      hint: '影响未读圆点、角标与已读按钮',
      defaultValue: 'auto',
      options: [
        { value: 'auto', label: '跟随真实' },
        { value: 'unread', label: '全部未读' },
        { value: 'read', label: '全部已读' },
      ],
    },
  ],
  cart: [
    {
      id: 'items',
      label: '购物车内容',
      hint: '影响商品列表与底部结算栏',
      defaultValue: 'auto',
      options: [
        { value: 'auto', label: '跟随真实' },
        { value: 'empty', label: '空车' },
        { value: 'filled', label: '有商品' },
      ],
    },
    {
      id: 'mode',
      label: '管理模式',
      hint: '影响行内操作与右上角入口',
      defaultValue: 'auto',
      options: [
        { value: 'auto', label: '跟随真实' },
        { value: 'browse', label: '浏览' },
        { value: 'manage', label: '管理' },
      ],
    },
  ],
  quote: [
    {
      id: 'input',
      label: '估价输入',
      hint: '影响估价卡折叠 / 展开与预估金额',
      defaultValue: 'auto',
      options: [
        { value: 'auto', label: '跟随真实' },
        { value: 'empty', label: '未输入' },
        { value: 'filled', label: '已填 20 克' },
      ],
    },
    {
      id: 'docs',
      label: '前置资料',
      hint: '影响寄件地址与收款方式两行',
      defaultValue: 'auto',
      options: [
        { value: 'auto', label: '跟随真实' },
        { value: 'none', label: '都未选' },
        { value: 'ready', label: '已选地址与收款' },
      ],
    },
    {
      id: 'agreed',
      label: '协议勾选',
      hint: '影响吸底栏协议状态',
      defaultValue: 'auto',
      options: [
        { value: 'auto', label: '跟随真实' },
        { value: 'yes', label: '已勾选' },
        { value: 'no', label: '未勾选' },
      ],
    },
  ],
  checkout: [
    {
      id: 'address',
      label: '收货地址',
      hint: '影响地址卡与提交校验',
      defaultValue: 'auto',
      options: [
        { value: 'auto', label: '跟随真实' },
        { value: 'have', label: '已有地址' },
        { value: 'none', label: '未选地址' },
      ],
    },
    {
      id: 'agree',
      label: '购买协议',
      hint: '影响底部协议勾选',
      defaultValue: 'auto',
      options: [
        { value: 'auto', label: '跟随真实' },
        { value: 'yes', label: '已勾选' },
        { value: 'no', label: '未勾选' },
      ],
    },
  ],
  'support.chat': [
    {
      id: 'stage',
      label: '会话阶段',
      hint: '影响顶部状态、输入区与转人工入口',
      defaultValue: 'auto',
      options: [
        { value: 'auto', label: '跟随真实' },
        { value: 'bot', label: '智能客服' },
        { value: 'queue', label: '排队中' },
        { value: 'agent', label: '人工客服' },
      ],
    },
  ],
  market: [
    {
      id: 'phase',
      label: '交易状态',
      hint: '影响顶部交易状态与交易卡买卖按钮',
      defaultValue: 'auto',
      options: [
        { value: 'auto', label: '跟随时间' },
        { value: 'open', label: '开市' },
        { value: 'closed', label: '休市' },
      ],
    },
    {
      id: 'account',
      label: '登录状态',
      hint: '未登录时点订阅提醒/已订阅会弹出登录引导框',
      defaultValue: 'auto',
      options: [
        { value: 'auto', label: '跟随真实' },
        { value: 'guest', label: '未登录' },
        { value: 'member', label: '已登录' },
      ],
    },
    {
      id: 'verify',
      label: '实名状态',
      hint: '已登录未实名时点订阅入口会弹出实名引导框',
      defaultValue: 'auto',
      options: [
        { value: 'auto', label: '跟随真实' },
        { value: 'none', label: '未实名' },
        { value: 'personal', label: '已实名' },
      ],
    },
    {
      id: 'subscription',
      label: '订阅状态',
      hint: '切换订阅卡文案与按钮（订阅提醒 / 已订阅）',
      defaultValue: 'auto',
      options: [
        { value: 'auto', label: '跟随真实' },
        { value: 'none', label: '未订阅' },
        { value: 'subscribed', label: '已订阅' },
      ],
    },
    {
      id: 'risk',
      label: '风险提示',
      hint: '影响进入行情页时的风险确认弹窗',
      defaultValue: 'auto',
      options: [
        { value: 'auto', label: '跟随真实' },
        { value: 'acked', label: '已确认' },
        { value: 'pending', label: '待确认' },
      ],
    },
  ],
}
