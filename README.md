# TypePinyin · 中文拼音打字练习

> 一次敲击，一点进步。Practice Chinese typing, one keystroke at a time.

TypePinyin 是一个**纯前端、零依赖后端、数据全本地**的中文拼音打字练习工具。受 [TypeWords](https://github.com/zyronon/TypeWords) 启发，针对中文拼音输入场景做了专项设计。

- 在线体验：https://typepinyin.vercel.app（部署后替换）
- 无需注册、无需安装、无广告、无数据上传

## 功能特性

- **七种练习模式**：单字 / 词组 / 文章 / 错词复习 / 拼音专项 / 五笔 / 自定义词库
- **实时拼音校验**：逐字输入拼音（不带声调），自动匹配前进，支持多音字
- **拼音错误类型细分**：打错时自动识别平翘舌、前后鼻音、l/n、f/h 等易混类型并给出针对性提示
- **拼音专项练习**：按易错分组（平翘舌音 / 前后鼻音 / l-n / f-h / r-l）定向强化
- **五笔编码练习**：内置 86 版五笔常用字码表（3755 字），支持简码与全码
- **记忆曲线复习**：错词按遗忘曲线（简化 SM-2）安排复习，答对间隔自动拉长
- **自定义词库**：支持 TXT / JSON 导入，用于专属词库练习
- **错误定位**：打错的字自动标记并收录进错词本，针对性巩固
- **实时统计**：速度（字/分）、正确率、用时、进度
- **练习历史**：本地保存每次练习记录，最近 7 天练习量可视化
- **内置词库**：高频常用字、常用词组、经典古诗与散文（公共版权内容）
- **输入法优化引导**：内置主流输入法（搜狗 / 微软 / macOS / 五笔）设置建议
- **数据自主**：所有数据仅存于浏览器 localStorage，支持一键导出 / 导入备份
- **PWA 离线支持**：可安装到桌面，离线也能练习
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
- 五笔 86 版码表（GB2312 一级字 3755 个，数据源自 [gopherlib/wubi](https://github.com/gopherlib/wubi)）
- 数据存储：浏览器 localStorage
- PWA：Service Worker 离线缓存

## 项目结构

```
typepinyin/
├── index.html
├── vite.config.js
├── public/
│   ├── favicon.svg
│   ├── manifest.webmanifest   # PWA 清单
│   └── sw.js                  # Service Worker 离线缓存
└── src/
    ├── main.js
    ├── App.vue
    ├── components/
    │   ├── PracticeView.vue   # 练习主界面（7 种模式）
    │   ├── WordBookView.vue   # 错词本（含记忆曲线状态）
    │   ├── StatsView.vue      # 统计
    │   └── SettingsView.vue   # 设置（词库导入 / 备份 / 输入法引导）
    ├── data/
    │   ├── words.js           # 词库与文章
    │   ├── wubi86.js          # 五笔 86 版常用字码表
    │   └── pinyinGroups.js    # 易错拼音分组
    ├── utils/
    │   └── review.js          # 记忆曲线（简化 SM-2）
    ├── store/
    │   └── useStore.js        # 本地状态管理
    └── styles/
        └── main.css
```

## 路线图

- [x] 拼音错误类型细分（平翘舌 / 前后鼻音 / 易混淆拼音专项练习）
- [x] 五笔编码练习模式
- [x] 自定义词库导入（TXT / JSON）
- [x] 记忆曲线复习计划
- [x] 输入法配置引导
- [x] PWA 离线支持与数据导出
- [ ] 五笔词组练习与字根提示
- [ ] 自定义词库支持带拼音的 JSON 格式增强
- [ ] 练习结果分享卡片
- [ ] 多设备数据同步（WebDAV / 网盘）

## 贡献

欢迎提交 Issue 和 PR。词库、文章、功能建议均可参与贡献。

## 致谢

- [TypeWords](https://github.com/zyronon/TypeWords) — 本项目灵感来源
- [pinyin-pro](https://github.com/zh-lx/pinyin-pro) — 拼音转换库

## License

[MIT](./LICENSE)
