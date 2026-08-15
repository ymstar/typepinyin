# TypePinyin · 中文拼音打字练习

> 一次敲击，一点进步。Practice Chinese typing, one keystroke at a time.

TypePinyin 是一个**纯前端、零依赖后端、数据全本地**的中文拼音打字练习工具。受 [TypeWords](https://github.com/zyronon/TypeWords) 启发，针对中文拼音输入场景做了专项设计。

- 在线体验：https://typepinyin.vercel.app（部署后替换）
- 无需注册、无需安装、无广告、无数据上传

## 功能特性

- **四种练习模式**：单字 / 词组 / 文章 / 错词复习
- **实时拼音校验**：逐字输入拼音（不带声调），自动匹配前进，支持多音字
- **错误定位**：打错的字自动标记并收录进错词本，针对性巩固
- **实时统计**：速度（字/分）、正确率、用时、进度
- **练习历史**：本地保存每次练习记录，最近 7 天练习量可视化
- **内置词库**：高频常用字、常用词组、经典古诗与散文（公共版权内容）
- **数据自主**：所有数据仅存于浏览器 localStorage，可一键清空
- **极简界面**：现代深色主题，无广告，键盘即开即练

## 快速开始

需要 Node.js 18+。

```bash
# 安装依赖
npm install

# 本地开发
npm run dev
# 默认地址 http://localhost:5568

# 生产构建
npm run build

# 预览构建产物
npm run preview
```

构建产物在 `dist/` 目录，可部署到任意静态托管（GitHub Pages / Vercel / Netlify / Nginx 等）。

## 技术栈

- [Vue 3](https://vuejs.org/) + [Vite](https://vitejs.dev/)
- [pinyin-pro](https://github.com/zh-lx/pinyin-pro) — 汉字转拼音（含多音字）
- 数据存储：浏览器 localStorage

## 项目结构

```
typepinyin/
├── index.html
├── vite.config.js
├── public/
│   └── favicon.svg
└── src/
    ├── main.js
    ├── App.vue
    ├── components/
    │   ├── PracticeView.vue   # 练习主界面
    │   ├── WordBookView.vue   # 错词本
    │   ├── StatsView.vue      # 统计
    │   └── SettingsView.vue   # 设置
    ├── data/
    │   └── words.js           # 词库与文章
    ├── store/
    │   └── useStore.js        # 本地状态管理
    └── styles/
        └── main.css
```

## 路线图

- [ ] 拼音错误类型细分（平翘舌 / 前后鼻音 / 易混淆拼音专项练习）
- [ ] 五笔编码练习模式
- [ ] 自定义词库导入（TXT / JSON）
- [ ] 记忆曲线复习计划
- [ ] 输入法配置引导
- [ ] PWA 离线支持与数据导出

## 贡献

欢迎提交 Issue 和 PR。词库、文章、功能建议均可参与贡献。

## 致谢

- [TypeWords](https://github.com/zyronon/TypeWords) — 本项目灵感来源
- [pinyin-pro](https://github.com/zh-lx/pinyin-pro) — 拼音转换库

## License

[MIT](./LICENSE)
