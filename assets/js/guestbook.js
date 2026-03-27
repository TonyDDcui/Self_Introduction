/**
 * 留言板 - JSONBin.io 云端同步版
 * Collection ID: 69c63595c3097a1dd565de94
 * API Key: $2a$10$EOHGYh3otRTo8jQQw3FRc.XMcnhZ2c5E9UloscgNitQfHYArUBVCm
 */

(function () {
  'use strict';

  // ═══════════════════════════════════════
  // 配置
  // ═══════════════════════════════════════
  const CONFIG = {
    collectionId: '69c63595c3097a1dd565de94',
    apiKey: '$2a$10$EOHGYh3otRTo8jQQw3FRc.XMcnhZ2c5E9UloscgNitQfHYArUBVCm',
    storageKey: 'guestbook_messages_v5',
    maxMessages: 100,
    pollInterval: 10000,
  };

  // 预置留言
  const DEFAULT_MESSAGES = [
    { id: 1700000001, name: '访客', message: '网站设计得很棒！', time: '2024-01-15T10:30:00Z', color: '#58a6ff' },
    { id: 1700000002, name: '开发者', message: 'UI 精致，体验很好', time: '2024-01-14T09:15:00Z', color: '#a371f7' },
    { id: 1700000003, name: '同学', message: '学长加油！', time: '2024-01-13T16:45:00Z', color: '#39d353' }
  ];

  let messages = [];

  // ═══════════════════════════════════════
  // 初始化
  // ═══════════════════════════════════════
  function init() {
    loadLocalMessages();
    render();
    bindEvents();
    addStyles();
    startCloudSync();
  }

  // ═══════════════════════════════════════
  // 云端同步
  // ═══════════════════════════════════════
  async function fetchFromCloud() {
    if (!CONFIG.collectionId || !CONFIG.apiKey) {
      console.warn('未配置云端同步');
      return;
    }

    try {
      updateSyncStatus('syncing');

      const response = await fetch(
        `https://api.jsonbin.io/v3/c/${CONFIG.collectionId}/records`,
        {
          method: 'GET',
          headers: {
            'X-Access-Key': CONFIG.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data && Array.isArray(data)) {
        // 直接是数组
        mergeMessages(data);
      } else if (data && data.records) {
        // 有 records 字段
        const cloudMessages = [];
        data.records.forEach(record => {
          if (record.record && record.record.messages) {
            cloudMessages.push(...record.record.messages);
          }
        });
        if (cloudMessages.length > 0) {
          mergeMessages(cloudMessages);
        }
      }

      updateSyncStatus('synced');

    } catch (e) {
      console.error('云端拉取失败:', e);
      updateSyncStatus('offline');
    }
  }

  async function pushToCloud(newMessage) {
    if (!CONFIG.collectionId || !CONFIG.apiKey) {
      console.warn('未配置云端同步，仅本地存储');
      return;
    }

    try {
      // 创建新的 bin
      const response = await fetch(
        `https://api.jsonbin.io/v3/c/${CONFIG.collectionId}/records`,
        {
          method: 'POST',
          headers: {
            'X-Access-Key': CONFIG.apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messages: [newMessage]
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      updateSyncStatus('synced');
      console.log('✅ 留言已同步到云端');

    } catch (e) {
      console.error('云端推送失败:', e);
      updateSyncStatus('offline');
    }
  }

  function startCloudSync() {
    fetchFromCloud();
    setInterval(fetchFromCloud, CONFIG.pollInterval);

    // 页面可见时同步
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        fetchFromCloud();
      }
    });
  }

  function mergeMessages(cloudMessages) {
    if (!Array.isArray(cloudMessages) || cloudMessages.length === 0) return;

    const localIds = new Set(messages.map(m => m.id));
    let hasNew = false;

    cloudMessages.forEach(cm => {
      if (cm && cm.id && !localIds.has(cm.id)) {
        messages.push(cm);
        hasNew = true;
      }
    });

    if (hasNew) {
      messages.sort((a, b) => new Date(b.time) - new Date(a.time));
      messages = messages.slice(0, CONFIG.maxMessages);
      saveLocalMessages();
      render();

      if (document.visibilityState === 'visible') {
        showToast('收到新留言 ✨');
      }
    }
  }

  function updateSyncStatus(status) {
    const el = document.getElementById('gb-sync-status');
    if (!el) return;

    const statusMap = {
      syncing: '<span class="sync-syncing">🔄 同步中...</span>',
      synced: '<span class="sync-cloud">☁️ 已同步</span>',
      offline: '<span class="sync-local">📱 本地</span>'
    };

    el.innerHTML = statusMap[status] || statusMap.offline;
  }

  // ═══════════════════════════════════════
  // 本地存储
  // ═══════════════════════════════════════
  function loadLocalMessages() {
    try {
      const stored = localStorage.getItem(CONFIG.storageKey);
      if (stored) {
        messages = JSON.parse(stored);
      } else {
        messages = [...DEFAULT_MESSAGES];
        saveLocalMessages();
      }
    } catch (e) {
      messages = [...DEFAULT_MESSAGES];
    }
  }

  function saveLocalMessages() {
    try {
      localStorage.setItem(CONFIG.storageKey, JSON.stringify(messages));
    } catch (e) {
      console.error('本地保存失败:', e);
    }
  }

  // ═══════════════════════════════════════
  // 添加留言
  // ═══════════════════════════════════════
  function addMessage(name, message) {
    const newMessage = {
      id: Date.now(),
      name: name.trim().slice(0, 20),
      message: message.trim().slice(0, 200),
      time: new Date().toISOString(),
      color: getRandomColor()
    };

    messages.unshift(newMessage);
    if (messages.length > CONFIG.maxMessages) {
      messages = messages.slice(0, CONFIG.maxMessages);
    }

    saveLocalMessages();
    pushToCloud(newMessage);

    return newMessage;
  }

  function getRandomColor() {
    const colors = ['#58a6ff', '#a371f7', '#39d353', '#d29922', '#f85149', '#79c0ff', '#f778ba', '#ffa657'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // ═══════════════════════════════════════
  // 格式化
  // ═══════════════════════════════════════
  function formatTime(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
    if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
    if (diff < 604800000) return Math.floor(diff / 86400000) + '天前';

    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ═══════════════════════════════════════
  // 渲染
  // ═══════════════════════════════════════
  function render() {
    const container = document.querySelector('.guestbook-container');
    if (!container) return;

    container.innerHTML = `
      <div class="gb-wrapper">
        <div class="gb-header">
          <div class="gb-title">
            <h3>💬 留言板</h3>
            <span class="gb-sync-status" id="gb-sync-status">
              <span class="sync-cloud">☁️ 已同步</span>
            </span>
          </div>
          <div class="gb-stats">
            <span class="gb-count">${messages.length}</span> 条留言
          </div>
        </div>

        <div class="gb-list" id="gb-list">
          ${messages.length === 0 ? `
            <div class="gb-empty">
              <p>还没有留言，快来抢沙发！</p>
            </div>
          ` : messages.map(msg => `
            <div class="gb-item">
              <div class="gb-avatar" style="background: ${msg.color}">${msg.name.charAt(0).toUpperCase()}</div>
              <div class="gb-body">
                <div class="gb-meta">
                  <span class="gb-name" style="color: ${msg.color}">${escapeHtml(msg.name)}</span>
                  <span class="gb-time">${formatTime(msg.time)}</span>
                </div>
                <div class="gb-text">${escapeHtml(msg.message)}</div>
              </div>
            </div>
          `).join('')}
        </div>

        <form class="gb-form" id="gb-form">
          <input type="text" id="gb-name" placeholder="你的昵称" maxlength="20" required>
          <textarea id="gb-message" placeholder="写下你的留言..." maxlength="200" rows="3" required></textarea>
          <button type="submit" class="gb-submit">🚀 发布留言</button>
        </form>
      </div>
    `;
  }

  // ═══════════════════════════════════════
  // 事件
  // ═══════════════════════════════════════
  function bindEvents() {
    document.addEventListener('submit', function (e) {
      if (e.target.id === 'gb-form') {
        e.preventDefault();

        const nameInput = document.getElementById('gb-name');
        const msgInput = document.getElementById('gb-message');

        if (nameInput && msgInput && nameInput.value.trim() && msgInput.value.trim()) {
          addMessage(nameInput.value, msgInput.value);
          render();
          showToast('留言发布成功！🎉');
        }
      }
    });
  }

  function showToast(message) {
    const existing = document.querySelector('.gb-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'gb-toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  // ═══════════════════════════════════════
  // 样式
  // ═══════════════════════════════════════
  function addStyles() {
    if (document.getElementById('gb-styles')) return;

    const style = document.createElement('style');
    style.id = 'gb-styles';
    style.textContent = `
      .gb-wrapper {
        max-width: 680px;
        margin: 0 auto;
        padding: 20px;
      }

      .gb-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--border, rgba(255,255,255,0.1));
      }

      .gb-title {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .gb-title h3 {
        font-size: 1.3rem;
        margin: 0;
        color: var(--text-primary, #e6edf3);
      }

      .gb-sync-status {
        font-size: 0.75rem;
        padding: 2px 8px;
        border-radius: 10px;
        background: rgba(88,166,255,0.1);
      }

      .sync-cloud { color: #39d353; }
      .sync-local { color: #8b949e; }
      .sync-syncing { color: #58a6ff; }

      .gb-stats {
        font-size: 0.85rem;
        color: var(--text-muted, #8b949e);
      }

      .gb-count {
        font-weight: 600;
        color: var(--accent, #58a6ff);
      }

      .gb-list {
        max-height: 400px;
        overflow-y: auto;
        margin-bottom: 20px;
      }

      .gb-empty {
        text-align: center;
        padding: 40px;
        color: var(--text-muted, #8b949e);
      }

      .gb-item {
        display: flex;
        gap: 12px;
        padding: 14px;
        margin-bottom: 12px;
        background: var(--card, rgba(255,255,255,0.03));
        border-radius: 12px;
        border: 1px solid var(--border, rgba(255,255,255,0.08));
      }

      .gb-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 700;
        font-size: 0.9rem;
        flex-shrink: 0;
      }

      .gb-body {
        flex: 1;
        min-width: 0;
      }

      .gb-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 6px;
      }

      .gb-name {
        font-weight: 600;
        font-size: 0.9rem;
      }

      .gb-time {
        font-size: 0.75rem;
        color: var(--text-muted, #8b949e);
      }

      .gb-text {
        font-size: 0.88rem;
        color: var(--text-secondary, #c9d1d9);
        line-height: 1.5;
        word-break: break-word;
      }

      .gb-form {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .gb-form input,
      .gb-form textarea {
        padding: 12px 14px;
        background: var(--input-bg, rgba(255,255,255,0.05));
        border: 1px solid var(--input-border, rgba(255,255,255,0.1));
        border-radius: 10px;
        color: var(--text-primary, #e6edf3);
        font-size: 0.9rem;
        font-family: inherit;
      }

      .gb-form input:focus,
      .gb-form textarea:focus {
        outline: none;
        border-color: var(--accent, #58a6ff);
      }

      .gb-form input::placeholder,
      .gb-form textarea::placeholder {
        color: var(--text-muted, #6e7681);
      }

      .gb-submit {
        padding: 12px 20px;
        background: linear-gradient(135deg, #58a6ff, #a371f7);
        border: none;
        border-radius: 10px;
        color: white;
        font-size: 0.95rem;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
      }

      .gb-submit:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 16px rgba(88,166,255,0.4);
      }

      .gb-submit:active {
        transform: scale(0.98);
      }

      .gb-toast {
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        padding: 12px 24px;
        background: linear-gradient(135deg, #39d353, #2ea043);
        color: white;
        border-radius: 12px;
        font-size: 0.9rem;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        opacity: 0;
        transition: all 0.3s;
        z-index: 10000;
      }

      .gb-toast.show {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }

      @media (max-width: 480px) {
        .gb-wrapper {
          padding: 12px;
        }

        .gb-item {
          padding: 12px;
        }

        .gb-avatar {
          width: 32px;
          height: 32px;
          font-size: 0.8rem;
        }
      }
    `;

    document.head.appendChild(style);
  }

  // 启动
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
