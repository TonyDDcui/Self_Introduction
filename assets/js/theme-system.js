/**
 * 主题系统 - 浅色/深色模式完美适配
 */

(function () {
  'use strict';

  const THEMES = {
    dark: {
      bg: '#0d1117',
      bgSecondary: '#161b22',
      card: 'rgba(255, 255, 255, 0.03)',
      cardHover: 'rgba(255, 255, 255, 0.06)',
      border: 'rgba(255, 255, 255, 0.08)',
      borderHover: 'rgba(88, 166, 255, 0.2)',
      text: '#e6edf3',
      textSecondary: '#c9d1d9',
      textMuted: '#8b949e',
      accent: '#58a6ff',
      accentSecondary: '#a371f7',
      inputBg: 'rgba(255, 255, 255, 0.05)',
      inputBorder: 'rgba(255, 255, 255, 0.1)',
      shadow: 'rgba(0, 0, 0, 0.3)',
      code: 'rgba(255, 255, 255, 0.1)',
      scrollbar: 'rgba(88, 166, 255, 0.3)',
    },
    light: {
      bg: '#ffffff',
      bgSecondary: '#f6f8fa',
      card: 'rgba(0, 0, 0, 0.02)',
      cardHover: 'rgba(0, 0, 0, 0.04)',
      border: 'rgba(0, 0, 0, 0.08)',
      borderHover: 'rgba(9, 105, 218, 0.2)',
      text: '#1f2328',
      textSecondary: '#57606a',
      textMuted: '#6e7681',
      accent: '#0969da',
      accentSecondary: '#8250df',
      inputBg: 'rgba(0, 0, 0, 0.04)',
      inputBorder: 'rgba(0, 0, 0, 0.1)',
      shadow: 'rgba(0, 0, 0, 0.08)',
      code: 'rgba(0, 0, 0, 0.06)',
      scrollbar: 'rgba(9, 105, 218, 0.3)',
    }
  };

  function init() {
    applyTheme();
    injectStyles();
    bindEvents();
    observeTheme();
  }

  function getCurrentTheme() {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function applyTheme() {
    const theme = getCurrentTheme();
    const c = THEMES[theme];

    document.documentElement.setAttribute('data-theme', theme);

    // 设置 CSS 变量
    Object.entries(c).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value);
    });

    // 设置 meta theme-color
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.content = c.bg;
  }

  function toggleTheme() {
    const current = getCurrentTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', next);
    applyTheme();
  }

  function bindEvents() {
    const themeBtn = document.getElementById('theme-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleTheme();
      });
    }

    // 主题选项
    document.querySelectorAll('.theme-option').forEach(btn => {
      btn.addEventListener('click', function() {
        const mode = this.dataset.mode;
        if (mode === 'system') {
          localStorage.removeItem('theme');
        } else {
          localStorage.setItem('theme', mode);
        }
        applyTheme();
        document.querySelectorAll('.theme-option').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
      });
    });
  }

  function observeTheme() {
    // 监听系统主题变化
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (!localStorage.getItem('theme')) {
        applyTheme();
      }
    });

    // 监听 DOM 变化（动态加载的元素）
    const observer = new MutationObserver(() => applyTheme());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }

  function injectStyles() {
    if (document.getElementById('theme-system-css')) return;
    const s = document.createElement('style');
    s.id = 'theme-system-css';
    s.textContent = `
      /* ════════════════════════════════════
         CSS 变量定义
      ════════════════════════════════════ */
      :root {
        --bg: #0d1117;
        --bg-secondary: #161b22;
        --card: rgba(255, 255, 255, 0.03);
        --card-hover: rgba(255, 255, 255, 0.06);
        --border: rgba(255, 255, 255, 0.08);
        --border-hover: rgba(88, 166, 255, 0.2);
        --text-primary: #e6edf3;
        --text-secondary: #c9d1d9;
        --text-muted: #8b949e;
        --accent: #58a6ff;
        --accent-secondary: #a371f7;
        --input-bg: rgba(255, 255, 255, 0.05);
        --input-border: rgba(255, 255, 255, 0.1);
        --shadow: rgba(0, 0, 0, 0.3);
        --code-bg: rgba(255, 255, 255, 0.1);
        --scrollbar: rgba(88, 166, 255, 0.3);
      }

      /* ════════════════════════════════════
         深色模式
      ════════════════════════════════════ */
      [data-theme="dark"] {
        --bg: #0d1117;
        --bg-secondary: #161b22;
        --card: rgba(255, 255, 255, 0.03);
        --card-hover: rgba(255, 255, 255, 0.06);
        --border: rgba(255, 255, 255, 0.08);
        --border-hover: rgba(88, 166, 255, 0.2);
        --text-primary: #e6edf3;
        --text-secondary: #c9d1d9;
        --text-muted: #8b949e;
        --accent: #58a6ff;
        --accent-secondary: #a371f7;
        --input-bg: rgba(255, 255, 255, 0.05);
        --input-border: rgba(255, 255, 255, 0.1);
        --shadow: rgba(0, 0, 0, 0.3);
        --code-bg: rgba(255, 255, 255, 0.1);
        --scrollbar: rgba(88, 166, 255, 0.3);
      }

      /* ════════════════════════════════════
         浅色模式
      ════════════════════════════════════ */
      [data-theme="light"] {
        --bg: #ffffff;
        --bg-secondary: #f6f8fa;
        --card: rgba(0, 0, 0, 0.02);
        --card-hover: rgba(0, 0, 0, 0.04);
        --border: rgba(0, 0, 0, 0.08);
        --border-hover: rgba(9, 105, 218, 0.2);
        --text-primary: #1f2328;
        --text-secondary: #57606a;
        --text-muted: #6e7681;
        --accent: #0969da;
        --accent-secondary: #8250df;
        --input-bg: rgba(0, 0, 0, 0.04);
        --input-border: rgba(0, 0, 0, 0.1);
        --shadow: rgba(0, 0, 0, 0.08);
        --code-bg: rgba(0, 0, 0, 0.06);
        --scrollbar: rgba(9, 105, 218, 0.3);
      }

      /* ════════════════════════════════════
         基础样式
      ════════════════════════════════════ */
      html {
        scroll-behavior: smooth;
        scroll-padding-top: 70px;
      }

      body {
        background: var(--bg);
        color: var(--text-primary);
        transition: background 0.3s ease, color 0.3s ease;
        min-height: 100vh;
      }

      /* ════════════════════════════════════
         背景色适配
      ════════════════════════════════════ */
      #particle-canvas,
      .particle-canvas,
      canvas#particle-canvas {
        background: var(--bg) !important;
      }

      .github-header,
      header,
      .header {
        background: var(--bg-secondary);
        border-bottom: 1px solid var(--border);
      }

      section,
      .section {
        background: var(--bg);
      }

      /* ════════════════════════════════════
         卡片样式
      ════════════════════════════════════ */
      .card,
      .section-card,
      [class*="card"] {
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 16px;
        transition: all 0.25s ease;
      }

      .card:hover,
      .section-card:hover {
        background: var(--card-hover);
        border-color: var(--border-hover);
        box-shadow: 0 4px 20px var(--shadow);
      }

      /* ════════════════════════════════════
         文字颜色
      ════════════════════════════════════ */
      h1, h2, h3, h4, h5, h6 { color: var(--text-primary); }
      p, li, td, th { color: var(--text-secondary); }
      small, .hint, .muted { color: var(--text-muted); }
      a { color: var(--accent); }
      a:hover { color: var(--accent-secondary); }

      /* ════════════════════════════════════
         输入框
      ════════════════════════════════════ */
      input,
      textarea,
      select {
        background: var(--input-bg);
        border: 1px solid var(--input-border);
        color: var(--text-primary);
      }

      input:focus,
      textarea:focus,
      select:focus {
        border-color: var(--accent);
        box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.2);
      }

      input::placeholder,
      textarea::placeholder {
        color: var(--text-muted);
      }

      /* ════════════════════════════════════
         滚动条
      ════════════════════════════════════ */
      ::-webkit-scrollbar { width: 8px; height: 8px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb {
        background: var(--scrollbar);
        border-radius: 4px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: var(--accent);
      }

      /* ════════════════════════════════════
         代码块
      ════════════════════════════════════ */
      code, pre {
        background: var(--code-bg);
        border-radius: 6px;
      }

      /* ════════════════════════════════════
         移动端优化
      ════════════════════════════════════ */
      @media (max-width: 768px) {
        /* 标题字号 */
        h1 { font-size: 1.8rem !important; }
        h2 { font-size: 1.5rem !important; }
        h3 { font-size: 1.25rem !important; }
        h4 { font-size: 1.1rem !important; }

        /* 段落 */
        p { font-size: 0.95rem !important; line-height: 1.7 !important; }

        /* 区块间距 */
        section, .section {
          padding: 40px 16px !important;
          margin: 0 !important;
        }

        /* 卡片 */
        .card, .section-card {
          padding: 14px !important;
          margin-bottom: 10px !important;
          border-radius: 14px !important;
        }

        /* 列表 */
        ul, ol {
          padding-left: 20px !important;
        }

        li {
          font-size: 0.9rem !important;
          margin-bottom: 6px !important;
        }

        /* 图片 */
        img {
          max-width: 100%;
          height: auto;
          border-radius: 12px;
        }

        /* 网格改单列 */
        .grid, .row, [class*="grid-"] {
          display: flex !important;
          flex-direction: column !important;
          gap: 10px !important;
        }

        /* Header */
        .github-header, header {
          padding: 10px 12px !important;
        }

        .header-search {
          display: none !important;
        }

        .brand-link {
          font-size: 1.1rem !important;
        }
      }

      /* 超小屏幕 */
      @media (max-width: 480px) {
        h1 { font-size: 1.6rem !important; }
        h2 { font-size: 1.3rem !important; }
        h3 { font-size: 1.1rem !important; }

        section, .section {
          padding: 32px 12px !important;
        }

        .card, .section-card {
          padding: 12px !important;
          border-radius: 12px !important;
        }

        input, textarea {
          padding: 10px 12px !important;
          font-size: 14px !important;
        }
      }

      /* 安全区域 */
      @supports (padding: env(safe-area-inset-bottom)) {
        body {
          padding-left: env(safe-area-inset-left);
          padding-right: env(safe-area-inset-right);
          padding-bottom: env(safe-area-inset-bottom);
        }
      }

      /* 减少动画 */
      @media (prefers-reduced-motion: reduce) {
        * {
          animation-duration: 0.01ms !important;
          transition-duration: 0.01ms !important;
        }
      }
    `;
    document.head.appendChild(s);
  }

  /* 启动 */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
