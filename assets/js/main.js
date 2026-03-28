/**
 * Apple iPhone 17 Pro 风格交互脚本
 */

(function() {
  'use strict';

  // ===== 主题切换 =====
  const body = document.body;
  const themeToggle = document.getElementById('theme-toggle');

  // 初始化主题
  const savedTheme = localStorage.getItem('theme') || 'dark';
  body.setAttribute('data-theme', savedTheme);

  themeToggle.addEventListener('click', () => {
    const current = body.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });

  // ===== 移动菜单 =====
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileNav.classList.toggle('open');
  });

  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileNav.classList.remove('open');
    });
  });

  // ===== 滚动动画 =====
  const animateObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('[data-animate]').forEach(el => {
    animateObserver.observe(el);
  });

  // ===== 数字计数动画 =====
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-target'));
        animateCount(el, target);
        countObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-num').forEach(el => {
    countObserver.observe(el);
  });

  function animateCount(el, target) {
    const duration = 1500;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(target * eased);
      
      el.textContent = current;
      
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target;
      }
    }

    requestAnimationFrame(update);
  }

  // ===== 技能进度条动画 =====
  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const width = el.getAttribute('data-width');
        setTimeout(() => {
          el.style.width = width + '%';
        }, 200);
        skillObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.skill-fill').forEach(el => {
    skillObserver.observe(el);
  });

  // ===== 导航栏滚动效果 =====
  const nav = document.getElementById('nav');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.style.background = body.getAttribute('data-theme') === 'light'
        ? 'rgba(251,251,253,0.92)'
        : 'rgba(0,0,0,0.92)';
    } else {
      nav.style.background = body.getAttribute('data-theme') === 'light'
        ? 'rgba(251,251,253,0.72)'
        : 'rgba(0,0,0,0.72)';
    }
  });

  // ===== 平滑滚动 =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const offset = nav.offsetHeight;
        const position = target.offsetTop - offset;
        window.scrollTo({ top: position, behavior: 'smooth' });
      }
    });
  });

  // ===== 粒子背景 =====
  const particlesCanvas = document.getElementById('particles');
  if (particlesCanvas) {
    const ctx = particlesCanvas.getContext('2d');
    let particles = [];
    const PARTICLE_COUNT = 40;

    function resize() {
      particlesCanvas.width = window.innerWidth;
      particlesCanvas.height = window.innerHeight;
    }

    function createParticle() {
      return {
        x: Math.random() * particlesCanvas.width,
        y: Math.random() * particlesCanvas.height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.3 + 0.1
      };
    }

    function initParticles() {
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(createParticle());
      }
    }

    function drawParticles() {
      ctx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);
      
      const isDark = body.getAttribute('data-theme') !== 'light';
      
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? `rgba(41, 151, 255, ${p.alpha})`
          : `rgba(0, 119, 237, ${p.alpha * 0.6})`;
        ctx.fill();
        
        p.x += p.vx;
        p.y += p.vy;
        
        if (p.x < 0 || p.x > particlesCanvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > particlesCanvas.height) p.vy *= -1;
      });
      
      requestAnimationFrame(drawParticles);
    }

    resize();
    initParticles();
    drawParticles();

    window.addEventListener('resize', () => {
      resize();
      initParticles();
    });
  }

})();
