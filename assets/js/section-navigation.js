/**
 * 汉堡菜单 - 横向排列板块入口
 */

(function() {
  'use strict';

  // 板块配置
  const SECTIONS = [
    { id: 'hero', icon: '⚡', name: '首页', desc: '回到顶部' },
    { id: 'about', icon: '👤', name: '关于', desc: '个人简介' },
    { id: 'skills', icon: '🛠️', name: '技能', desc: '技术栈' },
    { id: 'projects', icon: '🚀', name: '项目', desc: '作品展示' },
    { id: 'github', icon: '🐙', name: 'GitHub', desc: '开源贡献' },
    { id: 'certificates', icon: '🏆', name: '荣誉', desc: '证书奖项' },
    { id: 'life', icon: '📸', name: '生活', desc: '精彩瞬间' },
    { id: 'quotes', icon: '✨', name: '好句', desc: '每日一言' },
    { id: 'guestbook', icon: '💬', name: '留言', desc: '互动交流' },
    { id: 'contact', icon: '📧', name: '联系', desc: '联系方式' }
  ];

  // 初始化
  function init() {
    const sidebar = document.getElementById('nav-sidebar');
    if (!sidebar) {
      console.warn('未找到导航侧边栏');
      return;
    }

    // 清空现有内容
    const navLinks = sidebar.querySelector('.nav-links');
    if (navLinks) {
      navLinks.innerHTML = '';
    }

    // 添加横向板块导航
    addHorizontalNav(sidebar);
    
    // 添加底部链接
    addFooterLinks(sidebar);
    
    // 初始化滚动监听
    initScrollSpy();
    
    // 添加样式
    addStyles();
  }

  // 添加横向板块导航
  function addHorizontalNav(sidebar) {
    const navContainer = document.createElement('div');
    navContainer.className = 'horizontal-section-nav';
    navContainer.innerHTML = `
      <div class="nav-header">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="14" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/>
        </svg>
        <span>板块导航</span>
      </div>
      <div class="horizontal-nav-grid">
        ${SECTIONS.map(section => `
          <a href="#${section.id}" class="nav-grid-item" data-section="${section.id}">
            <span class="item-icon">${section.icon}</span>
            <span class="item-name">${section.name}</span>
            <span class="item-desc">${section.desc}</span>
          </a>
        `).join('')}
      </div>
    `;

    const navLinks = sidebar.querySelector('.nav-links') || sidebar;
    navLinks.appendChild(navContainer);

    // 绑定点击事件
    navContainer.querySelectorAll('.nav-grid-item').forEach(item => {
      item.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').slice(1);
        const target = document.getElementById(targetId);
        
        if (target) {
          // 关闭侧边栏
          closeSidebar();
          
          // 平滑滚动
          target.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  // 添加底部链接
  function addFooterLinks(sidebar) {
    const footer = document.createElement('div');
    footer.className = 'nav-footer';
    footer.innerHTML = `
      <a href="https://github.com/TonyDDcui" target="_blank" rel="noopener" class="nav-footer-link">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
        <span>GitHub 主页</span>
      </a>
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
    
    if (overlay) {
      overlay.classList.remove('active');
    }
    
    if (hamburger) {
      hamburger.classList.remove('active');
    }
    
    document.body.style.overflow = '';
  }

  // 滚动监听
  function initScrollSpy() {
    const items = document.querySelectorAll('.nav-grid-item');
    
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
      if (element) {
        observer.observe(element);
      }
    });
  }

  // 添加样式
  function addStyles() {
    if (document.getElementById('horizontal-nav-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'horizontal-nav-styles';
    style.textContent = `
      /* 横向板块导航 */
      .horizontal-section-nav {
        padding: 20px;
      }

      .nav-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        color: var(--text-secondary);
        font-size: 0.875rem;
        font-weight: 600;
      }

      .nav-header svg {
        color: var(--accent-primary);
      }

      /* 网格布局 */
      .horizontal-nav-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
      }

      @media (max-width: 380px) {
        .horizontal-nav-grid {
          grid-template-columns: 1fr;
        }
      }

      /* 导航项 */
      .nav-grid-item {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
        padding: 14px 16px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 12px;
        text-decoration: none;
        color: var(--text-primary);
        transition: all 0.2s ease;
        cursor: pointer;
      }

      .nav-grid-item:hover {
        background: rgba(255, 255, 255, 0.08);
        border-color: var(--accent-primary);
        transform: translateY(-2px);
      }

      .nav-grid-item.active {
        background: rgba(88, 166, 255, 0.15);
        border-color: var(--accent-primary);
      }

      .nav-grid-item .item-icon {
        font-size: 1.5rem;
        line-height: 1;
      }

      .nav-grid-item .item-name {
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--text-primary);
      }

      .nav-grid-item .item-desc {
        font-size: 0.75rem;
        color: var(--text-muted);
      }

      /* 底部链接 */
      .nav-footer {
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }

      .nav-footer-link {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 16px;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 10px;
        text-decoration: none;
        color: var(--text-secondary);
        font-size: 0.875rem;
        transition: all 0.2s ease;
      }

      .nav-footer-link:hover {
        background: rgba(255, 255, 255, 0.08);
        color: var(--text-primary);
      }

      /* 移动端优化 */
      @media (max-width: 768px) {
        .horizontal-section-nav {
          padding: 16px;
        }

        .nav-grid-item {
          padding: 12px 14px;
        }

        .nav-grid-item .item-icon {
          font-size: 1.25rem;
        }

        .nav-grid-item .item-name {
          font-size: 0.875rem;
        }
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
