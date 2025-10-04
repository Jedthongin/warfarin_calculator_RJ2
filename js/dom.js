// js/dom.js
// ==============================
// 📦 DOM ELEMENT REFERENCE CENTER
// รวม element ทั้งหมดที่ใช้งานในระบบ
// ==============================

// 💊 ขนาดยา
export const previousDoseInput = document.getElementById('previousDoseInput');
export const weeklyDoseInput = document.getElementById('weeklyDoseInput');
export const allowHalfCheckbox = document.getElementById('allowHalf');

// 🔘 ปุ่มหลัก
export const showBtn = document.getElementById('showBtn');

// 📊 ส่วนแสดงผลการคำนวณ
export const adjustmentTableDiv = document.getElementById('adjustmentTable');
export const percentageChangeDiv = document.getElementById('percentageChange');
export const resultDiv = document.getElementById('result');

// 📅 การนัดหมาย
export const appointmentToggle = document.getElementById('appointmentToggle');
export const appointmentFields = document.getElementById('appointmentFields');
export const startDateInput = document.getElementById('startDate');
export const endDateInput = document.getElementById('endDate');
export const daysResultDiv = document.getElementById('daysResult');

// 🔁 รูปแบบการจัดวัน
export const patternFriSunRadio = document.getElementById('patternFriSun');
export const patternMonWedFriRadio = document.getElementById('patternMonWedFri');

// 📅 การเรียงลำดับวันแสดงผล
export const displaySunSatRadio = document.getElementById('displaySunSat');
export const displayMonSunRadio = document.getElementById('displayMonSun');

// 💊 กล่องเลือกขนาดยา
export const pillCheckboxes = document.querySelectorAll('.pill-checkbox');

// ==============================
// 🌙 ตัวเลือกเพิ่มเติม (ถ้ามี)
// ==============================

// ปุ่มเปิด/ปิด Dark Mode (เพิ่มได้ใน index.html)
export const themeToggleBtn = document.getElementById('toggleTheme');

// ปุ่มพิมพ์ (ใช้ใน result options)
export const printButtons = document.querySelectorAll('.print-option-btn');

// ตรวจสอบการมีอยู่ของ element ก่อนใช้งาน เพื่อกัน error บนบางหน้า
export function safeGetElement(id) {
  const el = document.getElementById(id);
  if (!el) console.warn(`⚠️ DOM Warning: #${id} not found`);
  return el;
}
