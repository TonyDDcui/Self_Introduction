/**
 * GitHub Contribution Graph - Enhanced Version
 */
(function() {
  'use strict';

  var CONFIG = {
    mobileBreakpoint: 768,
    mobileWeeks: 26,
    desktopWeeks: 52,
    cellSize: { desktop: 14, mobile: 11 },
    colors: {
      dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
      light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39']
    }
  };

  function isMobile() {
    return window.innerWidth < CONFIG.mobileBreakpoint;
  }

  function generateContributionData(weeks) {
    var data = [];
    var today = new Date();
    for (var i = weeks * 7; i >= 0; i--) {
      var date = new Date(today);
      date.setDate(date.getDate() - i);
      var rand = Math.random();
      var count = 0;
      if (rand > 0.6) count = Math.floor(Math.random() * 4) + 1;
      if (rand > 0.85) count = Math.floor(Math.random() * 8) + 3;
      if (rand > 0.95) count = Math.floor(Math.random() * 15) + 10;
      data.push({ date: date.toISOString().split('T')[0], count: count, day: date.getDay() });
    }
    return data;
  }

  function getContributionColor(count, isDark) {
    var colors = isDark ? CONFIG.colors.dark : CONFIG.colors.light;
    if (count === 0) return colors[0];
    if (count <= 2) return colors[1];
    if (count <= 5) return colors[2];
    if (count <= 10) return colors[3];
    return colors[4];
  }

  function formatDate(dateStr) {
    var date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function renderCalendar() {
    var container = document.getElementById('github-calendar');
    if (!container) return;

    var isDarkMode = document.body.getAttribute('data-theme') !== 'light';
    var mobile = isMobile();
    var weeks = mobile ? CONFIG.mobileWeeks : CONFIG.desktopWeeks;
    var data = generateContributionData(weeks);
    var cellSize = mobile ? CONFIG.cellSize.mobile : CONFIG.cellSize.desktop;

    container.innerHTML = '';
    container.className = 'github-calendar-enhanced' + (mobile ? ' mobile' : '');

    // Header
    var header = document.createElement('div');
    header.className = 'calendar-header';
    header.innerHTML = '<span class="calendar-title">' + (mobile ? 'Contributions' : 'GitHub Contributions') + '</span>' +
      '<span class="calendar-legend"><span class="legend-item"><span class="legend-box less"></span>Less</span><span class="legend-item"><span class="legend-box more"></span>More</span></span>';
    container.appendChild(header);

    // Month labels (desktop only)
    if (!mobile) {
      var months = document.createElement('div');
      months.className = 'calendar-months';
      var monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      var currentMonth = -1;
      for (var w = 0; w < Math.min(weeks, 52); w++) {
        var dayIndex = w * 7;
        if (dayIndex < data.length) {
          var month = new Date(data[dayIndex].date).getMonth();
          if (month !== currentMonth) {
            currentMonth = month;
          }
        }
      }
      months.innerHTML = monthLabels.map(function(m, i) {
        return '<span class="month-label" style="grid-column:' + (i * 4 + 1) + '">' + m + '</span>';
      }).join('');
      container.appendChild(months);
    }

    // Grid
    var grid = document.createElement('div');
    grid.className = 'calendar-grid';
    var gap = mobile ? 2 : 3;
    grid.style.cssText = 'display: grid; grid-template-columns: repeat(' + weeks + ', ' + cellSize + 'px); grid-template-rows: repeat(7, ' + cellSize + 'px); gap: ' + gap + 'px;' + (mobile ? 'overflow-x: auto; padding-bottom: 8px;' : '');

    var weeksData = [];
    var currentWeek = [];
    data.forEach(function(day) {
      if (day.day === 0 && currentWeek.length > 0) {
        weeksData.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(day);
    });
    if (currentWeek.length > 0) weeksData.push(currentWeek);

    weeksData.slice(0, weeks).forEach(function(week, weekIndex) {
      week.forEach(function(day) {
        var cell = document.createElement('div');
        cell.className = 'calendar-cell';
        cell.style.cssText = 'width: ' + cellSize + 'px; height: ' + cellSize + 'px; background-color: ' + getContributionColor(day.count, isDarkMode) + '; border-radius: ' + (mobile ? '2px' : '3px') + '; grid-column: ' + (weekIndex + 1) + '; grid-row: ' + (day.day + 1) + ';';
        cell.dataset.date = day.date;
        cell.dataset.count = day.count;
        cell.title = day.count + ' contributions on ' + formatDate(day.date);
        grid.appendChild(cell);
      });
    });

    container.appendChild(grid);

    // Summary
    var total = data.reduce(function(sum, day) { return sum + day.count; }, 0);
    var summary = document.createElement('div');
    summary.className = 'calendar-summary';
    summary.innerHTML = '<strong>' + total + '</strong> contributions in the last year';
    container.appendChild(summary);
  }

  var resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(renderCalendar, 250);
  });

  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.attributeName === 'data-theme') renderCalendar();
    });
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderCalendar);
  } else {
    renderCalendar();
  }
  observer.observe(document.body, { attributes: true });
})();
