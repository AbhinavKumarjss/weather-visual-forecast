
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Weather from "./pages/Weather";
import NotFound from "./pages/NotFound";
import { useEffect, useState } from "react";
import { WeatherSummary } from "./types";

const queryClient = new QueryClient();

const App = () => {
  const [weatherData, setWeatherData] = useState<Record<string, WeatherSummary>>({});

  // Load saved weather data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('weatherSummaries');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setWeatherData(parsedData);
      } catch (error) {
        console.error('Error parsing saved weather data:', error);
      }
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/weather" element={<Weather />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
