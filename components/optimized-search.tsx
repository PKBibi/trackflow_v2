'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { debounce } from '@/lib/performance';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface OptimizedSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
  autoFocus?: boolean;
  loading?: boolean;
  initialValue?: string;
  className?: string;
  onClear?: () => void;
}

export function OptimizedSearch({
  onSearch,
  placeholder = 'Search...',
  debounceMs = 300,
  autoFocus = false,
  loading = false,
  initialValue = '',
  className = '',
  onClear,
}: OptimizedSearchProps) {
  const [value, setValue] = useState(initialValue);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const debouncedSearch = useMemo(
    () =>
      debounce((query: string) => {
        setIsSearching(false);
        onSearch(query);
      }, debounceMs),
    [onSearch, debounceMs]
  );
  
  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    
    if (newValue.trim()) {
      setIsSearching(true);
      debouncedSearch(newValue);
    } else {
      setIsSearching(false);
      onSearch('');
    }
  };
  
  // Handle clear
  const handleClear = useCallback(() => {
    setValue('');
    setIsSearching(false);
    onSearch('');
    onClear?.();
    inputRef.current?.focus();
  }, [onSearch, onClear]);
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus search on "/" key (when not in input)
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      
      // Clear on Escape
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        handleClear();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClear]);
  
  // Update value when initialValue changes
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);
  
  const showLoader = loading || isSearching;
  
  return (
    <div className={`relative ${className}`} data-search-input>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        
        <Input
          ref={inputRef}
          type="search"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="pl-10 pr-20"
          aria-label="Search"
        />
        
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {showLoader && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
          
          {value && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-6 w-6 p-0"
              aria-label="Clear search"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          
          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-60">
            /
          </kbd>
        </div>
      </div>
    </div>
  );
}

// Search with suggestions dropdown
interface SearchWithSuggestionsProps extends OptimizedSearchProps {
  suggestions?: string[];
  onSelectSuggestion?: (suggestion: string) => void;
  recentSearches?: string[];
}

export function SearchWithSuggestions({
  suggestions = [],
  onSelectSuggestion,
  recentSearches = [],
  ...searchProps
}: SearchWithSuggestionsProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = suggestions.length > 0 ? suggestions : recentSearches;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < items.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : items.length - 1
        );
        break;
      case 'Enter':
        if (selectedIndex >= 0 && selectedIndex < items.length) {
          e.preventDefault();
          const selected = items[selectedIndex];
          onSelectSuggestion?.(selected);
          setShowDropdown(false);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };
  
  const displayItems = suggestions.length > 0 ? suggestions : recentSearches;
  const shouldShowDropdown = showDropdown && displayItems.length > 0;
  
  return (
    <div className="relative" ref={dropdownRef}>
      <div onKeyDown={handleKeyDown}>
        <OptimizedSearch
          {...searchProps}
          onSearch={(query) => {
            setShowDropdown(query.length > 0 || recentSearches.length > 0);
            searchProps.onSearch(query);
          }}
        />
      </div>
      
      {shouldShowDropdown && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-64 overflow-auto rounded-lg border bg-popover shadow-lg">
          {suggestions.length > 0 ? (
            <div className="p-2">
              <div className="text-xs font-medium text-muted-foreground px-2 py-1">
                Suggestions
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion}
                  className={`w-full text-left px-2 py-1.5 text-sm rounded hover:bg-accent ${
                    index === selectedIndex ? 'bg-accent' : ''
                  }`}
                  onClick={() => {
                    onSelectSuggestion?.(suggestion);
                    setShowDropdown(false);
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          ) : recentSearches.length > 0 ? (
            <div className="p-2">
              <div className="text-xs font-medium text-muted-foreground px-2 py-1">
                Recent searches
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={search}
                  className={`w-full text-left px-2 py-1.5 text-sm rounded hover:bg-accent flex items-center gap-2 ${
                    index === selectedIndex ? 'bg-accent' : ''
                  }`}
                  onClick={() => {
                    onSelectSuggestion?.(search);
                    setShowDropdown(false);
                  }}
                >
                  <Search className="h-3 w-3 text-muted-foreground" />
                  {search}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}


