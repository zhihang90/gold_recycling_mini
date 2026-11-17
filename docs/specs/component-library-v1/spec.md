# 组件库补齐方案 v1（借鉴小超老板端）

> 状态：待评审 ｜ 日期：2026-11-15 ｜ 范围：仅组件与组件库验收页，不做业务页面

## 结论摘要

- 小超老板端共有 **62 个组件文件**，其中可视化组件 **59 个**（含 9 个 `ui/` 基础件），另有 3 个非可视支撑文件（门店上下文、权限守卫、图标映射）。
- 本项目现有 **19 个通用组件**，覆盖容器、导航、展示原子与弹层，缺 **表单输入、选择确认、上传、订单状态表达、倒计时、结果页、加载态**。
- 按业务功能清单推导，本期补 **14 个必须组件**，预留 **6 个**，明确不做 **7 类**（零售、门店餐饮、营销、扫码、Toast 等）。
- 所有新组件只引用现有 token（`tokens.css` 的 9 个字阶 role、6 档间距、4 级圆角、语义色），不引入第三方 UI 库，不带业务文案与业务数据。

---

## 一、小超老板端组件盘点

### 1.1 数量与分类

| 分类 | 数量 | 说明 |
| --- | ---: | --- |
| 页面骨架与容器 | 8 | 页面壳、页头、卡片、吸底栏、弹层与遮罩 |
| 反馈与确认 | 11 | 确认框、操作菜单、弹层底部按钮、业务专用弹窗 |
| 导航与筛选 | 5 | 底部 Tab、演示左栏、分段控件、气泡、搜索 |
| 展示原子 | 11 | 徽章、金额/价格、键值行、空状态、统计卡、骨架、结果、评分、图标、图片 |
| 表单与选择 | 9 | 按钮、列表项、开关、步进器、滚轮、日期/门店选择、会员条 |
| 业务卡片 | 11 | 商品/订单/购物车/地址/支付/券/倒计时/轮播/头像 |
| 领域场景 | 4 | 消费明细、台位徽标、SKU 选择、扫码 |
| **合计** | **59** | 另 3 个非可视文件未计入 |

### 1.2 全量清单

**页面骨架与容器（8）**

| 组件 | 职责 | 变体 / 尺寸 | 典型场景 |
| --- | --- | --- | --- |
| PageShell | 页面外层、安全区与滚动 | `safeAreaTop`、`stickyHeader` | 所有页面 |
| PageHeader | 顶部导航、返回、右操作 | 标题左/居中、`sticky` | 二级页 |
| Layout | 演示外壳（左栏 + 设备框） | `showTab` | 原型外壳 |
| Card | 卡片容器 | 描边 4 档、内边距 4 档 | 首页区块、订单卡 |
| BottomActionBar | 吸底操作栏 | 固定/粘性 | 结算、提交 |
| AppSheet | 底部弹层 | sheet / full、圆角 2 档 | 调价、选择 |
| SecondaryOverlay | 二级遮罩 | 层级、可关闭 | 叠层弹窗 |
| ui/sheet | 弹层原语 | 上/右/下/左 | 基础弹层 |

**反馈与确认（11）**

| 组件 | 职责 | 变体 / 尺寸 | 典型场景 |
| --- | --- | --- | --- |
| AppConfirmDialog | 居中二次确认 | 普通/危险/警告、图标、loading | 删除、取消 |
| ui/dialog | 对话框原语 | 关闭按钮开关 | 基础弹窗 |
| ActionMenuSheet | 操作菜单弹层 | 图标项、危险项 | 订单更多 |
| SheetFooterActions | 弹层底部双按钮 | primary/warning/destructive | 筛选、调价 |
| CancelOrderDialog | 取消订单弹窗 | 原因选择 | 订单列表 |
| FreeOrderDialog | 免单确认 | — | 餐饮订单 |
| RestoreToTableDialog | 回台确认 | 台位选择 | 餐饮台位 |
| RemarkEditDialog | 备注编辑 | 订单目标 | 收银备注 |
| AdjustPriceSheet | 调价弹层 | 折扣/固定价、分类 | 收银调价 |
| OrderMorePopover | 行内更多操作 | 弹出方向 | 订单行 |
| ui/sonner | Toast | success/error | 全局提示 |

