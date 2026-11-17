import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { PrototypeNav } from '@/components/PrototypeNav'
import { EmptyState } from '@/components/EmptyState'
import { PageHeader } from '@/components/PageHeader'
import { PageShell } from '@/components/PageShell'
import { APP_ROUTES, isTabPath } from '@/routes/routes.config'

function NotFoundPage() {
  return (
    <PageShell>
      <PageHeader title="页面不存在" showBack={false} />
      <EmptyState title="页面不存在" description="请从左侧页面导航重新选择" />
    </PageShell>
  )
}

export default function App() {
  const { pathname } = useLocation()

  // 只有一级页（首页 / 买金 / 订单 / 我的）展示底部 Tab
  return (
    <>
      <PrototypeNav />
      <Layout showTab={isTabPath(pathname)}>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          {APP_ROUTES.map((route) => {
            const Component = route.component
            return <Route key={route.path} path={route.path} element={<Component />} />
          })}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </>
  )
}
