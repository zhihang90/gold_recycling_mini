import { AssayResultCard, BottomSheet, Button, CompareRows, Gallery, PrerequisiteList } from '@/components'
import type { PrerequisiteState } from '@/components'
import { useState } from 'react'

import { isSignificantDiff } from '@/lib/diff'
import { ASSAY_IMAGES } from './data'
import { GuideFooter, GuidePage, Section } from './shared'

/** 黄金回收 · 检测与合规域 */
export function AssayGuidePage() {
  const [proofState, setProofState] = useState<PrerequisiteState>('pending')
  const [assayPreviewOpen, setAssayPreviewOpen] = useState(false)

  return (
    <GuidePage title="检测与合规">
      <Section title="差异对照 CompareRows">
        <CompareRows
          firstColumnLabel="项目"
          columns={[
            { key: 'estimate', label: '预估' },
            { key: 'actual', label: '实测' },
            { key: 'melt', label: '熔后复检' },
          ]}
          rows={[
            { label: '品类', values: ['足金', '足金', '足金'] },
            { label: '件数', values: [2, 2, 2] },
            {
              label: '毛重（克）',
              values: ['12.68', '12.42', '12.39'],
              delta: '较预估 −0.26 克',
              highlight: isSignificantDiff(12.68, 12.39),
            },
            {
              label: '含金量（%）',
              values: ['99.90', '94.20', '94.20'],
              delta: '较预估 −5.70 个百分点',
              highlight: isSignificantDiff(99.9, 94.2),
            },
            { label: '服务费（元）', values: ['—', null, undefined] },
          ]}
        />
        <CompareRows
          firstColumnLabel="项目"
          columns={[
            { key: 'estimate', label: '预估' },
            { key: 'actual', label: '实测' },
          ]}
          rows={[
            { label: '件数', values: [3, 2], delta: '较预估 −1 件', highlight: true },
            { label: '纯度', values: ['足金 999', '足金 990'] },
          ]}
        />
        <div className="text-caption text-subtle-foreground">
          highlight 由页面用 isSignificantDiff 计算（默认阈值 5%，可配置假设值，待产品最终确认）。
        </div>
      </Section>

      <Section title="检测结果 AssayResultCard">
        <AssayResultCard
          title="检测结果"
          result={{ tone: 'success', label: '与预估一致' }}
          org="示例检测中心"
          method="光谱无损检测（XRF）"
          inspectedAt="11-16 14:20"
          assayNo="AS-0000-0001"
          weight={12.68}
          fineness={99.9}
          meltWeight={12.66}
          labels={{ org: '检测机构' }}
          footer={
            <div className="text-caption text-subtle-foreground">
              检测影像与操作记录可查，不提供原图下载。
            </div>
          }
        />
        <AssayResultCard
          title="检测结果"
          result={{ tone: 'warning', label: '与预估有差异' }}
          org="示例检测中心"
          method="破坏性熔检"
          inspectedAt="11-16 15:05"
          assayNo="AS-0000-0002"
          weight={12.42}
          fineness={94.2}
          meltWeight={12.39}
          images={ASSAY_IMAGES}
          onViewImages={() => setAssayPreviewOpen(true)}
          imagesLabel="查看检测留痕"
          breaking
          breakingNote="已按授权完成破坏性检测，物品形态不可还原；如对结论有异议，可在确认窗口内申请复检一次。"
          recheck={{
            org: '示例复检中心',
            at: '11-16 17:40',
            conclusion: '复检结论为最终结论',
            delta: '复检与初检一致，不重复复检。',
          }}
        />
      </Section>

      <Section title="前置条件 PrerequisiteList">
        <PrerequisiteList
          items={[
            {
              key: 'kyc',
              title: '实名认证',
              description: '身份证、手机号与本人一致',
              state: 'done',
              statusText: '已完成',
            },
            {
              key: 'bank',
              title: '收款银行卡',
              description: '需为本人账户，尾号 0000',
              state: 'done',
              statusText: '已绑定',
            },
            {
              key: 'agreement',
              title: '服务协议与破检授权',
              description: '含不可还原提示与来源声明',
              state: 'done',
              statusText: '已签署',
            },
            {
              key: 'esign',
              title: '电子签',
              description: '签署完成后不可修改',
              state: 'pending',
              actionLabel: '去签署',
              onAction: () => setProofState('pending'),
            },
            {
              key: 'proof',
              title: '购买凭证',
              description:
                proofState === 'exempt'
                  ? '已用情况说明替代购买凭证，可继续提交'
                  : '发票或购买小票；没有时可签情况说明替代',
              state: proofState,
              statusText:
                proofState === 'done'
                  ? '已上传'
                  : proofState === 'exempt'
                    ? '已签情况说明'
                    : undefined,
              actionLabel: '去补充',
              onAction: () => setProofState('done'),
            },
          ]}
          hint="购买凭证为可豁免项：签情况说明后仍可提交，不阻断主流程。"
        />
        <div className="flex items-center justify-between gap-3">
          <span className="text-caption text-subtle-foreground">演示：切换购买凭证状态</span>
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              setProofState((state) =>
                state === 'pending' ? 'exempt' : state === 'exempt' ? 'done' : 'pending',
              )
            }
          >
            切换
          </Button>
        </div>
      </Section>

      <GuideFooter>破坏性提示不可隐藏，由组件类型强制传 breakingNote</GuideFooter>

      <BottomSheet open={assayPreviewOpen} onClose={() => setAssayPreviewOpen(false)} title="检测留痕">
        <Gallery
          images={ASSAY_IMAGES.map((src) => ({ src, alt: '示例图片' }))}
          className="overflow-hidden rounded-md"
        />
        <div className="mt-3 text-caption text-subtle-foreground">
          示例：影像仅用于核对结论与留痕，不提供原图下载。
        </div>
      </BottomSheet>
    </GuidePage>
  )
}
