import { daysResultDiv } from './dom.js';

export function getAppointmentInfo(appointmentToggle, startDateInput, endDateInput){
  let daysUntilAppointment = 7;
  let isAppointmentCalculation = false;
  let startDate = null;

  if (appointmentToggle.checked){
    const sv = startDateInput.value;
    const ev = endDateInput.value;
    if (sv && ev){
      const sd = new Date(sv);
      const ed = new Date(ev);
      sd.setHours(0,0,0,0);
      ed.setHours(0,0,0,0);
      if (ed > sd){
        const diff = ed.getTime() - sd.getTime();
        daysUntilAppointment = Math.round(diff / (1000*3600*24));
        isAppointmentCalculation = true;
        startDate = sd;
      }
    }
  }
  return { daysUntilAppointment, isAppointmentCalculation, startDate };
}

export function updateAppointmentDaysDisplay(appointmentToggle, startDateInput, endDateInput){
  const { daysUntilAppointment, isAppointmentCalculation } =
    getAppointmentInfo(appointmentToggle, startDateInput, endDateInput);

  daysResultDiv.textContent = isAppointmentCalculation ? `คำนวณสำหรับ ${daysUntilAppointment} วัน` : '';
}
