export const esc = (s: unknown) =>
  String(s).replace(/[&<>"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]!));

export const hour12 = (iso: string) => {
  const hh = +iso.slice(11, 13);
  return (hh % 12 === 0 ? 12 : hh % 12) + (hh < 12 ? 'AM' : 'PM');
};

export const weekday = (isoDate: string) =>
  new Date(isoDate + 'T00:00').toLocaleDateString('en-GB', { weekday: 'short' });

export const windDir = (deg: number) =>
  ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(deg / 45) % 8];

export function aqi(v: number | null | undefined): [string, string] {
  if (v == null) return ['—', '#6b7280'];
  if (v <= 50)  return ['Good', '#15803d'];
  if (v <= 100) return ['Moderate', '#ca8a04'];
  if (v <= 150) return ['Sensitive groups', '#ea580c'];
  if (v <= 200) return ['Unhealthy', '#dc2626'];
  if (v <= 300) return ['Very unhealthy', '#7c3aed'];
  return ['Hazardous', '#7f1d1d'];
}