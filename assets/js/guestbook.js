/**
 * 留言板 - 云端同步版 (已配置 JSONBin.io)
 * Collection ID: 69c63595c3097a1dd565de94
 */

(function() {
  'use strict';

  // ═══════════════════════════════════════
  // 云端配置 - JSONBin.io
  // ═══════════════════════════════════════
  const CONFIG = {
    // JSONBin.io 配置
    collectionId: '69c63595c3097a1dd565de94',
    
    // 如果你需要写入权限，请填写 API Key
    // 在 https://jsonbin.io/app/api-keys 创建
    apiKey: '',  // 留空则只能读取，不能写入

    storageKey: 'guestbook_messages_v4',
    maxMessages: 100,
    pollInterval: 10000,  // 10秒同步一次
  };

  // 预置留言
  const DEFAULT_MESSAGES = [
    { id: 1700000001, name: '访客', message: '网站设计得很棒！', time: '2024-01-15T10:30:00Z', color: '#58a6ff' },
    { id: 1700000002, name: '开发者', message: 'UI 精致，体验很好', time: '2024-01-14T09:15:00Z', color: '#a371f7' },
    { id: 1700000003, name: '同学', message: '学长加油，期待更多作品！', time: '2024-01-13T16:45:00Z', color: '#39d353' }
  ];

  let messages = [];
  let lastSyncTime = null;

  function init() {
    loadMessages();
    render();
    bindEvents();
    addStyles();
    startCloudSync();
    
    // 监听网络状态
    window.addEventListener('online', () => showToast('网络已恢复 ✓'));
    window.addEventListener('offline', () => showToast('网络已断开'));
    
    // 页面可见时同步
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        fetchFromCloud();
      }
    });
  }

  // ═══════════════════════════════════════
  // 云端同步
  // ═══════════════════════════════════════
  
  async function fetchFromCloud() {
    if (!CONFIG.collectionId) return;
    
    try {
      // 使用 JSONBin.io Collection API
      const response = await fetch(
        `https://api.jsonbin.io/v3/c/${CONFIG.collectionId}/records`,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        console.warn('云端拉取失败:', response.status);
        return;
      }
      
      const data = await response.json();
      
      if (data && data.records && Array.isArray(data.records)) {
        // 解析云端数据
        const cloudMessages = [];
        for (const record of data.records) {
          if (record.record && record.record.messages) {
            cloudMessages.push(...record.record.messages);
          }
        }
        
        if (cloudMessages.length > 0) {
          mergeMessages(cloudMessages);
          lastSyncTime = new Date().toISOString();
          updateSyncStatus('synced');
        }
      }
      
    } catch (e) {
      console.warn('云端拉取失败:', e);
      updateSyncStatus('offline');
    }
  }

  async function pushToCloud(newMessage) {
    if (!CONFIG.collectionId || !CONFIG.apiKey) {
      // 没有 API Key，使用本地存储
      console.log('未配置 API Key，仅本地存储');
      return;
    }
    
    try {
      await fetch(
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
      
      lastSyncTime = new Date().toISOString();
      updateSyncStatus('synced');
      
    } catch (e) {
      console.warn('云端推送失败:', e);
      updateSyncStatus('offline');
    }
  }

  function mergeMessages(cloudMessages) {
    const localIds = new Set(messages.map(m => m.id));
    let hasNew = false;
    
    cloudMessages.forEach(cm => {
      if (!localIds.has(cm.id)) {
        messages.push(cm);
        hasNew = true;
      }
    });
    
    if (hasNew) {
      // 按时间排序
      messages.sort((a, b) => new Date(b.time) - new Date(a.time));
      messages = messages.slice(0, CONFIG.maxMessages);
      saveMessages();
      render();
      showToast('收到新留言 ✨');
    }
  }

  function startCloudSync() {
    fetchFromCloud();
    setInterval(fetchFromCloud, CONFIG.pollInterval);
  }

  function updateSyncStatus(status) {
    const statusEl = document.getElementById('gb-sync-status');
    if (!statusEl) return;
    
    if (status === 'synced') {
      statusEl.innerHTML = '<span class="sync-cloud">☁️ 已同步</span>';
    } else if (status === 'offline') {
      statusEl.innerHTML = '<span class="sync-local">📱 本地</span>';
    }
  }

  // ═══════════════════════════════════════
  // 本地存储
  // ═══════════════════════════════════════
  
  function loadMessages() {
    try {
      const stored = localStorage.getItem(CONFIG.storageKey);
      if (stored) {
        messages = JSON.parse(stored);
      } else {
        messages = [...DEFAULT_MESSAGES];
        saveMessages();
      }
    } catch (e) {
      messages = [...DEFAULT_MESSAGES];
    }
  }

  function saveMessages() {
    try {
      localStorage.setItem(CONFIG.storageKey, JSON.stringify(messages));
    } catch (e) {
      console.warn('保存失败:', e);
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
    if (messages.length > CONFIG.maxMessages) messages = messages.slice(0, CONFIG.maxMessages);
    
    saveMessages();
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

    const theme = document.documentElement.getAttribute('data-theme') || 'dark';
    const isLight = theme === 'light';

    container.innerHTML = `
      <div class="gb-wrapper">
        <div class="gb-header">
          <div class="gb-title">
            <span class="gb-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </span>
            <h3>留言板</h3>
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
              <span class="gb-empty-icon">💬</span>
              <p>还没有留言，快来抢沙发！</p>
            </div>
          ` : messages.map(msg => `
            <div class="gb-item" data-id="${msg.id}">
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
          <div class="gb-form-row">
            <input type="text" id="gb-name" placeholder="你的昵称" maxlength="20" required>
          </div>
          <div class="gb-form-row">
            <textarea id="gb-message" placeholder="写下你的留言..." maxlength="200" rows="3" required></textarea>
          </div>
          <div class="gb-form-footer">
            <span class="gb-hint">${new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })}</span>
            <button type="submit" class="gb-submit">
              <span class="gb-submit-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </span>
              发布留言
            </button>
          </div>
        </form>
      </div>
    `;
  }

  // ═══════════════════════════════════════
  // 事件
  // ═══════════════════════════════════════
  
  function bindEvents() {
    const container = document.querySelector('.guestbook-container');
    if (!container) return;

    container.addEventListener('submit', function(e) {
      if (e.target.id === 'gb-form') {
        e.preventDefault();
        const name = document.getElementById('gb-name').value;
        const msg = document.getElementById('gb-message').value;
        
        if (name.trim() && msg.trim()) {
          addMessage(name, msg);
          render();
          showToast('留言发布成功！🎉');
          
          const list = document.getElementById('gb-list');
          if (list) list.scrollTop = 0;
        }
      }
    });

    const inputs = container.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      input.addEventListener('focus', () => input.closest('.gb-form-row')?.classList.add('focused'));
      input.addEventListener('blur', () => input.closest('.gb-form-row')?.classList.remove('focused'));
    });
  }

  function showToast(message) {
    const existing = document.querySelector('.gb-toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = 'gb-toast';
    toast.innerHTML = message;
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
    if (document.getElementById('guestbook-v4-styles')) return;
    const s = document.createElement('style');
    s.id = 'guestbook-v4-styles';
    s.textContent = `
      .gb-wrapper { max-width: 680px; margin: 0 auto; padding: 0 16px; }
      .gb-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
      .gb-title { display: flex; align-items: center; gap: 10px; }
      .gb-icon { width: 28px; height: 28px; color: var(--accent, #58a6ff); }
      .gb-icon svg { width: 100%; height: 100%; }
      .gb-title h3 { font-size: 1.4rem; font-weight: 700; margin: 0; background: linear-gradient(135deg, #58a6ff, #a371f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
      .gb-sync-status { font-size: 0.7rem; padding: 2px 8px; border-radius: 10px; background: rgba(88,166,255,0.1); }
      .sync-cloud { color: #39d353; }
      .sync-local { color: #8b949e; }
      .gb-stats { font-size: 0.8rem; color: var(--text-muted, #8b949e); background: var(--card-bg, rgba(255,255,255,0.04)); padding: 4px 10px; border-radius: 20px; }
      .gb-count { font-weight: 600; color: var(--accent, #58a6ff); }
      .gb-list { display: flex; flex-direction: column; gap: 12px; max-height: 480px; overflow-y: auto; margin-bottom: 20px; padding-right: 4px; }
      .gb-empty { text-align: center; padding: 40px 20px; color: var(--text-muted, #8b949e); }
      .gb-empty-icon { font-size: 3rem; display: block; margin-bottom: 12px; }
      .gb-empty p { margin: 0; font-size: 0.95rem; }
      .gb-item { display: flex; gap: 12px; padding: 14px 16px; background: var(--card, rgba(255,255,255,0.03)); border-radius: 14px; border: 1px solid var(--border, rgba(255,255,255,0.06)); transition: all 0.2s ease; }
      .gb-item:hover { border-color: var(--accent, rgba(88,166,255,0.2)); transform: translateX(2px); }
      .gb-avatar { width: 38px; height: 38px; border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1rem; flex-shrink: 0; }
      .gb-body { flex: 1; min-width: 0; }
      .gb-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
      .gb-name { font-weight: 600; font-size: 0.9rem; }
      .gb-time { font-size: 0.72rem; color: var(--text-muted, #8b949e); }
      .gb-text { font-size: 0.88rem; line-height: 1.6; color: var(--text-secondary, #c9d1d9); word-break: break-word; }
      .gb-form { background: var(--card, rgba(255,255,255,0.03)); border-radius: 18px; padding: 18px; border: 1px solid var(--border, rgba(255,255,255,0.06)); }
      .gb-form-row { margin-bottom: 12px; border-radius: 12px; transition: all 0.2s ease; }
      .gb-form-row.focused { box-shadow: 0 0 0 2px var(--accent, rgba(88,166,255,0.3)); }
      .gb-form input, .gb-form textarea { width: 100%; padding: 12px 14px; background: var(--input-bg, rgba(255,255,255,0.05)); border: 1px solid var(--input-border, rgba(255,255,255,0.08)); border-radius: 12px; color: var(--text-primary, #e6edf3); font-size: 0.9rem; font-family: inherit; box-sizing: border-box; }
      .gb-form input:focus, .gb-form textarea:focus { outline: none; border-color: var(--accent, #58a6ff); }
      .gb-form textarea { resize: vertical; min-height: 80px; }
      .gb-form input::placeholder, .gb-form textarea::placeholder { color: var(--text-muted, #6e7681); }
      .gb-form-footer { display: flex; justify-content: space-between; align-items: center; }
      .gb-hint { font-size: 0.75rem; color: var(--text-muted, #6e7681); }
      .gb-submit { display: flex; align-items: center; gap: 6px; padding: 10px 20px; background: linear-gradient(135deg, #58a6ff, #a371f7); border: none; border-radius: 10px; color: white; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
      .gb-submit:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(88,166,255,0.4); }
      .gb-submit:active { transform: scale(0.97); }
      .gb-submit-icon { width: 16px; height: 16px; }
      .gb-submit-icon svg { width: 100%; height: 100%; }
      .gb-toast { position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%) translateY(20px); padding: 12px 22px; background: linear-gradient(135deg, #39d353, #2ea043); color: white; border-radius: 12px; font-size: 0.9rem; font-weight: 500; box-shadow: 0 4px 20px rgba(0,0,0,0.3); opacity: 0; transition: all 0.3s cubic-bezier(0.4,0,0.2,1); z-index: 10000; pointer-events: none; }
      .gb-toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
      
      [data-theme="light"] .gb-item { background: rgba(255,255,255,0.8); border-color: rgba(0,0,0,0.06); }
      [data-theme="light"] .gb-form { background: rgba(255,255,255,0.9); border-color: rgba(0,0,0,0.06); }
      [data-theme="light"] .gb-form input, [data-theme="light"] .gb-form textarea { background: rgba(0,0,0,0.03); border-color: rgba(0,0,0,0.08); color: #1f2328; }
      [data-theme="light"] .gb-text { color: #57606a; }
      
      @media (max-width: 480px) {
        .gb-wrapper { padding: 0 12px; }
        .gb-item { padding: 12px; gap: 10px; }
        .gb-avatar { width: 34px; height: 34px; font-size: 0.9rem; }
        .gb-text { font-size: 0.85rem; }
        .gb-form { padding: 14px; border-radius: 16px; }
        .gb-form-footer { flex-direction: column; gap: 10px; align-items: stretch; }
        .gb-submit { justify-content: center; }
        .gb-toast { bottom: 90px; }
      }
    `;
    document.head.appendChild(s);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