**导航与筛选（5）**

| 组件 | 职责 | 变体 / 尺寸 | 典型场景 |
| --- | --- | --- | --- |
| BottomTabNav | 底部 Tab | 固定项 | 一级页 |
| PrototypeNav | 桌面演示左栏 | 分组折叠 | 评审导航 |
| ui/segmented-tabs | 分段控件 | sm/md/lg、滑动指示 | 订单筛选、时间范围 |
| ui/popover | 气泡 | 对齐方向 | 行内更多 |
| commerce/SearchBar | 搜索框 | 输入/只读 | 商品、订单搜索 |

**展示原子（11）**

| 组件 | 职责 | 变体 / 尺寸 | 典型场景 |
| --- | --- | --- | --- |
| Badge | 标签 | 7 色 × 3 尺寸、外环 | 状态、品类 |
| AmountText | 金额 | md/lg/xl、default/success/inverse | 收银合计 |
| commerce/PriceText | 价格 | sm/md/lg、成交/普通、划线价 | 商品卡、订单 |
| KeyValueRow | 键值行 | inline/table、末行 | 明细 |
| EmptyState | 空状态 | 紧凑 | 列表空 |
| StatCard | 统计卡 | 标签/数值 | 经营看板 |
| commerce/Skeleton | 骨架屏 | text/rect/circle | 加载 |
| commerce/Result | 结果页 | 成功/失败/警告/信息 | 支付结果 |
| commerce/Rate | 评分 | sm/md、可交互 | 评价 |
| OrderTypeIcon | 订单类型图标 | 台费/商品/服务/储值 | 账单 |
| ui/image | 响应式图片 | 格式、断点 | 图片资源 |

**表单与选择（9）**

| 组件 | 职责 | 变体 / 尺寸 | 典型场景 |
| --- | --- | --- | --- |
| ui/button | 按钮 | 多 variant、尺寸 | 全局 |
| ui/list-row | 列表项 | normal/large、描述/箭头/分隔 | 设置、明细 |
| ui/switch | 开关 | 选中/禁用 | 设置 |
| commerce/Stepper | 数量步进 | sm/md | 购物车 |
| WheelColumn | 滚轮列 | 数值/日期 | 调价、日期 |
| DateRangePickerSheet | 日期范围选择 | 快捷项、带时间 | 报表筛选 |
| ClubSelectSheet | 门店选择 | 单选/多选 | 门店切换 |
| ClubSwitcher | 门店切换器 | single/multi | 顶部栏 |
| MemberBar | 会员条 | dual/common | 会员收银 |

**业务卡片（11）**

| 组件 | 职责 | 变体 / 尺寸 | 典型场景 |
| --- | --- | --- | --- |
| CouponCard | 券卡片 | 选中/禁用 | 券包 |
| CouponPicker | 券选择器 | 展开/收起 | 结算 |
| GoodsCard | 商品网格卡 | 图/价/标签 | 商城 |
| GoodsListItem | 商品列表项 | 紧凑 | 商城列表 |
| OrderCard | 订单卡 | 5 状态、动作 | 订单列表 |
| CartItem | 购物车项 | 数量/删除 | 购物车 |
| AddressCard | 地址卡 | 默认/选中 | 收货地址 |
| PayChannel | 支付渠道 | 选中/禁用 | 收银 |
| CountdownBar | 倒计时条 | 前缀/结束回调 | 锁价 |
| Banner | 轮播横幅 | 比例、自动播放 | 首页 |
| CartoonAvatar | 卡通头像 | 序号/游客 | 会员头像 |

**领域场景（4）**

