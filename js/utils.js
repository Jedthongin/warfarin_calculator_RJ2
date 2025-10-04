// js/utils.js
// ==============================
// 🔧 Utility Functions
// ==============================

// 📦 ดึงขนาดยา (mg) ที่ผู้ใช้เลือก
export function getAvailablePills(pillCheckboxes) {
  const selected = [];
  pillCheckboxes.forEach(cb => {
    if (cb.checked) selected.push(parseInt(cb.value));
  });
  return selected.sort((a, b) => b - a);
}

// 📅 แปลงวัน JS (0=Sunday) → index แบบไทย (0=จันทร์ ... 6=อาทิตย์)
export function getThaiDayIndex(jsDayIndex) {
  return (jsDayIndex === 0) ? 6 : jsDayIndex - 1;
}

// 🗓️ รูปแบบการจัดเรียงวัน (สำหรับแสดงผลตาราง)
export function makeDisplayOrder(mode) {
  // 'mon-sun' => [0..6], 'sun-sat' => [6,0..5]
  return mode === 'mon-sun' ? [0, 1, 2, 3, 4, 5, 6] : [6, 0, 1, 2, 3, 4, 5];
}

// 🕒 ลดการเรียกซ้ำฟังก์ชันเมื่อพิมพ์เร็ว
export function debounce(func, delay = 300) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

// ==============================
// 🌙 Theme Utilities (Dark Mode)
// ==============================

/**
 * สลับธีมระหว่าง light / dark
 * @param {HTMLElement} root - document.documentElement
 * @param {boolean} forceDark - true เพื่อบังคับ dark mode
 */
export function toggleTheme(root = document.documentElement, forceDark = null) {
  const isDark = root.classList.contains('dark');
  const nextMode = forceDark !== null ? forceDark : !isDark;
  root.classList.toggle('dark', nextMode);
  localStorage.setItem('theme', nextMode ? 'dark' : 'light');
}

/**
 * โหลดธีมจาก LocalStorage และตั้งค่าตอนเปิดเว็บ
 */
export function loadTheme(root = document.documentElement) {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
}

// ==============================
// 📁 การเก็บค่าใน localStorage แบบปลอดภัย
// ==============================
export function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('⚠️ ไม่สามารถบันทึกข้อมูลได้:', e);
  }
}

export function loadFromStorage(key, defaultValue = null) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  } catch (e) {
    console.warn('⚠️ ไม่สามารถอ่านข้อมูลได้:', e);
    return defaultValue;
  }
}
