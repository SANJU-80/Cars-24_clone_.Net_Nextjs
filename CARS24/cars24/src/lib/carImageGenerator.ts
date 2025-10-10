// Car Image Generator - Generates appropriate images based on brand and model

// Brand-specific image mappings
const BRAND_IMAGES: { [key: string]: string } = {
  // Maruti
  "maruti": "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg",
  "swift": "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg",
  "baleno": "https://images.pexels.com/photos/112460/pexels-photo-112460.jpeg",
  "fronx": "https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg",
  "eeco": "https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg",
  
  // Hyundai
  "hyundai": "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg",
  "i20": "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg",
  "creta": "https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg",
  "venue": "https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg",
  "elantra": "https://images.pexels.com/photos/1280560/pexels-photo-1280560.jpeg",
  
  // Honda
  "honda": "https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg",
  "city": "https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg",
  "civic": "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg",
  "accord": "https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg",
  
  // Toyota
  "toyota": "https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg",
  "fortuner": "https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg",
  "innova": "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg",
  "camry": "https://images.pexels.com/photos/1280560/pexels-photo-1280560.jpeg",
  "corolla": "https://images.pexels.com/photos/112460/pexels-photo-112460.jpeg",
  
  // Tata
  "tata": "https://images.pexels.com/photos/1280560/pexels-photo-1280560.jpeg",
  "altroz": "https://images.pexels.com/photos/1280560/pexels-photo-1280560.jpeg",
  "harrier": "https://images.pexels.com/photos/112460/pexels-photo-112460.jpeg",
  "nexon": "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg",
  "safari": "https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg",
  
  // Kia
  "kia": "https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg",
  "seltos": "https://images.pexels.com/photos/1280560/pexels-photo-1280560.jpeg",
  "sonet": "https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg",
  "carnival": "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg",
  
  // Mahindra
  "mahindra": "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg",
  "xuv300": "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg",
  "xuv700": "https://images.pexels.com/photos/112460/pexels-photo-112460.jpeg",
  "thar": "https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg",
  "scorpio": "https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg",
  
  // Ford
  "ford": "https://images.pexels.com/photos/112460/pexels-photo-112460.jpeg",
  "ecosport": "https://images.pexels.com/photos/112460/pexels-photo-112460.jpeg",
  "endeavour": "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg",
  "figo": "https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg",
  
  // Volkswagen
  "volkswagen": "https://images.pexels.com/photos/1280560/pexels-photo-1280560.jpeg",
  "polo": "https://images.pexels.com/photos/1280560/pexels-photo-1280560.jpeg",
  "vento": "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg",
  "tiguan": "https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg",
  
  // Skoda
  "skoda": "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg",
  "rapid": "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg",
  "octavia": "https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg",
  "kodiaq": "https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg",
  
  // Nissan
  "nissan": "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg",
  "micra": "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg",
  "sunny": "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg",
  "terrano": "https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg",
  
  // Renault
  "renault": "https://images.pexels.com/photos/112460/pexels-photo-112460.jpeg",
  "duster": "https://images.pexels.com/photos/112460/pexels-photo-112460.jpeg",
  "kwid": "https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg",
  "triber": "https://images.pexels.com/photos/1280560/pexels-photo-1280560.jpeg",
  
  // BMW
  "bmw": "https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg",
  "3-series": "https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg",
  "5-series": "https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg",
  "x1": "https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg",
  "x3": "https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg",
  "x5": "https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg",
  
  // Mercedes-Benz
  "mercedes": "https://images.pexels.com/photos/1280560/pexels-photo-1280560.jpeg",
  "benz": "https://images.pexels.com/photos/1280560/pexels-photo-1280560.jpeg",
  "c-class": "https://images.pexels.com/photos/1280560/pexels-photo-1280560.jpeg",
  "e-class": "https://images.pexels.com/photos/1280560/pexels-photo-1280560.jpeg",
  "s-class": "https://images.pexels.com/photos/1280560/pexels-photo-1280560.jpeg",
  "gle": "https://images.pexels.com/photos/1280560/pexels-photo-1280560.jpeg",
  "glc": "https://images.pexels.com/photos/1280560/pexels-photo-1280560.jpeg",
  
  // Audi
  "audi": "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg",
  "a3": "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg",
  "a4": "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg",
  "a6": "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg",
  "q3": "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg",
  "q5": "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg",
  "q7": "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg",
  
  // Chevrolet
  "chevrolet": "https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg",
  "corvette": "https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg",
  "cruze": "https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg",
  "beat": "https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg",
  
  // Jaguar
  "jaguar": "https://images.pexels.com/photos/112460/pexels-photo-112460.jpeg",
  "xe": "https://images.pexels.com/photos/112460/pexels-photo-112460.jpeg",
  "xf": "https://images.pexels.com/photos/112460/pexels-photo-112460.jpeg",
  "f-pace": "https://images.pexels.com/photos/112460/pexels-photo-112460.jpeg",
  
  // Land Rover
  "landrover": "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg",
  "range": "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg",
  "evoque": "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg",
  "discovery": "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg",
};

