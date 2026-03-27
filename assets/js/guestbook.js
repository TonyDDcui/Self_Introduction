/**
 * 鐣欒█鏉?- JSONBin.io 姝ｇ‘瀹炵幇
 *
 * 浣跨敤璇存槑锛? * 1. 璁块棶 https://jsonbin.io
 * 2. 鍒涘缓涓€涓柊鐨?Bin
 * 3. 鍒濆鍐呭璁句负锛歿"messages":[]}
 * 4. 鑾峰彇 Bin ID锛圲RL 涓殑 ID锛? * 5. 灏?Bin ID 濉叆涓嬫柟 BIN_ID
 */

(function () {
  'use strict';

  // 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?  // 閰嶇疆 - 璇峰～鍏ヤ綘鐨?Bin ID
  // 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?  const BIN_ID = '69c64aa9c3097a1dd56635bb'; // 鏇挎崲涓轰綘鐨?Bin ID
  const API_KEY = '$2a$10$EOHGYh3otRTo8jQQw3FRc.XMcnhZ2c5E9UloscgNitQfHYArUBVCm';
  const STORAGE_KEY = 'guestbook_local_v7';
  const POLL_INTERVAL = 10000;

  let messages = [];
  let syncEnabled = false;

  // 棰勭疆鐣欒█
  const DEFAULT_MESSAGES = [
    { id: 1, name: '璁垮', message: '缃戠珯璁捐寰楀緢妫掞紒', time: '2024-01-15T10:30:00Z', color: '#58a6ff' },
    { id: 2, name: '寮€鍙戣€?, message: 'UI 绮捐嚧锛屼綋楠屽緢濂?, time: '2024-01-14T09:15:00Z', color: '#a371f7' },
    { id: 3, name: '鍚屽', message: '瀛﹂暱鍔犳补锛?, time: '2024-01-13T16:45:00Z', color: '#39d353' }
  ];

  // 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?  // 鍒濆鍖?  // 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?  function init() {
    loadLocal();
    render();
    bindEvents();
    addStyles();

    // 妫€鏌ユ槸鍚﹂厤缃簡浜戠
    if (BIN_ID && BIN_ID !== '69c64aa9c3097a1dd56635bb') {
      syncEnabled = true;
      syncFromCloud();
      setInterval(syncFromCloud, POLL_INTERVAL);
      console.log('鈽侊笍 浜戠鍚屾宸插惎鐢?);
    } else {
      console.log('馃摫 浣跨敤鏈湴瀛樺偍妯″紡');
      console.log('鎻愮ず锛氳鍒涘缓 JSONBin 骞跺～鍏?BIN_ID 浠ュ惎鐢ㄤ簯绔悓姝?);
    }
  }

  // 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?  // 浜戠鍚屾锛堜娇鐢ㄥ崟涓?Bin锛?  // 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?
  async function syncFromCloud() {
    if (!syncEnabled) return;

    try {
      updateStatus('syncing');

      // 璇诲彇 Bin
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

      // 鍚堝苟浜戠娑堟伅
      if (data.record && data.record.messages) {
        mergeMessages(data.record.messages);
      }

      updateStatus('synced');
      console.log('鉁?浜戠鍚屾鎴愬姛');

    } catch (e) {
      console.error('浜戠鍚屾澶辫触:', e);
      updateStatus('offline');
    }
  }

  async function pushToCloud() {
    if (!syncEnabled) return;

    try {
      // 鏇存柊鏁翠釜 Bin
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
      console.log('鉁?宸插悓姝ュ埌浜戠');

    } catch (e) {
      console.error('浜戠鎺ㄩ€佸け璐?', e);
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
        showToast('鏀跺埌鏂扮暀瑷€ 鉁?);
      }
    }
  }

  function updateStatus(status) {
    const el = document.getElementById('gb-status');
    if (!el) return;

    const icons = {
      syncing: '馃攧',
      synced: '鈽侊笍',
      offline: '馃摫'
    };

    el.textContent = icons[status] || '馃摫';
  }

  // 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?  // 鏈湴瀛樺偍
  // 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?
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
      console.error('鏈湴淇濆瓨澶辫触:', e);
    }
  }

  // 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?  // 娣诲姞鐣欒█
  // 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?
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

  // 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?  // 娓叉煋
  // 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?
  function formatTime(iso) {
    const diff = Date.now() - new Date(iso).getTime();
    if (diff < 60000) return '鍒氬垰';
    if (diff < 3600000) return Math.floor(diff / 60000) + '鍒嗛挓鍓?;
    if (diff < 86400000) return Math.floor(diff / 3600000) + '灏忔椂鍓?;
    if (diff < 604800000) return Math.floor(diff / 86400000) + '澶╁墠';
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

    const statusIcon = syncEnabled ? '馃摫' : '馃摫';

    container.innerHTML = `
      <div class="gb-wrap">
        <div class="gb-head">
          <h3>馃挰 鐣欒█鏉?<span id="gb-status" title="鍚屾鐘舵€?>${statusIcon}</span></h3>
          <span class="gb-count">${messages.length} 鏉?/span>
        </div>

        <div class="gb-list" id="gb-list">
          ${messages.length === 0 ? '<div class="gb-empty">杩樻病鏈夌暀瑷€锛屽揩鏉ユ姠娌欏彂锛?/div>' : ''}
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
          <input type="text" id="gb-name" placeholder="浣犵殑鏄电О" maxlength="20" required>
          <textarea id="gb-msg" placeholder="鍐欎笅浣犵殑鐣欒█..." maxlength="200" rows="3" required></textarea>
          <button type="submit">馃殌 鍙戝竷鐣欒█</button>
        </form>

        ${!syncEnabled ? '<p class="gb-hint">馃挕 褰撳墠浣跨敤鏈湴瀛樺偍锛岄厤缃?JSONBin 鍙法璁惧鍚屾</p>' : ''}
      </div>
    `;
  }

  // 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?  // 浜嬩欢
  // 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?
  function bindEvents() {
    document.addEventListener('submit', e => {
      if (e.target.id === 'gb-form') {
        e.preventDefault();
        const nameEl = document.getElementById('gb-name');
        const msgEl = document.getElementById('gb-msg');

        if (nameEl && msgEl && nameEl.value.trim() && msgEl.value.trim()) {
          addMessage(nameEl.value, msgEl.value);
          render();
          showToast('鍙戝竷鎴愬姛锛侌煄?);
        }
      }
    });

    // 椤甸潰鍙鏃跺悓姝?    if (syncEnabled) {
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

  // 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?  // 鏍峰紡
  // 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?
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

  // 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?  // 鍚姩
  // 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
