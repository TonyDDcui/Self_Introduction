/* ================================================
   主脚本 - Main JavaScript
   全局交互与功能
   ================================================ */

(function() {
  'use strict';

  // ===== 主题管理 =====
  const ThemeManager = {
    KEY: 'portfolio-theme',
    DARK: 'dark',
    LIGHT: 'light',

    init() {
      this.restore();
      this.bindEvents();
    },

    restore() {
      const saved = localStorage.getItem(this.KEY);
      const theme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? this.DARK : this.LIGHT);
      document.documentElement.setAttribute('data-theme', theme);
      this.updateIcon(theme);
    },

    toggle() {
      const current = document.documentElement.getAttribute('data-theme') || this.DARK;
      const next = current === this.DARK ? this.LIGHT : this.DARK;
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem(this.KEY, next);
      this.updateIcon(next);
    },

    updateIcon(theme) {
      const icon = document.querySelector('.theme-icon');
      if (icon) {
        icon.textContent = theme === this.DARK ? '🌙' : '☀️';
      }
    },

    bindEvents() {
      document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-theme-toggle]');
        if (btn) this.toggle();
      });
    }
  };

  // ===== 平滑滚动 =====
  const SmoothScroll = {
    init() {
      document.addEventListener('click', (e) => {
        const link = e.target.closest('[data-scroll-to], a[href^="#"]');
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
          const navHeight = document.querySelector('.glass-nav')?.offsetHeight || 72;
          const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    }
  };

  // ===== 导航栏效果 =====
  const NavbarEffect = {
    init() {
      const nav = document.querySelector('.glass-nav');
      if (!nav) return;

      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            if (window.scrollY > 50) {
              nav.classList.add('scrolled');
            } else {
              nav.classList.remove('scrolled');
            }
            ticking = false;
          });
          ticking = true;
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

      // 点击菜单项关闭
      menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          toggle.classList.remove('active');
          menu.classList.remove('active');
        });
      });

      // 点击外部关闭
      document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && !toggle.contains(e.target)) {
          toggle.classList.remove('active');
          menu.classList.remove('active');
        }
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
      }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

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

  // ===== 懒加载图片 =====
  const LazyLoad = {
    init() {
      if ('loading' in HTMLImageElement.prototype) {
        document.querySelectorAll('img[loading="lazy"]').forEach(img => {
          img.src = img.dataset.src || img.src;
        });
      } else {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target;
              img.src = img.dataset.src || img.src;
              observer.unobserve(img);
            }
          });
        });

        document.querySelectorAll('img[data-src]').forEach(img => observer.observe(img));
      }
    }
  };

  // ===== 初始化 =====
  function init() {
    ThemeManager.init();
    SmoothScroll.init();
    NavbarEffect.init();
    MobileMenu.init();
    CounterAnimation.init();
    SkillBars.init();
    ScrollAnimations.init();
    BackToTop.init();
    LazyLoad.init();

    console.log('✨ Portfolio loaded');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
