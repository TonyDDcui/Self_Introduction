/**
 * 弹幕式留言板
 */

(function() {
  'use strict';

  // 留言数据存储
  const STORAGE_KEY = 'guestbook_messages';
  
  // 留言示例（当没有留言时显示）
  const SAMPLE_MESSAGES = [
    { name: '技术爱好者', message: '这个嵌入式网站太棒了！👍', color: '#58a6ff' },
    { name: '访客', message: '期待合作！', color: '#a371f7' },
    { name: '开发者', message: '代码写得很漂亮！', color: '#39d353' },
    { name: '校友', message: '学长加油！', color: '#d29922' },
    { name: 'HR', message: '人才啊，联系我！', color: '#f85149' }
  ];

  // 本地存储留言
  function getMessages() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  function saveMessages(messages) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.warn('无法保存留言:', e);
    }
  }

  // 添加留言
  function addMessage(name, message) {
    const messages = getMessages();
    const newMessage = {
      id: Date.now(),
      name: name.trim(),
      message: message.trim(),
      color: getRandomColor(),
      timestamp: new Date().toISOString()
    };
    
    messages.push(newMessage);
    saveMessages(messages);
    
    return newMessage;
  }

  // 获取随机颜色
  function getRandomColor() {
    const colors = [
      '#58a6ff', // 蓝色
      '#a371f7', // 紫色
      '#39d353', // 绿色
      '#d29922', // 黄色
      '#f85149', // 红色
      '#79c0ff', // 浅蓝
      '#d2a8ff', // 浅紫
      '#56d364', // 浅绿
      '#e3b341', // 浅黄
      '#ffa198'  // 粉色
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // 初始化留言板
  function initGuestbook() {
    // 创建留言板 HTML
    const container = document.querySelector('.guestbook-container');
    if (!container) return;

    // 添加留言表单
    const formHTML = `
      <div class="guestbook-form glass-card">
        <h3>💬 留言板</h3>
        <p class="guestbook-subtitle">留下你的足迹吧 ~</p>
        <form id="guestbook-form">
          <div class="form-group">
            <input type="text" id="guest-name" placeholder="你的昵称" maxlength="20" required>
          </div>
          <div class="form-group">
            <textarea id="guest-message" placeholder="说点什么..." maxlength="100" required></textarea>
          </div>
          <button type="submit" class="pill-btn pill-btn-primary">
            <span>发布留言</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
          </button>
        </form>
      </div>
      
      <div class="guestbook-display">
        <h4>📜 最新留言</h4>
        <div class="guestbook-danmaku" id="guestbook-danmaku">
          <!-- 弹幕式留言将在这里显示 -->
        </div>
      </div>
    `;

    container.innerHTML = formHTML;

    // 绑定表单提交事件
    const form = document.getElementById('guestbook-form');
    form.addEventListener('submit', handleSubmit);

    // 加载留言
    loadMessages();
  }

  // 处理表单提交
  function handleSubmit(e) {
    e.preventDefault();
    
    const nameInput = document.getElementById('guest-name');
    const messageInput = document.getElementById('guest-message');
    
    const name = nameInput.value.trim();
    const message = messageInput.value.trim();
    
    if (!name || !message) return;
    
    // 添加留言
    const newMessage = addMessage(name, message);
    
    // 显示留言
    displayMessage(newMessage);
    
    // 清空表单
    nameInput.value = '';
    messageInput.value = '';
    
    // 显示成功提示
    showNotification('留言发布成功！✨');
  }

  // 加载所有留言
  function loadMessages() {
    const messages = getMessages();
    
    // 如果没有留言，显示示例
    if (messages.length === 0) {
      SAMPLE_MESSAGES.forEach(msg => {
        displayMessage(msg);
      });
    } else {
      // 显示最新的10条留言
      const recentMessages = messages.slice(-10).reverse();
      recentMessages.forEach(msg => {
        displayMessage(msg);
      });
    }
    
    // 启动弹幕动画
    startDanmakuAnimation();
  }

  // 显示单条留言
  function displayMessage(msg) {
    const container = document.getElementById('guestbook-danmaku');
    if (!container) return;

    const danmaku = document.createElement('div');
    danmaku.className = 'guestbook-danmaku-item';
    danmaku.innerHTML = `
      <span class="danmaku-name" style="color: ${msg.color}">${msg.name}:</span>
      <span class="danmaku-text">${msg.message}</span>
    `;
    danmaku.style.color = msg.color;

    container.appendChild(danmaku);

    // 自动移除（弹幕效果）
    setTimeout(() => {
      danmaku.remove();
    }, 15000);
  }

  // 启动弹幕动画
  function startDanmakuAnimation() {
    const container = document.getElementById('guestbook-danmaku');
    if (!container) return;

    // 每5秒添加一条新留言
    setInterval(() => {
      const messages = getMessages();
      if (messages.length > 0) {
        const randomIndex = Math.floor(Math.random() * messages.length);
        displayMessage(messages[randomIndex]);
      }
    }, 5000);
  }

  // 显示通知
  function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'guestbook-notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: linear-gradient(135deg, #58a6ff, #a371f7);
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      z-index: 10000;
      animation: slideInRight 0.3s ease, fadeOut 0.3s ease 2s forwards;
      box-shadow: 0 4px 12px rgba(88, 166, 255, 0.3);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 2500);
  }

  // 初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGuestbook);
  } else {
    initGuestbook();
  }

})();
