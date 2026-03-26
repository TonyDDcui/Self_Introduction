/**
 * 汉堡菜单增强 - 纵向板块导航
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
    { id: 'contact', icon: '💬', name: '联系' }
  ];

  // 添加板块导航到汉堡菜单
  function initSectionNav() {
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;

    // 在生活链接后添加分隔线
    const lifeLink = navLinks.querySelector('a[href="#life"]');
    if (!lifeLink) return;

    // 创建分隔线
    const divider = document.createElement('div');
    divider.className = 'nav-divider';
    divider.style.cssText = `
      height: 1px;
      background: rgba(255, 255, 255, 0.1);
      margin: 8px 0;
    `;

    // 创建板块导航标题
    const sectionTitle = document.createElement('div');
    sectionTitle.className = 'nav-section-title';
    sectionTitle.textContent = '📍 板块导航';
    sectionTitle.style.cssText = `
      font-size: 11px;
      color: var(--text-muted);
      padding: 8px 16px 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    `;

    // 在生活链接后插入
    lifeLink.parentNode.insertBefore(divider, lifeLink.nextSibling);
    divider.parentNode.insertBefore(sectionTitle, divider.nextSibling);

    // 添加所有板块链接
    SECTIONS.forEach(section => {
      const link = document.createElement('a');
      link.href = `#${section.id}`;
      link.className = 'nav-link nav-section-link';
      link.dataset.section = section.id;
      link.innerHTML = `
        <span>${section.icon}</span>
        <span>${section.name}</span>
      `;
      link.style.cssText = `
        padding: 10px 16px;
        font-size: 0.875rem;
      `;
      
      sectionTitle.parentNode.insertBefore(link, sectionTitle.nextSibling);
    });

    // 添加滚动监听，更新当前活跃板块
    initScrollSpy();
  }

  // 滚动监听 - 更新活跃板块
  function initScrollSpy() {
    const sectionLinks = document.querySelectorAll('.nav-section-link');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          sectionLinks.forEach(link => {
            if (link.dataset.section === sectionId) {
              link.classList.add('active');
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
    document.querySelectorAll('.nav-section-link').forEach(link => {
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
        }
      });
    });
  }

  // 关闭侧边栏
  function closeSidebar() {
    const sidebar = document.getElementById('nav-sidebar');
    const overlay = document.getElementById('nav-overlay');
    
    if (sidebar) {
      sidebar.classList.remove('open');
      sidebar.setAttribute('aria-hidden', 'true');
    }
    
    if (overlay) {
      overlay.classList.remove('active');
    }
    
    document.body.style.overflow = '';
  }

  // 初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initSectionNav();
      initSmoothScroll();
    });
  } else {
    initSectionNav();
    initSmoothScroll();
  }

})();
