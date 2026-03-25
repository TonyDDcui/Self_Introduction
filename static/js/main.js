/* ================================================
   动画和交互脚本 - Animation & Interaction Logic
   ================================================ */

(function() {
  'use strict';

  // ===== 主题切换 =====
  const ThemeManager = {
    THEME_KEY: 'blog-theme',
    LIGHT: 'light',
    DARK: 'dark',

    init() {
      this.setupThemeToggle();
      this.restoreTheme();
    },

    setupThemeToggle() {
      const toggleBtn = document.querySelector('[data-theme-toggle]');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', () => this.toggleTheme());
      }
    },

    toggleTheme() {
      const html = document.documentElement;
      const current = html.getAttribute('data-theme') || this.DARK;
      const next = current === this.DARK ? this.LIGHT : this.DARK;

      html.setAttribute('data-theme', next);
      localStorage.setItem(this.THEME_KEY, next);
      this.updateThemeIcon(next);

      // Add animation class only on click
      const toggleBtn = document.querySelector('[data-theme-toggle]');
      if (toggleBtn && window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
        toggleBtn.style.animation = 'none';
        setTimeout(() => {
          toggleBtn.style.animation = 'spin 0.8s var(--ease-out) forwards';
        }, 10);
      }
    },

    restoreTheme() {
      const saved = localStorage.getItem(this.THEME_KEY);
      const html = document.documentElement;

      if (saved) {
        html.setAttribute('data-theme', saved);
      } else {
        // 根据系统偏好设置
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        html.setAttribute('data-theme', prefersDark ? this.DARK : this.LIGHT);
      }

      this.updateThemeIcon(html.getAttribute('data-theme'));
    },

    updateThemeIcon(theme) {
      const icon = document.querySelector('[data-theme-icon]');
      if (!icon) return;

      if (theme === this.DARK) {
        icon.innerHTML = '☀️'; // 太阳图标表示可切换到浅色
      } else {
        icon.innerHTML = '🌙'; // 月亮图标表示可切换到深色
      }
    }
  };

  // ===== 滚动动画 =====
  const ScrollAnimations = {
    observerOptions: {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    },

    init() {
      this.setupObserver();
      this.setupParallax();
    },

    setupObserver() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, this.observerOptions);

      document.querySelectorAll('[data-animate]').forEach(el => {
        observer.observe(el);
      });
    },

    setupParallax() {
      const parallaxElements = document.querySelectorAll('[data-parallax]');
      if (parallaxElements.length === 0) return;

      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            const scrolled = window.pageYOffset;
            parallaxElements.forEach(el => {
              const speed = el.getAttribute('data-parallax') || 0.5;
              el.style.transform = `translateY(${scrolled * speed}px)`;
            });
            ticking = false;
          });
          ticking = true;
        }
      });
    }
  };

  // ===== 数字计数动画 =====
  const Counter = {
    animateValue(element, start, end, duration) {
      let startTimestamp = null;

      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);

        element.textContent = value.toLocaleString();

        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };

      requestAnimationFrame(step);
    },

    init() {
      const counters = document.querySelectorAll('[data-counter]');
      counters.forEach(counter => {
        const end = parseInt(counter.getAttribute('data-counter'));
        const duration = parseInt(counter.getAttribute('data-duration') || '1500');

        // 使用IntersectionObserver来触发计数
        const observer = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting) {
            this.animateValue(counter, 0, end, duration);
            observer.unobserve(counter);
          }
        }, { threshold: 0.5 });

        observer.observe(counter);
      });
    }
  };

  // ===== 平滑滚动到指定位置 =====
  const SmoothScroll = {
    init() {
      document.addEventListener('click', (e) => {
        const trigger = e.target.closest('[data-scroll-to]');
        if (!trigger) return;

        e.preventDefault();
        const target = document.querySelector(trigger.getAttribute('data-scroll-to'));
        if (!target) return;

        target.scrollIntoView({ behavior: 'smooth' });
      });
    }
  };

  // ===== 导航栏粘性效果 =====
  const NavigationBar = {
    init() {
      const nav = document.querySelector('[data-navbar]');
      if (!nav) return;

      let ticking = false;
      const checkScroll = () => {
        if (window.pageYOffset > 50) {
          nav.classList.add('scrolled');
        } else {
          nav.classList.remove('scrolled');
        }
        ticking = false;
      };

      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(checkScroll);
          ticking = true;
        }
      });
    }
  };

  // ===== 移动菜单切换 =====
  const MobileMenu = {
    init() {
      const toggle = document.querySelector('[data-menu-toggle]');
      const menu = document.querySelector('[data-mobile-menu]');

      if (!toggle || !menu) return;

      toggle.addEventListener('click', () => {
        menu.classList.toggle('active');
        toggle.classList.toggle('active');
      });

      // 点击菜单项后关闭菜单
      menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          menu.classList.remove('active');
          toggle.classList.remove('active');
        });
      });
    }
  };

  // ===== 鼠标跟踪效果（可选） =====
  const MouseTracker = {
    init() {
      const tracked = document.querySelectorAll('[data-mouse-track]');
      if (tracked.length === 0) return;

      let ticking = false;
      let lastMouseX = 0;
      let lastMouseY = 0;

      document.addEventListener('mousemove', (e) => {
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;

        if (!ticking) {
          requestAnimationFrame(() => {
            tracked.forEach(element => {
              const rect = element.getBoundingClientRect();
              const elementCenterX = rect.left + rect.width / 2;
              const elementCenterY = rect.top + rect.height / 2;

              const angle = Math.atan2(lastMouseY - elementCenterY, lastMouseX - elementCenterX);
              const distance = Math.min(50, Math.hypot(lastMouseX - elementCenterX, lastMouseY - elementCenterY) / 10);

              element.style.setProperty('--mouse-angle', angle);
              element.style.setProperty('--mouse-distance', distance + 'px');
            });
            ticking = false;
          });
          ticking = true;
        }
      });
    }
  };

  // ===== 复制到剪贴板 =====
  const CopyToClipboard = {
    init() {
      document.addEventListener('click', (e) => {
        const trigger = e.target.closest('[data-copy]');
        if (!trigger) return;

        const text = trigger.getAttribute('data-copy');
        navigator.clipboard.writeText(text).then(() => {
          const originalText = trigger.textContent;
          trigger.textContent = '已复制！';
          setTimeout(() => {
            trigger.textContent = originalText;
          }, 2000);
        });
      });
    }
  };

  // ===== 返回顶部按钮 =====
  const BackToTop = {
    init() {
      const btn = document.querySelector('[data-back-to-top]');
      if (!btn) return;

      let ticking = false;
      const checkVisibility = () => {
        if (window.pageYOffset > 300) {
          btn.classList.add('visible');
        } else {
          btn.classList.remove('visible');
        }
        ticking = false;
      };

      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(checkVisibility);
          ticking = true;
        }
      });

      btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  };

  // ===== 图片懒加载 =====
  const LazyLoad = {
    init() {
      const images = document.querySelectorAll('[data-src]');
      if (!('IntersectionObserver' in window)) {
        // 降级处理
        images.forEach(img => {
          img.src = img.getAttribute('data-src');
        });
        return;
      }

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.getAttribute('data-src');
            img.classList.add('loaded');
            observer.unobserve(img);
          }
        });
      });

      images.forEach(img => observer.observe(img));
    }
  };

  // ===== 初始化所有模块 =====
  function init() {
    ThemeManager.init();
    ScrollAnimations.init();
    Counter.init();
    SmoothScroll.init();
    NavigationBar.init();
    MobileMenu.init();
    MouseTracker.init();
    CopyToClipboard.init();
    BackToTop.init();
    LazyLoad.init();

    // 简单的页面加载完成提示
    console.log('🚀 博客已加载完成');
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
