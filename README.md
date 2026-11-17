# 黄金回收 H5 原型

微信 App 内置浏览器与 PC 浏览器共用的 H5 原型底座。当前有**一个空的业务首页**和**一个组件库页**：前者是业务流程入口（待填充），后者用来证明构建、设计 token、演示外壳与三个兼容性阻断项都已解决；业务页面等设计稿到位后再加。

- 构建产物：`dist/`（纯静态，相对路径，Hash 路由，可直接丢到任意静态托管）
- 本地开发：`npm run dev` → http://localhost:8011
- 构建命令：`npm run build`

---

## 一、为什么是 H5

| 维度    | H5（本项目）              | 小程序                     |
| ----- | -------------------- | ----------------------- |
| 演示分发  | 一个链接，微信里点开就能看，PC 同一套 | 需要主体、审核、体验版成员，每次改都要重新上传 |
| 迭代速度  | 改完构建即发，评审马上看到        | 审核 / 版本发布周期，原型阶段成本过高    |
| PC 演示 | 同一份产物，浏览器直接开         | 需要开发者工具或投屏，评审体验差        |
| 设计一致性 | 375 逻辑宽一套设计，两端表现一致   | 两套端能力差异，容易分叉            |
| 原生能力  | 无（无支付、无自定义分享卡片、无扫码）  | 有                       |

原型阶段的目标是「流程能被评审、链接能被转发」，原生能力用不上，所以选 H5。

---

## 二、目录结构

```
gold_recycling_mini/
├── index.html                  # 入口；含缓存 meta、build-stamp、og/description
├── package.json                # 脚本 + 依赖 + browserslist 兼容基线
├── vite.config.ts              # base './'、build.target、构建戳注入（缓存击穿）
├── postcss.config.mjs          # @layer 展开 + autoprefixer
├── tsconfig.json               # strict、@/* 别名
├── eslint.config.js            # flat config（TS + react-hooks + refresh）
├── .prettierrc.json            # 与代码风格一致：无分号、单引号、100 列
├── scripts/
│   ├── dev.mjs                 # 开发启动器（端口 8011，清孤儿进程）
│   ├── build.sh                # rm dist → vite build → 清 .DS_Store
│   ├── check-ui.mjs            # 样式红线检查（裸色值 / 任意值 / 页面裸 img）
│   └── visual.mjs              # 视觉回归（375 单视口）
├── tests/visual/               # 视觉基线 / 实际截图 / 差异图
├── src/
│   ├── index.tsx               # HashRouter 挂载
│   ├── app.tsx                 # 路由装配 + NotFound
│   ├── index.css               # Tailwind 引入、base/utilities、vh+dvh 兜底类
│   ├── theme/
│   │   └── tokens.css          # 唯一设计 token 来源（色板 / 字号角色 / 圆角 / 阴影 / 动效）
│   ├── lib/
│   │   ├── utils.ts            # cn()（tailwind-merge 已注册自定义字号组）
│   │   ├── money.ts            # 金额 / 克重 / 倒计时格式化
│   │   └── useViewportFit.ts   # visualViewport（键盘高度）+ 输入框聚焦滚动
│   ├── stores/
│   │   └── createExternalStore.ts  # 极简 external store（暂无业务状态）
│   ├── routes/
│   │   ├── paths.ts            # 路径唯一来源
│   │   ├── routes.config.ts    # 路由表 + Tab/菜单元数据（唯一来源）
│   │   └── prototypeMenu.ts    # 桌面左栏菜单（由路由表生成）
│   ├── assets/
│   │   └── images.ts           # 图片地址唯一入口
│   ├── mocks/                  # 页面 mock 数据（按业务流拆文件）
│   ├── pages/
│   │   ├── Home / Stores / Orders / Me / Login  # 业务页
│   │   └── style-guide/        # 组件库样张（7 页）
│   └── components/
│       ├── Layout.tsx          # 设备框外壳（375 净宽 / 900 断点 / 键盘避让）
│       ├── PrototypeNav.tsx    # PC 演示左栏（≥900px 才显示）
│       ├── BottomActionBar.tsx # 吸底 CTA（含安全区 padding）
│       ├── BottomTabNav.tsx    # 底部 Tab（标签/顺序由路由表派生）
│       ├── BottomSheet.tsx     # 底部抽屉（锁滚动 / 返回键关闭 / 手势下滑）
│       ├── Gallery.tsx         # 横滑图库（scroll-snap + 计数 + 键盘）
│       ├── Carousel.tsx        # 轮播（自动播放 / 可见性暂停 / reduced-motion）
│       ├── MediaVisual.tsx     # 固定宽高比图片容器（lazy + onError）
│       ├── TabPage / DetailPage / ListPage  # 三类页面模板
│       ├── Button / buttonStyles / IconButton / Card / PageHeader / PageShell / EmptyState
│       ├── FormField / SelectField / ChoiceGroup / SwitchField / FieldFrame / AgreementCheck
│       └── KeyValueRow / InlineNotice / SegmentedTabs / Stepper / SearchBar / StatCard 等
└── dist/                       # 构建产物（git 忽略）
```

