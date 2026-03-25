/* ================================================
   GitHub 贡献日历组件 - 官方风格
   ================================================ */

class GitHubCalendar {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.options = {
      username: options.username || 'TonyDDcui',
      weeks: options.weeks || 20,
      cellSize: options.cellSize || 11,
      ...options
    };
    this.data = [];
    
    if (this.container) {
      this.init();
    }
  }

  async init() {
    this.generateData();
    this.render();
    this.updateCount();
  }

  generateData() {
    const today = new Date();
    const weeks = this.options.weeks;
    
    for (let w = weeks - 1; w >= 0; w--) {
      for (let d = 0; d < 7; d++) {
        const date = new Date(today);
        date.setDate(date.getDate() - (w * 7 + (6 - d)));
        
        if (date > today) {
          this.data.push({ date: this.formatDate(date), count: 0, level: 0 });
          continue;
        }
        
        let baseProb = date.getDay() === 0 || date.getDay() === 6 ? 0.3 : 0.7;
        let count = 0;
        
        if (Math.random() < baseProb) {
          count = Math.floor(Math.random() * 12);
          if (Math.random() < 0.15) count += 8;
        }
        
        this.data.push({
          date: this.formatDate(date),
          count,
          level: this.getLevel(count),
          day: d
        });
      }
    }
  }

  formatDate(date) {
    return date.toISOString().split('T')[0];
  }

  getLevel(count) {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 9) return 3;
    return 4;
  }

  getMonthLabels() {
    const months = [];
    let currentMonth = '';
    
    this.data.forEach((day, index) => {
      const month = day.date.substring(0, 7);
      if (month !== currentMonth && index % 7 === 0) {
        currentMonth = month;
        months.push({ month, index: Math.floor(index / 7) });
      }
    });
    
    return months;
  }

  render() {
    if (!this.container) return;

    const { cellSize } = this.options;
    const months = this.getMonthLabels();
    
    // 生成周
    const weeks = [];
    let currentWeek = [];

    this.data.forEach((day, index) => {
      currentWeek.push(day);
      
      if (currentWeek.length === 7 || index === this.data.length - 1) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    // 生成月份标签
    let monthsHtml = '';
    months.forEach((m, i) => {
      const nextMonth = months[i + 1];
      const width = nextMonth 
        ? (nextMonth.index - m.index) * (cellSize + 3)
        : (weeks.length - m.index) * (cellSize + 3);
      monthsHtml += `<span class="month-label" style="width: ${width}px;">${this.formatMonth(m.month)}</span>`;
    });

    let html = `
      <div class="calendar-months">${monthsHtml}</div>
      <div class="calendar-graph">
        ${weeks.map(week => `
          <div class="calendar-week">
            ${week.map(day => `
              <div 
                class="calendar-day" 
                data-level="${day.level}"
                data-count="${day.count}"
                data-date="${day.date}"
                title="${day.count} contributions on ${this.formatDisplayDate(day.date)}"
              ></div>
            `).join('')}
          </div>
        `).join('')}
      </div>
    `;

    this.container.innerHTML = html;
  }

  updateCount() {
    const total = this.data.reduce((sum, d) => sum + d.count, 0);
    const countEl = document.getElementById('contrib-count');
    if (countEl) {
      countEl.textContent = `${total.toLocaleString()} contributions in the last year`;
    }
  }

  formatMonth(monthStr) {
    const [year, month] = monthStr.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[parseInt(month) - 1];
  }

  formatDisplayDate(dateStr) {
    const date = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  }
}

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
  const calendar = document.getElementById('github-calendar');
  if (calendar) {
    new GitHubCalendar(calendar, { weeks: 20 });
  }
});
