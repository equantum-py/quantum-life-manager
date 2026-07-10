export type ReminderOption = 
  | 'none'
  | '15m'
  | '1h'
  | 'day_before_8am'
  | 'tomorrow_8am';

export function getReminderOptionsForDate(baseDate?: string | null): { value: ReminderOption; label: string }[] {
  if (!baseDate) {
    return [
      { value: 'none', label: 'Sin recordatorio' },
      { value: 'tomorrow_8am', label: 'Mañana a las 08:00' }
    ];
  }

  return [
    { value: 'none', label: 'Sin recordatorio' },
    { value: '15m', label: '15 minutos antes' },
    { value: '1h', label: '1 hora antes' },
    { value: 'day_before_8am', label: 'Día anterior a las 08:00' },
    { value: 'tomorrow_8am', label: 'Mañana a las 08:00' }
  ];
}

export function calculateReminderTime(option: ReminderOption, baseDate?: string | null): string | null {
  if (option === 'none') return null;

  const now = new Date();
  
  if (option === 'tomorrow_8am') {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 0, 0, 0);
    return tomorrow.toISOString();
  }

  if (!baseDate) {
    // Si no hay fecha base y eligieron algo relativo (no debería pasar por UI), fallback a null
    return null;
  }

  const base = new Date(baseDate);
  if (isNaN(base.getTime())) return null;

  switch (option) {
    case '15m': {
      const d = new Date(base.getTime() - 15 * 60000);
      return d.toISOString();
    }
    case '1h': {
      const d = new Date(base.getTime() - 60 * 60000);
      return d.toISOString();
    }
    case 'day_before_8am': {
      const d = new Date(base);
      d.setDate(d.getDate() - 1);
      d.setHours(8, 0, 0, 0);
      return d.toISOString();
    }
    default:
      return null;
  }
}
