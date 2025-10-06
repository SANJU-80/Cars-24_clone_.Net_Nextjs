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
  }
];

function getConditionMultiplier(age: number, km: number): number {
  if (age > 8 || km > 120_000) return 1.5; // High
  if (age > 5 || km > 80_000) return 1.3;  // Moderate
  if (age > 3 || km > 50_000) return 1.1;  // Slight increase
  return 1.0;                               // Normal
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

  let maintenanceLevel: "Low" | "Moderate" | "High" = "Low";
  if (multiplier >= 1.5) maintenanceLevel = "High";
  else if (multiplier >= 1.3) maintenanceLevel = "Moderate";

  const nextMajorServiceInKm = car.majorServiceInterval - (km % car.majorServiceInterval);
  const tireReplacementSoon = (car.tireLife - (km % car.tireLife)) < 5000;

  const insights: string[] = [];
  if (maintenanceLevel === "High") insights.push("High Maintenance Expected");
  else if (maintenanceLevel === "Moderate") insights.push("Moderate Maintenance Expected");

  if (nextMajorServiceInKm < 5000) insights.push(`Next major service due in ${nextMajorServiceInKm} km`);
  if (tireReplacementSoon) insights.push("Expected tire replacement soon");

  return {
    monthlyCost,
    maintenanceLevel,
    nextMajorServiceInKm,
    tireReplacementSoon,
    insights,
    brandImage: car.image
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
