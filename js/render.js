// js/render.js
import { daysName, FLOAT_TOLERANCE } from './constants.js';

export function renderDay(idx, combo, dayType) {
  const dayColors = ['bg-yellow-100', 'bg-pink-100', 'bg-green-100', 'bg-orange-200', 'bg-sky-100', 'bg-purple-100', 'bg-red-200'];
  let visualPills = '';
  let textPillsArr = [];
  let dayDose = 0;

  if (combo && combo.length > 0) {
    combo.forEach(p => {
      dayDose += p.half ? p.mg * 0.5 * p.count : p.mg * p.count;
      if (p.half) {
        for (let k = 0; k < p.count; k++) visualPills += `<span class="pill pill-${p.mg} pill-half-left"></span>`;
        if (p.count > 0) textPillsArr.push(`${p.mg} mg x(ครึ่ง)`);
      } else {
        for (let k = 0; k < p.count; k++) visualPills += `<span class="pill pill-${p.mg}"></span>`;
        if (p.count > 0) textPillsArr.push(`${p.mg} mg x${p.count}`);
      }
    });
  }

  let dayContentHtml;
  let containerClasses = "rounded-lg border text-center flex flex-col h-full overflow-hidden ";

  if (dayType === 'stop' || dayDose < FLOAT_TOLERANCE) {
    containerClasses += 'bg-gray-100 border-gray-300';
    dayContentHtml = `
      <div class="text-sm text-gray-800">(0.0 mg)</div>
      <div class="flex-grow flex flex-col justify-center items-center my-2 min-h-[30px]">
        <div class="text-xs text-gray-500">ไม่มีขนาดยา</div>
      </div>`;
  } else {
    const textPillsHtml = textPillsArr.map(t => `<div class="text-xs text-gray-600">${t}</div>`).join('');
    containerClasses += (dayType === 'special') ? 'bg-white border-red-400 border-2' : 'bg-white border-gray-300';
    dayContentHtml = `
      <div class="text-sm text-gray-800">(${dayDose.toFixed(1)} mg)</div>
      <div class="flex-grow flex flex-col justify-center items-center my-2 min-h-[30px]">
        <div class="flex justify-center items-center flex-wrap">${visualPills || '&nbsp;'}</div>
      </div>
      <div>${textPillsHtml}</div>`;
  }

  return `
    <div class="${containerClasses}">
      <div class="font-bold text-gray-800 py-1 ${dayColors[idx]}">${daysName[idx]}</div>
      <div class="p-2 flex-grow flex flex-col">
        ${dayContentHtml}
      </div>
    </div>`;
}

export function calculateTotalPills(option, daysUntilAppointment, startDate, getThaiDayIndex) {
  let halfPillCounts = { 1: 0, 2: 0, 3: 0, 5: 0 };
  let wholePillCounts = { 1: 0, 2: 0, 3: 0, 5: 0 };
  const startJsDayIndex = startDate ? startDate.getDay() : 1; // default Mon

  for (let day = 0; day < daysUntilAppointment; day++) {
    const idx = getThaiDayIndex((startJsDayIndex + day) % 7);
    const comboForDay = option.type === 'uniform' ? option.combo : option.comboWeekly[idx];
    if (!comboForDay) continue;
    comboForDay.forEach(p => {
      if (p.half) halfPillCounts[p.mg] += p.count;
      else wholePillCounts[p.mg] += p.count;
    });
  }

  let message = '';
  [5,3,2,1].forEach(mg => {
    const wholePills = wholePillCounts[mg] + Math.floor(halfPillCounts[mg] / 2);
    const remainingHalves = halfPillCounts[mg] % 2;
    const dispensedPills = wholePills + remainingHalves;
    if (dispensedPills > 0) {
      const actualUsed = wholePills + remainingHalves * 0.5;
      message += `<span class="pill pill-${mg}"></span> ${mg}mg: ${dispensedPills} เม็ด`;
      if (remainingHalves > 0) message += ` (ใช้จริง ${actualUsed.toFixed(1)} เม็ด)`;
      message += `<br>`;
    }
  });
  return message || '<span>ไม่ต้องจ่ายยา</span>';
}

