import { WeatherConditionCode } from './api';

export type WeatherUnit = 'F' | 'C';

export function displayTemperature(celsius: number, unit: WeatherUnit) {
  return Math.round(unit === 'F' ? (celsius * 9) / 5 + 32 : celsius);
}

export function displayWind(kph: number, unit: WeatherUnit) {
  if (unit === 'F') {
    return Math.round(kph / 1.609344) + ' mph';
  }

  return Math.round(kph) + ' km/h';
}

export function displayPrecipitation(mm: number, unit: WeatherUnit) {
  if (unit === 'F') {
    const inches = mm / 25.4;
    return (inches < 0.01 ? '0' : inches.toFixed(2)) + ' in';
  }

  return Math.round(mm * 10) / 10 + ' mm';
}

const labels: Record<WeatherConditionCode, string> = {
  clear: 'Despejado',
  mostly_clear: 'Mayormente despejado',
  partly_cloudy: 'Parcialmente nublado',
  cloudy: 'Nublado',
  fog: 'Niebla',
  drizzle: 'Llovizna',
  freezing_drizzle: 'Llovizna helada',
  rain: 'Lluvia',
  freezing_rain: 'Lluvia helada',
  snow: 'Nieve',
  snow_grains: 'Granos de nieve',
  rain_showers: 'Chubascos',
  snow_showers: 'Chubascos de nieve',
  thunderstorm: 'Tormenta eléctrica',
  thunderstorm_hail: 'Tormenta con granizo',
  unknown: 'Condición variable',
};

export function conditionLabel(code: WeatherConditionCode) {
  return labels[code] ?? labels.unknown;
}

export function conditionIcon(
  code: WeatherConditionCode,
  isDay = true,
):
  | 'sunny-outline'
  | 'moon-outline'
  | 'partly-sunny-outline'
  | 'cloud-outline'
  | 'rainy-outline'
  | 'snow-outline'
  | 'thunderstorm-outline' {
  switch (code) {
    case 'clear':
      return isDay ? 'sunny-outline' : 'moon-outline';
    case 'mostly_clear':
    case 'partly_cloudy':
      return 'partly-sunny-outline';
    case 'rain':
    case 'freezing_rain':
    case 'drizzle':
    case 'freezing_drizzle':
    case 'rain_showers':
      return 'rainy-outline';
    case 'snow':
    case 'snow_grains':
    case 'snow_showers':
      return 'snow-outline';
    case 'thunderstorm':
    case 'thunderstorm_hail':
      return 'thunderstorm-outline';
    default:
      return 'cloud-outline';
  }
}

export function localTimeLabel(timezone: string) {
  try {
    return new Intl.DateTimeFormat('es-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: timezone,
    }).format(new Date());
  } catch {
    return '';
  }
}

export function hourlyLabel(at: string, timezone: string, index: number) {
  if (index === 0) {
    return 'Próx.';
  }

  try {
    return new Intl.DateTimeFormat('es-US', {
      hour: 'numeric',
      timeZone: timezone,
    }).format(new Date(at));
  } catch {
    return at;
  }
}

export function dailyLabel(date: string, index: number) {
  if (index === 0) {
    return 'Hoy';
  }

  const parsed = new Date(date + 'T12:00:00Z');
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  const value = new Intl.DateTimeFormat('es-US', {
    weekday: 'short',
    timeZone: 'UTC',
  }).format(parsed);

  return value.charAt(0).toUpperCase() + value.slice(1).replace('.', '');
}
