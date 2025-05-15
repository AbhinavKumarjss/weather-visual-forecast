import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Weather from "./pages/Weather";
import NotFound from "./pages/NotFound";
import { useEffect, useState, useCallback } from "react";
import { WeatherSummary } from "./types";

// Define props that will be passed to Weather component
interface WeatherProps {
  updateWeatherSummary?: (cityName: string, summary: WeatherSummary) => void;
}

// Create a wrapper component that will pass the prop
const WeatherWrapper = ({ updateWeatherSummary }: WeatherProps) => {
  console.log('WeatherWrapper rendering with updateWeatherSummary prop');
  return <Weather updateWeatherSummary={updateWeatherSummary} />;
};

const queryClient = new QueryClient();

const App = () => {
  const [weatherData, setWeatherData] = useState<Record<string, WeatherSummary>>({});

  // Load saved weather data from localStorage on mount
  useEffect(() => {
    console.log('App component mounted, loading weather data from localStorage');
    const savedData = localStorage.getItem('weatherSummaries');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        console.log('Loaded weather data from localStorage:', parsedData);
        setWeatherData(parsedData);
      } catch (error) {
        console.error('Error parsing saved weather data:', error);
      }
    }
  }, []);

  // Update localStorage when weatherData changes
  useEffect(() => {
    if (Object.keys(weatherData).length > 0) {
      console.log('Saving weather data to localStorage:', weatherData);
      localStorage.setItem('weatherSummaries', JSON.stringify(weatherData));
    }
  }, [weatherData]);

  // Create a memoized callback to update weather data
  const handleUpdateWeatherSummary = useCallback((cityName: string, summary: WeatherSummary) => {
    console.log(`Updating weather summary for ${cityName}:`, summary);
    
    // Check if conversion is still needed (in case the API response format changes)
    // If temperatures are already below 100, they're probably already in Celsius
    let convertedSummary: WeatherSummary;
    
    if (summary.temp_max > 100 || summary.temp_min > 100) {
      // Convert from Kelvin to Celsius if values appear to be in Kelvin
      console.log(`Temperature values for ${cityName} appear to be in Kelvin, converting to Celsius`);
      convertedSummary = {
        ...summary,
        temp_max: Number((summary.temp_max - 273.15).toFixed(2)),
        temp_min: Number((summary.temp_min - 273.15).toFixed(2))
      };
    } else {
      // Values already in Celsius, no need to convert
      console.log(`Temperature values for ${cityName} already in Celsius, no conversion needed`);
      convertedSummary = {
        ...summary,
        temp_max: Number(summary.temp_max.toFixed(2)),
        temp_min: Number(summary.temp_min.toFixed(2))
      };
    }
    
    console.log(`Final temperature values for ${cityName}:`, {
      temp_max: convertedSummary.temp_max,
      temp_min: convertedSummary.temp_min
    });
    
    setWeatherData(prev => ({
      ...prev,
      [cityName]: convertedSummary
    }));
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index weatherData={weatherData} />} />
            <Route path="/weather" element={
              <WeatherWrapper 
                updateWeatherSummary={handleUpdateWeatherSummary}
              />
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
