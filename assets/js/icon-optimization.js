/**
 * 图标优化 - 苹果风格 Emoji
 */

(function() {
  'use strict';

  // 苹果风格的图标映射
  const ICONS = {
    // 汉堡菜单板块图标
    nav: {
      hero: '🏠',      // 首页 - 房子
      about: '👤',     // 关于 - 人物
      skills: '⚡',     // 技能 - 闪电
      projects: '🚀',  // 项目 - 火箭
      github: '🐙',    // GitHub - 章鱼猫
      certificates: '🏅', // 荣誉 - 奖牌
      life: '📷',      // 生活 - 相机
      quotes: '💭',    // 好句 - 对话气泡
      guestbook: '✍️', // 留言 - 写字
      contact: '✉️'    // 联系 - 信封
    },
    
    // 技能图标
    skills: {
      embedded: '🔧',   // 嵌入式
      iot: '📡',        // 物联网
      programming: '💻', // 编程
      hardware: '🔌',   // 硬件
      debug: '🐛'       // 调试
    },
    
    // 成长历程图标
    journey: {
      work: '💼',       // 工作
      education: '🎓',  // 教育
      start: '🌱'       // 开始
    },
    
    // 特质图标
    traits: {
      goal: '🎯',       // 目标
      hands: '🛠️',      // 动手
      team: '🤝',       // 团队
      learn: '📚'       // 学习
    },
    
    // 兴趣爱好图标
    hobbies: {
      run: '🏃',        // 跑步
      photo: '📸',      // 摄影
      read: '📖',       // 阅读
      game: '🎮'        // 游戏
    },
    
    // 联系图标
    contact: {
      email: '📧',      // 邮箱
      phone: '📱',      // 电话
      location: '📍'    // 位置
    }
  };

  // 替换汉堡菜单图标
  function updateNavIcons() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      const section = item.dataset.section;
      const iconSpan = item.querySelector('.nav-icon');
      if (iconSpan && ICONS.nav[section]) {
        iconSpan.textContent = ICONS.nav[section];
      }
    });
  }

  // 替换技能图标
  function updateSkillIcons() {
    const skillCards = document.querySelectorAll('.skill-card');
    skillCards.forEach((card, index) => {
      const iconSpan = card.querySelector('.skill-icon');
      if (iconSpan) {
        const icons = Object.values(ICONS.skills);
        iconSpan.textContent = icons[index % icons.length];
      }
    });
  }

  // 替换成长历程图标
  function updateJourneyIcons() {
    const timelineNodes = document.querySelectorAll('.timeline-node');
    timelineNodes.forEach((node, index) => {
      // 添加图标到内容中
      const content = node.querySelector('.timeline-content');
      if (content) {
        const year = content.querySelector('.timeline-year');
        if (year) {
          const yearText = year.textContent;
          let icon = ICONS.journey.start;
          if (yearText.includes('2024')) icon = ICONS.journey.work;
          else if (yearText.includes('2023') || yearText.includes('2020')) icon = ICONS.journey.education;
          
          year.textContent = icon + ' ' + year.textContent;
        }
      }
    });
  }

  // 替换特质图标
  function updateTraitIcons() {
    const traitCards = document.querySelectorAll('.trait-card');
    const traitIcons = Object.values(ICONS.traits);
    traitCards.forEach((card, index) => {
      const iconSpan = card.querySelector('.trait-icon');
      if (iconSpan && traitIcons[index]) {
        iconSpan.textContent = traitIcons[index];
      }
    });
  }

  // 替换兴趣爱好图标
  function updateHobbyIcons() {
    const hobbyItems = document.querySelectorAll('.hobby-item');
    const hobbyIcons = Object.values(ICONS.hobbies);
    hobbyItems.forEach((item, index) => {
      const iconSpan = item.querySelector('.hobby-icon');
      if (iconSpan && hobbyIcons[index]) {
        iconSpan.textContent = hobbyIcons[index];
      }
    });
  }

  // 初始化
  function init() {
    // 延迟执行，确保其他脚本先加载
    setTimeout(() => {
      updateNavIcons();
      updateSkillIcons();
      updateJourneyIcons();
      updateTraitIcons();
      updateHobbyIcons();
    }, 100);
  }

  // 页面加载完成后执行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
