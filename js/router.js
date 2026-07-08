/**
 * AI 桌宠下载站 — SPA 路由系统
 *
 * 支持自定义路径（如 /pet/shimeji-miku /market /category/ai）
 * 结合 History API，实现无刷新页面切换 + 浏览器前进/后退。
 *
 * --- 自定义路径示例 ---
 *   router.add('/pet/:id',      PetDetailHandler)
 *   router.add('/market',       MarketHandler)
 *   router.add('/market/:type', MarketHandler)
 *   router.add('/about',        AboutHandler)
 *   router.add('/custom/:slug', CustomHandler)
 *
 * 每个 handler 接收 { params, search, hash } 对象。
 */

class AppRouter {
  constructor() {
    this.routes = [];
    this.bound = false;
    this._onRouteChange = null;
  }

  /**
   * 注册路由
   * @param {string} pattern  URL 模式，如 '/pet/:id'、'/market/:type'
   * @param {Function} handler  路由处理函数 (ctx) => void
   * @param {object} [meta]     可选元数据（用于导航高亮等）
   */
  add(pattern, handler, meta) {
    this.routes.push({ pattern, handler, meta });
    return this;
  }

  /** 绑定事件（首次调用时自动绑定） */
  _bind() {
    if (this.bound) return;
    this.bound = true;

    // 拦截站内链接点击
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (!link) return;

      const href = link.getAttribute('href');
      // 跳过外部链接、锚点、有 target 的链接、下载链接
      if (!href ||
          href.startsWith('http://') ||
          href.startsWith('https://') ||
          href.startsWith('#') ||
          href.startsWith('mailto:') ||
          link.hasAttribute('download') ||
          link.target === '_blank') {
        return;
      }

      // 跳过已显式标注 data-router="ignore" 的链接
      if (link.dataset.router === 'ignore') return;

      e.preventDefault();
      this.navigate(href);
    });

    // 监听浏览器前进/后退
    window.addEventListener('popstate', () => this._resolve());
  }

  /** 导航到指定路径 */
  navigate(path) {
    history.pushState(null, '', path);
    this._resolve();
  }

  /** 替换当前路径（不产生历史记录） */
  replace(path) {
    history.replaceState(null, '', path);
    this._resolve();
  }

  /** 解析当前 URL 并执行匹配的路由 */
  _resolve() {
    const path = location.pathname;
    const searchStr = location.search;
    const hash = location.hash.slice(1);

    // 解析 search string
    const search = {};
    if (searchStr) {
      const params = new URLSearchParams(searchStr);
      for (const [k, v] of params) {
        search[k] = v;
      }
    }

    for (const route of this.routes) {
      const match = this._matchPattern(route.pattern, path);
      if (match) {
        const ctx = {
          params: match.params,
          search,
          hash,
          path,
          pattern: route.pattern,
          meta: route.meta || {},
        };
        // 更新导航高亮
        this._updateNav(route.meta?.navKey || '');
        // 执行 handler
        route.handler(ctx);
        // 滚动到顶部（除 hash 导航外）
        if (!hash) window.scrollTo(0, 0);
        return;
      }
    }

    // 无匹配 → 404
    this._renderNotFound(path);
  }

  /**
   * 将 URL 模式与真实路径匹配
   * '/pet/:id' + '/pet/shimeji-miku' => { params: { id: 'shimeji-miku' } }
   */
  _matchPattern(pattern, path) {
    const paramNames = [];
    const regexStr = pattern
      .replace(/\/:([^/]+)/g, (_, name) => {
        paramNames.push(name);
        return '/([^/]+)';
      })
      .replace(/\//g, '\\/');
    const regex = new RegExp(`^${regexStr}$`);
    const m = path.match(regex);
    if (!m) return null;

    const params = {};
    paramNames.forEach((name, i) => {
      params[name] = decodeURIComponent(m[i + 1]);
    });
    return { params };
  }

  /** 导航高亮 */
  _updateNav(activeKey) {
    document.querySelectorAll('.nav a').forEach(a => {
      const key = a.dataset.navKey || a.getAttribute('href') || '';
      a.classList.toggle('active', key === activeKey || key === location.pathname);
    });
  }

  /** 404 页面 */
  _renderNotFound(path) {
    const app = document.getElementById('app');
    if (!app) return;
    app.innerHTML = `
      <section class="section" style="text-align:center;padding:100px 24px;">
        <div style="font-size:64px;margin-bottom:16px;">🔍</div>
        <h1 style="font-size:28px;margin-bottom:8px;">页面未找到</h1>
        <p style="color:var(--text-muted);margin-bottom:24px;">
          路径 <code style="background:var(--bg-elevated);padding:2px 8px;border-radius:4px;">${path}</code> 不存在
        </p>
        <a href="/" class="btn btn-primary">返回首页</a>
      </section>
    `;
  }

  /** 启动路由：绑定事件 + 解析当前路径 */
  start() {
    this._bind();
    this._resolve();
  }
}

// 创建全局路由实例
const router = new AppRouter();
