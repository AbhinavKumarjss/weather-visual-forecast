
import React from 'react';
import { WeatherData, ForecastData } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Cloud,
  CloudDrizzle,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Sun,
  Wind,
  Thermometer,
  Calendar,
} from 'lucide-react';
import WeatherIcon from './WeatherIcon';
import { Separator } from '@/components/ui/separator';

interface WeatherDisplayProps {
  currentWeather: WeatherData;
  forecast?: ForecastData;
  isLoading: boolean;
}

const WeatherDisplay: React.FC<WeatherDisplayProps> = ({
  currentWeather,
  forecast,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="bg-slate-200 h-8 w-40 rounded mb-4"></div>
          <div className="bg-slate-200 h-16 w-16 rounded-full mb-4"></div>
          <div className="bg-slate-200 h-6 w-24 rounded"></div>
        </div>
      </div>
    );
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Group forecast by day
  const groupForecastByDay = () => {
    if (!forecast) return [];

    const days: Record<string, ForecastData['list'][0][]> = {};
    
    forecast.list.forEach((item) => {
      const date = new Date(item.dt * 1000).toDateString();
      
      if (!days[date]) {
        days[date] = [];
      }
      
      days[date].push(item);
    });

    return Object.entries(days).map(([date, items]) => {
      // Calculate min and max temperatures for the day
      const temps = items.map((item) => item.main.temp);
      const minTemp = Math.min(...temps);
      const maxTemp = Math.max(...temps);
      
      // Use noon forecast or the first one for the day's weather
      const dayForecast = items.find((item) => {
        const hour = new Date(item.dt * 1000).getHours();
        return hour >= 12 && hour <= 14;
      }) || items[0];
      
      return {
        date: new Date(date),
        minTemp,
        maxTemp,
        weather: dayForecast.weather[0],
        timestamp: dayForecast.dt,
      };
    }).slice(0, 5); // Only show 5 days forecast
  };

  const dailyForecasts = forecast ? groupForecastByDay() : [];

  return (
    <div className="space-y-6">
      {/* Current Weather Card */}
      <Card className="backdrop-blur-sm bg-white/80 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-center text-2xl">Current Weather</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <h2 className="text-3xl font-bold">{currentWeather.name}, {currentWeather.sys.country}</h2>
              <p className="text-muted-foreground">{formatDate(currentWeather.dt)}</p>
              <div className="mt-2">
                <p className="text-lg capitalize">{currentWeather.weather[0].description}</p>
              </div>
            </div>
            
            <div className="text-center flex flex-col items-center">
              <WeatherIcon weatherCode={currentWeather.weather[0].icon} size={80} className="text-primary mb-2" />
              <h1 className="text-5xl font-bold">{Math.round(currentWeather.main.temp)}°C</h1>
              <p className="text-sm">Feels like: {Math.round(currentWeather.main.feels_like)}°C</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-4 md:mt-0">
              <div className="flex items-center">
                <Thermometer className="h-5 w-5 mr-2 text-red-500" />
                <div>
                  <p className="text-xs text-muted-foreground">High</p>
                  <p>{Math.round(currentWeather.main.temp_max)}°C</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Thermometer className="h-5 w-5 mr-2 text-blue-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Low</p>
                  <p>{Math.round(currentWeather.main.temp_min)}°C</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Wind className="h-5 w-5 mr-2 text-gray-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Wind</p>
                  <p>{Math.round(currentWeather.wind.speed)} m/s</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Cloud className="h-5 w-5 mr-2 text-blue-300" />
                <div>
                  <p className="text-xs text-muted-foreground">Humidity</p>
                  <p>{currentWeather.main.humidity}%</p>
                </div>
              </div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Pressure</p>
              <p>{currentWeather.main.pressure} hPa</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Visibility</p>
              <p>{(currentWeather.visibility / 1000).toFixed(1)} km</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Sunrise</p>
              <p>{formatTime(currentWeather.sys.sunrise)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Sunset</p>
              <p>{formatTime(currentWeather.sys.sunset)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Forecast Card */}
      {forecast && (
        <Card className="backdrop-blur-sm bg-white/80 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              5-Day Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              {dailyForecasts.map((day, index) => (
                <div key={index} className="text-center p-3 rounded-lg bg-white/60 shadow-sm">
                  <p className="font-medium">{day.date.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                  <div className="my-2">
                    <WeatherIcon weatherCode={day.weather.icon} size={40} className="mx-auto" />
                  </div>
                  <p className="text-xs capitalize">{day.weather.description}</p>
                  <div className="flex justify-center space-x-2 mt-1">
                    <span className="text-sm font-medium">{Math.round(day.maxTemp)}°</span>
                    <span className="text-sm text-muted-foreground">{Math.round(day.minTemp)}°</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WeatherDisplay;
