/**
 * 全面UI优化 - 增强视觉效果和移动端适配
 */

(function() {
  'use strict';

  // 添加所有优化样式
  function addOptimizedStyles() {
    if (document.getElementById('ui-optimization-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'ui-optimization-styles';
    style.textContent = `
      /* ============================================
         全局优化
         ============================================ */
      
      /* 平滑滚动 */
      html {
        scroll-behavior: smooth;
      }
      
      /* 更好的选中效果 */
      ::selection {
        background: var(--accent-primary);
        color: white;
      }
      
      /* 焦点样式 */
      :focus-visible {
        outline: 2px solid var(--accent-primary);
        outline-offset: 2px;
      }
      
      /* ============================================
         Hero Section 优化
         ============================================ */
      
      .hero-section {
        position: relative;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 80px 20px;
        overflow: hidden;
      }
      
      .hero-content {
        position: relative;
        z-index: 10;
        text-align: center;
        max-width: 800px;
        width: 100%;
      }
      
      /* 标题动画 */
      .hero-title {
        font-size: clamp(2.5rem, 8vw, 5rem);
        font-weight: 800;
        line-height: 1.1;
        margin-bottom: 24px;
      }
      
      .title-line {
        display: block;
      }
      
      .gradient-text {
        background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary), var(--accent-primary));
        background-size: 200% 200%;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: gradientShift 3s ease-in-out infinite;
      }
      
      @keyframes gradientShift {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }
      
      /* 副标题优化 */
      .hero-subtitle {
        font-size: clamp(1rem, 3vw, 1.25rem);
        line-height: 1.6;
        margin-bottom: 32px;
        opacity: 0.9;
      }
      
      /* 按钮优化 */
      .hero-cta {
        display: flex;
        gap: 16px;
        justify-content: center;
        flex-wrap: wrap;
        margin-bottom: 40px;
      }
      
      .pill-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 14px 28px;
        border-radius: 50px;
        font-size: 0.95rem;
        font-weight: 600;
        text-decoration: none;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        cursor: pointer;
        border: none;
      }
      
      .pill-btn-primary {
        background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
        color: white;
        box-shadow: 0 4px 15px rgba(88, 166, 255, 0.3);
      }
      
      .pill-btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(88, 166, 255, 0.4);
      }
      
      .pill-btn-outline {
        background: transparent;
        color: var(--text-primary);
        border: 1px solid var(--border-color);
      }
      
      .pill-btn-outline:hover {
        background: var(--bg-secondary);
        border-color: var(--accent-primary);
        transform: translateY(-2px);
      }
      
      /* GitHub 卡片优化 */
      .hero-github-card {
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 16px;
        max-width: 400px;
        margin: 0 auto;
      }
      
      .github-card-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
        font-size: 0.875rem;
      }
      
      .github-card-header a {
        color: var(--accent-primary);
        text-decoration: none;
      }
      
      .github-card-footer {
        text-align: center;
        margin-top: 12px;
        font-size: 0.75rem;
        color: var(--text-muted);
      }
      
      /* ============================================
         Section 通用优化
         ============================================ */
      
      .section {
        padding: 80px 0;
        position: relative;
      }
      
      .section-alt {
        background: rgba(0, 0, 0, 0.2);
      }
      
      .section-header {
        text-align: center;
        margin-bottom: 48px;
      }
      
      .section-title {
        font-size: clamp(1.75rem, 5vw, 2.5rem);
        font-weight: 700;
        margin-bottom: 12px;
        background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      .section-subtitle {
        font-size: 1rem;
        color: var(--text-muted);
      }
      
      /* 玻璃卡片优化 */
      .glass-card {
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        padding: 24px;
        transition: all 0.3s ease;
      }
      
      .glass-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 24px rgba(88, 166, 255, 0.15);
        border-color: rgba(88, 166, 255, 0.3);
      }
      
      /* ============================================
         技能卡片优化
         ============================================ */
      
      .skills-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 24px;
      }
      
      .skill-card {
        padding: 24px;
      }
      
      .skill-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
      }
      
      .skill-icon {
        font-size: 2rem;
      }
      
      .skill-header h3 {
        font-size: 1.125rem;
        font-weight: 600;
      }
      
      .skill-desc {
        color: var(--text-secondary);
        line-height: 1.6;
        margin-bottom: 16px;
      }
      
      .skill-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 16px;
      }
      
      .skill-tag {
        padding: 4px 12px;
        background: var(--bg-secondary);
        border-radius: 20px;
        font-size: 0.75rem;
        color: var(--text-secondary);
      }
      
      .skill-bar {
        height: 4px;
        background: var(--bg-secondary);
        border-radius: 2px;
        overflow: hidden;
      }
      
      .skill-bar-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
        border-radius: 2px;
        transition: width 1s ease;
      }
      
      /* ============================================
         项目卡片优化
         ============================================ */
      
      .projects-showcase {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
      
      .project-featured {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
        padding: 32px;
      }
      
      @media (max-width: 768px) {
        .project-featured {
          grid-template-columns: 1fr;
          padding: 20px;
        }
      }
      
      .project-visual {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 200px;
        background: linear-gradient(135deg, rgba(88, 166, 255, 0.1), rgba(163, 113, 247, 0.1));
        border-radius: 12px;
      }
      
      .project-icon-large {
        font-size: 5rem;
      }
      
      .project-info h3 {
        font-size: 1.5rem;
        margin-bottom: 12px;
      }
      
      .project-info p {
        color: var(--text-secondary);
        line-height: 1.6;
        margin-bottom: 16px;
      }
      
      .project-badge {
        display: inline-block;
        padding: 4px 12px;
        background: var(--accent-primary);
        color: white;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 600;
        margin-bottom: 12px;
      }
      
      .project-tech {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 16px;
      }
      
      .project-tech span {
        padding: 4px 12px;
        background: var(--bg-secondary);
        border-radius: 20px;
        font-size: 0.8rem;
      }
      
      .projects-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 16px;
      }
      
      .project-card {
        padding: 20px;
        text-align: left;
      }
      
      .project-card-icon {
        font-size: 2rem;
        margin-bottom: 12px;
      }
      
      .project-card h4 {
        font-size: 1rem;
        margin-bottom: 8px;
      }
      
      .project-card p {
        font-size: 0.875rem;
        color: var(--text-muted);
      }
      
      /* ============================================
         证书卡片优化
         ============================================ */
      
      .certs-showcase {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 16px;
      }
      
      .cert-card {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 20px;
        text-decoration: none;
        color: inherit;
      }
      
      .cert-badge-grade {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: linear-gradient(135deg, #ffd700, #ffb347);
        color: #333;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        font-weight: 700;
        flex-shrink: 0;
      }
      
      .cert-content {
        flex: 1;
        min-width: 0;
      }
      
      .cert-content h4 {
        font-size: 0.95rem;
        margin-bottom: 4px;
      }
      
      .cert-content p {
        font-size: 0.8rem;
        color: var(--text-muted);
      }
      
      /* ============================================
         生活相册优化
         ============================================ */
      
      .life-gallery {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        grid-template-rows: repeat(2, 200px);
        gap: 16px;
      }
      
      .life-card {
        position: relative;
        border-radius: 12px;
        overflow: hidden;
        background: var(--bg-secondary);
      }
      
      .life-card img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.5s ease;
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
        padding: 16px;
        background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
        color: white;
      }
      
      .life-count {
        font-size: 0.75rem;
        opacity: 0.8;
      }
      
      .life-overlay h4 {
        font-size: 0.9rem;
        margin-top: 4px;
      }
      
      @media (max-width: 768px) {
        .life-gallery {
          grid-template-columns: repeat(2, 1fr);
          grid-template-rows: repeat(4, 150px);
        }
        
        .life-card-large {
          grid-column: span 2;
        }
      }
      
      /* ============================================
         联系区域优化
         ============================================ */
      
      .contact-wrapper {
        padding: 48px;
        text-align: center;
        position: relative;
        overflow: hidden;
      }
      
      .contact-content h2 {
        font-size: clamp(1.5rem, 5vw, 2rem);
        margin-bottom: 16px;
      }
      
      .contact-content p {
        color: var(--text-secondary);
        margin-bottom: 24px;
        line-height: 1.6;
      }
      
      .contact-links {
        display: flex;
        justify-content: center;
        gap: 16px;
        flex-wrap: wrap;
        margin-bottom: 24px;
      }
      
      .contact-link {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 24px;
        background: var(--bg-secondary);
        border-radius: 12px;
        text-decoration: none;
        color: inherit;
        transition: all 0.2s ease;
        min-width: 200px;
      }
      
      .contact-link:hover {
        background: var(--bg-tertiary);
        transform: translateY(-2px);
      }
      
      .contact-icon {
        font-size: 1.5rem;
      }
      
      .contact-label {
        font-size: 0.75rem;
        color: var(--text-muted);
      }
      
      .contact-value {
        font-size: 0.9rem;
        font-weight: 500;
      }
      
      @media (max-width: 768px) {
        .contact-wrapper {
          padding: 24px;
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
         页脚优化
         ============================================ */
      
      .footer {
        padding: 40px 0;
        border-top: 1px solid var(--border-color);
        margin-top: 40px;
      }
      
      .footer-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 16px;
      }
      
      .footer-brand {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
      }
      
      .footer-logo {
        font-size: 1.25rem;
      }
      
      .footer-links {
        display: flex;
        gap: 24px;
        flex-wrap: wrap;
      }
      
      .footer-links a {
        color: var(--text-muted);
        text-decoration: none;
        font-size: 0.875rem;
        transition: color 0.2s ease;
      }
      
      .footer-links a:hover {
        color: var(--accent-primary);
      }
      
      .footer-social a {
        color: var(--text-muted);
        transition: color 0.2s ease;
      }
      
      .footer-social a:hover {
        color: var(--accent-primary);
      }
      
      .footer-bottom {
        text-align: center;
        margin-top: 24px;
        padding-top: 24px;
        border-top: 1px solid var(--border-color);
      }
      
      .footer-bottom p {
        font-size: 0.8rem;
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
         返回顶部按钮优化
         ============================================ */
      
      .back-to-top {
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
        color: white;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        visibility: hidden;
        transform: translateY(20px);
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(88, 166, 255, 0.3);
        z-index: 1000;
      }
      
      .back-to-top.visible {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }
      
      .back-to-top:hover {
        transform: translateY(-4px);
        box-shadow: 0 6px 16px rgba(88, 166, 255, 0.4);
      }
      
      @media (max-width: 768px) {
        .back-to-top {
          width: 40px;
          height: 40px;
          bottom: 20px;
          right: 20px;
        }
      }
      
      /* ============================================
         加载动画优化
         ============================================ */
      
      .loading-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid var(--bg-tertiary);
        border-top-color: var(--accent-primary);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 16px;
      }
      
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      
      /* ============================================
         图片占位符优化
         ============================================ */
      
      .img-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        background: var(--bg-secondary);
        color: var(--text-muted);
        font-size: 2rem;
      }
      
      /* ============================================
         好句分享优化
         ============================================ */
      
      .quotes-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
      }
      
      .quote-card {
        position: relative;
        padding: 24px;
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        cursor: pointer;
        transition: all 0.3s ease;
      }
      
      .quote-card:hover {
        transform: translateY(-4px);
        border-color: var(--accent-primary);
        box-shadow: 0 8px 16px rgba(88, 166, 255, 0.15);
      }
      
      .quote-text {
        font-size: 1.1rem;
        line-height: 1.6;
        color: var(--text-primary);
        margin-bottom: 16px;
        font-style: italic;
      }
      
      .quote-author {
        font-size: 0.875rem;
        color: var(--text-muted);
        text-align: right;
      }
      
      @media (max-width: 768px) {
        .quotes-grid {
          grid-template-columns: 1fr;
        }
        
        .quote-card {
          padding: 16px;
        }
        
        .quote-text {
          font-size: 1rem;
        }
      }
      
      /* ============================================
         滚动指示器优化
         ============================================ */
      
      .scroll-indicator {
        position: absolute;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        color: var(--text-muted);
        font-size: 0.75rem;
        animation: bounce 2s infinite;
      }
      
      .scroll-mouse {
        width: 24px;
        height: 36px;
        border: 2px solid var(--text-muted);
        border-radius: 12px;
        position: relative;
      }
      
      .scroll-wheel {
        position: absolute;
        top: 6px;
        left: 50%;
        transform: translateX(-50%);
        width: 4px;
        height: 8px;
        background: var(--text-muted);
        border-radius: 2px;
        animation: scroll 2s infinite;
      }
      
      @keyframes bounce {
        0%, 100% { transform: translateX(-50%) translateY(0); }
        50% { transform: translateX(-50%) translateY(10px); }
      }
      
      @keyframes scroll {
        0% { opacity: 1; transform: translateX(-50%) translateY(0); }
        100% { opacity: 0; transform: translateX(-50%) translateY(12px); }
      }
      
      @media (max-width: 768px) {
        .scroll-indicator {
          display: none;
        }
      }
    `;
    
    document.head.appendChild(style);
  }

  // 初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addOptimizedStyles);
  } else {
    addOptimizedStyles();
  }

})();
