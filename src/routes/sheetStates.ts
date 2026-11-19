import { paths } from './paths'

/**
 * 弹层状态清单：弹层不单独占路由，用「页面路径 + ?sheet=&state=」直达。
 * 左侧「弹层状态」分组与 /style-guide/states 总览页都从这份清单派生，
 * 新增弹层状态只需要在这里补一条，不涉及路由注册。
 */
export interface SheetStateMeta {
  id: string
  /** 左栏与总览页展示的名称 */
  label: string
  /** 左栏二级分组 */
  section: string
  /** 直达链接：页面路径 + sheet/state 查询串 */
  menuPath: string
  /** 所属页面模块（文档索引用，与 manifest 的 page 一致） */
  page: string
  /** 弹层标识，对应页面里的 sheet 参数 */
  sheet: string
  /** 弹层状态，对应 state 参数；缺省为默认态 */
  state?: string
  /** 补充说明，展示在总览页 */
  note?: string
}

export const SHEET_STATES: SheetStateMeta[] = [
  {
    id: 'quote.address.list',
    label: '选择寄件地址 · 有地址',
    section: '寄件与地址',
    menuPath: `${paths.quote}?sheet=address&state=list`,
    page: 'Quote',
    sheet: 'address',
    state: 'list',
    note: '地址簿有数据，列出地址并高亮当前选中项',
  },
  {
    id: 'quote.address.empty',
    label: '选择寄件地址 · 空态',
    section: '寄件与地址',
    menuPath: `${paths.quote}?sheet=address&state=empty`,
    page: 'Quote',
    sheet: 'address',
    state: 'empty',
    note: '地址簿为空，引导添加新地址',
  },
  {
    id: 'quote.pickup.default',
    label: '选择上门取件时间',
    section: '寄件与地址',
    menuPath: `${paths.quote}?sheet=pickup`,
    page: 'Quote',
    sheet: 'pickup',
    note: '今天/明天/后天 + 两列时段',
  },
  {
    id: 'quote.detail.filled',
    label: '预估回收价明细 · 有值',
    section: '估价',
    menuPath: `${paths.quote}?sheet=detail&state=filled&weight=10`,
    page: 'Quote',
    sheet: 'detail',
    state: 'filled',
    note: '已填克重，展示总价值、服务费、运费与保险费',
  },
  {
    id: 'quote.detail.empty',
    label: '预估回收价明细 · 未填克重',
    section: '估价',
    menuPath: `${paths.quote}?sheet=detail&state=empty`,
    page: 'Quote',
    sheet: 'detail',
    state: 'empty',
    note: '未输入克重，展示空态「请填写克重」',
  },
  {
    id: 'quote.photo.empty',
    label: '上传实物照片及凭证',
    section: '物品信息',
    menuPath: `${paths.quote}?sheet=photo`,
    page: 'Quote',
    sheet: 'photo',
    note: '含示例图与至少两张的校验',
  },
  {
    id: 'quote.bank.list',
    label: '选择收款方式 · 有账户',
    section: '收款',
    menuPath: `${paths.quote}?sheet=bank&state=list`,
    page: 'Quote',
    sheet: 'bank',
    state: 'list',
    note: '复用收款账户列表，单选后确认',
  },
  {
    id: 'quote.bank.empty',
    label: '选择收款方式 · 空态',
    section: '收款',
    menuPath: `${paths.quote}?sheet=bank&state=empty`,
    page: 'Quote',
    sheet: 'bank',
    state: 'empty',
    note: '未绑定银行卡，引导去添加',
  },
  {
    id: 'quote.freight.rules',
    label: '运保费规则',
    section: '估价',
    menuPath: `${paths.quote}?sheet=freight`,
    page: 'Quote',
    sheet: 'freight',
    note: '运保费计算规则说明弹层',
  },
]

/** 按二级分组聚合，供总览页渲染 */
export function groupSheetStates() {
  const sections: { title: string; items: SheetStateMeta[] }[] = []
  SHEET_STATES.forEach((item) => {
    const section = sections.find((entry) => entry.title === item.section)
    if (section) {
      section.items.push(item)
    } else {
      sections.push({ title: item.section, items: [item] })
    }
  })
  return sections
}
