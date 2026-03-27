/**
 * Guestbook - JSONBin.io Cloud Sync
 */

(function() {
  'use strict';

  var BIN_ID = '69c64aa9c3097a1dd56635bb';
  var API_KEY = '$2a$10$EOHGYh3otRTo8jQQw3FRc.XMcnhZ2c5E9UloscgNitQfHYArUBVCm';
  var STORAGE_KEY = 'guestbook_v8';
  var POLL_INTERVAL = 10000;

  var messages = [];
  var syncEnabled = true;

  var DEFAULT_MESSAGES = [
    { id: 1, name: 'Visitor', message: 'Great site!', time: '2024-01-15T10:30:00Z', color: '#58a6ff' },
    { id: 2, name: 'Dev', message: 'Nice UI!', time: '2024-01-14T09:15:00Z', color: '#a371f7' }
  ];

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
    var icons = { syncing: '...', synced: 'OK', offline: '!' };
    el.textContent = icons[status] || '!';
  }

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

  function formatTime(iso) {
    var diff = Date.now() - new Date(iso).getTime();
    if (diff < 60000) return 'Now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h';
    return Math.floor(diff / 86400000) + 'd';
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function render() {
    var container = document.querySelector('.guestbook-container');
    if (!container) {
      console.log('Guestbook: container not found');
      return;
    }

    var html = '<div class="gb-wrap">' +
      '<div class="gb-head">' +
        '<h3>Guestbook <span id="gb-status"></span></h3>' +
        '<span>' + messages.length + ' messages</span>' +
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
        '<input type="text" id="gb-name" placeholder="Name" maxlength="20" required>' +
        '<textarea id="gb-msg" placeholder="Message..." maxlength="200" rows="3" required></textarea>' +
        '<button type="submit">Post</button>' +
      '</form>' +
    '</div>';
    
    container.innerHTML = html;
  }

  function bindEvents() {
    document.addEventListener('submit', function(e) {
      if (e.target.id === 'gb-form') {
        e.preventDefault();
        var nameEl = document.getElementById('gb-name');
        var msgEl = document.getElementById('gb-msg');
        
        if (nameEl && msgEl && nameEl.value.trim() && msgEl.value.trim()) {
          addMessage(nameEl.value, msgEl.value);
          render();
        }
      }
    });
  }

  function addStyles() {
    if (document.getElementById('gb-style-v8')) return;
    
    var style = document.createElement('style');
    style.id = 'gb-style-v8';
    style.textContent = '.gb-wrap{max-width:680px;margin:0 auto;padding:20px}.gb-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}.gb-head h3{margin:0}.gb-list{max-height:400px;overflow-y:auto;margin-bottom:16px}.gb-item{display:flex;gap:12px;padding:14px;margin-bottom:10px;background:rgba(255,255,255,0.05);border-radius:12px}.gb-avatar{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700}.gb-content{flex:1}.gb-meta{display:flex;gap:8px;margin-bottom:4px}.gb-meta span:first-child{font-weight:600}.gb-time{font-size:12px;opacity:0.7}.gb-text{font-size:14px;line-height:1.5}.gb-form{display:flex;flex-direction:column;gap:10px}.gb-form input,.gb-form textarea{padding:10px;border-radius:8px;border:1px solid #ccc;background:rgba(255,255,255,0.1);color:inherit}.gb-form button{padding:10px 20px;background:#58a6ff;border:none;border-radius:8px;color:#fff;cursor:pointer}';
    document.head.appendChild(style);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
