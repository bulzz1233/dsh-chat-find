<p align="center">
  <img src="icon.svg" width="72" height="72" alt="Chat Find 图标">
</p>

<h1 align="center">Chat Find for DeepSeek Harness</h1>

<p align="center">
  DeepSeek Harness 桌面端的对话内查找插件。<br>
  中文 | <a href="README.md">English</a>
</p>

Chat Find 为 DeepSeek Harness 的对话视图加入浏览器/IDE 风格的查找栏。它搜索所有**已渲染**的聊天节点——用户消息、助手文本、工具卡片，以及已经加载到页面中的更早历史记录——同时排除输入框草稿和查找栏自身。

## 功能

- **`Ctrl+F` / `Cmd+F`** 打开，也可以点击对话标题栏右上角的查找按钮。
- **`Esc` 随时关闭**，即使焦点仍在查找输入框或对话输入框中。
- **搜索所有已渲染聊天节点**：用户消息、助手文本、工具卡片，以及已加载到 DOM 的分页历史。
- **`Aa` 区分大小写、`ab` 全词匹配**：查找错误码、函数名和 API 标识符时非常实用。
- **实时 `n / total` 计数**，`Enter` / `Shift+Enter` 在匹配项之间跳转，并在首尾循环。
- **`F3` / `Shift+F3`、`Ctrl+G` / `Ctrl+Shift+G`** 与“下一个/上一个”按钮行为一致。
- **搜索历史**：`ArrowUp` / `ArrowDown` 浏览最近查询词，最新在前、自动去重；从最新一条继续向下时，恢复你正在输入的草稿。
- **零结果反馈**：计数和查找栏边框变红，并抖动一次。无结果时反复按 `Enter` 会再次抖动；在 `prefers-reduced-motion` 下不播放动画。
- **流式感知**：通过防抖的 `MutationObserver` 在助手输出流式进行或加载更早分页时重新搜索。当前匹配以文本节点和偏移量锚定，因此新插入的历史内容或追加的 token 不会把光标跳到另一处匹配；重新搜索也不会抢占滚动位置。
- **安全的作用范围**：排除输入框、`contenteditable` 草稿、隐藏节点以及插件自身的查找栏，草稿文本不会产生幽灵匹配。
- **跟随主题的界面**：使用 `--dsw-alias-*` 主题变量，并提供中文和英文文案。

## 环境要求

- DeepSeek Harness Desktop，且 Chromium 引擎支持 CSS Custom Highlight API（Chromium 105+）。
- 已在 DeepSeek Harness `0.2.1-rc.5` 上测试。

## 安装

先将仓库克隆到一个固定目录：

```bash
git clone https://github.com/bulzz1233/dsh-chat-find.git
```

然后在当前 DSH profile 中把该目录安装为 bundle。在 DSH 会话里让 Agent 安装本地 bundle，并传入绝对路径，例如：

```text
安装这个本地插件 bundle：/absolute/path/to/dsh-chat-find
```

Agent 会使用 `plugin_manager` 的 `install_bundle` 和绝对目录完成安装。该 bundle 会以链接方式加入 profile，之后执行 `git pull` 的更新会在客户端重新加载后生效。

如果插件没有立即出现，请刷新一次 DSH 窗口。

## 使用

| 操作 | 快捷键 |
| --- | --- |
| 打开查找栏 | `Ctrl+F` / `Cmd+F`，或标题栏查找图标 |
| 关闭 | `Esc` |
| 下一个匹配 | `Enter`、`F3`、`Ctrl+G` |
| 上一个匹配 | `Shift+Enter`、`Shift+F3`、`Ctrl+Shift+G` |
| 上一条 / 下一条搜索词 | `ArrowUp` / `ArrowDown` |
| 切换区分大小写 | `Aa` 按钮 |
| 切换全词匹配 | `ab` 按钮 |

当前匹配使用品牌色高亮，其余匹配使用半透明的品牌色高亮。

## 实现方式

- 从当前 `[data-conversation-scroll]` 视图中收集文本，具体使用已渲染的 `conversation.chat.flow` 子树。
- 文本节点会拼接为逻辑字符串，并保留块级边界；因此匹配可以跨越内联 `<span>`（例如语法高亮代码），但不会跨越不相关的块产生误匹配。
- 匹配使用 `CSS.highlights` 和 `Range` 绘制，而不是插入 `<mark>`，因此不会修改 React 管理的 DOM。
- 当前匹配以 `{ 文本节点, 偏移量 }` 标识。由 DOM 变化触发的重新搜索会先按这个身份查找，再考虑索引回退，并且不会滚动视图。
- 查找栏是根级浮层；标题栏触发按钮位于 `conversation.session.header.utilities`。

## 项目结构

```text
dsh-chat-find/
├── client.js          # 客户端：界面、控制器、搜索与高亮逻辑
├── index.js           # Host 半部分（当前不使用 Host 服务）
├── cordis.patch.yml   # Bundle 行
├── package.json       # DSH bundle + client 清单
├── locale/
│   ├── en.json        # 插件管理元数据
│   └── zh.json
└── icon.svg
```

## 限制

- 只能搜索当前已渲染的文本。尚未挂载的虚拟化节点或折叠节点不会被匹配。
- 查询按字面文本处理，不支持正则表达式。
- 全词匹配使用 JavaScript/Unicode 的单词边界，不是特定语言的分词器。

## 许可证

MIT，详见 [LICENSE](LICENSE)。
