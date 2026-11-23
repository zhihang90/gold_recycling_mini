# HANDOVER — 行情与资讯页

> 新会话启动时请**优先读取本文件**。读完再动代码，别在上下文中兜圈子。

---

## 1. 项目定位

**安盛华 · 黄金买卖平台 H5 原型**，React + TypeScript + Vite + HashRouter，设计基准 375，微信内置浏览器兼容。完整需求文档在 `docs/specs/行情与资讯需求文档-v1.html`。

## 2. 已实现的页面

底部 Tab 五个：首页 / **行情（本次改动核心）** / 买金 / 购物车 / 我的。第三个 tab 是行情。

| 路由 | 页面 | 文件 |
| --- | --- | --- |
| `#/market` | 行情页（无标题栏，TabPage） | `src/pages/Market.tsx` |
| `#/market/news` | 资讯列表（独立全屏，DetailPage） | `src/pages/MarketNewsList.tsx` |
| `#/market/news/:newsId` | 资讯详情（独立全屏，返回回列表） | `src/pages/MarketNewsDetail.tsx` |

## 3. 行情页结构（#/market）

**无顶部标题栏**（TabPage 不传 title），页面直接从卡片开始。

```
┌─────────────────────────────────────────────────┐
│ 卡片 1：行情概览                                  │
│ [实时金价] [上金所行情] [国际现货]  ← underline   │
│  ─ 实时金价 → 红顶栏 + 4 行贵金属表格（黄金行有买/卖按钮）│
│  ─ 上金所行情 → 红顶栏 + 5 行上金所合约表格          │
│  ─ 国际现货 → 红顶栏 + 10 行国际贵金属表格           │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│ 卡片 2：图表分析（固定，不动）                      │
│ Au99.99 交易中 ¥668.xx 元/克 +涨跌%               │
│ [分时] [K线]    1分 5分 15分 1小时 日 周 月        │
│ ↑ SVG 图表（十字光标，2s 自动隐藏）                  │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│ 关联品种（可点，Toast「该品种暂不支持交易」）           │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│ 报价与交易（平台金条买入价）                          │
│ 规格 Chip / 金价小计 / 手续费 0.2% / 合计            │
│ 立即买入（→ /buy/:productId）/ 预约购金（Toast）     │
│ 申请回购（置灰，回购功能即将开放）                      │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│ 我的提醒（本地存储，同一标的最多 3 条待触发）           │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│ 资讯与解读（3 条倒序，底部「更多 ›」→ /market/news）│
└─────────────────────────────────────────────────┘
风险提示 Footer
```

### 卡片 1 Pill Tab（当前状态）
- **类型**：`SegmentedTabs` 组件 `variant="underline" fill`，**不是 pill**（被要求对齐订单列表的 tab 样式，订单列表用的是 underline 细金指示条）
- **三枚**：实时金价 / 上金所行情 / 国际现货
- **默认选中**：`DEFAULT_QUOTE_TAB = 'physical'`
- **数据来源**：`QUOTE_TABS` / `PHYSICAL_METALS`(4行, 黄金/白银/铂金/钯金) / `DOMESTIC_CONTRACTS`(5行上金所合约) / `INTERNATIONAL_CONTRACTS`(10行国际)
- **tab 切换不影响卡片 2**：图表分析卡始终固定展示 `quoteByCode('au9999')`

### 实时金价表格（当前状态）
- 4 行：黄金 / 白银 / 铂金 / 钯金（之前有铑/铱/钌，被要求删除）
- 列：商品 / 回购(绿) / 销售(红) / 高·低(高红低绿)
- **只有黄金行有按钮**：回购列「卖出」→ `/orders?type=recycle`，销售列「买入」→ `/buy`
- 其余 3 行（白银/铂金/钯金）回购/销售列只有价格，下方用 `h-4` 占位保持对齐
- 表头独立背景 `bg-surface-2`

### 卡片 2 固定不动
- `chartQuote = quoteByCode('au9999')!`，不跟随卡片 1 tab 切换
- OverviewCard + ChartCard 一体，K 线 MA5/MA10，十字光标

### TradeCard
- 固定展示 `quoteByCode('platform-buy')!`（平台金条买入价）
- 立即买入 → `/buy/bar-sheet` 或 `/buy/bar-trapezoid`（按规格 10g 分界）
- 手续费占位 0.2%（PRD 标 TBD）

## 4. 核心文件清单

| 文件 | 作用 |
| --- | --- |
| `src/mocks/market.ts` | **权威数据源**：MARKET_QUOTES、QUOTE_TABS、PHYSICAL_METALS、DOMESTIC_CONTRACTS、INTERNATIONAL_CONTRACTS、CHART_PERIODS、MARKET_NEWS、watchlist/alerts/risk-ack 读写、模拟 tick |
| `src/pages/Market.tsx` | 行情页主页面，组件：MarketPage / QuoteView / PhysicalMetalTable / DomesticContractsTable / InternationalContractsTable / OverviewCard / ChartCard / RelatedCard / TradeCard / AlertsCard / NewsSummaryCard / AlertSheet / ManageSheet / RiskDialog |
| `src/pages/MarketNewsList.tsx` | **新建**，独立全屏资讯列表页 |
| `src/pages/MarketNewsDetail.tsx` | 资讯详情，返回回 `/market/news` |
| `src/routes/paths.ts` | 新增 `marketNewsList: '/market/news'`、`marketNewsDetail: '/market/news/:newsId'`、`marketNewsListPath()`、`marketNewsDetailPath()` |
| `src/routes/manifest.ts` | market / market.news / market.newsDetail 三条路由注册（均 `visual: false`） |
| `src/components/SegmentedTabs.tsx` | 新增 `fill?: boolean`（等宽铺满），pill + underline 双 variant |

