import { gState, el } from '../state/store.js';
import { GOALS } from '../data/goals.js';
import { gLvl } from './engine.js';

export function openGoals() { renderGoals(); document.getElementById('goalsModal').classList.add('open'); }

export function renderGoals() {
  const g = gState(), lvl = gLvl();
  el('goalsList').innerHTML = GOALS.map(goal => {
    const done = (g.claimedGoals || []).includes(goal.id) || goal.check(g, lvl);
    return '<div class="goal-item' + (done ? ' done' : '') + '">' +
      '<div class="goal-icon">' + (done ? '✅' : '🎯') + '</div>' +
      '<div class="goal-body"><b>' + goal.ad + '</b><span>' + goal.desc + '</span></div>' +
      '<div class="goal-reward">+' + goal.reward + ' 🪙</div>' +
      '</div>';
  }).join('');
}
