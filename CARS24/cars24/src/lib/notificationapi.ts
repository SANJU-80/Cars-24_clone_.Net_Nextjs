const BASE_URL = "https://cars-24-clone-net-nextjs.onrender.com/api/Notification";
const LOCAL_URL = "http://localhost:5092/api/Notification";

// Register FCM token
export const registerFCMToken = async (userId: string, token: string) => {
  try {
    const response = await fetch(`${BASE_URL}/register-token?userId=${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      // Try localhost if base URL fails (only in development)
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        const localResponse = await fetch(`${LOCAL_URL}/register-token?userId=${userId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });
        if (localResponse.ok) {
          return await localResponse.json();
        }
      }
      throw new Error(`Failed to register token: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error registering FCM token:", error);
    throw error;
  }
};

// Remove FCM token
export const removeFCMToken = async (userId: string, token: string) => {
  try {
    const response = await fetch(`${BASE_URL}/remove-token?userId=${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        const localResponse = await fetch(`${LOCAL_URL}/remove-token?userId=${userId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });
        if (localResponse.ok) {
          return await localResponse.json();
        }
      }
      throw new Error(`Failed to remove token: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error removing FCM token:", error);
    throw error;
  }
};

// Get user notifications
export const getUserNotifications = async (userId: string, limit: number = 50) => {
  let lastError: Error | null = null;
  
  for (const apiUrl of [BASE_URL, LOCAL_URL]) {
    try {
      const response = await fetch(`${apiUrl}/user/${userId}?limit=${limit}`);
      if (response.ok) {
        return await response.json();
      }
      // If response is not ok, try next URL
      if (apiUrl === BASE_URL && typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        continue;
      }
      throw new Error(`Failed to fetch notifications: ${response.status}`);
    } catch (error) {
      // Check if it's a network/fetch error
      if (error instanceof TypeError || (error instanceof Error && error.message.includes('fetch'))) {
        lastError = new Error(
          apiUrl === BASE_URL 
            ? "Cannot reach Render API. Trying local backend..." 
            : "Cannot connect to backend. Please make sure your .NET backend is running on http://localhost:5092"
        );
        // If this was the Render API, try localhost next
        if (apiUrl === BASE_URL && typeof window !== 'undefined' && window.location.hostname === 'localhost') {
          continue;
        }
        // If localhost also failed, return empty array
        return [];
      }
      // If it's a different error, throw it immediately
      if (error instanceof Error) {
        throw error;
      }
      lastError = error instanceof Error ? error : new Error("Unknown error occurred");
    }
  }
  
  // If we get here, both APIs failed - return empty array
  console.warn("Could not fetch notifications, returning empty array:", lastError?.message);
  return [];
};

// Get unread count
export const getUnreadCount = async (userId: string) => {
  let lastError: Error | null = null;
  
  for (const apiUrl of [BASE_URL, LOCAL_URL]) {
    try {
      const response = await fetch(`${apiUrl}/user/${userId}/unread-count`);
      if (response.ok) {
        return await response.json();
      }
      // If response is not ok, try next URL
      if (apiUrl === BASE_URL && typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        continue;
      }
      throw new Error(`Failed to fetch unread count: ${response.status}`);
    } catch (error) {
      // Check if it's a network/fetch error
      if (error instanceof TypeError || (error instanceof Error && error.message.includes('fetch'))) {
        lastError = new Error(
          apiUrl === BASE_URL 
            ? "Cannot reach Render API. Trying local backend..." 
            : "Cannot connect to backend. Please make sure your .NET backend is running on http://localhost:5092"
        );
        // If this was the Render API, try localhost next
        if (apiUrl === BASE_URL && typeof window !== 'undefined' && window.location.hostname === 'localhost') {
          continue;
        }
        // If localhost also failed, return default
        return { count: 0 };
      }
      // If it's a different error, throw it immediately
      if (error instanceof Error) {
        throw error;
      }
      lastError = error instanceof Error ? error : new Error("Unknown error occurred");
    }
  }
  
  // If we get here, both APIs failed - return default
  console.warn("Could not fetch unread count, returning default:", lastError?.message);
  return { count: 0 };
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string, userId: string) => {
  try {
    const response = await fetch(`${BASE_URL}/${notificationId}/read?userId=${userId}`, {
      method: "POST",
    });
    if (!response.ok) {
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        const localResponse = await fetch(`${LOCAL_URL}/${notificationId}/read?userId=${userId}`, {
          method: "POST",
        });
        if (localResponse.ok) {
          return await localResponse.json();
        }
      }
      throw new Error(`Failed to mark as read: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (userId: string) => {
  try {
    const response = await fetch(`${BASE_URL}/user/${userId}/read-all`, {
      method: "POST",
    });
    if (!response.ok) {
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        const localResponse = await fetch(`${LOCAL_URL}/user/${userId}/read-all`, {
          method: "POST",
        });
        if (localResponse.ok) {
          return await localResponse.json();
        }
      }
      throw new Error(`Failed to mark all as read: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error marking all as read:", error);
    throw error;
  }
};

// Get notification preferences
export const getNotificationPreferences = async (userId: string) => {
  let lastError: Error | null = null;
  
  for (const apiUrl of [BASE_URL, LOCAL_URL]) {
    try {
      const response = await fetch(`${apiUrl}/user/${userId}/preferences`);
      if (response.ok) {
        return await response.json();
      }
      // If response is not ok, try next URL
      if (apiUrl === BASE_URL && typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        continue;
      }
      throw new Error(`Failed to fetch preferences: ${response.status}`);
    } catch (error) {
      // Check if it's a network/fetch error
      if (error instanceof TypeError || (error instanceof Error && error.message.includes('fetch'))) {
        lastError = new Error(
          apiUrl === BASE_URL 
            ? "Cannot reach Render API. Trying local backend..." 
            : "Cannot connect to backend. Please make sure your .NET backend is running on http://localhost:5092"
        );
        // If this was the Render API, try localhost next
        if (apiUrl === BASE_URL && typeof window !== 'undefined' && window.location.hostname === 'localhost') {
          continue;
        }
        // If localhost also failed, return default preferences
        return {
          appointmentConfirmations: true,
          bidUpdates: true,
          priceDrops: true,
          newMessages: true,
          emailNotifications: true,
          pushNotifications: true
        };
      }
      // If it's a different error, throw it immediately
      if (error instanceof Error) {
        throw error;
      }
      lastError = error instanceof Error ? error : new Error("Unknown error occurred");
    }
  }
  
  // If we get here, both APIs failed - return default preferences
  console.warn("Could not fetch preferences, returning defaults:", lastError?.message);
  return {
    appointmentConfirmations: true,
    bidUpdates: true,
    priceDrops: true,
    newMessages: true,
    emailNotifications: true,
    pushNotifications: true
  };
};

// Update notification preferences
export const updateNotificationPreferences = async (
  userId: string,
  preferences: {
    appointmentConfirmations?: boolean;
    bidUpdates?: boolean;
    priceDrops?: boolean;
    newMessages?: boolean;
    emailNotifications?: boolean;
    pushNotifications?: boolean;
  }
) => {
  try {
    const response = await fetch(`${BASE_URL}/user/${userId}/preferences`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preferences),
    });
    if (!response.ok) {
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        const localResponse = await fetch(`${LOCAL_URL}/user/${userId}/preferences`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(preferences),
        });
        if (localResponse.ok) {
          return await localResponse.json();
        }
      }
      throw new Error(`Failed to update preferences: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error updating preferences:", error);
    throw error;
  }
};

