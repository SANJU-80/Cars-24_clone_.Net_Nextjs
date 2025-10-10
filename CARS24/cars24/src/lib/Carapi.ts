import { updateCarsImages, updateCarImage, preserveUploadedCarImages, forceUseUploadedImages } from './carImageGenerator';

const BASE_URL = "http://localhost:5092/api/Car";

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
export const createCar = async (carDetails: CarDetails) => {
  // Keep all images including data URLs (base64) for uploaded images
  const allImages = carDetails.images || [];

  const payload = {
    Title: carDetails.title,
    Images: allImages,
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
    Features: carDetails.features || [],
    Highlights: carDetails.highlights || [],
  };

  console.log("🚗 CREATE CAR DEBUG:");
  console.log("Original carDetails.images:", carDetails.images);
  console.log("Payload.Images:", payload.Images);
  console.log("First image in payload:", payload.Images[0]?.substring(0, 50) + '...');
  console.log("Full payload:", payload);

  try {
    console.log("🚗 Creating car with payload:", payload);
    console.log("🚗 API URL:", `${BASE_URL}`);

    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(`${BASE_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    console.log("🚗 Response status:", response.status);
    console.log("🚗 Response headers:", response.headers);

    if (!response.ok) {
      console.warn(`Create car failed with status: ${response.status}`);
      
      // For non-2xx responses, try to get error details
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // If JSON parsing fails, try text
        try {
        const text = await response.text();
        errorMessage = text || errorMessage;
        } catch {
          // If all else fails, use default message
          errorMessage = `Server responded with ${response.status}`;
        }
      }
      
      console.error("Create car error:", errorMessage);
      throw new Error(`Create car failed: ${errorMessage}`);
    }

    const result = await response.json();
    console.log("Car created successfully:", result);
    return result;
  } catch (error: any) {
    console.error("Create car error:", error);
    
    // Handle specific error types with better messages
    if (error.name === 'AbortError') {
      throw new Error("Request timed out. Please check if the backend server is running.");
    } else if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
      throw new Error("Cannot connect to backend server. Please make sure the backend is running on http://localhost:5092");
    } else if (error.message?.includes('NetworkError')) {
      throw new Error("Network error occurred. Please try again.");
    }
    
    // Re-throw the original error if it's already a meaningful message
    throw error;
  }
};
export const getcarByid = async (id: string) => {
  try {
  const response = await fetch(`${BASE_URL}/${id}`);
    
    if (!response.ok) {
      console.warn(`Car with ID ${id} not found (${response.status})`);
      // Return null if car not found
      return null;
    }

    const carData = await response.json();
    console.log("🚗 Raw car data from API:", carData);
    
    // Ensure the car data has the expected structure
    const processedCar = {
      ...carData,
      // If specs is missing, create it from the car data
      specs: carData.specs || {
        year: carData.year || new Date().getFullYear(),
        km: carData.km || "N/A",
        fuel: carData.fuel || "N/A",
        transmission: carData.transmission || "N/A",
        owner: carData.owner || "N/A",
        insurance: carData.insurance || "N/A"
      },
      // Ensure arrays exist
      features: carData.features || [],
      highlights: carData.highlights || [],
      images: carData.images || [carData.image].filter(Boolean)
    };
    
    console.log("🚗 Processed car data:", processedCar);
    return forceUseUploadedImages(processedCar);
  } catch (error: any) {
    console.error("Error fetching car by ID:", error);
    // Return null if error occurs
    return null;
  }
};
// No hardcoded fallback cars - only use data from API or localStorage

export const getcarSummaries = async () => {
  try {
    console.log("🚗 Fetching car summaries from API...");
    console.log("🚗 API URL:", `${BASE_URL}/summaries`);
    const response = await fetch(`${BASE_URL}/summaries`);
    
    if (!response.ok) {
      console.warn(`API not available (${response.status}), returning empty array`);
      return [];
    }

    const data = await response.json();
    
    // If API returns empty array or invalid data, return empty array
    if (!Array.isArray(data) || data.length === 0) {
      console.warn("API returned empty or invalid data, returning empty array");
      return [];
    }

    console.log(`Successfully fetched ${data.length} cars from API`);
    console.log('Raw API data sample:', data[0]);
    const processedCars = data.map(car => {
      const processed = forceUseUploadedImages(car);
      console.log(`Car ${car.Title}: Original image=${car.image}, Processed image=${processed.image?.substring(0, 50)}...`);
      return processed;
    });
    return processedCars;
  } catch (error: any) {
    console.error("Error fetching cars from API:", error);
    
    // Handle specific error types
    if (error.name === 'AbortError') {
      console.warn("Request was cancelled, returning empty array");
    } else if (error.message?.includes('Failed to fetch')) {
      console.warn("Network error, returning empty array");
    } else {
      console.warn("Unknown error, returning empty array");
    }
    
    return [];
  }
};

// Helper function to get cars from localStorage only
const getLocalCars = () => {
  try {
    // Get cars from localStorage only
    const localCars = JSON.parse(localStorage.getItem('uploadedCars') || '[]');
    console.log(`🚗 Found ${localCars.length} cars in localStorage`);
    return updateCarsImages(localCars);
  } catch (error) {
    console.error("Error getting local cars:", error);
    
    // If localStorage is corrupted, try to clear it
    try {
      localStorage.removeItem('uploadedCars');
      console.log('Cleared corrupted localStorage data');
    } catch (clearError) {
      console.warn('Failed to clear localStorage:', clearError);
    }
    
    return [];
  }
};
