/* ================================================
   主脚本 - Main.js v2.0
   导航栏、主题切换、悬浮目录、动画
   ================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initTheme();
  initFloatingToc();
  initScrollAnimations();
  initCounterAnimations();
  initSkillBars();
  initBackToTop();
});

/* ===== 导航栏 ===== */
function initNavigation() {
  const hamburger = document.getElementById('hamburger-btn');
  const sidebar = document.getElementById('nav-sidebar');
  const overlay = document.getElementById('nav-overlay');
  const closeBtn = document.getElementById('nav-close');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!hamburger || !sidebar || !overlay) return;

  function openSidebar() {
    sidebar.classList.add('show');
    overlay.classList.add('show');
    hamburger.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    sidebar.classList.remove('show');
    overlay.classList.remove('show');
    hamburger.classList.remove('active');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    if (sidebar.classList.contains('show')) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });

  overlay.addEventListener('click', closeSidebar);
  closeBtn?.addEventListener('click', closeSidebar);

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeSidebar();
    });
  });

  // ESC 关闭
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('show')) {
      closeSidebar();
    }
  });
}

/* ===== 主题切换 ===== */
function initTheme() {
  const themeBtn = document.getElementById('theme-btn');
  const themeDropdown = document.getElementById('theme-dropdown');
  const themeOptions = document.querySelectorAll('.theme-option');

  if (!themeBtn || !themeDropdown) return;

  // 初始化主题
  const savedTheme = localStorage.getItem('theme') || 'dark';
  applyTheme(savedTheme);

  // 切换下拉菜单
  themeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    themeDropdown.classList.toggle('show');
  });

  // 点击外部关闭
  document.addEventListener('click', (e) => {
    if (!themeDropdown.contains(e.target) && !themeBtn.contains(e.target)) {
      themeDropdown.classList.remove('show');
    }
  });

  // 主题选项点击
  themeOptions.forEach(option => {
    option.addEventListener('click', () => {
      const mode = option.dataset.mode;
      
      if (mode === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyTheme(prefersDark ? 'dark' : 'light');
        localStorage.removeItem('theme');
      } else {
        applyTheme(mode);
        localStorage.setItem('theme', mode);
      }

      // 更新选中状态
      themeOptions.forEach(opt => opt.classList.remove('active'));
      option.classList.add('active');
      
      themeDropdown.classList.remove('show');
    });
  });

  // 更新初始选中状态
  const currentOption = document.querySelector(`.theme-option[data-mode="${savedTheme}"]`);
  if (currentOption) currentOption.classList.add('active');
}

function applyTheme(theme) {
  document.body.setAttribute('data-theme', theme);
  
  // 更新 meta theme-color
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.content = theme === 'dark' ? '#0d1117' : '#ffffff';
  }
}

/* ===== 悬浮目录 ===== */
function initFloatingToc() {
  const toc = document.querySelector('.floating-toc');
  if (!toc) return;

  const tocLinks = toc.querySelectorAll('.toc-link');
  const sections = document.querySelectorAll('section[id]');

  // 滚动时显示/隐藏目录
  let lastScrollY = 0;
  let ticking = false;

  function updateToc() {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    
    // 超过 hero 区域后显示目录
    const heroHeight = document.querySelector('.hero-section')?.offsetHeight || 400;
    
    if (scrollY > heroHeight) {
      toc.classList.add('visible');
    } else {
      toc.classList.remove('visible');
    }

    // 高亮当前章节
    let currentSection = '';
    
    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 150 && rect.bottom > 150) {
        currentSection = section.id;
      }
    });

    tocLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateToc();
        ticking = false;
      });
      ticking = true;
    }
  });

  // 点击目录平滑滚动
  tocLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 56;
        const targetPosition = target.offsetTop - navHeight - 20;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/* ===== 滚动动画 ===== */
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('[data-animate]');
  
  if (!animatedElements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  animatedElements.forEach(el => observer.observe(el));
}

/* ===== 数字计数动画 ===== */
function initCounterAnimations() {
  const counters = document.querySelectorAll('[data-count]');
  
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element) {
  const target = parseInt(element.dataset.count);
  const duration = 1500;
  const startTime = performance.now();
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(easeProgress * target);
    
    element.textContent = current;
    
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = target;
    }
  }
  
  requestAnimationFrame(update);
}

/* ===== 技能进度条 ===== */
function initSkillBars() {
  const skillBars = document.querySelectorAll('.skill-bar-fill');
  
  if (!skillBars.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const width = entry.target.dataset.width;
        entry.target.style.width = `${width}%`;
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  skillBars.forEach(bar => {
    bar.style.width = '0%';
    bar.style.transition = 'width 1s ease-out';
    observer.observe(bar);
  });
}

/* ===== 返回顶部 ===== */
function initBackToTop() {
  const btn = document.querySelector('[data-back-to-top]');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/* ===== 工具函数 ===== */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
