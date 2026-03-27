/**
 * 留言板 - 云端同步版
 * 电脑端和手机端实时同步
 */

(function() {
  'use strict';

  // ========== 配置 ==========
  // 留言数据文件路径（请根据实际后端配置修改）
  // 可用 GitHub Gist、JSONBin.io、或自己的后端 API
  // 示例: const API_URL = 'https://api.jsonbin.io/v3/b/YOUR_BIN_ID/latest';
  
  const CONFIG = {
    // 如果没有后端，使用 localStorage + 定时拉取
    storageKey: 'guestbook_messages_v2',
    maxMessages: 100,
    pollInterval: 30000, // 30秒拉取一次
  };

  // 预置历史留言
  const DEFAULT_MESSAGES = [
    { id: 1700000001, name: '访客', message: '网站设计得很棒！', time: '2024-01-15T10:30:00Z', color: '#58a6ff' },
    { id: 1700000002, name: '开发者', message: 'UI 精致，体验很好', time: '2024-01-14T09:15:00Z', color: '#a371f7' },
    { id: 1700000003, name: '同学', message: '学长加油，期待更多作品！', time: '2024-01-13T16:45:00Z', color: '#39d353' }
  ];

  let messages = [];
  let lastSyncTime = null;

  // ========== 核心函数 ==========
  function init() {
    loadMessages();
    render();
    bindEvents();
    addStyles();
    // 启动定时同步
    startPolling();
  }

  // 从本地存储加载
  function loadMessages() {
    try {
      const stored = localStorage.getItem(CONFIG.storageKey);
      if (stored) {
        messages = JSON.parse(stored);
        lastSyncTime = localStorage.getItem(CONFIG.storageKey + '_time');
      } else {
        messages = [...DEFAULT_MESSAGES];
        saveMessages();
      }
    } catch (e) {
      messages = [...DEFAULT_MESSAGES];
    }
  }

  // 保存到本地存储
  function saveMessages() {
    try {
      localStorage.setItem(CONFIG.storageKey, JSON.stringify(messages));
      localStorage.setItem(CONFIG.storageKey + '_time', new Date().toISOString());
    } catch (e) {
      console.warn('保存失败:', e);
    }
  }

  // 定时从云端拉取（跨设备同步关键！）
  function startPolling() {
    setInterval(async () => {
      const cloudMessages = await fetchCloudMessages();
      if (cloudMessages && cloudMessages.length > 0) {
        // 合并：取最新发表的留言
        const localIds = messages.map(m => m.id);
        let hasNew = false;
        cloudMessages.forEach(cm => {
          if (!localIds.includes(cm.id)) {
            messages.unshift(cm);
            hasNew = true;
          }
        });
        if (hasNew) {
          messages = messages.slice(0, CONFIG.maxMessages);
          saveMessages();
          render();
          if (document.visibilityState === 'visible') {
            showToast('收到新留言 ✨');
          }
        }
      }
    }, CONFIG.pollInterval);

    // 页面可见性变化时立即同步
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        fetchCloudMessages().then(cloudMessages => {
          if (cloudMessages && cloudMessages.length > messages.length) {
            messages = cloudMessages.slice(0, CONFIG.maxMessages);
            saveMessages();
            render();
          }
        });
      }
    });
  }

  // 获取云端留言（需要配合后端使用）
  async function fetchCloudMessages() {
    // ====== 请在这里配置你的后端 API ======
    // 推荐方案：
    // 1. GitHub Gist (免费)
    // 2. JSONBin.io (免费额度)
    // 3. 自己搭建的后端
    //
    // 示例 (GitHub Gist):
    // const response = await fetch('https://api.github.com/gists/YOUR_GIST_ID', {
    //   headers: { 'Accept': 'application/vnd.github.v3+json' }
    // });
    // const data = await response.json();
    // return JSON.parse(data.files['guestbook.json'].content);
    
    // 目前暂时使用本地存储，多设备可通过以下方式共享：
    // 1. 使用 JSONBin.io 等服务
    // 2. 使用 Cloudflare Workers
    // 3. 使用 GitHub Gist
    
    return null; // 暂不使用，保留本地
  }

  // 添加留言
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
    return newMessage;
  }

  // 随机颜色
  function getRandomColor() {
    const colors = ['#58a6ff', '#a371f7', '#39d353', '#d29922', '#f85149', '#79c0ff', '#f778ba', '#ffa657'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // 格式化时间
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

  // HTML 转义
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ========== 渲染 ==========
  function render() {
    const container = document.querySelector('.guestbook-container');
    if (!container) return;

    container.innerHTML = `
      <div class="gb-wrapper">
        <div class="gb-header">
          <div class="gb-title">
            <span class="gb-icon">💬</span>
            <h3>留言板</h3>
          </div>
          <div class="gb-stats">
            <span class="gb-count">${messages.length}</span> 条留言
          </div>
        </div>
        
        <div class="gb-list" id="gb-list">
          ${messages.map(msg => `
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
              <span class="gb-submit-icon">🚀</span>
              发布
            </button>
          </div>
        </form>
      </div>
    `;
  }

  // ========== 事件 ==========
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
          showToast('留言发布成功！✨');
          
          // 滚动到顶部显示新留言
          const list = document.getElementById('gb-list');
          if (list) list.scrollTop = 0;
        }
      }
    });

    // 输入框动画
    const inputs = container.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      input.addEventListener('focus', () => input.closest('.gb-form-row')?.classList.add('focused'));
      input.addEventListener('blur', () => input.closest('.gb-form-row')?.classList.remove('focused'));
    });
  }

  // Toast 提示
  function showToast(message) {
    const existing = document.querySelector('.gb-toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = 'gb-toast';
    toast.innerHTML = `<span class="toast-icon">✓</span> ${message}`;
    document.body.appendChild(toast);
    
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  // ========== 样式 ==========
  function addStyles() {
    if (document.getElementById('guestbook-v2-styles')) return;
    const s = document.createElement('style');
    s.id = 'guestbook-v2-styles';
    s.textContent = `
      /* ── 容器 ── */
      .gb-wrapper {
        max-width: 680px;
        margin: 0 auto;
        padding: 0 16px;
      }

      /* ── 头部 ── */
      .gb-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      .gb-title {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .gb-icon { font-size: 1.6rem; }
      .gb-title h3 {
        font-size: 1.4rem;
        font-weight: 700;
        margin: 0;
        background: linear-gradient(135deg, #58a6ff, #a371f7);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      .gb-stats {
        font-size: 0.8rem;
        color: var(--text-muted, #8b949e);
        background: var(--card-bg, rgba(255,255,255,0.04));
        padding: 4px 10px;
        border-radius: 20px;
      }
      .gb-count {
        font-weight: 600;
        color: var(--accent, #58a6ff);
      }

      /* ── 留言列表 ── */
      .gb-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
        max-height: 480px;
        overflow-y: auto;
        margin-bottom: 20px;
        padding-right: 4px;
        scrollbar-width: thin;
        scrollbar-color: rgba(88,166,255,0.3) transparent;
      }
      .gb-list::-webkit-scrollbar { width: 4px; }
      .gb-list::-webkit-scrollbar-thumb {
        background: rgba(88,166,255,0.3);
        border-radius: 2px;
      }

      /* ── 单条留言 ── */
      .gb-item {
        display: flex;
        gap: 12px;
        padding: 14px 16px;
        background: var(--card-bg, rgba(255,255,255,0.03));
        border-radius: 14px;
        border: 1px solid var(--border-color, rgba(255,255,255,0.06));
        transition: all 0.2s ease;
        animation: slideIn 0.3s ease;
      }
      @keyframes slideIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .gb-item:hover {
        border-color: var(--border-hover, rgba(88,166,255,0.2));
        transform: translateX(2px);
      }

      /* ── 头像 ── */
      .gb-avatar {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 1rem;
        flex-shrink: 0;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      }

      /* ── 内容 ── */
      .gb-body { flex: 1; min-width: 0; }
      .gb-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 6px;
      }
      .gb-name { font-weight: 600; font-size: 0.9rem; }
      .gb-time {
        font-size: 0.72rem;
        color: var(--text-muted, #8b949e);
      }
      .gb-text {
        font-size: 0.88rem;
        line-height: 1.6;
        color: var(--text-secondary, #c9d1d9);
        word-break: break-word;
      }

      /* ── 表单 ── */
      .gb-form {
        background: var(--card-bg, rgba(255,255,255,0.03));
        border-radius: 18px;
        padding: 18px;
        border: 1px solid var(--border-color, rgba(255,255,255,0.06));
      }
      .gb-form-row {
        margin-bottom: 12px;
        border-radius: 12px;
        transition: all 0.2s ease;
      }
      .gb-form-row.focused {
        box-shadow: 0 0 0 2px var(--accent, rgba(88,166,255,0.3));
      }
      .gb-form input,
      .gb-form textarea {
        width: 100%;
        padding: 12px 14px;
        background: var(--input-bg, rgba(255,255,255,0.05));
        border: 1px solid var(--border-color, rgba(255,255,255,0.08));
        border-radius: 12px;
        color: var(--text-primary, #e6edf3);
        font-size: 0.9rem;
        font-family: inherit;
        box-sizing: border-box;
        transition: border-color 0.2s;
      }
      .gb-form input:focus,
      .gb-form textarea:focus {
        outline: none;
        border-color: var(--accent, #58a6ff);
      }
      .gb-form textarea { resize: vertical; min-height: 80px; }
      .gb-form input::placeholder,
      .gb-form textarea::placeholder { color: var(--text-muted, #6e7681); }

      .gb-form-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .gb-hint {
        font-size: 0.75rem;
        color: var(--text-muted, #6e7681);
      }
      .gb-submit {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 10px 20px;
        background: linear-gradient(135deg, #58a6ff, #a371f7);
        border: none;
        border-radius: 10px;
        color: white;
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 2px 12px rgba(88,166,255,0.3);
      }
      .gb-submit:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 16px rgba(88,166,255,0.4);
      }
      .gb-submit:active { transform: scale(0.97); }
      .gb-submit-icon { font-size: 1rem; }

      /* ── Toast ── */
      .gb-toast {
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        padding: 12px 22px;
        background: linear-gradient(135deg, #39d353, #2ea043);
        color: white;
        border-radius: 12px;
        font-size: 0.9rem;
        font-weight: 500;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 8px;
        pointer-events: none;
      }
      .gb-toast.show {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
      .toast-icon {
        width: 20px;
        height: 20px;
        background: rgba(255,255,255,0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.7rem;
      }

      /* ── 浅色模式适配 ── */
      [data-theme="light"] .gb-item,
      .light-theme .gb-item {
        background: rgba(255,255,255,0.8);
        border-color: rgba(0,0,0,0.06);
      }
      [data-theme="light"] .gb-form,
      .light-theme .gb-form {
        background: rgba(255,255,255,0.9);
        border-color: rgba(0,0,0,0.06);
      }
      [data-theme="light"] .gb-list,
      .light-theme .gb-list {
        scrollbar-color: rgba(88,166,255,0.4) transparent;
      }
      [data-theme="light"] .gb-form input,
      [data-theme="light"] .gb-form textarea,
      .light-theme .gb-form input,
      .light-theme .gb-form textarea {
        background: rgba(0,0,0,0.03);
        border-color: rgba(0,0,0,0.08);
        color: #1f2328;
      }
      [data-theme="light"] .gb-text,
      .light-theme .gb-text { color: #57606a; }

      /* ── 移动端优化 ── */
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
