import { Card, DetailPage } from '@/components'
import { NEWS_DISCLAIMER, sortedNews } from '@/mocks/market'
import { marketNewsDetailPath } from '@/routes/paths'
import { Newspaper } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * 资讯列表：独立全屏路由。
 * - 返回固定回行情主页
 * - 条目点击进资讯详情（详情页返回本列表）
 */
export function MarketNewsListPage() {
  const navigate = useNavigate()
  const list = useMemo(() => sortedNews(), [])

  return (
    <DetailPage title="资讯" onBack={() => navigate('/market')}>
      {list.length === 0 ? (
        <Card padding="lg" className="text-center">
          <Newspaper size={28} className="mx-auto text-icon-muted" />
          <p className="mt-3 text-body text-subtle-foreground">暂无资讯，稍后再来看看</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {list.map((item) => (
            <Card key={item.id} padding="none" className="overflow-hidden">
              <button
                type="button"
                onClick={() => navigate(marketNewsDetailPath(item.id))}
                className="block w-full px-4 py-3 text-left transition active:bg-surface-2"
              >
                <p className="line-clamp-2 text-body-strong text-foreground">{item.title}</p>
                <p className="mt-1 text-caption text-subtle-foreground tabular">
                  {item.publishedAt} · {item.source}
                </p>
              </button>
            </Card>
          ))}
        </div>
      )}

      <p className="px-1 pb-2 pt-1 text-center text-caption text-subtle-foreground">
        {NEWS_DISCLAIMER}
      </p>
    </DetailPage>
  )
}
