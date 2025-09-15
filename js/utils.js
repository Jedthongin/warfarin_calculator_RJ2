// js/utils.js
export function getAvailablePills(pillCheckboxes) {
  const selected = [];
  pillCheckboxes.forEach(cb => { if (cb.checked) selected.push(parseInt(cb.value)); });
  return selected.sort((a, b) => b - a);
}

export function getThaiDayIndex(jsDayIndex) {
  // Map Sunday(0) -> 6, Mon(1)->0 ... Sat(6)->5
  return (jsDayIndex === 0) ? 6 : jsDayIndex - 1;
}

export function makeDisplayOrder(mode) {
  // 'mon-sun' => [0..6], 'sun-sat' => [6,0..5]
  return mode === 'mon-sun' ? [0,1,2,3,4,5,6] : [6,0,1,2,3,4,5];
}
