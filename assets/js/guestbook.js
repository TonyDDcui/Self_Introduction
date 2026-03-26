/**
 * GitHub Gist 留言板 - 云端存储
 */

(function() {
  'use strict';

  // 配置 - 需要用户创建自己的 Gist
  // 请将下面的 GIST_ID 替换为你的 Gist ID
  const CONFIG = {
    // 创建一个公开的 Gist，将 ID 填在这里
    // Gist 文件名应为 guestbook.json
    // Gist ID 格式：xxxxxxxxxxxxxxxxxxxxxxx (32位字符)
    GIST_ID: 'YOUR_GIST_ID_HERE',
    
    // Gist 文件名
    FILE_NAME: 'guestbook.json',
    
    // 更新间隔（毫秒）
    UPDATE_INTERVAL: 30000,
    
    // 最大显示留言数
    MAX_DISPLAY: 20
  };

  // 示例留言
  const SAMPLE_MESSAGES = [
    { id: 1, name: '技术爱好者', message: '这个嵌入式网站太棒了！👍', time: new Date().toISOString(), color: '#58a6ff' },
    { id: 2, name: '访客', message: '期待合作！', time: new Date().toISOString(), color: '#a371f7' },
    { id: 3, name: '开发者', message: '代码写得很漂亮！', time: new Date().toISOString(), color: '#39d353' },
    { id: 4, name: '校友', message: '学长加油！', time: new Date().toISOString(), color: '#d29922' },
    { id: 5, name: 'HR', message: '人才啊，联系我！', time: new Date().toISOString(), color: '#f85149' }
  ];

  // 留言数据
  let messages = [];
  let isConfigured = false;

  // 检查是否已配置
  function checkConfiguration() {
    if (CONFIG.GIST_ID === 'YOUR_GIST_ID_HERE') {
      console.warn('Gist 未配置，使用本地存储模式');
      isConfigured = false;
      return false;
    }
    isConfigured = true;
    return true;
  }

  // 从 Gist 加载留言
  async function loadFromGist() {
    if (!isConfigured) {
      loadFromLocalStorage();
      return;
    }

    try {
      const response = await fetch(`https://api.github.com/gists/${CONFIG.GIST_ID}`);
      if (!response.ok) throw new Error('Failed to load');
      
      const data = await response.json();
      const content = data.files[CONFIG.FILE_NAME];
      
      if (content) {
        messages = JSON.parse(content.content);
      } else {
        messages = [];
        // 创建文件
        await saveToGist();
      }
    } catch (error) {
      console.warn('从 Gist 加载失败，使用本地数据:', error);
      loadFromLocalStorage();
    }
  }

  // 保存到 Gist
  async function saveToGist() {
    if (!isConfigured) {
      saveToLocalStorage();
      return;
    }

    try {
      const content = JSON.stringify(messages, null, 2);
      
      // 获取当前 Gist 信息
      const getResponse = await fetch(`https://api.github.com/gists/${CONFIG.GIST_ID}`);
      if (!getResponse.ok) throw new Error('Failed to get gist');
      
      const gistData = await getResponse.json();
      
      // 更新 Gist
      const updateResponse = await fetch(`https://api.github.com/gists/${CONFIG.GIST_ID}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: {
            [CONFIG.FILE_NAME]: {
              content: content
            }
          }
        })
      });
      
      if (!updateResponse.ok) throw new Error('Failed to save');
      
      return true;
    } catch (error) {
      console.warn('保存到 Gist 失败，使用本地存储:', error);
      saveToLocalStorage();
      return false;
    }
  }

  // 本地存储
  function loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem('guestbook_messages');
      messages = stored ? JSON.parse(stored) : [...SAMPLE_MESSAGES];
    } catch (e) {
      messages = [...SAMPLE_MESSAGES];
    }
  }

  function saveToLocalStorage() {
    try {
      localStorage.setItem('guestbook_messages', JSON.stringify(messages));
    } catch (e) {
      console.warn('无法保存留言:', e);
    }
  }

  // 添加留言
  async function addMessage(name, message) {
    const newMessage = {
      id: Date.now(),
      name: name.trim(),
      message: message.trim(),
      time: new Date().toISOString(),
      color: getRandomColor()
    };
    
    messages.push(newMessage);
    
    // 保存
    await saveToGist();
    
    return newMessage;
  }

  // 获取随机颜色
  function getRandomColor() {
    const colors = [
      '#58a6ff', '#a371f7', '#39d353', '#d29922', 
      '#f85149', '#79c0ff', '#d2a8ff', '#56d364', 
      '#e3b341', '#ffa198'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // 初始化留言板
  async function initGuestbook() {
    checkConfiguration();
    await loadFromGist();
    
    const container = document.querySelector('.guestbook-container');
    if (!container) return;

    const html = `
      <div class="guestbook-wrapper">
        <div class="guestbook-form glass-card">
          <div class="form-header">
            <h3>💬 留言板</h3>
            <p class="guestbook-subtitle">留下你的足迹吧 ~</p>
          </div>
          <form id="guestbook-form">
            <div class="form-row">
              <div class="form-group">
                <input type="text" id="guest-name" placeholder="你的昵称" maxlength="20" required>
              </div>
            </div>
            <div class="form-group">
              <textarea id="guest-message" placeholder="说点什么..." maxlength="200" required></textarea>
            </div>
            <button type="submit" class="pill-btn pill-btn-primary">
              <span>发布留言</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
              </svg>
            </button>
          </form>
          <div class="guestbook-stats">
            <span class="stat-item">📝 共 <strong id="message-count">${messages.length}</strong> 条留言</span>
          </div>
        </div>
        
        <div class="guestbook-display glass-card">
          <div class="display-header">
            <h4>📜 最新留言</h4>
            <button class="refresh-btn" id="refresh-messages" title="刷新留言">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 4v6h-6M1 20v-6h6"/>
                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
              </svg>
            </button>
          </div>
          <div class="guestbook-list" id="guestbook-list">
            ${generateMessageList()}
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;

    // 绑定事件
    bindEvents();
    
    // 启动自动刷新
    startAutoRefresh();
  }

  // 生成留言列表
  function generateMessageList() {
    const recentMessages = messages.slice(-CONFIG.MAX_DISPLAY).reverse();
    
    if (recentMessages.length === 0) {
      return `
        <div class="guestbook-empty">
          <span class="empty-icon">💭</span>
          <p>还没有留言，快来抢沙发！</p>
        </div>
      `;
    }

    return recentMessages.map(msg => `
      <div class="message-item" style="--msg-color: ${msg.color}">
        <div class="message-avatar">${msg.name.charAt(0).toUpperCase()}</div>
        <div class="message-content">
          <div class="message-header">
            <span class="message-name" style="color: ${msg.color}">${msg.name}</span>
            <span class="message-time">${formatTime(msg.time)}</span>
          </div>
          <div class="message-text">${escapeHtml(msg.message)}</div>
        </div>
      </div>
    `).join('');
  }

  // 格式化时间
  function formatTime(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;
    
    return date.toLocaleDateString('zh-CN');
  }

  // HTML 转义
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // 绑定事件
  function bindEvents() {
    const form = document.getElementById('guestbook-form');
    form.addEventListener('submit', handleSubmit);
    
    const refreshBtn = document.getElementById('refresh-messages');
    refreshBtn.addEventListener('click', refreshMessages);
  }

  // 处理提交
  async function handleSubmit(e) {
    e.preventDefault();
    
    const nameInput = document.getElementById('guest-name');
    const messageInput = document.getElementById('guest-message');
    
    const name = nameInput.value.trim();
    const message = messageInput.value.trim();
    
    if (!name || !message) return;
    
    // 显示加载状态
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<span>发布中...</span>';
    
    try {
      const newMessage = await addMessage(name, message);
      messages.push(newMessage);
      
      // 更新显示
      updateMessageList();
      updateCount();
      
      // 清空表单
      nameInput.value = '';
      messageInput.value = '';
      
      // 显示成功
      showNotification('留言发布成功！✨');
    } catch (error) {
      showNotification('发布失败，请重试 😢');
    } finally {
      btn.disabled = false;
      btn.innerHTML = `
        <span>发布留言</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
        </svg>
      `;
    }
  }

  // 刷新留言
  async function refreshMessages() {
    const btn = document.getElementById('refresh-messages');
    btn.classList.add('spinning');
    
    await loadFromGist();
    updateMessageList();
    updateCount();
    
    setTimeout(() => btn.classList.remove('spinning'), 500);
  }

  // 更新留言列表
  function updateMessageList() {
    const list = document.getElementById('guestbook-list');
    if (!list) return;
    
    list.innerHTML = generateMessageList();
    
    // 添加动画
    list.querySelectorAll('.message-item').forEach((item, index) => {
      item.style.animationDelay = `${index * 50}ms`;
    });
  }

  // 更新计数
  function updateCount() {
    const countEl = document.getElementById('message-count');
    if (countEl) {
      countEl.textContent = messages.length;
    }
  }

  // 自动刷新
  function startAutoRefresh() {
    setInterval(async () => {
      const oldLength = messages.length;
      await loadFromGist();
      
      if (messages.length !== oldLength) {
        updateMessageList();
        updateCount();
      }
    }, CONFIG.UPDATE_INTERVAL);
  }

  // 显示通知
  function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'guestbook-toast';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    requestAnimationFrame(() => {
      notification.classList.add('show');
    });
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 2500);
  }

  // 添加样式
  function addStyles() {
    if (document.getElementById('guestbook-enhanced-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'guestbook-enhanced-styles';
    style.textContent = `
      /* 留言板容器 */
      .guestbook-wrapper {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
        max-width: 1200px;
        margin: 0 auto;
      }

      @media (max-width: 968px) {
        .guestbook-wrapper {
          grid-template-columns: 1fr;
        }
      }

      /* 表单卡片 */
      .guestbook-form {
        padding: 28px;
        height: fit-content;
        position: sticky;
        top: 80px;
      }

      @media (max-width: 768px) {
        .guestbook-form {
          padding: 20px;
          position: static;
        }
      }

      .form-header {
        margin-bottom: 20px;
      }

      .guestbook-form h3 {
        font-size: 1.5rem;
        margin-bottom: 4px;
        background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .guestbook-subtitle {
        color: var(--text-muted);
        font-size: 0.875rem;
      }

      .form-row {
        margin-bottom: 16px;
      }

      .form-group {
        margin-bottom: 16px;
      }

      .form-group input,
      .form-group textarea {
        width: 100%;
        padding: 12px 16px;
        border-radius: 10px;
        border: 1px solid var(--border-color);
        background: var(--bg-secondary);
        color: var(--text-primary);
        font-size: 0.9rem;
        transition: all 0.2s ease;
      }

      .form-group input:focus,
      .form-group textarea:focus {
        outline: none;
        border-color: var(--accent-primary);
        box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.15);
      }

      .form-group textarea {
        min-height: 100px;
        resize: vertical;
      }

      .guestbook-stats {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid var(--border-color);
        text-align: center;
        color: var(--text-muted);
        font-size: 0.875rem;
      }

      .guestbook-stats strong {
        color: var(--accent-primary);
        font-weight: 600;
      }

      /* 显示区域 */
      .guestbook-display {
        padding: 24px;
        max-height: 600px;
        overflow-y: auto;
      }

      @media (max-width: 768px) {
        .guestbook-display {
          padding: 16px;
          max-height: 400px;
        }
      }

      .display-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--border-color);
      }

      .display-header h4 {
        font-size: 1rem;
        color: var(--text-secondary);
      }

      .refresh-btn {
        padding: 6px;
        border-radius: 6px;
        background: var(--bg-secondary);
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .refresh-btn:hover {
        background: var(--bg-tertiary);
        color: var(--accent-primary);
      }

      .refresh-btn.spinning svg {
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      /* 留言列表 */
      .guestbook-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .message-item {
        display: flex;
        gap: 12px;
        padding: 14px;
        background: var(--bg-secondary);
        border-radius: 12px;
        border-left: 3px solid var(--msg-color);
        transition: all 0.2s ease;
        animation: fadeInUp 0.3s ease forwards;
        opacity: 0;
      }

      .message-item:hover {
        background: var(--bg-tertiary);
        transform: translateX(4px);
      }

      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .message-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: var(--msg-color);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 0.9rem;
        flex-shrink: 0;
      }

      .message-content {
        flex: 1;
        min-width: 0;
      }

      .message-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;
      }

      .message-name {
        font-weight: 600;
        font-size: 0.9rem;
      }

      .message-time {
        font-size: 0.75rem;
        color: var(--text-muted);
      }

      .message-text {
        font-size: 0.875rem;
        color: var(--text-secondary);
        line-height: 1.5;
        word-break: break-word;
      }

      /* 空状态 */
      .guestbook-empty {
        text-align: center;
        padding: 40px 20px;
        color: var(--text-muted);
      }

      .empty-icon {
        font-size: 3rem;
        display: block;
        margin-bottom: 12px;
      }

      /* Toast 通知 */
      .guestbook-toast {
        position: fixed;
        top: 80px;
        right: 20px;
        background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
        color: white;
        padding: 12px 24px;
        border-radius: 10px;
        font-size: 0.9rem;
        font-weight: 500;
        z-index: 10000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(88, 166, 255, 0.3);
      }

      .guestbook-toast.show {
        opacity: 1;
        transform: translateX(0);
      }

      /* 移动端优化 */
      @media (max-width: 768px) {
        .guestbook-wrapper {
          gap: 16px;
        }

        .message-item {
          padding: 12px;
        }

        .message-avatar {
          width: 32px;
          height: 32px;
          font-size: 0.8rem;
        }

        .form-group input,
        .form-group textarea {
          font-size: 16px; /* 防止 iOS 缩放 */
        }
      }
    `;
    document.head.appendChild(style);
  }

  // 初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      addStyles();
      initGuestbook();
    });
  } else {
    addStyles();
    initGuestbook();
  }

})();
