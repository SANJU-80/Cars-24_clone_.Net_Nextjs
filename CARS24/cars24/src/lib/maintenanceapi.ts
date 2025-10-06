const BASE_URL = "https://cars-24-clone-net-nextjs-vypo.onrender.com/api/Maintenance";

type BrandModel = {
  brand: string;
  avgAnnualServiceCost: number;
  majorServiceInterval: number;
  tireLife: number;
  image: string;
};

const BRAND_DATA: BrandModel[] = [
  {
    brand: "Maruti",
    avgAnnualServiceCost: 15000,
    majorServiceInterval: 10000,
    tireLife: 45000,
    image: "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&w=600"
  },
  {
    brand: "Hyundai",
    avgAnnualServiceCost: 18000,
    majorServiceInterval: 10000,
    tireLife: 40000,
    image: "https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&w=600"
  },
  {
    brand: "Honda",
    avgAnnualServiceCost: 16000,
    majorServiceInterval: 10000,
    tireLife: 50000,
    image: "https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg?auto=compress&w=600"
  },
  {
    brand: "Tata",
    avgAnnualServiceCost: 14000,
    majorServiceInterval: 10000,
    tireLife: 55000,
    image: "https://images.pexels.com/photos/1280560/pexels-photo-1280560.jpeg?auto=compress&w=600"
  },
  {
    brand: "Toyota",
    avgAnnualServiceCost: 20000,
    majorServiceInterval: 10000,
    tireLife: 50000,
    image: "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&w=600"
  },
  {
    brand: "Kia",
    avgAnnualServiceCost: 19000,
    majorServiceInterval: 10000,
    tireLife: 45000,
    image: "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&w=600"
  },
  {
    brand: "Mahindra",
    avgAnnualServiceCost: 17000,
    majorServiceInterval: 10000,
    tireLife: 50000,
    image: "https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg?auto=compress&w=600"
  },
  {
    brand: "MG",
    avgAnnualServiceCost: 22000,
    majorServiceInterval: 10000,
    tireLife: 45000,
    image: "https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&w=600"
  },
  {
    brand: "Renault",
    avgAnnualServiceCost: 16000,
    majorServiceInterval: 10000,
    tireLife: 40000,
    image: "https://images.pexels.com/photos/1280560/pexels-photo-1280560.jpeg?auto=compress&w=600"
  },
  {
    brand: "Nissan",
    avgAnnualServiceCost: 18000,
    majorServiceInterval: 10000,
    tireLife: 45000,
    image: "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&w=600"
  },
  {
    brand: "Skoda",
    avgAnnualServiceCost: 25000,
    majorServiceInterval: 15000,
    tireLife: 50000,
    image: "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&w=600"
  },
  {
    brand: "Volkswagen",
    avgAnnualServiceCost: 24000,
    majorServiceInterval: 15000,
    tireLife: 50000,
    image: "https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg?auto=compress&w=600"
  },
  {
    brand: "BMW",
    avgAnnualServiceCost: 45000,
    majorServiceInterval: 15000,
    tireLife: 40000,
    image: "https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&w=600"
  },
  {
    brand: "Mercedes",
    avgAnnualServiceCost: 50000,
    majorServiceInterval: 15000,
    tireLife: 40000,
    image: "https://images.pexels.com/photos/1280560/pexels-photo-1280560.jpeg?auto=compress&w=600"
  },
  {
    brand: "Audi",
    avgAnnualServiceCost: 42000,
    majorServiceInterval: 15000,
    tireLife: 40000,
    image: "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&w=600"
  }
];

function getConditionMultiplier(age: number, km: number): number {
  // More sophisticated condition assessment
  let multiplier = 1.0;
  
  // Age-based adjustments
  if (age > 10) multiplier += 0.6;
  else if (age > 8) multiplier += 0.4;
  else if (age > 6) multiplier += 0.3;
  else if (age > 4) multiplier += 0.2;
  else if (age > 2) multiplier += 0.1;
  
  // Mileage-based adjustments
  if (km > 150_000) multiplier += 0.5;
  else if (km > 120_000) multiplier += 0.4;
  else if (km > 100_000) multiplier += 0.3;
  else if (km > 80_000) multiplier += 0.2;
  else if (km > 60_000) multiplier += 0.1;
  
  // Combined high-risk assessment
  if (age > 8 && km > 100_000) multiplier += 0.2;
  if (age > 10 && km > 120_000) multiplier += 0.3;
  
  return Math.min(multiplier, 2.0); // Cap at 2.0x
}

