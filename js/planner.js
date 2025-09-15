// js/planner.js
import {
  DOSE_MULTIPLIER_LIMIT, ABSOLUTE_MAX_DAILY_DOSE, FLOAT_TOLERANCE
} from './constants.js';

import {
  previousDoseInput, weeklyDoseInput, allowHalfCheckbox, showBtn,
  adjustmentTableDiv, percentageChangeDiv, resultDiv,
  appointmentToggle, startDateInput, endDateInput,
  patternFriSunRadio, displayMonSunRadio, displaySunSatRadio,
  pillCheckboxes
} from './dom.js';

import { getAvailablePills, makeDisplayOrder } from './utils.js';
import { findComb } from './comb.js';
import { getAppointmentInfo } from './appointment.js';
import {
  renderDay, renderOptions, getHalfPillComplexity, countPillColors, countTotalPillObjects, calculateTotalPills
} from './render.js';

export function generateDoseAdjustmentTable() {
  const prev = parseFloat(previousDoseInput.value);
  if (isNaN(prev) || prev <= 0) {
    adjustmentTableDiv.innerHTML = '';
    return;
  }

  const percentages = [-20, -15, -10, -5, 0, 5, 10, 15, 20];
  let html = `
    <h3 class="text-lg font-semibold mb-3 text-center text-gray-700">
      ปรับขนาดยาอัตโนมัติ <span class="text-sm font-normal">🖱️ (คลิกเพื่อเลือก)</span>
    </h3>
    <div class="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2 text-center">
  `;
  percentages.forEach(p => {
    const exactDose = prev * (1 + p / 100);
    const roundedDose = Math.round(exactDose * 2) / 2;
    const buttonColor = p < 0
      ? 'bg-red-100 hover:bg-red-200 text-red-800'
      : (p === 0 ? 'bg-blue-100 hover:bg-blue-200 text-blue-800' : 'bg-green-100 hover:bg-green-200 text-green-800');
    html += `
      <button data-dose="${roundedDose}" class="dose-adjust-btn p-2 rounded-lg ${buttonColor}
        transition duration-150 ease-in-out shadow-sm border border-gray-200 focus:outline-none
        focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
        <div class="font-bold text-lg">${p > 0 ? '+' : ''}${p}%</div>
        <div class="text-sm">${roundedDose.toFixed(1)} mg</div>
      </button>`;
  });
  html += `</div>`;
  adjustmentTableDiv.innerHTML = html;

  adjustmentTableDiv.querySelectorAll('.dose-adjust-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const dose = parseFloat(btn.dataset.dose);
      setWeeklyDoseAndSuggest(dose);
    });
  });
}

export function setWeeklyDoseAndSuggest(dose) {
  weeklyDoseInput.value = dose.toFixed(1);
  displayPercentageChange();
  showBtn.click();
}

export function displayPercentageChange() {
  const weeklyDose = parseFloat(weeklyDoseInput.value);
  const previousDose = parseFloat(previousDoseInput.value);
  percentageChangeDiv.innerHTML = '';

  if (!isNaN(weeklyDose) && !isNaN(previousDose) && previousDose > 0) {
    const pct = ((weeklyDose - previousDose) / previousDose * 100);
    let content = '';
    if (Math.abs(pct) < 0.05) {
      content = `
        <div class="p-4 border-2 border-blue-300 bg-blue-50 rounded-lg shadow-md">
          <div class="text-lg text-gray-700 mb-1">การเปลี่ยนแปลงขนาดยา</div>
          <div class="flex items-center justify-center">
            <span class="text-5xl font-bold text-gray-800">คงที่</span>
          </div>
        </div>`;
    } else {
      const up = pct > 0;
      const arrow = up ? '▲' : '▼';
      const absPct = Math.abs(pct).toFixed(1);
      const arrowColor = up ? 'text-green-600' : 'text-red-600';
      const box = up ? 'border-2 border-green-300 bg-green-50' : 'border-2 border-red-300 bg-red-50';
      content = `
        <div class="p-4 ${box} rounded-lg shadow-md">
          <div class="text-lg text-gray-700 mb-1">การเปลี่ยนแปลงขนาดยา</div>
          <div class="flex items-center justify-center gap-x-2">
            <span class="text-5xl font-bold ${arrowColor}">${arrow}</span>
            <span class="text-6xl font-bold text-gray-800">${absPct}</span>
            <span class="text-4xl text-gray-700 self-end mb-1">%</span>
          </div>
        </div>`;
    }
    percentageChangeDiv.innerHTML = content;
  }
}

