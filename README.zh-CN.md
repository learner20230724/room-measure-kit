# Room Measure Kit

中文优先 · [English](./README.en.md)

[![Validate](https://github.com/learner20230724/room-measure-kit/actions/workflows/validate.yml/badge.svg)](https://github.com/learner20230724/room-measure-kit/actions/workflows/validate.yml)
[![Deploy to GitHub Pages](https://github.com/learner20230724/room-measure-kit/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/learner20230724/room-measure-kit/actions/workflows/deploy-pages.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=fff)](https://vite.dev/)
[![React](https://img.shields.io/badge/React-19-20232a?logo=react&logoColor=61DAFB)](https://react.dev/)

一个用于估算房间面积、周长、墙面面积、地板余量和涂料用量的小型网页工具。

它解决的是很常见的场景：矩形房间、快速估算、界面干净一点，不想在一堆广告和跳转里找结果。

## 为什么做它

简单看了一圈，同类里已经有不少“只算地板”或“只算涂料”的工具，也有一些开源仓库停留在很基础的表单页面。真正还算值得做的，不是公式本身，而是一个更统一、更轻量、可直接静态部署、也更适合公开展示的 all-in-one 页面。

构建前参考了这些方向：

- GitHub 上的 `CoreyMcCoy/flooring-calculator`
- GitHub 上的 `MikeTheWayne/Paint-Calculator`
- 一些独立的 flooring estimator 网页工具

## 功能

- 🌗 深色 / 浅色主题切换（工具栏右上角按钮，主题偏好自动保存到 localStorage）
- 内置几组更适合 demo 和截图的房间 preset chips
- 房间地面面积与周长计算
- 根据墙高估算墙面面积
- 按损耗比例估算地板需求
- 按覆盖率估算涂料用量
- 一键复制结果摘要，方便贴到聊天或文档里
- 链接分享：输入变更自动写入 URL，复制"分享链接"按钮一键获取可传播的链接，打开即自动恢复输入状态
- 一键导出 Results 面板为 PNG 或 PDF，方便截图或存档
- 用一组轻量 Vitest 测试覆盖核心计算逻辑
- 基于 Vite + React，适合静态托管

## 截图

仓库里附带了一份预览截图：`docs-preview.png`。

另外还补了一张用于链接分享预览的 `public/social-preview.svg`，并且已经在 `index.html` 里接入 Open Graph / Twitter Card 元数据，后续部署后页面链接展示会更完整。

如果后面要换成真实运行截图，直接本地执行：

```bash
npm install
npm run dev
```

打开本地页面后截取主视口即可。

## 本地运行

```bash
npm install
npm run dev
```

## 校验

```bash
npm run lint
npm run test
npm run build
```

## 构建

```bash
npm run build
npm run preview
```

## 部署

仓库已经附带 GitHub Pages 工作流：`.github/workflows/deploy-pages.yml`。

推到 GitHub 后：

1. 打开 **Settings → Pages**
2. 将 **Source** 设为 **GitHub Actions**
3. 向 `main` 推送，或手动触发 workflow

由于 Vite 已配置 `base: './'`，生成后的 `dist/` 也能直接丢到其他静态托管环境里使用，不依赖特定仓库路径。

## 英文版

英文说明见：[README.en.md](./README.en.md)

## 说明

- 墙面面积默认按四面完整墙体计算，不扣除门窗。
- 涂料结果只是快速估算，实际还会受涂刷遍数、基层状态和产品参数影响。
- 地板损耗比例是规划值，不是精确承诺值。

## 技术栈

- React
- TypeScript
- Vite

## License

MIT

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=learner20230724/room-measure-kit&type=Date)](https://www.star-history.com/#learner20230724/room-measure-kit&Date)
