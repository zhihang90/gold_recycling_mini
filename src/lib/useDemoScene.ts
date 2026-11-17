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
