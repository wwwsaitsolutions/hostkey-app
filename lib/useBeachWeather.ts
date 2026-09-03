'use client';

import { useState, useEffect } from 'react';

export interface ForecastDay {
  day: string;
  high: number;
  low: number;
  condition: string;
}

export interface BeachWeatherState {
  tempC?: number;
  condition?: string;
  windSpeedKts?: number;
  windDirectionDeg?: number;
  windDirectionLabel?: string;
  isNorthWind?: boolean;
  isLoading: boolean;
  forecast: ForecastDay[];
}

function getWindDirectionLabel(deg: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(deg / 45) % 8;
  return directions[index];
}

function getWeatherCondition(code: number): string {
  if (code === 0) return 'Sunny / Clear';
  if (code === 1 || code === 2) return 'Partly Cloudy';
  if (code === 3) return 'Cloudy';
  if (code >= 45 && code <= 48) return 'Foggy';
  if (code >= 51 && code <= 67) return 'Rain';
  if (code >= 80 && code <= 82) return 'Rain Showers';
  if (code >= 95) return 'Thunderstorm';
  return 'Clear';
}

export function useBeachWeather(lat: number = 35.3672, lng: number = 24.4871): BeachWeatherState {
  const [weather, setWeather] = useState<BeachWeatherState>({
    isLoading: true,
    forecast: [],
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchWeather() {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`
        );
        const data = await res.json();

        if (!isMounted || !data.current_weather) return;

        const cw = data.current_weather;
        const windSpeedKts = Math.round(cw.windspeed * 0.539957); // μετατροπή km/h σε knots
        const windDir = cw.winddirection;
        const isNorth = (windDir >= 315 || windDir <= 45 || (windDir > 45 && windDir < 135));

        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const forecast: ForecastDay[] = (data.daily?.time || []).slice(1, 6).map((timeStr: string, idx: number) => {
          const d = new Date(timeStr);
          return {
            day: days[d.getDay()],
            high: Math.round(data.daily.temperature_2m_max[idx + 1] ?? 28),
            low: Math.round(data.daily.temperature_2m_min[idx + 1] ?? 20),
            condition: getWeatherCondition(data.daily.weathercode[idx + 1] ?? 0),
          };
        });

        setWeather({
          tempC: Math.round(cw.temperature),
          condition: getWeatherCondition(cw.weathercode),
          windSpeedKts,
          windDirectionDeg: windDir,
          windDirectionLabel: getWindDirectionLabel(windDir),
          isNorthWind: isNorth,
          isLoading: false,
          forecast,
        });
      } catch (err) {
        console.error('Weather fetch error:', err);
        if (isMounted) {
          setWeather((prev) => ({ ...prev, isLoading: false }));
        }
      }
    }

    fetchWeather();

    return () => {
      isMounted = false;
    };
  }, [lat, lng]);

  return weather;
}