## 5. 本地存储

| Key | 用途 |
| --- | --- |
| `gold_market_watchlist` | 自选列表（上限 8） |
| `gold_market_alerts` | 到价提醒（同一标的最多 3 条待触发） |
| `gold_market_risk_ack` | 风险弹窗已读标记 |

## 6. 模拟刷新

`useMarketTicker` hook，5 秒 `simulateMarketTick()`：±0.16% 随机波动，夹 ±4%。页面隐藏时暂停，回到前台立即补一次。模块级 `lastQuoteCode` 保持选中标的跨挂载。

## 7. 异常态演示 URL

| URL | 效果 |
| --- | --- |
| `#/market?demo=offline` | 网络断开，立即买入禁用 |
| `#/market?demo=delay` | 数据延迟 Badge，交易锁定 |
| `#/market?demo=closed` | 休市，立即买入禁用 + 显示锁定原因 |

## 8. 花生壳发布命令（**正确写法，别再写错**）

```bash
cd gold_recycling_mini
npm run build
(cd dist && zip -qr /tmp/dist.zip .)
hsk-cli file-hosting-update -resource-id 1794994157918333951 -entry-file index.html /tmp/dist.zip
```

**资源固定**：`resource-id 1794994157918333951`
**域名固定**：`https://lxli9w.kicp.fun`

错误写法（`file-hosting update` 子命令）会报 `missing file path`，已踩过坑。

## 9. 本次会话的完整需求轨迹（供参考，不用全读）

1. PRD 实现行情 + 资讯 → 发布
2. 去掉「行情标的」/「全部行情」，把「平台金条买入价/回购价」换成实物行情 tab（pill）
3. 结构调整：卡片 1 固定实物行情表，卡片 2 才是 pill tab 切 Au99.99 / 伦敦金 + 图表
4. 卡片 1 恢复三 tab（实物行情 / 上金所行情 / 国际现货）全走表格，卡片 2 固定 Au99.99
5. 「实物行情」tab → **重命名为「实时金价」**；删除铑/铱/钌三行（只剩 4 行）；黄金行加买入/卖出按钮（跳 `/buy` 和 `/orders?type=recycle`）
6. **只保留黄金行按钮**（其余 3 行白银/铂金/钯金只有价格无按钮）
7. Tab 样式从 **pill 改为 underline**（对齐订单列表的 tab 风格）

## 10. 踩过的坑

| 坑 | 正确做法 |
| --- | --- |
| 发布命令子命令写错 | `file-hosting-update`（连写，不是 `file-hosting update`） |
| `MarketPage` 传 title | TabPage 传 title 会渲染 PageHeader；行情页需要**无标题栏**，所以不传 title |
| 切 Tab 重挂载丢状态 | 模块级变量 `lastQuoteCode` / URL params；别指望 state 跨挂载保留 |
| 资讯详情返回地址 | 一开始返回 `/market?tab=news`，后来资讯 Tab 拆成独立列表页 `/market/news`，详情返回也得跟着改 |
| SegmentedTabs `fill` + `variant="underline"` | pill variant 不支持 fill 的 `flex-1 justify-center`，underline 的按钮元素可以 |
| underline variant 的按钮 aria-* | underline variant 下按钮才加 `role="tab"` + `aria-selected`，pill 不加 |
| 表格固定列宽 | `grid grid-cols-[1fr_90px_90px_56px]` 比 `auto-auto-auto-auto` 稳，不挤压 |

## 11. 设计 token 备忘

- 语义色：`text-price`(红，涨) / `text-success`(绿，跌) / `primary` / `warning` / `info` / `gold-*`
- **禁裸 hex/任意值**，只用语义 token
- 项目根目录没有 `.uicraft.md`，颜色/间距以 `src/tailwind.config.ts` 为准

## 12. 下一步（如果有的话）

- 「立即买入」当前跳到 `/buy/:productId`，不是确认订单页（PRD 标偏差项）
- 手续费占位 0.2%（PRD 标 TBD）
- 白银/铂金/钯金行的买入/卖出按钮如果以后要加，改 `isGold &&` 那行判断即可
- 订单列表 `?type=recycle` 当前是否有对应 UI 筛选 tab，需确认

## 13. 快速验证清单

```bash
npm run verify      # typecheck + lint + ui:check + routes:check + build
npm run visual:check
npm run dev -- --host 0.0.0.0 --port 5173
# 然后 curl -sI http://localhost:8011/ | head -3
```

花生壳发布后验证：
```bash
curl -s https://lxli9w.kicp.fun | head -5   # 看引用哪个 JS/CSS
curl -sI https://lxli9w.kicp.fun/assets/<file>.js | head -3  # 200 才行
```
