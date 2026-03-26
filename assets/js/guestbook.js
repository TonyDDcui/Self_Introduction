/**
 * 云端共享留言板 - 使用 JSONBin.io（免费）
 * 所有人可见，所有人可留言
 */

(function() {
  'use strict';

  // JSONBin.io 配置（免费服务）
  // 访问 https://jsonbin.io/ 获取你的 API Key
  const CONFIG = {
    // JSONBin.io API Key（需要注册获取）
    // 注册地址：https://jsonbin.io/
    API_KEY: '$2a$10$EOHGYh3otRTo8jQQw3FRc.XMcnhZ2c5E9UloscgNitQfHYArUBVCm', // 替换为你的 API Key
    
    // Bin ID（创建后获得）
    BIN_ID: '69c51217aa77b81da91faf88', // 替换为你的 Bin ID
    
    // 使用示例数据作为默认（无需配置即可使用）
    USE_DEMO_MODE: true,
    
    // 最大留言数
    MAX_MESSAGES: 50,
    
    // 刷新间隔（毫秒）
    REFRESH_INTERVAL: 30000 // 30秒
  };

  // 示例留言（演示模式）
  const DEMO_MESSAGES = [
    { id: 1, name: '技术爱好者', message: '这个网站设计得太棒了！👍 汉堡菜单的横向导航很有创意', time: '2024-01-15T10:30:00Z', color: '#58a6ff', avatar: '技' },
    { id: 2, name: '前端开发者', message: 'UI优化做得很到位，特别是卡片悬停效果', time: '2024-01-15T09:15:00Z', color: '#a371f7', avatar: '前' },
    { id: 3, name: '校友小王', message: '学长加油！期待更多项目分享~', time: '2024-01-14T16:45:00Z', color: '#39d353', avatar: '校' },
    { id: 4, name: 'HR小姐姐', message: '人才啊！简历收下了，有机会联系你 😊', time: '2024-01-14T14:20:00Z', color: '#d29922', avatar: 'H' },
    { id: 5, name: '物联网同行', message: '同为嵌入式开发，互相学习！', time: '2024-01-14T11:00:00Z', color: '#f85149', avatar: '物' },
    { id: 6, name: '访客', message: 'GitHub项目推荐很实用，收藏了', time: '2024-01-13T20:30:00Z', color: '#79c0ff', avatar: '访' },
    { id: 7, name: '设计师', message: '整体视觉风格很统一，深色主题做得不错', time: '2024-01-13T18:15:00Z', color: '#d2a8ff', avatar: '设' },
    { id: 8, name: '大学生', message: '正在学习嵌入式，这个网站给了我很多启发', time: '2024-01-13T15:40:00Z', color: '#56d364', avatar: '大' }
  ];

  // 留言数据
  let messages = [];
  let isDemoMode = true;

  // 初始化
  function init() {
    // 检查是否配置了 API
    if (CONFIG.API_KEY.includes('YOUR_API') || CONFIG.BIN_ID.includes('your_bin')) {
      console.log('使用演示模式（本地存储）');
      isDemoMode = true;
      loadFromLocalStorage();
    } else {
      isDemoMode = false;
      loadFromCloud();
      // 定期刷新
      setInterval(loadFromCloud, CONFIG.REFRESH_INTERVAL);
    }

    render();
    bindEvents();
    addStyles();
  }

  // 从本地存储加载
  function loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem('guestbook_cloud_v1');
      if (stored) {
        const data = JSON.parse(stored);
        messages = data.messages || [...DEMO_MESSAGES];
      } else {
        messages = [...DEMO_MESSAGES];
        saveToLocalStorage();
      }
    } catch (e) {
      messages = [...DEMO_MESSAGES];
    }
  }

  // 保存到本地存储
  function saveToLocalStorage() {
    try {
      localStorage.setItem('guestbook_cloud_v1', JSON.stringify({
        messages: messages,
        updatedAt: new Date().toISOString()
      }));
    } catch (e) {
      console.warn('保存失败:', e);
    }
  }

  // 从云端加载
  async function loadFromCloud() {
    try {
      const response = await fetch(`https://api.jsonbin.io/v3/b/${CONFIG.BIN_ID}/latest`, {
        headers: {
          'X-Master-Key': CONFIG.API_KEY
        }
      });

      if (!response.ok) throw new Error('Failed to load');

      const data = await response.json();
      if (data.record && data.record.messages) {
        messages = data.record.messages;
        renderMessages();
      }
    } catch (error) {
      console.warn('云端加载失败，使用本地数据:', error);
      loadFromLocalStorage();
      renderMessages();
    }
  }

  // 保存到云端
  async function saveToCloud() {
    if (isDemoMode) {
      saveToLocalStorage();
      return true;
    }

    try {
      const response = await fetch(`https://api.jsonbin.io/v3/b/${CONFIG.BIN_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': CONFIG.API_KEY
        },
        body: JSON.stringify({
          messages: messages,
          updatedAt: new Date().toISOString()
        })
      });

      return response.ok;
    } catch (error) {
      console.warn('云端保存失败:', error);
      saveToLocalStorage();
      return false;
    }
  }

  // 添加留言
  async function addMessage(name, message) {
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
    if (messages.length > CONFIG.MAX_MESSAGES) {
      messages = messages.slice(0, CONFIG.MAX_MESSAGES);
    }

    // 保存
    await saveToCloud();
    
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

  // 渲染
  function render() {
    const container = document.querySelector('.guestbook-container');
    if (!container) return;

    container.innerHTML = `
      <div class="guestbook-cloud-wrapper">
        <!-- 头部 -->
        <div class="guestbook-header-section">
          <div class="header-icon">💬</div>
          <div class="header-content">
            <h3>留言板</h3>
            <p class="header-desc">
              ${isDemoMode ? '演示模式 - 留言存储在本地' : '云端共享 - 所有人可见'}
              <span class="message-count">共 <strong id="msg-count">${messages.length}</strong> 条留言</span>
            </p>
          </div>
          <button class="refresh-btn" id="gb-refresh" title="刷新">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 4v6h-6M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
            </svg>
          </button>
        </div>

        <!-- 留言列表 -->
        <div class="guestbook-messages" id="gb-messages">
          ${renderMessagesHTML()}
        </div>

        <!-- 留言表单 -->
        <div class="guestbook-form-section">
          <form id="gb-form">
            <div class="form-row">
              <input 
                type="text" 
                id="gb-name" 
                placeholder="你的昵称" 
                maxlength="20" 
                required
                autocomplete="off"
              >
            </div>
            <div class="form-row">
              <textarea 
                id="gb-message" 
                placeholder="写下你的留言..." 
                maxlength="200" 
                required
                rows="2"
              ></textarea>
              <span class="char-count"><span id="gb-char-count">0</span>/200</span>
            </div>
            <button type="submit" class="submit-btn">
              <span>发布留言</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
              </svg>
            </button>
          </form>
        </div>
      </div>
    `;
  }

  // 渲染留言列表 HTML
  function renderMessagesHTML() {
    if (messages.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-icon">💭</div>
          <p>还没有留言</p>
          <p class="empty-hint">快来抢沙发，成为第一个留言的人！</p>
        </div>
      `;
    }

    return messages.map((msg, index) => `
      <div class="message-bubble" style="--msg-color: ${msg.color}; animation-delay: ${index * 50}ms">
        <div class="bubble-avatar" style="background: ${msg.color}">${msg.avatar}</div>
        <div class="bubble-content">
          <div class="bubble-header">
            <span class="bubble-name" style="color: ${msg.color}">${escapeHtml(msg.name)}</span>
            <span class="bubble-time">${formatTime(msg.time)}</span>
          </div>
          <div class="bubble-text">${escapeHtml(msg.message)}</div>
        </div>
      </div>
    `).join('');
  }

  // 重新渲染留言
  function renderMessages() {
    const container = document.getElementById('gb-messages');
    if (container) {
      container.innerHTML = renderMessagesHTML();
    }

    const countEl = document.getElementById('msg-count');
    if (countEl) {
      countEl.textContent = messages.length;
    }
  }

  // 绑定事件
  function bindEvents() {
    // 表单提交
    const form = document.getElementById('gb-form');
    if (form) {
      form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const nameInput = document.getElementById('gb-name');
        const msgInput = document.getElementById('gb-message');

        const name = nameInput.value.trim();
        const message = msgInput.value.trim();

        if (!name || !message) return;

        // 禁用按钮
        const btn = form.querySelector('.submit-btn');
        btn.disabled = true;
        btn.innerHTML = '<span>发送中...</span>';

        try {
          await addMessage(name, message);
          renderMessages();

          // 清空表单
          nameInput.value = '';
          msgInput.value = '';
          document.getElementById('gb-char-count').textContent = '0';

          showToast('留言发布成功！✨');
        } catch (error) {
          showToast('发布失败，请重试 😢');
        } finally {
          btn.disabled = false;
          btn.innerHTML = `
            <span>发布留言</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
          `;
        }
      });
    }

    // 字符计数
    const msgInput = document.getElementById('gb-message');
    const charCount = document.getElementById('gb-char-count');
    if (msgInput && charCount) {
      msgInput.addEventListener('input', function() {
        charCount.textContent = this.value.length;
      });
    }

    // 刷新按钮
    const refreshBtn = document.getElementById('gb-refresh');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', async function() {
        this.classList.add('spinning');

        if (isDemoMode) {
          loadFromLocalStorage();
          renderMessages();
          showToast('已刷新 ✓');
        } else {
          await loadFromCloud();
          showToast('已同步最新留言 ✓');
        }

        setTimeout(() => this.classList.remove('spinning'), 500);
      });
    }
  }

  // 显示提示
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

  // 添加样式
  function addStyles() {
    if (document.getElementById('guestbook-cloud-styles')) return;

    const style = document.createElement('style');
    style.id = 'guestbook-cloud-styles';
    style.textContent = `
      /* 容器 */
      .guestbook-cloud-wrapper {
        max-width: 800px;
        margin: 0 auto;
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 24px;
        overflow: hidden;
      }

      /* 头部 */
      .guestbook-header-section {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 24px;
        background: linear-gradient(135deg, rgba(88, 166, 255, 0.1), rgba(163, 113, 247, 0.1));
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      }

      .header-icon {
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

      .header-content {
        flex: 1;
      }

      .header-content h3 {
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 4px;
      }

      .header-desc {
        font-size: 0.875rem;
        color: var(--text-muted);
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      }

      .message-count {
        padding: 2px 10px;
        background: rgba(88, 166, 255, 0.15);
        border-radius: 20px;
        font-size: 0.8rem;
      }

      .message-count strong {
        color: var(--accent-primary);
      }

      .refresh-btn {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: var(--text-muted);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        flex-shrink: 0;
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
      .guestbook-messages {
        max-height: 400px;
        overflow-y: auto;
        padding: 20px;
      }

      /* 留言气泡 */
      .message-bubble {
        display: flex;
        gap: 12px;
        padding: 16px;
        margin-bottom: 12px;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 16px;
        border-left: 3px solid var(--msg-color);
        animation: fadeInUp 0.4s ease forwards;
        opacity: 0;
        transition: all 0.2s ease;
      }

      .message-bubble:hover {
        background: rgba(255, 255, 255, 0.06);
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

      .bubble-avatar {
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

      .bubble-content {
        flex: 1;
        min-width: 0;
      }

      .bubble-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;
        gap: 8px;
      }

      .bubble-name {
        font-weight: 600;
        font-size: 0.95rem;
      }

      .bubble-time {
        font-size: 0.75rem;
        color: var(--text-muted);
        flex-shrink: 0;
      }

      .bubble-text {
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

      .empty-hint {
        font-size: 0.875rem;
        opacity: 0.7;
        margin-top: 8px;
      }

      /* 表单区域 */
      .guestbook-form-section {
        padding: 20px;
        background: rgba(0, 0, 0, 0.2);
        border-top: 1px solid rgba(255, 255, 255, 0.06);
      }

      .form-row {
        margin-bottom: 12px;
        position: relative;
      }

      .form-row input,
      .form-row textarea {
        width: 100%;
        padding: 12px 16px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        color: var(--text-primary);
        font-size: 0.95rem;
        transition: all 0.2s ease;
        font-family: inherit;
      }

      .form-row input:focus,
      .form-row textarea:focus {
        outline: none;
        border-color: var(--accent-primary);
        background: rgba(255, 255, 255, 0.08);
      }

      .form-row input::placeholder,
      .form-row textarea::placeholder {
        color: var(--text-muted);
      }

      .char-count {
        position: absolute;
        right: 12px;
        bottom: 12px;
        font-size: 0.75rem;
        color: var(--text-muted);
        pointer-events: none;
      }

      .submit-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        padding: 14px;
        background: linear-gradient(135deg, #58a6ff, #a371f7);
        border: none;
        border-radius: 12px;
        color: white;
        font-size: 0.95rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .submit-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(88, 166, 255, 0.3);
      }

      .submit-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }

      /* Toast */
      .gb-toast {
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        padding: 12px 24px;
        background: linear-gradient(135deg, #58a6ff, #a371f7);
        color: white;
        border-radius: 12px;
        font-size: 0.95rem;
        font-weight: 500;
        z-index: 10000;
        opacity: 0;
        transition: all 0.3s ease;
        box-shadow: 0 8px 24px rgba(88, 166, 255, 0.3);
      }

      .gb-toast.show {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }

      /* 滚动条 */
      .guestbook-messages::-webkit-scrollbar {
        width: 6px;
      }

      .guestbook-messages::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.02);
        border-radius: 3px;
      }

      .guestbook-messages::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 3px;
      }

      /* 移动端 */
      @media (max-width: 768px) {
        .guestbook-cloud-wrapper {
          border-radius: 16px;
        }

        .guestbook-header-section {
          padding: 16px;
        }

        .header-icon {
          width: 48px;
          height: 48px;
          font-size: 24px;
        }

        .header-content h3 {
          font-size: 1.25rem;
        }

        .guestbook-messages {
          padding: 16px;
          max-height: 350px;
        }

        .message-bubble {
          padding: 12px;
        }

        .bubble-avatar {
          width: 36px;
          height: 36px;
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
  window.GuestbookCloud = {
    add: addMessage,
    refresh: isDemoMode ? loadFromLocalStorage : loadFromCloud,
    getMessages: () => messages
  };

})();
