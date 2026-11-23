import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { marked } from 'marked'
import { DetailPage } from '@/components'
import userAgreementMd from '../../docs/agreements/user-agreement.md?raw'
import privacyPolicyMd from '../../docs/agreements/privacy-policy.md?raw'

const DOC = {
  service: { title: '用户协议', raw: userAgreementMd },
  privacy: { title: '隐私政策', raw: privacyPolicyMd },
} as const

type AgreementKind = keyof typeof DOC

/**
 * 协议文档页：登录页「用户协议 / 隐私政策」的整页展示。
 * 两条路由（/login/agreement/service、/login/agreement/privacy）共用此页面，
 * 通过 path 末段区分文档。markdown 源文件放在 docs/agreements/，
 * 构建时通过 ?raw import 内联进 bundle，不依赖运行时 fetch。
 */
export function AgreementDocPage() {
  const { pathname } = useLocation()
  const kind: AgreementKind = pathname.endsWith('/privacy') ? 'privacy' : 'service'
  const { title, raw } = DOC[kind]
  const html = useMemo(() => marked.parse(raw, { async: false }) as string, [raw])

  return (
    <DetailPage title={title}>
      <article className="agreement-doc" dangerouslySetInnerHTML={{ __html: html }} />
    </DetailPage>
  )
}
