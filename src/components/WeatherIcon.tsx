
import React from 'react';
import {
  Cloud,
  CloudDrizzle,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Sun,
  CloudSun,
} from 'lucide-react';

interface WeatherIconProps {
  weatherCode: string;
  size?: number;
  className?: string;
}

const WeatherIcon: React.FC<WeatherIconProps> = ({ 
  weatherCode, 
  size = 24, 
  className = ''
}) => {
  const getIconByCode = (code: string) => {
    // Map OpenWeatherMap icon codes to Lucide icons
    // See https://openweathermap.org/weather-conditions for codes
    switch (code) {
      case '01d': // clear sky day
        return <Sun size={size} className={className} />;
      case '01n': // clear sky night
        return <Sun size={size} className={className} />;
      case '02d': // few clouds day
      case '02n': // few clouds night
      case '03d': // scattered clouds day
      case '03n': // scattered clouds night
      case '04d': // broken clouds day
      case '04n': // broken clouds night
        return <CloudSun size={size} className={className} />;
      case '09d': // shower rain day
      case '09n': // shower rain night
        return <CloudDrizzle size={size} className={className} />;
      case '10d': // rain day
      case '10n': // rain night
        return <CloudRain size={size} className={className} />;
      case '11d': // thunderstorm day
      case '11n': // thunderstorm night
        return <CloudLightning size={size} className={className} />;
      case '13d': // snow day
      case '13n': // snow night
        return <CloudSnow size={size} className={className} />;
      case '50d': // mist day
      case '50n': // mist night
        return <Cloud size={size} className={className} />;
      default:
        return <Cloud size={size} className={className} />;
    }
  };

  return getIconByCode(weatherCode);
};

export default WeatherIcon;
