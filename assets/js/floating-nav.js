/**
 * 移动端悬浮目录
 * 替代汉堡菜单，更便捷的导航方式
 */

(function() {
  'use strict';

  // 板块配置
  const SECTIONS = [
    { id: 'hero', icon: '🏠', name: '首页' },
    { id: 'about', icon: '👤', name: '关于' },
    { id: 'skills', icon: '⚡', name: '技能' },
    { id: 'projects', icon: '🚀', name: '项目' },
    { id: 'certificates', icon: '🏅', name: '荣誉' },
    { id: 'life', icon: '📷', name: '生活' },
    { id: 'quotes', icon: '💭', name: '好句' },
    { id: 'guestbook', icon: '✍️', name: '留言' },
    { id: 'contact', icon: '✉️', name: '联系' }
  ];

  // 初始化
  function init() {
    // 只在移动端显示
    if (window.innerWidth > 768) return;
    
    createFloatingNav();
    addStyles();
    bindEvents();
  }

  // 创建悬浮导航
  function createFloatingNav() {
    // 删除旧的汉堡菜单按钮
    const oldBtn = document.getElementById('hamburger-btn');
    if (oldBtn) oldBtn.remove();
    
    // 删除旧的侧边栏
    const oldSidebar = document.getElementById('nav-sidebar');
    if (oldSidebar) oldSidebar.remove();
    
    // 创建悬浮目录按钮
    const floatBtn = document.createElement('button');
    floatBtn.id = 'float-nav-btn';
    floatBtn.innerHTML = '☰';
    floatBtn.setAttribute('aria-label', '导航菜单');
    document.body.appendChild(floatBtn);
    
    // 创建悬浮目录面板
    const navPanel = document.createElement('div');
    navPanel.id = 'float-nav-panel';
    navPanel.innerHTML = `
      <div class="float-nav-header">
        <span>快速导航</span>
        <button id="close-float-nav">✕</button>
      </div>
      <div class="float-nav-list">
        ${SECTIONS.map(section => `
          <a href="#${section.id}" class="float-nav-item" data-section="${section.id}">
            <span class="float-nav-icon">${section.icon}</span>
            <span class="float-nav-name">${section.name}</span>
          </a>
        `).join('')}
      </div>
    `;
    document.body.appendChild(navPanel);
    
    // 创建遮罩层
    const overlay = document.createElement('div');
    overlay.id = 'float-nav-overlay';
    document.body.appendChild(overlay);
  }

  // 绑定事件
  function bindEvents() {
    // 打开导航
    const floatBtn = document.getElementById('float-nav-btn');
    const navPanel = document.getElementById('float-nav-panel');
    const overlay = document.getElementById('float-nav-overlay');
    const closeBtn = document.getElementById('close-float-nav');
    
    if (floatBtn) {
      floatBtn.addEventListener('click', () => {
        navPanel.classList.add('open');
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    }
    
    // 关闭导航
    const closeNav = () => {
      navPanel.classList.remove('open');
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    };
    
    if (closeBtn) closeBtn.addEventListener('click', closeNav);
    if (overlay) overlay.addEventListener('click', closeNav);
    
    // 点击导航项
    document.querySelectorAll('.float-nav-item').forEach(item => {
      item.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').slice(1);
        const target = document.getElementById(targetId);
        
        if (target) {
          closeNav();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
    
    // 滚动时高亮当前板块
    initScrollSpy();
  }

  // 滚动监听
  function initScrollSpy() {
    const items = document.querySelectorAll('.float-nav-item');
    
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
    if (document.getElementById('float-nav-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'float-nav-styles';
    style.textContent = `
      /* 悬浮导航按钮 */
      #float-nav-btn {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: linear-gradient(135deg, #58a6ff, #a371f7);
        color: white;
        border: none;
        font-size: 24px;
        cursor: pointer;
        box-shadow: 0 4px 20px rgba(88, 166, 255, 0.4);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
      }
      
      #float-nav-btn:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 24px rgba(88, 166, 255, 0.5);
      }
      
      #float-nav-btn:active {
        transform: scale(0.95);
      }
      
      /* 导航面板 */
      #float-nav-panel {
        position: fixed;
        bottom: 90px;
        right: 20px;
        width: 200px;
        background: rgba(13, 17, 23, 0.98);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        padding: 16px;
        z-index: 9998;
        opacity: 0;
        visibility: hidden;
        transform: translateY(20px) scale(0.9);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        max-height: 70vh;
        overflow-y: auto;
      }
      
      #float-nav-panel.open {
        opacity: 1;
        visibility: visible;
        transform: translateY(0) scale(1);
      }
      
      /* 面板头部 */
      .float-nav-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        padding-bottom: 12px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .float-nav-header span {
        font-size: 14px;
        font-weight: 600;
        color: var(--text-secondary);
      }
      
      #close-float-nav {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.1);
        border: none;
        color: var(--text-muted);
        font-size: 14px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      #close-float-nav:hover {
        background: rgba(255, 255, 255, 0.2);
        color: var(--text-primary);
      }
      
      /* 导航列表 */
      .float-nav-list {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      
      .float-nav-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border-radius: 12px;
        text-decoration: none;
        color: var(--text-primary);
        transition: all 0.2s ease;
      }
      
      .float-nav-item:hover {
        background: rgba(255, 255, 255, 0.05);
      }
      
      .float-nav-item.active {
        background: rgba(88, 166, 255, 0.15);
      }
      
      .float-nav-item.active .float-nav-name {
        color: var(--accent-primary);
        font-weight: 600;
      }
      
      .float-nav-icon {
        font-size: 20px;
        width: 28px;
        text-align: center;
      }
      
      .float-nav-name {
        font-size: 15px;
      }
      
      /* 遮罩层 */
      #float-nav-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 9997;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
      }
      
      #float-nav-overlay.open {
        opacity: 1;
        visibility: visible;
      }
      
      /* 桌面端隐藏 */
      @media (min-width: 769px) {
        #float-nav-btn,
        #float-nav-panel,
        #float-nav-overlay {
          display: none !important;
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
  
  // 窗口大小改变时重新检查
  window.addEventListener('resize', () => {
    const floatBtn = document.getElementById('float-nav-btn');
    if (window.innerWidth > 768 && floatBtn) {
      floatBtn.remove();
      document.getElementById('float-nav-panel')?.remove();
      document.getElementById('float-nav-overlay')?.remove();
    } else if (window.innerWidth <= 768 && !floatBtn) {
      init();
    }
  });

})();
