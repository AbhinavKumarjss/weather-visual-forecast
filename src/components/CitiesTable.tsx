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
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastRowRef = useRef<HTMLTableRowElement | null>(null);
  
  const loadCities = useCallback(async (reset = false) => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      const startIndex = reset ? 0 : page * 20;
      
      const data = await fetchCities(
        searchQuery, 
        startIndex, 
        20, 
        sort.column, 
        sort.direction
      );
      
      const formattedCities = convertCityRecords(data.records);
      
      if (reset) {
        setCities(formattedCities);
        setPage(1);
      } else {
        setCities(prev => [...prev, ...formattedCities]);
        setPage(prev => prev + 1);
      }
      
      setHasMore(formattedCities.length === 20);
      
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
  }, [searchQuery, page, sort.column, sort.direction]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleSelectCity = useCallback((city: City) => {
    setCities([city]);
    setHasMore(false);
  }, []);

  const handleSort = useCallback((column: string) => {
    setSort(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  useEffect(() => {
    setCities([]);
    setPage(0);
    setHasMore(true);
    loadCities(true);
  }, [searchQuery, sort]);

  useEffect(() => {
    if (isLoading || !hasMore) return;

    const handleObserver = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        loadCities(false);
      }
    };
    
    const observer = new IntersectionObserver(handleObserver, { 
      rootMargin: '100px',
      threshold: 0.1 
    });
    
    const currentLastRowRef = lastRowRef.current;
    
    if (currentLastRowRef) {
      observer.observe(currentLastRowRef);
    }
    
    observerRef.current = observer;
    
    return () => {
      if (currentLastRowRef && observer) {
        observer.unobserve(currentLastRowRef);
        observer.disconnect();
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
        <SearchBar 
          onSearch={handleSearch} 
          onSelectCity={handleSelectCity}
          className="mb-4" 
        />
      </div>

      <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-background shadow-sm">
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
              const cityWeather = weatherData[city.name];
              const isLastRow = index === cities.length - 1;
              
              return (
                <tr 
                  key={city.id} 
                  ref={isLastRow ? lastRowRef : undefined}
                  className="border-b hover:bg-muted/20 transition-colors"
                >
                  <td className="p-3">
                    <Link 
                      to={`/weather?lon=${city.coordinates[1]}&lat=${city.coordinates[0]}&name=${city.name}`}
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
                          {Math.round(cityWeather.temp_min)}° - {Math.round(cityWeather.temp_max)}°
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
      
      <div className="p-4 h-[60px] flex items-center justify-center border-t">
        {isLoading && (
          <div className="flex items-center space-x-2">
            <svg className="animate-spin h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Loading cities...</span>
          </div>
        )}
        
        {!isLoading && !hasMore && cities.length > 0 && (
          <div className="text-center text-muted-foreground">
            End of results
          </div>
        )}
        
        {!isLoading && cities.length === 0 && (
          <div className="text-center">
            <p className="text-muted-foreground">No cities found</p>

          </div>
        )}
      </div>
    </Card>
  );
};

export default CitiesTable;