---

## 三、常用命令

| 命令                                | 作用                                       |
| --------------------------------- | ---------------------------------------- |
| `npm install`                     | 安装依赖（Node ≥ 20）                          |
| `npm run dev`                     | 开发服务器，`http://localhost:8011`，同局域网可用手机访问 |
| `npm run build`                   | 生产构建，产物在 `dist/`                         |
| `npm run preview`                 | 本地预览 `dist/`，端口 8012                     |
| `npm run typecheck`               | `tsc --noEmit`                           |
| `npm run lint`                    | ESLint（flat config）                      |
| `npm run ui:check`                | 样式红线检查（裸色值 / 任意值 / 页面裸 img）              |
| `npm run verify`                  | typecheck + lint + ui:check + build      |
| `npm run visual:update`           | 生成 / 更新视觉回归基线                            |
| `npm run visual:check`            | 375 视口与基线对比                           |
| `npm run verify:full`             | verify + visual:check                    |
| `npm run format` / `format:check` | Prettier 写入 / 校验                         |

发布：产物是纯静态且 `base: './'`，直接把 `dist/` 交给 `hsk-cli file-hosting` 一类的静态托管即可，不需要 404 重写、不需要 Node 服务。

---

## 四、token 使用方式

三层结构，**只允许用第三层**：

```
原始色阶（--red-500） → 语义变量（--primary / --card / --border） → Tailwind 类（bg-primary / text-body）
```

```tsx
// 正确：颜色走语义类，字号走 role 类
<div className="bg-card text-foreground ring-1 ring-border-subtle">
  <div className="text-card-title">足金手镯</div>
  <div className="text-body text-muted-foreground">按实测克重结算</div>
  <div className="text-display tabular">¥ 1,286.50</div>
</div>

// 错误
<div className="text-[15px] text-[#e1251b]">…</div>
```

- **颜色**：`bg-primary` `text-foreground` `text-muted-foreground` `border-border` `bg-surface-2`；品类强调用 `gold-*`，语义状态用 `success / warning / destructive`。
- **字号角色**（6 档，禁止任意值）：`text-display(36)` `text-title(28)` `text-section(21)` `text-card-title(16)` `text-body(14)` `text-body-strong(14/500)` `text-label(14/500)` `text-caption(12)` `text-caption-strong(12/500)`。
- **数字**：金额、克重、倒计时加 `tabular`，保证等宽不跳动。
- **圆角**：`rounded-xs/sm/md/lg`（4/8/12/16），胶囊用 `rounded-full`。
- **阴影**：`shadow-xs/sm/md/lg`，卡片默认 `shadow-xs`。
- **动效**：时长用 `duration-[var(--motion-fast)]` / `duration-[var(--motion-base)]` / `duration-[var(--motion-slow)]`，缓动用 `ease-[var(--ease-standard)]` / `ease-[var(--ease-enter)]` / `ease-[var(--ease-exit)]`，不写裸毫秒。
- **页面底色**：纯白 `bg-background`；卡片白底 + `ring-border` 描边 + `shadow-xs`，不用灰色块做分区。

