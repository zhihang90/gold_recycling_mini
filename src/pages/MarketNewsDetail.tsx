import { Button, DetailPage, EmptyState } from '@/components'
import { NEWS_DISCLAIMER, getNewsById } from '@/mocks/market'
import { Newspaper } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

/** 资讯详情：独立全屏路由，返回固定回资讯列表 */
export function MarketNewsDetailPage() {
  const { newsId } = useParams<{ newsId: string }>()
  const navigate = useNavigate()
  const news = newsId ? getNewsById(newsId) : undefined

  const backToNews = () => navigate('/market/news')

  if (!news) {
    return (
      <DetailPage title="资讯详情" onBack={backToNews}>
        <EmptyState
          icon={Newspaper}
          title="资讯不存在或已下线"
          description="该资讯可能已被删除，或链接已失效。"
          action={<Button onClick={backToNews}>返回资讯</Button>}
        />
      </DetailPage>
    )
  }

  return (
    <DetailPage title="资讯详情" onBack={backToNews}>
      <article className="space-y-4">
        <header className="space-y-2">
          <h1 className="text-section leading-snug text-foreground">{news.title}</h1>
          <p className="text-caption text-subtle-foreground tabular">
            {news.publishedAt} · 来源：{news.source}
          </p>
        </header>

        <div className="h-px bg-border-subtle" />

        <div className="space-y-3">
          {news.paragraphs.map((paragraph, index) => (
            <p key={index} className="text-body leading-relaxed text-muted-foreground">
              {paragraph}
            </p>
          ))}
        </div>

        <p className="rounded-md bg-surface-2 px-3 py-2 text-caption text-subtle-foreground">
          {NEWS_DISCLAIMER}。
        </p>
      </article>
    </DetailPage>
  )
}
