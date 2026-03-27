/**
 * 留言板 - JSONBin.io 正确实现
 *
 * 使用说明：
 * 1. 访问 https://jsonbin.io
 * 2. 创建一个新的 Bin
 * 3. 初始内容设为：{"messages":[]}
 * 4. 获取 Bin ID（URL 中的 ID）
 * 5. 将 Bin ID 填入下方 BIN_ID
 */

(function () {
  'use strict';

  // ═══════════════════════════════════════
  // 配置 - 请填入你的 Bin ID
  // ═══════════════════════════════════════
  const BIN_ID = 'YOUR_BIN_ID_HERE'; // 替换为你的 Bin ID
  const API_KEY = '$2a$10$EOHGYh3otRTo8jQQw3FRc.XMcnhZ2c5E9UloscgNitQfHYArUBVCm';
  const STORAGE_KEY = 'guestbook_local_v7';
  const POLL_INTERVAL = 10000;

  let messages = [];
  let syncEnabled = false;

  // 预置留言
  const DEFAULT_MESSAGES = [
    { id: 1, name: '访客', message: '网站设计得很棒！', time: '2024-01-15T10:30:00Z', color: '#58a6ff' },
    { id: 2, name: '开发者', message: 'UI 精致，体验很好', time: '2024-01-14T09:15:00Z', color: '#a371f7' },
    { id: 3, name: '同学', message: '学长加油！', time: '2024-01-13T16:45:00Z', color: '#39d353' }
  ];

  // ═══════════════════════════════════════
  // 初始化
  // ═══════════════════════════════════════
  function init() {
    loadLocal();
    render();
    bindEvents();
    addStyles();

    // 检查是否配置了云端
    if (BIN_ID && BIN_ID !== 'YOUR_BIN_ID_HERE') {
      syncEnabled = true;
      syncFromCloud();
      setInterval(syncFromCloud, POLL_INTERVAL);
      console.log('☁️ 云端同步已启用');
    } else {
      console.log('📱 使用本地存储模式');
      console.log('提示：请创建 JSONBin 并填入 BIN_ID 以启用云端同步');
    }
  }

  // ═══════════════════════════════════════
  // 云端同步（使用单个 Bin）
  // ═══════════════════════════════════════

  async function syncFromCloud() {
    if (!syncEnabled) return;

    try {
      updateStatus('syncing');

      // 读取 Bin
      const response = await fetch(
        `https://api.jsonbin.io/v3/b/${BIN_ID}/latest`,
        {
          headers: {
            'X-Master-Key': API_KEY
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      // 合并云端消息
      if (data.record && data.record.messages) {
        mergeMessages(data.record.messages);
      }

      updateStatus('synced');
      console.log('✅ 云端同步成功');

    } catch (e) {
      console.error('云端同步失败:', e);
      updateStatus('offline');
    }
  }

  async function pushToCloud() {
    if (!syncEnabled) return;

    try {
      // 更新整个 Bin
      const response = await fetch(
        `https://api.jsonbin.io/v3/b/${BIN_ID}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Master-Key': API_KEY
          },
          body: JSON.stringify({
            messages: messages
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      updateStatus('synced');
      console.log('✅ 已同步到云端');

    } catch (e) {
      console.error('云端推送失败:', e);
      updateStatus('offline');
    }
  }

  function mergeMessages(cloudMessages) {
    if (!Array.isArray(cloudMessages)) return;

    const localIds = new Set(messages.map(m => m.id));
    let hasNew = false;

    for (const msg of cloudMessages) {
      if (msg && msg.id && !localIds.has(msg.id)) {
        messages.push(msg);
        hasNew = true;
      }
    }

    if (hasNew) {
      messages.sort((a, b) => new Date(b.time) - new Date(a.time));
      messages = messages.slice(0, 100);
      saveLocal();
      render();

      if (document.visibilityState === 'visible') {
        showToast('收到新留言 ✨');
      }
    }
  }

  function updateStatus(status) {
    const el = document.getElementById('gb-status');
    if (!el) return;

    const icons = {
      syncing: '🔄',
      synced: '☁️',
      offline: '📱'
    };

    el.textContent = icons[status] || '📱';
  }

  // ═══════════════════════════════════════
  // 本地存储
  // ═══════════════════════════════════════

  function loadLocal() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      messages = stored ? JSON.parse(stored) : [...DEFAULT_MESSAGES];
    } catch (e) {
      messages = [...DEFAULT_MESSAGES];
    }
  }

  function saveLocal() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.error('本地保存失败:', e);
    }
  }

  // ═══════════════════════════════════════
  // 添加留言
  // ═══════════════════════════════════════

  function addMessage(name, text) {
    const msg = {
      id: Date.now(),
      name: name.trim().slice(0, 20),
      message: text.trim().slice(0, 200),
      time: new Date().toISOString(),
      color: ['#58a6ff', '#a371f7', '#39d353', '#f778ba', '#ffa657'][Math.floor(Math.random() * 5)]
    };

    messages.unshift(msg);
    messages = messages.slice(0, 100);
    saveLocal();

    if (syncEnabled) {
      pushToCloud();
    }

    return msg;
  }

  // ═══════════════════════════════════════
  // 渲染
  // ═══════════════════════════════════════

  function formatTime(iso) {
    const diff = Date.now() - new Date(iso).getTime();
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
    if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
    if (diff < 604800000) return Math.floor(diff / 86400000) + '天前';
    return new Date(iso).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function render() {
    const container = document.querySelector('.guestbook-container');
    if (!container) return;

    const statusIcon = syncEnabled ? '📱' : '📱';

    container.innerHTML = `
      <div class="gb-wrap">
        <div class="gb-head">
          <h3>💬 留言板 <span id="gb-status" title="同步状态">${statusIcon}</span></h3>
          <span class="gb-count">${messages.length} 条</span>
        </div>

        <div class="gb-list" id="gb-list">
          ${messages.length === 0 ? '<div class="gb-empty">还没有留言，快来抢沙发！</div>' : ''}
          ${messages.map(m => `
            <div class="gb-item">
              <div class="gb-avatar" style="background:${m.color}">${m.name[0].toUpperCase()}</div>
              <div class="gb-content">
                <div class="gb-meta">
                  <span class="gb-name" style="color:${m.color}">${escapeHtml(m.name)}</span>
                  <span class="gb-time">${formatTime(m.time)}</span>
                </div>
                <div class="gb-text">${escapeHtml(m.message)}</div>
              </div>
            </div>
          `).join('')}
        </div>

        <form class="gb-form" id="gb-form">
          <input type="text" id="gb-name" placeholder="你的昵称" maxlength="20" required>
          <textarea id="gb-msg" placeholder="写下你的留言..." maxlength="200" rows="3" required></textarea>
          <button type="submit">🚀 发布留言</button>
        </form>

        ${!syncEnabled ? '<p class="gb-hint">💡 当前使用本地存储，配置 JSONBin 可跨设备同步</p>' : ''}
      </div>
    `;
  }

  // ═══════════════════════════════════════
  // 事件
  // ═══════════════════════════════════════

  function bindEvents() {
    document.addEventListener('submit', e => {
      if (e.target.id === 'gb-form') {
        e.preventDefault();
        const nameEl = document.getElementById('gb-name');
        const msgEl = document.getElementById('gb-msg');

        if (nameEl && msgEl && nameEl.value.trim() && msgEl.value.trim()) {
          addMessage(nameEl.value, msgEl.value);
          render();
          showToast('发布成功！🎉');
        }
      }
    });

    // 页面可见时同步
    if (syncEnabled) {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          syncFromCloud();
        }
      });
    }
  }

  function showToast(msg) {
    const existing = document.querySelector('.gb-toast');
    if (existing) existing.remove();

    const t = document.createElement('div');
    t.className = 'gb-toast';
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => {
      t.classList.remove('show');
      setTimeout(() => t.remove(), 300);
    }, 2500);
  }

  // ═══════════════════════════════════════
  // 样式
  // ═══════════════════════════════════════

  function addStyles() {
    if (document.getElementById('gb-style-v7')) return;

    const style = document.createElement('style');
    style.id = 'gb-style-v7';
    style.textContent = `
      .gb-wrap{max-width:680px;margin:0 auto;padding:20px}
      .gb-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid var(--border,rgba(255,255,255,0.1))}
      .gb-head h3{margin:0;font-size:1.2rem;color:var(--text,#e6edf3);display:flex;align-items:center;gap:8px}
      #gb-status{font-size:1rem}
      .gb-count{font-size:.85rem;color:var(--text-muted,#8b949e)}
      .gb-list{max-height:400px;overflow-y:auto;margin-bottom:16px;scrollbar-width:thin}
      .gb-list::-webkit-scrollbar{width:4px}
      .gb-list::-webkit-scrollbar-thumb{background:rgba(88,166,255,0.3);border-radius:2px}
      .gb-empty{text-align:center;padding:40px;color:var(--text-muted,#8b949e)}
      .gb-item{display:flex;gap:12px;padding:14px;margin-bottom:10px;background:var(--card,rgba(255,255,255,0.03));border-radius:12px;border:1px solid var(--border,rgba(255,255,255,0.08));transition:transform .2s}
      .gb-item:hover{transform:translateX(2px)}
      .gb-avatar{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:.95rem;flex-shrink:0}
      .gb-content{flex:1;min-width:0}
      .gb-meta{display:flex;align-items:center;gap:8px;margin-bottom:6px}
      .gb-name{font-weight:600;font-size:.9rem}
      .gb-time{font-size:.75rem;color:var(--text-muted,#8b949e)}
      .gb-text{font-size:.88rem;color:var(--text-secondary,#c9d1d9);line-height:1.6;word-break:break-word}
      .gb-form{display:flex;flex-direction:column;gap:12px}
      .gb-form input,.gb-form textarea{padding:12px 14px;background:var(--input-bg,rgba(255,255,255,0.05));border:1px solid var(--border,rgba(255,255,255,0.1));border-radius:10px;color:var(--text,#e6edf3);font-size:.9rem;font-family:inherit;transition:border-color .2s}
      .gb-form input:focus,.gb-form textarea:focus{outline:none;border-color:var(--accent,#58a6ff)}
      .gb-form input::placeholder,.gb-form textarea::placeholder{color:var(--text-muted,#6e7681)}
      .gb-form button{padding:12px 20px;background:linear-gradient(135deg,#58a6ff,#a371f7);border:none;border-radius:10px;color:#fff;font-size:.95rem;font-weight:600;cursor:pointer;transition:transform .2s,box-shadow .2s}
      .gb-form button:hover{transform:translateY(-1px);box-shadow:0 4px 16px rgba(88,166,255,0.4)}
      .gb-form button:active{transform:scale(.98)}
      .gb-hint{font-size:.75rem;color:var(--text-muted,#6e7681);text-align:center;margin-top:12px;padding:8px;background:rgba(88,166,255,0.05);border-radius:6px}
      .gb-toast{position:fixed;bottom:80px;left:50%;transform:translateX(-50%);padding:12px 24px;background:linear-gradient(135deg,#39d353,#2ea043);color:#fff;border-radius:12px;font-size:.9rem;box-shadow:0 4px 20px rgba(0,0,0,.3);opacity:0;transition:opacity .3s;z-index:10000}
      .gb-toast.show{opacity:1}
      @media(max-width:480px){.gb-wrap{padding:12px}.gb-item{padding:12px}.gb-avatar{width:32px;height:32px;font-size:.85rem}.gb-form button{width:100%}}
    `;
    document.head.appendChild(style);
  }

  // ═══════════════════════════════════════
  // 启动
  // ═══════════════════════════════════════
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
