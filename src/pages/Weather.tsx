import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchWeather, fetchForecast } from '@/utils/api';
import { WeatherData, ForecastData, WeatherSummary } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import WeatherIcon from '@/components/WeatherIcon';
import { toast } from '@/components/ui/use-toast';
import LocationMap from '@/components/LocationMap';

interface WeatherProps {
  updateWeatherSummary?: (cityName: string, summary: WeatherSummary) => void;
}

const Weather: React.FC<WeatherProps> = ({ updateWeatherSummary }) => {
  const [searchParams] = useSearchParams();
  const lat = parseFloat(searchParams.get('lat') || '0');
  const lon = parseFloat(searchParams.get('lon') || '0');
  const cityName = searchParams.get('name') || 'Unknown City';
  
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log(`Weather component mounted with params: lat=${lat}, lon=${lon}, name=${cityName}`);
    console.log(`updateWeatherSummary prop is ${updateWeatherSummary ? 'provided' : 'not provided'}`);
    
    const loadWeatherData = async () => {
      if (!lat || !lon) {
        console.error('Invalid coordinates:', { lat, lon });
        setError('Invalid location parameters');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Starting fetch for both weather and forecast data');
        
        const weatherData = await fetchWeather(lat, lon);
        console.log('Weather data loaded:', weatherData);
        console.log('Temperature values from API:', {
          temp: weatherData.main.temp,
          feels_like: weatherData.main.feels_like,
          temp_min: weatherData.main.temp_min,
          temp_max: weatherData.main.temp_max
        });
        setCurrentWeather(weatherData);
        
        const forecastData = await fetchForecast(lat, lon);  
        console.log('Forecast data loaded:', forecastData);
        if (forecastData.list && forecastData.list.length > 0) {
          console.log('Sample forecast temperatures:', forecastData.list.slice(0, 3).map(item => ({
            time: new Date(item.dt * 1000).toLocaleTimeString(),
            temp: item.main.temp,
            min: item.main.temp_min,
            max: item.main.temp_max
          })));
        }
        setForecast(forecastData);
        
        if (updateWeatherSummary && weatherData.weather && weatherData.weather[0]) {
          console.log('Updating weather summary in parent component');
          
          updateWeatherSummary(cityName, {
            temp_max: weatherData.main.temp_max,
            temp_min: weatherData.main.temp_min,
            weather: weatherData.weather[0].icon
          });
        }
      } catch (err) {
        console.error('Error loading weather data:', err);
        setError('Failed to load weather data. Please try again.');
        setCurrentWeather(null);
        setForecast(null);
        toast({
          title: "Error",
          description: "Failed to load weather data. Please try again.",
          variant: "destructive",
        });
      } finally {
        console.log('Finished loading weather data');
        setIsLoading(false);
      }
    };

    loadWeatherData();
    
    return () => {
      console.log('Weather component unmounting');
    };
  }, [lat, lon, cityName, updateWeatherSummary]);

  const groupedForecast = React.useMemo(() => {
    if (!forecast || !forecast.list || !Array.isArray(forecast.list)) {
      console.log('No forecast data to group');
      return [];
    }
    
    console.log(`Grouping forecast data with ${forecast.list.length} items`);
    const grouped: Record<string, typeof forecast.list> = {};
    
    forecast.list.forEach(item => {
      const dateObj = new Date(item.dt * 1000);
      const dateStr = dateObj.toISOString().split('T')[0];
      
      if (!grouped[dateStr]) {
        grouped[dateStr] = [];
      }
      grouped[dateStr].push(item);
    });
    
    const result = Object.entries(grouped).map(([dateStr, items]) => {
      const temps = items.map(item => item.main.temp);
      const minTemp = Math.min(...temps);
      const maxTemp = Math.max(...temps);
      
      return {
        dateStr,
        items,
        minTemp,
        maxTemp,
        icon: items[Math.floor(items.length / 2)]?.weather[0]?.icon || '01d'
      };
    });
    
    console.log(`Grouped forecast into ${result.length} days`);
    return result;
  }, [forecast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-xl">Loading weather data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="container mx-auto">
          <Link to="/">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Cities
            </Button>
          </Link>
          
          <Card className="p-6 text-center">
            <h2 className="text-xl font-bold text-red-500 mb-2">Error</h2>
            <p>{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
            >
              Try Again
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (!currentWeather) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="container mx-auto">
          <Link to="/">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Cities
            </Button>
          </Link>
          
          <Card className="p-6 text-center">
            <h2 className="text-xl font-bold mb-2">No Data Available</h2>
            <p>Weather data could not be loaded for this location.</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto">
        <Link to="/">
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Cities
          </Button>
        </Link>
        
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">{cityName}</h1>
              <p className="text-muted-foreground mb-4">{currentWeather.sys.country}</p>
              
              <div className="flex items-center mb-4">
                <WeatherIcon 
                  weatherCode={currentWeather.weather[0].icon} 
                  size={64} 
                />
                <div className="ml-4">
                  <div className="text-4xl font-bold">
                    {currentWeather.main.temp ? Math.round(currentWeather.main.temp) : 'N/A'}°C
                  </div>
                  <div className="text-lg capitalize">
                    {currentWeather.weather[0].description}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4 md:mt-0">
              <div>
                <p className="text-sm text-muted-foreground">Feels Like</p>
                <p className="font-medium">{currentWeather.main.feels_like ? Math.round(currentWeather.main.feels_like) : 'N/A'}°C</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Humidity</p>
                <p className="font-medium">{currentWeather.main.humidity ?? 'N/A'}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Wind</p>
                <p className="font-medium">{currentWeather.wind.speed ? Math.round(currentWeather.wind.speed) : 'N/A'} m/s</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pressure</p>
                <p className="font-medium">{currentWeather.main.pressure ?? 'N/A'} hPa</p>
              </div>
            </div>
          </div>
        </Card>
        
        <h2 className="text-xl font-bold mb-4">Location</h2>
        <Card className="p-4 mb-6">
          <LocationMap 
            latitude={lat} 
            longitude={lon} 
            cityName={cityName} 
          />
        </Card>
        
        <h2 className="text-xl font-bold mb-4">5-Day Forecast</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {groupedForecast.slice(0, 5).map((day, index) => {
            const forecastDate = new Date(day.dateStr);
            
            return (
              <Card key={index} className="p-4">
                <p className="font-medium mb-2">
                  {forecastDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </p>
                <div className="flex items-center justify-between">
                  <WeatherIcon weatherCode={day.icon} size={40} />
                  <div className="text-right">
                    <p className="font-bold">{day.maxTemp !== undefined ? Math.round(day.maxTemp) : 'N/A'}°</p>
                    <p className="text-muted-foreground">{day.minTemp !== undefined ? Math.round(day.minTemp) : 'N/A'}°</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
        
                {forecast && forecast.list && (          <React.Fragment>            <h2 className="text-xl font-bold mt-6 mb-4">Hourly Forecast</h2>            <div className="overflow-x-auto">              <div className="flex space-x-4 pb-4" style={{ minWidth: 'max-content' }}>                {forecast.list.slice(0, 8).map((item, index) => {                  const forecastTime = new Date(item.dt * 1000);                                    return (                    <Card key={index} className="p-3 w-24">                      <p className="text-sm font-medium text-center mb-2">                        {forecastTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}                      </p>                      <div className="flex flex-col items-center">                        <WeatherIcon weatherCode={item.weather[0].icon} size={32} />                        <p className="font-bold mt-1">{item.main.temp !== undefined ? Math.round(item.main.temp) : 'N/A'}°</p>                      </div>                    </Card>                  );                })}              </div>            </div>          </React.Fragment>        )}
      </div>
    </div>
  );
};

export default Weather;
