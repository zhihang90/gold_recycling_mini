import { Layout, PrototypeNav, EmptyState, PageHeader, PageShell } from '@/components'
import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'

import { APP_ROUTES, isTabPath, matchRoute } from '@/routes/routes.config'
import { paths } from '@/routes/paths'

function NotFoundPage() {
  return (
    <PageShell>
      <PageHeader title="页面不存在" showBack={false} />
      <EmptyState title="页面不存在" description="请从左侧页面导航重新选择" />
    </PageShell>
  )
}

export default function App() {
  const { pathname, search } = useLocation()

  useEffect(() => {
    const route = matchRoute(pathname)
    document.title = route ? (route.pageTitle ?? route.label) : '页面不存在'
  }, [pathname])

  // 只有一级页（首页 / 买金 / 订单 / 我的）展示底部 Tab
  return (
    <>
      <PrototypeNav />
      <Layout showTab={isTabPath(pathname)}>
        <Routes>
          {/* 默认入口先进登录页，登录成功后再进入买金 */}
          <Route path="/" element={<Navigate to={paths.login} replace />} />
          {APP_ROUTES.map((route) => {
            const Component = route.component
            // 查询串变化（弹层状态 / demo 参数）视为一次新视图，重新挂载页面，
            // 否则同路径下切换 ?sheet=&state= 不会更新页面内部的弹层状态
            return <Route key={route.path} path={route.path} element={<Component key={search} />} />
          })}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </>
  )
}