// Default fallback image
const DEFAULT_CAR_IMAGE = "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg";

/**
 * Generates appropriate car image based on brand and model
 * @param title - Car title containing brand and model information
 * @returns Appropriate image URL based on brand/model
 */
export const generateCarImage = (title: string): string => {

  // Convert title to lowercase for matching
  const lowerTitle = title.toLowerCase();
  
  // Create a combined string for better matching
  const fullTitle = lowerTitle.replace(/[0-9]/g, '').replace(/[^a-z\s]/g, ' ').replace(/\s+/g, ' ').trim();
  
  // Priority-based matching: specific models first, then brands
  const priorityMatches = [
    // Specific models (highest priority)
    'corvette', 'grand', 'sport', 'c7', 'c8',
    '3-series', '5-series', 'x1', 'x3', 'x5',
    'c-class', 'e-class', 's-class', 'gle', 'glc',
    'a3', 'a4', 'a6', 'q3', 'q5', 'q7',
    'swift', 'baleno', 'fronx', 'eeco',
    'i20', 'creta', 'venue', 'elantra',
    'city', 'civic', 'accord',
    'fortuner', 'innova', 'camry', 'corolla',
    'altroz', 'harrier', 'nexon', 'safari',
    'seltos', 'sonet', 'carnival',
    'xuv300', 'xuv700', 'thar', 'scorpio',
    'ecosport', 'endeavour', 'figo',
    'polo', 'vento', 'tiguan',
    'rapid', 'octavia', 'kodiaq',
    'micra', 'sunny', 'terrano',
    'duster', 'kwid', 'triber',
    'xe', 'xf', 'f-pace',
    'evoque', 'discovery', 'range',
    
    // Brands (lower priority)
    'chevrolet', 'bmw', 'mercedes', 'benz', 'audi',
    'maruti', 'hyundai', 'honda', 'toyota', 'tata',
    'kia', 'mahindra', 'ford', 'volkswagen', 'skoda',
    'nissan', 'renault', 'jaguar', 'landrover'
  ];
  
  // Try priority matches
  for (const match of priorityMatches) {
    if (fullTitle.includes(match)) {
      return BRAND_IMAGES[match] || DEFAULT_CAR_IMAGE;
    }
  }
  
  // If no specific match found, return default
  return DEFAULT_CAR_IMAGE;
};

/**
 * Updates car object with appropriate image based on title
 * @param car - Car object
 * @returns Car object with updated image
 */
export const updateCarImage = (car: any): any => {
  const carTitle = car.title || car.Title || '';
  
  // Debug logging
  console.log(`Processing car: ${carTitle}`);
  console.log(`Car Images array:`, car.Images);
  
  // Priority: Use uploaded images (base64) first, then existing URLs, then generate
  let finalImage = null;
  
  // FIRST PRIORITY: Check for uploaded images (base64 data URLs) in the Images array
  if (car.Images && Array.isArray(car.Images) && car.Images.length > 0) {
    const uploadedImage = car.Images.find((img: any) => typeof img === 'string' && img.startsWith('data:image/'));
    if (uploadedImage) {
      finalImage = uploadedImage;
      console.log(`✅ Using uploaded image: ${uploadedImage.substring(0, 50)}...`);
    } else if (car.Images[0] && typeof car.Images[0] === 'string' && isValidImageUrl(car.Images[0])) {
      finalImage = car.Images[0];
      console.log(`✅ Using first image from Images array: ${car.Images[0].substring(0, 50)}...`);
    }
  }
  
  // SECOND PRIORITY: Check existing image properties
  if (!finalImage) {
    const existingImage = car.image || car.Image;
    if (existingImage && typeof existingImage === 'string' && isValidImageUrl(existingImage)) {
      finalImage = existingImage;
      console.log(`✅ Using existing image: ${existingImage.substring(0, 50)}...`);
    }
  }
  
  // LAST RESORT: Only generate a new image if no valid image exists
  if (!finalImage) {
    finalImage = generateCarImage(carTitle);
    console.log(`⚠️ Generated new image: ${finalImage.substring(0, 50)}...`);
  } else {
    console.log(`✅ Keeping existing/uploaded image: ${finalImage.substring(0, 50)}...`);
  }
  
  return {
    ...car,
    image: finalImage
  };
};

