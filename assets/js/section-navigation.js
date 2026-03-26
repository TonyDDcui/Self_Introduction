/**
 * 姹夊牎鑿滃崟 - 鏃犵煩褰㈡ + 姣斾緥灞呬腑
 * 绠€娲佽璁? */

(function() {
  'use strict';

  // 鏉垮潡閰嶇疆
  const SECTIONS = [
    { id: 'hero', icon: '馃彔', name: '棣栭〉' },
    { id: 'about', icon: '馃懁', name: '鍏充簬' },
    { id: 'skills', icon: '鈿?, name: '鎶€鑳? },
    { id: 'projects', icon: '馃殌', name: '椤圭洰' },
    { id: 'certificates', icon: '馃弲', name: '鑽ｈ獕' },
    { id: 'life', icon: '馃摲', name: '鐢熸椿' },
    { id: 'quotes', icon: '馃挱', name: '濂藉彞' },
    { id: 'guestbook', icon: '鉁嶏笍', name: '鐣欒█' },
    { id: 'contact', icon: '鉁夛笍', name: '鑱旂郴' }
  ];

  // 鍒濆鍖?  function init() {
    const sidebar = document.getElementById('nav-sidebar');
    if (!sidebar) return;

    // 娓呯┖鐜版湁鍐呭
    const navLinks = sidebar.querySelector('.nav-links');
    if (navLinks) {
      navLinks.innerHTML = '';
    }

    // 娣诲姞鏉垮潡瀵艰埅
    addSectionNav(sidebar);
    
    // 娣诲姞鍒嗛殧绾?    addDivider(sidebar);
    
    // 娣诲姞 GitHub 鍏ュ彛锛堝簳閮級
    addGitHubLink(sidebar);
    
    // 鍒濆鍖栨粴鍔ㄧ洃鍚?    initScrollSpy();
    
    // 娣诲姞鏍峰紡
    addStyles();
  }

  // 娣诲姞鏉垮潡瀵艰埅
  function addSectionNav(sidebar) {
    const navContainer = document.createElement('div');
    navContainer.className = 'section-nav-container';
    navContainer.innerHTML = `
      <div class="nav-section-title">瀵艰埅</div>
      <div class="nav-list">
        ${SECTIONS.map(section => `
          <a href="#${section.id}" class="nav-item" data-section="${section.id}">
            <span class="nav-icon">${section.icon}</span>
            <span class="nav-name">${section.name}</span>
          </a>
        `).join('')}
      </div>
    `;

    const navLinks = sidebar.querySelector('.nav-links') || sidebar;
    navLinks.appendChild(navContainer);

    // 缁戝畾鐐瑰嚮浜嬩欢
    navContainer.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').slice(1);
        const target = document.getElementById(targetId);
        
        if (target) {
          closeSidebar();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // 娣诲姞鍒嗛殧绾?  function addDivider(sidebar) {
    const divider = document.createElement('div');
    divider.className = 'nav-divider';
    
    const navLinks = sidebar.querySelector('.nav-links') || sidebar;
    navLinks.appendChild(divider);
  }

  // 娣诲姞 GitHub 鍏ュ彛锛堟斁搴曢儴锛?  function addGitHubLink(sidebar) {
    const githubSection = document.createElement('div');
    githubSection.className = 'github-section';
    githubSection.innerHTML = `
      <div class="github-section-title">寮€鍙戣€?/div>
      <a href="https://github.com/TonyDDcui" target="_blank" rel="noopener" class="github-link">
        <span class="github-icon">馃悪</span>
        <span class="github-name">TonyDDcui</span>
      </a>
    `;

    const navLinks = sidebar.querySelector('.nav-links') || sidebar;
    navLinks.appendChild(githubSection);
  }

  // 鍏抽棴渚ц竟鏍?  function closeSidebar() {
    const sidebar = document.getElementById('nav-sidebar');
    const overlay = document.getElementById('nav-overlay');
    const hamburger = document.getElementById('hamburger-btn');
    
    if (sidebar) {
      sidebar.classList.remove('open');
      sidebar.setAttribute('aria-hidden', 'true');
    }
    
    if (overlay) overlay.classList.remove('active');
    if (hamburger) hamburger.classList.remove('active');
    document.body.style.overflow = '';
  }

  // 婊氬姩鐩戝惉
  function initScrollSpy() {
    const items = document.querySelectorAll('.nav-item');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          items.forEach(item => {
            item.classList.toggle('active', item.dataset.section === sectionId);
          });
        }
      });
    }, {
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    });

    SECTIONS.forEach(section => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });
  }

  // 娣诲姞鏍峰紡
  function addStyles() {
    if (document.getElementById('clean-nav-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'clean-nav-styles';
    style.textContent = `
      /* ============================================
         绠€娲佸鑸?- 鏃犵煩褰㈡
         ============================================ */

      /* 瀵艰埅瀹瑰櫒 */
      .section-nav-container {
        padding: 24px 32px;
      }

      /* 鏉垮潡鏍囬 */
      .nav-section-title {
        text-align: center;
        font-size: 13px;
        font-weight: 600;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 20px;
      }

      /* 鍒楄〃 - 鏃犵煩褰㈡ */
      .nav-list {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      /* 瀵艰埅椤?- 绠€娲佽璁?*/
      .nav-item {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 14px 20px;
        text-decoration: none;
        color: var(--text-primary);
        transition: all 0.2s ease;
        border-radius: 12px;
      }

      .nav-item:hover {
        background: rgba(255, 255, 255, 0.05);
      }

      .nav-item:active {
        background: rgba(255, 255, 255, 0.08);
        transform: scale(0.98);
      }

      .nav-item.active {
        background: rgba(88, 166, 255, 0.12);
      }

      .nav-item.active .nav-name {
        color: var(--accent-primary);
        font-weight: 600;
      }

      /* 鍥炬爣 */
      .nav-item .nav-icon {
        font-size: 22px;
        width: 32px;
        text-align: center;
      }

      /* 鍚嶇О */
      .nav-item .nav-name {
        font-size: 16px;
        font-weight: 500;
        width: 60px;
        letter-spacing: -0.2px;
      }

      /* ============================================
         鍒嗛殧绾?         ============================================ */
      
      .nav-divider {
        height: 1px;
        margin: 16px 32px;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.1),
          transparent
        );
      }

      /* ============================================
         GitHub 鍖哄煙锛堝簳閮級
         ============================================ */
      
      .github-section {
        padding: 0 32px 24px;
      }

      .github-section-title {
        text-align: center;
        font-size: 13px;
        font-weight: 600;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 12px;
      }

      .github-link {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding: 14px 20px;
        text-decoration: none;
        color: inherit;
        transition: all 0.2s ease;
        border-radius: 12px;
      }

      .github-link:hover {
        background: rgba(88, 166, 255, 0.1);
      }

      .github-icon {
        font-size: 22px;
      }

      .github-name {
        font-size: 16px;
        font-weight: 600;
        color: var(--accent-primary);
      }

      /* ============================================
         绉诲姩绔紭鍖?         ============================================ */
      
      @media (max-width: 768px) {
        .section-nav-container {
          padding: 20px 24px;
        }

        .nav-item {
          padding: 12px 16px;
        }

        .nav-item .nav-icon {
          font-size: 20px;
        }

        .nav-item .nav-name {
          font-size: 15px;
        }

        .nav-divider {
          margin: 12px 24px;
        }

        .github-section {
          padding: 0 24px 20px;
        }
      }

      /* 灏忓睆骞曟墜鏈?*/
      @media (max-width: 380px) {
        .section-nav-container {
          padding: 16px 20px;
        }

        .nav-item {
          padding: 10px 14px;
        }

        .nav-item .nav-icon {
          font-size: 18px;
          width: 28px;
        }

        .nav-item .nav-name {
          font-size: 14px;
          width: 56px;
        }

        .github-section {
          padding: 0 20px 16px;
        }
      }

      /* 渚ц竟鏍忓鍣?*/
      #nav-sidebar {
        background: rgba(13, 17, 23, 0.98);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
      }

      /* 婊氬姩鏉＄編鍖?*/
      #nav-sidebar::-webkit-scrollbar {
        width: 4px;
      }

      #nav-sidebar::-webkit-scrollbar-track {
        background: transparent;
      }

      #nav-sidebar::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 2px;
      }
    `;
    document.head.appendChild(style);
  }

  // 鍒濆鍖?  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
