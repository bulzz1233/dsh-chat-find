<p align="center">
  <img src="icon.svg" width="72" height="72" alt="Chat Find icon">
</p>

<h1 align="center">Chat Find for DeepSeek Harness</h1>

<p align="center">
  In-conversation find bar for the DeepSeek Harness desktop UI.<br>
  在 DeepSeek Harness 对话内查找文本的插件。<br>
  English | <a href="README.zh.md">中文</a>
</p>

Chat Find adds a browser/IDE-style find bar to the DeepSeek Harness conversation view. It searches every **rendered** chat node — user messages, assistant output, tool cards, and older pages already loaded into the transcript — without touching the composer draft or the find bar itself.

## Features

- **Open with `Ctrl+F` / `Cmd+F`** or the find button in the conversation header.
- **`Esc` closes** from anywhere, including while the search input or the composer has focus.
- **All rendered chat nodes** are searched: user messages, assistant text, tool cards, and paginated history already in the DOM.
- **Match case (`Aa`) and whole word (`ab`)** toggles for error codes, function names, and API identifiers.
- **Live `n / total` count**, with `Enter` / `Shift+Enter` navigation that wraps at both ends.
- **`F3` / `Shift+F3` and `Ctrl+G` / `Ctrl+Shift+G`** do the same as the next/previous buttons.
- **Search history** with `ArrowUp` / `ArrowDown`: newest first, deduplicated, and the in-progress draft is restored when moving past the newest entry.
- **Zero-result feedback**: the count and bar border turn red and the bar shakes once. Repeatedly pressing `Enter` shakes it again. Motion is disabled under `prefers-reduced-motion`.
- **Streaming-aware**: a debounced `MutationObserver` re-runs the search while a response streams or older pages load. The active match is anchored by its text node and offset, so newly prepended history or appended tokens do not move the cursor to a different match. Re-searches never take over the scroll position.
- **Scoped safely**: input fields, contenteditable drafts, hidden nodes, and the plugin's own bar are excluded, so draft text cannot create ghost matches.
- **Theme-native UI** built from `--dsw-alias-*` tokens, with English and Chinese copy.

## Requirements

- DeepSeek Harness Desktop with a Chromium engine that supports the CSS Custom Highlight API (Chromium 105+).
- Tested against DeepSeek Harness `0.2.1-rc.5`.

## Install

Clone the repository somewhere stable:

```bash
git clone https://github.com/bulzz1233/dsh-chat-find.git
```

Then install the folder as a bundle in the current DSH profile. From a DSH session, ask the agent to install the local bundle, passing the absolute path, for example:

```text
Install this local plugin bundle: /absolute/path/to/dsh-chat-find
```

The agent uses `plugin_manager` with `install_bundle` and the absolute directory. The bundle is linked into the profile, so later `git pull` updates are picked up after the client reloads.

If the plugin does not appear immediately, reload the DSH window once.

## Usage

| Action | Shortcut |
| --- | --- |
| Open find bar | `Ctrl+F` / `Cmd+F`, or the header find icon |
| Close | `Esc` |
| Next match | `Enter`, `F3`, `Ctrl+G` |
| Previous match | `Shift+Enter`, `Shift+F3`, `Ctrl+Shift+G` |
| Previous / next search term | `ArrowUp` / `ArrowDown` |
| Toggle match case | `Aa` button |
| Toggle whole word | `ab` button |

The active match is highlighted in the brand color; all other matches use a translucent brand highlight.

## How it works

- Text is collected from the active `[data-conversation-scroll]` view, using the rendered `conversation.chat.flow` subtree.
- Text nodes are joined into a logical string with block boundaries preserved, so matches can cross inline `<span>` boundaries (useful for syntax-highlighted code) without matching across unrelated blocks.
- Matches are painted with `CSS.highlights` and `Range` objects rather than `<mark>` elements, so React-owned DOM is never mutated.
- The active match is identified by `{ text node, offset }`. On a mutation-triggered rescan, that identity is looked up again before any index fallback, and the view is not scrolled.
- The search bar itself is a root-level overlay; the header trigger lives in `conversation.session.header.utilities`.

## Project layout

```text
dsh-chat-find/
├── client.js          # Client half: UI, controller, search/highlight logic
├── index.js           # Host half (no host services today)
├── cordis.patch.yml   # Bundle row
├── package.json       # DSH bundle + client manifest
├── locale/
│   ├── en.json        # Plugin Manager metadata
│   └── zh.json
└── icon.svg
```

## Limitations

- Only text that is currently rendered is searchable. Virtualized or collapsed nodes that are not mounted cannot be matched.
- The query is literal text, not a regular expression.
- JavaScript/Unicode word boundaries are used for whole-word mode; this is not a language-specific tokenizer.

## License

MIT. See [LICENSE](LICENSE).
