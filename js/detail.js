/**
 * AI 桌宠下载站 — 详情页逻辑
 */

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(location.search);
  const petId = params.get('id');

  if (!petId) {
    document.getElementById('detailContainer').innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🐾</div>
        <div class="empty-state-text">未指定桌宠 ID</div>
      </div>
    `;
    return;
  }

  try {
    const pets = await loadPets();
    const pet = pets.find(p => p.id === petId);

    if (!pet) {
      document.getElementById('detailContainer').innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🔍</div>
          <div class="empty-state-text">未找到该桌宠</div>
        </div>
      `;
      return;
    }

    renderDetail(pet);

    // 渲染相关推荐
    renderRelated(pets, pet);
  } catch (err) {
    document.getElementById('detailContainer').innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <div class="empty-state-text">加载失败，请稍后重试</div>
      </div>
    `;
  }
});

function renderDetail(pet) {
  const container = document.getElementById('detailContainer');
  const emoji = getPetEmoji(pet);

  // 更新页面标题
  document.title = `${pet.name} - AI 桌宠下载站`;

  container.innerHTML = `
    <!-- 面包屑 -->
    <div class="detail-breadcrumb">
      <a href="/">首页</a>
      <span>›</span>
      <a href="/pages/market.html">桌宠市场</a>
      <span>›</span>
      <span>${pet.name}</span>
    </div>

    <!-- 主体 -->
    <div class="detail-hero">
      <div class="detail-gallery">
        <span style="font-size: 100px;">${emoji}</span>
      </div>
      <div class="detail-info">
        <h1 class="detail-title">${pet.name}</h1>
        <div class="detail-author">作者：${pet.author} · v${pet.version}</div>

        <div class="detail-meta">
          <span class="detail-meta-item">
            <span>★</span> ${pet.rating} / 5.0
          </span>
          <span class="detail-meta-item">
            <span>⬇</span> ${formatCount(pet.downloadCount)} 下载
          </span>
          <span class="detail-meta-item">
            <span>📅</span> ${formatDate(pet.date)} 发布
          </span>
          <span class="detail-meta-item">
            <span>🏷️</span> ${pet.type.toUpperCase()}
          </span>
        </div>

        <div class="detail-tags">
          ${pet.tags.map(t => `<span class="pet-tag">${t}</span>`).join('')}
        </div>

        <p class="detail-description">${pet.description}</p>

        <div class="detail-platforms">
          ${pet.platforms.map(p => {
            const labels = { win: 'Windows', mac: 'macOS', linux: 'Linux' };
            return `<span class="platform-tag">${labels[p] || p}</span>`;
          }).join('')}
        </div>

        <div class="detail-actions">
          <a href="${pet.downloadUrl}" class="btn btn-primary" onclick="return handleDownload('${pet.id}')">
            ⬇ 下载 ${pet.name}
          </a>
          <button class="btn btn-secondary" onclick="alert('收藏功能即将上线')">
            ♡ 收藏
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderRelated(pets, currentPet) {
  const relatedContainer = document.getElementById('relatedPets');
  if (!relatedContainer) return;

  // 找同类型或共享标签的
  const related = pets
    .filter(p => p.id !== currentPet.id)
    .map(p => ({
      pet: p,
      score: p.type === currentPet.type ? 3 : 0 +
             p.tags.filter(t => currentPet.tags.includes(t)).length
    }))
    .sort((a, b) => b.score - a.score || b.pet.downloadCount - a.pet.downloadCount)
    .slice(0, 4);

  if (related.length === 0) {
    relatedContainer.innerHTML = '<p style="color: var(--text-muted);">暂无推荐</p>';
    return;
  }

  relatedContainer.innerHTML = related.map(({ pet }) => {
    const emoji = getPetEmoji(pet);
    return `
      <a class="pet-card" href="/pages/detail.html?id=${pet.id}">
        <div class="pet-card-image">
          <span>${emoji}</span>
        </div>
        <div class="pet-card-body">
          <div class="pet-card-header">
            <div class="pet-card-name">${pet.name}</div>
            <div class="pet-card-rating">★ ${pet.rating}</div>
          </div>
          <div class="pet-card-summary">${pet.summary}</div>
          <div class="pet-card-footer">
            <div class="pet-card-meta">
              <span>⬇ ${formatCount(pet.downloadCount)}</span>
            </div>
          </div>
        </div>
      </a>
    `;
  }).join('');
}

function handleDownload(petId) {
  // 占位：后续接入真实下载统计
  console.log('Download:', petId);
  return true;
}
