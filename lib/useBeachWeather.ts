'use client';

import { useState, useEffect } from 'react';

export interface WeatherData {
  windSpeed: number;
  windDirection: number; // degrees
  isNorthWind: boolean;
  isStrongWind: boolean;
}

export const useBeachWeather = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Συντεταγμένες Ρεθύμνου: 35.367, 24.474
    fetch('https://api.open-meteo.com/v1/forecast?latitude=35.367&longitude=24.474&current=wind_speed_10m,wind_direction_10m&wind_speed_unit=kmh')
      .then((res) => res.json())
      .then((data) => {
        const speed = data.current?.wind_speed_10m || 0;
        const dir = data.current?.wind_direction_10m || 0;

        // Βόρειος άνεμος (Μελτέμι): μεταξύ 300° και 60°
        const isNorth = dir >= 300 || dir <= 60;
        const isStrong = speed > 15;

        setWeather({
          windSpeed: Math.round(speed),
          windDirection: Math.round(dir),
          isNorthWind: isNorth,
          isStrongWind: isStrong,
        });
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return { weather, loading };
};