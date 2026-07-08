import { todayISO } from './dates';

/**
 * Parses basic date keywords into an ISO date string (YYYY-MM-DD).
 * Fallbacks to today's date if nothing is detected.
 */
export function parseDateFromText(text: string): string {
  const normalized = text.toLowerCase();
  const today = new Date();

  if (normalized.includes('mañana')) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  const daysOfWeek = ['domingo', 'lunes', 'martes', 'miercoles', 'miércoles', 'jueves', 'viernes', 'sabado', 'sábado'];
  
  for (let i = 0; i < daysOfWeek.length; i++) {
    if (normalized.includes(daysOfWeek[i])) {
      let targetDay = i;
      if (i === 4) targetDay = 3; // miércoles
      if (i === 8) targetDay = 6; // sábado
      
      const currentDay = today.getDay();
      let daysUntil = targetDay - currentDay;
      if (daysUntil <= 0) daysUntil += 7;
      
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + daysUntil);
      return targetDate.toISOString().split('T')[0];
    }
  }

  return todayISO();
}