export function estimateMaintenance(brand: string, year: number, kmStr: string) {
  const car = BRAND_DATA.find((b) => brand.includes(b.brand));
  if (!car) return null;

  const currentYear = new Date().getFullYear();
  const age = currentYear - year;
  const km = parseInt(kmStr.replace(/,/g, ""));
  const multiplier = getConditionMultiplier(age, km);

  const annualCost = car.avgAnnualServiceCost * multiplier;
  const monthlyCost = Math.round(annualCost / 12);

  // Enhanced maintenance level categorization
  let maintenanceLevel: "Low" | "Moderate" | "High" | "Very High" = "Low";
  if (multiplier >= 1.8) maintenanceLevel = "Very High";
  else if (multiplier >= 1.5) maintenanceLevel = "High";
  else if (multiplier >= 1.2) maintenanceLevel = "Moderate";

  // Calculate service intervals
  const nextMajorServiceInKm = car.majorServiceInterval - (km % car.majorServiceInterval);
  const tireReplacementSoon = (car.tireLife - (km % car.tireLife)) < 5000;
  const brakePadReplacementSoon = (30000 - (km % 30000)) < 3000; // Brake pads every 30k km
  const batteryReplacementSoon = age > 3 && (40000 - (km % 40000)) < 5000; // Battery every 3-4 years

  // Generate comprehensive insights
  const insights: string[] = [];
  
  // Maintenance level insights
  if (maintenanceLevel === "Very High") {
    insights.push("⚠️ Very High Maintenance Expected");
    insights.push("Consider comprehensive inspection before purchase");
  } else if (maintenanceLevel === "High") {
    insights.push("🔧 High Maintenance Expected");
  } else if (maintenanceLevel === "Moderate") {
    insights.push("⚙️ Moderate Maintenance Expected");
  } else {
    insights.push("✅ Low Maintenance Expected");
  }

  // Service reminders
  if (nextMajorServiceInKm < 2000) {
    insights.push(`🔧 Next major service due in ${nextMajorServiceInKm.toLocaleString()} km`);
  } else if (nextMajorServiceInKm < 5000) {
    insights.push(`📅 Major service due in ${nextMajorServiceInKm.toLocaleString()} km`);
  }

  // Component replacement alerts
  if (tireReplacementSoon) {
    insights.push("🛞 Tire replacement expected soon");
  }
  if (brakePadReplacementSoon) {
    insights.push("🛑 Brake pad replacement due soon");
  }
  if (batteryReplacementSoon) {
    insights.push("🔋 Battery replacement may be needed");
  }

  // Age and mileage warnings
  if (age > 8) {
    insights.push(`📅 ${age}-year-old vehicle - higher maintenance likely`);
  }
  if (km > 100_000) {
    insights.push(`🛣️ High mileage (${km.toLocaleString()} km) - increased wear expected`);
  }

  // Brand-specific insights
  if (["BMW", "Mercedes", "Audi"].includes(car.brand)) {
    insights.push("💎 Premium brand - higher service costs");
  } else if (["Maruti", "Tata"].includes(car.brand)) {
    insights.push("💰 Budget-friendly maintenance costs");
  }

  return {
    monthlyCost,
    annualCost: Math.round(annualCost),
    maintenanceLevel,
    nextMajorServiceInKm,
    tireReplacementSoon,
    brakePadReplacementSoon,
    batteryReplacementSoon,
    insights,
    brandImage: car.image,
    multiplier: Math.round(multiplier * 100) / 100,
    age,
    km
  };
}

// ✅ Moved outside (fixes the modifier error)
export function parseBrandAndYear(title: string) {
  const yearMatch = title.match(/\b(19|20)\d{2}\b/);
  const year = yearMatch ? parseInt(yearMatch[0]) : new Date().getFullYear();

  const brandList = [
    "Maruti",
    "Hyundai",
    "Honda",
    "Tata",
    "Toyota",
    "Kia",
    "Mahindra",
    "MG",
    "Renault",
    "Nissan",
    "Skoda",
    "Volkswagen",
  ];
  const foundBrand = brandList.find((b) =>
    title.toLowerCase().includes(b.toLowerCase())
  );

  return {
    brand: foundBrand || "Unknown",
    year,
  };
}

export const CARS = [
  {
    id: "fronx-2023",
    brand: "Maruti",
    avgAnnualServiceCost: 15000,
    majorServiceInterval: 10000,
    tireLife: 45000,
    title: "2023 Maruti FRONX DELTA PLUS 1.2L AGS",
    km: "10,048",
    fuel: "Petrol",
    transmission: "Auto",
    owner: "1st owner",
    emi: "₹15,245/m",
    price: "₹7.80 lakh",
    location: "Metro Walk, Rohini, New Delhi",
    image: "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&w=600",
  },
  {
    id: "swift-2017",
    brand: "Maruti",
    avgAnnualServiceCost: 12000,
    majorServiceInterval: 10000,
    tireLife: 45000,
    title: "2017 Maruti Swift VXI (O)",
    km: "60,056",
    fuel: "Petrol",
    transmission: "Manual",
    owner: "1st owner",
    emi: "₹7,214/m",
    price: "₹3.69 lakh",
    location: "Metro Walk, Rohini, New Delhi",
    image: "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&w=600",
  },
];
