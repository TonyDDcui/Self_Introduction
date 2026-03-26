/**
 * GitHub Contribution Graph - Mobile Optimized
 */
(function() {
  'use strict';

  const CONFIG = {
    mobileBreakpoint: 768,
    mobileWeeks: 13,
    desktopWeeks: 52,
    cellSize: { desktop: 12, mobile: 10 }
  };

  function isMobile() {
    return window.innerWidth < CONFIG.mobileBreakpoint;
  }

  function generateContributionData(weeks) {
    const data = [];
    const today = new Date();
    for (let i = weeks * 7; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const rand = Math.random();
      let count = 0;
      if (rand > 0.7) count = Math.floor(Math.random() * 3) + 1;
      if (rand > 0.9) count = Math.floor(Math.random() * 8) + 3;
      if (rand > 0.97) count = Math.floor(Math.random() * 15) + 10;
      data.push({ date: date.toISOString().split('T')[0], count: count, day: date.getDay() });
    }
    return data;
  }

  function getContributionColor(count, isDark) {
    if (count === 0) return isDark ? '#161b22' : '#ebedf0';
    if (count <= 3) return isDark ? '#0e4429' : '#9be9a8';
    if (count <= 6) return isDark ? '#006d32' : '#40c463';
    if (count <= 10) return isDark ? '#26a641' : '#30a14e';
    return isDark ? '#39d353' : '#216e39';
  }

  function renderCalendar() {
    const container = document.getElementById('github-calendar');
    if (!container) return;

    const isDarkMode = document.body.getAttribute('data-theme') === 'dark';
    const mobile = isMobile();
    const weeks = mobile ? CONFIG.mobileWeeks : CONFIG.desktopWeeks;
    const data = generateContributionData(weeks);
    const cellSize = mobile ? CONFIG.cellSize.mobile : CONFIG.cellSize.desktop;

    container.innerHTML = '';
    container.className = 'github-calendar-mini' + (mobile ? ' mobile' : '');

    const grid = document.createElement('div');
    grid.className = 'calendar-grid';
    grid.style.cssText = 'display: grid; grid-template-columns: repeat(' + weeks + ', ' + cellSize + 'px); grid-template-rows: repeat(7, ' + cellSize + 'px); gap: 2px;' + (mobile ? 'overflow-x: auto; -webkit-overflow-scrolling: touch;' : '');

    const weeksData = [];
    let currentWeek = [];
    data.forEach((day) => {
      if (day.day === 0 && currentWeek.length > 0) {
        weeksData.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(day);
    });
    if (currentWeek.length > 0) weeksData.push(currentWeek);

    weeksData.forEach((week, weekIndex) => {
      week.forEach((day) => {
        const cell = document.createElement('div');
        cell.className = 'calendar-cell';
        cell.style.cssText = 'width: ' + cellSize + 'px; height: ' + cellSize + 'px; background-color: ' + getContributionColor(day.count, isDarkMode) + '; border-radius: ' + (mobile ? '2px' : '3px') + '; cursor: pointer; grid-column: ' + (weekIndex + 1) + '; grid-row: ' + (day.day + 1) + ';';
        cell.dataset.date = day.date;
        cell.dataset.count = day.count;
        cell.title = day.count + ' contributions on ' + day.date;
        grid.appendChild(cell);
      });
    });

    container.appendChild(grid);
    updateContributionCount(data);
  }

  function updateContributionCount(data) {
    const countEl = document.getElementById('contrib-count');
    if (countEl) {
      const total = data.reduce((sum, day) => sum + day.count, 0);
      countEl.textContent = total + ' contributions in the last year';
    }
  }

  let resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(renderCalendar, 250);
  });

  const observer = new MutationObserver(function(mutations) {
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
