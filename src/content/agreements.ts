import legalSourceRaw from './legal-source.md?raw'
import recyclingNoticeRaw from './recycling-notice.md?raw'

/**
 * 协议正文：直接以原文 Markdown 引入，文字不改动。
 * 《黄金合法来源协议》末尾的「附注（签署页 UI 信息，非协议正文）」是签署页说明，
 * 不属于协议正文，渲染前只裁掉这一段。
 */
const LEGAL_SOURCE_BODY = legalSourceRaw.split('\n---\n')[0]

export interface AgreementDocument {
  key: string
  content: string
}

export const AGREEMENT_DOCUMENTS: AgreementDocument[] = [
  { key: 'recycling-notice', content: recyclingNoticeRaw.trim() },
  { key: 'legal-source', content: LEGAL_SOURCE_BODY.trim() },
]
