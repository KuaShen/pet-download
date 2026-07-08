# 🐾 AI 桌宠下载站

一个专注于桌宠资源（从经典 Shimeji 到 AI 智能桌宠）的垂直下载与展示平台。

## ✨ 特色

- **分类齐全** — Shimeji / AI 智能 / Live2D / VRM 3D / 工具类
- **实时搜索** — 按名称、标签、作者快速找到想要的桌宠
- **精选推荐** — 编辑精选热门桌宠，首页轮播展示
- **轻量部署** — 纯静态站点，GitHub Pages / Vercel 一键部署
- **暗色主题** — 对二次元和开发者友好的沉浸式暗色 UI


## 🌐 自定义路径与模板系统

本站内置 SPA 路由系统，URL 路径与页面完全自定义：

| 路由 | 说明 | 模板 |
|------|------|------|
| `/` | 首页 | Templates.homePage() |
| `/market` | 桌宠市场（搜索/筛选） | Templates.marketPage() |
| `/market/:type` | 按类型筛选 | Templates.marketPage() |
| `/pet/:id` | 桌宠详情页 | Templates.detailPage() |
| `/about` | 关于页面 | Templates.aboutPage() |
| `/faq` | 常见问题 | Templates.blankShell() |
| `/submit` | 提交桌宠 | Templates.blankShell() |

### 如何添加自定义页面

```js
// 1. 在 templates.js 里定义新模板（或用 blankShell 快速起步）
Templates.myPage = (data) => Templates.blankShell(`
  <h1>${data.title}</h1>
  <p>${data.content}</p>
`);

// 2. 在 index.html 的内联脚本里注册路由
router.add('/my-custom-path', (ctx) => {
  document.getElementById('app').innerHTML =
    Templates.myPage({ title: 'Hello', content: '你的内容' });
});
```
桌宠下载/
├── 计划书.md        # 项目蓝皮书
├── README.md         # 项目说明
├── server.js         # 开发服务器（SPA 回退，零依赖）
├── index.html        # SPA 入口 — 所有页面从这里加载
├── pages/            # （可选）传统直接访问页面
│   ├── market.html
│   └── detail.html
├── css/
│   └── style.css     # 全局样式 + CSS 变量主题
├── js/
│   ├── main.js       # 公共工具函数
│   ├── router.js     # SPA 路由系统
│   ├── templates.js  # 页面模板系统 + 空白壳子
│   └── market.js     # （保留）市场页独立版
├── data/
│   └── pets.json     # 桌宠数据库（10 款示例）
└── assets/
    ├── images/
    └── icons/
```


├── 计划书.md        # 项目蓝皮书（需求、架构、路线图）
├── README.md         # 项目说明
├── index.html        # 首页
├── pages/
│   ├── market.html   # 桌宠市场（浏览/搜索/筛选）
│   └── detail.html   # 桌宠详情页
├── css/
│   └── style.css     # 全局样式 + CSS 变量主题
├── js/
│   ├── main.js       # 公共函数（数据加载、工具函数）
│   ├── market.js     # 市场页逻辑
│   └── detail.js     # 详情页逻辑
├── data/
│   └── pets.json     # 桌宠数据库（10 款示例数据）
└── assets/
    ├── images/
    └── icons/
```


## 🚀 快速启动

### 方式一：使用内置开发服务器（推荐，支持 SPA 路由）

```bash
node server.js
# 浏览器打开 http://localhost:3000
# 支持直接访问 /pet/xxx、/market、/about 等路径
```

### 方式二：Python 服务器（传统方式）

```bash
python3 -m http.server 8080
# 浏览器打开 http://localhost:8080
# 注意：此方式不支持 SPA 路由刷新，仅用于直接访问 HTML 文件
```
## 📦 部署

### GitHub Pages

```bash
# 推送到 GitHub 仓库后，在仓库 Settings > Pages 中选择 main 分支即可
```

### Vercel

```bash
# 导入项目到 Vercel，框架选 "Other"，直接部署
```

## 🗺️ 路线图

- **Phase 1 (MVP)** — 首页 + 市场 + 详情 + 10+ 桌宠数据 ✅
- **Phase 2** — 用户系统、评分评论、创作者中心
- **Phase 3** — AI 桌宠专区、在线预览、统一安装器

详见 [计划书.md](计划书.md)。

## 📄 许可

本项目采用 MIT 许可证。桌宠资源版权归各自作者所有。
