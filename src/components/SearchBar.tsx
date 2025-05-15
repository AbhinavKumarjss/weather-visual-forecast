import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { City } from '@/types';
import { fetchCitySuggestions } from '@/utils/api';
import { Card } from '@/components/ui/card';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onSelectCity?: (city: City) => void;
  placeholder?: string;
  className?: string;
  delay?: number;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onSelectCity,
  placeholder = "Search cities...",
  className = "",
  delay = 300
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionRef = useRef<HTMLDivElement>(null);

  // Handle outside clicks to close suggestions
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        suggestionRef.current && 
        !suggestionRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  // Debounced search for main query
  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    timerRef.current = setTimeout(() => {
      onSearch(query);
    }, delay);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [query, delay, onSearch]);

  // Fetch suggestions when query changes
  useEffect(() => {
    const loadSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const results = await fetchCitySuggestions(query);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSuggestions();
  }, [query]);

  const handleSelectSuggestion = (city: City) => {
    setQuery(city.name);
    setSuggestions([]);
    setShowSuggestions(false);
    onSearch(city.name);
    if (onSelectCity) {
      onSelectCity(city);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
      {isLoading && (
        <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 text-gray-500 animate-spin" />
      )}
      <Input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        className="pl-9 pr-4"
        ref={inputRef}
      />
      
      {/* Suggestions dropdown */}
      {showSuggestions && (
        <Card 
          className="absolute z-10 w-full mt-1 max-h-60 overflow-auto shadow-lg"
          ref={suggestionRef}
        >
          <ul className="py-1">
            {suggestions.map((city) => (
              <li 
                key={city.id}
                className="px-4 py-2 hover:bg-muted cursor-pointer flex justify-between items-center"
                onClick={() => handleSelectSuggestion(city)}
              >
                <div>
                  <span className="font-medium">{city.name}</span>
                  <span className="text-sm text-muted-foreground ml-2">{city.cou_name_en}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {city.population.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};

export default SearchBar;