| 组件 | 职责 | 变体 / 尺寸 | 典型场景 |
| --- | --- | --- | --- |
| ConsumptionDetail | 消费明细 | 可编辑归属、勾选 | 账单 |
| TableModeBadge | 台位模式徽标 | 模式、标题 | 台位 |
| SkuPicker | SKU 选择 | 规格组、库存 | 商品 |
| QrScannerSheet | 扫码弹层 | 成功/失败模拟 | 扫码点单 |

### 1.3 可借鉴的结论

1. **表单与确认链路完整**：输入、列表项、滚轮、选择弹层、确认框、底部双按钮形成闭环，本项目最缺这一层。
2. **状态表达分层**：`OrderCard`（列表）＋ `Result`（结果）＋ `CountdownBar`（时效）＋ `Badge`（状态）四件套，回收订单同样需要。
3. **业务卡片强绑定场景**：商品、购物车、券、会员、门店属于对方业务，不可迁移。
4. **尺寸与字阶不可照搬**：对方使用 `text-[10px]`、`text-[11px]`、`p-3.5` 等裸值，与本项目 token 冲突，只借结构不借取值。

---

## 二、本项目补齐清单

### 2.1 必须（P0，本期实现）

| # | 组件 | 文件 | 对应功能清单 |
| --- | --- | --- | --- |
| 1 | Button | `src/components/Button.tsx` | U-15、U-18、U-19、F-01（主 CTA） |
| 2 | PriceText | `src/components/PriceText.tsx` | U-14、U-15、U-18（金价/预估/终价/克重） |
| 3 | ListItem | `src/components/ListItem.tsx` | U-20、U-21、U-22、U-23、U-29 |
| 4 | FormField | `src/components/FormField.tsx` | U-06、U-08、U-10、U-17、U-20 |
| 5 | PickerSheet | `src/components/PickerSheet.tsx` | U-04、U-07、U-24、U-19（换卡） |
| 6 | AgreementCheck | `src/components/AgreementCheck.tsx` | U-03、U-24、U-25 |
| 7 | PhotoUploader | `src/components/PhotoUploader.tsx` | U-08 |
| 8 | OrderCard | `src/components/OrderCard.tsx` | U-11 |
| 9 | StatusSteps | `src/components/StatusSteps.tsx` | U-11、U-12、3.7.7 |
| 10 | StatusTimeline | `src/components/StatusTimeline.tsx` | U-12、U-27（物流与记录） |
| 11 | CountdownBar | `src/components/CountdownBar.tsx` | U-18、A-21（72h 终价窗口） |
| 12 | ConfirmDialog | `src/components/ConfirmDialog.tsx` | U-13、U-18（取消/拒绝/换卡确认） |
| 13 | ResultStatus | `src/components/ResultStatus.tsx` | U-19、U-26（提交/签署/支付结果） |
| 14 | Skeleton | `src/components/Skeleton.tsx` | F-03（加载态） |

### 2.2 预留（P1/P2，本期不实现）

| 组件 | 触发条件 | 当前替代方案 |
| --- | --- | --- |
| Accordion | U-29 规则中心独立成页 | 用 `ListItem` + 页面内展开 |
| ActionSheet | 订单详情操作超过 3 个 | `BottomSheet` + `ListItem` 组合 |
| StepIndicator | 下单页明确要求展示 6 步进度 | `PageHeader` 副标题「第 N/6 步」 |
| AddressCard | 寄件/退回地址需要独立展示与切换 | `ListItem` + `FormField` |
| CopyText | 订单号/运单号需要一键复制 | 文案直接展示 |
| ImageViewer | 需要全屏查看检测影像 | `Gallery` |

### 2.3 不做（明确排除）

