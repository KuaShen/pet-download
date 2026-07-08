/**
 * AI 桌宠下载站 — 市场页逻辑
 */

let allPets = [];
let currentFilter = 'all';
let currentSearch = '';

document.addEventListener('DOMContentLoaded', async () => {
  allPets = await loadPets();
  renderFilters();
  renderPets(allPets);
});

function renderFilters() {
  // 类型筛选
  const types = [
    { id: 'all', label: '全部', icon: '⊞' },
    { id: 'shimeji', label: 'Shimeji', icon: '🎭' },
    { id: 'ai', label: 'AI 智能', icon: '🤖' },
    { id: 'live2d', label: 'Live2D', icon: '🖌️' },
    { id: 'vrm', label: 'VRM/3D', icon: '🧊' },
    { id: 'tool', label: '工具类', icon: '🛠️' },
  ];

  const container = document.getElementById('filterTypes');
  container.innerHTML = types.map(t => `
    <button class="filter-btn ${t.id === currentFilter ? 'active' : ''}"
            data-filter="${t.id}"
            onclick="setFilter('${t.id}')">
      ${t.icon} ${t.label}
    </button>
  `).join('');
}

function setFilter(type) {
  currentFilter = type;

  // 更新按钮状态
  document.querySelectorAll('#filterTypes .filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === type);
  });

  applyFilters();
}

function onSearchInput(el) {
  currentSearch = el.value.toLowerCase().trim();
  applyFilters();
}

function applyFilters() {
  let filtered = [...allPets];

  // 类型筛选
  if (currentFilter !== 'all') {
    filtered = filtered.filter(p => p.type === currentFilter);
  }

  // 搜索
  if (currentSearch) {
    filtered = filtered.filter(p => {
      const name = p.name.toLowerCase();
      const summary = p.summary.toLowerCase();
      const tags = p.tags.join(' ').toLowerCase();
      const author = p.author.toLowerCase();
      return name.includes(currentSearch) ||
             summary.includes(currentSearch) ||
             tags.includes(currentSearch) ||
             author.includes(currentSearch);
    });
  }

  renderPets(filtered);
}

function renderPets(pets) {
  const container = document.getElementById('petGrid');
  const countEl = document.getElementById('resultCount');

  if (countEl) countEl.textContent = `共 ${pets.length} 款桌宠`;

  if (pets.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">🔍</div>
        <div class="empty-state-text">没有找到匹配的桌宠，换个关键词试试？</div>
      </div>
    `;
    return;
  }

  container.innerHTML = pets.map(pet => {
    const badge = getBadge(pet);
    const petEmoji = getPetEmoji(pet);
    return `
      <a class="pet-card" href="/pages/detail.html?id=${pet.id}">
        <div class="pet-card-image">
          ${pet.images && pet.images.length > 0
            ? `<img src="${pet.images[0]}" alt="${pet.name}">`
            : `<span>${petEmoji}</span>`
          }
          ${badge ? `<span class="pet-card-badge ${badge.cls}">${badge.text}</span>` : ''}
        </div>
        <div class="pet-card-body">
          <div class="pet-card-header">
            <div class="pet-card-name">${pet.name}</div>
            <div class="pet-card-rating">
              <span>★</span> ${pet.rating}
            </div>
          </div>
          <div class="pet-card-summary">${pet.summary}</div>
          <div class="pet-card-tags">
            ${pet.tags.slice(0, 3).map(t => {
              let extra = '';
              if (t === 'AI' || t === '智能') extra = 'pet-tag-ai';
              if (t === '热门') extra = 'pet-tag-hot';
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
  }).join('');
}
