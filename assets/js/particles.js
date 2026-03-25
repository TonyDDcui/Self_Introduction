/* ================================================
   粒子动画 - Particle Animation
   NVIDIA 风格动态粒子背景
   ================================================ */

class ParticleNetwork {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: null, y: null, radius: 150 };
    this.animated = true;

    this.init();
    this.animate();
    this.setupEventListeners();
  }

  init() {
    this.resize();
    this.createParticles();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createParticles() {
    this.particles = [];
    const particleCount = Math.min(Math.floor((this.canvas.width * this.canvas.height) / 15000), 100);

    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2
      });
    }
  }

  setupEventListeners() {
    window.addEventListener('resize', () => {
      this.resize();
      this.createParticles();
    });

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    window.addEventListener('mouseout', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });

    // 页面可见性
    document.addEventListener('visibilitychange', () => {
      this.animated = !document.hidden;
      if (this.animated) this.animate();
    });
  }

  drawParticle(particle) {
    this.ctx.beginPath();
    this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    this.ctx.fillStyle = `rgba(0, 217, 255, ${particle.opacity})`;
    this.ctx.fill();
  }

  drawConnection(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 120) {
      this.ctx.beginPath();
      this.ctx.moveTo(p1.x, p1.y);
      this.ctx.lineTo(p2.x, p2.y);
      
      const opacity = (1 - distance / 120) * 0.3;
      this.ctx.strokeStyle = `rgba(0, 217, 255, ${opacity})`;
      this.ctx.lineWidth = 0.5;
      this.ctx.stroke();
    }
  }

  drawMouseConnection(particle) {
    if (this.mouse.x === null || this.mouse.y === null) return;

    const dx = particle.x - this.mouse.x;
    const dy = particle.y - this.mouse.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < this.mouse.radius) {
      const opacity = (1 - distance / this.mouse.radius) * 0.5;
      
      this.ctx.beginPath();
      this.ctx.moveTo(particle.x, particle.y);
      this.ctx.lineTo(this.mouse.x, this.mouse.y);
      this.ctx.strokeStyle = `rgba(124, 58, 237, ${opacity})`;
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    }
  }

  updateParticle(particle) {
    particle.x += particle.speedX;
    particle.y += particle.speedY;

    // 边界检测
    if (particle.x < 0 || particle.x > this.canvas.width) {
      particle.speedX *= -1;
    }
    if (particle.y < 0 || particle.y > this.canvas.height) {
      particle.speedY *= -1;
    }

    // 鼠标交互
    this.drawMouseConnection(particle);
  }

  animate() {
    if (!this.animated) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 绘制粒子
    this.particles.forEach(particle => {
      this.drawParticle(particle);
      this.updateParticle(particle);
    });

    // 绘制连接线
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        this.drawConnection(this.particles[i], this.particles[j]);
      }
    }

    requestAnimationFrame(() => this.animate());
  }
}

// 初始化粒子系统
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('particle-canvas');
  if (canvas) {
    new ParticleNetwork(canvas);
  }
});
