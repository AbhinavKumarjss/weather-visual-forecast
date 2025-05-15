
import React, { useState } from 'react';
import CitiesTable from '@/components/CitiesTable';
import { WeatherSummary } from '@/types';

const Index = () => {
  // This state will store weather data summaries keyed by city name
  // It will be populated when users view weather for cities
  const [weatherData, setWeatherData] = useState<Record<string, WeatherSummary>>({});

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Weather App</h1>
        <p className="text-muted-foreground mb-6">Search and view weather forecasts for cities worldwide</p>
        
        <CitiesTable weatherData={weatherData} />
      </div>
    </div>
  );
};

export default Index;
