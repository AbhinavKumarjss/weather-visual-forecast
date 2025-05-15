import { CityResponse, WeatherData, ForecastData, City } from '../types';
import { toast } from '@/components/ui/use-toast';

const CITIES_API_BASE_URL = 'https://public.opendatasoft.com/api/records/1.0/search/';
const WEATHER_API_BASE_URL = 'https://api.openweathermap.org/data/2.5';
const OPENWEATHER_API_KEY = '12457bbdef38608347f843fe98475c30';

export const fetchCitySuggestions = async (
  search: string,
  limit: number = 5
): Promise<City[]> => {
  try {
    if (!search || search.length < 2) return [];
    
    const url = `${CITIES_API_BASE_URL}?dataset=geonames-all-cities-with-a-population-1000&rows=${limit}&sort=population&q=${encodeURIComponent(search)}&refine.name=${encodeURIComponent(search)}`;
    
    console.log(`Fetching city suggestions from: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch city suggestions: ${response.status}`);
    }
    
    const data: CityResponse = await response.json();
    
    return convertCityRecords(data.records);
  } catch (error) {
    console.error('Error fetching city suggestions:', error);
    return [];
  }
};

export const fetchCities = async (
  search: string = '',
  start: number = 0,
  limit: number = 20,
  sort: string = 'name',
  sortDirection: 'asc' | 'desc' = 'asc'
): Promise<CityResponse> => {
  try {
    const searchParam = search ? `&q=${encodeURIComponent(search)}` : '';
    
    const sortParam = `&sort=${sortDirection === 'desc' ? '-' : ''}${sort}`;
    
    const url = `${CITIES_API_BASE_URL}?dataset=geonames-all-cities-with-a-population-1000&rows=${limit}&start=${start}${searchParam}${sortParam}`;
    
    console.log(`Fetching cities from: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch cities: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log(`Received ${data.records?.length || 0} cities (of ${data.total_count || 0} total)`);
    
    return data;
  } catch (error) {
    console.error('Error fetching cities:', error);
    toast({
      title: "Error",
      description: "Failed to load cities. Please try again.",
      variant: "destructive",
    });
    return { records: [], total_count: 0 };
  }
};

export const fetchWeather = async (lat: number, lon: number): Promise<WeatherData> => {
  try {
    console.log(`Fetching weather data for coordinates: lat=${lat}, lon=${lon}`);
    const url = `${WEATHER_API_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`;
    console.log(`Weather API URL: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Weather API error (${response.status}): ${errorText}`);
      throw new Error(`Failed to fetch weather: ${response.status} - ${errorText}`);
    }
    
    const data: WeatherData = await response.json();
    console.log('Weather data received successfully:', data);
    console.log(`Original temperature values in Kelvin: temp=${data.main.temp}, min=${data.main.temp_min}, max=${data.main.temp_max}`);
    
    data.main.temp = convertKelvinToCelsius(data.main.temp);
    data.main.temp_min = convertKelvinToCelsius(data.main.temp_min);
    data.main.temp_max = convertKelvinToCelsius(data.main.temp_max);
    data.main.feels_like = convertKelvinToCelsius(data.main.feels_like);
    
    console.log(`Converted temperature values in Celsius: temp=${data.main.temp}, min=${data.main.temp_min}, max=${data.main.temp_max}`);
    
    return data;
  } catch (error) {
    console.error('Error fetching weather:', error);
    toast({
      title: "Error",
      description: "Failed to load current weather data. Please try again.",
      variant: "destructive",
    });
    throw error;
  }
};

export const fetchForecast = async (lat: number, lon: number): Promise<ForecastData> => {
  try {
    console.log(`Fetching forecast data for coordinates: lat=${lat}, lon=${lon}`);
    const url = `${WEATHER_API_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`;
    console.log(`Forecast API URL: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Forecast API error (${response.status}): ${errorText}`);
      throw new Error(`Failed to fetch forecast: ${response.status} - ${errorText}`);
    }
    
    const data: ForecastData = await response.json();
    console.log('Forecast data received successfully:', data);
    
    if (data.list && data.list.length > 0) {
      console.log(`Original first forecast item temperature in Kelvin: ${data.list[0].main.temp}K`);
      
      data.list.forEach(item => {
        item.main.temp = convertKelvinToCelsius(item.main.temp);
        item.main.temp_min = convertKelvinToCelsius(item.main.temp_min);
        item.main.temp_max = convertKelvinToCelsius(item.main.temp_max);
        item.main.feels_like = convertKelvinToCelsius(item.main.feels_like);
      });
      
      console.log(`Converted first forecast item temperature in Celsius: ${data.list[0].main.temp}°C`);
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching forecast:', error);
    toast({
      title: "Error",
      description: "Failed to load forecast data. Please try again.",
      variant: "destructive",
    });
    throw error;
  }
};

const convertKelvinToCelsius = (kelvin: number): number => {
  return Number((kelvin - 273.15).toFixed(2));
};

export const convertCityRecords = (records: CityResponse['records']) => {
  return records.map(record => ({
    id: record.recordid,
    name: record.fields.name,
    cou_name_en: record.fields.cou_name_en,
    timezone: record.fields.timezone,
    coordinates: record.fields.coordinates,
    population: record.fields.population,
    dem: record.fields.dem,
    feature_code: record.fields.feature_code,
    geoname_id: record.fields.geoname_id,
    modification_date: record.fields.modification_date,
  }));
};