| 类别 | 组件 | 排除理由 |
| --- | --- | --- |
| 零售交易 | GoodsCard、GoodsListItem、CartItem、SkuPicker、PayChannel | AGENTS 禁止加购/购物车/SKU/锁价等零售概念；回收是单向收购 |
| 营销会员 | CouponCard、CouponPicker、Rate、MemberBar、CartoonAvatar、Banner | 首期不做会员、社区、评价、拉新（L-04） |
| 门店餐饮 | ClubSwitcher、ClubSelectSheet、TableModeBadge、ConsumptionDetail、RestoreToTableDialog、FreeOrderDialog、OrderMorePopover | 首期仅邮寄，无到店/上门/门店（L-01） |
| 日期与滚轮 | DateRangePickerSheet、WheelColumn | 用户端无报表筛选；重量用输入框 + 校验，不用滚轮 |
| 开关 | ui/switch | 首期无设置项；授权用勾选确认（U-03 要求显式勾选） |
| 扫码 | QrScannerSheet | 首期寄件为快递单号/物流下单，无扫码环节 |
| 提示 | Toast（sonner） | AGENTS 与规范 §7.13 明确禁止新增 toast |

---

## 三、组件明细

> 统一约定：间距只用 4/8/12/16/24/32；圆角只用 `rounded-xs/sm/md/lg/pill`；字号只用 `text-display/title/section/card-title/body/body-strong/label/caption/caption-strong`；金额与倒计时加 `tabular`；可点区域 ≥44×44；支持 `className` 透传；组件内不写业务文案、不造数据。

### 3.1 Button — `src/components/Button.tsx`

- 职责：全站唯一按钮原语，统一主/次/文字行动与禁用态；不内置 loading、toast、导航。
- 变体：`variant: primary | secondary | tertiary | text`；`size: lg | md | sm`；`block?: boolean`。
- 尺寸与字号：
  - lg `h-12 px-5`；md `h-11 px-4`；sm `h-9 px-3`，用 `after:-inset-y-1` 补足 44 点击区。
  - 文案 `text-body-strong`；sm 用 `text-label`。
  - 圆角 `rounded-md`（非胶囊），禁用 `bg-muted text-ink-400`。
  - primary `bg-primary text-white`；secondary `bg-card text-red-600 ring-1 ring-red-500`；tertiary `text-ink-500`；text `text-red-600`。
- 场景：估价页「立即估价」、终价确认三选一、待打款「更换银行卡」、结果页返回。
- 边界：一条吸底栏只放 1 个 primary；深色卡内不用红底（规范 §7.1）。

### 3.2 PriceText — `src/components/PriceText.tsx`

- 职责：金额/金价/克重排版，拆符号、整数、小数，保证纵向对齐与小数 12 号。
- 变体：`size: display | title | section | card-title | body`；`tone: ink | price | gold | muted`；`prefix`（默认 `¥`）、`suffix`（如 `/克`、`克`）、`decimals`（默认 2）。
- 尺寸与字号：整数位对应 role；小数 `text-caption`；符号按 size 降 1–2 档；整体 `tabular`。
  - `tone=price` 用 `text-red-700`（仅限白卡/浅底）；`ink` 用 `text-ink-900`（财务金额）；`gold` 用 `text-gold-700`（金价/克重）。
- 场景：首页今日金价、估价结果、订单金额、终价应付、克重展示。
- 边界：不在米白/浅金底上放 `tone=price`；不用于按钮内价格。

### 3.3 ListItem — `src/components/ListItem.tsx`

- 职责：单/双行列表项，承载个人中心入口、消息、规则条目、寄件信息摘要。
- 变体：`size: md | lg`；`icon?: LucideIcon`；`right?: ReactNode`；`showArrow`；`divider`；`onClick`。
- 尺寸与字号：md `min-h-14`（56）、lg `min-h-18`（72）；左右 `px-4 py-3`；图标 20 `text-ink-700`；标题 `text-card-title`，说明 `text-body text-muted-foreground`；箭头 16 `text-ink-400`；分隔 `border-line-soft`。
- 场景：我的（实名、银行卡、消息、客服、设置）、规则中心目录、订单详情「寄件信息」。
- 边界：可点项用原生 `button`；不可点项用 `div`；不在行内放第二个主行动。

### 3.4 FormField — `src/components/FormField.tsx`

