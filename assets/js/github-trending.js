/**
 * GitHub Trending - 静默版
 * 无加载提示，无动画
 */

(function() {
  'use strict';

  const CONFIG = {
    apiUrl: 'https://api.github.com/search/repositories',
    maxItems: 3,
    cacheTime: 300000
  };

  let cache = { data: null, timestamp: 0 };

  function init() {
    loadProjects();
    bindEvents();
    addStyles();
  }

  async function loadProjects(force = false) {
    const container = document.getElementById('trending-list');
    if (!container) return;

    const now = Date.now();
    if (!force && cache.data && now - cache.timestamp < CONFIG.cacheTime) {
      renderProjects(cache.data);
      return;
    }

    try {
      const response = await fetch(
        `${CONFIG.apiUrl}?q=stars:>1000&sort=stars&order=desc&per_page=${CONFIG.maxItems}`,
        { headers: { 'Accept': 'application/vnd.github.v3+json' } }
      );

      if (!response.ok) throw new Error('加载失败');

      const data = await response.json();
      if (!data.items || data.items.length === 0) throw new Error('暂无数据');

      cache = { data: data.items, timestamp: now };
      renderProjects(data.items);
    } catch (error) {
      showError(container, error.message);
    }
  }

  function renderProjects(projects) {
    const container = document.getElementById('trending-list');
    if (!container) return;

    container.innerHTML = `
      <div class="github-projects-list">
        ${projects.map((repo, index) => `
          <a href="${repo.html_url}" target="_blank" rel="noopener" class="github-project-card">
            <div class="project-rank">${index + 1}</div>
            <div class="project-content">
              <div class="project-header">
                <img src="${repo.owner.avatar_url}" alt="${repo.owner.login}" class="project-avatar" loading="lazy">
                <div class="project-info">
                  <h4 class="project-name">${escapeHtml(repo.name)}</h4>
                  <p class="project-desc">${escapeHtml(repo.description || '暂无描述')}</p>
                </div>
              </div>
              <div class="project-meta">
                <span class="project-lang">${repo.language || 'Other'}</span>
                <span class="project-stars">⭐ ${formatNumber(repo.stargazers_count)}</span>
              </div>
            </div>
          </a>
        `).join('')}
      </div>
    `;
  }

  function showError(container, message) {
    container.innerHTML = `
      <div class="github-error">
        <p>${message}</p>
        <button onclick="GitHubTrending.refresh()">重试</button>
      </div>
    `;
  }

  function formatNumber(num) {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  }

  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function bindEvents() {
    const refreshBtn = document.getElementById('refresh-trending');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => loadProjects(true));
    }
  }

  function addStyles() {
    if (document.getElementById('github-trending-styles')) return;
    const style = document.createElement('style');
    style.id = 'github-trending-styles';
    style.textContent = `
      .github-projects-list { display: flex; flex-direction: column; gap: 16px; }
      .github-project-card { 
        display: flex; gap: 16px; padding: 20px; 
        background: rgba(255,255,255,0.03); border-radius: 16px;
        text-decoration: none; color: inherit;
      }
      .project-rank { 
        width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;
        background: linear-gradient(135deg, #58a6ff, #a371f7); border-radius: 12px;
        font-size: 18px; font-weight: 700; color: white;
      }
      .project-content { flex: 1; }
      .project-header { display: flex; gap: 12px; margin-bottom: 12px; }
      .project-avatar { width: 40px; height: 40px; border-radius: 10px; }
      .project-name { font-size: 1.1rem; font-weight: 600; margin-bottom: 4px; }
      .project-desc { font-size: 0.875rem; color: var(--text-muted); }
      .project-meta { display: flex; gap: 16px; font-size: 0.8rem; color: var(--text-muted); }
      .github-error { text-align: center; padding: 40px; color: var(--text-muted); }
    `;
    document.head.appendChild(style);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.GitHubTrending = { refresh: () => loadProjects(true) };
})();