
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { fetchWeather, fetchForecast } from '@/utils/api';
import { WeatherData, ForecastData } from '@/types';
import WeatherDisplay from '@/components/WeatherDisplay';
import WeatherBackground from '@/components/WeatherBackground';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const Weather = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Parse the coordinates and validate them
  const lat = parseFloat(searchParams.get('lat') || '');
  const lon = parseFloat(searchParams.get('lon') || '');
  const cityName = searchParams.get('name') || 'Unknown City';

  // Validate coordinates
  const isValidCoordinates = !isNaN(lat) && !isNaN(lon) && 
                              lat >= -90 && lat <= 90 && 
                              lon >= -180 && lon <= 180;

  useEffect(() => {
    const loadWeatherData = async () => {
      if (!isValidCoordinates) {
        setError('Invalid location coordinates');
        setIsLoading(false);
        toast({
          title: "Error",
          description: "Invalid location coordinates",
          variant: "destructive",
        });
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
        toast({
          title: "Error",
          description: "Failed to load weather data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadWeatherData();
  }, [lat, lon, cityName, isValidCoordinates]);
  
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

        {!isValidCoordinates && (
          <Alert variant="destructive" className="mb-6 bg-white/80 backdrop-blur-sm">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              The provided location coordinates are invalid. Please return to the city selection page.
            </AlertDescription>
            <Button 
              className="mt-4" 
              variant="secondary"
              onClick={() => navigate('/')}
            >
              Go to Cities
            </Button>
          </Alert>
        )}

        {error && isValidCoordinates && (
          <div className="p-8 bg-white/80 rounded-lg shadow-lg backdrop-blur-sm">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
            <p>{error}</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        )}
        
        {isValidCoordinates && !error && currentWeather && (
          <WeatherDisplay 
            currentWeather={currentWeather} 
            forecast={forecast || undefined}
            isLoading={isLoading} 
          />
        )}
      </div>
    </WeatherBackground>
  );
};

export default Weather;
