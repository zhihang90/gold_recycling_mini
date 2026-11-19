import { useSearchParams } from 'react-router-dom'

/**
 * 演示直达参数：?demo=<scene> 时页面用固定样例渲染，不写入本地存储。
 * 依赖上一步数据的页面（估价结果、物品信息）可借此直接分享演示链接，
 * 视觉回归也能通过 manifest 的 visualQuery 进入确定性状态。
 */
export function useDemoScene() {
  const [searchParams] = useSearchParams()
  return searchParams.get('demo')
}

export interface SheetScene {
  /** 需要自动展开的弹层标识，如 address / bank / pickup */
  sheet: string | null
  /** 弹层状态，如 empty / list；缺省为默认态 */
  state: string | null
  /** 判断当前要展开的弹层是否为指定标识 */
  is: (name: string) => boolean
}

/**
 * 弹层演示直达参数：?sheet=<name>&state=<state>。
 * 页面据此自动展开对应弹层，并可用 state 切换空态/有数据等分支；
 * 不带参数时与正常交互完全一致。
 */
export function useSheetScene(): SheetScene {
  const [searchParams] = useSearchParams()
  const sheet = searchParams.get('sheet')
  return {
    sheet,
    state: searchParams.get('state'),
    is: (name: string) => sheet === name,
  }
}
