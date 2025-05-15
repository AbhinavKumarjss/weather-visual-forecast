
import React from 'react';
import { cn } from "@/lib/utils";

interface WeatherBackgroundProps {
  weatherCondition: string;
  children: React.ReactNode;
  className?: string;
}

const WeatherBackground: React.FC<WeatherBackgroundProps> = ({
  weatherCondition,
  children,
  className
}) => {
  const getBackgroundClass = (condition: string) => {
    const condition_lower = condition.toLowerCase();
    if (condition_lower.includes('clear')) {
      return 'bg-gradient-to-br from-weather-clear to-blue-300';
    } else if (condition_lower.includes('cloud') || condition_lower.includes('overcast')) {
      return 'bg-gradient-to-br from-weather-clouds to-gray-300';
    } else if (condition_lower.includes('rain') || condition_lower.includes('drizzle')) {
      return 'bg-gradient-to-br from-weather-rain to-gray-500';
    } else if (condition_lower.includes('snow')) {
      return 'bg-gradient-to-br from-weather-snow to-gray-200';
    } else if (condition_lower.includes('thunder')) {
      return 'bg-gradient-to-br from-weather-thunderstorm to-slate-600';
    } else if (condition_lower.includes('mist') || condition_lower.includes('fog')) {
      return 'bg-gradient-to-br from-weather-mist to-gray-400';
    }
    return 'bg-gradient-to-br from-blue-400 to-blue-200'; // default
  };

  return (
    <div className={cn(getBackgroundClass(weatherCondition), "min-h-screen transition-colors duration-500", className)}>
      {children}
    </div>
  );
};

export default WeatherBackground;
