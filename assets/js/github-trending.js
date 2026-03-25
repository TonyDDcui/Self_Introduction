/* ================================================
   GitHub Trending 组件
   自动获取 GitHub 热门项目推荐
   ================================================ */

class GitHubTrending {
  constructor() {
    this.container = document.getElementById('trending-list');
    this.loadingEl = document.getElementById('trending-loading');
    this.searchInput = document.getElementById('github-search');
    this.refreshBtn = document.getElementById('refresh-trending');
    this.currentLang = 'all';
    this.currentQuery = '';
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5分钟缓存

    this.init();
  }

  init() {
    this.bindEvents();
    this.load();
  }

  bindEvents() {
    // 语言筛选
    document.querySelectorAll('[data-lang]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('[data-lang]').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.currentLang = e.target.getAttribute('data-lang');
        this.load();
      });
    });

    // 搜索
    if (this.searchInput) {
      let debounceTimer;
      this.searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          this.currentQuery = e.target.value.trim();
          this.load();
        }, 500);
      });
    }

    // 刷新
    if (this.refreshBtn) {
      this.refreshBtn.addEventListener('click', () => {
        this.load(true);
      });
    }
  }

  getCacheKey() {
    return `${this.currentLang}-${this.currentQuery}`;
  }

  async load(forceRefresh = false) {
    if (!this.container) return;

    const cacheKey = this.getCacheKey();
    const cached = this.cache.get(cacheKey);

    // 检查缓存
    if (!forceRefresh && cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      this.render(cached.data);
      return;
    }

    // 显示加载状态
    this.showLoading(true);

    try {
      let repos;

      if (this.currentQuery) {
        // 搜索模式
        repos = await this.searchRepos();
      } else {
        // Trending 模式
        repos = await this.fetchTrending();
      }

      // 缓存结果
      this.cache.set(cacheKey, { data: repos, timestamp: Date.now() });
      this.render(repos);
    } catch (error) {
      console.error('GitHub Trending Error:', error);
      this.renderError();
    } finally {
      this.showLoading(false);
    }
  }

  async fetchTrending() {
    // 使用 GitHub Search API 获取近期热门仓库
    const since = 'daily'; // daily, weekly, monthly
    const langFilter = this.currentLang !== 'all' ? `+language:${this.currentLang}` : '';
    
    const query = `stars:>100${langFilter} pushed:>${this.getDateNDaysAgo(7)}`;
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=6`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('API Error');
    
    const data = await response.json();
    return data.items || [];
  }

  async searchRepos() {
    const query = this.currentQuery + (this.currentLang !== 'all' ? ` language:${this.currentLang}` : '');
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=6`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('API Error');
    
    const data = await response.json();
    return data.items || [];
  }

  getDateNDaysAgo(n) {
    const date = new Date();
    date.setDate(date.getDate() - n);
    return date.toISOString().split('T')[0];
  }

  showLoading(show) {
    if (this.loadingEl) {
      this.loadingEl.style.display = show ? 'flex' : 'none';
    }
  }

  render(repos) {
    if (!repos.length) {
      this.container.innerHTML = `
        <div class="trending-error">
          <p>没有找到相关项目，试试其他关键词？</p>
        </div>
      `;
      return;
    }

    this.container.innerHTML = repos.map(repo => this.renderRepo(repo)).join('');
  }

  renderRepo(repo) {
    const lang = repo.language || '';
    const langClass = lang.toLowerCase().replace(/\+\+/g, 'pp').replace(/#/g, 'sharp');
    const stars = this.formatNumber(repo.stargazers_count);
    const forks = this.formatNumber(repo.forks_count);

    return `
      <a href="${repo.html_url}" target="_blank" rel="noopener" class="trending-item">
        <div class="trending-info">
          <div class="trending-header">
            <svg class="trending-icon" viewBox="0 0 16 16">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            <span class="trending-author">${repo.owner.login}</span>
            <span class="trending-slash">/</span>
            <span class="trending-name">${repo.name}</span>
          </div>
          <p class="trending-desc">${repo.description || '暂无描述'}</p>
          <div class="trending-meta">
            ${lang ? `
              <span class="trending-stat">
                <span class="language-dot lang-${langClass}"></span>
                ${lang}
              </span>
            ` : ''}
            <span class="trending-stat">
              <svg class="star-icon" viewBox="0 0 16 16">
                <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/>
              </svg>
              ${stars}
            </span>
            <span class="trending-stat">
              <svg class="fork-icon" viewBox="0 0 16 16">
                <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75v-.878a2.25 2.25 0 111.5 0v.878a2.25 2.25 0 01-2.25 2.25h-1.5v2.128a2.251 2.251 0 11-1.5 0V8.5h-1.5A2.25 2.25 0 013.5 6.25v-.878a2.25 2.25 0 111.5 0zM5 3.25a.75.75 0 10-1.5 0 .75.75 0 001.5 0zm6.75.75a.75.75 0 100-1.5.75.75 0 000 1.5zm-3 8.75a.75.75 0 10-1.5 0 .75.75 0 001.5 0z"/>
              </svg>
              ${forks}
            </span>
          </div>
        </div>
      </a>
    `;
  }

  renderError() {
    this.container.innerHTML = `
      <div class="trending-error">
        <p>😕 加载失败，请稍后重试</p>
        <p style="font-size: 0.875rem; color: var(--text-tertiary);">
          可能的原因：网络问题或 API 限流
        </p>
      </div>
    `;
  }

  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('trending-list')) {
    new GitHubTrending();
  }
});