改品牌色只改 `src/theme/tokens.css` 里的 `--red-*` 与 `--gold-*`，组件不用动。

---

## 五、新增页面的步骤

1. **加路径**：`src/routes/paths.ts` 里补一条（含参数路径写成函数，如 `order: (id: string) => '/orders/' + id`）。
2. **写页面**：按类型套模板——一级页 `TabPage`、二级页 `DetailPage`、列表页 `ListPage`；内容间距与留白由模板负责，卡片用 `Card`。
3. **注册路由**：`src/routes/routes.config.ts` 的 `APP_ROUTES` 里加 `{ path, label, group, order, component }`——桌面左栏菜单自动出现；一级页再补 `tab: { label, icon, order }`，底部 Tab 自动出现，不用改 `app.tsx`。
4. **自检**：`npm run verify`，有视觉变更时再跑 `npm run visual:check`；最后用 `npm run preview` 在 375 宽与 ≥900 宽的窗口各看一遍。

新增页面时的硬约束：

- 不写裸 hex、不写任意字号（`text-[15px]`）；
- 不用 toast 做反馈，用 `InlineNotice` 或页面内状态；
- 吸底操作一律用 `BottomActionBar`（已带安全区），不要自己写 `position: fixed`；
- 弹层一律用 `BottomSheet`（已处理滚动穿透与返回键）；
- 图片一律走 `MediaVisual` / `Gallery`，固定宽高比 + `loading="lazy"`。

---

## 六、兼容性：三个阻断项的处理与验证

背景：项目骨架继承自 `golden_h5`（React 19 + Vite 7 + Tailwind 4）。Tailwind 4 的默认产物在旧内核上会整页失效，所以做了三处处理，并都在构建产物里核对过。

### 1. `@layer` 整块丢弃 → PostCSS 展开

Tailwind 4 把全部规则包在 `@layer properties/theme/base/components/utilities` 里，iOS < 15.4、Chromium < 99 不认 `@layer`，会丢弃整块内容。

处理：`postcss.config.mjs` 引入 `@csstools/postcss-cascade-layers`，把层展开成普通规则，并用 `:not(#\#)` 复写选择器权重来复刻层序。`@tailwindcss/vite` 的 generate 插件 `enforce: 'pre'`，会把 Tailwind 编译结果先交给 PostCSS，因此该插件能看到完整层结构。

验证：

```bash
grep -c '@layer' dist/assets/*.css     # 0
head -c 160 dist/assets/*.css          # @supports(...){...} 普通规则，非 @layer
grep -o ':not(#' dist/assets/*.css | wc -l   # 每个选择器追加 10 个 :not(#\#)，层序靠权重复刻
```

### 2. `dvh` 无 `vh` 兜底 → `@supports` 双保险

`height: 100dvh` 在 iOS 15.4 / Chromium 108 以下整条失效，设备框会没有高度。

处理：`src/index.css` 提供 `.app-h` / `.app-min-h`，先写 `100vh`，再用 `@supports (height: 100dvh)` 覆盖成 `100dvh`；`Layout` 只用这两个类。

**为什么不是「同一规则写两行 height」**：实测 Tailwind 4 编译期（Lightning CSS）会把同一规则里的重复声明去重、只留最后一条，`height:100vh` 会凭空消失；而 esbuild 不会。所以必须让两条声明落在不同的规则里。

验证（产物里 vh 在前、dvh 在后）：

```
.app-h:not(#\#)…:not(#\#){height:100vh}
.app-min-h:not(#\#)…:not(#\#){min-height:100vh}
@supports (height:100dvh){.app-h:not(#\#)…{height:100dvh}…}
```

### 3. 发版缓存 → meta 不缓存 + 资源版本 query

静态托管改不了响应头；微信 WebView 对 `index.html` 的缓存比较顽固，发新版后可能出现「旧 HTML + 已删除的 hash 资源」→ 白屏。

处理（两层）：

