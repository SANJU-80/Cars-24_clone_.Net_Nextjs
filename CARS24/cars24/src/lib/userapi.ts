const BASE_URL = "https://cars-24-clone-net-nextjs.onrender.com/api/UserAuth";
const LOCAL_URL = "http://localhost:5092/api/UserAuth";

export const signup = async (
  email: string,
  password: string,
  userData: { fullName: string; phone: string }
) => {
  // Convert to PascalCase for C# backend
  const requestBody = {
    Email: email,
    Password: password,
    FullName: userData.fullName,
    Phone: userData.phone,
  };
  
  // Try Render API first, fallback to localhost
  let lastError: Error | null = null;
  
  for (const apiUrl of [BASE_URL, LOCAL_URL]) {
    try {
      const response = await fetch(`${apiUrl}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      
      if (response.ok) {
        return response.json();
      }
      
      // If we got a response but it's not OK, parse the error
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to sign up (${response.status})`);
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
      
      // If it's a different error (like validation error), throw it immediately
      if (error instanceof Error) {
        throw error;
      }
      
      lastError = error instanceof Error ? error : new Error("Unknown error occurred");
    }
  }
  
  // If we get here, both APIs failed
  throw lastError || new Error("Cannot connect to server. Please make sure your backend is running.");
};

export const login = async (email: string, password: string) => {
  // Convert to PascalCase for C# backend
  const requestBody = {
    Email: email,
    Password: password,
  };
  
  // Try Render API first, fallback to localhost
  let lastError: Error | null = null;
  
  for (const apiUrl of [BASE_URL, LOCAL_URL]) {
    try {
      const response = await fetch(`${apiUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      
      if (response.ok) {
        return response.json();
      }
      
      // If we got a response but it's not OK, parse the error
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to login (${response.status})`);
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
      
      // If it's a different error (like validation error), throw it immediately
      if (error instanceof Error) {
        throw error;
      }
      
      lastError = error instanceof Error ? error : new Error("Unknown error occurred");
    }
  }
  
  // If we get here, both APIs failed
  throw lastError || new Error("Cannot connect to server. Please make sure your backend is running.");
};

export const getUserById = async (userId: string) => {
  const response = await fetch(`${BASE_URL}/${userId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }
  return response.json();
};
