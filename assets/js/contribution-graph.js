/* ================================================
   GitHub 贡献日历组件 - 简洁版
   ================================================ */

document.addEventListener('DOMContentLoaded', function() {
  const container = document.getElementById('github-calendar');
  const countEl = document.getElementById('contrib-count');
  if (!container) return;

  // 生成数据
  const weeks = 20;
  const data = [];
  const today = new Date();
  let total = 0;

  for (let w = weeks - 1; w >= 0; w--) {
    for (let d = 0; d < 7; d++) {
      const date = new Date(today);
      date.setDate(date.getDate() - (w * 7 + (6 - d)));
      
      let count = 0;
      if (date <= today) {
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        if (Math.random() < (isWeekend ? 0.3 : 0.65)) {
          count = Math.floor(Math.random() * 10);
          if (Math.random() < 0.2) count += 5;
        }
      }
      
      total += count;
      data.push({
        date: date.toISOString().split('T')[0],
        count,
        level: count === 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : count <= 9 ? 3 : 4
      });
    }
  }

  // 生成月份标签
  const months = [];
  let lastMonth = '';
  data.forEach((day, i) => {
    const month = day.date.substring(0, 7);
    if (month !== lastMonth && i % 7 === 0) {
      months.push({ month, col: Math.floor(i / 7) });
      lastMonth = month;
    }
  });

  // 渲染
  let html = '<div class="cal-wrapper"><div class="cal-months">';
  
  // 顶部月份行
  months.forEach((m, i) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const name = months[parseInt(m.month.split('-')[1]) - 1];
    const nextCol = months[i + 1] ? months[i + 1].col : weeks;
    const span = nextCol - m.col;
    html += `<span class="cal-month" style="grid-column: ${m.col + 1} / span ${span}">${name}</span>`;
  });
  
  html += '</div><div class="cal-grid">';
  
  // 方块
  data.forEach(day => {
    const date = new Date(day.date);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    html += `<div class="cal-cell level-${day.level}" title="${day.count} contributions on ${dayNames[date.getDay()]}, ${day.date}"></div>`;
  });
  
  html += '</div></div>';
  container.innerHTML = html;
  
  // 更新计数
  if (countEl) {
    countEl.textContent = total.toLocaleString() + ' contributions in the last year';
  }
});
