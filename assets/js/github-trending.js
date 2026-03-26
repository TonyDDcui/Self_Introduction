/**
 * GitHub Trending 优化 - 只显示5个项目
 */

(function() {
  'use strict';

  // 配置
  const CONFIG = {
    // 只显示5个项目
    maxItems: 5,
    
    // 刷新间隔（毫秒）
    refreshInterval: 300000, // 5分钟
    
    // API 配置
    apiUrl: 'https://api.github.com/search/repositories',
    
    // 语言
    languages: ['all', 'C', 'Python', 'JavaScript', 'TypeScript'],
    
    // 当前语言
    currentLang: 'all'
  };

  // 缓存
  let cachedData = {};
  let currentLang = 'all';

  // 加载状态
  function showLoading() {
    const list = document.getElementById('trending-list');
    if (!list) return;
    
    list.innerHTML = `
      <div class="trending-loading">
        <div class="loading-spinner"></div>
        <span>正在获取热门项目...</span>
      </div>
    `;
  }

  // 显示错误
  function showError(message) {
    const list = document.getElementById('trending-list');
    if (!list) return;
    
    list.innerHTML = `
      <div class="trending-error">
        <span>😢</span>
        <p>${message}</p>
        <button class="pill-btn pill-btn-outline" onclick="GitHubTrending.load()">
          重试
        </button>
      </div>
    `;
  }

  // 渲染项目列表（只显示5个）
  function renderProjects(projects) {
    const list = document.getElementById('trending-list');
    if (!list) return;

    // 只取前5个项目
    const topProjects = projects.slice(0, CONFIG.maxItems);

    list.innerHTML = topProjects.map((repo, index) => `
      <a href="${repo.html_url}" target="_blank" rel="noopener" class="trending-item">
        <div class="trending-item-rank">#${index + 1}</div>
        <div class="trending-item-content">
          <div class="trending-item-header">
            <img src="${repo.owner.avatar_url}" alt="${repo.owner.login}" class="trending-item-avatar" loading="lazy">
            <div class="trending-item-info">
              <h4>${repo.name}</h4>
              <p>${repo.description || '暂无描述'}</p>
            </div>
          </div>
          <div class="trending-item-meta">
            <span class="trending-item-lang ${repo.language ? repo.language.toLowerCase() : ''}">
              ${repo.language || 'Other'}
            </span>
            <span class="trending-item-stars">
              ⭐ ${formatNumber(repo.stargazers_count)}
            </span>
            <span class="trending-item-forks">
              🍴 ${formatNumber(repo.forks_count)}
            </span>
          </div>
        </div>
      </a>
    `).join('');

    // 添加样式
    addStyles();
  }

  // 格式化数字
  function formatNumber(num) {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  }

  // 加载项目
  async function loadProjects(lang = 'all') {
    showLoading();
    currentLang = lang;

    const cacheKey = `trending_${lang}`;
    const cacheTime = 5 * 60 * 1000; // 5分钟缓存

    // 检查缓存
    if (cachedData[cacheKey] && 
        cachedData[cacheKey].timestamp > Date.now() - cacheTime) {
      renderProjects(cachedData[cacheKey].data);
      return;
    }

    try {
      let query = 'stars:>1';
      if (lang !== 'all') {
        query += ` language:${lang}`;
      }

      const response = await fetch(
        `${CONFIG.apiUrl}?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=${CONFIG.maxItems}`
      );

      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        throw new Error('No results');
      }

      // 缓存数据
      cachedData[cacheKey] = {
        data: data.items,
        timestamp: Date.now()
      };

      renderProjects(data.items);
    } catch (error) {
      console.error('GitHub Trending Error:', error);
      showError('加载失败，请检查网络连接');
      
      // 使用缓存数据（即使过期）
      if (cachedData[cacheKey]) {
        setTimeout(() => renderProjects(cachedData[cacheKey].data), 1000);
      }
    }
  }

  // 刷新
  function refresh() {
    const cacheKey = `trending_${currentLang}`;
    delete cachedData[cacheKey];
    loadProjects(currentLang);
  }

  // 切换语言
  function switchLanguage(lang) {
    document.querySelectorAll('.language-filter .pill-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    loadProjects(lang);
  }

  // 添加样式
  function addStyles() {
    if (document.getElementById('trending-enhanced-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'trending-enhanced-styles';
    style.textContent = `
      /* Trending 项目 */
      .trending-item {
        display: flex;
        gap: 16px;
        padding: 16px;
        border-radius: 12px;
        background: var(--bg-secondary);
        border: 1px solid transparent;
        text-decoration: none;
        color: inherit;
        transition: all 0.2s ease;
      }

      .trending-item:hover {
        background: var(--bg-tertiary);
        border-color: var(--accent-primary);
        transform: translateX(4px);
      }

      .trending-item-rank {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--accent-primary);
        min-width: 40px;
        text-align: center;
      }

      .trending-item-content {
        flex: 1;
        min-width: 0;
      }

      .trending-item-header {
        display: flex;
        gap: 12px;
        margin-bottom: 10px;
      }

      .trending-item-avatar {
        width: 40px;
        height: 40px;
        border-radius: 8px;
        flex-shrink: 0;
      }

      .trending-item-info {
        flex: 1;
        min-width: 0;
      }

      .trending-item-info h4 {
        font-size: 1rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .trending-item-info p {
        font-size: 0.8rem;
        color: var(--text-muted);
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .trending-item-meta {
        display: flex;
        gap: 16px;
        font-size: 0.8rem;
        color: var(--text-muted);
      }

      .trending-item-lang {
        padding: 2px 8px;
        border-radius: 10px;
        background: rgba(88, 166, 255, 0.1);
        color: var(--accent-primary);
      }

      .trending-item-lang.javascript,
      .trending-item-lang.typescript {
        background: rgba(243, 217, 71, 0.1);
        color: #f7df1e;
      }

      .trending-item-lang.python {
        background: rgba(55, 118, 171, 0.1);
        color: #3776ab;
      }

      .trending-item-lang.c {
        background: rgba(85, 89, 117, 0.1);
        color: #a8b9cc;
      }

      .trending-item-lang.cpp {
        background: rgba(89, 131, 167, 0.1);
        color: #00599c;
      }

      .trending-item-lang.java {
        background: rgba(176, 114, 25, 0.1);
        color: #b07214;
      }

      .trending-item-lang.go {
        background: rgba(0, 173, 216, 0.1);
        color: #00add8;
      }

      .trending-item-lang.rust {
        background: rgba(222, 165, 132, 0.1);
        color: #dea584;
      }

      .trending-item-stars,
      .trending-item-forks {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      /* 错误状态 */
      .trending-error {
        text-align: center;
        padding: 40px 20px;
      }

      .trending-error span {
        font-size: 3rem;
        display: block;
        margin-bottom: 12px;
      }

      .trending-error p {
        color: var(--text-muted);
        margin-bottom: 16px;
      }

      /* 移动端优化 */
      @media (max-width: 768px) {
        .trending-item {
          padding: 12px;
          gap: 12px;
        }

        .trending-item-rank {
          font-size: 1rem;
          min-width: 30px;
        }

        .trending-item-avatar {
          width: 32px;
          height: 32px;
        }

        .trending-item-info h4 {
          font-size: 0.9rem;
        }

        .trending-item-info p {
          font-size: 0.75rem;
          -webkit-line-clamp: 1;
        }

        .trending-item-meta {
          flex-wrap: wrap;
          gap: 8px;
        }

        .trending-item-lang,
        .trending-item-stars,
        .trending-item-forks {
          font-size: 0.75rem;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // 绑定事件
  function bindEvents() {
    // 语言筛选
    document.querySelectorAll('.language-filter .pill-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        switchLanguage(this.dataset.lang);
      });
    });

    // 刷新按钮
    const refreshBtn = document.getElementById('refresh-trending');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', refresh);
    }

    // 搜索
    const searchInput = document.getElementById('github-search');
    if (searchInput) {
      let debounceTimer;
      searchInput.addEventListener('input', function() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          // 可以添加搜索功能
        }, 500);
      });
    }
  }

  // 初始化
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        bindEvents();
        loadProjects();
      });
    } else {
      bindEvents();
      loadProjects();
    }
  }

  // 自动初始化
  init();

  // 暴露全局接口
  window.GitHubTrending = {
    load: () => loadProjects(currentLang),
    refresh: refresh,
    switch: switchLanguage
  };

})();