export function generateSuggestions() {
  const weeklyDose = parseFloat(weeklyDoseInput.value);
  const allowHalf = allowHalfCheckbox.checked;
  const availablePills = getAvailablePills(pillCheckboxes);
  resultDiv.innerHTML = '';

  if (isNaN(weeklyDose) || weeklyDose < 0) {
    resultDiv.innerHTML = '<div class="text-red-600 text-center font-bold">กรุณากรอกขนาดยาใหม่ที่ถูกต้อง</div>';
    return;
  }
  if (availablePills.length === 0) {
    resultDiv.innerHTML = '<div class="text-red-600 text-center font-bold">กรุณาเลือกขนาดยาอย่างน้อย 1 ขนาด</div>';
    return;
  }

  displayPercentageChange();

  const { daysUntilAppointment, isAppointmentCalculation, startDate } =
    getAppointmentInfo(appointmentToggle, startDateInput, endDateInput);

  const specialDayPattern = (document.querySelector('input[name="specialDayPattern"]:checked')?.value) || 'fri-sun';

  let options = [];
  const seenOptions = new Set();

  // 1) Uniform
  const dailyDoseTarget = weeklyDose / 7;
  if (dailyDoseTarget >= 0) {
    const dailyCombos = findComb(dailyDoseTarget, availablePills, allowHalf, dailyDoseTarget === 0 ? 0 : 1, 4);
    dailyCombos.forEach(c => {
      const actualWeeklyDose =
        c.reduce((sum, p) => sum + (p.half ? p.mg * 0.5 * p.count : p.mg * p.count), 0) * 7;
      if (Math.abs(actualWeeklyDose - weeklyDose) < FLOAT_TOLERANCE) {
        const key = `uniform-${JSON.stringify(c.map(p => `${p.mg}-${p.count}-${p.half}`).sort())}`;
        if (!seenOptions.has(key)) {
          seenOptions.add(key);
          options.push({ type: 'uniform', combo: c, weeklyDoseActual: actualWeeklyDose, priority: 0 });
        }
      }
    });
  }

  // 2) Non-uniform
  for (let numStopDays = 0; numStopDays <= 3; numStopDays++) {
    for (let numSpecialDays = 0; numSpecialDays <= (3 - numStopDays); numSpecialDays++) {
      const normalDaysCount = 7 - numStopDays - numSpecialDays;
      if (normalDaysCount === 7) continue;

      let stopDaysIndices = [];
      let specialDaysIndices = [];

      if (specialDayPattern === 'fri-sun') {
        // อิงท้ายสัปดาห์
        stopDaysIndices = Array.from({ length: numStopDays }, (_, i) => 6 - i);
        specialDaysIndices = Array.from({ length: numSpecialDays }, (_, i) => 6 - numStopDays - i);
      } else { // mon-wed-fri
        if (numSpecialDays === 3) specialDaysIndices = [0,2,4];
        else if (numSpecialDays === 2) {
          specialDaysIndices = [0,4];
          if (numStopDays === 1) stopDaysIndices = [2];
        } else if (numSpecialDays === 1) {
          if (numStopDays === 2) { specialDaysIndices = [2]; stopDaysIndices = [0,4]; }
          else if (numStopDays === 1) { specialDaysIndices = [0]; stopDaysIndices = [2]; }
          else { specialDaysIndices = [2]; }
        } else {
          if (numStopDays === 3) stopDaysIndices = [0,2,4];
          else if (numStopDays === 2) stopDaysIndices = [0,4];
          else if (numStopDays === 1) stopDaysIndices = [2];
        }
      }

      for (let baseDose = 0.5; baseDose <= ABSOLUTE_MAX_DAILY_DOSE; baseDose += 0.5) {
        const normalDayCombos = findComb(baseDose, availablePills, allowHalf, 1, 4);
        if (normalDayCombos.length === 0) continue;

        const remainingDose = weeklyDose - (baseDose * normalDaysCount);

        if (numSpecialDays === 0) {
          if (Math.abs(remainingDose) > FLOAT_TOLERANCE) continue;
          addNonUniformOption(options, seenOptions, {
            baseDose, numStopDays, stopDaysIndices,
            normalDayCombos, weeklyDose
          });
        } else {
          if (remainingDose <= FLOAT_TOLERANCE) continue;
          const specialDayDoseTarget = +(remainingDose / numSpecialDays).toFixed(2);
          if (Math.abs(specialDayDoseTarget - baseDose) < FLOAT_TOLERANCE || specialDayDoseTarget <= 0) continue;
          if (specialDayDoseTarget > ABSOLUTE_MAX_DAILY_DOSE || specialDayDoseTarget > baseDose * DOSE_MULTIPLIER_LIMIT) continue;

          const specialDayCombos = findComb(specialDayDoseTarget, availablePills, allowHalf, 1, 4);
          if (specialDayCombos.length === 0) continue;

          addNonUniformOption(options, seenOptions, {
            baseDose, numStopDays, stopDaysIndices,
            numSpecialDays, specialDaysIndices, specialDayDoseTarget,
            normalDayCombos, specialDayCombos, weeklyDose
          });
        }
      }
    }
  }

  // sort
  options.sort((a, b) => {
    const ah = getHalfPillComplexity(a);
    const bh = getHalfPillComplexity(b);
    if (ah !== bh) return ah - bh;
    if (a.priority !== b.priority) return a.priority - b.priority;
    const ac = (a.numStopDays || 0) + (a.numSpecialDays || 0);
    const bc = (b.numStopDays || 0) + (b.numSpecialDays || 0);
    if (ac !== bc) return ac - bc;
    const acol = countPillColors(a);
    const bcol = countPillColors(b);
    if (acol !== bcol) return acol - bcol;
    const at = countTotalPillObjects(a);
    const bt = countTotalPillObjects(b);
    if (at !== bt) return at - bt;
    return 0;
  });

  const order = makeDisplayOrder(displayMonSunRadio.checked ? 'mon-sun' : 'sun-sat');
  const html = renderOptions(
    options,
    order,
    daysUntilAppointment,
    isAppointmentCalculation,
    startDate,
    { renderDay, calculateTotalPills,
      // inline helper to avoid extra imports here
      getThaiDayIndex: (jsDayIndex) => (jsDayIndex === 0) ? 6 : jsDayIndex - 1
    }
  );
  resultDiv.innerHTML = options.length ? html : '<div class="text-red-600 text-center font-bold">ไม่พบตัวเลือกที่เหมาะสมสำหรับขนาดยาที่ต้องการ</div>';
}

