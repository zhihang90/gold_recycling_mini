import { Button, DetailPage, LegalDocument, ResultStatus } from '@/components'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { paths } from '@/routes/paths'

/**
 * 合同签署：熔检协议与合法来源承诺，底部取消 / 确认签署。
 * 确认后就地展示成功态，不真实落单、不接电子签服务。
 */
export function ShipContractPage() {
  const navigate = useNavigate()
  const [signed, setSigned] = useState(false)

  if (signed) {
    return (
      <DetailPage title="合同签署">
        <ResultStatus
          status="success"
          title="签署成功"
          description="订单已提交，请按预约时间将实物寄往检测中心；签收后可查看检测进度。"
          primaryAction={
            <Button size="lg" block onClick={() => navigate(paths.home)}>
              返回首页
            </Button>
          }
        />
      </DetailPage>
    )
  }

  return (
    <DetailPage
      title="合同签署"
      footer={
        <div className="grid grid-cols-2 gap-2">
          <Button size="lg" block variant="secondary" onClick={() => navigate(paths.ship.photos)}>
            取消
          </Button>
          <Button size="lg" block onClick={() => setSigned(true)}>
            确认签署
          </Button>
        </div>
      }
    >
      <LegalDocument
        title="熔检服务协议及合法来源承诺"
        preamble="《熔检服务协议》（以下简称「本协议」）由您在订单提交环节签署，签署后即生效。请仔细阅读以下条款，确认无误后完成签署。"
        sections={[
          {
            key: 'definition',
            title: '第一条 相关定义',
            paragraphs: [
              '1.1 「本平台」指本协议项下提供回收服务的平台运营方。',
              '1.2 「熔检」指对回收物品进行破坏性检测，检测后品相不可还原。',
              '1.3 「回收服务」指平台提供的在线估价、邮寄回收、检测报价与结算服务。',
            ],
          },
          {
            key: 'promise',
            title: '第二条 您知悉、陈述、承诺及保证',
            paragraphs: [
              '2.1 您承诺所提交物品来源合法，且为本人有权处分的财产；如因物品来源产生争议，由您承担全部责任。',
              '2.2 您同意平台在签收后对物品进行熔检，熔检后品相不可还原；检测结果以平台出具的检测报告为准。',
            ],
          },
          {
            key: 'authorize',
            title: '第三条 熔检授权',
            paragraphs: [
              '3.1 您授权平台为完成检测对物品进行必要处理，包括但不限于称重、拍照、熔炼与纯度检测。',
              '3.2 检测完成后，平台将按最终报价与您确认；如您不接受报价，可选择退回物品，往返运费按规则承担。',
            ],
          },
        ]}
        footer="请完整阅读协议条款，确认无误后完成签署。"
      />
    </DetailPage>
  )
}
