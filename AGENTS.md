# AGENTS.md

`gold_recycling_mini` 的协作规则。只保留长期约束；命令与目录见 `README.md`。

## 1. 项目边界

- 业务：黄金回收（在线估价 → 预约/邮寄 → 检测 → 报价确认 → 结算）。
- 只做 H5 演示原型：不接真实接口、支付与实名，不落真实订单；登录页仅作界面演示。

## 2. 兼容基线

微信内置浏览器（iOS / Android）与 PC 浏览器（≥900px）共用一套布局，设计基准 375。

| 项 | 约定 |
| --- | --- |
| 构建目标 | `es2019 / safari13 / chrome79`，不抬高 |
| `@layer` | 保留 `postcss.config.mjs` 的 cascade-layers 插件 |
| 视口高度 | 只用 `.app-h` / `.app-min-h`，不写 `100vh` / `100dvh` |
| 路由 | 只用 `HashRouter` |
| 服务端 | 不引入 SSR、Service Worker、后端接口 |
| 缓存 | 保留 `index.html` 的 no-cache meta 与 build-stamp |

## 3. 设计与组件复用

- 颜色、字号、圆角、阴影、动效只取 `src/theme/tokens.css`；禁止裸 hex 与任意值（如 `text-[15px]`、`bg-[#fff]`）。
- 业务页与组件只用语义色：`primary / primary-active / primary-soft / primary-border / primary-foreground / destructive / price`；色阶只用于色板样张。
- 字号只用 `text-*` role，不写 px。
- 页面纯白底，分区用卡片 + `ring-border-subtle`；金额、克重、倒计时加 `tabular`。
- 主色只用于行动、选中、关键数字；金色只做信息强调，不作按钮底色。
- **组件库优先**：`src/components/` 已有对应组件时必须复用，禁止在页面重写同功能组件或另起一套样式；现有组件缺能力时，先扩展组件再在页面使用。
- 面向用户的界面按真实业务表达：不出现「演示 / 模拟 / 无需支付」等原型字样，mock 只存在于数据层与代码注释。

## 4. 页面结构

- 一级页 `TabPage`、二级页 `DetailPage`、列表页 `ListPage`；不手拼外层与间距。
- 独立全屏结果页（提交成功 / 失败、完成态等）必须单独注册路由（`paths.ts` + `manifest.ts`），不得在流程页内用 `submitted` 之类的状态切换整页；跨页数据写入 sessionStorage 快照，直达 / 刷新时给空态兜底。
- Tab 标签、Tab 顺序与桌面左栏菜单只由 `routes.config.ts` 派生。
- 所有有独立路由的页面都必须出现在桌面左栏菜单中（评审不漏页）；带动态参数的路由用 `menuPath` 指定可用的示例入口；分组按业务流程归类，不把订单、账户混在同一组。
- 依赖前置数据的页面支持 `?demo=<scene>` 直达样例状态（`useDemoScene`），左栏 `menuPath` 直接带上该参数；demo 首屏只读样例，不依赖上一步留下的存储。
- 按钮只用 `Button`（primary / secondary / tertiary / text / danger；lg / md / sm / icon）、`buttonStyles()` 与 `IconButton`；卡片只用 `Card` 的内边距档位。
- 表单只用 `FormField`、`SelectField`、`PickerSheet`、`ChoiceGroup`、`SwitchField`、`AgreementCheck`。
- 吸底 CTA 用 `BottomActionBar`，弹层用 `BottomSheet`，图片用 `MediaVisual` / `Gallery`。
- 新页面按 `docs/workflow/screenshot-to-page.md`：`paths.ts` → 模板页面 → `routes.config.ts` 注册；mock 放 `src/mocks/<flow>.ts`，图片地址只放 `src/assets/images.ts`。

## 5. 反模式

- 页面直接写图片 URL、长 mock 数组，或自造按钮/输入框/卡片。
- 用 `submitted` 等状态在同一路由内渲染整页成功页 / 结果页。
- 用 toast 或浏览器弹窗代替页面内状态。
- 为 PC 另写一套布局。
- 为「看起来能跑」删除兼容处理。

## 6. 交付自检

`npm run verify`（typecheck + lint + ui:check + build）、`npm run visual:check`、`npm run verify:full`。

- `ui:check` 例外只允许单行 `// ui-allow`；视觉基线变更确认后再 `visual:update`。
- 产物抽查：`dist/assets/*.css` 中 `@layer` 为 0 次；`dist/index.html` 含 `build-stamp` 与 `?v=`。
- 375 宽无横向溢出，≥900px 显示设备框。
