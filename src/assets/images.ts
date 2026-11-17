/**
 * 全站图片地址唯一入口。
 * 页面与样张只引用这里的 key，禁止在页面里直接写图片 URL；
 * 新增图片时在这里补一条，页面代码不随图床地址变化。
 */
export const images = {
  sampleRing:
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=gold%20ring%20on%20white%20background%2C%20studio%20product%20photography%2C%20soft%20light&image_size=square',
  sampleBracelet:
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=gold%20bracelet%20on%20white%20background%2C%20studio%20product%20photography&image_size=square',
  sampleBar:
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=gold%20bar%20on%20white%20background%2C%20studio%20product%20photography&image_size=square',
  invoiceSample:
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=paper%20invoice%20receipt%20on%20white%20background%2C%20top%20view%2C%20studio%20photography&image_size=square',
  photoOverallSample:
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=gold%20jewelry%20necklace%20and%20bracelet%20laid%20flat%20on%20white%20background%2C%20top%20view%2C%20soft%20studio%20light&image_size=square',
  photoMarkSample:
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=close%20up%20of%20gold%20jewelry%20hallmark%20stamp%20on%20gold%20ring%2C%20macro%20photography%2C%20white%20background&image_size=square',
  photoDetailSample:
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=close%20up%20of%20gold%20jewelry%20clasp%20and%20chain%20detail%2C%20macro%20photography%2C%20white%20background&image_size=square',
  buyHero: 'images/buy-hero.jpg',
  productBar1g: 'images/product-bar-1g.jpg',
  productBar5g: 'images/product-bar-5g.jpg',
  productBar10g: 'images/product-bar-10g.jpg',
  productCoin: 'images/product-coin.jpg',
  productZodiac: 'images/product-zodiac.jpg',
  productBean: 'images/product-bean.jpg',
  heroEndorse: 'images/hero-endorse.jpg',
} as const
