// API Configuration - can switch between local and remote
const isDevelopment = process.env.NODE_ENV === 'development';
const LOCAL_API_URL = "http://localhost:5092/api/UserAuth";
const REMOTE_API_URL = "https://cars-24-clone-net-nextjs-vypo.onrender.com/api/UserAuth";

// Helper function to try multiple API endpoints
const tryApiEndpoints = async (endpoints: string[], requestOptions: RequestInit) => {
  let lastError: Error | null = null;
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, requestOptions);
      return { response, endpoint };
    } catch (error) {
      lastError = error as Error;
      console.warn(`Failed to connect to ${endpoint}:`, error);
      continue;
    }
  }
  
  throw lastError || new Error("All API endpoints failed");
};

// Determine which endpoints to try
const getApiEndpoints = () => {
  if (isDevelopment) {
    return [LOCAL_API_URL, REMOTE_API_URL]; // Try local first, then remote
  }
  return [REMOTE_API_URL]; // Only try remote in production
};

export const signup = async (
  email: string,
  password: string,
  userData: { fullName: string; phone: string }
) => {
  try {
    const endpoints = getApiEndpoints();
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, ...userData }),
    };
    
    const { response, endpoint } = await tryApiEndpoints(
      endpoints.map(ep => `${ep}/signup`), 
      requestOptions
    );
    
    console.log(`Signup request successful using endpoint: ${endpoint}`);
    
    if (!response.ok) {
      // Try to get error message from response
      let errorMessage = "Failed to sign up";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // If we can't parse the error response, use status-based messages
        switch (response.status) {
          case 400:
            errorMessage = "User already exists or invalid data provided";
            break;
          case 404:
            errorMessage = "Signup service not found. Please check if the server is running.";
            break;
          case 500:
            errorMessage = "Server error. Please try again later.";
            break;
          default:
            errorMessage = `Signup failed with status ${response.status}`;
        }
      }
      throw new Error(errorMessage);
    }
    
    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error("Network error: Unable to connect to any server. Please check your internet connection and ensure the backend is running.");
    }
    throw error;
  }
};

export const login = async (email: string, password: string) => {
  try {
    const endpoints = getApiEndpoints();
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    };
    
    const { response, endpoint } = await tryApiEndpoints(
      endpoints.map(ep => `${ep}/login`), 
      requestOptions
    );
    
    console.log(`Login request successful using endpoint: ${endpoint}`);
    
    if (!response.ok) {
      // Try to get error message from response
      let errorMessage = "Failed to login";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // If we can't parse the error response, use status-based messages
        switch (response.status) {
          case 401:
            errorMessage = "Invalid email or password";
            break;
          case 404:
            errorMessage = "Login service not found. Please check if the server is running.";
            break;
          case 500:
            errorMessage = "Server error. Please try again later.";
            break;
          default:
            errorMessage = `Login failed with status ${response.status}`;
        }
      }
      throw new Error(errorMessage);
    }
    
    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error("Network error: Unable to connect to any server. Please check your internet connection and ensure the backend is running.");
    }
    throw error;
  }
};

export const getUserById = async (userId: string) => {
  try {
    const endpoints = getApiEndpoints();
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    };
    
    const { response, endpoint } = await tryApiEndpoints(
      endpoints.map(ep => `${ep}/${userId}`), 
      requestOptions
    );
    
    console.log(`Get user request successful using endpoint: ${endpoint}`);
    
    if (!response.ok) {
      let errorMessage = "Failed to fetch user";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        switch (response.status) {
          case 404:
            errorMessage = "User not found";
            break;
          case 500:
            errorMessage = "Server error. Please try again later.";
            break;
          default:
            errorMessage = `Failed to fetch user with status ${response.status}`;
        }
      }
      throw new Error(errorMessage);
    }
    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error("Network error: Unable to connect to any server. Please check your internet connection and ensure the backend is running.");
    }
    throw error;
  }
};
