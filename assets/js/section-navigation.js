/**
 * 汉堡菜单 - 横向列表显示 + 移动端优化
 * 苹果设计理念：大圆角、简洁、层次分明
 */

(function() {
  'use strict';

  // 板块配置
  const SECTIONS = [
    { id: 'hero', icon: '⚡', name: '首页' },
    { id: 'about', icon: '👤', name: '关于' },
    { id: 'skills', icon: '🛠️', name: '技能' },
    { id: 'projects', icon: '🚀', name: '项目' },
    { id: 'github', icon: '🐙', name: 'GitHub' },
    { id: 'certificates', icon: '🏆', name: '荣誉' },
    { id: 'life', icon: '📸', name: '生活' },
    { id: 'quotes', icon: '✨', name: '好句' },
    { id: 'guestbook', icon: '💬', name: '留言' },
    { id: 'contact', icon: '📧', name: '联系' }
  ];

  // 初始化
  function init() {
    const sidebar = document.getElementById('nav-sidebar');
    if (!sidebar) return;

    // 清空现有内容
    const navLinks = sidebar.querySelector('.nav-links');
    if (navLinks) {
      navLinks.innerHTML = '';
    }

    // 添加横向列表导航
    addHorizontalListNav(sidebar);
    
    // 添加底部信息
    addFooterInfo(sidebar);
    
    // 初始化滚动监听
    initScrollSpy();
    
    // 添加样式
    addStyles();
  }

  // 添加横向列表导航
  function addHorizontalListNav(sidebar) {
    const navContainer = document.createElement('div');
    navContainer.className = 'horizontal-list-nav';
    navContainer.innerHTML = `
      <div class="nav-list-header">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="7" height="7" rx="2"/>
          <rect x="14" y="3" width="7" height="7" rx="2"/>
          <rect x="14" y="14" width="7" height="7" rx="2"/>
          <rect x="3" y="14" width="7" height="7" rx="2"/>
        </svg>
        <span>导航</span>
      </div>
      <div class="nav-list-container">
        ${SECTIONS.map(section => `
          <a href="#${section.id}" class="nav-list-item" data-section="${section.id}">
            <span class="item-icon">${section.icon}</span>
            <span class="item-name">${section.name}</span>
            <svg class="item-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </a>
        `).join('')}
      </div>
    `;

    const navLinks = sidebar.querySelector('.nav-links') || sidebar;
    navLinks.appendChild(navContainer);

    // 绑定点击事件
    navContainer.querySelectorAll('.nav-list-item').forEach(item => {
      item.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').slice(1);
        const target = document.getElementById(targetId);
        
        if (target) {
          closeSidebar();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // 添加底部信息
  function addFooterInfo(sidebar) {
    const footer = document.createElement('div');
    footer.className = 'nav-footer-info';
    footer.innerHTML = `
      <a href="https://github.com/TonyDDcui" target="_blank" rel="noopener" class="footer-link">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 2.08-.8 3.97-2.1 5.39.26.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
        <span>TonyDDcui</span>
      </a>
      <div class="footer-version">v2.0</div>
    `;

    const navLinks = sidebar.querySelector('.nav-links') || sidebar;
    navLinks.appendChild(footer);
  }

  // 关闭侧边栏
  function closeSidebar() {
    const sidebar = document.getElementById('nav-sidebar');
    const overlay = document.getElementById('nav-overlay');
    const hamburger = document.getElementById('hamburger-btn');
    
    if (sidebar) {
      sidebar.classList.remove('open');
      sidebar.setAttribute('aria-hidden', 'true');
    }
    
    if (overlay) overlay.classList.remove('active');
    if (hamburger) hamburger.classList.remove('active');
    document.body.style.overflow = '';
  }

  // 滚动监听
  function initScrollSpy() {
    const items = document.querySelectorAll('.nav-list-item');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          items.forEach(item => {
            item.classList.toggle('active', item.dataset.section === sectionId);
          });
        }
      });
    }, {
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    });

    SECTIONS.forEach(section => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });
  }

  // 添加样式 - 苹果设计理念
  function addStyles() {
    if (document.getElementById('apple-style-nav')) return;
    
    const style = document.createElement('style');
    style.id = 'apple-style-nav';
    style.textContent = `
      /* ============================================
         苹果设计理念导航
         - 大圆角 (16-24px)
         - 简洁层次
         - 毛玻璃效果
         - 精致动画
         ============================================ */

      /* 导航容器 */
      .horizontal-list-nav {
        padding: 16px;
      }

      /* 头部 */
      .nav-list-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 12px;
        padding: 0 8px;
        color: var(--text-secondary);
        font-size: 13px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .nav-list-header svg {
        color: var(--accent-primary);
        opacity: 0.8;
      }

      /* 列表容器 - 苹果风格卡片 */
      .nav-list-container {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 20px;
        overflow: hidden;
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
      }

      /* 列表项 */
      .nav-list-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 16px;
        text-decoration: none;
        color: var(--text-primary);
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      }

      .nav-list-item:last-child {
        border-bottom: none;
      }

      /* 悬停效果 */
      .nav-list-item:hover {
        background: rgba(255, 255, 255, 0.06);
      }

      .nav-list-item:active {
        background: rgba(255, 255, 255, 0.1);
        transform: scale(0.99);
      }

      /* 活跃状态 */
      .nav-list-item.active {
        background: rgba(88, 166, 255, 0.12);
      }

      .nav-list-item.active .item-name {
        color: var(--accent-primary);
        font-weight: 600;
      }

      /* 图标 */
      .nav-list-item .item-icon {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.06);
        border-radius: 10px;
        font-size: 16px;
        flex-shrink: 0;
      }

      /* 名称 */
      .nav-list-item .item-name {
        flex: 1;
        font-size: 15px;
        font-weight: 500;
        letter-spacing: -0.2px;
      }

      /* 箭头 */
      .nav-list-item .item-arrow {
        color: var(--text-muted);
        opacity: 0.5;
        transition: all 0.2s ease;
        flex-shrink: 0;
      }

      .nav-list-item:hover .item-arrow {
        opacity: 1;
        transform: translateX(2px);
      }

      /* 底部信息 */
      .nav-footer-info {
        margin-top: 16px;
        padding: 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .footer-link {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 14px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 100px;
        text-decoration: none;
        color: var(--text-secondary);
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s ease;
      }

      .footer-link:hover {
        background: rgba(255, 255, 255, 0.1);
        color: var(--text-primary);
      }

      .footer-version {
        font-size: 12px;
        color: var(--text-muted);
        font-weight: 500;
        padding: 4px 10px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 100px;
      }

      /* ============================================
         移动端优化
         ============================================ */
      
      @media (max-width: 768px) {
        .horizontal-list-nav {
          padding: 12px;
        }

        .nav-list-container {
          border-radius: 16px;
        }

        .nav-list-item {
          padding: 12px 14px;
        }

        .nav-list-item .item-icon {
          width: 28px;
          height: 28px;
          font-size: 14px;
          border-radius: 8px;
        }

        .nav-list-item .item-name {
          font-size: 14px;
        }

        .nav-footer-info {
          padding: 12px;
        }

        .footer-link {
          padding: 6px 12px;
          font-size: 13px;
        }
      }

      /* 小屏幕手机 */
      @media (max-width: 380px) {
        .nav-list-container {
          border-radius: 14px;
        }

        .nav-list-item {
          padding: 10px 12px;
        }

        .nav-list-item .item-icon {
          width: 26px;
          height: 26px;
          font-size: 13px;
        }
      }

      /* 侧边栏容器优化 */
      #nav-sidebar {
        background: rgba(13, 17, 23, 0.95);
        backdrop-filter: blur(30px);
        -webkit-backdrop-filter: blur(30px);
      }

      /* 滚动条美化 */
      #nav-sidebar::-webkit-scrollbar {
        width: 6px;
      }

      #nav-sidebar::-webkit-scrollbar-track {
        background: transparent;
      }

      #nav-sidebar::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 3px;
      }

      #nav-sidebar::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.2);
      }
    `;
    document.head.appendChild(style);
  }

  // 初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
