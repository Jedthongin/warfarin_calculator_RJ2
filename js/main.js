import {
  previousDoseInput, weeklyDoseInput, allowHalfCheckbox, showBtn,
  adjustmentTableDiv, percentageChangeDiv, resultDiv,
  appointmentToggle, appointmentFields, startDateInput, endDateInput,
  patternFriSunRadio, patternMonWedFriRadio,
  displaySunSatRadio, displayMonSunRadio,
  pillCheckboxes
} from './dom.js';

import { debounce } from './utils.js';
import { generateDoseAdjustmentTable, generateSuggestions } from './planner.js';
import { updateAppointmentDaysDisplay } from './appointment.js';

/* ====== Print Preview ====== */
function showPrintPreview(optionElement){
  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow){
    alert('เบราว์เซอร์บล็อกหน้าต่างป๊อปอัป กรุณาอนุญาตแล้วลองใหม่อีกครั้ง');
    return;
  }
  const optionContent = optionElement.innerHTML;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="th">
    <head>
      <meta charset="UTF-8">
      <title>Warfarin - พรีวิวก่อนพิมพ์</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <style>
        body { font-family: 'Prompt', sans-serif; }
        .preview-header { text-align: center; padding: 20px; border-bottom: 2px solid #e5e7eb; margin-bottom: 20px; }
        .preview-footer { text-align: center; margin-top: 20px; padding-top: 20px; border-top: 2px solid #e5e7eb; }
        .print-button { background:#1d4ed8; color:#fff; padding:10px 20px; font-weight:600; border:none; border-radius:8px; cursor:pointer; box-shadow:0 4px 6px rgba(0,0,0,.1); }
        .print-button:hover { background:#1e40af; }
        @media print {
          .print-button, .preview-footer { display: none !important; }
          body { font-size: 12pt; }
          .text-sm { font-size: 10pt; }
          .grid { display: block; }
          .grid > div { margin-bottom: 1.5rem; page-break-inside: avoid; }
        }
      </style>
    </head>
    <body class="p-6 bg-white">
      <div class="preview-header">
        <h1 class="text-2xl font-bold">แผนการจัดยา Warfarin</h1>
        <p class="text-sm text-gray-600">ตรวจสอบอีกครั้งก่อนพิมพ์</p>
      </div>
      <main>${optionContent}</main>
      <div class="preview-footer">
        <button class="print-button" id="print-now-btn">🖨️ ยืนยันพิมพ์</button>
      </div>
      <script>
        window.addEventListener('load', function(){
          const btn = document.getElementById('print-now-btn');
          if (btn){
            btn.addEventListener('click', function(){
              btn.disabled = true;
              btn.textContent = 'กำลังส่งไปยังเครื่องพิมพ์...';
              window.print();
              setTimeout(()=>{ btn.disabled = false; btn.textContent = '🖨️ ยืนยันพิมพ์'; }, 1200);
            });
          }
        });
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

/* ====== Initial UI ====== */
document.addEventListener('DOMContentLoaded', () => {
  generateDoseAdjustmentTable();
});

/* ====== Events ====== */
showBtn.addEventListener('click', generateSuggestions);
previousDoseInput.addEventListener('input', debounce(generateDoseAdjustmentTable, 300));

appointmentToggle.addEventListener('change', () => {
  if (appointmentToggle.checked) {
    appointmentFields.classList.remove('hidden');
    if (!startDateInput.value) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      startDateInput.value = `${yyyy}-${mm}-${dd}`;
    }
  } else {
    appointmentFields.classList.add('hidden');
  }
  updateAppointmentDaysDisplay(appointmentToggle, startDateInput, endDateInput);
  if (resultDiv.innerHTML.trim() !== '') generateSuggestions();
});

startDateInput.addEventListener('change', () => {
  updateAppointmentDaysDisplay(appointmentToggle, startDateInput, endDateInput);
  if (resultDiv.innerHTML.trim() !== '') generateSuggestions();
});

endDateInput.addEventListener('change', () => {
  updateAppointmentDaysDisplay(appointmentToggle, startDateInput, endDateInput);
  if (resultDiv.innerHTML.trim() !== '') generateSuggestions();
});

function handleOptionChange(){
  if (resultDiv.innerHTML.trim() !== '') generateSuggestions();
}

patternFriSunRadio.addEventListener('change', handleOptionChange);
patternMonWedFriRadio.addEventListener('change', handleOptionChange);
displaySunSatRadio.addEventListener('change', handleOptionChange);
displayMonSunRadio.addEventListener('change', handleOptionChange);
pillCheckboxes.forEach(cb => cb.addEventListener('change', handleOptionChange));

/* ====== Print buttons (event delegation) ====== */
resultDiv.addEventListener('click', (e) => {
  const btn = e.target.closest('.print-option-btn');
  if (!btn) return;
  const optionIndex = Number(btn.dataset.index);
  const optionElements = resultDiv.querySelectorAll(':scope > div');
  const target = optionElements[optionIndex];
  if (target) showPrintPreview(target);
});
