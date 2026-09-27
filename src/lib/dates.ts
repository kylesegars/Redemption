import { siteConfig } from '../site.config';

/**
 * All event/post times are stored as "wall clock" strings like "2026-10-04T10:00",
 * meaning local time at the church. These helpers turn them into real instants
 * using siteConfig.timezone, and format them for display.
 */

const TZ = siteConfig.timezone;
const LOCALE = siteConfig.locale;

function parts(wall: string) {
  const [d, t = '00:00'] = wall.split('T');
  const [y, m, day] = d.split('-').map(Number);
  const [h, min] = t.split(':').map(Number);
  return { y, m, day, h: h || 0, min: min || 0 };
}

/** How far ahead of UTC the timezone is at a given instant, in ms. */
function tzOffset(utcMs: number, timeZone: string) {
  const f = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const p = Object.fromEntries(f.formatToParts(new Date(utcMs)).map((x) => [x.type, x.value]));
  const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  return asUtc - Math.floor(utcMs / 1000) * 1000;
}

/** Wall-clock string in the church's timezone → epoch milliseconds. */
export function toInstant(wall: string, timeZone = TZ): number {
  const { y, m, day, h, min } = parts(wall);
  const guess = Date.UTC(y, m - 1, day, h, min);
  let utc = guess - tzOffset(guess, timeZone);
  const corrected = guess - tzOffset(utc, timeZone); // handles DST edges
  if (corrected !== utc) utc = corrected;
  return utc;
}

/** Formats a wall-clock string without any timezone shifting. */
export function formatWall(wall: string, opts: Intl.DateTimeFormatOptions) {
  const { y, m, day, h, min } = parts(wall);
  return new Intl.DateTimeFormat(LOCALE, { ...opts, timeZone: 'UTC' }).format(
    new Date(Date.UTC(y, m - 1, day, h, min)),
  );
}

export const formatDate = (wall: string) =>
  formatWall(wall, { month: 'long', day: 'numeric', year: 'numeric' });

export const formatTime = (wall: string) => {
  const { min } = parts(wall);
  return formatWall(wall, { hour: 'numeric', minute: min ? '2-digit' : undefined }).replace(':00', '');
};

export const dateBadge = (wall: string) => ({
  month: formatWall(wall, { month: 'short' }),
  day: formatWall(wall, { day: 'numeric' }),
  weekday: formatWall(wall, { weekday: 'long' }),
});

const sameDay = (a: string, b: string) => a.slice(0, 10) === b.slice(0, 10);

/** "Sunday, October 4 · 10 AM – 12 PM" */
export function formatEventWhen(start: string, end?: string) {
  const day = formatWall(start, { weekday: 'long', month: 'long', day: 'numeric' });
  if (!end) return `${day} · ${formatTime(start)}`;
  if (sameDay(start, end)) return `${day} · ${formatTime(start)} – ${formatTime(end)}`;
  const endDay = formatWall(end, { weekday: 'long', month: 'long', day: 'numeric' });
  return `${day}, ${formatTime(start)} – ${endDay}, ${formatTime(end)}`;
}

/** Google Calendar "add event" link. */
export function googleCalendarUrl(e: { title: string; start: string; end?: string; location?: string; summary?: string }) {
  const startMs = toInstant(e.start);
  const endMs = e.end ? toInstant(e.end) : startMs + 60 * 60 * 1000;
  const fmt = (ms: number) => new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const q = new URLSearchParams({
    action: 'TEMPLATE',
    text: e.title,
    dates: `${fmt(startMs)}/${fmt(endMs)}`,
    details: e.summary ?? '',
    location: e.location ?? '',
  });
  return `https://calendar.google.com/calendar/render?${q}`;
}

/** Minimal .ics file (as a data: URL) for Apple/Outlook calendars. */
export function icsDataUrl(e: { title: string; start: string; end?: string; location?: string; summary?: string; url: string }) {
  const startMs = toInstant(e.start);
  const endMs = e.end ? toInstant(e.end) : startMs + 60 * 60 * 1000;
  const fmt = (ms: number) => new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const esc = (s = '') => s.replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//church-site//events//EN',
    'BEGIN:VEVENT',
    `UID:${fmt(startMs)}-${encodeURIComponent(e.title)}`,
    `DTSTAMP:${fmt(startMs)}`,
    `DTSTART:${fmt(startMs)}`,
    `DTEND:${fmt(endMs)}`,
    `SUMMARY:${esc(e.title)}`,
    `DESCRIPTION:${esc(e.summary)}`,
    `LOCATION:${esc(e.location)}`,
    `URL:${e.url}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}

/**
 * Wall-clock string → ISO 8601 with the church's UTC offset, e.g.
 * "2026-10-04T10:00" → "2026-10-04T10:00:00-05:00". Used for Event schema.
 */
export function toIsoWithOffset(wall: string, timeZone = TZ): string {
  const utc = toInstant(wall, timeZone);
  const offsetMin = Math.round(tzOffset(utc, timeZone) / 60000);
  const sign = offsetMin < 0 ? '-' : '+';
  const abs = Math.abs(offsetMin);
  const hh = String(Math.floor(abs / 60)).padStart(2, '0');
  const mm = String(abs % 60).padStart(2, '0');
  const { y, m, day, h, min } = parts(wall);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${y}-${pad(m)}-${pad(day)}T${pad(h)}:${pad(min)}:00${sign}${hh}:${mm}`;
}
