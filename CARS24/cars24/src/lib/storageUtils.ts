// Utility functions for localStorage management

// Check if localStorage has available space
export const checkLocalStorageQuota = (): boolean => {
  try {
    const testKey = 'quota_test';
    const testData = 'x'.repeat(1024 * 1024); // 1MB test data
    localStorage.setItem(testKey, testData);
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
};

// Get localStorage usage in MB
export const getLocalStorageUsage = (): number => {
  try {
    let total = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length;
      }
    }
    return total / (1024 * 1024); // Convert to MB
  } catch (error) {
    return 0;
  }
};

// Clear all uploaded cars from localStorage
export const clearUploadedCars = (): void => {
  try {
    localStorage.removeItem('uploadedCars');
    console.log('Cleared all uploaded cars from localStorage');
  } catch (error) {
    console.error('Failed to clear uploaded cars:', error);
  }
};

// Get uploaded cars count
export const getUploadedCarsCount = (): number => {
  try {
    const cars = JSON.parse(localStorage.getItem('uploadedCars') || '[]');
    return cars.length;
  } catch (error) {
    return 0;
  }
};

// Limit image size for localStorage storage
export const limitImageForStorage = (base64Image: string): string => {
  try {
    // If it's already a small image or not base64, return as is
    if (!base64Image.startsWith('data:image/') || base64Image.length < 100000) {
      return base64Image;
    }
    
    // For very large images, use a placeholder to prevent quota exceeded error
    const maxLength = 100000; // 100KB limit
    if (base64Image.length > maxLength) {
      console.warn('Image too large for localStorage, using placeholder');
      // Return a small placeholder image instead
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIFRvb0xhcmdlPC90ZXh0Pjwvc3ZnPg==';
    }
    
    return base64Image;
  } catch (error) {
    console.warn('Image processing failed:', error);
    return base64Image; // Return original if processing fails
  }
};

