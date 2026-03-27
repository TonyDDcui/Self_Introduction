/**
 * 汉堡菜单 - 点击后横向悬浮导航
 */

(function () {
  'use strict';

  const SECTIONS = [
    { id: 'hero',         icon: '🏠', name: '首页' },
    { id: 'about',        icon: '👤', name: '关于' },
    { id: 'skills',       icon: '⚡', name: '技能' },
    { id: 'projects',     icon: '🚀', name: '项目' },
    { id: 'certificates', icon: '🏅', name: '荣誉' },
    { id: 'life',         icon: '📷', name: '生活' },
    { id: 'quotes',       icon: '💭', name: '好句' },
    { id: 'guestbook',    icon: '✍️', name: '留言' },
    { id: 'contact',      icon: '✉️', name: '联系' }
  ];

  function init() {
    injectStyles();
    buildMenu();
    bindEvents();
    initScrollSpy();
  }

  /* ── 注入样式 ── */
  function injectStyles() {
    if (document.getElementById('hamburger-nav-css')) return;
    const s = document.createElement('style');
    s.id = 'hamburger-nav-css';
    s.textContent = `
      /* ── 汉堡按钮 ── */
      #hb-btn {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 5px;
        width: 36px;
        height: 36px;
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px;
        border-radius: 8px;
        transition: background 0.2s;
        z-index: 10001;
        position: relative;
      }
      #hb-btn:hover { background: rgba(255,255,255,0.08); }
      #hb-btn span {
        display: block;
        width: 20px;
        height: 2px;
        background: var(--text-primary, #e6edf3);
        border-radius: 2px;
        transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
        transform-origin: center;
      }
      /* 打开状态 → X */
      #hb-btn.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
      #hb-btn.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
      #hb-btn.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

      /* ── 悬浮横向导航面板 ── */
      #hb-panel {
        position: fixed;
        top: 56px;          /* header 高度 */
        left: 0;
        right: 0;
        z-index: 10000;
        background: rgba(13, 17, 23, 0.96);
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        border-bottom: 1px solid rgba(255,255,255,0.08);
        padding: 12px 16px;
        display: flex;
        justify-content: center;
        /* 隐藏状态 */
        opacity: 0;
        visibility: hidden;
        transform: translateY(-8px);
        transition: opacity 0.25s ease, transform 0.25s ease, visibility 0.25s;
      }
      #hb-panel.open {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }

      /* 横向滚动容器 */
      #hb-panel-inner {
        display: flex;
        gap: 6px;
        overflow-x: auto;
        scrollbar-width: none;
        -webkit-overflow-scrolling: touch;
        max-width: 900px;
        width: 100%;
        justify-content: center;
        flex-wrap: wrap;
      }
      #hb-panel-inner::-webkit-scrollbar { display: none; }

      /* 每个导航项 */
      .hb-nav-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 10px 16px;
        border-radius: 14px;
        text-decoration: none;
        color: var(--text-secondary, #8b949e);
        font-size: 12px;
        font-weight: 500;
        white-space: nowrap;
        transition: all 0.2s ease;
        flex-shrink: 0;
        border: 1px solid transparent;
      }
      .hb-nav-item:hover {
        background: rgba(255,255,255,0.06);
        color: var(--text-primary, #e6edf3);
        border-color: rgba(255,255,255,0.1);
      }
      .hb-nav-item.active {
        background: rgba(88,166,255,0.15);
        color: #58a6ff;
        border-color: rgba(88,166,255,0.25);
      }
      .hb-nav-item .hb-icon { font-size: 20px; line-height: 1; }
      .hb-nav-item .hb-name { font-size: 11px; letter-spacing: 0.2px; }

      /* 移动端更紧凑 */
      @media (max-width: 480px) {
        .hb-nav-item { padding: 8px 12px; }
        .hb-nav-item .hb-icon { font-size: 18px; }
        #hb-panel-inner { justify-content: flex-start; flex-wrap: nowrap; }
      }
    `;
    document.head.appendChild(s);
  }

  /* ── 构建 DOM ── */
  function buildMenu() {
    /* 找到 header 里的汉堡按钮占位 */
    const placeholder = document.getElementById('hamburger-btn');

    /* 创建新按钮 */
    const btn = document.createElement('button');
    btn.id = 'hb-btn';
    btn.setAttribute('aria-label', '导航菜单');
    btn.innerHTML = '<span></span><span></span><span></span>';

    if (placeholder) {
      placeholder.replaceWith(btn);
    } else {
      /* 找不到占位就插到 header-left */
      const left = document.querySelector('.header-left');
      if (left) left.prepend(btn);
      else document.body.prepend(btn);
    }

    /* 创建横向面板 */
    const panel = document.createElement('div');
    panel.id = 'hb-panel';
    panel.setAttribute('aria-hidden', 'true');

    const inner = document.createElement('div');
    inner.id = 'hb-panel-inner';

    SECTIONS.forEach(sec => {
      const a = document.createElement('a');
      a.href = `#${sec.id}`;
      a.className = 'hb-nav-item';
      a.dataset.section = sec.id;
      a.innerHTML = `<span class="hb-icon">${sec.icon}</span><span class="hb-name">${sec.name}</span>`;
      inner.appendChild(a);
    });

    panel.appendChild(inner);
    document.body.appendChild(panel);
  }

  /* ── 事件绑定 ── */
  function bindEvents() {
    const btn   = document.getElementById('hb-btn');
    const panel = document.getElementById('hb-panel');
    if (!btn || !panel) return;

    /* 切换面板 */
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = panel.classList.contains('open');
      toggle(!isOpen);
    });

    /* 点击面板外关闭 */
    document.addEventListener('click', (e) => {
      if (!panel.contains(e.target) && e.target !== btn) {
        toggle(false);
      }
    });

    /* 点击导航项 */
    panel.querySelectorAll('.hb-nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.getElementById(item.dataset.section);
        if (target) {
          toggle(false);
          setTimeout(() => {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 200);
        }
      });
    });

    /* ESC 关闭 */
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') toggle(false);
    });
  }

  function toggle(open) {
    const btn   = document.getElementById('hb-btn');
    const panel = document.getElementById('hb-panel');
    if (!btn || !panel) return;
    btn.classList.toggle('open', open);
    panel.classList.toggle('open', open);
    panel.setAttribute('aria-hidden', String(!open));
  }

  /* ── 滚动高亮 ── */
  function initScrollSpy() {
    const items = document.querySelectorAll('.hb-nav-item');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          items.forEach(item => item.classList.toggle('active', item.dataset.section === id));
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });

    SECTIONS.forEach(sec => {
      const el = document.getElementById(sec.id);
      if (el) observer.observe(el);
    });
  }

  /* ── 启动 ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
