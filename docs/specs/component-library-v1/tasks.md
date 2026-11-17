# 组件库补齐 · 执行任务

> 依据：`docs/specs/component-library-v1/spec.md`。仅新增组件与组件库样张，不做业务页面、不改路由结构。

## T1 新增基础原语（4）

- [ ] `src/components/Button.tsx`：`primary/secondary/tertiary/text` × `lg(48)/md(44)/sm(36)`；sm 用 `after:-inset-y-1` 补 44 点击区；禁用 `bg-muted text-ink-400`。
- [ ] `src/components/PriceText.tsx`：整数用 role、小数 `text-caption`、整体 `tabular`；`tone=price|ink|gold|muted`；支持 `prefix/suffix/decimals`。
- [ ] `src/components/ListItem.tsx`：`min-h-14/min-h-18`、图标 20、箭头 16、`divider`、可点用原生 `button`。
- [ ] `src/components/Skeleton.tsx`：`text/rect/circle`，`aria-hidden`，使用 `.skeleton` 动画。

## T2 新增表单与确认（5）

- [ ] `src/components/FormField.tsx`：`useId` 关联 label；`h-11`、`rounded-sm`、聚焦 `ring-red-500`；`unit/hint/error/required/multiline/readOnly`。
- [ ] `src/components/PickerSheet.tsx`：基于 `BottomSheet`，确认制，受控草稿，`Button primary block`。
- [ ] `src/components/AgreementCheck.tsx`：`role="checkbox"`、`aria-checked`、整行 `min-h-11`、禁止默认勾选。
- [ ] `src/components/PhotoUploader.tsx`：`FileReader` 本地预览、4 列 `aspect-square`、上限 6、删除点击区 44、无网络请求。
- [ ] `src/components/ConfirmDialog.tsx`：portal 到 `[data-phone-frame]`；Esc/遮罩/返回键关闭；锁滚动；焦点归还；`tone=default|danger`。

## T3 新增订单与状态（5）

- [ ] `src/components/OrderCard.tsx`：单号 + `Badge` + 物品摘要 + `PriceText` + `actions`。
- [ ] `src/components/StatusSteps.tsx`：6 步主链、横向滚动、`aria-current`、终态不进步骤条。
- [ ] `src/components/StatusTimeline.tsx`：纵向事件、`done/current/pending`、时间 `text-caption tabular`。
- [ ] `src/components/CountdownBar.tsx`：`deadline` 每秒刷新、到点 `onEnd` 一次、`role="timer"`、`aria-live="off"`、清理定时器。
- [ ] `src/components/ResultStatus.tsx`：4 种状态、图标圆 64、主次操作、`role="status"`。

## T4 全局样式（1）

- [ ] `src/index.css`：新增 `.skeleton` 工具类（1.2s，`line-soft ↔ line`），放在 `@layer utilities`；不改变现有 `.app-h` 与 `@layer` 结构。

## T5 组件库样张（1）

- [ ] 扩展 `src/pages/StyleGuide.tsx`：保留现有色板/字阶/兼容项，新增 6 组样张——按钮、价格、表单与勾选、选择与确认弹层、上传、订单状态与结果/加载。使用 `useState` 管理 `AgreementCheck`、`PickerSheet`、`ConfirmDialog`、`PhotoUploader`、`CountdownBar` 示例；示例文案保持通用，不构造业务数据。

## T6 验证

- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] 检查新增文件无 `text-[`、无 `font-medium|semibold|bold`、无裸 hex、无 `p-3.5/p-2.5`
- [ ] `dist/assets/*.css` 中 `@layer` 计数为 0
- [ ] 375 宽无横向溢出；弹层/对话框内滚动正常

## 验收口径

1. 14 个组件全部可从 `@/components/*` 导入，tsc 无错误。
2. 组件库页可操作：按钮态、勾选态、选择弹层、确认弹窗、照片增删、倒计时跳动、骨架动画。
3. 不改 `package.json`、不新增依赖、不新增业务页面与路由。
