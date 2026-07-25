// Helpers for user-friendly, locale-safe date/time inputs.
// Native <input type="date|time|datetime-local"> expect local wall-clock
// strings ("YYYY-MM-DD", "HH:mm", "YYYY-MM-DDTHH:mm"), NOT ISO/UTC.

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/** Format a Date for <input type="datetime-local"> (local time). */
export function toDateTimeLocalValue(date: Date): string {
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

/** Format a Date for <input type="date"> (local date). */
export function toDateValue(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Round up to the start of the next hour, e.g. 14:20 -> 15:00. */
export function nextHour(from: Date = new Date()): Date {
  const date = new Date(from);
  date.setMinutes(0, 0, 0);
  date.setHours(date.getHours() + 1);
  return date;
}

/** Return a copy of `date` shifted by `days`. */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/** Return a copy of `date` shifted by `hours`. */
export function addHours(date: Date, hours: number): Date {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

/** Return a copy of `date` set to a specific hour (minutes/seconds zeroed). */
export function atHour(date: Date, hour: number): Date {
  const result = new Date(date);
  result.setHours(hour, 0, 0, 0);
  return result;
}