export function getHalfPillComplexity(o) {
  const halfPillStrengths = new Set();
  const combos = o.type === 'uniform' ? [o.combo] : (o.comboWeekly || []);
  combos.forEach(dayCombo => {
    if (!dayCombo) return;
    dayCombo.forEach(pill => { if (pill.half) halfPillStrengths.add(pill.mg); });
  });
  return halfPillStrengths.size;
}

export function countPillColors(o) {
  const colors = new Set();
  const combos = o.type === 'uniform' ? [o.combo] : (o.comboWeekly || []);
  combos.forEach(day => day && day.forEach(p => (p.count > 0 || p.half) && colors.add(p.mg)));
  return colors.size;
}

export function countTotalPillObjects(o) {
  const daily = (day) => day ? day.reduce((s, p) => s + p.count, 0) : 0;
  if (o.type === 'uniform') return daily(o.combo) * 7;
  return (o.comboWeekly || []).reduce((s, day) => s + daily(day), 0);
}

export function renderOptions(options, displayOrder, daysUntilAppointment, isAppointmentCalculation, startDate, helpers) {
  const { renderDay, calculateTotalPills, getThaiDayIndex } = helpers;

  return options.slice(0, 30).map((option, index) => {
    let description = '';
    if (option.type === 'uniform') {
      const dailyDose = option.combo.reduce((sum, p) => sum + (p.half ? p.mg * 0.5 * p.count : p.mg * p.count), 0);
      description = dailyDose > 0 ? `ทุกวัน วันละ ${dailyDose.toFixed(1)} mg` : 'หยุดยา';
    } else {
      const parts = [];
      if (option.baseDose > 0) parts.push(`วันธรรมดา ${option.baseDose.toFixed(1)} mg`);
      if (option.numSpecialDays > 0) {
        parts.push(`วันพิเศษ ${option.specialDose.toFixed(1)} mg (${option.specialDays.map(idx => daysName[idx]).join(', ')})`);
      }
      if (option.numStopDays > 0) {
        parts.push(`หยุดยา ${option.numStopDays} วัน (${option.stopDays.map(idx => daysName[idx]).join(', ')})`);
      }
      description = parts.join(', ');
    }

    const weeklyScheduleHtml = displayOrder.map(j => {
      const combo = option.type === 'uniform' ? option.combo : option.comboWeekly[j];
      let dayType = 'normal';
      if (option.type === 'non-uniform') {
        if (option.stopDays.includes(j)) dayType = 'stop';
        else if (option.specialDays.includes(j)) dayType = 'special';
      }
      return renderDay(j, combo, dayType);
    }).join('');

    const totalPillsHeader = isAppointmentCalculation
      ? `รวมยาถึงวันนัด (${daysUntilAppointment} วัน):`
      : 'รวมยาสำหรับ 1 สัปดาห์:';
    const pillsNeededMessage = calculateTotalPills(option, daysUntilAppointment, startDate, getThaiDayIndex);

    return `
      <div class="border border-gray-200 p-4 rounded-lg bg-gray-50 mb-4 shadow-sm">
        <div class="font-semibold text-blue-700 mb-2">
          ตัวเลือก ${index + 1}: ${description} (รวม ${option.weeklyDoseActual.toFixed(1)} mg/สัปดาห์)
        </div>
        <div class="grid grid-cols-4 sm:grid-cols-7 gap-2 mt-4">${weeklyScheduleHtml}</div>
        <div class="mt-4 text-sm border-t border-gray-200 pt-2 text-gray-700">
          <span class="font-bold">${totalPillsHeader}</span><br>
          ${pillsNeededMessage}
        </div>
      </div>`;
  }).join('');
}
