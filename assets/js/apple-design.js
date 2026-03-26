/**
 * 苹果设计理念 UI 优化
 * - 大圆角 (16-24px)
 * - 黄金比例
 * - 毛玻璃效果
 * - 精致阴影
 */

(function() {
  'use strict';

  function addAppleStyles() {
    if (document.getElementById('apple-design-system')) return;
    
    const style = document.createElement('style');
    style.id = 'apple-design-system';
    style.textContent = `
      /* ============================================
         苹果设计系统变量
         ============================================ */
      :root {
        /* 圆角系统 */
        --radius-sm: 8px;
        --radius-md: 12px;
        --radius-lg: 16px;
        --radius-xl: 20px;
        --radius-2xl: 24px;
        --radius-full: 9999px;
        
        /* 阴影系统 */
        --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.1);
        --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.15);
        --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.2);
        --shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.25);
        
        /* 间距系统（黄金比例 1.618） */
        --space-xs: 6px;
        --space-sm: 10px;
        --space-md: 16px;
        --space-lg: 26px;
        --space-xl: 42px;
        --space-2xl: 68px;
        
        /* 过渡动画 */
        --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
        --transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1);
        --transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1);
      }

      /* ============================================
         全局优化
         ============================================ */
      
      * {
        -webkit-tap-highlight-color: transparent;
      }
      
      /* 平滑滚动 */
      html {
        scroll-behavior: smooth;
      }
      
      /* 选中效果 */
      ::selection {
        background: var(--accent-primary);
        color: white;
      }

      /* ============================================
         玻璃卡片 - 苹果风格
         ============================================ */
      
      .glass-card {
        background: rgba(255, 255, 255, 0.03);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: var(--radius-xl);
        padding: var(--space-lg);
        transition: all var(--transition-base);
      }
      
      .glass-card:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-lg);
        border-color: rgba(255, 255, 255, 0.1);
      }

      /* ============================================
         按钮 - 苹果风格
         ============================================ */
      
      .pill-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-sm);
        padding: 12px 24px;
        border-radius: var(--radius-full);
        font-size: 15px;
        font-weight: 600;
        letter-spacing: -0.2px;
        text-decoration: none;
        transition: all var(--transition-fast);
        cursor: pointer;
        border: none;
      }
      
      .pill-btn-primary {
        background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
        color: white;
        box-shadow: 0 4px 16px rgba(88, 166, 255, 0.3);
      }
      
      .pill-btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(88, 166, 255, 0.4);
      }
      
      .pill-btn-primary:active {
        transform: translateY(0) scale(0.98);
      }
      
      .pill-btn-outline {
        background: rgba(255, 255, 255, 0.05);
        color: var(--text-primary);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .pill-btn-outline:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.2);
      }

      /* ============================================
         Section 标题 - 苹果风格
         ============================================ */
      
      .section {
        padding: var(--space-2xl) 0;
      }
      
      .section-header {
        text-align: center;
        margin-bottom: var(--space-xl);
      }
      
      .section-title {
        font-size: clamp(28px, 5vw, 40px);
        font-weight: 700;
        letter-spacing: -0.5px;
        margin-bottom: var(--space-sm);
        background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      .section-subtitle {
        font-size: 17px;
        color: var(--text-muted);
        font-weight: 400;
        letter-spacing: -0.2px;
      }

      /* ============================================
         技能卡片 - 苹果风格
         ============================================ */
      
      .skills-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: var(--space-lg);
      }
      
      .skill-card {
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: var(--radius-xl);
        padding: var(--space-lg);
        transition: all var(--transition-base);
      }
      
      .skill-card:hover {
        background: rgba(255, 255, 255, 0.04);
        transform: translateY(-6px);
        box-shadow: var(--shadow-lg);
      }
      
      .skill-header {
        display: flex;
        align-items: center;
        gap: var(--space-md);
        margin-bottom: var(--space-md);
      }
      
      .skill-icon {
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, rgba(88, 166, 255, 0.15), rgba(163, 113, 247, 0.15));
        border-radius: var(--radius-lg);
        font-size: 24px;
      }
      
      .skill-header h3 {
        font-size: 18px;
        font-weight: 600;
        letter-spacing: -0.3px;
      }
      
      .skill-desc {
        font-size: 15px;
        color: var(--text-secondary);
        line-height: 1.6;
        margin-bottom: var(--space-md);
      }
      
      .skill-tags {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-xs);
        margin-bottom: var(--space-md);
      }
      
      .skill-tag {
        padding: 4px 12px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: var(--radius-full);
        font-size: 12px;
        font-weight: 500;
        color: var(--text-secondary);
      }
      
      .skill-bar {
        height: 6px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: var(--radius-full);
        overflow: hidden;
      }
      
      .skill-bar-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
        border-radius: var(--radius-full);
        transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
      }

      /* ============================================
         项目卡片 - 苹果风格
         ============================================ */
      
      .projects-showcase {
        display: flex;
        flex-direction: column;
        gap: var(--space-lg);
      }
      
      .project-featured {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--space-lg);
        padding: var(--space-xl);
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: var(--radius-2xl);
        overflow: hidden;
      }
      
      @media (max-width: 768px) {
        .project-featured {
          grid-template-columns: 1fr;
          padding: var(--space-md);
          border-radius: var(--radius-xl);
        }
      }
      
      .project-visual {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 240px;
        background: linear-gradient(135deg, rgba(88, 166, 255, 0.08), rgba(163, 113, 247, 0.08));
        border-radius: var(--radius-lg);
      }
      
      .project-icon-large {
        font-size: 80px;
        filter: drop-shadow(0 8px 24px rgba(88, 166, 255, 0.3));
      }
      
      .project-info h3 {
        font-size: 24px;
        font-weight: 700;
        letter-spacing: -0.5px;
        margin-bottom: var(--space-sm);
      }
      
      .project-info p {
        font-size: 15px;
        color: var(--text-secondary);
        line-height: 1.6;
        margin-bottom: var(--space-md);
      }
      
      .project-badge {
        display: inline-block;
        padding: 6px 14px;
        background: var(--accent-primary);
        color: white;
        border-radius: var(--radius-full);
        font-size: 12px;
        font-weight: 600;
        margin-bottom: var(--space-sm);
      }
      
      .project-tech {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-xs);
        margin-bottom: var(--space-md);
      }
      
      .project-tech span {
        padding: 4px 12px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: var(--radius-full);
        font-size: 13px;
      }
      
      .projects-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: var(--space-md);
      }
      
      .project-card {
        padding: var(--space-md);
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: var(--radius-xl);
        transition: all var(--transition-base);
      }
      
      .project-card:hover {
        background: rgba(255, 255, 255, 0.04);
        transform: translateY(-4px);
        box-shadow: var(--shadow-md);
      }
      
      .project-card-icon {
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.05);
        border-radius: var(--radius-lg);
        font-size: 24px;
        margin-bottom: var(--space-sm);
      }
      
      .project-card h4 {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 6px;
        letter-spacing: -0.2px;
      }
      
      .project-card p {
        font-size: 14px;
        color: var(--text-muted);
        line-height: 1.5;
      }

      /* ============================================
         证书卡片 - 苹果风格
         ============================================ */
      
      .certs-showcase {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: var(--space-md);
      }
      
      .cert-card {
        display: flex;
        align-items: center;
        gap: var(--space-md);
        padding: var(--space-md);
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: var(--radius-xl);
        text-decoration: none;
        color: inherit;
        transition: all var(--transition-base);
      }
      
      .cert-card:hover {
        background: rgba(255, 255, 255, 0.04);
        transform: translateX(4px);
      }
      
      .cert-badge-grade {
        width: 52px;
        height: 52px;
        border-radius: var(--radius-lg);
        background: linear-gradient(135deg, #ffd700, #ffb347);
        color: #333;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        font-weight: 700;
        flex-shrink: 0;
      }
      
      .cert-content {
        flex: 1;
        min-width: 0;
      }
      
      .cert-content h4 {
        font-size: 15px;
        font-weight: 600;
        margin-bottom: 4px;
        letter-spacing: -0.2px;
      }
      
      .cert-content p {
        font-size: 13px;
        color: var(--text-muted);
      }

      /* ============================================
         生活相册 - 苹果风格
         ============================================ */
      
      .life-gallery {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        grid-template-rows: repeat(2, 220px);
        gap: var(--space-md);
      }
      
      .life-card {
        position: relative;
        border-radius: var(--radius-xl);
        overflow: hidden;
        background: rgba(255, 255, 255, 0.02);
        transition: all var(--transition-base);
      }
      
      .life-card:hover {
        transform: scale(1.02);
        box-shadow: var(--shadow-lg);
        z-index: 10;
      }
      
      .life-card img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .life-card:hover img {
        transform: scale(1.1);
      }
      
      .life-card-large {
        grid-column: span 2;
      }
      
      .life-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: var(--space-md);
        background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
        color: white;
      }
      
      .life-count {
        font-size: 12px;
        opacity: 0.8;
        font-weight: 500;
      }
      
      .life-overlay h4 {
        font-size: 15px;
        font-weight: 600;
        margin-top: 4px;
        letter-spacing: -0.2px;
      }
      
      @media (max-width: 768px) {
        .life-gallery {
          grid-template-columns: repeat(2, 1fr);
          grid-template-rows: repeat(4, 160px);
          gap: var(--space-sm);
        }
        
        .life-card {
          border-radius: var(--radius-lg);
        }
        
        .life-card-large {
          grid-column: span 2;
        }
      }

      /* ============================================
         联系区域 - 苹果风格
         ============================================ */
      
      .contact-wrapper {
        padding: var(--space-xl);
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: var(--radius-2xl);
        text-align: center;
      }
      
      .contact-content h2 {
        font-size: clamp(24px, 5vw, 32px);
        font-weight: 700;
        letter-spacing: -0.5px;
        margin-bottom: var(--space-sm);
      }
      
      .contact-content p {
        font-size: 16px;
        color: var(--text-secondary);
        margin-bottom: var(--space-lg);
        line-height: 1.6;
      }
      
      .contact-links {
        display: flex;
        justify-content: center;
        gap: var(--space-md);
        flex-wrap: wrap;
        margin-bottom: var(--space-lg);
      }
      
      .contact-link {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        padding: 16px 24px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: var(--radius-xl);
        text-decoration: none;
        color: inherit;
        transition: all var(--transition-base);
        min-width: 180px;
      }
      
      .contact-link:hover {
        background: rgba(255, 255, 255, 0.06);
        transform: translateY(-4px);
        box-shadow: var(--shadow-md);
      }
      
      .contact-icon {
        font-size: 24px;
      }
      
      .contact-label {
        font-size: 12px;
        color: var(--text-muted);
        margin-bottom: 2px;
      }
      
      .contact-value {
        font-size: 14px;
        font-weight: 600;
      }
      
      @media (max-width: 768px) {
        .contact-wrapper {
          padding: var(--space-md);
          border-radius: var(--radius-xl);
        }
        
        .contact-links {
          flex-direction: column;
        }
        
        .contact-link {
          width: 100%;
          justify-content: flex-start;
        }
      }

      /* ============================================
         页脚 - 苹果风格
         ============================================ */
      
      .footer {
        padding: var(--space-xl) 0;
        border-top: 1px solid rgba(255, 255, 255, 0.05);
        margin-top: var(--space-xl);
      }
      
      .footer-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: var(--space-md);
      }
      
      .footer-brand {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        font-weight: 600;
        font-size: 15px;
      }
      
      .footer-logo {
        font-size: 20px;
      }
      
      .footer-links {
        display: flex;
        gap: var(--space-lg);
        flex-wrap: wrap;
      }
      
      .footer-links a {
        color: var(--text-muted);
        text-decoration: none;
        font-size: 14px;
        font-weight: 500;
        transition: color var(--transition-fast);
      }
      
      .footer-links a:hover {
        color: var(--accent-primary);
      }
      
      .footer-bottom {
        text-align: center;
        margin-top: var(--space-lg);
        padding-top: var(--space-lg);
        border-top: 1px solid rgba(255, 255, 255, 0.05);
      }
      
      .footer-bottom p {
        font-size: 13px;
        color: var(--text-muted);
      }
      
      @media (max-width: 768px) {
        .footer-content {
          flex-direction: column;
          text-align: center;
        }
        
        .footer-links {
          justify-content: center;
        }
      }

      /* ============================================
         返回顶部按钮 - 苹果风格
         ============================================ */
      
      .back-to-top {
        position: fixed;
        bottom: 32px;
        right: 32px;
        width: 48px;
        height: 48px;
        border-radius: var(--radius-full);
        background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
        color: white;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        visibility: hidden;
        transform: translateY(20px) scale(0.9);
        transition: all var(--transition-base);
        box-shadow: var(--shadow-md);
        z-index: 1000;
      }
      
      .back-to-top.visible {
        opacity: 1;
        visibility: visible;
        transform: translateY(0) scale(1);
      }
      
      .back-to-top:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-lg);
      }
      
      .back-to-top:active {
        transform: scale(0.95);
      }
      
      @media (max-width: 768px) {
        .back-to-top {
          width: 44px;
          height: 44px;
          bottom: 20px;
          right: 20px;
        }
      }

      /* ============================================
         好句分享 - 苹果风格
         ============================================ */
      
      .quotes-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
        gap: var(--space-md);
      }
      
      .quote-card {
        position: relative;
        padding: var(--space-lg);
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: var(--radius-xl);
        cursor: pointer;
        transition: all var(--transition-base);
      }
      
      .quote-card:hover {
        background: rgba(255, 255, 255, 0.04);
        transform: translateY(-4px);
        box-shadow: var(--shadow-md);
      }
      
      .quote-text {
        font-size: 17px;
        line-height: 1.7;
        color: var(--text-primary);
        margin-bottom: var(--space-md);
        font-style: italic;
        letter-spacing: -0.2px;
      }
      
      .quote-author {
        font-size: 14px;
        color: var(--text-muted);
        text-align: right;
        font-weight: 500;
      }
      
      @media (max-width: 768px) {
        .quotes-grid {
          grid-template-columns: 1fr;
        }
        
        .quote-card {
          padding: var(--space-md);
          border-radius: var(--radius-lg);
        }
        
        .quote-text {
          font-size: 16px;
        }
      }

      /* ============================================
         GitHub项目卡片 - 苹果风格
         ============================================ */
      
      .github-project-card {
        display: flex;
        gap: var(--space-md);
        padding: var(--space-md);
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: var(--radius-xl);
        text-decoration: none;
        color: inherit;
        transition: all var(--transition-base);
      }
      
      .github-project-card:hover {
        background: rgba(255, 255, 255, 0.04);
        transform: translateX(6px);
        border-color: rgba(88, 166, 255, 0.2);
      }
      
      .project-rank {
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
        border-radius: var(--radius-lg);
        font-size: 18px;
        font-weight: 700;
        color: white;
        flex-shrink: 0;
      }

      /* ============================================
         留言板 - 苹果风格
         ============================================ */
      
      .guestbook-cloud-wrapper {
        max-width: 800px;
        margin: 0 auto;
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: var(--radius-2xl);
        overflow: hidden;
      }
      
      .guestbook-header-section {
        display: flex;
        align-items: center;
        gap: var(--space-md);
        padding: var(--space-lg);
        background: linear-gradient(135deg, rgba(88, 166, 255, 0.1), rgba(163, 113, 247, 0.1));
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }
      
      .header-icon {
        width: 56px;
        height: 56px;
        background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
        border-radius: var(--radius-lg);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        flex-shrink: 0;
      }
      
      .message-bubble {
        display: flex;
        gap: var(--space-sm);
        padding: var(--space-md);
        margin-bottom: var(--space-sm);
        background: rgba(255, 255, 255, 0.02);
        border-radius: var(--radius-lg);
        border-left: 3px solid var(--msg-color);
        transition: all var(--transition-fast);
      }
      
      .message-bubble:hover {
        background: rgba(255, 255, 255, 0.04);
        transform: translateX(4px);
      }
      
      .bubble-avatar {
        width: 40px;
        height: 40px;
        border-radius: var(--radius-md);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        font-weight: 600;
        flex-shrink: 0;
      }

      @media (max-width: 768px) {
        .guestbook-cloud-wrapper {
          border-radius: var(--radius-xl);
        }
        
        .guestbook-header-section {
          padding: var(--space-md);
        }
        
        .header-icon {
          width: 48px;
          height: 48px;
          font-size: 24px;
        }
        
        .message-bubble {
          padding: var(--space-sm);
          border-radius: var(--radius-md);
        }
        
        .bubble-avatar {
          width: 36px;
          height: 36px;
          font-size: 14px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // 初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addAppleStyles);
  } else {
    addAppleStyles();
  }

})();
