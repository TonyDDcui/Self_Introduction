/**
 * 动态图标系统 - 简约精美的 SVG 动画图标
 * 替换呆板的 emoji 图标
 */

(function () {
  'use strict';

  // 图标配置：key -> { svg, hoverSVG, activeSVG, animate }
  const ICONS = {
    '🏠': {
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
      name: '首页'
    },
    '👤': {
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
      name: '关于'
    },
    '⚡': {
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
      name: '技能',
      pulse: true
    },
    '🚀': {
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>`,
      name: '项目',
      fly: true
    },
    '🏅': {
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>`,
      name: '荣誉'
    },
    '📷': {
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>`,
      name: '生活'
    },
    '💭': {
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
      name: '好句'
    },
    '✍️': {
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>`,
      name: '留言',
      write: true
    },
    '✉️': {
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`,
      name: '联系'
    },
    '☰': {
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`,
      name: '菜单'
    },
    'CZX': {
      svg: `<svg viewBox="0 0 40 40" width="40" height="40"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#58a6ff"/><stop offset="100%" stop-color="#a371f7"/></linearGradient></defs><circle cx="20" cy="20" r="18" fill="url(#g)"/><text x="20" y="26" text-anchor="middle" fill="white" font-family="Inter, sans-serif" font-weight="700" font-size="14">C</text></svg>`,
      name: ''
    }
  };

  let initialized = false;

  function init() {
    if (initialized) return;
    initialized = true;
    injectStyles();
    replaceEmojis();
    observeDOM();
  }

  function getIcon(key) {
    return ICONS[key] || null;
  }

  function replaceEmojis() {
    // 替换导航栏 emoji
    document.querySelectorAll('.hb-nav-item, .toc-link, .nav-link, .bottom-nav-item').forEach(el => {
      Object.keys(ICONS).forEach(key => {
        if (el.textContent.includes(key) || el.innerHTML.includes(key)) {
          const iconData = ICONS[key];
          const iconEl = el.querySelector('.icon, .nav-icon, .hb-icon');
          if (iconEl) {
            iconEl.innerHTML = iconData.svg;
            iconEl.classList.add('animated-icon');
            if (iconData.pulse) iconEl.classList.add('pulse');
            if (iconData.fly) iconEl.classList.add('fly');
            if (iconData.write) iconEl.classList.add('write');
          }
        }
      });
    });

    // 替换页面标题 emoji
    document.querySelectorAll('h1, h2, h3, .section-title').forEach(el => {
      Object.keys(ICONS).forEach(key => {
        if (el.textContent.includes(key)) {
          const iconData = ICONS[key];
          el.innerHTML = el.innerHTML.replace(key, `<span class="title-icon animated-icon">${iconData.svg}</span>`);
        }
      });
    });

    // 替换 GitHub 页面 emoji
    document.querySelectorAll('[class*="github"] .stat-icon, [class*="github"] .skill-icon').forEach(el => {
      if (el.textContent.includes('📊')) {
        el.innerHTML = `<svg class="animated-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>`;
      }
      if (el.textContent.includes('🛠️')) {
        el.innerHTML = `<svg class="animated-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`;
      }
    });
  }

  function observeDOM() {
    const observer = new MutationObserver((mutations) => {
      let shouldReplace = false;
      mutations.forEach(m => {
        if (m.addedNodes.length > 0) shouldReplace = true;
      });
      if (shouldReplace) replaceEmojis();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function injectStyles() {
    if (document.getElementById('animated-icons-css')) return;
    const s = document.createElement('style');
    s.id = 'animated-icons-css';
    s.textContent = `
      /* ── 基础图标样式 ── */
      .animated-icon,
      .title-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 1em;
        height: 1em;
        vertical-align: middle;
      }
      .animated-icon svg,
      .title-icon svg {
        width: 100%;
        height: 100%;
        transition: transform 0.3s ease;
      }

      /* ── 脉冲动画 (技能) ── */
      .animated-icon.pulse svg {
        animation: iconPulse 2s ease-in-out infinite;
      }
      @keyframes iconPulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.15); opacity: 0.8; }
      }

      /* ── 飞行动画 (项目) ── */
      .animated-icon.fly:hover svg {
        animation: iconFly 0.6s ease-in-out;
      }
      @keyframes iconFly {
        0% { transform: translateX(0) rotate(0); }
        25% { transform: translateX(-3px) rotate(-5deg); }
        50% { transform: translateX(3px) rotate(5deg); }
        75% { transform: translateX(-2px) rotate(-3deg); }
        100% { transform: translateX(0) rotate(0); }
      }

      /* ── 书写动画 (留言) ── */
      .animated-icon.write:hover svg {
        animation: iconWrite 0.8s ease-in-out;
      }
      @keyframes iconWrite {
        0% { transform: rotate(0); }
        25% { transform: rotate(-15deg); }
        50% { transform: rotate(15deg); }
        75% { transform: rotate(-10deg); }
        100% { transform: rotate(0); }
      }

      /* ── 导航悬停效果 ── */
      .hb-nav-item:hover .animated-icon svg,
      .nav-link:hover .animated-icon svg,
      .bottom-nav-item:hover .animated-icon svg {
        transform: translateY(-2px) scale(1.1);
      }

      /* ── 标题图标效果 ── */
      .title-icon {
        width: 1.3em;
        height: 1.3em;
        margin-right: 0.3em;
        vertical-align: middle;
      }
      .title-icon svg {
        stroke: currentColor;
        color: currentColor;
      }

      /* ── 活跃状态图标高亮 ── */
      .hb-nav-item.active .animated-icon svg,
      .nav-link.active .animated-icon svg,
      .bottom-nav-item.active .animated-icon svg {
        stroke: var(--accent, #58a6ff);
        color: var(--accent, #58a6ff);
        filter: drop-shadow(0 0 4px var(--accent, rgba(88,166,255,0.5)));
      }

      /* ── 响应式图标大小 ── */
      @media (max-width: 768px) {
        .animated-icon svg { width: 0.9em; height: 0.9em; }
        .title-icon svg { width: 1.1em; height: 1.1em; }
      }
    `;
    document.head.appendChild(s);
  }

  /* ── 暴露接口 ── */
  window.iconSystem = {
    getIcon,
    replace: replaceEmojis
  };

  /* ── 启动 ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
