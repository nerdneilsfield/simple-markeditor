# Markdown→PDF Editor 技术选型文档

> **版本**：v1.0（2025‑05‑30）
> **对应 PRD**：v1.1
> **作者**：全栈软件项目共创 & 技术开发助手

---

## 1. 选型决策总览

| 层次          | 方案                               | 关键理由                                            | 替代方案               | 结论                                 |
| ------------- | ---------------------------------- | --------------------------------------------------- | ---------------------- | ------------------------------------ |
| UI 框架       | **React 18 + Vite 5**              | JSX 与 Monaco 高度兼容；Hook/Fiber 性能；生态最丰富 | Vue 3 + Vite           | **采用**                             |
| 移动编辑器    | **CodeMirror 6**                   | 轻量、触控友好、主题复用                            | 继续使用 Monaco        | **采用**（指针为 coarse 时自动降级） |
| 杂项状态管理  | **Zustand**                        | <1 KB、Hook API、零模板代码                         | Redux Toolkit          | **采用**                             |
| Markdown 解析 | **marked 9.x**                     | GFM 全面、70 KB、持续维护                           | markdown‑it            | **采用**                             |
| 语法高亮      | **Prism.js** (dynamic import)      | 体积小、主题多、按需加载                            | highlight.js           | **采用**                             |
| Lint / Fix    | **remark‑lint + remark‑stringify** | Rule 插拔、浏览器运行、Diff 支持                    | markdown‑lint‑cli      | **采用**                             |
| 国际化        | **react‑i18next**                  | JSON 词条；懒加载                                   | linguiJS               | **采用**                             |
| 构建工具      | **pnpm + Vite 5**                  | monorepo 友好；HMR 极速                             | npm / Yarn             | **采用**                             |
| 部署平台      | **Cloudflare Pages**               | 全球 CDN 边缘发布；Git 推送即 CI/CD                 | GitHub Pages / Netlify | **采用**                             |
| PDF 导出      | **window\.print() + print.css**    | 0 依赖、原生渲染                                    | html2pdf.js / jsPDF    | **MVP 采用**；后续可平滑替换         |

---

## 2. 架构设计原则

1. **极简体积**：首屏资源 ≤ 650 KB (gzip)。未首屏所需包全部 `dynamic import`。
2. **移动优先**：`pointer: coarse` 触发 CodeMirror 6，布局切换为 Tab 模式；组件全部 Flex‑box 响应式。
3. **插件化**：Lint 规则、Markdown 插件、主题 CSS 均以 JSON/文件形式动态注册。
4. **无后端**：所有数据仅存 LocalStorage/IndexedDB；无需服务器即可离线使用。
5. **安全沙箱**：预览区使用 `<iframe sandbox>` + DOMPurify 防跨站。

---

## 3. 开发环境与规范

| 分类     | 规范                                                                         |
| -------- | ---------------------------------------------------------------------------- |
| 代码风格 | ESLint + Prettier + Husky pre‑commit；Airbnb 基础规则                        |
| 目录结构 | `src/components`、`src/hooks`、`src/store`、`src/themes`、`public/i18n.json` |
| Git      | Conventional Commits；main = 生产，dev = 集成；PR 模板自动关联 issue         |
| 单元测试 | Vitest + React Testing Library；覆盖率门槛 90 %（Lint 修复算法需 100 %）     |
| E2E      | Playwright：桌面 Chrome、移动 iPhone 12 profile                              |

---

## 4. 风险与缓解

| 风险             | 等级 | 缓解措施                                                |
| ---------------- | ---- | ------------------------------------------------------- |
| **Monaco 体积**  | 中   | `vite-plugin-monaco-editor` 拆分 worker；CDN 懒加载     |
| **打印边距差异** | 中   | 提示使用 Chrome；提供调节边距 UI；print.css 初始 0 边距 |
| **大文档性能**   | 中   | Backlog #1：分块渲染 + 虚拟滚动；DiffModal 行折叠       |
| **移动键盘遮挡** | 低   | `VirtualKeyboard` API + 输入框滚动到可视区              |

---

## 5. 学习与参考资源

| 范畴                 | 链接                                         |
| -------------------- | -------------------------------------------- |
| React 18 新特性      | 官方文档 _React.dev_ / Concurrent Features   |
| CodeMirror 6 Guide   | `codemirror.net/6/docs/`                     |
| marked 深度解析      | GitHub `markedjs/marked` Wiki                |
| remark‑lint 规则开发 | `remark.js.org` 文档                         |
| Cloudflare Pages CI  | 官方 Docs：`developers.cloudflare.com/pages` |

---

> **审批流程**：确认本技术选型文档后，即可进入 **阶段六：API & 系统架构**。如需调整请在 Canvas 批注或聊天指出。
