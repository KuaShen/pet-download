/**
 * AI 桌宠下载站 — 页面模板系统
 *
 * 所有页面组件化渲染，支持自定义扩展。
 * 模板设计为纯函数，接收数据返回 HTML 字符串。
 *
 * --- 如何使用 ---
 *   // 1. 定义新模板
 *   Templates.myPage = (data) => Templates.page(`
 *     <h1>${data.title}</h1>
 *     ...
 *   `);
 *
 *   // 2. 注册路由
 *   router.add('/my-page', (ctx) => {
 *     document.getElementById('app').innerHTML = Templates.myPage({ title: 'Hello' });
 *   });
 *
 *   // 3. 页面内链接
 *   <a href="/my-page">跳转</a>  ← 自动被 router 拦截
 *
 * --- 内置页面模板 ---
 *   Templates.homePage(data)    首页
 *   Templates.marketPage(data)  市场/搜索页
 *   Templates.detailPage(pet)   详情页
 *   Templates.categoryPage()    分类页面（占位）
 *   Templates.aboutPage()       关于页面
 *   Templates.blankShell()      空白模板，供自定义
 */

const Templates = {
  // ==========================================
  // 核心布局
  // ==========================================

  /** 完整页面外壳（header + main + footer） */
  page(content, opts = {}) {
    const title = opts.title ? ` — ${opts.title}` : '';
    return `
      <header class="header">
        <div class="header-inner">
          <a href="/" class="logo" onclick="event.preventDefault();router.navigate('/')">
            <span class="logo-icon">🐾</span>
            AI 桌宠
          </a>
          <nav class="nav">
            <a href="/"          data-nav-key="/">首页</a>
            <a href="/market"    data-nav-key="/market">桌宠市场</a>
            <a href="/about"     data-nav-key="/about">关于</a>
          </nav>
        </div>
      </header>
      <main class="page" id="appMain">${content}</main>
      <footer class="footer">
        <div class="footer-inner">
          <div class="footer-text">AI 桌宠下载站 · 发现桌面上的小伙伴</div>
          <div class="footer-links">
            <a href="/about">关于</a>
            <a href="/faq">FAQ</a>
            <a href="/submit">提交桌宠</a>
          </div>
        </div>
      </footer>
    `;
  },

  /** 仅内容区域（不包含 header/footer，用于页面内更新） */
  partial(content) {
    return `<div class="page">${content}</div>`;
  },

  // ==========================================
  // 通用组件
  // ==========================================

  /** 桌宠卡片（市场格子、相关推荐等处复用） */
  petCard(pet) {
    const badge = getBadge(pet);
    const emoji = getPetEmoji(pet);
    return `
      <a class="pet-card" href="/pet/${pet.id}" onclick="event.preventDefault();router.navigate('/pet/${pet.id}')">
        <div class="pet-card-image">
          ${pet.images?.length ? `<img src="${pet.images[0]}" alt="${pet.name}">` : `<span>${emoji}</span>`}
          ${badge ? `<span class="pet-card-badge ${badge.cls}">${badge.text}</span>` : ''}
        </div>
        <div class="pet-card-body">
          <div class="pet-card-header">
            <div class="pet-card-name">${pet.name}</div>
            <div class="pet-card-rating"><span>★</span> ${pet.rating}</div>
          </div>
          <div class="pet-card-summary">${pet.summary}</div>
          <div class="pet-card-tags">
            ${pet.tags.slice(0, 3).map(t => {
              let extra = (t === 'AI' || t === '智能') ? 'pet-tag-ai' : (t === '热门' ? 'pet-tag-hot' : '');
              return `<span class="pet-tag ${extra}">${t}</span>`;
            }).join('')}
            ${pet.tags.length > 3 ? `<span class="pet-tag">+${pet.tags.length - 3}</span>` : ''}
          </div>
          <div class="pet-card-footer">
            <div class="pet-card-meta">
              <span>⬇ ${formatCount(pet.downloadCount)}</span>
              <span>📅 ${formatDate(pet.date)}</span>
            </div>
          </div>
        </div>
      </a>
    `;
  },

  /** 精选推荐卡片（首页横向滚动） */
  featuredCard(pet) {
    const emoji = getPetEmoji(pet);
    return `
      <a class="featured-card" href="/pet/${pet.id}" onclick="event.preventDefault();router.navigate('/pet/${pet.id}')">
        <div class="featured-card-image"><span>${emoji}</span></div>
        <div class="featured-card-body">
          <div class="featured-card-name">${pet.name}</div>
          <div class="featured-card-summary">${pet.summary}</div>
          <div class="pet-card-footer" style="border:none;padding-top:8px;">
            <div class="pet-card-meta">
              <span>★ ${pet.rating}</span>
              <span>⬇ ${formatCount(pet.downloadCount)}</span>
            </div>
          </div>
        </div>
      </a>
    `;
  },

  /** 分类卡片 */
  categoryCard(cat, count) {
    return `
      <a class="category-card" href="/market?type=${cat.id}" onclick="event.preventDefault();router.navigate('/market?type=${cat.id}')">
        <div class="category-icon">${cat.icon}</div>
        <div class="category-name">${cat.name}</div>
        <div class="category-count">${count} 款 · ${cat.desc}</div>
      </a>
    `;
  },

  /** 面包屑导航 */
  breadcrumb(items) {
    return `
      <div class="detail-breadcrumb">
        ${items.map((item, i) => {
          if (i === items.length - 1) return `<span>${item.label}</span>`;
          return `<a href="${item.url}" onclick="event.preventDefault();router.navigate('${item.url}')">${item.label}</a><span>›</span>`;
        }).join('')}
      </div>
    `;
  },

  /** 空状态 */
  emptyState(icon, text) {
    return `
      <div class="empty-state" style="grid-column:1/-1;">
        <div class="empty-state-icon">${icon}</div>
        <div class="empty-state-text">${text}</div>
      </div>
    `;
  },

  /** 标签列表 */
  tagList(tags) {
    return tags.map(t => `<span class="pet-tag">${t}</span>`).join('');
  },

  /** 平台标签 */
  platformTags(platforms) {
    const labels = { win: 'Windows', mac: 'macOS', linux: 'Linux' };
    return platforms.map(p => `<span class="platform-tag">${labels[p] || p}</span>`).join('');
  },

  // ==========================================
  // 页面模板
  // ==========================================

  /** 首页 */
  homePage(data) {
    const { pets, featured, recent } = data;

    // 统计
    const totalTypes = new Set(pets.map(p => p.type)).size;

    // 分类
    const categories = [
      { id: 'shimeji', name: 'Shimeji',  icon: '🎭', desc: '经典桌面宠物' },
      { id: 'ai',      name: 'AI 智能',  icon: '🤖', desc: '能聊天的桌宠' },
      { id: 'live2d',  name: 'Live2D',   icon: '🖌️', desc: '精致 2D 互动' },
      { id: 'vrm',     name: 'VRM / 3D', icon: '🧊', desc: '3D 模型桌宠' },
      { id: 'tool',    name: '工具类',    icon: '🛠️', desc: '效率工具桌宠' },
    ];

    return this.page(`
      <!-- Hero -->
      <section class="hero">
        <div class="hero-inner">
          <h1>给桌面添个小伙伴</h1>
          <p>
            从经典 Shimeji 到 AI 智能桌宠，发现各种可爱的桌面宠物。<br>
            让它们陪你写代码、追番、摸鱼。
          </p>
          <div class="hero-actions">
            <a href="/market" class="btn btn-primary" onclick="event.preventDefault();router.navigate('/market')">
              浏览所有桌宠 →
            </a>
          </div>
          <div class="hero-stats">
            <div class="hero-stat">
              <div class="hero-stat-value">${pets.length}</div>
              <div class="hero-stat-label">款桌宠</div>
            </div>
            <div class="hero-stat">
              <div class="hero-stat-value">${formatCount(pets.reduce((s, p) => s + p.downloadCount, 0))}</div>
              <div class="hero-stat-label">总下载</div>
            </div>
            <div class="hero-stat">
              <div class="hero-stat-value">${totalTypes}</div>
              <div class="hero-stat-label">种类型</div>
            </div>
          </div>
        </div>
      </section>

      <!-- 精选推荐 -->
      <section class="section featured-section">
        <div class="section-header">
          <div>
            <h2 class="section-title">🔥 精选推荐</h2>
            <p class="section-subtitle">编辑精心挑选的热门桌宠</p>
          </div>
          <a href="/market" class="btn btn-ghost" onclick="event.preventDefault();router.navigate('/market')">查看全部 →</a>
        </div>
        <div class="featured-scroll">
          ${featured.map(p => this.featuredCard(p)).join('')}
        </div>
      </section>

      <!-- 分类 -->
      <section class="section">
        <div class="section-header">
          <div>
            <h2 class="section-title">📂 分类浏览</h2>
            <p class="section-subtitle">按类型找到你喜欢的桌宠</p>
          </div>
        </div>
        <div class="categories">
          ${categories.map(c => this.categoryCard(c, pets.filter(p => p.type === c.id).length)).join('')}
        </div>
      </section>

      <!-- 最近更新 -->
      <section class="section">
        <div class="section-header">
          <div>
            <h2 class="section-title">🆕 最近更新</h2>
            <p class="section-subtitle">最新上架的桌宠资源</p>
          </div>
          <a href="/market" class="btn btn-ghost" onclick="event.preventDefault();router.navigate('/market')">查看全部 →</a>
        </div>
        <div class="pet-grid">
          ${recent.map(p => this.petCard(p)).join('')}
        </div>
      </section>
    `, { title: '发现可爱的桌面小伙伴' });
  },

  /** 市场页（搜索 + 筛选 + 网格） */
  marketPage(data) {
    const { pets, currentFilter, currentSearch, resultCount } = data;
    const types = [
      { id: 'all',     label: '全部',    icon: '⊞' },
      { id: 'shimeji', label: 'Shimeji', icon: '🎭' },
      { id: 'ai',      label: 'AI 智能', icon: '🤖' },
      { id: 'live2d',  label: 'Live2D',  icon: '🖌️' },
      { id: 'vrm',     label: 'VRM/3D',  icon: '🧊' },
      { id: 'tool',    label: '工具类',   icon: '🛠️' },
    ];

    return this.page(`
      <section class="section">
        <div class="section-header">
          <div>
            <h1 class="section-title">📦 桌宠市场</h1>
            <p class="section-subtitle" id="resultCount">共 ${resultCount} 款桌宠</p>
          </div>
        </div>

        <div class="market-toolbar">
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input type="text" id="searchInput"
                   placeholder="搜索桌宠名称、标签、作者..."
                   value="${currentSearch}"
                   oninput="MarketPage.search(this.value)">
          </div>
          <div class="filter-group" id="filterTypes">
            ${types.map(t => `
              <button class="filter-btn ${currentFilter === t.id ? 'active' : ''}"
                      onclick="MarketPage.filter('${t.id}')">${t.icon} ${t.label}</button>
            `).join('')}
          </div>
        </div>

        <div class="pet-grid" id="petGrid">
          ${pets.length
            ? pets.map(p => this.petCard(p)).join('')
            : this.emptyState('🔍', '没有找到匹配的桌宠，换个关键词试试？')
          }
        </div>
      </section>
    `, { title: '桌宠市场' });
  },

  /** 详情页 */
  detailPage(pet) {
    const emoji = getPetEmoji(pet);
    document.title = `${pet.name} — AI 桌宠下载站`;

    return this.page(`
      <div class="detail-container">
        ${this.breadcrumb([
          { label: '首页',     url: '/' },
          { label: '桌宠市场', url: '/market' },
          { label: pet.name },
        ])}

        <div class="detail-hero">
          <div class="detail-gallery" style="font-size:100px;">
            <span>${emoji}</span>
          </div>
          <div class="detail-info">
            <h1 class="detail-title">${pet.name}</h1>
            <div class="detail-author">作者：${pet.author} · v${pet.version}</div>

            <div class="detail-meta">
              <span class="detail-meta-item"><span>★</span> ${pet.rating} / 5.0</span>
              <span class="detail-meta-item"><span>⬇</span> ${formatCount(pet.downloadCount)} 下载</span>
              <span class="detail-meta-item"><span>📅</span> ${formatDate(pet.date)} 发布</span>
              <span class="detail-meta-item"><span>🏷️</span> ${pet.type.toUpperCase()}</span>
            </div>

            <div class="detail-tags">${this.tagList(pet.tags)}</div>
            <p class="detail-description">${pet.description}</p>

            <div class="detail-platforms">${this.platformTags(pet.platforms)}</div>

            <div class="detail-actions">
              <a href="${pet.downloadUrl}" class="btn btn-primary">
                ⬇ 下载 ${pet.name}
              </a>
              <button class="btn btn-secondary" onclick="alert('收藏功能即将上线')">♡ 收藏</button>
            </div>
          </div>
        </div>
      </div>
    `, { title: pet.name });
  },

  /** 关于页 */
  aboutPage() {
    return this.page(`
      <section class="section" style="max-width:720px;">
        <h1 class="section-title" style="margin-bottom:24px;">📖 关于 AI 桌宠下载站</h1>

        <div style="color:var(--text-secondary);font-size:15px;line-height:1.9;">
          <p style="margin-bottom:16px;">
            <strong style="color:var(--text-primary);">AI 桌宠下载站</strong> 是一个专注于桌宠资源的垂直下载平台，
            从经典 Shimeji 到 AI 智能桌宠，我们致力于让每个桌面都有一只可爱的小伙伴。
          </p>
          <p style="margin-bottom:16px;">
            桌宠文化最早可以追溯到 2000 年代初的 Shimeji 和桌面宠物软件。
            进入 AI 时代，桌宠正在经历新生——它们可以对话、感知上下文、甚至陪你工作。
            我们希望成为这个生态的汇聚点。
          </p>

          <h3 style="color:var(--text-primary);margin:24px 0 12px;">🎯 我们的目标</h3>
          <ul style="padding-left:20px;margin-bottom:16px;">
            <li style="margin-bottom:8px;">做桌宠领域的垂直门户，用户找资源不再靠缘分</li>
            <li style="margin-bottom:8px;">扶持桌宠创作者，提供展示和分发的渠道</li>
            <li style="margin-bottom:8px;">推动 AI 桌宠生态，让桌面宠物真正"活"起来</li>
          </ul>

          <h3 style="color:var(--text-primary);margin:24px 0 12px;">🤝 联系我们</h3>
          <p>
            想提交你的桌宠作品？有合作意向？或者单纯想聊聊天？
            <br>欢迎通过 GitHub Issues 或邮件联系我们。
          </p>
        </div>
      </section>
    `, { title: '关于' });
  },

  // ==========================================
  // 自定义模板入口
  // ==========================================

  /**
   * 空白页面壳子 —— 你想加什么新页面都可以用这个起手
   *
   * 用法：
   *   router.add('/my-custom-page', (ctx) => {
   *     const html = Templates.blankShell(`
   *       <h1>我的自定义页面</h1>
   *       <p>这里可以写任何 HTML 内容</p>
   *     `);
   *     document.getElementById('app').innerHTML = html;
   *   });
   *
   * 想更进阶？直接调用 Templates.page(你的内容) 来自定义 header/footer。
   */
  blankShell(content) {
    return this.page(`
      <section class="section">${content}</section>
    `);
  },
};
