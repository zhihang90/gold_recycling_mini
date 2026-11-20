/**
 * 全站图片地址唯一入口。
 * 页面与样张只引用这里的 key，禁止在页面里直接写图片 URL；
 * 新增图片时在这里补一条，页面代码不随图床地址变化。
 */
export const images = {
  sampleRing: 'images/sample-ring.jpg',
  sampleBracelet: 'images/sample-bracelet.jpg',
  sampleBar: 'images/sample-bar.jpg',
  invoiceSample: 'images/invoice-sample.jpg',
  photoOverallSample: 'images/photo-overall-sample.jpg',
  photoMarkSample: 'images/photo-mark-sample.jpg',
  photoDetailSample: 'images/photo-detail-sample.jpg',
  buyHero: 'images/buy-hero.jpg',
  productBar1g: 'images/product-bar-1g.jpg',
  productBar5g: 'images/product-bar-5g.jpg',
  productBar10g: 'images/product-bar-10g.jpg',
  productCoin: 'images/product-coin.jpg',
  productZodiac: 'images/product-zodiac.jpg',
  productZodiacDetail: 'images/product-zodiac-detail.jpg',
  productBean: 'images/product-bean.jpg',
  heroEndorse: 'images/hero-endorse.jpg',
  heroBrand: 'images/hero-brand.jpg',
  heroLive: 'images/hero-live.jpg',
  payWechat: 'images/pay-wechat.png',
  payAlipay: 'images/pay-alipay.png',
  payUnionpay: 'images/pay-unionpay.png',
  idCardFront: 'images/id-card-front.svg',
  idCardBack: 'images/id-card-back.svg',
} as const
