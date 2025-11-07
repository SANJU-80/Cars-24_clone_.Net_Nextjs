const ENV_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const REMOTE_ROOT = "https://cars-24-clone-net-nextjs.onrender.com";
const LOCAL_ROOT = "http://localhost:5092";

const buildApiUrl = (root: string) => `${root.replace(/\/$/, "")}/api/Car`;

const ENV_API_URL = ENV_BASE_URL ? buildApiUrl(ENV_BASE_URL) : null;
const REMOTE_API_URL = buildApiUrl(REMOTE_ROOT);
const LOCAL_API_URL = buildApiUrl(LOCAL_ROOT);

const isBrowser = typeof window !== "undefined";

type ApiUrl = string;

const getApiEndpoints = (): ApiUrl[] => {
  const hostname = isBrowser ? window.location.hostname : undefined;
  const preferLocal =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    (!isBrowser && process.env.NODE_ENV !== "production");

  const primaryEndpoints = preferLocal
    ? [LOCAL_API_URL, REMOTE_API_URL]
    : [REMOTE_API_URL, LOCAL_API_URL];

  const endpoints: ApiUrl[] = [];
  const seen = new Set<ApiUrl>();
  const addEndpoint = (url: ApiUrl | null) => {
    if (!url || seen.has(url)) {
      return;
    }
    seen.add(url);
    endpoints.push(url);
  };

  addEndpoint(ENV_API_URL);
  primaryEndpoints.forEach(addEndpoint);

  return endpoints;
};

const buildConnectionError = (apiUrl: ApiUrl, hasFallback: boolean) => {
  if (apiUrl === LOCAL_API_URL) {
    return new Error("Cannot connect to backend. Please make sure your .NET backend is running on http://localhost:5092");
  }

  if (apiUrl === REMOTE_API_URL) {
    return new Error(hasFallback ? "Cannot reach hosted API. Trying local backend..." : "Cannot reach hosted API.");
  }

  return new Error(`Cannot reach API at ${apiUrl}`);
};

type CarDetails = {
  title: string;
  images: string[];
  price: string;
  emi: string;
  location: string;
  specs: {
    year: number;
    km: string;
    fuel: string;
    transmission: string;
    owner: string;
    insurance: string;
  };
  features: string[];
  highlights: string[];
};

export interface SearchFilters {
  query?: string;
  fuelType?: string;
  transmission?: string;
  minYear?: number;
  maxYear?: number;
  minMileage?: number;
  maxMileage?: number;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  skip?: number;
  limit?: number;
}

export interface SearchResult {
  Id: string;
  Title: string;
  km: string;
  Fuel: string;
  Transmission: string;
  Owner: string;
  Emi: string;
  Price: string;
  Location: string;
  image: string[];
  Year: number;
  RelevanceScore: number;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  query?: string;
  filters: SearchFilters;
}

export const createCar = async (carDetails: CarDetails) => {
  const requestBody = {
    Title: carDetails.title,
    Images: carDetails.images,
    Price: carDetails.price,
    Emi: carDetails.emi,
    Location: carDetails.location,
    Specs: {
      Year: carDetails.specs.year,
      Km: carDetails.specs.km,
      Fuel: carDetails.specs.fuel,
      Transmission: carDetails.specs.transmission,
      Owner: carDetails.specs.owner,
      Insurance: carDetails.specs.insurance,
    },
    Features: carDetails.features,
    Highlights: carDetails.highlights,
  };

  let lastError: Error | null = null;
  const endpoints = getApiEndpoints();

  for (let index = 0; index < endpoints.length; index++) {
    const apiUrl = endpoints[index];
    const isLastEndpoint = index === endpoints.length - 1;

    try {
      const response = await fetch(`${apiUrl}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        return response.json();
      }

      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `Failed to create car: ${response.status}`;
      lastError = new Error(errorMessage);

      if (!isLastEndpoint) {
        continue;
      }

      throw lastError;
    } catch (error) {
      if (error instanceof TypeError || (error instanceof Error && error.message.includes("fetch"))) {
        lastError = buildConnectionError(apiUrl, !isLastEndpoint);
        if (!isLastEndpoint) {
          continue;
        }
        break;
      }

      if (error instanceof Error) {
        lastError = error;
        if (!isLastEndpoint) {
          continue;
        }
        throw error;
      }

      lastError = new Error("Unknown error occurred");
    }
  }

  throw lastError || new Error("Cannot connect to server. Please make sure your backend is running.");
};

export const getcarByid = async (id: string) => {
  let lastError: Error | null = null;
  const endpoints = getApiEndpoints();

  for (let index = 0; index < endpoints.length; index++) {
    const apiUrl = endpoints[index];
    const isLastEndpoint = index === endpoints.length - 1;

    try {
      const response = await fetch(`${apiUrl}/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          if (!isLastEndpoint) {
            continue;
          }
          throw new Error("Car not found");
        }

        if (!isLastEndpoint) {
          continue;
        }

        throw new Error(`Failed to fetch car: ${response.status}`);
      }

      const data = await response.json();
      if (data) {
        return data;
      }
    } catch (error) {
      if (error instanceof TypeError || (error instanceof Error && error.message.includes("fetch"))) {
        lastError = buildConnectionError(apiUrl, !isLastEndpoint);
        if (!isLastEndpoint) {
          continue;
        }
        break;
      }

      if (error instanceof Error) {
        lastError = error;
        if (!isLastEndpoint) {
          continue;
        }
        throw error;
      }

      lastError = new Error("Unknown error occurred");
    }
  }

  throw lastError || new Error("Cannot connect to server. Please make sure your backend is running.");
};

