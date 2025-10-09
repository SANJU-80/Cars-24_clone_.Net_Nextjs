const BASE_URL = "https://cars-24-clone-net-nextjs-vypo.onrender.com/api/Car";

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
  // Avoid sending large data-URLs; keep only http(s) URLs
  const sanitizedImages = (carDetails.images || []).filter((src) => !src.startsWith("data:"));

  const payload = {
    Title: carDetails.title,
    Images: sanitizedImages,
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

  console.log("Sending car data:", payload);

  try {
    // Add timeout and better error handling
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

    console.log("Response status:", response.status);
    console.log("Response headers:", response.headers);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        const text = await response.text();
        errorMessage = text || errorMessage;
      }
      throw new Error(`Create car failed (${response.status}): ${errorMessage}`);
    }

    const result = await response.json();
    console.log("Car created successfully:", result);
    return result;
  } catch (error: any) {
    console.error("Network or parsing error:", error);
    
    // Handle specific error types
    if (error.name === 'AbortError') {
      throw new Error("Request timeout - please check your internet connection and try again");
    } else if (error.message?.includes('Failed to fetch')) {
      throw new Error("Network error - please check your internet connection and try again");
    } else if (error.message?.includes('CORS')) {
      throw new Error("Server connection issue - please try again later");
    }
    
    throw error;
  }
};
export const getcarByid = async (id: string) => {
  const response = await fetch(`${BASE_URL}/${id}`);
  return response.json();
};
export const getcarSummaries = async () => {
  const response = await fetch(`${BASE_URL}/summaries`);
  return response.json();
};
