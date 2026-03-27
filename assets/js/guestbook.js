/**
 * Guestbook - JSONBin.io Cloud Sync
 */

(function() {
  'use strict';

  // Config
  const BIN_ID = '69c64aa9c3097a1dd56635bb';
  const API_KEY = '$2a$10$EOHGYh3otRTo8jQQw3FRc.XMcnhZ2c5E9UloscgNitQfHYArUBVCm';
  const STORAGE_KEY = 'guestbook_v8';
  const POLL_INTERVAL = 10000;

  let messages = [];
  let syncEnabled = true;

  // Default messages
  const DEFAULT_MESSAGES = [
    { id: 1, name: 'Visitor', message: 'Great site!', time: '2024-01-15T10:30:00Z', color: '#58a6ff' },
    { id: 2, name: 'Dev', message: 'Nice UI!', time: '2024-01-14T09:15:00Z', color: '#a371f7' }
  ];

  // Init
  function init() {
    loadLocal();
    render();
    bindEvents();
    addStyles();
    
    if (syncEnabled && BIN_ID) {
      syncFromCloud();
      setInterval(syncFromCloud, POLL_INTERVAL);
      document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible') syncFromCloud();
      });
    }
  }

  // Cloud sync
  async function syncFromCloud() {
    if (!syncEnabled || !BIN_ID) return;
    
    try {
      updateStatus('syncing');
      var response = await fetch('https://api.jsonbin.io/v3/b/' + BIN_ID + '/latest', {
        headers: { 'X-Master-Key': API_KEY }
      });
      
      if (!response.ok) throw new Error('HTTP ' + response.status);
      
      var data = await response.json();
      if (data.record && data.record.messages) {
        mergeMessages(data.record.messages);
      }
      
      updateStatus('synced');
    } catch(e) {
      console.error('Sync failed:', e);
      updateStatus('offline');
    }
  }

  async function pushToCloud() {
    if (!syncEnabled || !BIN_ID) return;
    
    try {
      await fetch('https://api.jsonbin.io/v3/b/' + BIN_ID, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Master-Key': API_KEY },
        body: JSON.stringify({ messages: messages })
      });
      updateStatus('synced');
    } catch(e) {
      console.error('Push failed:', e);
    }
  }

  function mergeMessages(cloud) {
    if (!Array.isArray(cloud)) return;
    var localIds = {};
    messages.forEach(function(m) { localIds[m.id] = true; });
    
    var hasNew = false;
    cloud.forEach(function(m) {
      if (m && m.id && !localIds[m.id]) {
        messages.push(m);
        hasNew = true;
      }
    });
    
    if (hasNew) {
      messages.sort(function(a, b) { return new Date(b.time) - new Date(a.time); });
      messages = messages.slice(0, 100);
      saveLocal();
      render();
    }
  }

  function updateStatus(status) {
    var el = document.getElementById('gb-status');
    if (!el) return;
    var icons = { syncing: '🔄', synced: '☁️', offline: '📱' };
    el.textContent = icons[status] || '📱';
  }

  // Local storage
  function loadLocal() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      messages = stored ? JSON.parse(stored) : DEFAULT_MESSAGES.slice();
    } catch(e) {
      messages = DEFAULT_MESSAGES.slice();
    }
  }

  function saveLocal() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch(e) {}
  }

  // Add message
  function addMessage(name, text) {
    var msg = {
      id: Date.now(),
      name: name.trim().slice(0, 20),
      message: text.trim().slice(0, 200),
      time: new Date().toISOString(),
      color: ['#58a6ff', '#a371f7', '#39d353', '#f778ba', '#ffa657'][Math.floor(Math.random() * 5)]
    };
    
    messages.unshift(msg);
    messages = messages.slice(0, 100);
    saveLocal();
    pushToCloud();
    return msg;
  }

  // Render
  function formatTime(iso) {
    var diff = Date.now() - new Date(iso).getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
    return Math.floor(diff / 86400000) + 'd ago';
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function render() {
    var container = document.querySelector('.guestbook-container');
    if (!container) return;

    var html = '<div class="gb-wrap">' +
      '<div class="gb-head">' +
        '<h3>💬 Guestbook <span id="gb-status">☁️</span></h3>' +
        '<span class="gb-count">' + messages.length + ' messages</span>' +
      '</div>' +
      '<div class="gb-list">';
    
    messages.forEach(function(m) {
      html += '<div class="gb-item">' +
        '<div class="gb-avatar" style="background:' + m.color + '">' + m.name.charAt(0).toUpperCase() + '</div>' +
        '<div class="gb-content">' +
          '<div class="gb-meta">' +
            '<span style="color:' + m.color + '">' + escapeHtml(m.name) + '</span>' +
            '<span class="gb-time">' + formatTime(m.time) + '</span>' +
          '</div>' +
          '<div class="gb-text">' + escapeHtml(m.message) + '</div>' +
        '</div>' +
      '</div>';
    });
    
    html += '</div>' +
      '<form class="gb-form" id="gb-form">' +
        '<input type="text" id="gb-name" placeholder="Your name" maxlength="20" required>' +
        '<textarea id="gb-msg" placeholder="Your message..." maxlength="200" rows="3" required></textarea>' +
        '<button type="submit">🚀 Post</button>' +
      '</form>' +
    '</div>';
    
    container.innerHTML = html;
  }

  // Events
  function bindEvents() {
    document.addEventListener('submit', function(e) {
      if (e.target.id === 'gb-form') {
        e.preventDefault();
        var nameEl = document.getElementById('gb-name');
        var msgEl = document.getElementById('gb-msg');
        
        if (nameEl && msgEl && nameEl.value.trim() && msgEl.value.trim()) {
          addMessage(nameEl.value, msgEl.value);
          render();
          showToast('Posted! 🎉');
        }
      }
    });
  }

  function showToast(msg) {
    var t = document.createElement('div');
    t.className = 'gb-toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function() { t.classList.add('show'); }, 10);
    setTimeout(function() {
      t.classList.remove('show');
      setTimeout(function() { t.remove(); }, 300);
    }, 2500);
  }

  // Styles
  function addStyles() {
    if (document.getElementById('gb-style-v8')) return;
    
    var style = document.createElement('style');
    style.id = 'gb-style-v8';
    style.textContent = '.gb-wrap{max-width:680px;margin:0 auto;padding:20px}.gb-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid var(--border,rgba(255,255,255,0.1))}.gb-head h3{margin:0;font-size:1.2rem;color:var(--text,#e6edf3)}.gb-count{font-size:.85rem;color:var(--text-muted,#8b949e)}.gb-list{max-height:400px;overflow-y:auto;margin-bottom:16px}.gb-item{display:flex;gap:12px;padding:14px;margin-bottom:10px;background:var(--card,rgba(255,255,255,0.03));border-radius:12px;border:1px solid var(--border,rgba(255,255,255,0.08))}.gb-avatar{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;flex-shrink:0}.gb-content{flex:1;min-width:0}.gb-meta{display:flex;align-items:center;gap:8px;margin-bottom:6px}.gb-meta span:first-child{font-weight:600;font-size:.9rem}.gb-time{font-size:.75rem;color:var(--text-muted,#8b949e)}.gb-text{font-size:.88rem;color:var(--text-secondary,#c9d1d9);line-height:1.6;word-break:break-word}.gb-form{display:flex;flex-direction:column;gap:12px}.gb-form input,.gb-form textarea{padding:12px 14px;background:var(--input-bg,rgba(255,255,255,0.05));border:1px solid var(--border,rgba(255,255,255,0.1));border-radius:10px;color:var(--text,#e6edf3);font-size:.9rem;font-family:inherit}.gb-form input:focus,.gb-form textarea:focus{outline:none;border-color:var(--accent,#58a6ff)}.gb-form button{padding:12px 20px;background:linear-gradient(135deg,#58a6ff,#a371f7);border:none;border-radius:10px;color:#fff;font-size:.95rem;font-weight:600;cursor:pointer}.gb-toast{position:fixed;bottom:80px;left:50%;transform:translateX(-50%);padding:12px 24px;background:#39d353;color:#fff;border-radius:12px;font-size:.9rem;opacity:0;transition:opacity .3s;z-index:10000}.gb-toast.show{opacity:1}@media(max-width:480px){.gb-wrap{padding:12px}.gb-avatar{width:32px;height:32px}}';
    document.head.appendChild(style);
  }

  // Start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
