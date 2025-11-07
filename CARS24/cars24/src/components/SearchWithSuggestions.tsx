"use client";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { getSuggestions } from "@/lib/Carapi";

interface SearchWithSuggestionsProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchWithSuggestions: React.FC<SearchWithSuggestionsProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = "Search cars...",
  className = "",
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch suggestions with debouncing
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await getSuggestions(value, 10);
        // Ensure results is an array
        const suggestionsArray = Array.isArray(results) ? results : [];
        setSuggestions(suggestionsArray);
        setShowSuggestions(suggestionsArray.length > 0);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
        setShowSuggestions(false);
        setIsLoading(false);
      }
    }, 300); // 300ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [value]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setSelectedIndex(-1);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    if (onSearch) {
      onSearch(suggestion);
    }
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === "Enter" && onSearch) {
        onSearch(value);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else if (onSearch) {
          onSearch(value);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleClear = () => {
    onChange("");
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        {value && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showSuggestions && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {isLoading ? (
            <div className="px-4 py-2 text-sm text-gray-500">Loading...</div>
          ) : suggestions.length > 0 ? (
            <ul className="py-1">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`px-4 py-2 cursor-pointer text-sm hover:bg-blue-50 transition-colors ${
                    index === selectedIndex ? "bg-blue-50" : ""
                  }`}
                >
                  <span className="font-medium text-blue-600">
                    {value}
                  </span>
                  <span className="text-gray-700">
                    {suggestion.substring(value.length)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-2 text-sm text-gray-500">
              No suggestions found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchWithSuggestions;

