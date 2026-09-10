export const WMO: Record<number, [string, string]> = {
  0: ['Clear sky', '☀️'], 1: ['Mainly clear', '🌤️'], 2: ['Partly cloudy', '⛅'], 3: ['Overcast', '☁️'],
  45: ['Fog', '🌫️'], 48: ['Rime fog', '🌫️'],
  51: ['Light drizzle', '🌦️'], 53: ['Drizzle', '🌦️'], 55: ['Heavy drizzle', '🌦️'],
  56: ['Freezing drizzle', '🌧️'], 57: ['Freezing drizzle', '🌧️'],
  61: ['Light rain', '🌧️'], 63: ['Rain', '🌧️'], 65: ['Heavy rain', '🌧️'],
  66: ['Freezing rain', '🌧️'], 67: ['Freezing rain', '🌧️'],
  71: ['Light snow', '🌨️'], 73: ['Snow', '🌨️'], 75: ['Heavy snow', '🌨️'], 77: ['Snow grains', '🌨️'],
  80: ['Light showers', '🌦️'], 81: ['Showers', '🌦️'], 82: ['Violent showers', '⛈️'],
  85: ['Snow showers', '🌨️'], 86: ['Snow showers', '🌨️'],
  95: ['Thunderstorm', '⛈️'], 96: ['Thunderstorm, hail', '⛈️'], 99: ['Severe thunderstorm', '⛈️'],
};

export const wx = (c: number) => WMO[c] ?? ['Unknown', '❓'];

/** Nepal monsoon rain intensity, mm/hr */
export function intensity(mmhr: number): { label: string; tone: string } {
  if (mmhr <= 0)  return { label: 'None',       tone: 'none' };
  if (mmhr < 2.5) return { label: 'Light',      tone: 'light' };
  if (mmhr < 7.5) return { label: 'Moderate',   tone: 'moderate' };
  if (mmhr < 50)  return { label: 'Heavy',      tone: 'heavy' };
  return              { label: 'Torrential', tone: 'extreme' };
}