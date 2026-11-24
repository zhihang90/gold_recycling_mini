import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { marked } from 'marked'
import { Button, DetailPage } from '@/components'
import userAgreementMd from '../../docs/agreements/user-agreement.md?raw'
import privacyPolicyMd from '../../docs/agreements/privacy-policy.md?raw'

const DOC = {
  service: { title: '用户协议', raw: userAgreementMd },
  privacy: { title: '隐私政策', raw: privacyPolicyMd },
} as const

type AgreementKind = keyof typeof DOC

/**
 * 协议文档页：登录页和企业 KYC 流程的协议整页展示。
 * 5 条路由共用此页面，通过 path 段匹配文档类型。
 * markdown 源文件放在 docs/agreements/，构建时通过 ?raw import 内联。
 * 所有协议页均显示「我已知晓并同意」底部按钮。
 */
export function AgreementDocPage() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  // 匹配 5 条路由到两种 markdown 文档
  const kind: AgreementKind =
    pathname.includes('/privacy') ? 'privacy' : 'service'
  const { title, raw } = DOC[kind]
  const html = useMemo(() => marked.parse(raw, { async: false }) as string, [raw])

  const footer = (
    <Button size="lg" className="w-full" onClick={() => navigate(-1)}>
      我已知晓并同意
    </Button>
  )

  return (
    <DetailPage title={title} footer={footer}>
      <article className="agreement-doc" dangerouslySetInnerHTML={{ __html: html }} />
    </DetailPage>
  )
}
