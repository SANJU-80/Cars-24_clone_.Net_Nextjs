"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, LocateFixed, MapPin, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  type CityPrediction,
  type LocationSelection,
  getCityDetails,
  getCityPredictions,
  isGoogleMapsConfigured,
  loadGoogleMaps,
  reverseGeocode,
} from "@/lib/location";

interface LocationSelectorProps {
  selectedLabel?: string;
  onSelect(selection: LocationSelection): void;
  onClear(): void;
  onError?(message: string | null): void;
}

const LocationSelector = ({
  selectedLabel,
  onSelect,
  onClear,
  onError,
}: LocationSelectorProps) => {
  const [inputValue, setInputValue] = useState(selectedLabel ?? "");
  const [predictions, setPredictions] = useState<CityPrediction[]>([]);
  const [isFetchingPredictions, setIsFetchingPredictions] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isMapsReady, setIsMapsReady] = useState(() => isGoogleMapsConfigured());

  useEffect(() => {
    setInputValue(selectedLabel ?? "");
  }, [selectedLabel]);

  useEffect(() => {
    // Attempt to preload maps libraries the first time the component mounts
    if (isMapsReady) {
      return;
    }

    let cancelled = false;

    loadGoogleMaps().then((maps) => {
      if (!cancelled && maps) {
        setIsMapsReady(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isMapsReady]);

  useEffect(() => {
    if (!inputValue || inputValue.trim().length < 2) {
      setPredictions([]);
      return;
    }

    let isStale = false;
    const timeoutId = window.setTimeout(async () => {
      setIsFetchingPredictions(true);
      try {
        const results = await getCityPredictions(inputValue.trim());
        if (!isStale) {
          setPredictions(results);
        }
      } catch (error) {
        console.error("Failed to fetch location suggestions", error);
        if (!isStale) {
          setPredictions([]);
          reportError("Could not fetch location suggestions. Try again.");
        }
      } finally {
        if (!isStale) {
          setIsFetchingPredictions(false);
        }
      }
    }, 300);

    return () => {
      isStale = true;
      window.clearTimeout(timeoutId);
    };
  }, [inputValue]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setPredictions([]);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const reportError = useCallback(
    (message: string | null) => {
      setLocalError(message);
      onError?.(message);
    },
    [onError]
  );

  const handleSelect = useCallback(
    (selection: LocationSelection) => {
      if (!selection.city) {
        reportError("We couldn't determine this city. Please try a different option.");
        return;
      }
      setPredictions([]);
      setInputValue(selection.formattedAddress || selection.city);
      reportError(null);
      onSelect(selection);
    },
    [onSelect, reportError]
  );

  const handlePredictionClick = async (prediction: CityPrediction) => {
    setIsFetchingPredictions(true);
    try {
      const details = await getCityDetails(prediction.placeId);
      if (details) {
        handleSelect(details);
      } else {
        reportError("Unable to load the selected city. Please try again.");
      }
    } catch (error) {
      console.error("Failed to fetch city details", error);
      reportError("Unable to load the selected city. Please try again.");
    } finally {
      setIsFetchingPredictions(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      reportError("Geolocation is not supported in this browser.");
      return;
    }

    setIsDetectingLocation(true);
    reportError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const coordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          const result = await reverseGeocode(coordinates);
          if (result && result.city) {
            handleSelect({
              city: result.city,
              state: result.state,
              country: result.country,
              formattedAddress: result.formattedAddress,
              coordinates,
            });
          } else {
            reportError("We couldn't detect your city automatically.");
          }
        } catch (error) {
          console.error("Failed to detect current location", error);
          reportError("We couldn't detect your city automatically.");
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (geoError) => {
        console.warn("Geolocation error", geoError);
        let message = "We couldn't access your location.";
        if (geoError.code === geoError.PERMISSION_DENIED) {
          message = "Permission denied. Please allow location access in your browser settings.";
        } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
          message = "Location information is unavailable right now.";
        } else if (geoError.code === geoError.TIMEOUT) {
          message = "Location request timed out. Try again.";
        }
        reportError(message);
        setIsDetectingLocation(false);
      }
    );
  };

  const handleManualApply = () => {
    if (!inputValue.trim()) {
      return;
    }

    handleSelect({
      city: inputValue.trim(),
      formattedAddress: inputValue.trim(),
      coordinates: null,
    });
  };

  const handleClear = () => {
    setInputValue("");
    setPredictions([]);
    reportError(null);
    onClear();
  };

  return (
    <div className="space-y-2" ref={containerRef}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Location</label>
        {!isMapsReady && (
          <span className="text-[11px] text-amber-600">Maps API key missing</span>
        )}
      </div>
      <div className="relative">
        <input
          type="text"
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Enter city or area"
          value={inputValue}
          onChange={(event) => {
            setInputValue(event.target.value);
            setPredictions([]);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleManualApply();
            }
          }}
        />
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Clear location"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {predictions.length > 0 && (
          <ul className="absolute z-20 mt-1 max-h-52 w-full overflow-auto rounded-md border border-gray-200 bg-white text-sm shadow-lg">
            {predictions.map((prediction) => (
              <li key={prediction.placeId}>
                <button
                  type="button"
                  className="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-blue-50"
                  onClick={() => handlePredictionClick(prediction)}
                >
                  <MapPin className="mt-0.5 h-4 w-4 text-blue-500" />
                  <span>
                    <span className="block font-medium text-gray-900">{prediction.primaryText}</span>
                    {prediction.secondaryText && (
                      <span className="block text-xs text-gray-500">{prediction.secondaryText}</span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={handleUseCurrentLocation}
          disabled={isDetectingLocation}
        >
          {isDetectingLocation ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LocateFixed className="h-4 w-4" />
          )}
          Use current
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="flex items-center gap-1"
          onClick={handleManualApply}
          disabled={!inputValue.trim()}
        >
          Apply
        </Button>
        {isFetchingPredictions && !isDetectingLocation && (
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Loader2 className="h-3 w-3 animate-spin" /> Fetching suggestions...
          </span>
        )}
      </div>
      {localError && <p className="text-xs text-red-600">{localError}</p>}
      {!localError && !isMapsReady && (
        <p className="text-xs text-amber-600">
          Map-powered suggestions will activate once the Google Maps API key is configured.
        </p>
      )}
    </div>
  );
};

export default LocationSelector;


