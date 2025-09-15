// js/comb.js
import { FLOAT_TOLERANCE } from './constants.js';

export function aggregateCombo(combo) {
  const agg = {};
  combo.forEach(p => {
    const key = `${p.mg}-${p.half}`;
    if (!agg[key]) agg[key] = { mg: p.mg, half: p.half, count: 0 };
    agg[key].count++;
  });
  return Object.values(agg);
}

export function findComb(target, availablePills, allowHalf, minPillObjects, maxPillObjects) {
  const resultCombos = [];
  if (Math.abs(target) < FLOAT_TOLERANCE) {
    return minPillObjects === 0 ? [[]] : [];
  }

  function findRecursive(currentDose, currentCombo, pillIndex) {
    if (currentCombo.length > maxPillObjects || currentDose > target + FLOAT_TOLERANCE) return;
    if (Math.abs(currentDose - target) < FLOAT_TOLERANCE) {
      if (currentCombo.length >= minPillObjects) resultCombos.push(aggregateCombo(currentCombo));
      return;
    }
    if (pillIndex >= availablePills.length) return;

    const mg = availablePills[pillIndex];

    // whole pill
    currentCombo.push({ mg, half: false });
    findRecursive(currentDose + mg, currentCombo, pillIndex);
    currentCombo.pop();

    // half pill
    if (allowHalf) {
      currentCombo.push({ mg, half: true });
      findRecursive(currentDose + mg / 2, currentCombo, pillIndex);
      currentCombo.pop();
    }

    // skip this strength
    findRecursive(currentDose, currentCombo, pillIndex + 1);
  }

  findRecursive(0, [], 0);

  // unique + rule: only one half per strength
  const seen = new Set();
  return resultCombos.filter(combo => {
    for (const p of combo) if (p.half && p.count > 1) return false;
    const key = JSON.stringify(combo.sort((a,b)=>a.mg-b.mg));
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
