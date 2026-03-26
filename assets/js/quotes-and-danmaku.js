/**
 * 好句分享和页面弹幕效果
 */

(function() {
  'use strict';

  // 好句数据库
  const QUOTES = [
    {
      text: '从你的全世界路过，我只想陪你走一段。',
      author: '张嘉佳《从你的全世界路过》'
    },
    {
      text: '人生就像一场旅行，不必在乎目的地，在乎的是沿途的风景和看风景的心情。',
      author: '王小波'
    },
    {
      text: '明月几时有，把酒问青天。',
      author: '苏轼《水调歌头》'
    },
    {
      text: '天生我材必有用，千金散尽还复来。',
      author: '李白《将进酒》'
    },
    {
      text: '长风破浪会有时，直挂云帆济沧海。',
      author: '李白《行路难》'
    },
    {
      text: '不畏浮云遮望眼，自缘身在最高层。',
      author: '王安石《登飞来峰》'
    },
    {
      text: '人生如逆旅，我亦是行人。',
      author: '苏轼'
    },
    {
      text: '生活就像海洋，只有意志坚强的人才能到达彼岸。',
      author: '马克思'
    },
    {
      text: '每一个不曾起舞的日子，都是对生命的辜负。',
      author: '尼采'
    },
    {
      text: '我们的生活就像旅行，思想是导游。',
      author: '卢梭'
    },
    {
      text: '世界很大，我想去看看。',
      author: '现代名言'
    },
    {
      text: '做一个有趣的人，比做一个有钱的人更重要。',
      author: '现代哲学'
    },
    {
      text: '你的努力，会成为你最好的底气。',
      author: '现代励志'
    },
    {
      text: '所有的失败，都是为了成功做准备。',
      author: '现代励志'
    },
    {
      text: '生活不是等待风暴过去，而是学会在雨中跳舞。',
      author: '现代哲学'
    }
  ];

  // 弹幕文案
  const DANMAKU_TEXTS = [
    '✨ 用代码驱动未来',
    '🚀 探索技术的无限可能',
    '💡 创新改变世界',
    '🎯 坚持梦想，永不放弃',
    '⚡ 从微控制器到云端',
    '🌟 技术改变生活',
    '💻 代码即艺术',
    '🔧 工程师的浪漫',
    '🎨 设计与代码的完美结合',
    '🌍 连接世界的力量'
  ];

  /**
   * 初始化好句分享板块
   */
  function initQuotesSection() {
    const container = document.querySelector('.quotes-grid');
    if (!container) return;

    // 随机选择6条好句
    const selectedQuotes = shuffleArray([...QUOTES]).slice(0, 6);

    container.innerHTML = selectedQuotes.map(quote => `
      <div class="quote-card" data-quote="${quote.text}">
        <div class="quote-content">
          <div class="quote-text">"${quote.text}"</div>
          <div class="quote-author">${quote.author}</div>
        </div>
      </div>
    `).join('');

    // 添加点击复制功能
    container.querySelectorAll('.quote-card').forEach(card => {
      card.addEventListener('click', function() {
        const text = this.dataset.quote;
        copyToClipboard(text);
        showNotification('已复制到剪贴板！');
      });
    });
  }

  /**
   * 初始化页面弹幕
   */
  function initDanmaku() {
    const container = document.querySelector('.danmaku-container');
    if (!container) return;

    let index = 0;

    function addDanmaku() {
      const text = DANMAKU_TEXTS[index % DANMAKU_TEXTS.length];
      const item = document.createElement('div');
      item.className = 'danmaku-item';
      item.textContent = text;

      // 随机高度
      const randomTop = Math.random() * 30 + 15;
      item.style.top = randomTop + 'px';

      // 随机速度
      const randomDuration = 12 + Math.random() * 8;
      item.style.animationDuration = randomDuration + 's';

      // 随机颜色
      const colors = [
        'var(--accent-primary)',
        'var(--accent-secondary)',
        '#39d353',
        '#79c0ff',
        '#d29922'
      ];
      item.style.color = colors[Math.floor(Math.random() * colors.length)];

      container.appendChild(item);

      // 动画完成后移除
      setTimeout(() => {
        item.remove();
      }, randomDuration * 1000);

      index++;
    }

    // 每3秒添加一条弹幕
    setInterval(addDanmaku, 3000);

    // 初始化时立即添加一条
    addDanmaku();
  }

  /**
   * 初始化模块导航
   */
  function initModulesNav() {
    const nav = document.querySelector('.modules-nav');
    if (!nav) return;

    const modules = [
      { icon: '⚡', name: '首页', href: '#hero' },
      { icon: '👤', name: '关于', href: '#about' },
      { icon: '🛠️', name: '技能', href: '#skills' },
      { icon: '🚀', name: '项目', href: '#projects' },
      { icon: '🐙', name: 'GitHub', href: '#github' },
      { icon: '🏆', name: '荣誉', href: '#certificates' },
      { icon: '📸', name: '生活', href: '#life' },
      { icon: '💬', name: '联系', href: '#contact' },
      { icon: '✨', name: '好句', href: '#quotes' }
    ];

    nav.innerHTML = modules.map(module => `
      <a href="${module.href}" class="module-link" data-module="${module.name}">
        <span class="module-icon">${module.icon}</span>
        <span>${module.name}</span>
      </a>
    `).join('');

    // 监听滚动，更新活跃状态
    window.addEventListener('scroll', updateActiveModule);

    // 点击链接时更新活跃状态
    nav.querySelectorAll('.module-link').forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const href = this.getAttribute('href');
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
          updateActiveModule();
        }
      });
    });
  }

  /**
   * 更新活跃模块
   */
  function updateActiveModule() {
    const nav = document.querySelector('.modules-nav');
    if (!nav) return;

    const sections = document.querySelectorAll('[id]');
    let current = '';

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      if (window.pageYOffset >= sectionTop - 100) {
        current = section.getAttribute('id');
      }
    });

    nav.querySelectorAll('.module-link').forEach(link => {
      const href = link.getAttribute('href').slice(1);
      if (href === current) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  /**
   * 复制到剪贴板
   */
  function copyToClipboard(text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  }

  /**
   * 显示通知
   */
  function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--accent-primary);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }

  /**
   * 数组随机排序
   */
  function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /**
   * 添加动画样式
   */
  function addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }

      @keyframes float {
        0%, 100% {
          transform: translateY(0px);
        }
        50% {
          transform: translateY(-10px);
        }
      }

      .quote-card {
        animation: float 3s ease-in-out infinite;
      }

      .quote-card:nth-child(2) {
        animation-delay: 0.5s;
      }

      .quote-card:nth-child(3) {
        animation-delay: 1s;
      }

      .quote-card:nth-child(4) {
        animation-delay: 1.5s;
      }

      .quote-card:nth-child(5) {
        animation-delay: 2s;
      }

      .quote-card:nth-child(6) {
        animation-delay: 2.5s;
      }
    `;
    document.head.appendChild(style);
  }

  // 初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      addAnimationStyles();
      initQuotesSection();
      initDanmaku();
      initModulesNav();
    });
  } else {
    addAnimationStyles();
    initQuotesSection();
    initDanmaku();
    initModulesNav();
  }

})();
