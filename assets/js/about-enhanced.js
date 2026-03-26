/**
 * 关于我内容优化 - 成长历程图标修复 + 内容丰富
 */

(function() {
  'use strict';

  // 等待页面加载完成
  function init() {
    enhanceAboutSection();
    addStyles();
  }

  // 增强关于我板块
  function enhanceAboutSection() {
    const aboutSection = document.getElementById('about');
    if (!aboutSection) return;

    // 查找成长历程容器
    const timeline = aboutSection.querySelector('.timeline') || 
                     aboutSection.querySelector('.journey-timeline') ||
                     aboutSection.querySelector('[class*="timeline"]');
    
    if (timeline) {
      fixTimelineIcons(timeline);
    }

    // 添加更多内容
    addMoreContent(aboutSection);
  }

  // 修复成长历程图标 - 竖线穿过圆球中心
  function fixTimelineIcons(timeline) {
    // 重新设计时间线结构
    const items = timeline.querySelectorAll('.timeline-item, .journey-item, [class*="item"]');
    
    items.forEach((item, index) => {
      // 添加正确的结构
      item.classList.add('timeline-item-fixed');
      
      // 确保圆球在竖线中心
      const dot = item.querySelector('.timeline-dot, .journey-dot, [class*="dot"]');
      if (dot) {
        dot.classList.add('timeline-dot-fixed');
      }
    });
  }

  // 添加更多内容
  function addMoreContent(aboutSection) {
    // 查找内容容器
    const content = aboutSection.querySelector('.about-content') || 
                    aboutSection.querySelector('.container');
    
    if (!content) return;

    // 检查是否已有增强内容
    if (content.querySelector('.about-enhanced')) return;

    // 创建增强内容
    const enhancedContent = document.createElement('div');
    enhancedContent.className = 'about-enhanced';
    enhancedContent.innerHTML = `
      <!-- 个人简介卡片 -->
      <div class="about-intro-card">
        <div class="intro-header">
          <div class="intro-avatar">👨‍💻</div>
          <div class="intro-titles">
            <h3>崔喆箫</h3>
            <p class="intro-subtitle">嵌入式开发工程师 · 物联网爱好者</p>
          </div>
        </div>
        <div class="intro-bio">
          <p>热爱技术，专注于嵌入式系统开发与物联网应用。擅长 C/C++、Python 等编程语言，具有丰富的硬件调试和软件开发经验。</p>
          <p>致力于将创意转化为现实，通过代码连接物理世界与数字世界。</p>
        </div>
        <div class="intro-tags">
          <span class="intro-tag">🔧 嵌入式</span>
          <span class="intro-tag">📡 物联网</span>
          <span class="intro-tag">⚡ 自动化</span>
          <span class="intro-tag">🔍 问题解决</span>
        </div>
      </div>

      <!-- 成长历程 - 修复版 -->
      <div class="journey-section">
        <h4 class="journey-title">🚀 成长历程</h4>
        <div class="journey-timeline-fixed">
          <div class="timeline-row">
            <div class="timeline-node">
              <div class="timeline-dot-fixed"></div>
              <div class="timeline-content">
                <span class="timeline-year">2024</span>
                <h5>华为嵌入式工程师</h5>
                <p>加入华为，从事嵌入式系统开发工作</p>
              </div>
            </div>
          </div>
          <div class="timeline-row">
            <div class="timeline-node">
              <div class="timeline-dot-fixed"></div>
              <div class="timeline-content">
                <span class="timeline-year">2023</span>
                <h5>硕士毕业</h5>
                <p>完成研究生学业，专注物联网方向研究</p>
              </div>
            </div>
          </div>
          <div class="timeline-row">
            <div class="timeline-node">
              <div class="timeline-dot-fixed"></div>
              <div class="timeline-content">
                <span class="timeline-year">2020</span>
                <h5>本科毕业</h5>
                <p>电子信息工程专业，开始探索嵌入式世界</p>
              </div>
            </div>
          </div>
          <div class="timeline-row">
            <div class="timeline-node">
              <div class="timeline-dot-fixed"></div>
              <div class="timeline-content">
                <span class="timeline-year">2016</span>
                <h5>初入大学</h5>
                <p>怀揣对技术的热爱，开启编程之旅</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 个人特质 -->
      <div class="traits-section">
        <h4 class="traits-title">💡 个人特质</h4>
        <div class="traits-grid">
          <div class="trait-card">
            <div class="trait-icon">🎯</div>
            <h5>目标导向</h5>
            <p>设定清晰目标，持续努力达成</p>
          </div>
          <div class="trait-card">
            <div class="trait-icon">🔧</div>
            <h5>动手能力强</h5>
            <p>从理论到实践，快速落地实现</p>
          </div>
          <div class="trait-card">
            <div class="trait-icon">🤝</div>
            <h5>团队协作</h5>
            <p>善于沟通，乐于分享，共同成长</p>
          </div>
          <div class="trait-card">
            <div class="trait-icon">📚</div>
            <h5>持续学习</h5>
            <p>保持好奇心，紧跟技术发展</p>
          </div>
        </div>
      </div>

      <!-- 兴趣爱好 -->
      <div class="hobbies-section">
        <h4 class="hobbies-title">🎨 兴趣爱好</h4>
        <div class="hobbies-list">
          <div class="hobby-item">
            <span class="hobby-icon">🏃</span>
            <span class="hobby-name">跑步</span>
            <span class="hobby-desc">保持活力，挑战自我</span>
          </div>
          <div class="hobby-item">
            <span class="hobby-icon">📷</span>
            <span class="hobby-name">摄影</span>
            <span class="hobby-desc">记录生活美好瞬间</span>
          </div>
          <div class="hobby-item">
            <span class="hobby-icon">📖</span>
            <span class="hobby-name">阅读</span>
            <span class="hobby-desc">技术书籍与科幻小说</span>
          </div>
          <div class="hobby-item">
            <span class="hobby-icon">🎮</span>
            <span class="hobby-name">游戏</span>
            <span class="hobby-desc">策略与解谜类游戏</span>
          </div>
        </div>
      </div>
    `;

    // 插入到合适位置
    const existingContent = content.querySelector('.about-text, .about-description, p');
    if (existingContent) {
      existingContent.style.display = 'none'; // 隐藏原有简单内容
      existingContent.parentNode.insertBefore(enhancedContent, existingContent.nextSibling);
    } else {
      content.appendChild(enhancedContent);
    }
  }

  // 添加样式
  function addStyles() {
    if (document.getElementById('about-enhanced-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'about-enhanced-styles';
    style.textContent = `
      /* ============================================
         关于我 - 增强样式
         ============================================ */

      .about-enhanced {
        display: flex;
        flex-direction: column;
        gap: 32px;
        margin-top: 24px;
      }

      /* 个人简介卡片 */
      .about-intro-card {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 24px;
        padding: 28px;
        backdrop-filter: blur(10px);
      }

      .intro-header {
        display: flex;
        align-items: center;
        gap: 20px;
        margin-bottom: 20px;
        padding-bottom: 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      }

      .intro-avatar {
        width: 72px;
        height: 72px;
        background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
        border-radius: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 36px;
        flex-shrink: 0;
      }

      .intro-titles h3 {
        font-size: 28px;
        font-weight: 700;
        margin-bottom: 6px;
        letter-spacing: -0.5px;
      }

      .intro-subtitle {
        font-size: 15px;
        color: var(--text-muted);
        font-weight: 500;
      }

      .intro-bio {
        font-size: 16px;
        line-height: 1.8;
        color: var(--text-secondary);
        margin-bottom: 20px;
      }

      .intro-bio p {
        margin-bottom: 12px;
      }

      .intro-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      .intro-tag {
        padding: 8px 16px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 100px;
        font-size: 14px;
        font-weight: 500;
        color: var(--text-secondary);
      }

      /* ============================================
         成长历程 - 修复版（竖线穿过圆球中心）
         ============================================ */

      .journey-section {
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 24px;
        padding: 28px;
      }

      .journey-title {
        font-size: 20px;
        font-weight: 700;
        margin-bottom: 24px;
        text-align: center;
      }

      .journey-timeline-fixed {
        position: relative;
        padding-left: 24px;
      }

      /* 中央竖线 */
      .journey-timeline-fixed::before {
        content: '';
        position: absolute;
        left: 39px;
        top: 12px;
        bottom: 12px;
        width: 2px;
        background: linear-gradient(
          180deg,
          transparent,
          rgba(88, 166, 255, 0.3) 10%,
          rgba(88, 166, 255, 0.3) 90%,
          transparent
        );
      }

      .timeline-row {
        position: relative;
        margin-bottom: 24px;
      }

      .timeline-row:last-child {
        margin-bottom: 0;
      }

      .timeline-node {
        display: flex;
        align-items: flex-start;
        gap: 20px;
        position: relative;
      }

      /* 圆球 - 完美居中在竖线上 */
      .timeline-dot-fixed {
        width: 32px;
        height: 32px;
        background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
        border-radius: 50%;
        border: 4px solid rgba(13, 17, 23, 0.95);
        flex-shrink: 0;
        position: relative;
        z-index: 2;
        box-shadow: 0 0 0 2px rgba(88, 166, 255, 0.3);
      }

      /* 圆球内的小点 */
      .timeline-dot-fixed::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 8px;
        height: 8px;
        background: white;
        border-radius: 50%;
      }

      .timeline-content {
        flex: 1;
        padding-top: 4px;
      }

      .timeline-year {
        display: inline-block;
        padding: 4px 12px;
        background: rgba(88, 166, 255, 0.15);
        border-radius: 100px;
        font-size: 13px;
        font-weight: 600;
        color: var(--accent-primary);
        margin-bottom: 8px;
      }

      .timeline-content h5 {
        font-size: 17px;
        font-weight: 600;
        margin-bottom: 6px;
        color: var(--text-primary);
      }

      .timeline-content p {
        font-size: 14px;
        color: var(--text-muted);
        line-height: 1.5;
      }

      /* ============================================
         个人特质
         ============================================ */

      .traits-section {
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 24px;
        padding: 28px;
      }

      .traits-title {
        font-size: 20px;
        font-weight: 700;
        margin-bottom: 20px;
        text-align: center;
      }

      .traits-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
      }

      .trait-card {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 16px;
        padding: 20px;
        text-align: center;
        transition: all 0.3s ease;
      }

      .trait-card:hover {
        background: rgba(255, 255, 255, 0.05);
        transform: translateY(-4px);
      }

      .trait-icon {
        font-size: 32px;
        margin-bottom: 12px;
      }

      .trait-card h5 {
        font-size: 15px;
        font-weight: 600;
        margin-bottom: 6px;
      }

      .trait-card p {
        font-size: 13px;
        color: var(--text-muted);
        line-height: 1.4;
      }

      /* ============================================
         兴趣爱好
         ============================================ */

      .hobbies-section {
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 24px;
        padding: 28px;
      }

      .hobbies-title {
        font-size: 20px;
        font-weight: 700;
        margin-bottom: 20px;
        text-align: center;
      }

      .hobbies-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .hobby-item {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px 20px;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 12px;
        transition: all 0.2s ease;
      }

      .hobby-item:hover {
        background: rgba(255, 255, 255, 0.05);
        transform: translateX(4px);
      }

      .hobby-icon {
        font-size: 24px;
        width: 40px;
        text-align: center;
      }

      .hobby-name {
        font-size: 15px;
        font-weight: 600;
        width: 60px;
        flex-shrink: 0;
      }

      .hobby-desc {
        font-size: 14px;
        color: var(--text-muted);
        flex: 1;
      }

      /* ============================================
         移动端优化
         ============================================ */

      @media (max-width: 768px) {
        .about-enhanced {
          gap: 20px;
        }

        .about-intro-card,
        .journey-section,
        .traits-section,
        .hobbies-section {
          padding: 20px;
          border-radius: 20px;
        }

        .intro-header {
          flex-direction: column;
          text-align: center;
          gap: 16px;
        }

        .intro-avatar {
          width: 64px;
          height: 64px;
          font-size: 32px;
        }

        .intro-titles h3 {
          font-size: 24px;
        }

        .intro-bio {
          font-size: 15px;
        }

        /* 成长历程移动端 */
        .journey-timeline-fixed {
          padding-left: 16px;
        }

        .journey-timeline-fixed::before {
          left: 31px;
        }

        .timeline-dot-fixed {
          width: 28px;
          height: 28px;
          border-width: 3px;
        }

        .timeline-dot-fixed::after {
          width: 6px;
          height: 6px;
        }

        .timeline-content h5 {
          font-size: 16px;
        }

        /* 特质网格移动端 */
        .traits-grid {
          grid-template-columns: 1fr;
          gap: 12px;
        }

        .trait-card {
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 16px;
          text-align: left;
        }

        .trait-icon {
          font-size: 28px;
          margin-bottom: 0;
        }

        .trait-card h5 {
          margin-bottom: 4px;
        }

        /* 兴趣爱好移动端 */
        .hobby-item {
          padding: 14px 16px;
          flex-wrap: wrap;
        }

        .hobby-name {
          width: auto;
          flex: 1;
        }

        .hobby-desc {
          width: 100%;
          padding-left: 56px;
          margin-top: 4px;
        }
      }

      @media (max-width: 380px) {
        .about-intro-card,
        .journey-section,
        .traits-section,
        .hobbies-section {
          padding: 16px;
          border-radius: 16px;
        }

        .intro-titles h3 {
          font-size: 22px;
        }

        .timeline-content h5 {
          font-size: 15px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // 初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
