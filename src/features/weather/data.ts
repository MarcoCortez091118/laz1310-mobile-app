export interface HourlyWeather {
  label: string;
  temperature: number;
  condition: 'cloudy' | 'sunny' | 'rain';
}

export interface DailyWeather {
  label: string;
  low: number;
  high: number;
  condition: 'cloudy' | 'sunny' | 'rain';
}

export interface WeatherCity {
  id: string;
  city: string;
  state?: string;
  country: string;
  localTimeLabel: string;
  primary?: boolean;
  temperature: number;
  high: number;
  low: number;
  condition: string;
  conditionIcon: 'cloudy' | 'sunny' | 'rain';
  summary: string;
  humidity: number;
  windMph: number;
  precipitationMm: number;
  hourly: HourlyWeather[];
  daily: DailyWeather[];
}

const hourly = (
  start: number,
  condition: HourlyWeather['condition'],
): HourlyWeather[] => [
  { label: 'Ahora', temperature: start, condition },
  { label: '4 PM', temperature: start + 1, condition },
  { label: '5 PM', temperature: start + 1, condition },
  { label: '6 PM', temperature: start, condition },
  { label: '7 PM', temperature: start - 1, condition },
  { label: '8 PM', temperature: start - 2, condition },
];

const daily = (
  low: number,
  high: number,
  condition: DailyWeather['condition'],
): DailyWeather[] => [
  { label: 'Hoy', low, high, condition },
  { label: 'Jue', low: low + 2, high: high - 2, condition: 'cloudy' },
  { label: 'Vie', low: low + 1, high: high + 1, condition: 'rain' },
  { label: 'Sáb', low: low + 4, high: high + 3, condition: 'sunny' },
  { label: 'Dom', low: low + 3, high: high + 2, condition: 'cloudy' },
];

export const weatherCities: WeatherCity[] = [
  {
    id: 'detroit',
    city: 'Detroit',
    state: 'MI',
    country: 'USA',
    localTimeLabel: '3:50 PM · Principal',
    primary: true,
    temperature: 64,
    high: 68,
    low: 55,
    condition: 'Parcialmente nublado',
    conditionIcon: 'cloudy',
    summary:
      'Nubes parciales durante la tarde. Viento moderado del oeste.',
    humidity: 57,
    windMph: 16,
    precipitationMm: 0,
    hourly: hourly(64, 'cloudy'),
    daily: daily(55, 68, 'cloudy'),
  },
  {
    id: 'new-york',
    city: 'New York',
    state: 'NY',
    country: 'USA',
    localTimeLabel: '3:50 PM',
    temperature: 68,
    high: 72,
    low: 60,
    condition: 'Nublado',
    conditionIcon: 'cloudy',
    summary:
      'Cielo nublado con temperaturas estables durante la tarde.',
    humidity: 62,
    windMph: 11,
    precipitationMm: 0,
    hourly: hourly(68, 'cloudy'),
    daily: daily(60, 72, 'cloudy'),
  },
  {
    id: 'chicago',
    city: 'Chicago',
    state: 'IL',
    country: 'USA',
    localTimeLabel: '2:50 PM',
    temperature: 62,
    high: 66,
    low: 53,
    condition: 'Parcialmente soleado',
    conditionIcon: 'sunny',
    summary:
      'Intervalos de sol y nubes. Viento fresco durante la tarde.',
    humidity: 54,
    windMph: 14,
    precipitationMm: 0,
    hourly: hourly(62, 'sunny'),
    daily: daily(53, 66, 'sunny'),
  },
  {
    id: 'washington',
    city: 'Washington',
    state: 'DC',
    country: 'USA',
    localTimeLabel: '3:50 PM',
    temperature: 62,
    high: 69,
    low: 57,
    condition: 'Mayormente despejado',
    conditionIcon: 'sunny',
    summary:
      'Condiciones mayormente despejadas durante el resto del día.',
    humidity: 49,
    windMph: 8,
    precipitationMm: 0,
    hourly: hourly(62, 'sunny'),
    daily: daily(57, 69, 'sunny'),
  },
];

const primaryWeatherCity = weatherCities[0]!;

export function getWeatherCity(id: string | undefined): WeatherCity {
  return weatherCities.find((city) => city.id === id) ?? primaryWeatherCity;
}
