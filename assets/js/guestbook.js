/**
 * 简化版留言板 - 使用本地存储 + 可选 Gist 读取
 * 完全免费，无需后端
 */

(function() {
  'use strict';

  // 配置
  const CONFIG = {
    // 是否启用 Gist 读取（可选）
    // 如果不配置，只使用本地存储
    GIST_ID: '', // 填入你的 Gist ID 可启用云端读取
    FILE_NAME: 'guestbook.json',
    
    // 本地存储键名
    STORAGE_KEY: 'guestbook_messages_v2',
    
    // 最大显示留言数
    MAX_DISPLAY: 15,
    
    // 更新间隔（毫秒）
    UPDATE_INTERVAL: 60000 // 1分钟
  };

  // 示例留言数据
  const SAMPLE_MESSAGES = [
    { 
      id: 1, 
      name: '技术爱好者', 
      message: '这个网站设计得太棒了！👍 特别是汉堡菜单的横向导航，手机端体验很好。', 
      time: new Date(Date.now() - 3600000).toISOString(), 
      color: '#58a6ff',
      avatar: '技'
    },
    { 
      id: 2, 
      name: '前端开发者', 
      message: 'UI优化做得很到位，渐变动画和卡片效果都很流畅！', 
      time: new Date(Date.now() - 7200000).toISOString(), 
      color: '#a371f7',
      avatar: '前'
    },
    { 
      id: 3, 
      name: '校友', 
      message: '学长加油！期待更多项目分享~', 
      time: new Date(Date.now() - 86400000).toISOString(), 
      color: '#39d353',
      avatar: '校'
    },
    { 
      id: 4, 
      name: 'HR小姐姐', 
      message: '人才啊！简历收下了，有机会联系你 😊', 
      time: new Date(Date.now() - 172800000).toISOString(), 
      color: '#d29922',
      avatar: 'H'
    },
    { 
      id: 5, 
      name: '物联网同行', 
      message: '同为嵌入式开发，互相学习！', 
      time: new Date(Date.now() - 259200000).toISOString(), 
      color: '#f85149',
      avatar: '物'
    }
  ];

  // 留言数据
  let messages = [];

  // 从本地存储加载
  function loadFromStorage() {
    try {
      const stored = localStorage.getItem(CONFIG.STORAGE_KEY);
      if (stored) {
        messages = JSON.parse(stored);
      } else {
        // 首次使用，使用示例数据
        messages = [...SAMPLE_MESSAGES];
        saveToStorage();
      }
    } catch (e) {
      console.warn('无法读取本地存储:', e);
      messages = [...SAMPLE_MESSAGES];
    }
  }

  // 保存到本地存储
  function saveToStorage() {
    try {
      localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.warn('无法保存到本地存储:', e);
    }
  }

  // 尝试从 Gist 加载（如果配置了）
  async function loadFromGist() {
    if (!CONFIG.GIST_ID) return;
    
    try {
      const response = await fetch(`https://api.github.com/gists/${CONFIG.GIST_ID}`);
      if (!response.ok) throw new Error('Failed to load');
      
      const data = await response.json();
      const content = data.files[CONFIG.FILE_NAME];
      
      if (content) {
        const gistMessages = JSON.parse(content.content);
        // 合并 Gist 数据和本地数据
        messages = mergeMessages(messages, gistMessages);
        saveToStorage();
      }
    } catch (error) {
      console.warn('从 Gist 加载失败:', error);
    }
  }

  // 合并留言（去重）
  function mergeMessages(local, remote) {
    const all = [...local, ...remote];
    const unique = all.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
    return unique.sort((a, b) => new Date(b.time) - new Date(a.time));
  }

  // 添加留言
  function addMessage(name, message) {
    const newMessage = {
      id: Date.now(),
      name: name.trim().slice(0, 20),
      message: message.trim().slice(0, 200),
      time: new Date().toISOString(),
      color: getRandomColor(),
      avatar: name.trim().charAt(0).toUpperCase()
    };
    
    messages.unshift(newMessage);
    
    // 限制数量
    if (messages.length > 50) {
      messages = messages.slice(0, 50);
    }
    
    saveToStorage();
    return newMessage;
  }

  // 获取随机颜色
  function getRandomColor() {
    const colors = [
      '#58a6ff', '#a371f7', '#39d353', '#d29922', 
      '#f85149', '#79c0ff', '#d2a8ff', '#56d364', 
      '#e3b341', '#ffa198', '#7ee787', '#ff7b72'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
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
    
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  }

  // HTML 转义
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // 初始化留言板
  function initGuestbook() {
    loadFromStorage();
    
    // 如果配置了 Gist，尝试加载
    if (CONFIG.GIST_ID) {
      loadFromGist();
      // 定期刷新
      setInterval(loadFromGist, CONFIG.UPDATE_INTERVAL);
    }
    
    const container = document.querySelector('.guestbook-container');
    if (!container) {
      console.warn('未找到留言板容器');
      return;
    }

    container.innerHTML = generateHTML();
    bindEvents();
    renderMessages();
  }

  // 生成 HTML
  function generateHTML() {
    return `
      <div class="guestbook-wrapper">
        <!-- 留言表单 -->
        <div class="guestbook-form-section">
          <div class="guestbook-header">
            <div class="guestbook-icon">💬</div>
            <div class="guestbook-title">
              <h3>留言板</h3>
              <p class="guestbook-subtitle">留下你的足迹，分享你的想法</p>
            </div>
          </div>
          
          <form id="guestbook-form" class="guestbook-form">
            <div class="form-group">
              <label for="guest-name">昵称</label>
              <input 
                type="text" 
                id="guest-name" 
                placeholder="怎么称呼你？" 
                maxlength="20" 
                required
                autocomplete="off"
              >
            </div>
            
            <div class="form-group">
              <label for="guest-message">留言</label>
              <textarea 
                id="guest-message" 
                placeholder="说点什么..." 
                maxlength="200" 
                required
                rows="3"
              ></textarea>
              <div class="char-count"><span id="char-count">0</span>/200</div>
            </div>
            
            <button type="submit" class="submit-btn">
              <span>发布留言</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
              </svg>
            </button>
          </form>
          
          <div class="guestbook-stats">
            <span class="stat-item">
              <strong id="message-count">${messages.length}</strong> 条留言
            </span>
            <span class="stat-separator">·</span>
            <span class="stat-item">存储于本地</span>
          </div>
        </div>
        
        <!-- 留言列表 -->
        <div class="guestbook-list-section">
          <div class="list-header">
            <h4>最新留言</h4>
            <button class="refresh-btn" id="refresh-btn" title="刷新">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 4v6h-6M1 20v-6h6"/>
                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
              </svg>
            </button>
          </div>
          
          <div class="guestbook-list" id="guestbook-list">
            <!-- 动态生成 -->
          </div>
        </div>
      </div>
    `;
  }

  // 渲染留言列表
  function renderMessages() {
    const list = document.getElementById('guestbook-list');
    if (!list) return;

    const recentMessages = messages.slice(0, CONFIG.MAX_DISPLAY);
    
    if (recentMessages.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">💭</div>
          <p>还没有留言</p>
          <p class="empty-hint">快来抢沙发，成为第一个留言的人！</p>
        </div>
      `;
      return;
    }

    list.innerHTML = recentMessages.map((msg, index) => `
      <div class="message-card" style="--msg-color: ${msg.color}; animation-delay: ${index * 50}ms">
        <div class="message-avatar" style="background: ${msg.color}">
          ${msg.avatar}
        </div>
        <div class="message-body">
          <div class="message-header">
            <span class="message-name" style="color: ${msg.color}">${escapeHtml(msg.name)}</span>
            <span class="message-time">${formatTime(msg.time)}</span>
          </div>
          <div class="message-content">${escapeHtml(msg.message)}</div>
        </div>
      </div>
    `).join('');

    // 更新计数
    const countEl = document.getElementById('message-count');
    if (countEl) {
      countEl.textContent = messages.length;
    }
  }

  // 绑定事件
  function bindEvents() {
    const form = document.getElementById('guestbook-form');
    const nameInput = document.getElementById('guest-name');
    const messageInput = document.getElementById('guest-message');
    const charCount = document.getElementById('char-count');
    const refreshBtn = document.getElementById('refresh-btn');

    // 表单提交
    if (form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = nameInput.value.trim();
        const message = messageInput.value.trim();
        
        if (!name || !message) return;
        
        // 添加留言
        addMessage(name, message);
        
        // 重新渲染
        renderMessages();
        
        // 清空表单
        nameInput.value = '';
        messageInput.value = '';
        charCount.textContent = '0';
        
        // 显示成功提示
        showToast('留言发布成功！✨');
      });
    }

    // 字符计数
    if (messageInput && charCount) {
      messageInput.addEventListener('input', function() {
        charCount.textContent = this.value.length;
      });
    }

    // 刷新按钮
    if (refreshBtn) {
      refreshBtn.addEventListener('click', function() {
        this.classList.add('spinning');
        
        // 重新加载
        loadFromStorage();
        if (CONFIG.GIST_ID) {
          loadFromGist().then(() => {
            renderMessages();
            showToast('已刷新 ✓');
          });
        } else {
          renderMessages();
          showToast('已刷新 ✓');
        }
        
        setTimeout(() => this.classList.remove('spinning'), 500);
      });
    }
  }

  // 显示提示
  function showToast(message) {
    // 移除旧的提示
    const oldToast = document.querySelector('.guestbook-toast');
    if (oldToast) oldToast.remove();
    
    const toast = document.createElement('div');
    toast.className = 'guestbook-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // 触发动画
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });
    
    // 自动移除
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  // 添加样式
  function addStyles() {
    if (document.getElementById('guestbook-simplified-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'guestbook-simplified-styles';
    style.textContent = `
      /* ============================================
         留言板容器
         ============================================ */
      .guestbook-wrapper {
        display: grid;
        grid-template-columns: 380px 1fr;
        gap: 32px;
        max-width: 1200px;
        margin: 0 auto;
      }

      @media (max-width: 900px) {
        .guestbook-wrapper {
          grid-template-columns: 1fr;
          gap: 24px;
        }
      }

      /* ============================================
         表单区域
         ============================================ */
      .guestbook-form-section {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 20px;
        padding: 28px;
        height: fit-content;
        position: sticky;
        top: 100px;
      }

      @media (max-width: 900px) {
        .guestbook-form-section {
          position: static;
          padding: 20px;
        }
      }

      .guestbook-header {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 24px;
        padding-bottom: 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }

      .guestbook-icon {
        width: 56px;
        height: 56px;
        background: linear-gradient(135deg, #58a6ff, #a371f7);
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        flex-shrink: 0;
      }

      .guestbook-title h3 {
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 4px;
        background: linear-gradient(135deg, #fff, rgba(255, 255, 255, 0.7));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .guestbook-subtitle {
        font-size: 0.875rem;
        color: var(--text-muted);
      }

      /* 表单样式 */
      .guestbook-form {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .form-group label {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--text-secondary);
      }

      .form-group input,
      .form-group textarea {
        padding: 12px 16px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        color: var(--text-primary);
        font-size: 0.95rem;
        transition: all 0.2s ease;
        font-family: inherit;
      }

      .form-group input:focus,
      .form-group textarea:focus {
        outline: none;
        border-color: var(--accent-primary);
        background: rgba(255, 255, 255, 0.08);
        box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.1);
      }

      .form-group input::placeholder,
      .form-group textarea::placeholder {
        color: var(--text-muted);
      }

      .form-group textarea {
        resize: vertical;
        min-height: 100px;
      }

      .char-count {
        text-align: right;
        font-size: 0.75rem;
        color: var(--text-muted);
      }

      /* 提交按钮 */
      .submit-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 14px 24px;
        background: linear-gradient(135deg, #58a6ff, #a371f7);
        border: none;
        border-radius: 12px;
        color: white;
        font-size: 0.95rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        margin-top: 8px;
      }

      .submit-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(88, 166, 255, 0.3);
      }

      .submit-btn:active {
        transform: translateY(0);
      }

      .submit-btn svg {
        transition: transform 0.2s ease;
      }

      .submit-btn:hover svg {
        transform: translateX(4px);
      }

      /* 统计信息 */
      .guestbook-stats {
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        text-align: center;
        font-size: 0.875rem;
        color: var(--text-muted);
      }

      .guestbook-stats strong {
        color: var(--accent-primary);
        font-weight: 600;
      }

      .stat-separator {
        margin: 0 8px;
        opacity: 0.5;
      }

      /* ============================================
         留言列表区域
         ============================================ */
      .guestbook-list-section {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 20px;
        padding: 24px;
        max-height: 600px;
        overflow-y: auto;
      }

      @media (max-width: 900px) {
        .guestbook-list-section {
          max-height: 400px;
          padding: 16px;
        }
      }

      .list-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 16px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }

      .list-header h4 {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--text-primary);
      }

      .refresh-btn {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: var(--text-muted);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
      }

      .refresh-btn:hover {
        background: rgba(255, 255, 255, 0.1);
        color: var(--accent-primary);
        border-color: var(--accent-primary);
      }

      .refresh-btn.spinning svg {
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      /* 留言列表 */
      .guestbook-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      /* 留言卡片 */
      .message-card {
        display: flex;
        gap: 14px;
        padding: 16px;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 14px;
        border-left: 3px solid var(--msg-color);
        transition: all 0.2s ease;
        animation: fadeInUp 0.4s ease forwards;
        opacity: 0;
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

      .message-card:hover {
        background: rgba(255, 255, 255, 0.06);
        transform: translateX(4px);
      }

      .message-avatar {
        width: 40px;
        height: 40px;
        border-radius: 12px;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1rem;
        font-weight: 600;
        flex-shrink: 0;
      }

      .message-body {
        flex: 1;
        min-width: 0;
      }

      .message-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;
        gap: 8px;
      }

      .message-name {
        font-weight: 600;
        font-size: 0.95rem;
      }

      .message-time {
        font-size: 0.75rem;
        color: var(--text-muted);
        flex-shrink: 0;
      }

      .message-content {
        font-size: 0.9rem;
        color: var(--text-secondary);
        line-height: 1.5;
        word-break: break-word;
      }

      /* 空状态 */
      .empty-state {
        text-align: center;
        padding: 48px 20px;
        color: var(--text-muted);
      }

      .empty-icon {
        font-size: 3.5rem;
        margin-bottom: 16px;
        opacity: 0.5;
      }

      .empty-state p {
        font-size: 1rem;
        margin-bottom: 8px;
      }

      .empty-hint {
        font-size: 0.875rem;
        opacity: 0.7;
      }

      /* Toast 提示 */
      .guestbook-toast {
        position: fixed;
        top: 100px;
        right: 24px;
        padding: 14px 24px;
        background: linear-gradient(135deg, #58a6ff, #a371f7);
        color: white;
        border-radius: 12px;
        font-size: 0.95rem;
        font-weight: 500;
        z-index: 10000;
        opacity: 0;
        transform: translateX(100px);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 8px 24px rgba(88, 166, 255, 0.3);
      }

      .guestbook-toast.show {
        opacity: 1;
        transform: translateX(0);
      }

      /* 滚动条美化 */
      .guestbook-list-section::-webkit-scrollbar {
        width: 6px;
      }

      .guestbook-list-section::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.02);
        border-radius: 3px;
      }

      .guestbook-list-section::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 3px;
      }

      .guestbook-list-section::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      /* 移动端优化 */
      @media (max-width: 768px) {
        .guestbook-form-section,
        .guestbook-list-section {
          border-radius: 16px;
        }

        .guestbook-icon {
          width: 48px;
          height: 48px;
          font-size: 24px;
        }

        .guestbook-title h3 {
          font-size: 1.25rem;
        }

        .message-avatar {
          width: 36px;
          height: 36px;
          font-size: 0.9rem;
        }

        .message-card {
          padding: 12px;
        }

        .message-content {
          font-size: 0.875rem;
        }

        .submit-btn {
          padding: 12px 20px;
        }

        .guestbook-toast {
          right: 16px;
          left: 16px;
          top: auto;
          bottom: 100px;
          transform: translateY(100px);
        }

        .guestbook-toast.show {
          transform: translateY(0);
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

  // 暴露全局接口
  window.Guestbook = {
    add: addMessage,
    getMessages: () => messages,
    refresh: () => {
      loadFromStorage();
      renderMessages();
    }
  };

})();