- 职责：带标签的输入字段，覆盖重量、数量、姓名、手机号、身份证、银行卡、地址、备注。
- 变体：`multiline`；`type: text | tel | number`；`inputMode`；`unit`；`hint`；`error`；`required`；`readOnly`；`maxLength`。
- 尺寸与字号：输入 `h-11 rounded-sm px-3 text-body ring-1 ring-border`，聚焦 `ring-red-500`；多行 `min-h-24 py-3`；标签 `text-label`；必填星号 `text-red-600`；错误 `text-caption text-destructive`；提示同字号 `text-subtle-foreground`；单位 `text-body text-subtle-foreground`。
- 场景：物品重量/纯度数量、寄件人信息、实名与银行卡、备注。
- 边界：label 必须可见，不用 placeholder 代替 label；`useId` 关联 `htmlFor` 与 `aria-describedby`。

### 3.5 PickerSheet — `src/components/PickerSheet.tsx`

- 职责：底部单选选择器，确认制（选中只高亮，点「确定」才提交）。
- 变体：选项可带说明/禁用；`confirmText`；`footnote`。
- 尺寸与字号：复用 `BottomSheet`；选项 `min-h-11 px-3 rounded-md`；选中 `bg-red-50 text-red-700 ring-1 ring-red-200`；选项标题 `text-body-strong`、说明 `text-caption`；底部 `Button primary block`。
- 场景：品类（足金首饰/投资金条金币）、纯度、合法来源、拒收原因、支付换卡。
- 边界：不承载多选（多选用页面内 `AgreementCheck`）；关闭不提交草稿。

### 3.6 AgreementCheck — `src/components/AgreementCheck.tsx`

- 职责：协议、隐私政策、来源声明、破检授权、强制保价的显式勾选确认。
- 变体：`checked` 受控；`error`；`disabled`；`children` 可含协议链接。
- 尺寸与字号：整行 `min-h-11`，勾选框 20×20 `rounded-xs`，选中 `bg-primary` + 白色 Check 12；文案 `text-body text-ink-700`；错误 `text-caption text-destructive`。
- 场景：下单前协议与破检授权（U-25）、来源声明（U-24）、登录协议（U-03）。
- 边界：**永不默认勾选**；整行可点；不弹 toast 提示未勾选，错误文案留在行下。

### 3.7 PhotoUploader — `src/components/PhotoUploader.tsx`

- 职责：本地选择并预览物品照片，支持删除与数量上限；不接真实上传接口。
- 变体：`max`（默认 6）；`hint`；`readOnly`。
- 尺寸与字号：4 列 `grid gap-2`，缩略图 `aspect-square rounded-sm ring-1 ring-border`；添加位虚线描边 `Plus 20` + `text-caption`；删除按钮视觉 24、点击区 44；计数 `text-caption text-subtle-foreground tabular`。
- 场景：下单物品照片（U-08）、检测差异佐证（U-27）。
- 边界：只读本地文件 `FileReader`，不发起网络请求；不用裸 `<img>` 撑高度（固定 `aspect-square`）。

### 3.8 OrderCard — `src/components/OrderCard.tsx`

- 职责：订单列表卡片，统一「单号 + 状态 + 物品摘要 + 金额 + 下一步」。
- 变体：`statusTone`（复用 `BadgeTone`）；`actions`；`onClick`。
- 尺寸与字号：`Card p-4`；单号 `text-caption text-subtle-foreground tabular`；状态 `Badge`；物品名 `text-card-title`；克重/纯度 `text-body text-muted-foreground`；金额 `PriceText size=card-title tone=ink`；动作区 `Button secondary size=sm`。
- 场景：回收单列表（U-11）7 个 Tab；首页「进行中的回收单」。
- 边界：状态文案由页面传入，组件不做 9 状态映射；不展示预估价与实际成交价的混用。

### 3.9 StatusSteps — `src/components/StatusSteps.tsx`

