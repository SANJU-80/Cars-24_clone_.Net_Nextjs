"use client";

import { Loader } from "@googlemaps/js-api-loader";

const DEFAULT_LIBRARIES: ("places" | "geometry")[] = ["places", "geometry"];

let loader: Loader | null = null;
let loaderPromise: Promise<typeof google> | null = null;
const requestedLibraries = new Set<("places" | "geometry")>(DEFAULT_LIBRARIES);

const getApiKey = () => process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export type LatLngLiteral = google.maps.LatLngLiteral;

export interface ReverseGeocodeResult {
  city?: string;
  state?: string;
  country?: string;
  formattedAddress: string;
  coordinates: LatLngLiteral;
}

export interface CityPrediction {
  description: string;
  placeId: string;
  primaryText: string;
  secondaryText?: string;
}

export interface LocationSelection {
  city: string;
  formattedAddress: string;
  coordinates: LatLngLiteral | null;
  state?: string;
  country?: string;
}

const isBrowser = typeof window !== "undefined";

export const isGoogleMapsConfigured = () => Boolean(isBrowser && getApiKey());

const initializeLoader = (libraries: ("places" | "geometry")[]) => {
  if (!isBrowser) {
    return null;
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("Google Maps API key is not configured. Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to enable location services.");
    return null;
  }

  if (libraries?.length) {
    libraries.forEach((lib) => requestedLibraries.add(lib));
  }

  if (!loader) {
    loader = new Loader({
      apiKey,
      libraries: Array.from(requestedLibraries),
      language: "en",
      region: "IN",
    });
  }

  if (!loaderPromise) {
    loaderPromise = loader.load();
  }

  return loaderPromise;
};

export const loadGoogleMaps = async (libraries: ("places" | "geometry")[] = DEFAULT_LIBRARIES) => {
  const promise = initializeLoader(libraries);
  if (!promise) {
    return null;
  }

  try {
    const googleMaps = await promise;
    return googleMaps;
  } catch (error) {
    console.error("Failed to load Google Maps libraries", error);
    return null;
  }
};

const extractLocationParts = (
  components: google.maps.GeocoderAddressComponent[]
) => {
  let city: string | undefined;
  let state: string | undefined;
  let country: string | undefined;

  components.forEach((component) => {
    if (!city && component.types.includes("locality")) {
      city = component.long_name;
    }
    if (!city && component.types.includes("administrative_area_level_2")) {
      city = component.long_name;
    }
    if (!state && component.types.includes("administrative_area_level_1")) {
      state = component.long_name;
    }
    if (!country && component.types.includes("country")) {
      country = component.long_name;
    }
  });

  return { city, state, country };
};

export const reverseGeocode = async (
  coordinates: LatLngLiteral
): Promise<ReverseGeocodeResult | null> => {
  const maps = await loadGoogleMaps();
  if (!maps) {
    return null;
  }

  return new Promise((resolve, reject) => {
    const geocoder = new maps.maps.Geocoder();
    geocoder.geocode({ location: coordinates }, (results, status) => {
      if (status === maps.maps.GeocoderStatus.OK && results && results.length) {
        const preferredResult =
          results.find((result) => result.types?.includes("locality")) ?? results[0];

        const { city, state, country } = extractLocationParts(preferredResult.address_components ?? []);

        resolve({
          city,
          state,
          country,
          formattedAddress: preferredResult.formatted_address,
          coordinates,
        });
      } else if (status === maps.maps.GeocoderStatus.ZERO_RESULTS) {
        resolve(null);
      } else {
        reject(new Error(`Reverse geocoding failed: ${status}`));
      }
    });
  });
};

export const getCityPredictions = async (
  query: string,
  options?: { sessionToken?: google.maps.places.AutocompleteSessionToken }
): Promise<CityPrediction[]> => {
  if (!query || query.length < 2) {
    return [];
  }

  const maps = await loadGoogleMaps();
  if (!maps) {
    return [];
  }

  const service = new maps.maps.places.AutocompleteService();

  return new Promise((resolve) => {
    service.getPlacePredictions(
      {
        input: query,
        types: ["(cities)"],
        sessionToken: options?.sessionToken,
      },
      (predictions, status) => {
        if (status !== maps.maps.places.PlacesServiceStatus.OK || !predictions) {
          resolve([]);
          return;
        }

        resolve(
          predictions.map((prediction) => ({
            description: prediction.description,
            placeId: prediction.place_id,
            primaryText: prediction.structured_formatting?.main_text ?? prediction.description,
            secondaryText: prediction.structured_formatting?.secondary_text,
          }))
        );
      }
    );
  });
};

let placesService: google.maps.places.PlacesService | null = null;

const getPlacesService = async () => {
  const maps = await loadGoogleMaps();
  if (!maps) {
    return null;
  }

  if (!placesService) {
    const container = document.createElement("div");
    placesService = new maps.maps.places.PlacesService(container);
  }

  return placesService;
};

export const getCityDetails = async (
  placeId: string,
  options?: { sessionToken?: google.maps.places.AutocompleteSessionToken }
): Promise<LocationSelection | null> => {
  if (!placeId) {
    return null;
  }

  const service = await getPlacesService();
  if (!service) {
    return null;
  }

  const maps = await loadGoogleMaps();
  if (!maps) {
    return null;
  }

  return new Promise((resolve) => {
    service.getDetails(
      {
        placeId,
        fields: ["formatted_address", "geometry", "address_component", "name"],
        sessionToken: options?.sessionToken,
      },
      (place, status) => {
        if (status !== maps.maps.places.PlacesServiceStatus.OK || !place) {
          resolve(null);
          return;
        }

        const components = place.address_components ?? [];
        const { city, state, country } = extractLocationParts(components);
        const coordinates = place.geometry?.location
          ? { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() }
          : null;

        resolve({
          city: city ?? place.name ?? place.formatted_address ?? "",
          state,
          country,
          formattedAddress: place.formatted_address ?? place.name ?? "",
          coordinates,
        });
      }
    );
  });
};

export const haversineDistanceKm = (a: LatLngLiteral, b: LatLngLiteral): number => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const sinHalfLat = Math.sin(dLat / 2);
  const sinHalfLng = Math.sin(dLng / 2);

  const haversine =
    sinHalfLat * sinHalfLat +
    Math.cos(lat1) * Math.cos(lat2) * sinHalfLng * sinHalfLng;

  const angularDistance = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

  return Math.round((earthRadiusKm * angularDistance + Number.EPSILON) * 100) / 100;
};


