/**
 * GitHub Contribution Calendar - Modern Design
 */
(function() {
  'use strict';

  var CONFIG = {
    cellSize: { desktop: 12, mobile: 10 },
    gap: 3,
    weeks: 52,
    colors: {
      dark: { empty: '#161b22', l1: '#0e4429', l2: '#006d32', l3: '#26a641', l4: '#39d353' },
      light: { empty: '#ebedf0', l1: '#9be9a8', l2: '#40c463', l3: '#30a14e', l4: '#216e39' }
    }
  };

  function getColor(count, isDark) {
    var c = isDark ? CONFIG.colors.dark : CONFIG.colors.light;
    if (count === 0) return c.empty;
    if (count <= 3) return c.l1;
    if (count <= 6) return c.l2;
    if (count <= 10) return c.l3;
    return c.l4;
  }

  function formatDate(d) {
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
  }

  function generateData() {
    var data = [];
    var today = new Date();
    for (var i = 364; i >= 0; i--) {
      var date = new Date(today);
      date.setDate(date.getDate() - i);
      var r = Math.random();
      var count = 0;
      if (r > 0.5) count = Math.floor(Math.random() * 5) + 1;
      if (r > 0.85) count = Math.floor(Math.random() * 10) + 3;
      if (r > 0.97) count = Math.floor(Math.random() * 15) + 10;
      data.push({ date: date, dateStr: date.toISOString().split('T')[0], count: count, day: date.getDay() });
    }
    return data;
  }

  function renderCalendar() {
    var container = document.getElementById('github-calendar');
    if (!container) return;

    var isDark = document.body.getAttribute('data-theme') !== 'light';
    var data = generateData();

    // Create modern card
    var card = document.createElement('div');
    card.className = 'contrib-card';

    // Header
    var header = document.createElement('div');
    header.className = 'contrib-header';
    header.innerHTML = '<div class="contrib-title"><svg width="16" height="16" viewBox="0 0 16 16"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg><span>GitHub Contributions</span></div><a href="https://github.com/TonyDDcui" target="_blank" class="contrib-link">@TonyDDcui</a>';
    card.appendChild(header);

    // Stats bar
    var total = data.reduce(function(s, d) { return s + d.count; }, 0);
    var stats = document.createElement('div');
    stats.className = 'contrib-stats';
    stats.innerHTML = '<span class="stat-total"><strong>' + total + '</strong> contributions</span>';
    card.appendChild(stats);

    // Calendar grid
    var grid = document.createElement('div');
    grid.className = 'contrib-grid';

    // Group by weeks
    var weeks = [];
    var week = [];
    data.forEach(function(d, i) {
      week.push(d);
      if (d.day === 6 || i === data.length - 1) {
        weeks.push(week);
        week = [];
      }
    });

    weeks.forEach(function(w, wi) {
      w.forEach(function(d) {
        var cell = document.createElement('div');
        cell.className = 'contrib-cell';
        cell.style.backgroundColor = getColor(d.count, isDark);
        cell.title = d.count + ' contributions on ' + formatDate(d.date);
        cell.dataset.count = d.count;
        cell.dataset.date = d.dateStr;
        grid.appendChild(cell);
      });
    });

    card.appendChild(grid);

    // Legend
    var legend = document.createElement('div');
    legend.className = 'contrib-legend';
    legend.innerHTML = '<span class="legend-label">Less</span><div class="legend-scale"><div style="background:' + CONFIG.colors[isDark ? 'dark' : 'light'].empty + '"></div><div style="background:' + CONFIG.colors[isDark ? 'dark' : 'light'].l1 + '"></div><div style="background:' + CONFIG.colors[isDark ? 'dark' : 'light'].l2 + '"></div><div style="background:' + CONFIG.colors[isDark ? 'dark' : 'light'].l3 + '"></div><div style="background:' + CONFIG.colors[isDark ? 'dark' : 'light'].l4 + '"></div></div><span class="legend-label">More</span>';
    card.appendChild(legend);

    container.innerHTML = '';
    container.appendChild(card);
  }

  // Watch for theme changes
  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(m) {
      if (m.attributeName === 'data-theme') renderCalendar();
    });
  });

  // Watch for resize
  var resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(renderCalendar, 200);
  });

  // Init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderCalendar);
  } else {
    renderCalendar();
  }
  observer.observe(document.body, { attributes: true });
})();
