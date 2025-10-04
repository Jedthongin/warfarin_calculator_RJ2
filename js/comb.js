// js/comb.js
// ใช้คณิตศาสตร์จำนวนเต็ม (คูณ 2) เพื่อตัด floating error
// API เดิมยังเหมือนเดิม: aggregateCombo(), findComb()

import { FLOAT_TOLERANCE } from './constants.js';

/** รวมรายการยาที่ได้เป็นรูป { mg, half, count } */
export function aggregateCombo(combo) {
  const agg = {};
  combo.forEach(p => {
    const key = `${p.mg}-${p.half ? 1 : 0}`;
    if (!agg[key]) agg[key] = { mg: p.mg, half: !!p.half, count: 0 };
    agg[key].count++;
  });
  return Object.values(agg);
}

/**
 * ค้นหาชุดเม็ดยาให้ได้ target (mg) จากขนาดที่มีอยู่
 * - availablePills: [2,3,5] (mg)
 * - allowHalf: อนุญาตครึ่งเม็ด
 * - minPillObjects, maxPillObjects: จำนวนชิ้นขั้นต่ำ/ขั้นสูงสุด (รวม whole และ half เป็นชิ้น)
 * คืนค่า: Array ของ combo แบบ aggregate [{mg, half, count}, ...]
 */
export function findComb(target, availablePills, allowHalf, minPillObjects, maxPillObjects) {
  const resultCombos = [];

  // กรณี target เกือบ 0
  if (Math.abs(target) < FLOAT_TOLERANCE) {
    return minPillObjects === 0 ? [[]] : [];
  }

  // ===== Integer math: scale เป็นหน่วย 0.5 mg =====
  const target2 = Math.round(target * 2);

  // sort strengths จากมากไปน้อย เพื่อลดจำนวนเม็ด (heuristic)
  const strengths = [...availablePills].sort((a, b) => b - a);
  const strengths2 = strengths.map(mg => Math.round(mg * 2));

  // ระหว่างค้นหา เราจะเก็บเป็น array ของ { mg, half } (mg = หน่วย mg จริง)
  function findRecursive(dose2, combo, idx) {
    // prune: เกินเป้าหมาย หรือ เกินจำนวนเม็ด
    if (dose2 > target2) return;
    if (combo.length > maxPillObjects) return;

    // เจอเป้าตรง
    if (dose2 === target2) {
      if (combo.length >= minPillObjects) {
        resultCombos.push(aggregateCombo(combo));
      }
      return;
    }

    // หมดรายการความแรงที่จะลอง
    if (idx >= strengths2.length) return;

    const mg2 = strengths2[idx];
    const mg = strengths[idx];

    // 1) ลองใส่เม็ดเต็ม (whole) ซ้ำได้ไม่จำกัด (จนกว่าจะเกินเงื่อนไข)
    //    ใช้ while-loop เพื่อรีเคอร์ซีฟทีละเม็ด (จำนวนเม็ดไม่เยอะเพราะมี maxPillObjects คุม)
    //    ลองเส้นทาง: whole -> half (ถ้าอนุญาต) -> ข้าม
    //    เพื่อคงลำดับ branch ที่ชอบได้ผลรวมเม็ดน้อยก่อน
    // ลอง whole ทีละเม็ด
    // (เราจะลูปแบบ incremental: 0, 1, 2, ... โดย 0 คือกรณีข้ามไว้ไปท้าย)
    const tryWhole = () => {
      combo.push({ mg, half: false });
      findRecursive(dose2 + mg2, combo, idx); // ใช้ strength เดิมได้อีก
      combo.pop();
    };

    // 2) ลองครึ่งเม็ด (อนุญาตแค่ 1 ครึ่งสำหรับความแรงนี้ในหนึ่ง combo)
    //    เทคนิค: ใส่ half ก่อน/หลัง whole ก็ได้ แต่เพื่อความคุมจำนวนเม็ดน้อย
    //    เราลอง whole ก่อน แล้วค่อย half (ช่วยให้ได้ชุดที่มีเม็ดเต็มมากกว่า)
    const tryHalf = () => {
      if (!allowHalf) return;
      // เช็คว่าความแรงนี้มี half แล้วหรือยังใน combo นี้ (ไม่เกิน 1)
      const alreadyHalf = combo.some(p => p.mg === mg && p.half);
      if (alreadyHalf) return;

      combo.push({ mg, half: true });
      findRecursive(dose2 + Math.floor(mg2 / 2), combo, idx); // mg/2
      combo.pop();
    };

    // 3) ข้ามความแรงนี้
    const skipStrength = () => {
      findRecursive(dose2, combo, idx + 1);
    };

    // ลองสาขาตามลำดับ: whole → half → skip
    // แต่เพื่อไม่แตกกิ่งแรง ให้ลองจำนวน whole แค่ที่จำเป็น
    // เรารีเคอร์ซีฟแบบทีละเม็ด (เรียก tryWhole 1 ครั้งต่อสเต็ป)
    // จากนั้นลอง half แล้วค่อย skip
    tryWhole();
    tryHalf();
    skipStrength();
  }

  findRecursive(0, [], 0);

  // ===== unique + rule: only one half per strength =====
  const seen = new Set();

  const filtered = resultCombos.filter(combo => {
    // ตัดชุดที่มีครึ่งเม็ดซ้ำในความแรงเดียวกัน (>1)
    for (const p of combo) {
      if (p.half && p.count > 1) return false;
    }

    // จัดเรียง normalize key เพื่อกรองซ้ำ
    const norm = combo
      .slice()
      .sort((a, b) => a.mg - b.mg || (a.half === b.half ? 0 : a.half ? 1 : -1))
      .map(p => `${p.mg}${p.half ? 'h' : 'w'}x${p.count}`)
      .join('|');

    if (seen.has(norm)) return false;
    seen.add(norm);
    return true;
  });

  return filtered;
}
