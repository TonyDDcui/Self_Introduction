/**
 * 姹夊牎鑿滃崟 v2 - 瀹岀編閫傞厤娴呰壊/娣辫壊妯″紡
 */

(function () {
  'use strict';

  const SECTIONS = [
    { id: 'hero',     icon: '🏠', name: '首页' },
    { id: 'about',    icon: '👤', name: '关于' },
    { id: 'skills',   icon: '🛠', name: '技能' },
    { id: 'projects', icon: '🚀', name: '项目' },
    { id: 'life',     icon: '📷', name: '生活' },
    { id: 'quotes',   icon: '💭', name: '好句' },
    { id: 'contact',  icon: '✉️', name: '联系' }
  ];

  function init() {
    injectStyles();
    buildMenu();
    bindEvents();
    initScrollSpy();
    // 鐩戝惉涓婚鍙樺寲
    observeTheme();
  }

  /* 鈹€鈹€ 鍔ㄦ€侀€傞厤涓婚鑹?鈹€鈹€ */
  function getThemeColors() {
    const isDark = !document.documentElement.hasAttribute('data-theme') ||
                   document.documentElement.getAttribute('data-theme') === 'dark' ||
                   window.matchMedia('(prefers-color-scheme: dark)').matches;

    return isDark ? {
      bg: 'rgba(13, 17, 23, 0.97)',
      border: 'rgba(255,255,255,0.08)',
      text: '#e6edf3',
      textMuted: '#8b949e',
      activeBg: 'rgba(88,166,255,0.15)',
      activeColor: '#58a6ff',
      activeBorder: 'rgba(88,166,255,0.25)',
      hoverBg: 'rgba(255,255,255,0.06)',
      lineColor: '#e6edf3',
      shadow: '0 8px 32px rgba(0,0,0,0.4)'
    } : {
      bg: 'rgba(255, 255, 255, 0.97)',
      border: 'rgba(0,0,0,0.08)',
      text: '#1f2328',
      textMuted: '#656d76',
      activeBg: 'rgba(88,166,255,0.12)',
      activeColor: '#0969da',
      activeBorder: 'rgba(88,166,255,0.2)',
      hoverBg: 'rgba(0,0,0,0.04)',
      lineColor: '#1f2328',
      shadow: '0 8px 32px rgba(0,0,0,0.12)'
    };
  }

  function updateTheme() {
    const c = getThemeColors();
    const panel = document.getElementById('hb-panel');
    const btn = document.getElementById('hb-btn');
    if (!panel) return;

    panel.style.background = c.bg;
    panel.style.borderBottomColor = c.border;
    panel.style.boxShadow = c.shadow;

    if (btn) {
      btn.querySelectorAll('span').forEach(s => s.style.background = c.lineColor);
    }

    document.querySelectorAll('.hb-nav-item').forEach(item => {
      item.style.color = c.textMuted;
      if (!item.classList.contains('active')) {
        item.style.background = 'transparent';
        item.style.borderColor = 'transparent';
      }
    });
  }

  function observeTheme() {
    const observer = new MutationObserver(() => updateTheme());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => updateTheme());
  }

  /* 鈹€鈹€ 娉ㄥ叆鏍峰紡 鈹€鈹€ */
  function injectStyles() {
    if (document.getElementById('hamburger-nav-v2-css')) return;

    const c = getThemeColors();
    const s = document.createElement('style');
    s.id = 'hamburger-nav-v2-css';
    s.textContent = `
      /* 鈹€鈹€ 姹夊牎鎸夐挳 鈹€鈹€ */
      #hb-btn {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 5px;
        width: 38px;
        height: 38px;
        background: none;
        border: none;
        cursor: pointer;
        padding: 5px;
        border-radius: 10px;
        transition: background 0.2s;
        z-index: 10001;
        position: relative;
      }
      #hb-btn:hover { background: rgba(128,128,128,0.15); }
      #hb-btn span {
        display: block;
        width: 18px;
        height: 2px;
        background: ${c.lineColor};
        border-radius: 2px;
        transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
        transform-origin: center;
      }
      /* 鎵撳紑鐘舵€?鈫?鍔ㄧ敾鍙?X */
      #hb-btn.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
      #hb-btn.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
      #hb-btn.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

      /* 鈹€鈹€ 鎮诞妯悜瀵艰埅闈㈡澘 鈹€鈹€ */
      #hb-panel {
        position: fixed;
        top: 52px;
        left: 0;
        right: 0;
        z-index: 10000;
        background: ${c.bg};
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        border-bottom: 1px solid ${c.border};
        padding: 10px 12px 12px;
        box-shadow: ${c.shadow};
        opacity: 0;
        visibility: hidden;
        transform: translateY(-10px);
        transition: opacity 0.28s ease, transform 0.28s ease, visibility 0.28s;
      }
      #hb-panel.open {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }

      /* 妯悜婊氬姩瀹瑰櫒 */
      #hb-panel-inner {
        display: flex;
        gap: 6px;
        overflow-x: auto;
        scrollbar-width: none;
        -webkit-overflow-scrolling: touch;
        max-width: 900px;
        margin: 0 auto;
        padding: 2px 0;
      }
      #hb-panel-inner::-webkit-scrollbar { display: none; }

      /* 姣忎釜瀵艰埅椤?*/
      .hb-nav-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3px;
        padding: 9px 14px;
        border-radius: 12px;
        text-decoration: none;
        color: ${c.textMuted};
        font-size: 11px;
        font-weight: 500;
        white-space: nowrap;
        transition: all 0.2s ease;
        flex-shrink: 0;
        border: 1px solid transparent;
        background: transparent;
      }
      .hb-nav-item:hover {
        background: ${c.hoverBg};
        color: ${c.text};
        border-color: ${c.border};
      }
      .hb-nav-item.active {
        background: ${c.activeBg};
        color: ${c.activeColor};
        border-color: ${c.activeBorder};
      }
      .hb-nav-item .hb-icon { font-size: 20px; line-height: 1; }
      .hb-nav-item .hb-name { font-size: 11px; letter-spacing: 0.2px; }

      /* 绉诲姩绔洿绱у噾 */
      @media (max-width: 480px) {
        #hb-panel { top: 50px; padding: 8px 8px 10px; }
        .hb-nav-item { padding: 8px 11px; }
        .hb-nav-item .hb-icon { font-size: 18px; }
        .hb-nav-item .hb-name { font-size: 10px; }
      }

      /* 鈹€鈹€ 娣辫壊涓婚瑕嗙洊 鈹€鈹€ */
      [data-theme="dark"] #hb-panel {
        background: rgba(13, 17, 23, 0.97);
        border-color: rgba(255,255,255,0.08);
        box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      }
      [data-theme="dark"] .hb-nav-item { color: #8b949e; }
      [data-theme="dark"] .hb-nav-item:hover {
        background: rgba(255,255,255,0.06);
        color: #e6edf3;
        border-color: rgba(255,255,255,0.08);
      }
      [data-theme="dark"] .hb-nav-item.active {
        background: rgba(88,166,255,0.15);
        color: #58a6ff;
        border-color: rgba(88,166,255,0.25);
      }
      [data-theme="dark"] #hb-btn span { background: #e6edf3; }

      /* 鈹€鈹€ 娴呰壊涓婚瑕嗙洊 鈹€鈹€ */
      [data-theme="light"] #hb-panel {
        background: rgba(255, 255, 255, 0.97);
        border-color: rgba(0,0,0,0.08);
        box-shadow: 0 8px 32px rgba(0,0,0,0.1);
      }
      [data-theme="light"] .hb-nav-item { color: #656d76; }
      [data-theme="light"] .hb-nav-item:hover {
        background: rgba(0,0,0,0.04);
        color: #1f2328;
        border-color: rgba(0,0,0,0.06);
      }
      [data-theme="light"] .hb-nav-item.active {
        background: rgba(88,166,255,0.12);
        color: #0969da;
        border-color: rgba(88,166,255,0.2);
      }
      [data-theme="light"] #hb-btn span { background: #1f2328; }
    `;
    document.head.appendChild(s);
  }

  /* 鈹€鈹€ 鏋勫缓 DOM 鈹€鈹€ */
  function buildMenu() {
    const placeholder = document.getElementById('hamburger-btn');
    const btn = document.createElement('button');
    btn.id = 'hb-btn';
    btn.setAttribute('aria-label', '瀵艰埅鑿滃崟');
    btn.innerHTML = '<span></span><span></span><span></span>';

    if (placeholder) {
      placeholder.replaceWith(btn);
    } else {
      const left = document.querySelector('.header-left');
      if (left) left.prepend(btn);
      else document.body.prepend(btn);
    }

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

  /* 鈹€鈹€ 浜嬩欢缁戝畾 鈹€鈹€ */
  function bindEvents() {
    const btn = document.getElementById('hb-btn');
    const panel = document.getElementById('hb-panel');
    if (!btn || !panel) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = panel.classList.contains('open');
      toggle(!isOpen);
    });

    document.addEventListener('click', (e) => {
      if (!panel.contains(e.target) && e.target !== btn) {
        toggle(false);
      }
    });

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

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') toggle(false);
    });
  }

  function toggle(open) {
    const btn = document.getElementById('hb-btn');
    const panel = document.getElementById('hb-panel');
    if (!btn || !panel) return;
    btn.classList.toggle('open', open);
    panel.classList.toggle('open', open);
    panel.setAttribute('aria-hidden', String(!open));
  }

  /* 鈹€鈹€ 婊氬姩楂樹寒 鈹€鈹€ */
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

  /* 鈹€鈹€ 鍚姩 鈹€鈹€ */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
