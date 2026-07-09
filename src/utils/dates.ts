export const todayISO = () => new Date().toISOString().slice(0, 10);

export function safeDate(value: any, fallback = new Date()): Date {
  if (!value) return fallback;
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return fallback;
    return d;
  } catch {
    return fallback;
  }
}

export function safeDateString(value: any): string {
  const d = safeDate(value);
  return d.toISOString();
}

export const prettyDate = (d: string | Date | null | undefined): string => {
  if (!d) return 'Sin fecha';
  
  try {
    let dateObj: Date;
    if (typeof d === 'string') {
      // If it looks like a simple YYYY-MM-DD, append time to avoid timezone issues, else just parse it
      const cleanString = d.includes('T') ? d : `${d}T00:00:00`;
      dateObj = new Date(cleanString);
    } else {
      dateObj = d;
    }

    if (isNaN(dateObj.getTime())) {
      console.warn('Invalid date detected in prettyDate:', d);
      return 'Sin fecha';
    }

    return new Intl.DateTimeFormat('es-PY', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    }).format(dateObj);
  } catch (err) {
    console.warn('Error formatting date in prettyDate:', d, err);
    return 'Sin fecha';
  }
};

export const isPast = (d: string | null | undefined): boolean => {
  if (!d) return false;
  try {
    // If it's full ISO, just slice first 10 for string comparison
    const cleanStr = d.slice(0, 10);
    return cleanStr < todayISO();
  } catch {
    return false;
  }
};

export const isToday = (d: string | null | undefined): boolean => {
  if (!d) return false;
  try {
    const cleanStr = d.slice(0, 10);
    return cleanStr === todayISO();
  } catch {
    return false;
  }
};
