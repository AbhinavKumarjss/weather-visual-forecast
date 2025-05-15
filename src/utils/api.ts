
import { CityResponse, WeatherData, ForecastData } from '../types';
import { toast } from 'sonner';

const CITIES_API_BASE_URL = 'https://public.opendatasoft.com/api/records/1.0/search/';
const WEATHER_API_BASE_URL = 'https://api.openweathermap.org/data/2.5';
// The OpenWeather API key provided by the user
const OPENWEATHER_API_KEY = '12457bbdef38608347f843fe98475c30';

export const fetchCities = async (
  search: string = '',
  start: number = 0,
  limit: number = 20,
  sort: string = 'name',
  sortDirection: 'asc' | 'desc' = 'asc'
): Promise<CityResponse> => {
  try {
    const searchParam = search ? `&q=${encodeURIComponent(search)}` : '';
    // Fix: Changed the sort format to not include space between sort and direction
    const sortParam = `&sort=${sort}`;
    
    const url = `${CITIES_API_BASE_URL}?dataset=geonames-all-cities-with-a-population-1000&rows=${limit}&start=${start}${searchParam}${sortParam}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch cities: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching cities:', error);
    toast.error('Failed to load cities. Please try again.');
    return { records: [], total_count: 0 };
  }
};

export const fetchWeather = async (lat: number, lon: number): Promise<WeatherData> => {
  try {
    const url = `${WEATHER_API_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch weather: ${response.status}`);
    }
    
    const data: WeatherData = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching weather:', error);
    toast.error('Failed to load current weather data. Please try again.');
    throw error;
  }
};

export const fetchForecast = async (lat: number, lon: number): Promise<ForecastData> => {
  try {
    const url = `${WEATHER_API_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch forecast: ${response.status}`);
    }
    
    const data: ForecastData = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching forecast:', error);
    toast.error('Failed to load forecast data. Please try again.');
    throw error;
  }
};

// Convert city data from API response format to our City type
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
