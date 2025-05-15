
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { fetchWeather, fetchForecast } from '@/utils/api';
import { WeatherData, ForecastData } from '@/types';
import WeatherDisplay from '@/components/WeatherDisplay';
import WeatherBackground from '@/components/WeatherBackground';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const Weather = () => {
  const [searchParams] = useSearchParams();
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const lat = parseFloat(searchParams.get('lat') || '0');
  const lon = parseFloat(searchParams.get('lon') || '0');
  const cityName = searchParams.get('name') || 'Unknown City';

  useEffect(() => {
    const loadWeatherData = async () => {
      if (!lat || !lon) {
        setError('Invalid location coordinates');
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch current weather and forecast in parallel
        const [weatherData, forecastData] = await Promise.all([
          fetchWeather(lat, lon),
          fetchForecast(lat, lon)
        ]);
        
        setCurrentWeather(weatherData);
        setForecast(forecastData);
        
        // Store weather summary in localStorage to show on the cities table
        const weatherSummary = {
          temp_max: weatherData.main.temp_max,
          temp_min: weatherData.main.temp_min,
          weather: weatherData.weather[0].icon
        };
        
        // Use cityName as the key to store the weather summary
        const savedWeatherData = localStorage.getItem('weatherSummaries');
        const weatherSummaries = savedWeatherData 
          ? JSON.parse(savedWeatherData) 
          : {};
        
        weatherSummaries[cityName] = weatherSummary;
        localStorage.setItem('weatherSummaries', JSON.stringify(weatherSummaries));
      } catch (err) {
        console.error('Error loading weather data:', err);
        setError('Failed to load weather data. Please try again.');
        toast.error('Failed to load weather data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadWeatherData();
  }, [lat, lon, cityName]);
  
  let weatherCondition = 'default';
  if (currentWeather && currentWeather.weather && currentWeather.weather.length > 0) {
    weatherCondition = currentWeather.weather[0].main;
  }

  return (
    <WeatherBackground weatherCondition={weatherCondition}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center">
          <Link to="/">
            <Button variant="outline" className="bg-white/70 backdrop-blur-sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Cities
            </Button>
          </Link>
          <h1 className="ml-4 text-2xl md:text-3xl font-bold">{cityName}</h1>
        </div>

        {error ? (
          <div className="p-8 bg-white/80 rounded-lg shadow-lg backdrop-blur-sm">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
            <p>{error}</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        ) : (
          currentWeather && (
            <WeatherDisplay 
              currentWeather={currentWeather} 
              forecast={forecast || undefined}
              isLoading={isLoading} 
            />
          )
        )}
      </div>
    </WeatherBackground>
  );
};

export default Weather;
