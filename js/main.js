// js/main.js
import {
  previousDoseInput, weeklyDoseInput, appointmentToggle, appointmentFields,
  startDateInput, endDateInput, resultDiv,
  patternFriSunRadio, patternMonWedFriRadio,
  displaySunSatRadio, displayMonSunRadio, pillCheckboxes, showBtn
} from './dom.js';

import { updateAppointmentDaysDisplay } from './appointment.js';
import { generateDoseAdjustmentTable, displayPercentageChange, generateSuggestions } from './planner.js';

document.addEventListener('DOMContentLoaded', () => {
  // initial UI
  generateDoseAdjustmentTable();

  // events
  showBtn.addEventListener('click', generateSuggestions);
  previousDoseInput.addEventListener('input', generateDoseAdjustmentTable);
  weeklyDoseInput.addEventListener('input', displayPercentageChange);

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

  function handleOptionChange() {
    if (resultDiv.innerHTML.trim() !== '') generateSuggestions();
  }

  patternFriSunRadio.addEventListener('change', handleOptionChange);
  patternMonWedFriRadio.addEventListener('change', handleOptionChange);
  displaySunSatRadio.addEventListener('change', handleOptionChange);
  displayMonSunRadio.addEventListener('change', handleOptionChange);
  pillCheckboxes.forEach(cb => cb.addEventListener('change', handleOptionChange));
});