function addNonUniformOption(options, seenOptions, params) {
  const {
    baseDose, numStopDays, stopDaysIndices,
    numSpecialDays = 0, specialDaysIndices = [],
    specialDayDoseTarget = 0,
    normalDayCombos, specialDayCombos = [[]],
    weeklyDose
  } = params;

  specialDayCombos.forEach(sCombo => {
    normalDayCombos.forEach(nCombo => {
      const comboWeekly = Array(7).fill(null);
      let actualWeeklyDose = 0;
      for (let i = 0; i < 7; i++) {
        if (stopDaysIndices.includes(i)) comboWeekly[i] = [];
        else if (specialDaysIndices.includes(i)) comboWeekly[i] = sCombo.slice();
        else comboWeekly[i] = nCombo.slice();

        actualWeeklyDose += comboWeekly[i]
          .reduce((sum, p) => sum + (p.half ? p.mg * 0.5 * p.count : p.mg * p.count), 0);
      }

      if (Math.abs(actualWeeklyDose - weeklyDose) < FLOAT_TOLERANCE) {
        const key = `nonuniform-${JSON.stringify(
          comboWeekly.map(day => day ? day.map(p => `${p.mg}-${p.count}-${p.half}`).sort().join('|') : 'null')
        )}`;
        if (!seenOptions.has(key)) {
          seenOptions.add(key);
          options.push({
            type: 'non-uniform', comboWeekly, weeklyDoseActual: actualWeeklyDose,
            baseDose, specialDose: specialDayDoseTarget,
            numStopDays, stopDays: stopDaysIndices.slice().sort((a,b)=>a-b),
            numSpecialDays, specialDays: specialDaysIndices.slice().sort((a,b)=>a-b),
            priority: 1
          });
        }
      }
    });
  });
}
