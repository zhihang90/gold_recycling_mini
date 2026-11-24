export interface ReviewStateOption {
  value: string
  label: string
}

export interface ReviewStateGroup {
  /** 同一页面内唯一，也作为 URL 查询参数后缀 */
  id: string
  label: string
  /** 补充说明，解释该状态影响哪些区域 */
  hint?: string
  options: ReviewStateOption[]
  defaultValue: string
}

/**
 * 桌面评审状态注册表：只登记「同一路由内可切换的运行时状态」。
 * 手机端不读取这里的状态，路由型多状态页面继续通过已有路由进入。
 */
export const REVIEW_STATES: Record<string, ReviewStateGroup[]> = {
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
  ],
}