- 职责：订单主链进度（待寄出 → 待签收 → 检测中 → 待确认 → 待打款 → 已完成）。
- 变体：`steps`、`currentIndex`；终态（已取消/已关闭）由页面改用提示层，不进步骤条。
- 尺寸与字号：横向可滚动；节点 8px 圆点，已完成 `bg-red-500`、当前 `bg-red-500 ring-4 ring-red-50`、未达 `bg-line`；连接线 `h-0.5 bg-line`；文案 `text-caption`，当前 `text-body-strong text-red-700`。
- 场景：订单详情顶部（U-12）、订单列表卡片展开态（推断）。
- 边界：复检中映射回「待确认」并叠加文案，不新增第 7 步。

### 3.10 StatusTimeline — `src/components/StatusTimeline.tsx`

- 职责：纵向事件时间轴，承载物流轨迹、检测记录、支付尝试、退回/复检记录。
- 变体：`items`（`state: done | current | pending`，可带 `time`、`description`）。
- 尺寸与字号：节点 8px；标题 `text-body-strong`；说明 `text-body text-muted-foreground`；时间 `text-caption text-subtle-foreground tabular`；连接线 `bg-line-soft`。
- 场景：订单详情物流轨迹（U-12）、检测与差异记录（U-27）、支付异常尝试记录（U-19）。
- 边界：只做记录展示，不做状态迁移；异常用 `InlineNotice` 置于轨迹上方。

### 3.11 CountdownBar — `src/components/CountdownBar.tsx`

- 职责：终价确认 72h 窗口与签署/支付时效提示，倒计时到点触发一次回调。
- 变体：`tone: warning | danger`；`prefix`；`onEnd`；`deadline`（时间戳）。
- 尺寸与字号：`rounded-lg px-3 py-3 ring-1`；文字 `text-body-strong tabular`；图标 16；warning `bg-warning/8 text-warning`，danger `bg-destructive/8 text-destructive`；格式「剩余 2 天 23:59:59」。
- 场景：待确认终价（U-18）、待打款支付时效（U-19）、电子签时效（U-26）。
- 边界：`role="timer"`、`aria-live="off"` 避免每秒播报；组件卸载清理定时器；不自动改订单状态。

### 3.12 ConfirmDialog — `src/components/ConfirmDialog.tsx`

- 职责：居中阻断式确认，用于不可逆操作与关键决策。
- 变体：`tone: default | danger`；`confirmText`、`cancelText`；`description`。
- 尺寸与字号：面板 `w-[calc(100%-48px)] max-w-[320px] rounded-lg bg-card p-4 shadow-lg`；标题 `text-card-title`；说明 `text-body text-muted-foreground`；按钮区 `mt-4 flex gap-2`，取消 `secondary`、确认 `primary`（danger 用 `bg-destructive`）。
- 场景：待寄出取消订单（U-13，唯一自助取消点）、拒绝终价并退回（U-18）、更换银行卡（U-19）。
- 边界：渲染到 `[data-phone-frame]`；Esc/遮罩/返回键关闭；焦点移入并归还；锁背景滚动；确认后由页面负责后续状态，不内置 toast。

### 3.13 ResultStatus — `src/components/ResultStatus.tsx`

- 职责：流程结果页（提交成功、签署成功、支付成功/失败、退回完成）。
- 变体：`status: success | error | warning | info`；`primaryAction`、`secondaryAction`。
- 尺寸与字号：图标圆 64（`bg-{tone}/10`）+ 图标 32；标题 `text-title`；说明 `text-body text-muted-foreground`；操作纵向 `gap-2`，主按钮 `block`。
- 场景：下单提交成功、电子签完成（U-26）、付款成功/失败（U-19）、退回完成（U-28）。
- 边界：`role="status"`；不自动跳转；失败态必须给下一步动作。

### 3.14 Skeleton — `src/components/Skeleton.tsx`

- 职责：列表与卡片加载占位，替代整页转圈。
- 变体：`variant: text | rect | circle`；`lines`（text 专用）。
- 尺寸与字号：text `h-4 rounded-xs`、rect `rounded-sm`、circle `rounded-full`；底色 `bg-line-soft`；`.skeleton` 动画 1.2s 在 `line-soft ↔ line` 间循环（`index.css` 新增工具类，遵守规范 §7.11）。
- 场景：订单列表首屏（F-03）、订单详情加载、图片占位。
- 边界：`aria-hidden`；减少动态偏好下由全局 `prefers-reduced-motion` 降级。

