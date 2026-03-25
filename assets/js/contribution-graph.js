/* ================================================
   GitHub 贡献日历组件
   渲染贡献热力图
   ================================================ */

class ContributionGraph {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.options = {
      username: options.username || 'TonyDDcui',
      weeks: options.weeks || 20,
      cellSize: options.cellSize || 13,
      gap: options.gap || 3,
      showLegend: options.showLegend !== false,
      showMonthLabels: options.showMonthLabels !== false,
      ...options
    };
    this.data = [];
    
    if (this.container) {
      this.init();
    }
  }

  async init() {
    await this.fetchData();
    this.render();
  }

  async fetchData() {
    try {
      // 生成模拟数据（实际项目中可调用 GitHub API）
      this.generateMockData();
    } catch (error) {
      console.error('Failed to fetch contribution data:', error);
      this.generateMockData();
    }
  }

  generateMockData() {
    const today = new Date();
    const weeks = this.options.weeks;
    
    // 生成最近 N 周的数据
    for (let w = weeks - 1; w >= 0; w--) {
      for (let d = 0; d < 7; d++) {
        const date = new Date(today);
        date.setDate(date.getDate() - (w * 7 + (6 - d)));
        
        // 跳过未来日期
        if (date > today) {
          this.data.push({ date: this.formatDate(date), count: 0 });
          continue;
        }
        
        // 模拟贡献数据（工作日更高）
        let baseProb = date.getDay() === 0 || date.getDay() === 6 ? 0.3 : 0.7;
        let count = 0;
        
        if (Math.random() < baseProb) {
          count = Math.floor(Math.random() * 10);
          if (Math.random() < 0.2) count += 10; // 偶尔有大贡献
        }
        
        this.data.push({
          date: this.formatDate(date),
          count,
          day: d
        });
      }
    }
  }

  formatDate(date) {
    return date.toISOString().split('T')[0];
  }

  render() {
    if (!this.container) return;

    const { cellSize, gap, showLegend, showMonthLabels } = this.options;
    
    // 计算统计
    const totalContribs = this.data.reduce((sum, d) => sum + d.count, 0);
    const activeDays = this.data.filter(d => d.count > 0).length;

    // 生成月份标签
    const months = this.getMonthLabels();

    let html = `
      <div class="contribution-graph">
        ${showMonthLabels ? `
          <div class="cal-header">
            <span class="cal-title">${totalContribs} contributions in the last year</span>
          </div>
        ` : ''}
        
        <div class="cal-graph">
          ${showMonthLabels ? `
            <div class="cal-labels">
              <span class="cal-label">Mon</span>
              <span class="cal-label"></span>
              <span class="cal-label">Wed</span>
              <span class="cal-label"></span>
              <span class="cal-label">Fri</span>
              <span class="cal-label"></span>
              <span class="cal-label"></span>
            </div>
          ` : ''}
          
          <div class="cal-weeks">
            ${this.renderWeeks(cellSize, gap)}
          </div>
        </div>
        
        ${showLegend ? `
          <div class="cal-footer">
            <span>Less</span>
            <div class="cal-legend">
              <span class="cal-legend-cell" style="background: var(--contrib-0)"></span>
              <span class="cal-legend-cell" style="background: var(--contrib-1)"></span>
              <span class="cal-legend-cell" style="background: var(--contrib-2)"></span>
              <span class="cal-legend-cell" style="background: var(--contrib-3)"></span>
              <span class="cal-legend-cell" style="background: var(--contrib-4)"></span>
            </div>
            <span>More</span>
          </div>
        ` : ''}
      </div>
    `;

    this.container.innerHTML = html;
  }

  renderWeeks(cellSize, gap) {
    const weeks = [];
    let currentWeek = [];

    this.data.forEach((day, index) => {
      currentWeek.push(day);
      
      if (currentWeek.length === 7 || index === this.data.length - 1) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    return weeks.map(week => `
      <div class="cal-week">
        ${week.map(day => this.renderDay(day, cellSize)).join('')}
      </div>
    `).join('');
  }

  renderDay(day, size) {
    const level = this.getLevel(day.count);
    const tooltip = `${day.count} contributions on ${day.date}`;

    return `
      <div 
        class="cal-day" 
        data-level="${level}"
        data-count="${day.count}"
        data-date="${day.date}"
        style="width: ${size}px; height: ${size}px;"
        title="${tooltip}"
      ></div>
    `;
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
    const seen = new Set();
    
    this.data.forEach(day => {
      const month = day.date.substring(0, 7);
      if (!seen.has(month)) {
        seen.add(month);
        months.push(month);
      }
    });
    
    return months;
  }
}

// ===== 迷你版贡献图（用于首页） =====
class MiniContributionGraph {
  constructor(container) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    if (this.container) {
      this.render();
    }
  }

  render() {
    if (!this.container) return;

    const cells = [];
    // 生成 52 周的数据
    for (let i = 0; i < 52 * 7; i++) {
      const random = Math.random();
      let level = 0;
      if (random > 0.5) level = 1;
      if (random > 0.7) level = 2;
      if (random > 0.85) level = 3;
      if (random > 0.95) level = 4;
      cells.push(level);
    }

    this.container.innerHTML = cells.map(level => 
      `<div class="mini-cell" data-level="${level}"></div>`
    ).join('');
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  // 完整版
  const fullGraph = document.getElementById('contribution-graph');
  if (fullGraph) {
    new ContributionGraph(fullGraph);
  }

  // 迷你版
  const miniGraph = document.getElementById('contribution-mini');
  if (miniGraph) {
    new MiniContributionGraph(miniGraph);
  }
});
