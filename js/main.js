/**
 * AI 桌宠下载站 — 公共模块
 */

// --- 导航激活状态 ---
document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('.nav a');
  const currentPath = location.pathname;

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (currentPath.endsWith(href)) {
      link.classList.add('active');
    } else if (href === '/' || href === '/index.html' || href === '') {
      if (currentPath === '/' || currentPath.endsWith('/index.html')) {
        link.classList.add('active');
      }
    }
  });
});

// --- 工具函数 ---

/** 从 JSON 加载桌宠数据 */
async function loadPets() {
  const res = await fetch('/data/pets.json');
  return res.json();
}

/** 渲染星标评分 */
function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

/** 格式化下载数 */
function formatCount(n) {
  if (n >= 10000) return (n / 10000).toFixed(1) + '万';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}

/** 格式化日期 */
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** badge 类型判断 */
function getBadge(pet) {
  if (pet.tags.includes('智能') || pet.type === 'ai') return { text: 'AI', cls: 'badge-ai' };
  if (pet.tags.includes('热门') || pet.downloadCount > 10000) return { text: '热门', cls: 'badge-hot' };
  const days = (Date.now() - new Date(pet.date).getTime()) / 86400000;
  if (days < 14) return { text: '新', cls: 'badge-new' };
  return null;
}

/** 生成卡片可用的 emoji 占位（后续可改为真实图片） */
function getPetEmoji(pet) {
  const map = {
    'shimeji-miku': '🎤',
    'ai-nekomata': '🐱',
    'live2d-xiaoye': '🌸',
    'pixel-cat': '🐈',
    'ai-totoro': '🐻',
    'vroid-yuki': '❄️',
    'shimeji-hololive': '🎮',
    'pomodoro-penguin': '🐧',
    'desktop-rain': '🌧️',
    'ai-codex-mascot': '🤖',
  };
  return map[pet.id] || '🐾';
}

/** 判断是否为近期（14天内） */
function isNew(pet) {
  const days = (Date.now() - new Date(pet.date).getTime()) / 86400000;
  return days < 14;
}
