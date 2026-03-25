/* ================================================
   主脚本 - Main JavaScript
   ================================================ */

(function() {
  'use strict';

  // ===== 主题管理 =====
  const ThemeManager = {
    KEY: 'portfolio-theme',
    DARK: 'dark',
    LIGHT: 'light',
    SYSTEM: 'system',
    currentMode: 'system',

    init() {
      this.restore();
      this.bindEvents();
      this.updateThemeIcon();
    },

    restore() {
      const saved = localStorage.getItem(this.KEY);
      if (saved === 'light' || saved === 'dark') {
        this.currentMode = saved;
        document.documentElement.setAttribute('data-theme', saved);
      } else {
        // 系统偏好
        this.currentMode = 'system';
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
      }
      this.updateActiveOption();
    },

    setTheme(mode) {
      this.currentMode = mode;
      localStorage.setItem(this.KEY, mode);
      
      if (mode === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
      } else {
        document.documentElement.setAttribute('data-theme', mode);
      }
      
      this.updateThemeIcon();
      this.updateActiveOption();
    },

    updateThemeIcon() {
      // 图标切换由 CSS 处理
    },

    updateActiveOption() {
      document.querySelectorAll('.theme-option').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.mode === this.currentMode);
      });
    },

    bindEvents() {
      // 下拉菜单切换
      const btn = document.querySelector('.theme-btn');
      const dropdown = document.getElementById('theme-dropdown');
      
      if (btn && dropdown) {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          dropdown.classList.toggle('show');
        });

        // 选项点击
        dropdown.querySelectorAll('.theme-option').forEach(opt => {
          opt.addEventListener('click', () => {
            this.setTheme(opt.dataset.mode);
            dropdown.classList.remove('show');
          });
        });

        // 点击外部关闭
        document.addEventListener('click', () => {
          dropdown.classList.remove('show');
        });
      }

      // 系统主题变化监听
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (this.currentMode === 'system') {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        }
      });
    }
  };

  // ===== 侧边栏目录 =====
  const Sidebar = {
    sidebar: null,
    overlay: null,
    menuBtn: null,
    closeBtn: null,

    init() {
      this.sidebar = document.getElementById('sidebar');
      this.overlay = document.getElementById('sidebar-overlay');
      this.menuBtn = document.getElementById('menu-btn');
      this.closeBtn = document.getElementById('sidebar-close');

      if (!this.sidebar) return;

      this.bindEvents();
    },

    bindEvents() {
      // 打开
      if (this.menuBtn) {
        this.menuBtn.addEventListener('click', () => this.open());
      }

      // 关闭
      if (this.closeBtn) {
        this.closeBtn.addEventListener('click', () => this.close());
      }

      if (this.overlay) {
        this.overlay.addEventListener('click', () => this.close());
      }

      // 链接点击关闭
      this.sidebar.querySelectorAll('.sidebar-link').forEach(link => {
        link.addEventListener('click', () => this.close());
      });

      // ESC 关闭
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') this.close();
      });
    },

    open() {
      this.sidebar.classList.add('show');
      this.overlay.classList.add('show');
      document.body.style.overflow = 'hidden';
    },

    close() {
      this.sidebar.classList.remove('show');
      this.overlay.classList.remove('show');
      document.body.style.overflow = '';
    }
  };

  // ===== 平滑滚动 =====
  const SmoothScroll = {
    init() {
      document.addEventListener('click', (e) => {
        const link = e.target.closest('[href^="#"], [data-scroll-to]');
        if (!link) return;

        let targetId;
        if (link.hasAttribute('data-scroll-to')) {
          targetId = link.getAttribute('data-scroll-to');
        } else {
          targetId = link.getAttribute('href');
        }

        if (!targetId || targetId === '#') return;

        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          const headerHeight = document.querySelector('.github-header')?.offsetHeight || 60;
          const top = target.getBoundingClientRect().top + window.scrollY - headerHeight;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    }
  };

  // ===== 移动端菜单 =====
  const MobileMenu = {
    init() {
      const toggle = document.querySelector('[data-menu-toggle]');
      const menu = document.querySelector('[data-mobile-menu]');

      if (!toggle || !menu) return;

      toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        menu.classList.toggle('active');
      });

      menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          toggle.classList.remove('active');
          menu.classList.remove('active');
        });
      });
    }
  };

  // ===== 数字动画 =====
  const CounterAnimation = {
    animate(element, target, duration = 1500) {
      const start = 0;
      const startTime = performance.now();

      const update = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(eased * target);
        element.textContent = current;

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          element.textContent = target;
        }
      };

      requestAnimationFrame(update);
    },

    init() {
      const counters = document.querySelectorAll('[data-count]');
      if (!counters.length) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const target = parseInt(entry.target.getAttribute('data-count'));
            this.animate(entry.target, target);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });

      counters.forEach(counter => observer.observe(counter));
    }
  };

  // ===== 技能条动画 =====
  const SkillBars = {
    init() {
      const bars = document.querySelectorAll('.skill-bar-fill');
      if (!bars.length) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const width = entry.target.getAttribute('data-width');
            entry.target.style.width = width + '%';
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });

      bars.forEach(bar => observer.observe(bar));
    }
  };

  // ===== 滚动动画 =====
  const ScrollAnimations = {
    init() {
      const elements = document.querySelectorAll('[data-animate]');
      if (!elements.length) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      elements.forEach(el => observer.observe(el));
    }
  };

  // ===== 返回顶部 =====
  const BackToTop = {
    init() {
      const btn = document.querySelector('[data-back-to-top]');
      if (!btn) return;

      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            if (window.scrollY > 400) {
              btn.classList.add('visible');
            } else {
              btn.classList.remove('visible');
            }
            ticking = false;
          });
          ticking = true;
        }
      });

      btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  };

  // ===== 初始化 =====
  function init() {
    ThemeManager.init();
    Sidebar.init();
    SmoothScroll.init();
    MobileMenu.init();
    CounterAnimation.init();
    SkillBars.init();
    ScrollAnimations.init();
    BackToTop.init();

    console.log('✨ Portfolio loaded');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
