"use client";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import SearchWithSuggestions from "@/components/SearchWithSuggestions";
import LocationSelector from "@/components/location/LocationSelector";
import ServiceCentersMap from "@/components/map/ServiceCentersMap";
import { getServiceCentersForLocation, type ServiceCenterWithDistance } from "@/data/serviceCenters";
import { searchCars, type SearchResult } from "@/lib/Carapi";
import type { LocationSelection } from "@/lib/location";
import {
  AlertCircle,
  Clock,
  Heart,
  MapPin,
  Phone,
  Route,
  Sliders,
  ShoppingCart,
  Store,
  X,
} from "lucide-react";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";

interface Car {
  id: string;
  title: string;
  km: string;
  fuel: string;
  transmission: string;
  owner: string;
  emi: string;
  price: string;
  location: string;
  image: string;
  year?: number;
  relevanceScore?: number;
}

function LoaderCard() {
  return (
    <div className="bg-white rounded-lg shadow-md animate-pulse overflow-hidden">
      <div className="h-48 bg-gray-200"></div>
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
      </div>
    </div>
  );
}

const index = () => {
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter states
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [fuelType, setFuelType] = useState<string>("");
  const [transmission, setTransmission] = useState<string>("");
  const [minYear, setMinYear] = useState<number | undefined>(undefined);
  const [maxYear, setMaxYear] = useState<number | undefined>(undefined);
  const [mileageRange, setMileageRange] = useState([0, 200000]);
  const [location, setLocation] = useState("");
  const [locationLabel, setLocationLabel] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [userCoordinates, setUserCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyServiceCenters, setNearbyServiceCenters] = useState<ServiceCenterWithDistance[]>([]);
  const [locationError, setLocationError] = useState<string | null>(null);

  const handleLocationSelect = useCallback(
    (selection: LocationSelection) => {
      const cleanedCity = selection.city.trim();
      setSelectedCity(cleanedCity);
      setLocation(cleanedCity);
      setLocationLabel(selection.formattedAddress || cleanedCity);
      setUserCoordinates(selection.coordinates ?? null);
      setLocationError(null);
    },
    []
  );

  const handleLocationClear = useCallback(() => {
    setLocation("");
    setSelectedCity("");
    setLocationLabel("");
    setUserCoordinates(null);
    setNearbyServiceCenters([]);
    setLocationError(null);
  }, []);

  const handleLocationError = useCallback((message: string | null) => {
    setLocationError(message);
  }, []);
  
  // UI state
  const [cars, setCars] = useState<Car[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [showFilters, setShowFilters] = useState(true);

  // Generate year options
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  useEffect(() => {
    if (!selectedCity && !userCoordinates) {
      setNearbyServiceCenters([]);
      return;
    }

    const centers = getServiceCentersForLocation({
      city: selectedCity || undefined,
      coordinates: userCoordinates ?? undefined,
      limit: 6,
    });

    setNearbyServiceCenters(centers);
  }, [selectedCity, userCoordinates]);

  // Transform search results to Car format
  const transformCar = (result: SearchResult): Car => ({
    id: result.Id,
    title: result.Title,
    km: result.km,
    fuel: result.Fuel,
    transmission: result.Transmission,
    owner: result.Owner,
    emi: result.Emi,
    price: result.Price,
    location: result.Location,
    image: Array.isArray(result.image) 
      ? result.image[0] || "" 
      : result.image || "",
    year: result.Year,
    relevanceScore: result.RelevanceScore,
  });

  // Perform search
  const performSearch = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await searchCars({
        query: searchQuery || undefined,
        fuelType: fuelType || undefined,
        transmission: transmission || undefined,
        minYear: minYear,
        maxYear: maxYear,
        minMileage: mileageRange[0] > 0 ? mileageRange[0] : undefined,
        maxMileage: mileageRange[1] < 200000 ? mileageRange[1] : undefined,
        minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
        maxPrice: priceRange[1] < 10000000 ? priceRange[1] : undefined,
        location: location || undefined,
        limit: 50,
      });

      // Ensure results is an array before mapping
      const results = Array.isArray(response?.results) ? response.results : [];
      const transformedCars = results.map(transformCar);
      setCars(transformedCars);
      setTotalResults(response?.total || 0);
    } catch (error) {
      console.error("Error searching cars:", error);
      setCars([]);
      setTotalResults(0);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, fuelType, transmission, minYear, maxYear, mileageRange, priceRange, location]);

  // Debounced search - separate effect for search query, immediate for filters
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch();
    }, searchQuery ? 500 : 0); // Debounce only for search query, immediate for filters

    return () => clearTimeout(timeoutId);
  }, [performSearch, searchQuery]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setPriceRange([0, 10000000]);
    setFuelType("");
    setTransmission("");
    setMinYear(undefined);
    setMaxYear(undefined);
    setMileageRange([0, 200000]);
    handleLocationClear();
  };

  const hasActiveFilters = 
    searchQuery ||
    fuelType ||
    transmission ||
    minYear !== undefined ||
    maxYear !== undefined ||
    mileageRange[0] > 0 ||
    mileageRange[1] < 200000 ||
    priceRange[0] > 0 ||
    priceRange[1] < 10000000 ||
    location;

  const formatNumberForDisplay = (value: number) => {
    const absolute = Math.trunc(Math.abs(value));
    const digits = absolute.toString().split('').reverse();
    const parts: string[] = [];

    for (let idx = 0; idx < digits.length; idx++) {
      parts.push(digits[idx]);
      if (idx === 2 || (idx > 2 && (idx - 2) % 2 === 0)) {
        parts.push(',');
      }
    }

    if (parts[parts.length - 1] === ',') {
      parts.pop();
    }

    const formatted = parts.reverse().join('');
    return value < 0 ? `-${formatted}` : formatted;
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white text-black">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white p-4 rounded-lg shadow sticky top-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">Filters</h3>
                {hasActiveFilters && (
                  <button
                    onClick={handleClearFilters}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <X className="h-4 w-4" />
                    Clear All
                  </button>
                )}
              </div>
              
              <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                {/* Year Range */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Year of Manufacture
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                      value={minYear || ""}
                      onChange={(e) => setMinYear(e.target.value ? parseInt(e.target.value) : undefined)}
                    >
                      <option value="">Min Year</option>
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                    <select
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                      value={maxYear || ""}
                      onChange={(e) => setMaxYear(e.target.value ? parseInt(e.target.value) : undefined)}
                    >
                      <option value="">Max Year</option>
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Price Range (₹)
                  </label>
                  <Slider
                    min={0}
                    max={10000000}
                    step={50000}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="mt-2"
                  />
                  <div className="flex justify-between mt-2 text-xs text-gray-600">
                    <span>₹{(priceRange[0] / 100000).toFixed(1)}L</span>
                    <span>₹{(priceRange[1] / 100000).toFixed(1)}L</span>
                  </div>
                </div>

                {/* Mileage Range */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Mileage Range (km)
                  </label>
                  <Slider
                    min={0}
                    max={200000}
                    step={5000}
                    value={mileageRange}
                    onValueChange={setMileageRange}
                    className="mt-2"
                  />
                  <div className="flex justify-between mt-2 text-xs text-gray-600">
                    <span>{formatNumberForDisplay(mileageRange[0])} km</span>
                    <span>{formatNumberForDisplay(mileageRange[1])} km</span>
                  </div>
                </div>

                {/* Location */}
                <LocationSelector
                  selectedLabel={locationLabel}
                  onSelect={handleLocationSelect}
                  onClear={handleLocationClear}
                  onError={handleLocationError}
                  />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-bold">Used Cars</h1>
                {totalResults > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    {totalResults} {totalResults === 1 ? "car found" : "cars found"}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="flex-1 sm:flex-initial sm:w-80">
                  <SearchWithSuggestions
                    value={searchQuery}
                    onChange={setSearchQuery}
                    onSearch={performSearch}
                    placeholder="Search by brand, model, or location..."
                  />
                </div>
                <Button
                  variant="outline"
                  className="flex items-center text-gray-700 hover:text-blue-600"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Sliders className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>

            {locationError && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{locationError}</span>
              </div>
            )}

            {locationLabel && (
              <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>
                  Showing listings near <span className="font-semibold">{locationLabel}</span>. Update the city to explore other regions.
                </span>
              </div>
            )}

            {(locationLabel || nearbyServiceCenters.length > 0) && (
              <section className="mb-6">
                <div className="rounded-lg bg-white p-4 shadow">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <Store className="h-5 w-5 text-blue-600" />
                        Nearby service support
                      </h2>
                      <p className="text-sm text-gray-500">
                        {locationLabel
                          ? `Based on ${locationLabel}.`
                          : "Select a city or use your current location to discover service centers and pickup points near you."}
                      </p>
                    </div>
                    {locationLabel && (
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                        {locationLabel}
                      </span>
                    )}
                  </div>
                  <div className="mt-4 grid gap-4 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                      <ServiceCentersMap
                        serviceCenters={nearbyServiceCenters}
                        center={userCoordinates}
                        fallbackCenter={nearbyServiceCenters[0] ? { lat: nearbyServiceCenters[0].lat, lng: nearbyServiceCenters[0].lng } : undefined}
                        className="min-h-[280px]"
                      />
                    </div>
                    <div className="space-y-3">
                      {nearbyServiceCenters.length > 0 ? (
                        nearbyServiceCenters.map((center) => (
                          <div
                            key={center.id}
                            className="rounded-lg border border-gray-200 p-3 shadow-sm transition hover:border-blue-200"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-semibold text-gray-900">{center.name}</p>
                                <p className="text-xs text-gray-500">{center.address}</p>
                              </div>
                              <span
                                className={`rounded-full px-2 py-1 text-[11px] font-medium ${
                                  center.type === "service"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-orange-100 text-orange-700"
                                }`}
                              >
                                {center.type === "service" ? "Service Hub" : "Pickup Point"}
                              </span>
                            </div>
                            {center.distanceKm !== undefined && (
                              <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                                <Route className="h-3.5 w-3.5 text-gray-400" />
                                {center.distanceKm} km away
                              </div>
                            )}
                            {center.hours && (
                              <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                                <Clock className="h-3.5 w-3.5 text-gray-400" />
                                {center.hours}
                              </div>
                            )}
                            {center.phone && (
                              <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                                <Phone className="h-3.5 w-3.5 text-gray-400" />
                                {center.phone}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="rounded-md border border-dashed border-blue-200 bg-blue-50/70 p-3 text-xs text-blue-600">
                          Choose a city to view certified service centers and convenient pickup points nearby.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Results */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <LoaderCard key={index} />
                ))}
              </div>
            ) : cars && cars.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cars.map((car) => (
                    <div
                      key={car.id}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
                    >
                      <Link href={`/buy-car/${car.id}`} className="flex-1">
                        <div className="relative h-48">
                          <img
                            src={car.image || "https://via.placeholder.com/400x300?text=No+Image"}
                            alt={car.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x300?text=No+Image";
                            }}
                          />
                          <button
                            className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full hover:bg-white z-10"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                          >
                            <Heart className="h-4 w-4 text-gray-500 hover:text-red-500" />
                          </button>
                          {car.relevanceScore && car.relevanceScore > 50 && (
                            <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs rounded">
                              Best Match
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                            {car.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 mb-2 text-xs text-gray-600">
                            <span>{car.km} km</span>
                            <span>•</span>
                            <span>{car.transmission}</span>
                            <span>•</span>
                            <span>{car.fuel}</span>
                            {car.year && (
                              <>
                                <span>•</span>
                                <span>{car.year}</span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <div className="text-xs text-gray-600">EMI from</div>
                              <div className="font-semibold text-sm">{car.emi}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-600">Price</div>
                              <div className="font-semibold">{car.price}</div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {car.location}
                          </div>
                        </div>
                      </Link>
                      <div className="p-4 pt-0">
                        <Link href={`/buy-car/${car.id}`}>
                          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-all">
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Buy Car
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-2">No cars found</p>
                <p className="text-gray-400 text-sm">
                  Try adjusting your search criteria or filters
                </p>
                {hasActiveFilters && (
                  <Button
                    onClick={handleClearFilters}
                    className="mt-4"
                    variant="outline"
                  >
                    Clear All Filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default index;