1. `index.html` 加 `Cache-Control: no-cache, no-store, must-revalidate` / `Pragma` / `Expires` 三条 meta；
2. `vite.config.ts` 的 `cache-bust-html` 插件在构建时生成时间戳，写进 `<meta name="build-stamp">`，并给 `./assets/*.js|css` 追加 `?v=<stamp>`，让每次发布的资源 URL 都不同。

验证：

```
<meta name="build-stamp" content="20261115100155" />
<script type="module" crossorigin src="./assets/index-*.js?v=20261115100155"></script>
<link rel="stylesheet" crossorigin href="./assets/index-*.css?v=20261115100155">
```

更稳的做法仍然是**按版本号子目录发布**（如 `/recycle/20261115/`），保留上一版资源。meta 与 query 只是让默认托管也能用。

---

## 七、演示环境适配

| 项              | 做法                                                                                                                                |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 构建目标           | `vite.config.ts` 显式 `build.target: ['es2019','safari13','chrome79']`，`cssTarget` 同步；`package.json` 的 `browserslist` 对齐，避免声明与产物不一致 |
| PC 窄窗口         | 断点从 `md`(768) 提到 `min-[900px]`；< 900px 时内容列 `max-w-[430px] mx-auto`，不拉伸；≥ 900px 才出左侧导航与 393 设备框（净宽 375）                           |
| 底部安全区          | `BottomActionBar` 用 `pb-[max(12px,env(safe-area-inset-bottom))]`；`BottomTabNav`、`BottomSheet` footer 同样处理                         |
| 微信视口           | `viewport-fit=cover` + `-webkit-text-size-adjust:100%` + `overscroll-behavior-y:none`（防橡皮筋把整页拉出设备框）                               |
| 键盘             | `useViewportFit` 监听 `visualViewport`，把高度差写进 `--keyboard-inset` 由设备框收底部；输入框 `focusin` 后延迟 300ms `scrollIntoView({block:'center'})` |
| 路由             | `HashRouter`（静态托管无 404 重写）；抽屉打开时 `pushState`，系统返回键只关抽屉不退出页面                                                                       |
| 分享             | 无微信 JS-SDK：不能自定义分享卡片，只能依赖 `<title>` 与 `og:*` meta（已在 `index.html` 补齐）                                                             |
| Service Worker | 不使用（微信 iOS 不支持）                                                                                                                   |

---

## 八、产物与验收

最近一次构建（本机实测）：

```
dist/index.html                 1.46 kB │ gzip   0.74 kB
dist/assets/index-*.css        62.73 kB │ gzip   8.11 kB
dist/assets/index-*.js        307.24 kB │ gzip  97.92 kB
```

无头 Chrome 实测（同一份 `dist/`）：

| 窗口       | 视口   | 设备框                 | 结论                       |
| -------- | ---- | ------------------- | ------------------------ |
| 375×812  | 375  | 375×812，left 0      | 无横向溢出（scrollWidth = 375） |
| 500×900  | 500  | 430 居中（left 35）     | 窄窗口不拉伸                   |
| 700×800  | 700  | 430 居中（left 135）    | 窄窗口不拉伸                   |
| 1440×900 | 1440 | 393×830（left 673.5） | 左导航 300 + 手机框，符合预期       |

截图见 `.shots/`。

---

## 九、未验证项

以下**没有**在真机或真实微信里验证，不能当作已通过：

- 微信 iOS / Android 真机打开：样式完整度、`@layer` 展开后的选择器兼容（`:not(#\#)` 链在极老内核上的表现）。
- 键盘弹起时吸底栏与输入框的实际可见性（`visualViewport` 行为与微信版本强相关）。
- 微信 WebView 对 `index.html` 缓存的真实失效时间，以及 meta 不缓存是否被采纳。
- 分享卡片标题 / 缩略图的实际抓取效果。
- 花生壳等静态托管的子路径部署（本项目 `base:'./'` + Hash 路由按理可直接用，但未实际上传验证）。
- iOS 15.4 以下的旧机型（无对应设备）。
