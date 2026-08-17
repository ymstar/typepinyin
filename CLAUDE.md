# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

TypePinyin 是一个纯前端中文拼音打字练习工具，使用 Vue 3 + Vite 构建。所有数据（错词本、练习历史、自定义词库、设置）仅保存在浏览器 localStorage，无后端。

## 常用命令

```bash
# 安装依赖
npm install

# 本地开发
npm run dev
# 默认端口 5566（vite.config.js 中 server.port 配置为 5568，注意实际可能因占用调整）

# 生产构建
npm run build
# 产物在 dist/ 目录，可直接部署到任意静态托管

# 预览构建产物
npm run preview
```

注意：本项目没有 lint、format 或 test 脚本。

## 项目结构

```
public/
  sw.js                   # Service Worker 离线缓存
  manifest.webmanifest    # PWA 清单
src/
  App.vue                 # 顶层布局：顶部导航 + 4 个 Tab 视图
  components/
    PracticeView.vue      # 练习主界面（核心交互引擎）
    WordBookView.vue      # 错词本
    StatsView.vue         # 统计与历史
    SettingsView.vue      # 设置、词库导入、数据备份
  data/
    words.js              # 内置字/词/文章池
    pinyinGroups.js       # 易错拼音分组与错误类型分析
    wubi86.js             # 五笔 86 版单字码表
    wubiWords.js          # 五笔词组码表（基于单字码表生成）
    wubiRoots.js          # 五笔字根口诀
  store/useStore.js       # 全局状态 + localStorage 持久化
  utils/review.js         # 简化 SM-2 记忆曲线
  utils/share.js          # 分享文案与 Canvas 卡片
  styles/main.css         # 全局样式
index.html                # 入口；引用 manifest 与 sw
vite.config.js            # Vite 配置（base: './' 用于相对路径部署）
fly.toml                  # Fly.io 部署配置
```

## 核心架构

### 1. 练习引擎（PracticeView.vue）

`PracticeView.vue` 包含全部练习逻辑，是项目的核心：

- 支持 7 种模式：单字 / 词组 / 文章 / 错词复习 / 拼音专项 / 五笔 / 自定义。
- 练习项（`items`）结构：`{ char, pinyins, wubiCodes, status }`。
- 输入处理：全局监听 `window.keydown`，仅接受 `a-z`（五笔下也是 4 码编码）。
- 校验逻辑：
  - 拼音模式：多音字通过 `pinyin-pro` 获取所有可能读音；用户输入完全匹配某个读音则前进，否则打错。
  - 五笔模式：`wubi86[char]` 可能包含多个候选编码（简码、全码，逗号分隔），取任一匹配或前缀匹配。
  - 自定义模式：导入的 JSON 可指定每个字/词的拼音，否则回退到 `pinyin-pro`。
- 错词记录：打错时调用 `recordWrong`，在 `useStore.wrongWords` 中累加；如果开启记忆曲线，会调用 `reviewFail()` 重置间隔。
- 结果：完成后生成 `{ id, date, mode, total, wrong, wpm, accuracy, duration }`，写入 `useStore.history`。

### 2. 状态管理（store/useStore.js）

- 使用 Vue `reactive` 创建全局唯一状态，并通过 `watch(..., { deep: true })` 自动持久化到 `localStorage('typepinyin-data-v1')`。
- `settings` 字段包括：当前模式、文章索引、练习字数、拼音专项分组、五笔提示、记忆曲线开关等。
- 提供数据导出/导入：`exportData()` / `importData(jsonStr)`，用于手动备份与恢复。
- 自定义词库：
  - `customWords` 每项 `{ text, pinyin }`。
  - `addCustomWords` 支持字符串数组、对象数组 `{text,pinyin}` / `{word,pinyin}`、对象映射 `"词":"拼音"`。

### 3. 数据层

- `data/words.js`：提供常用字池、常用词池、练习文章，以及 `shuffle`。
- `data/pinyinGroups.js`：定义易错拼音分组（平翘舌、前后鼻音、l/n、f/h、r/l）。
  - `analyzePinyinError(correct, wrong)`：分析用户错音属于哪一组易混类型。
  - `pinyinInGroup(pinyin, group)`：用于「拼音专项」模式筛选字。
- `data/wubi86.js`：GB2312 一级字 3755 个五笔编码，一个字符可能对应多个编码（逗号分隔）。
- `data/wubiWords.js`：根据五笔词组取码规则，从 `wubi86.js` + `words.js` 的词组生成 4 码词组编码。
- `data/wubiRoots.js`：字根键位与首字根名称，用于「五笔单字模式」下的字根提示。

### 4. 记忆曲线（utils/review.js）

简化版 SM-2：
- 答对：`repetitions++`，间隔依次为 1/3/7/14 天，之后按 `interval * easeFactor` 增长；`easeFactor` 每次 +0.1。
- 答错：`repetitions` 归零，间隔 1 天，`easeFactor` 下降 0.2。
- 仅在 `store.settings.reviewEnabled === true` 时启用；错词本会显示「到期」状态。

### 5. 分享卡片（utils/share.js）

使用 Canvas 绘制 1200×630 的分享图片，模式、速度、正确率、总字数、用时等。`PracticeView.vue` 中通过 `openShare()`、`copyShareText()`、`downloadShareImage()` 调用。

### 6. PWA 与部署

- `public/sw.js` 缓存核心资源；`main.js` 中注册 Service Worker。
- `vite.config.js` 设置 `base: './'`，方便部署到任意静态托管。
- `fly.toml` 配置了 Fly.io 静态服务，内部端口 8080（Vite preview 默认 4173，通常 Fly 镜像会用 `npx serve` 等，留意实际配置）。

## 开发与修改要点

- 新增练习模式：需要在 `PracticeView.vue` 的 `modes`、`buildItems()`、`onKeydown()`、`emptyText`、模板和 `modeLabel`（`utils/share.js` 和 `StatsView.vue`）多处同步。
- 新增拼音分组：在 `data/pinyinGroups.js` 增加分组，`PracticeView.vue` 中的 `pinyin` 专项下拉会自动使用 `PINYIN_GROUPS`。
- 修改持久化数据格式：如果改动 `defaultData` 结构，应检查现有 `localStorage` 数据兼容；必要时升级 `STORAGE_KEY` 版本号。
- 五笔编码变更：`wubi86.js` 是数据源；`wubiWords.js` 在构建时基于它生成词组编码。
- 样式：全部使用 `src/styles/main.css` 中的 CSS 变量，深色主题。
