export interface ShippingAddress {
  id: string
  name: string
  /** 完整手机号，展示时用 maskPhone 脱敏 */
  phone: string
  /** 省市区，如「广东省 深圳市 盐田区」 */
  region: string
  /** 详细地址（街道 / 小区 / 楼栋），如「深盐路2088号太平洋工业区3栋」 */
  place: string
  /** 门牌号，可为空 */
  doorNo: string
  /** 公司 / 单位名称，选填 */
  company?: string
  /** 默认地址标记，由 setDefaultAddress 维护 */
  tag?: string
}

export interface AddressLocation {
  key: string
  label: string
  detail: string
}

/** 首期默认寄件地址；真实地址待业务确认后替换 */
export const DEFAULT_ADDRESSES: ShippingAddress[] = [
  {
    id: 'home',
    name: '陈智航',
    phone: '17688825090',
    region: '广东省 深圳市 盐田区',
    place: '深盐路2088号太平洋工业区3栋',
    doorNo: '601',
    tag: '默认',
  },
  {
    id: 'office',
    name: '德尊家纺',
    phone: '13456299596',
    region: '浙江省 嘉兴市 桐乡市',
    place: '洲泉镇马鸣村金家浜8号(德尊家纺)',
    doorNo: '',
  },
  {
    id: 'studio',
    name: '曾婷',
    phone: '18455953186',
    region: '广东省 梅州市 五华县',
    place: '水寨镇水寨大道奥园广场5幢商业楼131商铺',
    doorNo: '',
    company: '广东法迈（梅州）律师事务所',
  },
]

/** 省市区候选；真实数据应来自地址库接口 */
export const REGION_OPTIONS: { value: string; label: string }[] = [
  { value: '广东省 深圳市 盐田区', label: '广东省 深圳市 盐田区' },
  { value: '广东省 深圳市 福田区', label: '广东省 深圳市 福田区' },
  { value: '广东省 深圳市 南山区', label: '广东省 深圳市 南山区' },
  { value: '浙江省 嘉兴市 桐乡市', label: '浙江省 嘉兴市 桐乡市' },
  { value: '广东省 梅州市 五华县', label: '广东省 梅州市 五华县' },
]

/** 模拟选址候选；接地图服务后换成 POI 搜索结果 */
export const LOCATION_OPTIONS: AddressLocation[] = [
  {
    key: 'taiping',
    label: '太平洋工业区',
    detail: '广东省 深圳市 盐田区 深盐路2088号',
  },
  {
    key: 'caitian',
    label: '彩田工业园',
    detail: '广东省 深圳市 福田区 彩田路7006号',
  },
  {
    key: 'tairan',
    label: '泰然工业区',
    detail: '广东省 深圳市 福田区 泰然九路21号',
  },
]

const ADDRESS_KEY = 'gold-recycling.addresses'
const SELECTED_KEY = 'gold-recycling.selected-address'

function readStorage<T>(key: string): T | null {
  try {
    const raw = window.sessionStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function writeStorage(key: string, value: unknown) {
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value))
  } catch {
    // 隐私模式下 storage 可能不可用，原型降级为内存态即可
  }
}

export function readAddresses(): ShippingAddress[] {
  const stored = readStorage<ShippingAddress[]>(ADDRESS_KEY)
  return Array.isArray(stored) ? stored : DEFAULT_ADDRESSES
}

export function writeAddresses(addresses: ShippingAddress[]) {
  writeStorage(ADDRESS_KEY, addresses)
}

export function readSelectedAddressId(): string {
  return readStorage<string>(SELECTED_KEY) ?? DEFAULT_ADDRESSES[0].id
}

export function selectAddress(id: string) {
  writeStorage(SELECTED_KEY, id)
}

/** 勾选默认寄件地址：同时调整默认标记，保证列表与寄件页一致 */
export function setDefaultAddress(id: string) {
  writeAddresses(
    readAddresses().map((address) => ({
      ...address,
      tag: address.id === id ? '默认' : undefined,
    })),
  )
  selectAddress(id)
}

export function readSelectedAddress(): ShippingAddress {
  const addresses = readAddresses()
  const selectedId = readSelectedAddressId()
  return addresses.find((address) => address.id === selectedId) ?? addresses[0] ?? DEFAULT_ADDRESSES[0]
}

export function maskPhone(phone: string) {
  if (phone.length < 7) return phone
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`
}
