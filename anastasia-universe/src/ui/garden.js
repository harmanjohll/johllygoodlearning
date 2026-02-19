// ============================================================
//  GARDEN — Flower renderer with golden flower support
// ============================================================

function addGardenFlower(skillId, golden) {
  state.garden.push({
    type: golden ? 'golden' : 'flower',
    skill: skillId,
    emoji: golden ? GOLDEN_FLOWER : pick(FLOWER_EMOJIS),
    date: new Date().toISOString()
  });
}

function renderGarden() {
  const grid = document.getElementById('garden-grid');
  if (!grid) return;
  const plots = Math.max(30, state.garden.length + 10);
  let html = '';
  for (let i = 0; i < plots; i++) {
    if (i < state.garden.length) {
      const g = state.garden[i];
      const isGolden = g.type === 'golden';
      html += '<div class="garden-plot grown ' + (isGolden ? 'golden' : '') + '" title="' +
        (g.skill || '') + '">' + g.emoji + '</div>';
    } else {
      html += '<div class="garden-plot">\u00B7</div>';
    }
  }
  grid.innerHTML = html;
}

function getGardenFlowerCount() {
  return state.garden.length;
}

function getGoldenFlowerCount() {
  return state.garden.filter(g => g.type === 'golden').length;
}
