/* ================================================
   GitHub Trending 组件 - 修复版
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
    this.cacheExpiry = 5 * 60 * 1000;
    this.demos = [
      { name: 'ollama', fullName: 'ollama/ollama', desc: 'Get up and running with Llama 3, Mistral, Gemma, and other large language models.', lang: 'Go', stars: 78000, forks: 6500, color: '#00ADD8' },
      { name: 'vllm', fullName: 'vllm-project/vllm', desc: 'High-performance inference engine for LLM, featuring PagedAttention and continuous batching.', lang: 'Python', stars: 32000, forks: 3800, color: '#3572A5' },
      { name: 'fastgpt', fullName: 'labring/fastgpt', desc: 'Enterprise-grade RAG platform with AI knowledge base and workflow orchestration.', lang: 'TypeScript', stars: 18000, forks: 4200, color: '#3178c6' },
      { name: 'open-interpreter', fullName: 'OpenInterpreter/open-interpreter', desc: 'Let language models run code on your computer locally.', lang: 'Python', stars: 45000, forks: 4100, color: '#3572A5' },
      { name: 'hydra', fullName: 'facebookresearch/hydra', desc: 'A framework for elegantly configuring complex applications with nested configs.', lang: 'Python', stars: 32000, forks: 2800, color: '#3572A5' },
      { name: 'comfyui', fullName: 'comfyanonymous/ComfyUI', desc: 'The most powerful and modular stable diffusion GUI and backend.', lang: 'Python', stars: 42000, forks: 4700, color: '#3572A5' },
    ];

    this.init();
  }

  init() {
    this.bindEvents();
    this.load();
  }

  bindEvents() {
    document.querySelectorAll('[data-lang]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('[data-lang]').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.currentLang = e.target.getAttribute('data-lang');
        this.load();
      });
    });

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

    if (this.refreshBtn) {
      this.refreshBtn.addEventListener('click', () => this.load(true));
    }
  }

  async load(forceRefresh = false) {
    if (!this.container) return;

    const cacheKey = `${this.currentLang}-${this.currentQuery}`;
    const cached = this.cache.get(cacheKey);

    if (!forceRefresh && cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      this.render(cached.data);
      return;
    }

    this.showLoading(true);

    try {
      let repos;
      
      if (this.currentQuery) {
        repos = await this.searchRepos();
      } else {
        repos = await this.fetchTrending();
      }

      this.cache.set(cacheKey, { data: repos, timestamp: Date.now() });
      this.render(repos);
    } catch (error) {
      console.error('GitHub Trending Error:', error);
      // 使用演示数据作为后备
      this.render(this.getDemoData());
    } finally {
      this.showLoading(false);
    }
  }

  async fetchTrending() {
    try {
      // 使用 cors-anywhere 代理
      const url = `https://api.github.com/search/repositories?q=stars:>100+pushed:>${this.getDateNDaysAgo(7)}&sort=stars&order=desc&per_page=6`;
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        throw new Error('API Error: ' + response.status);
      }

      const data = await response.json();
      return (data.items || []).slice(0, 6);
    } catch (error) {
      console.warn('API fetch failed, using demo data:', error);
      return this.getDemoData();
    }
  }

  async searchRepos() {
    try {
      const query = this.currentQuery + (this.currentLang !== 'all' ? ` language:${this.currentLang}` : '');
      const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=6`;

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        throw new Error('API Error: ' + response.status);
      }

      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.warn('Search failed, using demo data:', error);
      return this.getDemoData().filter(r => 
        r.name.toLowerCase().includes(this.currentQuery.toLowerCase()) ||
        r.desc.toLowerCase().includes(this.currentQuery.toLowerCase())
      );
    }
  }

  getDemoData() {
    let demos = [...this.demos];
    if (this.currentLang !== 'all') {
      demos = demos.filter(r => {
        if (this.currentLang === 'C') return r.lang === 'C' || r.lang === 'C++';
        if (this.currentLang === 'Python') return r.lang === 'Python';
        if (this.currentLang === 'JavaScript') return r.lang === 'JavaScript' || r.lang === 'TypeScript';
        return true;
      });
    }
    return demos.map(d => ({
      name: d.name,
      full_name: d.fullName,
      description: d.desc,
      language: d.lang,
      stargazers_count: d.stars,
      forks_count: d.forks,
      html_url: `https://github.com/${d.fullName}`,
      owner: { login: d.fullName.split('/')[0], avatar_url: `https://github.com/${d.fullName.split('/')[0]}.png?size=40` }
    }));
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
    if (!repos || repos.length === 0) {
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
    const langColor = this.getLangColor(lang);
    const stars = this.formatNumber(repo.stargazers_count || repo.stars);
    const forks = this.formatNumber(repo.forks_count || repo.forks);
    const [author, name] = (repo.full_name || repo.fullName || repo.name).split('/');

    return `
      <a href="${repo.html_url}" target="_blank" rel="noopener" class="trending-item">
        <div class="trending-info">
          <div class="trending-header">
            <svg class="trending-icon" viewBox="0 0 16 16">
              <path fill="currentColor" d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"/>
            </svg>
            <span class="trending-author">${author}</span>
            <span class="trending-slash">/</span>
            <span class="trending-name">${name}</span>
          </div>
          <p class="trending-desc">${repo.description || '暂无描述'}</p>
          <div class="trending-meta">
            ${lang ? `
              <span class="trending-stat">
                <span class="language-dot" style="background: ${langColor}"></span>
                ${lang}
              </span>
            ` : ''}
            <span class="trending-stat">
              <svg class="star-icon" viewBox="0 0 16 16">
                <path fill="currentColor" d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/>
              </svg>
              ${stars}
            </span>
            <span class="trending-stat">
              <svg class="fork-icon" viewBox="0 0 16 16">
                <path fill="currentColor" d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75v-.878a2.25 2.25 0 111.5 0v.878a2.25 2.25 0 01-2.25 2.25h-1.5v2.128a2.251 2.251 0 11-1.5 0V8.5h-1.5A2.25 2.25 0 013.5 6.25v-.878a2.25 2.25 0 111.5 0zM5 3.25a.75.75 0 10-1.5 0 .75.75 0 001.5 0zm6.75.75a.75.75 0 100-1.5.75.75 0 000 1.5zm-3 8.75a.75.75 0 10-1.5 0 .75.75 0 001.5 0z"/>
              </svg>
              ${forks}
            </span>
          </div>
        </div>
      </a>
    `;
  }

  getLangColor(lang) {
    const colors = {
      'C': '#555555',
      'C++': '#f34b7d',
      'Python': '#3572A5',
      'JavaScript': '#f1e05a',
      'TypeScript': '#3178c6',
      'Java': '#b07219',
      'Go': '#00ADD8',
      'Rust': '#dea584',
      'Ruby': '#701516',
      'PHP': '#4F5D95',
      'Swift': '#F05138',
      'Kotlin': '#A97BFF',
    };
    return colors[lang] || '#8b949e';
  }

  formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('trending-list')) {
    new GitHubTrending();
  }
});
