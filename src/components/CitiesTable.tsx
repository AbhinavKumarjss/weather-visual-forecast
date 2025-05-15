import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchCities, convertCityRecords } from '@/utils/api';
import { City, SortDirection, SortState, WeatherSummary } from '@/types';
import { Button } from '@/components/ui/button';
import SearchBar from './SearchBar';
import { toast } from '@/components/ui/use-toast';
import {
  ArrowDown,
  ArrowUp,
} from 'lucide-react';
import WeatherIcon from './WeatherIcon';
import { Card } from '@/components/ui/card';

interface CitiesTableProps {
  weatherData: Record<string, WeatherSummary>;
}

const CitiesTable: React.FC<CitiesTableProps> = ({ weatherData }) => {
  const [cities, setCities] = useState<City[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<SortState>({ column: 'name', direction: 'asc' });
  const observer = useRef<IntersectionObserver | null>(null);
  const lastCityRef = useRef<HTMLTableRowElement | null>(null);

  const loadCities = useCallback(async (reset = false) => {
    try {
      setIsLoading(true);
      const newPage = reset ? 0 : page;
      
      const data = await fetchCities(
        searchQuery, 
        newPage * 20, 
        20, 
        sort.column, 
        sort.direction
      );
      
      const formattedCities = convertCityRecords(data.records);
      
      setCities(prev => reset ? formattedCities : [...prev, ...formattedCities]);
      setHasMore(formattedCities.length > 0 && cities.length + formattedCities.length < data.total_count);
      
      if (!reset) {
        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error("Error loading cities:", error);
      toast({
        title: "Error",
        description: "Failed to load cities. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, page, sort.column, sort.direction, cities.length]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCities([]);
    setPage(0);
    setHasMore(true);
  }, []);

  const handleSort = useCallback((column: string) => {
    setSort(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCities([]);
    setPage(0);
  }, []);

  useEffect(() => {
    loadCities(true);
  }, [loadCities, searchQuery, sort]);

  useEffect(() => {
    if (isLoading) return;

    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadCities();
      }
    });
    
    if (lastCityRef.current) {
      observer.current.observe(lastCityRef.current);
    }
    
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [isLoading, hasMore, loadCities]);

  const renderSortIcon = (column: string) => {
    if (sort.column !== column) {
      return null;
    }
    
    return sort.direction === 'asc' 
      ? <ArrowUp className="ml-1 h-4 w-4" /> 
      : <ArrowDown className="ml-1 h-4 w-4" />;
  };

  const handleCityContextMenu = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    city: City
  ) => {
    e.stopPropagation();
  };

  return (
    <Card className="w-full overflow-hidden">
      <div className="p-4">
        <SearchBar onSearch={handleSearch} className="mb-4" />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50">
              <th 
                className="p-3 text-left font-medium cursor-pointer"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  City Name
                  {renderSortIcon('name')}
                </div>
              </th>
              <th 
                className="p-3 text-left font-medium cursor-pointer"
                onClick={() => handleSort('cou_name_en')}
              >
                <div className="flex items-center">
                  Country
                  {renderSortIcon('cou_name_en')}
                </div>
              </th>
              <th 
                className="p-3 text-left font-medium cursor-pointer"
                onClick={() => handleSort('timezone')}
              >
                <div className="flex items-center">
                  Timezone
                  {renderSortIcon('timezone')}
                </div>
              </th>
              <th 
                className="p-3 text-left font-medium cursor-pointer"
                onClick={() => handleSort('population')}
              >
                <div className="flex items-center">
                  Population
                  {renderSortIcon('population')}
                </div>
              </th>
              <th className="p-3 text-left font-medium">
                Weather
              </th>
            </tr>
          </thead>
          <tbody>
            {cities.map((city, index) => {
              const isLastItem = index === cities.length - 1;
              const cityWeather = weatherData[city.name];
              
              return (
                <tr 
                  key={city.id} 
                  className="border-b hover:bg-muted/20 transition-colors"
                  ref={isLastItem ? lastCityRef : undefined}
                >
                  <td className="p-3">
                    <Link 
                      to={`/weather?lat=${city.coordinates[1]}&lon=${city.coordinates[0]}&name=${city.name}`}
                      className="text-blue-600 hover:underline"
                      onContextMenu={(e) => handleCityContextMenu(e, city)}
                    >
                      {city.name}
                    </Link>
                  </td>
                  <td className="p-3">{city.cou_name_en}</td>
                  <td className="p-3">{city.timezone}</td>
                  <td className="p-3">{city.population.toLocaleString()}</td>
                  <td className="p-3">
                    {cityWeather ? (
                      <div className="flex items-center space-x-1">
                        <WeatherIcon weatherCode={cityWeather.weather} size={16} />
                        <span className="ml-1">
                          {cityWeather.temp_min.toFixed(1)}° - {cityWeather.temp_max.toFixed(1)}°
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {isLoading && (
        <div className="p-4 text-center">
          <div className="animate-pulse flex justify-center">
            Loading more cities...
          </div>
        </div>
      )}
      
      {!isLoading && !hasMore && cities.length > 0 && (
        <div className="p-4 text-center text-muted-foreground">
          No more cities to load
        </div>
      )}
      
      {!isLoading && cities.length === 0 && (
        <div className="p-4 text-center">
          <p className="text-muted-foreground">No cities found</p>
          <Button 
            onClick={() => {
              setSearchQuery('');
              loadCities(true);
            }} 
            variant="outline" 
            className="mt-2"
          >
            Clear search
          </Button>
        </div>
      )}
    </Card>
  );
};

export default CitiesTable;
