import { Pipe, PipeTransform } from '@angular/core';

/**
 * Displays a 24-hour "HH:MM" time string (e.g. "08:00", "20:30") as 12-hour
 * with AM/PM (e.g. "8:00 AM", "8:30 PM"). Storage stays 24-hour everywhere -
 * this only changes what the user sees.
 *
 * Usage: {{ someTimeString | time12 }}
 */
@Pipe({ name: 'time12' })
export class Time12Pipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) {
      return '';
    }

    const [hoursPart, minutesPart] = value.split(':');
    const hours = parseInt(hoursPart, 10);
    const minutes = parseInt(minutesPart, 10);

    if (isNaN(hours) || isNaN(minutes)) {
      // Not a recognizable "HH:MM" string - show it as-is rather than guessing.
      return value;
    }

    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    const displayMinutes = minutes.toString().padStart(2, '0');

    return `${displayHours}:${displayMinutes} ${period}`;
  }
}
