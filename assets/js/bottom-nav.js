/**
 * 简洁底部导航 - 替代汉堡菜单
 */

(function() {
  'use strict';

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

  function init() {
    createBottomNav();
    addStyles();
    bindEvents();
    initScrollSpy();
  }

  function createBottomNav() {
    // 如果已存在则删除
    const existing = document.getElementById('bottom-nav');
    if (existing) existing.remove();

    const nav = document.createElement('nav');
    nav.id = 'bottom-nav';
    nav.innerHTML = `
      <div class="bottom-nav-container">
        ${SECTIONS.map(section => `
          <a href="#${section.id}" class="bottom-nav-item" data-section="${section.id}">
            <span class="nav-icon">${section.icon}</span>
            <span class="nav-name">${section.name}</span>
          </a>
        `).join('')}
      </div>
    `;
    document.body.appendChild(nav);
  }

  function bindEvents() {
    document.querySelectorAll('.bottom-nav-item').forEach(item => {
      item.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').slice(1);
        const target = document.getElementById(targetId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  function initScrollSpy() {
    const items = document.querySelectorAll('.bottom-nav-item');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          items.forEach(item => {
            item.classList.toggle('active', item.dataset.section === sectionId);
          });
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });

    SECTIONS.forEach(section => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });
  }

  function addStyles() {
    if (document.getElementById('bottom-nav-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'bottom-nav-styles';
    style.textContent = `
      #bottom-nav {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(13, 17, 23, 0.95);
        backdrop-filter: blur(20px);
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        z-index: 9999;
        padding: 8px 0;
      }
      
      .bottom-nav-container {
        display: flex;
        justify-content: center;
        gap: 8px;
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 16px;
        overflow-x: auto;
        scrollbar-width: none;
      }
      
      .bottom-nav-container::-webkit-scrollbar {
        display: none;
      }
      
      .bottom-nav-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 8px 12px;
        text-decoration: none;
        color: var(--text-muted);
        border-radius: 12px;
        transition: all 0.2s ease;
        white-space: nowrap;
        min-width: 60px;
      }
      
      .bottom-nav-item:hover {
        background: rgba(255, 255, 255, 0.05);
        color: var(--text-primary);
      }
      
      .bottom-nav-item.active {
        background: rgba(88, 166, 255, 0.15);
        color: var(--accent-primary);
      }
      
      .bottom-nav-item .nav-icon {
        font-size: 20px;
      }
      
      .bottom-nav-item .nav-name {
        font-size: 11px;
        font-weight: 500;
      }
      
      /* 为底部导航留出空间 */
      body {
        padding-bottom: 80px !important;
      }
      
      @media (max-width: 768px) {
        .bottom-nav-item {
          padding: 6px 10px;
          min-width: 52px;
        }
        
        .bottom-nav-item .nav-icon {
          font-size: 18px;
        }
        
        .bottom-nav-item .nav-name {
          font-size: 10px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
