const BASE_URL = "https://cars-24-clone-net-nextjs.onrender.com/api/Booking";
const LOCAL_URL = "http://localhost:5092/api/Booking";

export const createBooking = async (userid: string, Booking: any) => {
  // Try Render API first, fallback to localhost
  let lastError: Error | null = null;
  
  for (const apiUrl of [BASE_URL, LOCAL_URL]) {
    try {
      const response = await fetch(`${apiUrl}?userId=${userid}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Booking),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create booking: ${response.status}`);
      }
      
      const data = await response.json();
      if (data) {
        return data;
      }
    } catch (error) {
      // Check if it's a network/fetch error
      if (error instanceof TypeError || (error instanceof Error && error.message.includes('fetch'))) {
        lastError = new Error(
          apiUrl === BASE_URL 
            ? "Cannot reach Render API. Trying local backend..." 
            : "Cannot connect to backend. Please make sure your .NET backend is running on http://localhost:5092"
        );
        // If this was the Render API, try localhost next
        if (apiUrl === BASE_URL) {
          continue;
        }
        // If localhost also failed, throw the error
        throw lastError;
      }
      
      // If it's a different error, throw it immediately
      if (error instanceof Error) {
        throw error;
      }
      
      lastError = error instanceof Error ? error : new Error("Unknown error occurred");
    }
  }
  
  // If we get here, both APIs failed
  throw lastError || new Error("Cannot connect to server. Please make sure your backend is running.");
};

export const getBookingbyid = async (id: string) => {
  // Try Render API first, fallback to localhost
  let lastError: Error | null = null;
  
  for (const apiUrl of [BASE_URL, LOCAL_URL]) {
    try {
      const response = await fetch(`${apiUrl}/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Booking not found");
        }
        throw new Error(`Failed to fetch booking: ${response.status}`);
      }
      
      const data = await response.json();
      if (data) {
        return data;
      }
    } catch (error) {
      if (error instanceof TypeError || (error instanceof Error && error.message.includes('fetch'))) {
        lastError = new Error(
          apiUrl === BASE_URL 
            ? "Cannot reach Render API. Trying local backend..." 
            : "Cannot connect to backend. Please make sure your .NET backend is running on http://localhost:5092"
        );
        if (apiUrl === BASE_URL) {
          continue;
        }
        throw lastError;
      }
      if (error instanceof Error) {
        throw error;
      }
      lastError = error instanceof Error ? error : new Error("Unknown error occurred");
    }
  }
  
  throw lastError || new Error("Cannot connect to server. Please make sure your backend is running.");
};

export const getBookingbyuser = async (userId: string) => {
  // Try Render API first, fallback to localhost
  let lastError: Error | null = null;
  
  for (const apiUrl of [BASE_URL, LOCAL_URL]) {
    try {
      const response = await fetch(`${apiUrl}/user/${userId}/bookings`);
      
      if (!response.ok) {
        if (response.status === 404) {
          // Return empty array if no bookings found
          return [];
        }
        throw new Error(`Failed to fetch bookings: ${response.status}`);
      }
      
      const data = await response.json();
      // Return the data (could be array or object)
      return data || [];
    } catch (error) {
      // Check if it's a network/fetch error
      if (error instanceof TypeError || (error instanceof Error && error.message.includes('fetch'))) {
        lastError = new Error(
          apiUrl === BASE_URL 
            ? "Cannot reach Render API. Trying local backend..." 
            : "Cannot connect to backend. Please make sure your .NET backend is running on http://localhost:5092"
        );
        // If this was the Render API, try localhost next
        if (apiUrl === BASE_URL) {
          continue;
        }
        // If localhost also failed, throw the error
        throw lastError;
      }
      
      // If it's a different error, throw it immediately
      if (error instanceof Error) {
        throw error;
      }
      
      lastError = error instanceof Error ? error : new Error("Unknown error occurred");
    }
  }
  
  // If we get here, both APIs failed
  throw lastError || new Error("Cannot connect to server. Please make sure your backend is running.");
};
