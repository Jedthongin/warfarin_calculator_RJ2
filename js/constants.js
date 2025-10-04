// js/constants.js
// =============================
// 🔧 Global Constants
// ใช้แชร์ค่าคงที่ระหว่างโมดูลต่าง ๆ
// =============================

// 📅 ชื่อวัน (ใช้ในตาราง, การนัดหมาย)
export const daysName = [
  'วันจันทร์', 'วันอังคาร', 'วันพุธ',
  'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์', 'วันอาทิตย์'
];

// 💊 ค่าคงที่ด้านการคำนวณขนาดยา
export const DOSE_MULTIPLIER_LIMIT = 2.5;         // จำกัดอัตราการเพิ่มขนาดยาไม่เกิน 2.5 เท่า
export const ABSOLUTE_MAX_DAILY_DOSE = 15;        // mg/day สูงสุด
export const FLOAT_TOLERANCE = 0.01;              // ใช้เปรียบเทียบตัวเลขแบบทศนิยม

// 🧠 การหาชุดเม็ดยา (comb.js)
export const MAX_COMBO_RESULTS = 50;              // จำกัดจำนวนชุดยาที่แสดง (ป้องกันโหลดเกิน)
export const COMBO_PREFERENCE = 'minPills';       // 'minPills' | 'preferWhole' | 'all'

// 🗓️ การคำนวณวันนัด
export const DEFAULT_APPOINTMENT_DAYS = 7;        // ถ้าไม่ใส่วันนัด → ใช้ 7 วันเป็นค่าเริ่มต้น
export const COUNT_APPOINTMENT_INCLUSIVE = true;  // true = รวมวันมาและวันนัด

// 🎨 การตั้งค่า UI
export const ENABLE_DARK_MODE_AUTO = true;        // ให้ CSS auto-switch ตามระบบ
export const DEFAULT_THEME = 'light';             // 'light' | 'dark'
