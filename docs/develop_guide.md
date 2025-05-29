# 实施计划 & 开发指导

> **版本**：v1.0（2025-05-30）
> **对应阶段**：Stage 7 — Implementation & Dev Guide
> **核心语言**：**TypeScript 5.x**
> **作者**：全栈软件项目共创 & 技术开发助手

---

## 1. 时间线（1 Day Sprint）

| 时间段                                 | 任务包                                    | 产出          | Owner |
| ----------------------------------- | -------------------------------------- | ----------- | ----- |
| **09:00–10:00**                     | 初始化仓库<br>• `pnpm init`                 |             |       |
| • 安装 React 18, Vite 5, TypeScript 5 | Repo Skeleton (`main`, `dev` branches) | qiqi        |       |
| **10:00–12:00**                     | 编辑器 & 预览                               |             |       |
| • 集成 **Monaco** (desktop)           |                                        |             |       |
| • CodeMirror 6 动态导入 (mobile)        |                                        |             |       |
| • marked + Prism 渲染                 |                                        |             |       |
| • 安装 Zustand store                  | `src/App.tsx`, `src/store.ts`          | qiqi        |       |
| **13:30–15:30**                     | 主题系统 & print.css                       |             |       |
| • 4 套主题 CSS                         |                                        |             |       |
| • 切换逻辑 (Zustand)                    |                                        |             |       |
| • `print.css` 覆盖                    | `src/themes/` & `ThemeSelector.tsx`    | qiqi        |       |
| **15:30–17:30**                     | Lint & Diff 修复                         |             |       |
| • remark-lint + 自定义规则               |                                        |             |       |
| • DiffModal 组件                      |                                        |             |       |
| • LocalStorage 持久化                  | `src/lint/`, `DiffModal.tsx`           | qiqi        |       |
| **17:30–18:30**                     | i18n & Settings Drawer                 |             |       |
| • react-i18next + `i18n.json`       |                                        |             |       |
| • 侧边抽屉 (规则开关)                       |                                        |             |       |
| • 移动布局 Tab 切换                       | `src/i18n/`, `SettingsDrawer.tsx`      | qiqi        |       |
| **18:30–19:30**                     | 测试 & CI/CD                             |             |       |
| • Vitest 单测                         |                                        |             |       |
| • Playwright 脚本                     |                                        |             |       |
| • GitHub->CF Pages Flow             | `.github/workflows/pages.yml`          | qiqi        |       |
| **19:30–20:00**                     | README & 发布                            | `README.md` | qiqi  |

---

## 2. 目录结构

```text
root/
 ├─ public/
 │   ├─ i18n.json
 │   └─ index.html
 ├─ src/
 │   ├─ components/
 │   │   ├─ EditorDesktop.tsx
 │   │   ├─ EditorMobile.tsx
 │   │   ├─ PreviewPane.tsx
 │   │   ├─ ThemeSelector.tsx
 │   │   ├─ DiffModal.tsx
 │   │   └─ SettingsDrawer.tsx
 │   ├─ hooks/
 │   │   └─ useDevice.ts
 │   ├─ lint/
 │   │   ├─ rules.ts
 │   │   └─ lintService.ts
 │   ├─ store.ts
 │   ├─ themes/
 │   │   ├─ github.css
 │   │   ├─ notion.css
 │   │   ├─ typora.css
 │   │   └─ academic.css
 │   ├─ App.tsx
 │   └─ main.tsx
 ├─ tests/
 │   ├─ unit/
 │   └─ e2e/
 ├─ vite.config.ts
 ├─ tsconfig.json
 └─ package.json
```

---

## 3. 脚手架命令

| 脚本             | 说明                   |
| -------------- | -------------------- |
| `pnpm dev`     | 本地开发，Vite HMR        |
| `pnpm build`   | 生产构建（`dist/`）        |
| `pnpm preview` | 本地预览生产包              |
| `pnpm test`    | 运行 Vitest 单元测试       |
| `pnpm e2e`     | Playwright 端到端       |
| `pnpm lint`    | ESLint 检查 + Prettier |

---

## 4. 核心实现提示

### 4.1 设备检测 Hook

```ts
export const useIsMobile = () =>
  window.matchMedia('(pointer: coarse)').matches;
```

### 4.2 动态导入编辑器

```tsx
const Editor = lazy(() =>
  useIsMobile()
    ? import('./components/EditorMobile')
    : import('./components/EditorDesktop')
);
```

### 4.3 Diff 修复流程

1. `lintService.run(md)` → 返回 `LintRuleResult[]`
2. 生成 `fixOutput` = `lintService.applyFixes(md, results)`
3. `<DiffModal original={md} fixed={fixOutput} />`
4. 用户点击「应用」→ `setContent(fixOutput)`

---

## 5. 测试策略

| 层次  | 工具                    | 覆盖                        |
| --- | --------------------- | ------------------------- |
| 单元  | **Vitest**            | Lint rule 修复、Store 操作     |
| 组件  | React Testing Library | ThemeSelector / DiffModal |
| E2E | **Playwright**        | 输入→预览→导出 PDF 流程（桌面+移动）    |

---

## 6. CI/CD

* GitHub Action `pages.yml` 步骤：

  1. Checkout → pnpm install
  2. pnpm lint && pnpm test
  3. pnpm build
  4. `npx wrangler pages deploy dist --project-name md2pdf`
* Preview 环境：Pull Request → `preview-<sha>` URL 自动注释

---

## 7. 下一步迭代钩子

| Feature    | 触发点                                        |
| ---------- | ------------------------------------------ |
| 分块渲染       | `src/features/chunked/` 目录预留接口             |
| PWA        | `vite-plugin-pwa` 注释模板已置于 `vite.config.ts` |
| Mermaid 插件 | `marked.use(rendererMermaid)` lazy import  |

---

> **完毕**：实施计划已就绪，可根据此清单启动 1 Day 冲刺。需要调整或细化，请批注！
