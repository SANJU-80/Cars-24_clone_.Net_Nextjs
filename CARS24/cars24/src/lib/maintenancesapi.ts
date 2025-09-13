type BrandModel = {
  brand: string;
  avgAnnualServiceCost: number;
  majorServiceInterval: number;
  tireLife: number;
  image: string; // Add image property
};

const BRAND_DATA: BrandModel[] = [
  {
    brand: "Maruti",
    avgAnnualServiceCost: 350,
    majorServiceInterval: 40000,
    tireLife: 45000,
    image: "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg"
  },
  {
    brand: "Hyundai",
    avgAnnualServiceCost: 400,
    majorServiceInterval: 40000,
    tireLife: 40000,
    image: "https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg"
  },
  {
    brand: "Honda",
    avgAnnualServiceCost: 500,
    majorServiceInterval: 40000,
    tireLife: 40000,
    image: "https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg"
  },
  {
    brand: "Tata",
    avgAnnualServiceCost: 380,
    majorServiceInterval: 35000,
    tireLife: 40000,
    image: "https://images.pexels.com/photos/1280560/pexels-photo-1280560.jpeg"
  },
];

function getConditionMultiplier(age: number, km: number): number {
  if (age > 8 || km > 120_000) return 1.5;
  if (age > 5 || km > 80_000) return 1.3;
  if (age > 3 || km > 50_000) return 1.1;
  return 1.0;
}

export function estimateMaintenance(
  brand: string,
  year: number,
  kmStr: string
) {
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
  if (maintenanceLevel === "Moderate") insights.push("Moderate Maintenance Expected");
  if (nextMajorServiceInKm < 5000)
    insights.push(`Next major service due in ${nextMajorServiceInKm} km`);
  if (tireReplacementSoon)
    insights.push("Expected tire replacement soon");

  return {
    monthlyCost,
    maintenanceLevel,
    nextMajorServiceInKm,
    tireReplacementSoon,
    insights,
    brandImage: car.image // Return the image for the brand
  };
}