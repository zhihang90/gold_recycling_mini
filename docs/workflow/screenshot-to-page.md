# 截图 → 原型 工作流

本流程用于「一次给多张页面截图，批量生成/修改原型」的场景，目标是同类页面结构一致、同类组件视觉一致。

## 1. 收图与编号

- 按业务流分组，文件名带顺序：`01-home.png`、`02-store-list.png`、`03-store-detail.png`。
- 同一页面不同状态单独标注：`03-store-detail-empty.png`、`03-store-detail-error.png`。

## 2. 先出页面清单，再写代码

每批截图先整理成清单，确认后再逐页生成：

| 字段 | 说明 |
| --- | --- |
| 路由 | `paths.xxx`，如 `/stores` |
| 页面类型 | 一级 Tab 页 / 二级详情页 / 列表页 / 表单页 |
| 模板 | `TabPage` / `DetailPage` / `ListPage` |
| 状态 | 默认 / 加载 / 空 / 错误 / 未登录 |
| 数据 | 字段、mock 文件、是否需要新增 |
| 图片 | 对应 `src/assets/images.ts` 的 key |

## 3. 生成顺序

1. `src/routes/paths.ts` 补路径。
2. 选模板写页面：一级页 `TabPage`，二级页 `DetailPage`，列表页 `ListPage`，表单页用 `DetailPage` + 表单原语。
3. 组件只用 `src/components/` 现有实现；缺组件先补组件 + `style-guide` 样张，再进页面。
4. `src/routes/routes.config.ts` 注册路由、分组与排序；一级页补 `tab` 元数据。

## 4. 数据与图片

- mock 数据放 `src/mocks/<flow>.ts`，页面不内联长数组。
- 图片地址统一放 `src/assets/images.ts`，页面不写 URL。
- 页面私有组件放 `src/pages/<flow>/components/`，跨页复用的才升级到 `src/components/`。

## 5. 自检

```bash
npm run verify          # typecheck + lint + ui:check + build
npm run visual:update   # 首次或确认视觉变更后，更新基线
npm run visual:check    # 与基线对比
```

首次运行视觉回归需要浏览器：`npx playwright install chromium`。基线只在同一环境下对比有效，换操作系统或字体环境后需人工确认再 `visual:update`。

- 375 宽与 900 宽都要看：375 查溢出与安全区，900 查设备框内布局。
- 涉及交互的页面，手动点一遍主路径：进入、返回、提交、空态。
- 视觉基线只覆盖稳定页面；含外链图片的样张不进基线，避免网络波动误报。

## 6. 发布

构建通过后重新发布同一站点，链接不变；评审意见回到第 2 步形成增量清单。