export const getcarSummaries = async () => {
  let lastError: Error | null = null;
  const endpoints = getApiEndpoints();

  for (let index = 0; index < endpoints.length; index++) {
    const apiUrl = endpoints[index];
    const isLastEndpoint = index === endpoints.length - 1;

    try {
      const response = await fetch(`${apiUrl}/summaries`);

      if (response.ok) {
        return response.json();
      }

      if (!isLastEndpoint) {
        continue;
      }

      throw new Error(`Failed to fetch car summaries: ${response.status}`);
    } catch (error) {
      if (error instanceof TypeError || (error instanceof Error && error.message.includes("fetch"))) {
        lastError = buildConnectionError(apiUrl, !isLastEndpoint);
        if (!isLastEndpoint) {
          continue;
        }
        return [];
      }

      if (error instanceof Error) {
        lastError = error;
        if (!isLastEndpoint) {
          continue;
        }
        throw error;
      }

      lastError = new Error("Unknown error occurred");
    }
  }

  console.warn("Could not fetch car summaries:", lastError?.message);
  return [];
};

export const searchCars = async (filters: SearchFilters): Promise<SearchResponse> => {
  const params = new URLSearchParams();

  if (filters.query) params.append("query", filters.query);
  if (filters.fuelType) params.append("fuelType", filters.fuelType);
  if (filters.transmission) params.append("transmission", filters.transmission);
  if (filters.minYear) params.append("minYear", filters.minYear.toString());
  if (filters.maxYear) params.append("maxYear", filters.maxYear.toString());
  if (filters.minMileage) params.append("minMileage", filters.minMileage.toString());
  if (filters.maxMileage) params.append("maxMileage", filters.maxMileage.toString());
  if (filters.minPrice) params.append("minPrice", filters.minPrice.toString());
  if (filters.maxPrice) params.append("maxPrice", filters.maxPrice.toString());
  if (filters.location) params.append("location", filters.location);
  if (filters.skip) params.append("skip", filters.skip.toString());
  if (filters.limit) params.append("limit", filters.limit.toString());

  let lastError: Error | null = null;
  const endpoints = getApiEndpoints();

  for (let index = 0; index < endpoints.length; index++) {
    const apiUrl = endpoints[index];
    const isLastEndpoint = index === endpoints.length - 1;

    try {
      const response = await fetch(`${apiUrl}/search?${params.toString()}`);

      if (response.ok) {
        const data = await response.json();
        if (data && typeof data === "object") {
          return {
            results: Array.isArray(data.results) ? data.results : [],
            total: typeof data.total === "number" ? data.total : 0,
            query: data.query,
            filters: data.filters || filters,
          };
        }

        return {
          results: [],
          total: 0,
          query: filters.query,
          filters: filters,
        };
      }

      throw new Error(`Failed to search cars: ${response.status}`);
    } catch (error) {
      if (error instanceof TypeError || (error instanceof Error && error.message.includes("fetch"))) {
        lastError = buildConnectionError(apiUrl, !isLastEndpoint);
        if (!isLastEndpoint) {
          continue;
        }
        break;
      }

      if (error instanceof Error) {
        lastError = error;
        if (!isLastEndpoint) {
          continue;
        }
        throw error;
      }

      lastError = new Error("Unknown error occurred");
    }
  }

  console.warn("Returning empty results due to errors", lastError?.message);
  return {
    results: [],
    total: 0,
    query: filters.query,
    filters: filters,
  };
};

export const getSuggestions = async (query: string, limit: number = 10): Promise<string[]> => {
  if (!query || query.length < 2) {
    return [];
  }

  const params = new URLSearchParams();
  params.append("query", query);
  params.append("limit", limit.toString());

  let lastError: Error | null = null;
  const endpoints = getApiEndpoints();

  for (let index = 0; index < endpoints.length; index++) {
    const apiUrl = endpoints[index];
    const isLastEndpoint = index === endpoints.length - 1;

    try {
      const response = await fetch(`${apiUrl}/suggestions?${params.toString()}`);

      if (response.ok) {
        return await response.json();
      }

      throw new Error(`Failed to get suggestions: ${response.status}`);
    } catch (error) {
      if (error instanceof TypeError || (error instanceof Error && error.message.includes("fetch"))) {
        lastError = buildConnectionError(apiUrl, !isLastEndpoint);
        if (!isLastEndpoint) {
          continue;
        }
        break;
      }

      if (error instanceof Error) {
        lastError = error;
        if (!isLastEndpoint) {
          continue;
        }
        throw error;
      }

      lastError = new Error("Unknown error occurred");
    }
  }

  console.warn("Returning empty suggestions due to errors", lastError?.message);
  return [];
};