// Helper function to check if an image URL is valid
const isValidImageUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  
  // Check if it's a base64 data URL (uploaded images)
  if (url.startsWith('data:image/')) return true;
  
  // Check if it's a valid web URL (http/https)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
  
  // If it's not a recognized format, consider it invalid
  return false;
};

/**
 * Updates array of cars with appropriate images
 * @param cars - Array of car objects
 * @returns Array of cars with updated images
 */
export const updateCarsImages = (cars: any[]): any[] => {
  return cars.map(car => updateCarImage(car));
};

/**
 * Special function for uploaded cars - preserves uploaded images without any generation
 * @param car - Car object with uploaded images
 * @returns Car object with preserved uploaded images
 */
export const preserveUploadedCarImages = (car: any): any => {
  console.log(`🔍 Processing car: ${car.title || car.Title}`);
  console.log(`🔍 Car.Images:`, car.Images);
  console.log(`🔍 Car.image:`, car.image);
  
  // FIRST: Check if the car.image field already contains an uploaded image (base64)
  if (car.image && typeof car.image === 'string' && car.image.startsWith('data:image/')) {
    console.log(`🎯 Car already has uploaded image in .image field: ${car.image.substring(0, 50)}...`);
    return car; // Return as-is, it's already correct
  }
  
  // SECOND: Check if car has uploaded images (base64) in the Images array
  if (car.Images && Array.isArray(car.Images) && car.Images.length > 0) {
    const uploadedImage = car.Images.find((img: any) => typeof img === 'string' && img.startsWith('data:image/'));
    if (uploadedImage) {
      console.log(`🎯 Found uploaded image in Images array: ${uploadedImage.substring(0, 50)}...`);
      return {
        ...car,
        image: uploadedImage
      };
    }
    
    // If no base64 images, use the first image from Images array
    if (car.Images[0] && typeof car.Images[0] === 'string') {
      console.log(`🎯 Using first image from Images array: ${car.Images[0].substring(0, 50)}...`);
      return {
        ...car,
        image: car.Images[0]
      };
    }
  }
  
  // THIRD: If car.image exists and is valid, use it
  if (car.image && typeof car.image === 'string' && isValidImageUrl(car.image)) {
    console.log(`🎯 Using existing car.image: ${car.image.substring(0, 50)}...`);
    return car;
  }
  
  // LAST RESORT: Fallback to normal processing
  console.log(`⚠️ No uploaded images found, using fallback processing`);
  return updateCarImage(car);
};

// Simple function to force use uploaded images without any processing
export const forceUseUploadedImages = (car: any): any => {
  console.log(`🚀 FORCE: Processing car: ${car.title || car.Title}`);
  
  // If car has Images array, use the first one regardless of type
  if (car.Images && Array.isArray(car.Images) && car.Images.length > 0) {
    const firstImage = car.Images[0];
    if (firstImage && typeof firstImage === 'string') {
      console.log(`🚀 FORCE: Using first image from Images array: ${firstImage.substring(0, 50)}...`);
      return {
        ...car,
        image: firstImage
      };
    }
  }
  
  // If no Images array, use car.image if it exists
  if (car.image && typeof car.image === 'string') {
    console.log(`🚀 FORCE: Using car.image: ${car.image.substring(0, 50)}...`);
    return car;
  }
  
  // Last resort - return as is
  console.log(`🚀 FORCE: No images found, returning car as-is`);
  return car;
};

