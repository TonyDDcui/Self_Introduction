/**
 * 汉堡菜单增强 - 横向展开 + 纵向板块导航
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

  // 初始化导航
  function initNavigation() {
    const navSidebar = document.getElementById('nav-sidebar');
    if (!navSidebar) return;

    // 添加板块导航区域
    addSectionNav(navSidebar);
    
    // 初始化滚动监听
    initScrollSpy();
    
    // 初始化平滑滚动
    initSmoothScroll();
  }

  // 添加板块导航到汉堡菜单
  function addSectionNav(navSidebar) {
    // 找到导航链接容器
    const navLinks = navSidebar.querySelector('.nav-links');
    if (!navLinks) return;

    // 创建板块导航标题
    const sectionTitle = document.createElement('div');
    sectionTitle.className = 'nav-section-title';
    sectionTitle.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 3h18v18H3z"/>
        <path d="M3 9h18M9 21V9"/>
      </svg>
      <span>📍 快速导航</span>
    `;
    sectionTitle.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px 16px 8px;
      font-size: 11px;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      margin-top: 8px;
    `;

    // 创建横向滚动的导航容器
    const horizontalNav = document.createElement('div');
    horizontalNav.className = 'horizontal-nav-container';
    horizontalNav.innerHTML = `
      <div class="horizontal-nav-scroll">
        ${SECTIONS.map(section => `
          <a href="#${section.id}" class="horizontal-nav-item" data-section="${section.id}">
            <span class="nav-icon">${section.icon}</span>
            <span class="nav-text">${section.name}</span>
          </a>
        `).join('')}
      </div>
    `;

    // 添加样式
    addNavigationStyles();

    // 在现有导航后添加
    navLinks.appendChild(sectionTitle);
    navLinks.appendChild(horizontalNav);
  }

  // 添加导航样式
  function addNavigationStyles() {
    if (document.getElementById('nav-enhancement-styles')) return;

    const style = document.createElement('style');
    style.id = 'nav-enhancement-styles';
    style.textContent = `
      /* 横向导航容器 */
      .horizontal-nav-container {
        width: 100%;
        padding: 0 16px 16px;
        overflow: hidden;
      }

      /* 横向滚动区域 */
      .horizontal-nav-scroll {
        display: flex;
        gap: 8px;
        overflow-x: auto;
        padding: 8px 0;
        -webkit-overflow-scrolling: touch;
        scroll-behavior: smooth;
        scrollbar-width: none;
        -ms-overflow-style: none;
      }

      .horizontal-nav-scroll::-webkit-scrollbar {
        display: none;
      }

      /* 导航项 */
      .horizontal-nav-item {
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        padding: 10px 14px;
        border-radius: 12px;
        background: var(--bg-secondary);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: var(--text-secondary);
        text-decoration: none;
        font-size: 0.75rem;
        transition: all 0.2s ease;
        cursor: pointer;
        min-width: 60px;
      }

      .horizontal-nav-item:hover {
        background: var(--bg-tertiary);
        color: var(--text-primary);
        border-color: var(--accent-primary);
        transform: translateY(-2px);
      }

      .horizontal-nav-item.active {
        background: var(--accent-primary);
        color: white;
        border-color: var(--accent-primary);
        box-shadow: 0 4px 12px rgba(88, 166, 255, 0.3);
      }

      .horizontal-nav-item .nav-icon {
        font-size: 1.25rem;
        line-height: 1;
      }

      .horizontal-nav-item .nav-text {
        white-space: nowrap;
        font-weight: 500;
      }

      /* 移动端优化 */
      @media (max-width: 768px) {
        .horizontal-nav-container {
          padding: 8px 12px 12px;
        }

        .horizontal-nav-item {
          padding: 8px 12px;
          min-width: 55px;
          border-radius: 10px;
        }

        .horizontal-nav-item .nav-icon {
          font-size: 1.1rem;
        }

        .horizontal-nav-item .nav-text {
          font-size: 0.7rem;
        }
      }

      /* 触摸反馈 */
      .horizontal-nav-item:active {
        transform: scale(0.95);
      }

      /* 导航项之间的间隔线 */
      .horizontal-nav-item + .horizontal-nav-item::before {
        content: '';
        position: absolute;
        left: -4px;
        top: 50%;
        transform: translateY(-50%);
        width: 1px;
        height: 20px;
        background: rgba(255, 255, 255, 0.1);
      }

      /* 隐藏原始导航中的重复链接 */
      .nav-links .nav-link[href="#hero"],
      .nav-links .nav-link[href="#about"],
      .nav-links .nav-link[href="#skills"],
      .nav-links .nav-link[href="#projects"],
      .nav-links .nav-link[href="#github"],
      .nav-links .nav-link[href="#certificates"],
      .nav-links .nav-link[href="#life"],
      .nav-links .nav-link[href="#contact"] {
        display: none;
      }
    `;
    document.head.appendChild(style);
  }

  // 滚动监听 - 更新活跃板块
  function initScrollSpy() {
    const sectionLinks = document.querySelectorAll('.horizontal-nav-item');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          sectionLinks.forEach(link => {
            if (link.dataset.section === sectionId) {
              link.classList.add('active');
              // 滚动到可见区域
              link.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, {
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    });

    // 观察所有板块
    SECTIONS.forEach(section => {
      const element = document.getElementById(section.id);
      if (element) {
        observer.observe(element);
      }
    });
  }

  // 平滑滚动到板块
  function initSmoothScroll() {
    document.querySelectorAll('.horizontal-nav-item').forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').slice(1);
        const target = document.getElementById(targetId);
        
        if (target) {
          // 关闭汉堡菜单
          closeSidebar();
          
          // 平滑滚动
          target.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });

          // 更新活跃状态
          document.querySelectorAll('.horizontal-nav-item').forEach(l => l.classList.remove('active'));
          this.classList.add('active');
        }
      });
    });
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
    
    if (overlay) {
      overlay.classList.remove('active');
    }
    
    if (hamburger) {
      hamburger.classList.remove('active');
    }
    
    document.body.style.overflow = '';
  }

  // 初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initNavigation();
    });
  } else {
    initNavigation();
  }

  // 暴露全局方法
  window.NavigationEnhancer = {
    refresh: initNavigation
  };

})();
