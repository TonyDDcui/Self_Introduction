/**
 * 留言板 - 本地存储版
 * 显示历史留言，本地保存
 */

(function() {
  'use strict';

  // 预置的历史留言
  const DEFAULT_MESSAGES = [
    { id: 1, name: '技术爱好者', message: '网站设计得很棒！👍', time: '2024-01-15T10:30:00Z', color: '#58a6ff' },
    { id: 2, name: '前端开发者', message: 'UI做得很精致', time: '2024-01-14T09:15:00Z', color: '#a371f7' },
    { id: 3, name: '校友', message: '学长加油！', time: '2024-01-13T16:45:00Z', color: '#39d353' },
    { id: 4, name: '访客', message: '期待更多项目分享', time: '2024-01-12T14:20:00Z', color: '#d29922' },
    { id: 5, name: 'HR', message: '人才啊！', time: '2024-01-11T11:00:00Z', color: '#f85149' }
  ];

  let messages = [];

  function init() {
    loadMessages();
    render();
    bindEvents();
    addStyles();
  }

  function loadMessages() {
    try {
      const stored = localStorage.getItem('guestbook_messages');
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
      localStorage.setItem('guestbook_messages', JSON.stringify(messages));
    } catch (e) {
      console.warn('保存失败:', e);
    }
  }

  function addMessage(name, message) {
    const newMessage = {
      id: Date.now(),
      name: name.trim().slice(0, 20),
      message: message.trim().slice(0, 200),
      time: new Date().toISOString(),
      color: getRandomColor()
    };
    messages.unshift(newMessage);
    if (messages.length > 50) messages = messages.slice(0, 50);
    saveMessages();
    return newMessage;
  }

  function getRandomColor() {
    const colors = ['#58a6ff', '#a371f7', '#39d353', '#d29922', '#f85149', '#79c0ff'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  function formatTime(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now - date;
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
    if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
    return Math.floor(diff / 86400000) + '天前';
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function render() {
    const container = document.querySelector('.guestbook-container');
    if (!container) return;

    container.innerHTML = `
      <div class="guestbook-wrapper">
        <div class="guestbook-header">
          <h3>💬 留言板</h3>
          <span class="msg-count">${messages.length} 条留言</span>
        </div>
        <div class="guestbook-list">
          ${messages.map(msg => `
            <div class="message-item" style="border-left-color: ${msg.color}">
              <div class="msg-avatar" style="background: ${msg.color}">${msg.name.charAt(0)}</div>
              <div class="msg-content">
                <div class="msg-header">
                  <span class="msg-name" style="color: ${msg.color}">${escapeHtml(msg.name)}</span>
                  <span class="msg-time">${formatTime(msg.time)}</span>
                </div>
                <div class="msg-text">${escapeHtml(msg.message)}</div>
              </div>
            </div>
          `).join('')}
        </div>
        <form class="guestbook-form">
          <input type="text" id="gb-name" placeholder="你的昵称" maxlength="20" required>
          <textarea id="gb-message" placeholder="写下你的留言..." maxlength="200" required></textarea>
          <button type="submit">发布留言</button>
        </form>
      </div>
    `;
  }

  function bindEvents() {
    const container = document.querySelector('.guestbook-container');
    if (!container) return;

    container.addEventListener('submit', function(e) {
      if (e.target.classList.contains('guestbook-form')) {
        e.preventDefault();
        const nameInput = document.getElementById('gb-name');
        const msgInput = document.getElementById('gb-message');
        
        if (nameInput.value.trim() && msgInput.value.trim()) {
          addMessage(nameInput.value, msgInput.value);
          render();
          showToast('留言发布成功！');
        }
      }
    });
  }

  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'gb-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('show');
      setTimeout(() => toast.remove(), 2000);
    }, 100);
  }

  function addStyles() {
    if (document.getElementById('guestbook-styles')) return;
    const style = document.createElement('style');
    style.id = 'guestbook-styles';
    style.textContent = `
      .guestbook-wrapper { max-width: 800px; margin: 0 auto; background: rgba(255,255,255,0.02); border-radius: 24px; padding: 24px; }
      .guestbook-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.06); }
      .guestbook-header h3 { font-size: 1.5rem; margin: 0; }
      .msg-count { font-size: 0.875rem; color: var(--text-muted); }
      .guestbook-list { max-height: 400px; overflow-y: auto; margin-bottom: 20px; }
      .message-item { display: flex; gap: 12px; padding: 16px; margin-bottom: 12px; background: rgba(255,255,255,0.03); border-radius: 12px; border-left: 3px solid; }
      .msg-avatar { width: 36px; height: 36px; border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; flex-shrink: 0; }
      .msg-content { flex: 1; }
      .msg-header { display: flex; justify-content: space-between; margin-bottom: 6px; }
      .msg-name { font-weight: 600; }
      .msg-time { font-size: 0.75rem; color: var(--text-muted); }
      .msg-text { font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5; }
      .guestbook-form { display: flex; flex-direction: column; gap: 12px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.06); }
      .guestbook-form input, .guestbook-form textarea { padding: 12px 16px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: var(--text-primary); font-size: 0.95rem; }
      .guestbook-form textarea { min-height: 80px; resize: vertical; }
      .guestbook-form button { padding: 12px 24px; background: linear-gradient(135deg, #58a6ff, #a371f7); border: none; border-radius: 12px; color: white; font-size: 0.95rem; font-weight: 600; cursor: pointer; }
      .gb-toast { position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%); padding: 12px 24px; background: linear-gradient(135deg, #58a6ff, #a371f7); color: white; border-radius: 12px; font-size: 0.95rem; opacity: 0; transition: opacity 0.3s; z-index: 10000; }
      .gb-toast.show { opacity: 1; }
    `;
    document.head.appendChild(style);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();