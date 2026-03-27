/**
 * 留言板 - JSONBin.io 云端同步版（修复版）
 */

(function () {
  'use strict';

  // 配置
  const COLLECTION_ID = '69c63595c3097a1dd565de94';
  const API_KEY = '$2a$10$EOHGYh3otRTo8jQQw3FRc.XMcnhZ2c5E9UloscgNitQfHYArUBVCm';
  const STORAGE_KEY = 'guestbook_v6';
  const POLL_INTERVAL = 10000;

  let messages = [];
  let syncStatus = 'offline';

  // 预置留言
  const DEFAULT_MESSAGES = [
    { id: 1, name: '访客', message: '网站设计得很棒！', time: '2024-01-15T10:30:00Z', color: '#58a6ff' },
    { id: 2, name: '开发者', message: 'UI 精致', time: '2024-01-14T09:15:00Z', color: '#a371f7' }
  ];

  function init() {
    loadLocal();
    render();
    bindEvents();
    addStyles();
    syncFromCloud();
    setInterval(syncFromCloud, POLL_INTERVAL);
  }

  // ========== 云端同步 ==========

  async function syncFromCloud() {
    try {
      updateStatus('syncing');

      // 读取 Collection 中的所有 bins
      const response = await fetch(
        `https://api.jsonbin.io/v3/c/${COLLECTION_ID}/bins`,
        {
          headers: {
            'X-Master-Key': API_KEY
          }
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('同步失败:', response.status, errorText);
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      // 处理返回的数据
      if (Array.isArray(data)) {
        // 可能直接是数组
        mergeMessages(data);
      } else if (data.records) {
        // 从 records 提取
        const allMessages = [];
        for (const record of data.records) {
          if (record.record && record.record.messages) {
            allMessages.push(...record.record.messages);
          }
        }
        if (allMessages.length > 0) {
          mergeMessages(allMessages);
        }
      }

      updateStatus('synced');
      console.log('✅ 云端同步成功');

    } catch (e) {
      console.error('云端同步失败:', e);
      updateStatus('offline');
    }
  }

  async function pushToCloud(newMsg) {
    try {
      // 创建新的 bin
      const response = await fetch(
        `https://api.jsonbin.io/v3/c/${COLLECTION_ID}/records`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Master-Key': API_KEY
          },
          body: JSON.stringify({
            messages: [newMsg]
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      console.log('✅ 留言已同步到云端');
      updateStatus('synced');

    } catch (e) {
      console.error('推送失败:', e);
      // 推送失败但不影响本地
    }
  }

  function mergeMessages(cloudMessages) {
    if (!Array.isArray(cloudMessages) || cloudMessages.length === 0) return;

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
    syncStatus = status;
    const el = document.getElementById('gb-status');
    if (!el) return;

    const icons = {
      syncing: '🔄',
      synced: '☁️',
      offline: '📱'
    };

    el.textContent = icons[status] || '📱';
    el.title = status === 'synced' ? '已同步' : status === 'syncing' ? '同步中...' : '本地模式';
  }

  // ========== 本地存储 ==========

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

  // ========== 添加留言 ==========

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
    pushToCloud(msg);

    return msg;
  }

  // ========== 渲染 ==========

  function formatTime(iso) {
    const diff = Date.now() - new Date(iso).getTime();
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
      <div class="gb-wrap">
        <div class="gb-head">
          <h3>💬 留言板 <span id="gb-status" title="同步状态">📱</span></h3>
          <span class="gb-count">${messages.length} 条</span>
        </div>

        <div class="gb-list">
          ${messages.map(m => `
            <div class="gb-item">
              <div class="gb-avatar" style="background:${m.color}">${m.name[0].toUpperCase()}</div>
              <div class="gb-content">
                <div class="gb-meta">
                  <span style="color:${m.color}">${escapeHtml(m.name)}</span>
                  <span class="gb-time">${formatTime(m.time)}</span>
                </div>
                <div class="gb-text">${escapeHtml(m.message)}</div>
              </div>
            </div>
          `).join('')}
        </div>

        <form class="gb-form" id="gb-form">
          <input type="text" id="gb-name" placeholder="昵称" maxlength="20" required>
          <textarea id="gb-msg" placeholder="留言..." maxlength="200" required></textarea>
          <button type="submit">🚀 发布</button>
        </form>
      </div>
    `;
  }

  // ========== 事件 ==========

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
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        syncFromCloud();
      }
    });
  }

  function showToast(msg) {
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

  // ========== 样式 ==========

  function addStyles() {
    if (document.getElementById('gb-style')) return;

    const style = document.createElement('style');
    style.id = 'gb-style';
    style.textContent = `
      .gb-wrap{max-width:680px;margin:0 auto;padding:20px}
      .gb-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid var(--border,rgba(255,255,255,0.1))}
      .gb-head h3{margin:0;font-size:1.2rem;color:var(--text,#e6edf3)}
      .gb-count{font-size:.85rem;color:var(--text-muted,#8b949e)}
      .gb-list{max-height:400px;overflow-y:auto;margin-bottom:16px}
      .gb-item{display:flex;gap:10px;padding:12px;margin-bottom:10px;background:var(--card,rgba(255,255,255,0.03));border-radius:10px;border:1px solid var(--border,rgba(255,255,255,0.08))}
      .gb-avatar{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;flex-shrink:0}
      .gb-content{flex:1;min-width:0}
      .gb-meta{display:flex;align-items:center;gap:8px;margin-bottom:4px}
      .gb-meta span:first-child{font-weight:600;font-size:.9rem}
      .gb-time{font-size:.75rem;color:var(--text-muted,#8b949e)}
      .gb-text{font-size:.88rem;color:var(--text-secondary,#c9d1d9);line-height:1.5;word-break:break-word}
      .gb-form{display:flex;flex-direction:column;gap:10px}
      .gb-form input,.gb-form textarea{padding:10px 12px;background:var(--input-bg,rgba(255,255,255,0.05));border:1px solid var(--border,rgba(255,255,255,0.1));border-radius:8px;color:var(--text,#e6edf3);font-size:.9rem;font-family:inherit}
      .gb-form input:focus,.gb-form textarea:focus{outline:none;border-color:var(--accent,#58a6ff)}
      .gb-form button{padding:10px 16px;background:linear-gradient(135deg,#58a6ff,#a371f7);border:none;border-radius:8px;color:#fff;font-weight:600;cursor:pointer}
      .gb-form button:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(88,166,255,0.3)}
      .gb-toast{position:fixed;bottom:80px;left:50%;transform:translateX(-50%);padding:10px 20px;background:#39d353;color:#fff;border-radius:8px;font-size:.9rem;opacity:0;transition:opacity .3s;z-index:10000}
      .gb-toast.show{opacity:1}
      @media(max-width:480px){.gb-wrap{padding:12px}.gb-avatar{width:30px;height:30px}}
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
