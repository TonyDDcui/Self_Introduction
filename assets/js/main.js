/* ================================================
   主脚�?- Main JavaScript
   ================================================ */

(function() {
  'use strict';

  // ===== 主题管理 =====
  const ThemeManager = {
    KEY: 'portfolio-theme',
    init: function() {
      this.restore();
      this.bindEvents();
    },
    restore: function() {
      var saved = localStorage.getItem(this.KEY);
      if (saved === 'light' || saved === 'dark') {
        document.documentElement.setAttribute('data-theme', saved);
      } else {
        var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
      }
      this.updateActiveOption();
    },
    setTheme: function(mode) {
      localStorage.setItem(this.KEY, mode);
      if (mode === 'system') {
        var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
      } else {
        document.documentElement.setAttribute('data-theme', mode);
      }
      this.updateActiveOption();
    },
    updateActiveOption: function() {
      var saved = localStorage.getItem(this.KEY);
      var current = saved || 'system';
      var opts = document.querySelectorAll('.theme-option');
      for (var i = 0; i < opts.length; i++) {
        opts[i].classList.toggle('active', opts[i].dataset.mode === current);
      }
    },
    bindEvents: function() {
      var themeBtn = document.getElementById('theme-btn');
      var dropdown = document.getElementById('theme-dropdown');
      if (themeBtn && dropdown) {
        themeBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          dropdown.classList.toggle('show');
        });
        var opts = dropdown.querySelectorAll('.theme-option');
        for (var i = 0; i < opts.length; i++) {
          opts[i].addEventListener('click', (function(opt) {
            return function() {
              ThemeManager.setTheme(opt.dataset.mode);
              dropdown.classList.remove('show');
            };
          })(opts[i]));
        }
        document.addEventListener('click', function() {
          dropdown.classList.remove('show');
        });
      }
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function() {
        if (!localStorage.getItem(ThemeManager.KEY)) {
          var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        }
      });
    }
  };

  // ===== 侧边导航 =====
  var Sidebar = {
    init: function() {
      this.hamburger = document.getElementById('hamburger-btn');
      this.overlay = document.getElementById('nav-overlay');
      this.sidebar = document.getElementById('nav-sidebar');
      this.closeBtn = document.getElementById('nav-close');
      if (!this.hamburger) return;
      this.bindEvents();
    },
    bindEvents: function() {
      var self = this;
      this.hamburger.addEventListener('click', function() { self.toggle(); });
      if (this.closeBtn) this.closeBtn.addEventListener('click', function() { self.close(); });
      if (this.overlay) this.overlay.addEventListener('click', function() { self.close(); });
      var links = this.sidebar.querySelectorAll('.nav-link');
      for (var i = 0; i < links.length; i++) {
        links[i].addEventListener('click', function() { self.close(); });
      }
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') self.close();
      });
    },
    toggle: function() {
      this.hamburger.classList.toggle('active');
      this.sidebar.classList.toggle('show');
      if (this.overlay) this.overlay.classList.toggle('show');
      document.body.style.overflow = this.sidebar.classList.contains('show') ? 'hidden' : '';
    },
    open: function() {
      this.hamburger.classList.add('active');
      this.sidebar.classList.add('show');
      if (this.overlay) this.overlay.classList.add('show');
      document.body.style.overflow = 'hidden';
    },
    close: function() {
      this.hamburger.classList.remove('active');
      this.sidebar.classList.remove('show');
      if (this.overlay) this.overlay.classList.remove('show');
      document.body.style.overflow = '';
    }
  };

  // ===== 平滑滚动 =====
  var SmoothScroll = {
    init: function() {
      var self = this;
      document.addEventListener('click', function(e) {
        var link = e.target.closest('a[href^="#"]');
        if (!link) return;
        var targetId = link.getAttribute('href');
        if (!targetId || targetId === '#') return;
        var target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          var headerHeight = 60;
          var top = target.getBoundingClientRect().top + window.scrollY - headerHeight;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }
      });
    }
  };

  // ===== 数字动画 =====
  var CounterAnimation = {
    animate: function(element, target, duration) {
      duration = duration || 1500;
      var startTime = performance.now();
      var update = function(currentTime) {
        var elapsed = currentTime - startTime;
        var progress = Math.min(elapsed / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = Math.floor(eased * target);
        if (progress < 1) requestAnimationFrame(update);
        else element.textContent = target;
      };
      requestAnimationFrame(update);
    },
    init: function() {
      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            CounterAnimation.animate(entry.target, parseInt(entry.target.dataset.count));
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      var counters = document.querySelectorAll('[data-count]');
      for (var i = 0; i < counters.length; i++) {
        observer.observe(counters[i]);
      }
    }
  };

  // ===== 技能条动画 =====
  var SkillBars = {
    init: function() {
      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            entry.target.style.width = entry.target.dataset.width + '%';
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      var bars = document.querySelectorAll('.skill-bar-fill');
      for (var i = 0; i < bars.length; i++) {
        observer.observe(bars[i]);
      }
    }
  };

  // ===== 返回顶部 =====
  var BackToTop = {
    init: function() {
      var btn = document.querySelector('[data-back-to-top]');
      if (!btn) return;
      window.addEventListener('scroll', function() {
        btn.classList.toggle('visible', window.scrollY > 400);
      });
      btn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  };

  // ===== 初始�?=====
  function init() {
    ThemeManager.init();
    Sidebar.init();
    SmoothScroll.init();
    CounterAnimation.init();
    SkillBars.init();
    BackToTop.init();
    console.log('Portfolio loaded');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