---

## 四、与现有 19 个组件的关系

| 现有组件 | 关系 |
| --- | --- |
| Card / PageShell / PageHeader / Layout / BottomActionBar | 新组件全部复用，不复制容器样式 |
| BottomSheet | `PickerSheet` 基于它实现；不再写第二个弹层壳 |
| Badge | `OrderCard` 复用它表达状态，不新增状态标签 |
| KeyValueRow + PriceText | 共同承担估价公式、终价明细、结算单，因此不新增 `PriceBreakdown` |
| InlineNotice | 承担「状态内提示层」（物流异常、信息不符、支付失败），不新增 `Alert` |
| EmptyState | 承担空态；`ResultStatus` 只承担流程结果，二者不合并 |
| SegmentedTabs / SearchBar | 订单列表筛选与单号搜索直接复用 |
| Stepper | 物品件数复用；不用于重量（重量用 FormField） |
| Gallery / MediaVisual | 照片与检测影像查看复用；上传位只做缩略图 |

---

## 五、页面场景映射

| 页面（功能编号） | 新增组件 |
| --- | --- |
| 首页（F-01） | PriceText、Button |
| 登录与协议（U-01、U-03） | AgreementCheck、Button |
| 实名与银行卡（U-02、U-17） | FormField、PickerSheet、ConfirmDialog |
| 在线估价（U-14～U-16） | PriceText、FormField、Button |
| 下单：品类与物品（U-04～U-08） | PickerSheet、FormField、PhotoUploader、Stepper |
| 下单：来源与协议（U-24～U-26） | AgreementCheck、ConfirmDialog、ResultStatus |
| 寄件信息（U-09、U-10） | FormField、ListItem、AgreementCheck |
| 回收单列表（U-11） | OrderCard、SegmentedTabs、SearchBar、Skeleton、EmptyState |
| 订单详情（U-12） | StatusSteps、StatusTimeline、KeyValueRow、PriceText、InlineNotice |
| 检测与差异（U-27） | StatusTimeline、PhotoUploader、InlineNotice |
| 终价确认（U-18） | CountdownBar、PriceText、KeyValueRow、ConfirmDialog、Button |
| 支付与到账（U-19） | ResultStatus、InlineNotice、PickerSheet、Button |
| 退回与复检（U-28） | StatusTimeline、ConfirmDialog、ResultStatus |
| 我的与记录（U-20～U-23） | ListItem、StatCard、EmptyState |
| 规则中心（U-29，预留） | ListItem（Accordion 预留） |

---

## 六、约束与验收

1. 不新增依赖，不改 `package.json`；不引入 Radix/sonner 等库。
2. 新增文件中禁止：裸 hex、`text-[Npx]`、`font-medium/semibold/bold`、`p-3.5/p-2.5`、`h-[100dvh]`。
3. 每个新组件在 `src/pages/StyleGuide.tsx` 有样张；样张使用通用示例文案，不构造订单/金额业务数据。
4. 375 宽无横向溢出；≥900px 设备框内正常；键盘焦点可见；`prefers-reduced-motion` 生效。
5. 自检命令：`npm run typecheck`、`npm run lint`、`npm run build` 全绿；`dist/assets/*.css` 中 `@layer` 为 0。

---

## 七、推断与待确认

| 项 | 说明 |
| --- | --- |
| 订单列表展开态使用 StatusSteps | 推断；功能清单只要求列表显示状态，不要求步骤条 |
| 换卡用 PickerSheet | 推断；U-19 只写「支持换卡」，未定交互形态 |
| 复检中归入待确认 Tab | 文档 3.7.7 已定，组件不处理分组 |
| 小超老板端组件计数 | 以文件数为准；`ui/` 原语与业务组件一并统计，未按代码行去重 |
| 上传交互 | 推断为本地预览；真实上传需后端接口，原型阶段不接 |
