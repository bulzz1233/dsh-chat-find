window.__ModuleLoader__.load({
  id: '@local/dsh-chat-find',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const useRef = React.useRef;
    const useEffect = React.useEffect;
    const useLayoutEffect = React.useLayoutEffect || React.useEffect;
    const useSyncExternalStore = React.useSyncExternalStore;

    const NS = 'chatFind';
    const HISTORY_KEY = 'dsh-chat-find.history.v1';
    const HISTORY_LIMIT = 30;
    const ALL_HIGHLIGHT = 'dsh-chat-find-all';
    const ACTIVE_HIGHLIGHT = 'dsh-chat-find-active';
    const PANEL_ID = 'dsh-chat-find-panel';
    const PANEL_ATTR = 'data-dsh-chat-find';
    const TRIGGER_ATTR = 'data-dsh-chat-find-button';

    const en = {
      button: 'Find in conversation',
      buttonTitle: 'Find in conversation (Ctrl+F)',
      label: 'Find in conversation',
      placeholder: 'Find in conversation',
      matchCase: 'Match case',
      wholeWord: 'Match whole word',
      previous: 'Previous match (Shift+Enter)',
      next: 'Next match (Enter)',
      close: 'Close (Esc)',
      matchCount: '{current} of {total}',
      noResults: 'No results',
    };

    const zh = {
      button: '在对话中查找',
      buttonTitle: '在对话中查找（Ctrl+F）',
      label: '在对话中查找',
      placeholder: '在对话中查找',
      matchCase: '区分大小写',
      wholeWord: '全词匹配',
      previous: '上一个匹配（Shift+Enter）',
      next: '下一个匹配（Enter）',
      close: '关闭（Esc）',
      matchCount: '第 {current} 个，共 {total} 个',
      noResults: '无结果',
    };

    const EXCLUDE_SELECTOR = [
      '[data-dsh-chat-find]',
      '[data-dsh-chat-find-button]',
      'input',
      'textarea',
      'select',
      '[contenteditable]:not([contenteditable="false"])',
      '[data-input-scroll]',
      '[aria-hidden="true"]',
      '[hidden]',
      'script',
      'style',
      'noscript',
      'template',
    ].join(', ');

    const BLOCK_TAGS = new Set([
      'ADDRESS', 'ARTICLE', 'ASIDE', 'BLOCKQUOTE', 'BODY', 'CAPTION',
      'DD', 'DETAILS', 'DIALOG', 'DIV', 'DL', 'DT', 'FIELDSET',
      'FIGCAPTION', 'FIGURE', 'FOOTER', 'FORM', 'H1', 'H2', 'H3',
      'H4', 'H5', 'H6', 'HEADER', 'HGROUP', 'HR', 'LI', 'MAIN',
      'NAV', 'OL', 'P', 'PRE', 'SECTION', 'SUMMARY', 'TABLE',
      'TBODY', 'TD', 'TFOOT', 'TH', 'THEAD', 'TR', 'UL',
    ]);

    const CSS = `
      .dsh-chat-find-trigger {
        box-sizing: border-box;
        display: inline-flex;
        flex: none;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        padding: 0;
        border: 0;
        border-radius: var(--dsw-radius-sm, 6px);
        background: transparent;
        color: var(--dsw-alias-label-tertiary);
        cursor: pointer;
        -webkit-app-region: no-drag;
        transition: background-color 120ms ease, color 120ms ease;
      }
      .dsh-chat-find-trigger:hover,
      .dsh-chat-find-trigger[data-open="true"] {
        background: var(--dsw-alias-interactive-bg-hover, var(--dsw-alias-bg-layer-2));
        color: var(--dsw-alias-label-primary);
      }
      .dsh-chat-find-trigger[data-open="true"] {
        color: var(--dsw-alias-brand-primary);
      }
      .dsh-chat-find-trigger:focus-visible,
      .dsh-chat-find-button:focus-visible {
        outline: 2px solid var(--dsw-alias-brand-primary);
        outline-offset: 1px;
      }

      .dsh-chat-find-panel {
        position: fixed;
        z-index: 2147483000;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        gap: 2px;
        width: min(460px, calc(100vw - 24px));
        height: 40px;
        padding: 0 6px 0 10px;
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: var(--dsw-radius-md, 10px);
        background: var(--dsw-alias-bg-overlay);
        color: var(--dsw-alias-label-primary);
        box-shadow: var(--dsw-elevation-panel, 0 10px 30px rgba(0, 0, 0, 0.2));
        backdrop-filter: var(--dsw-menu-backdrop-filter, blur(12px));
        -webkit-app-region: no-drag;
        font-size: 13px;
        line-height: 1.2;
      }
      .dsh-chat-find-panel:focus-within {
        border-color: var(--dsw-alias-border-l2);
      }
      .dsh-chat-find-panel[data-no-results="true"] {
        border-color: var(--dsw-alias-state-error-primary);
      }

      .dsh-chat-find-search-icon {
        display: inline-flex;
        flex: none;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
        margin-right: 3px;
        color: var(--dsw-alias-label-tertiary);
      }

      .dsh-chat-find-input {
        flex: 1 1 auto;
        min-width: 0;
        height: 30px;
        margin: 0;
        padding: 0 4px;
        border: 0;
        outline: none;
        background: transparent;
        color: var(--dsw-alias-label-primary);
        caret-color: var(--dsw-alias-brand-primary);
        font: inherit;
        font-size: 13px;
      }
      .dsh-chat-find-input::placeholder {
        color: var(--dsw-alias-label-tertiary);
        opacity: 1;
      }

      .dsh-chat-find-count {
        flex: none;
        min-width: 44px;
        padding: 0 4px;
        color: var(--dsw-alias-label-secondary);
        font-size: 12px;
        font-variant-numeric: tabular-nums;
        text-align: center;
        white-space: nowrap;
      }
      .dsh-chat-find-count[data-empty="true"] {
        color: var(--dsw-alias-state-error-primary);
      }

      .dsh-chat-find-button {
        box-sizing: border-box;
        display: inline-flex;
        flex: none;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        padding: 0;
        border: 0;
        border-radius: var(--dsw-radius-sm, 6px);
        background: transparent;
        color: var(--dsw-alias-label-secondary);
        cursor: pointer;
        font: inherit;
        transition: background-color 120ms ease, color 120ms ease;
      }
      .dsh-chat-find-button:hover {
        background: var(--dsw-alias-interactive-bg-hover, var(--dsw-alias-bg-layer-2));
        color: var(--dsw-alias-label-primary);
      }
      .dsh-chat-find-button[data-active="true"] {
        background: var(--dsw-alias-brand-primary);
        color: var(--dsw-alias-bg-base);
      }
      .dsh-chat-find-button[data-disabled="true"] {
        opacity: 0.45;
      }
      .dsh-chat-find-toggle {
        width: 30px;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.2px;
      }
      .dsh-chat-find-separator {
        flex: none;
        width: 1px;
        height: 18px;
        margin: 0 3px;
        background: var(--dsw-alias-border-l1);
      }

      @keyframes dsh-chat-find-shake {
        0%, 100% { transform: translateX(0); }
        20% { transform: translateX(-5px); }
        40% { transform: translateX(4px); }
        60% { transform: translateX(-3px); }
        80% { transform: translateX(2px); }
      }
      .dsh-chat-find-shake {
        animation: dsh-chat-find-shake 260ms cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
      }

      ::highlight(dsh-chat-find-all) {
        background-color: rgba(31, 111, 235, 0.28);
        background-color: color-mix(in srgb, var(--dsw-alias-brand-primary) 30%, transparent);
        color: inherit;
      }
      ::highlight(dsh-chat-find-active) {
        background-color: #1f6feb;
        background-color: var(--dsw-alias-brand-primary);
        color: #fff;
        color: var(--dsw-alias-bg-base);
      }

      @media (prefers-reduced-motion: reduce) {
        .dsh-chat-find-trigger,
        .dsh-chat-find-button {
          transition: none;
        }
        .dsh-chat-find-shake {
          animation: none;
        }
      }
    `;

    function escapeRegExp(value) {
      return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function isWordChar(value) {
      return typeof value === 'string' && value.length > 0 && /[\p{L}\p{N}_]/u.test(value);
    }

    function searchPattern(query, caseSensitive, wholeWord) {
      const flags = caseSensitive ? 'gu' : 'giu';
      let source = escapeRegExp(query);
      if (wholeWord) {
        const first = query[0];
        const last = query[query.length - 1];
        if (isWordChar(first)) source = `(?<![\\p{L}\\p{N}_])${source}`;
        if (isWordChar(last)) source = `${source}(?![\\p{L}\\p{N}_])`;
      }
      return new RegExp(source, flags);
    }

    function isVisibleElement(element) {
      if (!(element instanceof Element)) return false;
      if (typeof element.checkVisibility === 'function') {
        return element.checkVisibility({
          checkVisibilityCSS: true,
          checkVisibilityOpacity: false,
        });
      }
      return element.getClientRects().length > 0;
    }

    function findScrollElement() {
      const candidates = Array.from(document.querySelectorAll('[data-conversation-scroll]'))
        .filter(isVisibleElement);
      return candidates.find((element) => element.querySelector(
        '[data-slot="conversation.chat.flow"], [data-chat-flow]',
      )) || candidates[0] || null;
    }

    function findFlow(scroller) {
      return scroller.querySelector('[data-slot="conversation.chat.flow"]')
        || scroller.querySelector('[data-chat-flow]')
        || scroller;
    }

    function nearestBlock(element, root, cache) {
      const cached = cache.get(element);
      if (cached !== undefined) return cached;
      let current = element;
      let block = root;
      while (current !== null && current !== root) {
        if (BLOCK_TAGS.has(current.tagName)) {
          block = current;
          break;
        }
        current = current.parentElement;
      }
      cache.set(element, block);
      return block;
    }

    function buildIndex(root) {
      const parts = [];
      const segments = [];
      const blockCache = new WeakMap();
      const visibilityCache = new WeakMap();
      let length = 0;
      let previousBlock = null;
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          const parent = node.parentElement;
          if (parent === null || node.data.length === 0) return NodeFilter.FILTER_REJECT;
          if (parent.closest(EXCLUDE_SELECTOR) !== null) return NodeFilter.FILTER_REJECT;
          let visible = visibilityCache.get(parent);
          if (visible === undefined) {
            visible = isVisibleElement(parent);
            visibilityCache.set(parent, visible);
          }
          return visible ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        },
      });
      let node = walker.nextNode();
      while (node !== null) {
        const parent = node.parentElement;
        const block = nearestBlock(parent, root, blockCache);
        if (previousBlock !== null && block !== previousBlock && length > 0) {
          parts.push('\n');
          length += 1;
        }
        previousBlock = block;
        const data = node.data;
        segments.push({ node, start: length, end: length + data.length });
        parts.push(data);
        length += data.length;
        node = walker.nextNode();
      }
      return {
        root,
        text: parts.join(''),
        segments,
        length,
      };
    }

    function findMatches(index, query, caseSensitive, wholeWord) {
      if (query.length === 0 || index.segments.length === 0) return [];
      let expression;
      try {
        expression = searchPattern(query, caseSensitive, wholeWord);
      } catch {
        return [];
      }
      const matches = [];
      let cursor = 0;
      let match = expression.exec(index.text);
      while (match !== null) {
        const start = match.index;
        const end = start + match[0].length;
        if (match[0].length === 0) {
          expression.lastIndex += 1;
          match = expression.exec(index.text);
          continue;
        }
        while (cursor < index.segments.length && index.segments[cursor].end <= start) {
          cursor += 1;
        }
        const startSegment = index.segments[cursor];
        if (startSegment === undefined) break;
        let endCursor = cursor;
        while (endCursor < index.segments.length && index.segments[endCursor].end < end) {
          endCursor += 1;
        }
        const endSegment = index.segments[endCursor] || startSegment;
        const startOffset = Math.max(0, Math.min(
          startSegment.node.data.length,
          start - startSegment.start,
        ));
        const endOffset = Math.max(startOffset, Math.min(
          endSegment.node.data.length,
          end - endSegment.start,
        ));
        const range = document.createRange();
        try {
          range.setStart(startSegment.node, startOffset);
          range.setEnd(endSegment.node, endOffset);
        } catch {
          match = expression.exec(index.text);
          continue;
        }
        matches.push({
          start,
          end,
          text: match[0],
          range,
          node: startSegment.node,
          offset: startOffset,
        });
        match = expression.exec(index.text);
      }
      return matches;
    }

    function loadHistory() {
      try {
        const raw = window.localStorage.getItem(HISTORY_KEY);
        if (raw === null) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        const seen = new Set();
        const result = [];
        for (const item of parsed) {
          if (typeof item !== 'string' || item.length === 0 || seen.has(item)) continue;
          seen.add(item);
          result.push(item);
          if (result.length >= HISTORY_LIMIT) break;
        }
        return result;
      } catch {
        return [];
      }
    }

    function saveHistory(history) {
      try {
        window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
      } catch {
        // A blocked or full localStorage leaves history in memory for this run.
      }
    }

    class FindController {
      constructor(translate) {
        this.translate = translate;
        this.listeners = new Set();
        this.isOpen = false;
        this.query = '';
        this.caseSensitive = false;
        this.wholeWord = false;
        this.total = 0;
        this.activeIndex = -1;
        this.matches = [];
        this.anchor = null;
        this.index = null;
        this.indexDirty = true;
        this.root = null;
        this.scroller = null;
        this.history = loadHistory();
        this.historyIndex = -1;
        this.draft = '';
        this.focusToken = 0;
        this.shakeToken = 0;
        this.noResults = false;
        this.searchComplete = false;
        this.anchorTop = 72;
        this.anchorRight = 24;
        this.button = null;
        this.buttonObserver = null;
        this.sessionId = undefined;
        this.returnFocus = null;
        this.pendingTimer = null;
        this.pending = null;
        this.pendingNavigation = 0;
        this.observer = null;
        this.disposed = false;
        this.snapshot = this.buildSnapshot();
        this.subscribe = (listener) => {
          this.listeners.add(listener);
          return () => {
            this.listeners.delete(listener);
          };
        };
        this.getSnapshot = () => this.snapshot;
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onResize = this.onResize.bind(this);
      }

      buildSnapshot() {
        return {
          open: this.isOpen,
          query: this.query,
          caseSensitive: this.caseSensitive,
          wholeWord: this.wholeWord,
          total: this.total,
          activeIndex: this.activeIndex,
          noResults: this.noResults,
          focusToken: this.focusToken,
          shakeToken: this.shakeToken,
          anchorTop: this.anchorTop,
          anchorRight: this.anchorRight,
        };
      }

      publish() {
        if (this.disposed) return;
        const next = this.buildSnapshot();
        const previous = this.snapshot;
        let changed = false;
        for (const key of Object.keys(next)) {
          if (!Object.is(next[key], previous[key])) {
            changed = true;
            break;
          }
        }
        if (!changed) return;
        this.snapshot = next;
        for (const listener of Array.from(this.listeners)) {
          try {
            listener();
          } catch {
            // A disposed subscriber must not break the other subscribers.
          }
        }
      }

      start() {
        window.addEventListener('keydown', this.onKeyDown, true);
        window.addEventListener('resize', this.onResize, { passive: true });
      }

      dispose() {
        this.disposed = true;
        window.removeEventListener('keydown', this.onKeyDown, true);
        window.removeEventListener('resize', this.onResize);
        this.cancelPending();
        this.disconnectObserver();
        this.clearHighlights();
        this.matches = [];
        this.index = null;
        this.root = null;
        this.button = null;
        if (this.buttonObserver !== null) {
          this.buttonObserver.disconnect();
          this.buttonObserver = null;
        }
        this.listeners.clear();
      }

      attachButton(element) {
        this.button = element;
        if (this.buttonObserver !== null) {
          this.buttonObserver.disconnect();
          this.buttonObserver = null;
        }
        if (typeof ResizeObserver === 'function' && element !== null) {
          this.buttonObserver = new ResizeObserver(() => {
            if (this.isOpen) this.measureAnchor();
          });
          this.buttonObserver.observe(element);
        }
        if (this.isOpen) this.measureAnchor();
      }

      detachButton(element) {
        if (this.button !== element) return;
        this.button = null;
        if (this.buttonObserver !== null) {
          this.buttonObserver.disconnect();
          this.buttonObserver = null;
        }
      }

      setSession(sessionId) {
        if (this.sessionId !== undefined && this.sessionId !== sessionId && this.isOpen) {
          this.close({ restoreFocus: false });
        }
        this.sessionId = sessionId;
      }

      open(navigateDelta) {
        if (this.disposed) return false;
        if (findScrollElement() === null) return false;
        if (!this.isOpen) {
          const active = document.activeElement;
          this.returnFocus = active instanceof HTMLElement ? active : null;
          this.isOpen = true;
          this.historyIndex = -1;
          this.draft = this.query;
          this.focusToken += 1;
          this.observe();
          this.measureAnchor();
          this.publish();
          this.queueSearch({
            delay: 0,
            reveal: true,
            preserve: true,
            shake: true,
          });
        } else {
          this.focusToken += 1;
          this.measureAnchor();
          this.publish();
          this.queueSearch({
            delay: 0,
            reveal: true,
            preserve: true,
            shake: false,
          });
        }
        if (navigateDelta) this.pendingNavigation = navigateDelta;
        return true;
      }

      close(options = {}) {
        if (!this.isOpen) return;
        this.commitHistory();
        this.isOpen = false;
        this.historyIndex = -1;
        this.draft = this.query;
        this.cancelPending();
        this.disconnectObserver();
        this.clearSearch();
        this.indexDirty = true;
        this.index = null;
        this.root = null;
        this.scroller = null;
        this.publish();
        const target = this.returnFocus;
        this.returnFocus = null;
        if (options.restoreFocus !== false && target !== null && target.isConnected) {
          requestAnimationFrame(() => {
            target.focus({ preventScroll: true });
          });
        }
      }

      clearSearch() {
        this.matches = [];
        this.total = 0;
        this.activeIndex = -1;
        this.anchor = null;
        this.noResults = false;
        this.searchComplete = false;
        this.clearHighlights();
      }

      onResize() {
        if (this.isOpen) this.measureAnchor();
      }

      measureAnchor() {
        const width = Math.min(460, Math.max(240, window.innerWidth - 24));
        let top = 72;
        let right = 24;
        const button = this.button !== null && this.button.isConnected
          ? this.button
          : document.querySelector(`[${TRIGGER_ATTR}]`);
        if (button !== null) {
          const rect = button.getBoundingClientRect();
          top = rect.bottom + 8;
          let ancestor = button.parentElement;
          let headerBottom = 0;
          while (ancestor !== null && ancestor !== document.body) {
            const box = ancestor.getBoundingClientRect();
            if (box.width > 300
              && box.height > 0
              && box.height <= 180
              && box.bottom >= rect.bottom
              && box.bottom <= window.innerHeight) {
              headerBottom = Math.max(headerBottom, box.bottom);
            }
            ancestor = ancestor.parentElement;
          }
          if (headerBottom > 0) top = Math.max(top, headerBottom + 8);
          right = window.innerWidth - rect.right;
        }
        const maxRight = Math.max(12, window.innerWidth - width - 12);
        right = Math.max(12, Math.min(right, maxRight));
        top = Math.max(12, Math.min(top, Math.max(12, window.innerHeight - 64)));
        this.anchorTop = Math.round(top);
        this.anchorRight = Math.round(right);
        this.publish();
      }

      onKeyDown(event) {
        if (this.disposed) return;
        if (event.isComposing && event.key !== 'Escape' && event.key !== 'Esc') return;
        const key = event.key;
        const modifier = event.metaKey || event.ctrlKey;
        const plainModifier = modifier && !event.altKey && !event.shiftKey;

        if (plainModifier && (key === 'f' || key === 'F')) {
          if (findScrollElement() === null) return;
          event.preventDefault();
          event.stopImmediatePropagation();
          this.open(0);
          return;
        }

        if (key === 'Escape' || key === 'Esc') {
          if (!this.isOpen) return;
          event.preventDefault();
          event.stopImmediatePropagation();
          this.close();
          return;
        }

        if (key === 'F3') {
          if (findScrollElement() === null) return;
          event.preventDefault();
          event.stopImmediatePropagation();
          const delta = event.shiftKey ? -1 : 1;
          if (this.isOpen) this.navigate(delta);
          else this.open(delta);
          return;
        }

        if (modifier && !event.altKey && (key === 'g' || key === 'G')) {
          if (findScrollElement() === null) return;
          event.preventDefault();
          event.stopImmediatePropagation();
          const delta = event.shiftKey ? -1 : 1;
          if (this.isOpen) this.navigate(delta);
          else this.open(delta);
        }
      }

      setQuery(value) {
        if (value === this.query && this.historyIndex === -1) return;
        this.query = value;
        this.historyIndex = -1;
        this.draft = value;
        this.activeIndex = -1;
        this.anchor = null;
        this.noResults = false;
        this.searchComplete = false;
        this.publish();
        this.queueSearch({
          delay: 0,
          reveal: true,
          preserve: false,
          shake: true,
        });
      }

      applyHistoryQuery(value) {
        this.query = value;
        this.activeIndex = -1;
        this.anchor = null;
        this.noResults = false;
        this.searchComplete = false;
        this.publish();
        this.queueSearch({
          delay: 0,
          reveal: true,
          preserve: false,
          shake: true,
        });
      }

      historyPrevious() {
        if (this.history.length === 0) return;
        if (this.historyIndex === -1) this.draft = this.query;
        const next = Math.min(this.historyIndex + 1, this.history.length - 1);
        if (next === this.historyIndex) return;
        this.historyIndex = next;
        this.applyHistoryQuery(this.history[next]);
      }

      historyNext() {
        if (this.historyIndex === -1) return;
        if (this.historyIndex === 0) {
          this.historyIndex = -1;
          this.applyHistoryQuery(this.draft);
          return;
        }
        this.historyIndex -= 1;
        this.applyHistoryQuery(this.history[this.historyIndex]);
      }

      commitHistory() {
        const value = this.query;
        if (value.length === 0) return;
        this.history = [
          value,
          ...this.history.filter((item) => item !== value),
        ].slice(0, HISTORY_LIMIT);
        saveHistory(this.history);
        this.historyIndex = -1;
        this.draft = value;
      }

      toggleCaseSensitive() {
        this.caseSensitive = !this.caseSensitive;
        this.anchor = null;
        this.activeIndex = -1;
        this.publish();
        this.queueSearch({
          delay: 0,
          reveal: true,
          preserve: false,
          shake: true,
        });
      }

      toggleWholeWord() {
        this.wholeWord = !this.wholeWord;
        this.anchor = null;
        this.activeIndex = -1;
        this.publish();
        this.queueSearch({
          delay: 0,
          reveal: true,
          preserve: false,
          shake: true,
        });
      }

      navigate(delta) {
        if (!this.isOpen) {
          this.open(delta);
          return;
        }
        if (this.query.length === 0) {
          this.focusToken += 1;
          this.publish();
          return;
        }
        if (!this.searchComplete) {
          this.pendingNavigation = delta;
          this.queueSearch({
            delay: 0,
            reveal: true,
            preserve: true,
            shake: false,
          });
          return;
        }
        if (this.total === 0) {
          this.shakeToken += 1;
          this.publish();
          return;
        }
        let index;
        if (this.activeIndex < 0 || this.activeIndex >= this.total) {
          index = delta > 0 ? 0 : this.total - 1;
        } else {
          index = (this.activeIndex + delta + this.total) % this.total;
        }
        this.activeIndex = index;
        this.anchor = this.anchorFor(this.matches[index]);
        this.updateHighlights();
        this.publish();
        this.revealMatch(this.matches[index]);
        this.commitHistory();
      }

      anchorFor(match) {
        if (!match) return null;
        return {
          node: match.node,
          offset: match.offset,
          text: match.text,
        };
      }

      locateAnchor(matches) {
        const anchor = this.anchor;
        if (anchor === null) return -1;
        let exact = -1;
        let sameNode = -1;
        let closest = Infinity;
        for (let index = 0; index < matches.length; index += 1) {
          const match = matches[index];
          if (match.node !== anchor.node) continue;
          if (match.offset === anchor.offset && match.text === anchor.text) {
            exact = index;
          }
          const distance = Math.abs(match.offset - anchor.offset);
          if (distance < closest) {
            closest = distance;
            sameNode = index;
          }
        }
        return exact >= 0 ? exact : sameNode;
      }

      queueSearch(options) {
        const previous = this.pending;
        this.pending = {
          delay: previous === null
            ? options.delay
            : Math.min(previous.delay, options.delay),
          reveal: Boolean((previous && previous.reveal) || options.reveal),
          preserve: previous === null
            ? options.preserve !== false
            : previous.preserve && options.preserve !== false,
          shake: Boolean((previous && previous.shake) || options.shake),
        };
        if (this.pendingTimer !== null) clearTimeout(this.pendingTimer);
        this.pendingTimer = setTimeout(() => {
          this.pendingTimer = null;
          const pending = this.pending;
          this.pending = null;
          if (pending !== null) this.runSearch(pending);
        }, this.pending.delay);
      }

      cancelPending() {
        if (this.pendingTimer !== null) {
          clearTimeout(this.pendingTimer);
          this.pendingTimer = null;
        }
        this.pending = null;
      }

      runSearch(pending) {
        if (!this.isOpen || this.disposed) return;
        this.scroller = findScrollElement();
        if (this.scroller === null) {
          this.pendingNavigation = 0;
          this.clearSearch();
          this.publish();
          this.close({ restoreFocus: false });
          return;
        }
        if (this.query.length === 0) {
          this.pendingNavigation = 0;
          this.clearSearch();
          this.publish();
          return;
        }
        const flow = findFlow(this.scroller);
        if (this.root !== flow || this.index === null || this.indexDirty) {
          this.root = flow;
          this.index = buildIndex(flow);
          this.indexDirty = false;
        }
        const matches = findMatches(
          this.index,
          this.query,
          this.caseSensitive,
          this.wholeWord,
        );
        this.matches = matches;
        this.total = matches.length;
        let active = -1;
        if (pending.preserve && this.anchor !== null) {
          active = this.locateAnchor(matches);
        }
        if (active < 0 && (this.anchor === null || !pending.preserve)) {
          active = matches.length > 0 ? 0 : -1;
        }
        if (active < 0 && matches.length > 0) {
          active = Math.min(Math.max(this.activeIndex, 0), matches.length - 1);
        }
        this.activeIndex = active;
        this.anchor = active >= 0 ? this.anchorFor(matches[active]) : null;
        this.searchComplete = true;
        this.noResults = this.query.length > 0 && this.total === 0;
        this.updateHighlights();
        if (pending.shake && this.noResults) this.shakeToken += 1;
        this.publish();
        const navigation = this.pendingNavigation;
        this.pendingNavigation = 0;
        if (navigation !== 0) {
          this.navigate(navigation);
        } else if (pending.reveal && active >= 0) {
          this.revealMatch(matches[active]);
        }
      }

      revealMatch(match) {
        if (!match || !match.range.startContainer.isConnected) return;
        const scroller = this.scroller !== null ? this.scroller : findScrollElement();
        if (scroller === null) return;
        let rect;
        try {
          const rects = match.range.getClientRects();
          rect = rects.length > 0 ? rects[0] : match.range.getBoundingClientRect();
        } catch {
          return;
        }
        if (!rect || (rect.width === 0 && rect.height === 0)) return;
        const box = scroller.getBoundingClientRect();
        const margin = 16;
        if (rect.top >= box.top + margin && rect.bottom <= box.bottom - margin) return;
        const target = scroller.scrollTop
          + (rect.top - box.top)
          - (box.height - rect.height) / 2;
        const max = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
        scroller.scrollTo({
          top: Math.max(0, Math.min(max, target)),
          behavior: 'auto',
        });
      }

      updateHighlights() {
        const registry = window.CSS && window.CSS.highlights;
        if (!registry) return;
        registry.delete(ALL_HIGHLIGHT);
        registry.delete(ACTIVE_HIGHLIGHT);
        if (this.matches.length === 0 || typeof window.Highlight !== 'function') return;
        registry.set(ALL_HIGHLIGHT, new window.Highlight(
          ...this.matches.map((match) => match.range),
        ));
        const active = this.matches[this.activeIndex];
        if (active) {
          registry.set(ACTIVE_HIGHLIGHT, new window.Highlight(active.range));
        }
      }

      clearHighlights() {
        const registry = window.CSS && window.CSS.highlights;
        if (!registry) return;
        registry.delete(ALL_HIGHLIGHT);
        registry.delete(ACTIVE_HIGHLIGHT);
      }

      observe() {
        if (this.observer !== null || document.body === null) return;
        this.observer = new MutationObserver((records) => {
          let relevant = false;
          for (const record of records) {
            let target = record.target;
            if (target.nodeType === Node.TEXT_NODE) target = target.parentElement;
            if (!(target instanceof Element)) continue;
            if (target.closest(`[${PANEL_ATTR}]`) !== null) continue;
            if (this.root === null || !this.root.isConnected) {
              relevant = true;
              break;
            }
            if (this.root.contains(target) || target.contains(this.root)) {
              relevant = true;
              break;
            }
          }
          if (!relevant) return;
          this.indexDirty = true;
          this.queueSearch({
            delay: 140,
            reveal: false,
            preserve: true,
            shake: false,
          });
        });
        this.observer.observe(document.body, {
          childList: true,
          subtree: true,
          characterData: true,
        });
      }

      disconnectObserver() {
        if (this.observer !== null) {
          this.observer.disconnect();
          this.observer = null;
        }
      }
    }

    function icon(paths, size) {
      return h('svg', {
        viewBox: '0 0 16 16',
        width: size || 15,
        height: size || 15,
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.6,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': 'true',
        focusable: 'false',
      }, paths.map((path, index) => h('path', { key: index, d: path })));
    }

    function searchIcon() {
      return h('svg', {
        viewBox: '0 0 16 16',
        width: 15,
        height: 15,
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.6,
        strokeLinecap: 'round',
        'aria-hidden': 'true',
        focusable: 'false',
      }, [
        h('circle', { key: 'circle', cx: 7, cy: 7, r: 4.3 }),
        h('path', { key: 'handle', d: 'M10.2 10.2 14 14' }),
      ]);
    }

    const chevronUp = () => icon(['M4 10l4-4 4 4']);
    const chevronDown = () => icon(['M4 6l4 4 4-4']);
    const closeIcon = () => icon(['M4 4l8 8', 'M12 4l-8 8']);

    function FindTrigger({ controller, sessionId }) {
      const buttonRef = useRef(null);
      useLayoutEffect(() => {
        const button = buttonRef.current;
        controller.attachButton(button);
        return () => controller.detachButton(button);
      }, [controller]);
      useEffect(() => {
        if (sessionId !== undefined) controller.setSession(sessionId);
      }, [controller, sessionId]);
      const state = useSyncExternalStore(
        controller.subscribe,
        controller.getSnapshot,
        controller.getSnapshot,
      );
      const t = controller.translate;
      return h('button', {
        ref: buttonRef,
        type: 'button',
        className: 'dsh-chat-find-trigger',
        'data-dsh-chat-find-button': '',
        'data-open': state.open ? 'true' : undefined,
        'aria-label': t('button'),
        'aria-keyshortcuts': 'Control+F Meta+F',
        'aria-expanded': state.open ? 'true' : 'false',
        'aria-controls': PANEL_ID,
        title: t('buttonTitle'),
        onClick: () => controller.open(),
      }, searchIcon());
    }

    function FindPanel({ controller }) {
      const state = useSyncExternalStore(
        controller.subscribe,
        controller.getSnapshot,
        controller.getSnapshot,
      );
      const t = controller.translate;
      const inputRef = useRef(null);
      const panelRef = useRef(null);

      useEffect(() => {
        if (!state.open) return;
        const input = inputRef.current;
        if (input === null) return;
        input.focus({ preventScroll: true });
        input.select();
      }, [state.open, state.focusToken]);

      useEffect(() => {
        if (state.shakeToken === 0) return;
        const panel = panelRef.current;
        if (panel === null) return;
        panel.classList.remove('dsh-chat-find-shake');
        void panel.offsetWidth;
        panel.classList.add('dsh-chat-find-shake');
      }, [state.shakeToken]);

      if (!state.open) return null;

      const current = state.total > 0 && state.activeIndex >= 0
        ? state.activeIndex + 1
        : 0;
      const countLabel = state.noResults
        ? t('noResults')
        : t('matchCount', { current, total: state.total });
      const noResults = state.noResults;

      const onInputKeyDown = (event) => {
        if (event.nativeEvent && event.nativeEvent.isComposing) return;
        if (event.key === 'Enter') {
          event.preventDefault();
          event.stopPropagation();
          controller.navigate(event.shiftKey ? -1 : 1);
          return;
        }
        if (event.key === 'ArrowUp') {
          event.preventDefault();
          event.stopPropagation();
          controller.historyPrevious();
          return;
        }
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          event.stopPropagation();
          controller.historyNext();
        }
      };

      const keepFocus = (event) => {
        event.preventDefault();
      };

      return h('div', {
        ref: panelRef,
        id: PANEL_ID,
        className: 'dsh-chat-find-panel',
        'data-dsh-chat-find': '',
        'data-no-results': noResults ? 'true' : 'false',
        role: 'search',
        'aria-label': t('label'),
        style: {
          top: state.anchorTop,
          right: state.anchorRight,
        },
      }, [
        h('span', {
          key: 'icon',
          className: 'dsh-chat-find-search-icon',
          'aria-hidden': 'true',
        }, searchIcon()),
        h('input', {
          key: 'input',
          ref: inputRef,
          className: 'dsh-chat-find-input',
          type: 'text',
          value: state.query,
          placeholder: t('placeholder'),
          'aria-label': t('label'),
          'aria-describedby': `${PANEL_ID}-count`,
          autoComplete: 'off',
          autoCorrect: 'off',
          autoCapitalize: 'off',
          spellCheck: false,
          onChange: (event) => controller.setQuery(event.target.value),
          onKeyDown: onInputKeyDown,
        }),
        h('span', {
          key: 'count',
          id: `${PANEL_ID}-count`,
          className: 'dsh-chat-find-count',
          'data-empty': noResults ? 'true' : 'false',
          'aria-live': 'polite',
          'aria-label': countLabel,
          title: countLabel,
        }, `${current}/${state.total}`),
        h('button', {
          key: 'case',
          type: 'button',
          className: 'dsh-chat-find-button dsh-chat-find-toggle',
          'data-active': state.caseSensitive ? 'true' : 'false',
          'aria-pressed': state.caseSensitive ? 'true' : 'false',
          'aria-label': t('matchCase'),
          title: t('matchCase'),
          onMouseDown: keepFocus,
          onClick: () => controller.toggleCaseSensitive(),
        }, 'Aa'),
        h('button', {
          key: 'word',
          type: 'button',
          className: 'dsh-chat-find-button dsh-chat-find-toggle',
          'data-active': state.wholeWord ? 'true' : 'false',
          'aria-pressed': state.wholeWord ? 'true' : 'false',
          'aria-label': t('wholeWord'),
          title: t('wholeWord'),
          onMouseDown: keepFocus,
          onClick: () => controller.toggleWholeWord(),
        }, 'ab'),
        h('span', {
          key: 'separator',
          className: 'dsh-chat-find-separator',
          'aria-hidden': 'true',
        }),
        h('button', {
          key: 'previous',
          type: 'button',
          className: 'dsh-chat-find-button',
          'data-disabled': state.total === 0 ? 'true' : 'false',
          'aria-label': t('previous'),
          'aria-keyshortcuts': 'Shift+Enter Shift+F3 Control+Shift+G Meta+Shift+G',
          title: t('previous'),
          onMouseDown: keepFocus,
          onClick: () => controller.navigate(-1),
        }, chevronUp()),
        h('button', {
          key: 'next',
          type: 'button',
          className: 'dsh-chat-find-button',
          'data-disabled': state.total === 0 ? 'true' : 'false',
          'aria-label': t('next'),
          'aria-keyshortcuts': 'Enter F3 Control+G Meta+G',
          title: t('next'),
          onMouseDown: keepFocus,
          onClick: () => controller.navigate(1),
        }, chevronDown()),
        h('button', {
          key: 'close',
          type: 'button',
          className: 'dsh-chat-find-button',
          'aria-label': t('close'),
          'aria-keyshortcuts': 'Escape',
          title: t('close'),
          onClick: () => controller.close(),
        }, closeIcon()),
      ]);
    }

    function apply(ctx) {
      const t = ctx.locale.bind(NS);
      ctx.effect(
        () => ctx.locale.register(NS, { zh, en }),
        'dsh-chat-find: dictionaries',
      );
      ctx.effect(() => {
        const tag = document.createElement('style');
        tag.dataset.dshChatFindStyle = '';
        tag.textContent = CSS;
        document.head.appendChild(tag);
        return () => {
          tag.remove();
        };
      }, 'dsh-chat-find: styles');

      const controller = new FindController(t);
      ctx.effect(() => {
        controller.start();
        return () => controller.dispose();
      }, 'dsh-chat-find: controller');

      const PanelEntry = () => h(FindPanel, { controller });
      const TriggerEntry = (props) => h(FindTrigger, {
        controller,
        sessionId: props.sessionId,
      });

      ctx.slots.inject('shell.overlay', () => ctx.slots.register({
        name: 'shell.overlay',
        id: 'chat-find.panel',
        order: 60,
      }, PanelEntry));

      ctx.slots.inject('conversation.session.header.utilities', () => ctx.slots.register({
        name: 'conversation.session.header.utilities',
        id: 'chat-find',
        order: 10,
        label: () => t('button'),
      }, TriggerEntry));
    }

    return {
      inject: ['slots', 'locale'],
      apply,
    };
  },
});
