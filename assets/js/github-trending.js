/**
 * GitHub Trending - 优化版（解决转圈问题）
 * 实时调用，只显示3个项目
 */

(function() {
  'use strict';

  const CONFIG = {
    apiUrl: 'https://api.github.com/search/repositories',
    maxItems: 3,
    languages: ['all', 'C', 'Python', 'JavaScript', 'TypeScript', 'Rust', 'Go'],
    currentLang: 'all',
    cacheTime: 300000, // 5分钟缓存
    timeout: 10000 // 10秒超时
  };

  let cache = {
    data: null,
    timestamp: 0,
    lang: 'all'
  };

  let isLoading = false;

  // 初始化
  function init() {
    // 延迟加载，避免页面加载时阻塞
    setTimeout(() => {
      loadProjects();
    }, 500);
    
    bindEvents();
    addStyles();
  }

  // 加载项目
  async function loadProjects(lang = 'all', force = false) {
    if (isLoading) return; // 防止重复加载
    
    const container = document.getElementById('trending-list');
    if (!container) return;

    // 检查缓存
    const now = Date.now();
    if (!force && 
        cache.data && 
        cache.lang === lang && 
        now - cache.timestamp < CONFIG.cacheTime) {
      renderProjects(cache.data);
      return;
    }

    isLoading = true;
    showLoading(container);

    try {
      let query = 'stars:>1000';
      if (lang !== 'all') {
        query += ` language:${lang}`;
      }

      // 使用 Promise.race 实现超时
      const fetchPromise = fetch(
        `${CONFIG.apiUrl}?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=${CONFIG.maxItems}`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('请求超时')), CONFIG.timeout);
      });

      const response = await Promise.race([fetchPromise, timeoutPromise]);

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('API 速率限制，请稍后再试');
        }
        if (response.status === 503) {
          throw new Error('GitHub 服务暂时不可用');
        }
        throw new Error(`加载失败 (${response.status})`);
      }

      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        throw new Error('暂无数据');
      }

      // 更新缓存
      cache = {
        data: data.items,
        timestamp: now,
        lang: lang
      };

      renderProjects(data.items);
    } catch (error) {
      console.error('GitHub API Error:', error);
      showError(container, error.message);
    } finally {
      isLoading = false;
    }
  }

  // 静默加载，不显示加载提示
  function showLoading(container) {
    // 静默加载，不显示任何提示
    // 直接显示缓存数据或等待加载完成
    if (cache.data) {
      renderProjects(cache.data);
    }
  }

  // 取消加载
  function cancelLoading() {
    isLoading = false;
    const container = document.getElementById('trending-list');
    if (container) {
      showError(container, '加载已取消', true);
    }
  }

  // 显示错误
  function showError(container, message, showRetry = true) {
    container.innerHTML = `
      <div class="github-error">
        <span class="error-icon">😢</span>
        <p>${message}</p>
        ${showRetry ? `
          <button class="retry-btn" onclick="GitHubTrending.refresh()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 4v6h-6M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
            </svg>
            重试
          </button>
        ` : ''}
      </div>
    `;
  }

  // 渲染项目
  function renderProjects(projects) {
    const container = document.getElementById('trending-list');
    if (!container) return;

    const html = `
      <div class="github-projects-list">
        ${projects.map((repo, index) => `
          <a href="${repo.html_url}" target="_blank" rel="noopener" class="github-project-card">
            <div class="project-rank">${index + 1}</div>
            <div class="project-content">
              <div class="project-header">
                <img src="${repo.owner.avatar_url}" alt="${repo.owner.login}" class="project-avatar" loading="lazy" onerror="this.src='https://github.com/github.png'">
                <div class="project-info">
                  <h4 class="project-name">${escapeHtml(repo.name)}</h4>
                  <p class="project-desc">${escapeHtml(repo.description || '暂无描述')}</p>
                </div>
              </div>
              <div class="project-meta">
                <span class="project-lang ${getLangClass(repo.language)}">
                  ${repo.language || 'Other'}
                </span>
                <span class="project-stars">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  ${formatNumber(repo.stargazers_count)}
                </span>
                <span class="project-forks">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                  </svg>
                  ${formatNumber(repo.forks_count)}
                </span>
              </div>
            </div>
          </a>
        `).join('')}
      </div>
      <div class="github-update-time">
        最后更新：${new Date().toLocaleTimeString('zh-CN')}
        ${cache.data ? `<span class="cache-hint">（缓存5分钟）</span>` : ''}
      </div>
    `;

    container.innerHTML = html;
  }

  // 格式化数字
  function formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  }

  // HTML 转义
  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // 获取语言样式类
  function getLangClass(lang) {
    if (!lang) return 'lang-other';
    return 'lang-' + lang.toLowerCase().replace(/\+/g, 'p').replace(/#/g, 's');
  }

  // 绑定事件
  function bindEvents() {
    // 语言筛选
    document.querySelectorAll('.language-filter .pill-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const lang = this.dataset.lang;
        
        // 更新活跃状态
        document.querySelectorAll('.language-filter .pill-btn').forEach(b => {
          b.classList.remove('active');
        });
        this.classList.add('active');
        
        // 加载项目
        CONFIG.currentLang = lang;
        loadProjects(lang, true);
      });
    });

    // 刷新按钮
    const refreshBtn = document.getElementById('refresh-trending');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', function() {
        if (isLoading) return; // 防止重复点击
        this.classList.add('spinning');
        loadProjects(CONFIG.currentLang, true);
        setTimeout(() => this.classList.remove('spinning'), 1000);
      });
    }
  }

  // 添加样式
  function addStyles() {
    if (document.getElementById('github-trending-v3-styles')) return;

    const style = document.createElement('style');
    style.id = 'github-trending-v3-styles';
    style.textContent = `
      /* 加载状态 - 已移除所有加载提示 */
        background: rgba(255, 255, 255, 0.15);
        color: var(--text-primary);
      }

      /* 错误状态 */
      .github-error {
        text-align: center;
        padding: 60px 20px;
        color: var(--text-muted);
      }

      .error-icon {
        font-size: 3rem;
        display: block;
        margin-bottom: 16px;
      }

      .retry-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin-top: 16px;
        padding: 10px 20px;
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        color: var(--text-primary);
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .retry-btn:hover {
        background: var(--bg-tertiary);
        border-color: var(--accent-primary);
      }

      /* 项目列表 */
      .github-projects-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      /* 项目卡片 */
      .github-project-card {
        display: flex;
        gap: 16px;
        padding: 20px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 16px;
        text-decoration: none;
        color: inherit;
        transition: all 0.2s ease;
      }

      .github-project-card:hover {
        background: rgba(255, 255, 255, 0.06);
        border-color: var(--accent-primary);
        transform: translateX(6px);
      }

      /* 排名 */
      .project-rank {
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
        border-radius: 12px;
        font-size: 18px;
        font-weight: 700;
        color: white;
        flex-shrink: 0;
      }

      /* 内容区 */
      .project-content {
        flex: 1;
        min-width: 0;
      }

      .project-header {
        display: flex;
        gap: 12px;
        margin-bottom: 12px;
      }

      .project-avatar {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        flex-shrink: 0;
      }

      .project-info {
        flex: 1;
        min-width: 0;
      }

      .project-name {
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .project-desc {
        font-size: 0.875rem;
        color: var(--text-muted);
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      /* 元信息 */
      .project-meta {
        display: flex;
        gap: 16px;
        flex-wrap: wrap;
      }

      .project-lang,
      .project-stars,
      .project-forks {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.8rem;
        color: var(--text-muted);
      }

      .project-lang {
        padding: 4px 10px;
        background: rgba(88, 166, 255, 0.1);
        border-radius: 20px;
        color: var(--accent-primary);
      }

      .project-lang.lang-javascript,
      .project-lang.lang-typescript {
        background: rgba(240, 219, 79, 0.1);
        color: #f0db4f;
      }

      .project-lang.lang-python {
        background: rgba(55, 118, 171, 0.1);
        color: #3776ab;
      }

      .project-lang.lang-rust {
        background: rgba(222, 165, 132, 0.1);
        color: #dea584;
      }

      .project-lang.lang-go {
        background: rgba(0, 173, 216, 0.1);
        color: #00add8;
      }

      .project-lang.lang-c {
        background: rgba(85, 89, 117, 0.1);
        color: #a8b9cc;
      }

      .project-stars svg,
      .project-forks svg {
        opacity: 0.7;
      }

      /* 更新时间 */
      .github-update-time {
        text-align: center;
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid rgba(255, 255, 255, 0.06);
        font-size: 0.75rem;
        color: var(--text-muted);
      }

      .cache-hint {
        margin-left: 8px;
        opacity: 0.7;
      }

      /* 刷新按钮动画 */
      .spinning svg {
        animation: spin 0.8s linear infinite;
      }

      /* 移动端 */
      @media (max-width: 768px) {
        .github-project-card {
          padding: 16px;
        }

        .project-rank {
          width: 32px;
          height: 32px;
          font-size: 1rem;
        }

        .project-avatar {
          width: 32px;
          height: 32px;
        }

        .project-name {
          font-size: 1rem;
        }

        .project-desc {
          font-size: 0.8rem;
          -webkit-line-clamp: 1;
        }

        .project-meta {
          gap: 12px;
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

  // 暴露接口
  window.GitHubTrending = {
    load: () => loadProjects(CONFIG.currentLang),
    refresh: () => loadProjects(CONFIG.currentLang, true),
    switch: (lang) => loadProjects(lang, true),
    cancel: cancelLoading
  };

})();
