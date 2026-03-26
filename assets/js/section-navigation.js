/**
 * 汉堡菜单 - 无矩形框 + 比例居中
 * 简洁设计
 */

(function() {
  'use strict';

  // 板块配置
  const SECTIONS = [
    { id: 'hero', icon: '🏠', name: '首页' },
    { id: 'about', icon: '👤', name: '关于' },
    { id: 'skills', icon: '⚡', name: '技能' },
    { id: 'projects', icon: '🚀', name: '项目' },
    { id: 'github', icon: '🐙', name: 'GitHub' },
    { id: 'certificates', icon: '🏅', name: '荣誉' },
    { id: 'life', icon: '📷', name: '生活' },
    { id: 'quotes', icon: '💭', name: '好句' },
    { id: 'guestbook', icon: '✍️', name: '留言' },
    { id: 'contact', icon: '✉️', name: '联系' }
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

    // 添加板块导航
    addSectionNav(sidebar);
    
    // 添加分隔线
    addDivider(sidebar);
    
    // 添加 GitHub 入口（底部）
    addGitHubLink(sidebar);
    
    // 初始化滚动监听
    initScrollSpy();
    
    // 添加样式
    addStyles();
  }

  // 添加板块导航
  function addSectionNav(sidebar) {
    const navContainer = document.createElement('div');
    navContainer.className = 'section-nav-container';
    navContainer.innerHTML = `
      <div class="nav-section-title">导航</div>
      <div class="nav-list">
        ${SECTIONS.map(section => `
          <a href="#${section.id}" class="nav-item" data-section="${section.id}">
            <span class="nav-icon">${section.icon}</span>
            <span class="nav-name">${section.name}</span>
          </a>
        `).join('')}
      </div>
    `;

    const navLinks = sidebar.querySelector('.nav-links') || sidebar;
    navLinks.appendChild(navContainer);

    // 绑定点击事件
    navContainer.querySelectorAll('.nav-item').forEach(item => {
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

  // 添加分隔线
  function addDivider(sidebar) {
    const divider = document.createElement('div');
    divider.className = 'nav-divider';
    
    const navLinks = sidebar.querySelector('.nav-links') || sidebar;
    navLinks.appendChild(divider);
  }

  // 添加 GitHub 入口（放底部）
  function addGitHubLink(sidebar) {
    const githubSection = document.createElement('div');
    githubSection.className = 'github-section';
    githubSection.innerHTML = `
      <div class="github-section-title">开发者</div>
      <a href="https://github.com/TonyDDcui" target="_blank" rel="noopener" class="github-link">
        <span class="github-icon">🐙</span>
        <span class="github-name">TonyDDcui</span>
      </a>
    `;

    const navLinks = sidebar.querySelector('.nav-links') || sidebar;
    navLinks.appendChild(githubSection);
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
    const items = document.querySelectorAll('.nav-item');
    
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

  // 添加样式
  function addStyles() {
    if (document.getElementById('clean-nav-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'clean-nav-styles';
    style.textContent = `
      /* ============================================
         简洁导航 - 无矩形框
         ============================================ */

      /* 导航容器 */
      .section-nav-container {
        padding: 24px 32px;
      }

      /* 板块标题 */
      .nav-section-title {
        text-align: center;
        font-size: 13px;
        font-weight: 600;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 20px;
      }

      /* 列表 - 无矩形框 */
      .nav-list {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      /* 导航项 - 简洁设计 */
      .nav-item {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 14px 20px;
        text-decoration: none;
        color: var(--text-primary);
        transition: all 0.2s ease;
        border-radius: 12px;
      }

      .nav-item:hover {
        background: rgba(255, 255, 255, 0.05);
      }

      .nav-item:active {
        background: rgba(255, 255, 255, 0.08);
        transform: scale(0.98);
      }

      .nav-item.active {
        background: rgba(88, 166, 255, 0.12);
      }

      .nav-item.active .nav-name {
        color: var(--accent-primary);
        font-weight: 600;
      }

      /* 图标 */
      .nav-item .nav-icon {
        font-size: 22px;
        width: 32px;
        text-align: center;
      }

      /* 名称 */
      .nav-item .nav-name {
        font-size: 16px;
        font-weight: 500;
        width: 60px;
        letter-spacing: -0.2px;
      }

      /* ============================================
         分隔线
         ============================================ */
      
      .nav-divider {
        height: 1px;
        margin: 16px 32px;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.1),
          transparent
        );
      }

      /* ============================================
         GitHub 区域（底部）
         ============================================ */
      
      .github-section {
        padding: 0 32px 24px;
      }

      .github-section-title {
        text-align: center;
        font-size: 13px;
        font-weight: 600;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 12px;
      }

      .github-link {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding: 14px 20px;
        text-decoration: none;
        color: inherit;
        transition: all 0.2s ease;
        border-radius: 12px;
      }

      .github-link:hover {
        background: rgba(88, 166, 255, 0.1);
      }

      .github-icon {
        font-size: 22px;
      }

      .github-name {
        font-size: 16px;
        font-weight: 600;
        color: var(--accent-primary);
      }

      /* ============================================
         移动端优化
         ============================================ */
      
      @media (max-width: 768px) {
        .section-nav-container {
          padding: 20px 24px;
        }

        .nav-item {
          padding: 12px 16px;
        }

        .nav-item .nav-icon {
          font-size: 20px;
        }

        .nav-item .nav-name {
          font-size: 15px;
        }

        .nav-divider {
          margin: 12px 24px;
        }

        .github-section {
          padding: 0 24px 20px;
        }
      }

      /* 小屏幕手机 */
      @media (max-width: 380px) {
        .section-nav-container {
          padding: 16px 20px;
        }

        .nav-item {
          padding: 10px 14px;
        }

        .nav-item .nav-icon {
          font-size: 18px;
          width: 28px;
        }

        .nav-item .nav-name {
          font-size: 14px;
          width: 56px;
        }

        .github-section {
          padding: 0 20px 16px;
        }
      }

      /* 侧边栏容器 */
      #nav-sidebar {
        background: rgba(13, 17, 23, 0.98);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
      }

      /* 滚动条美化 */
      #nav-sidebar::-webkit-scrollbar {
        width: 4px;
      }

      #nav-sidebar::-webkit-scrollbar-track {
        background: transparent;
      }

      #nav-sidebar::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 2px;
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
