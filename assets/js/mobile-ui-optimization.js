/**
 * 移动端 UI 全面优化
 * 响应式设计 + 浅色暗色模式适配
 */

(function () {
  'use strict';

  function init() {
    injectStyles();
    optimizeMobile();
    observeTheme();
  }

  function getThemeColors() {
    const isDark = !document.documentElement.hasAttribute('data-theme') ||
                   document.documentElement.getAttribute('data-theme') === 'dark' ||
                   window.matchMedia('(prefers-color-scheme: dark)').matches;

    return isDark ? {
      bg: '#0d1117',
      card: 'rgba(255,255,255,0.03)',
      cardBorder: 'rgba(255,255,255,0.08)',
      text: '#e6edf3',
      textSecondary: '#c9d1d9',
      textMuted: '#8b949e',
      accent: '#58a6ff',
      accentSecondary: '#a371f7',
      inputBg: 'rgba(255,255,255,0.05)',
      inputBorder: 'rgba(255,255,255,0.1)',
      shadow: 'rgba(0,0,0,0.3)'
    } : {
      bg: '#ffffff',
      card: 'rgba(0,0,0,0.02)',
      cardBorder: 'rgba(0,0,0,0.06)',
      text: '#1f2328',
      textSecondary: '#57606a',
      textMuted: '#6e7681',
      accent: '#0969da',
      accentSecondary: '#8250df',
      inputBg: 'rgba(0,0,0,0.03)',
      inputBorder: 'rgba(0,0,0,0.08)',
      shadow: 'rgba(0,0,0,0.08)'
    };
  }

  function observeTheme() {
    const observer = new MutationObserver(() => injectStyles(true));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => injectStyles(true));
  }

  function injectStyles(forceUpdate = false) {
    if (forceUpdate) {
      const old = document.getElementById('mobile-ui-v2-css');
      if (old) old.remove();
    }
    if (document.getElementById('mobile-ui-v2-css')) return;

    const c = getThemeColors();
    const s = document.createElement('style');
    s.id = 'mobile-ui-v2-css';
    s.textContent = `
      /* ════════════════════════════════════
         基础布局优化
      ════════════════════════════════════ */

      * {
        -webkit-tap-highlight-color: transparent;
        -webkit-font-smoothing: antialiased;
      }

      html {
        scroll-behavior: smooth;
        scroll-padding-top: 60px;
      }

      body {
        background: ${c.bg};
        color: ${c.text};
        transition: background 0.3s ease, color 0.3s ease;
        overflow-x: hidden;
      }

      /* ════════════════════════════════════
         卡片设计
      ════════════════════════════════════ */

      .section-card,
      .card,
      [class*="card"] {
        background: ${c.card};
        border: 1px solid ${c.cardBorder};
        border-radius: 16px;
        transition: all 0.25s ease;
      }

      .section-card:hover,
      .card:hover,
      [class*="card"]:hover {
        border-color: ${c.accent}33;
        box-shadow: 0 4px 20px ${c.shadow}20;
        transform: translateY(-2px);
      }

      /* ════════════════════════════════════
         按钮设计
      ════════════════════════════════════ */

      .btn,
      button {
        border-radius: 10px;
        transition: all 0.2s ease;
        -webkit-user-select: none;
        user-select: none;
      }

      .btn:active,
      button:active {
        transform: scale(0.97);
      }

      .btn-primary,
      .primary-btn {
        background: linear-gradient(135deg, ${c.accent}, ${c.accentSecondary});
        border: none;
        color: white;
        font-weight: 600;
        box-shadow: 0 2px 12px ${c.accent}40;
      }

      .btn-primary:hover,
      .primary-btn:hover {
        box-shadow: 0 4px 20px ${c.accent}50;
        transform: translateY(-1px);
      }

      /* ════════════════════════════════════
         输入框设计
      ════════════════════════════════════ */

      input,
      textarea,
      select {
        background: ${c.inputBg};
        border: 1px solid ${c.inputBorder};
        border-radius: 12px;
        color: ${c.text};
        padding: 12px 14px;
        font-size: 15px;
        transition: all 0.2s ease;
      }

      input:focus,
      textarea:focus,
      select:focus {
        outline: none;
        border-color: ${c.accent};
        box-shadow: 0 0 0 3px ${c.accent}20;
      }

      input::placeholder,
      textarea::placeholder {
        color: ${c.textMuted};
      }

      /* ════════════════════════════════════
         移动端排版
      ════════════════════════════════════ */

      @media (max-width: 768px) {
        /* 标题字号 */
        h1 { font-size: 2rem !important; }
        h2 { font-size: 1.6rem !important; }
        h3 { font-size: 1.3rem !important; }
        h4 { font-size: 1.1rem !important; }

        /* 段落字号 */
        p { font-size: 0.95rem !important; line-height: 1.7 !important; }

        /* 区块间距 */
        section {
          padding: 48px 16px !important;
          margin: 0 !important;
        }

        /* 卡片间距 */
        .section-card,
        .card {
          padding: 16px !important;
          margin-bottom: 12px !important;
          border-radius: 14px !important;
        }

        /* 列表项 */
        li {
          font-size: 0.9rem !important;
          margin-bottom: 8px !important;
        }

        /* 图片响应式 */
        img {
          max-width: 100%;
          height: auto;
        }

        /* 网格布局改为单列 */
        .grid,
        .row,
        [class*="grid-"] {
          display: flex !important;
          flex-direction: column !important;
          gap: 12px !important;
        }

        /* 隐藏桌面端元素 */
        .desktop-only,
        [class*="desktop"] {
          display: none !important;
        }

        /* 显示移动端元素 */
        .mobile-only,
        [class*="mobile"] {
          display: block !important;
        }
      }

      /* ════════════════════════════════════
         超小屏幕优化
      ════════════════════════════════════ */

      @media (max-width: 480px) {
        h1 { font-size: 1.75rem !important; }
        h2 { font-size: 1.4rem !important; }
        h3 { font-size: 1.15rem !important; }

        section {
          padding: 36px 12px !important;
        }

        .section-card,
        .card {
          padding: 14px !important;
          border-radius: 12px !important;
        }

        input,
        textarea {
          padding: 10px 12px !important;
          font-size: 14px !important;
        }
      }

      /* ════════════════════════════════════
         安全区域适配
      ════════════════════════════════════ */

      @supports (padding: env(safe-area-inset-bottom)) {
        body {
          padding-left: env(safe-area-inset-left);
          padding-right: env(safe-area-inset-right);
          padding-bottom: env(safe-area-inset-bottom);
        }

        #bottom-nav,
        #hb-panel {
          padding-bottom: calc(8px + env(safe-area-inset-bottom));
        }
      }

      /* ════════════════════════════════════
         滚动条美化
      ════════════════════════════════════ */

      ::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }

      ::-webkit-scrollbar-track {
        background: transparent;
      }

      ::-webkit-scrollbar-thumb {
        background: ${c.accent}40;
        border-radius: 3px;
      }

      ::-webkit-scrollbar-thumb:hover {
        background: ${c.accent}60;
      }

      /* ════════════════════════════════════
         加载动画
      ════════════════════════════════════ */

      .loading {
        position: relative;
        overflow: hidden;
      }

      .loading::after {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, ${c.accent}20, transparent);
        animation: shimmer 1.5s infinite;
      }

      @keyframes shimmer {
        100% { left: 100%; }
      }

      /* ════════════════════════════════════
         骨架屏
      ════════════════════════════════════ */

      .skeleton {
        background: linear-gradient(90deg, ${c.card} 25%, ${c.cardBorder} 50%, ${c.card} 75%);
        background-size: 200% 100%;
        animation: skeleton-loading 1.5s infinite;
        border-radius: 8px;
      }

      @keyframes skeleton-loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }

      /* ════════════════════════════════════
         触摸反馈
      ════════════════════════════════════ */

      @media (hover: none) {
        .btn:hover,
        button:hover,
        a:hover {
          transform: none !important;
        }

        .btn:active,
        button:active,
        a:active {
          opacity: 0.8;
          transform: scale(0.98);
        }
      }

      /* ════════════════════════════════════
         动画优化
      ════════════════════════════════════ */

      @media (prefers-reduced-motion: reduce) {
        *,
        *::before,
        *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }

      /* ════════════════════════════════════
         深色主题
      ════════════════════════════════════ */

      [data-theme="dark"] {
        --bg: #0d1117;
        --card: rgba(255,255,255,0.03);
        --border: rgba(255,255,255,0.08);
        --text: #e6edf3;
        --text-secondary: #c9d1d9;
        --text-muted: #8b949e;
        --accent: #58a6ff;
      }

      /* ════════════════════════════════════
         浅色主题
      ════════════════════════════════════ */

      [data-theme="light"] {
        --bg: #ffffff;
        --card: rgba(0,0,0,0.02);
        --border: rgba(0,0,0,0.06);
        --text: #1f2328;
        --text-secondary: #57606a;
        --text-muted: #6e7681;
        --accent: #0969da;
      }
    `;
    document.head.appendChild(s);
  }

  function optimizeMobile() {
    // 禁用双击缩放
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    }, false);

    // 优化滚动
    document.body.style.webkitOverflowScrolling = 'touch';

    // 修复 iOS 输入框问题
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        setTimeout(() => {
          input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      });
    });
  }

  /* ── 启动 ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
