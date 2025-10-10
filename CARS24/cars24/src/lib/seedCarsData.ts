// Script to seed the database with more car data
// This can be run to populate the database with additional cars

import { generateCarImage } from './carImageGenerator';

const BASE_URL = "https://cars-24-clone-net-nextjs-vypo.onrender.com/api/Car";

const carDataToSeed = [
  {
    Title: "2023 Maruti FRONX DELTA PLUS 1.2L AGS",
    Images: [generateCarImage("2023 Maruti FRONX DELTA PLUS 1.2L AGS")],
    Price: "₹7,80,000",
    Emi: "₹15,245/m",
    Location: "Metro Walk, Rohini, New Delhi",
    Specs: {
      Year: 2023,
      Km: "10,048",
      Fuel: "Petrol",
      Transmission: "Auto",
      Owner: "1st owner",
      Insurance: "Valid"
    },
    Features: ["Air Conditioning", "Power Steering", "Central Locking", "Music System"],
    Highlights: ["Low Mileage", "Single Owner", "Well Maintained"]
  },
  {
    Title: "2022 Honda City ZX CVT",
    Images: [generateCarImage("2022 Honda City ZX CVT")],
    Price: "₹12,50,000",
    Emi: "₹20,500/m",
    Location: "South Ex, New Delhi",
    Specs: {
      Year: 2022,
      Km: "18,500",
      Fuel: "Petrol",
      Transmission: "CVT",
      Owner: "1st owner",
      Insurance: "Valid"
    },
    Features: ["Sunroof", "Touchscreen", "Reverse Camera", "Automatic Climate Control"],
    Highlights: ["Premium Variant", "Low Running", "Excellent Condition"]
  },
  {
    Title: "2021 Toyota Fortuner 4X4 AT",
    Images: [generateCarImage("2021 Toyota Fortuner 4X4 AT")],
    Price: "₹35,00,000",
    Emi: "₹45,000/m",
    Location: "Gurgaon, Haryana",
    Specs: {
      Year: 2021,
      Km: "35,000",
      Fuel: "Diesel",
      Transmission: "Automatic",
      Owner: "1st owner",
      Insurance: "Valid"
    },
    Features: ["4WD", "Leather Seats", "Navigation", "Cruise Control"],
    Highlights: ["Top Model", "Premium SUV", "All Features"]
  },
  {
    Title: "2020 Hyundai Creta SX IVT",
    Images: [generateCarImage("2020 Hyundai Creta SX IVT")],
    Price: "₹14,75,000",
    Emi: "₹22,000/m",
    Location: "Sector 29, Gurugram",
    Specs: {
      Year: 2020,
      Km: "28,000",
      Fuel: "Petrol",
      Transmission: "IVT",
      Owner: "1st owner",
      Insurance: "Valid"
    },
    Features: ["Sunroof", "Touchscreen", "Wireless Charging", "Auto Headlamps"],
    Highlights: ["Top Variant", "Well Maintained", "Low Running"]
  },
  {
    Title: "2022 Kia Seltos HTX Plus",
    Images: [generateCarImage("2022 Kia Seltos HTX Plus")],
    Price: "₹16,25,000",
    Emi: "₹25,500/m",
    Location: "Greater Kailash, New Delhi",
    Specs: {
      Year: 2022,
      Km: "15,000",
      Fuel: "Petrol",
      Transmission: "CVT",
      Owner: "1st owner",
      Insurance: "Valid"
    },
    Features: ["Bose Sound System", "Panoramic Sunroof", "360 Camera", "Ventilated Seats"],
    Highlights: ["Premium Variant", "Very Low Mileage", "All Features"]
  },
  {
    Title: "2021 Tata Harrier XZ Plus",
    Images: [generateCarImage("2021 Tata Harrier XZ Plus")],
    Price: "₹18,50,000",
    Emi: "₹28,500/m",
    Location: "Pitampura, New Delhi",
    Specs: {
      Year: 2021,
      Km: "32,000",
      Fuel: "Diesel",
      Transmission: "Manual",
      Owner: "1st owner",
      Insurance: "Valid"
    },
    Features: ["JBL Sound System", "Touchscreen", "Cruise Control", "Hill Assist"],
    Highlights: ["Top Model", "Powerful Engine", "Premium Features"]
  },
  {
    Title: "2023 Maruti Swift VXI",
    Images: [generateCarImage("2023 Maruti Swift VXI")],
    Price: "₹6,95,000",
    Emi: "₹12,500/m",
    Location: "Karol Bagh, New Delhi",
    Specs: {
      Year: 2023,
      Km: "8,500",
      Fuel: "Petrol",
      Transmission: "Manual",
      Owner: "1st owner",
      Insurance: "Valid"
    },
    Features: ["Air Conditioning", "Power Steering", "Central Locking", "ABS"],
    Highlights: ["Very Low Mileage", "Latest Model", "Excellent Condition"]
  },
  {
    Title: "2020 Mahindra XUV300 W8",
    Images: [generateCarImage("2020 Mahindra XUV300 W8")],
    Price: "₹9,25,000",
    Emi: "₹16,500/m",
    Location: "Rohini, New Delhi",
    Specs: {
      Year: 2020,
      Km: "25,000",
      Fuel: "Diesel",
      Transmission: "Manual",
      Owner: "1st owner",
      Insurance: "Valid"
    },
    Features: ["Touchscreen", "Reverse Camera", "Cruise Control", "Auto AC"],
    Highlights: ["Top Variant", "Low Running", "Well Maintained"]
  },
  {
    Title: "2021 Tata Nexon XZ Plus",
    Images: [generateCarImage("2021 Tata Nexon XZ Plus")],
    Price: "₹8,75,000",
    Emi: "₹14,500/m",
    Location: "Dwarka, New Delhi",
    Specs: {
      Year: 2021,
      Km: "20,000",
      Fuel: "Petrol",
      Transmission: "Manual",
      Owner: "1st owner",
      Insurance: "Valid"
    },
    Features: ["Touchscreen", "Reverse Camera", "Sunroof", "Auto AC"],
    Highlights: ["Top Model", "Low Mileage", "Well Maintained"]
  },
  {
    Title: "2022 Ford EcoSport Titanium",
    Images: [generateCarImage("2022 Ford EcoSport Titanium")],
    Price: "₹9,95,000",
    Emi: "₹16,800/m",
    Location: "Noida Sector 18, Uttar Pradesh",
    Specs: {
      Year: 2022,
      Km: "15,000",
      Fuel: "Petrol",
      Transmission: "Manual",
      Owner: "1st owner",
      Insurance: "Valid"
    },
    Features: ["Touchscreen", "Reverse Camera", "Cruise Control", "Auto Headlamps"],
    Highlights: ["Top Variant", "Very Low Mileage", "Excellent Condition"]
  },
  {
    Title: "2020 Volkswagen Polo Highline",
    Images: [generateCarImage("2020 Volkswagen Polo Highline")],
    Price: "₹7,45,000",
    Emi: "₹12,800/m",
    Location: "Pitampura, New Delhi",
    Specs: {
      Year: 2020,
      Km: "28,000",
      Fuel: "Petrol",
      Transmission: "Manual",
      Owner: "1st owner",
      Insurance: "Valid"
    },
    Features: ["Touchscreen", "Reverse Camera", "Auto AC", "Alloy Wheels"],
    Highlights: ["Premium Brand", "Low Running", "Well Maintained"]
  },
  {
    Title: "2021 Nissan Micra XV Premium",
    Images: [generateCarImage("2021 Nissan Micra XV Premium")],
    Price: "₹6,85,000",
    Emi: "₹11,500/m",
    Location: "Lajpat Nagar, New Delhi",
    Specs: {
      Year: 2021,
      Km: "22,000",
      Fuel: "Petrol",
      Transmission: "Manual",
      Owner: "1st owner",
      Insurance: "Valid"
    },
    Features: ["Touchscreen", "Reverse Camera", "Auto AC", "Keyless Entry"],
    Highlights: ["Premium Variant", "Low Mileage", "Excellent Condition"]
  }
];

export const seedCarsToDatabase = async () => {
  console.log("Starting to seed cars data...");
  
  for (const car of carDataToSeed) {
    try {
      const response = await fetch(BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(car),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Successfully added car: ${car.Title}`);
      } else {
        console.error(`❌ Failed to add car: ${car.Title} - Status: ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ Error adding car: ${car.Title}`, error);
    }
  }
  
  console.log("Finished seeding cars data");
};

// Function to check current car count in database
export const checkCarCount = async () => {
  try {
    const response = await fetch(`${BASE_URL}/summaries`);
    if (response.ok) {
      const cars = await response.json();
      console.log(`📊 Current cars in database: ${cars.length}`);
      return cars.length;
    } else {
      console.error("Failed to fetch car count");
      return 0;
    }
  } catch (error) {
    console.error("Error checking car count:", error);
    return 0;
  }
};
