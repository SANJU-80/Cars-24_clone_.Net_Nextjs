const BASE_URL = "https://cars-24-clone-net-nextjs-vypo.onrender.com/api/Maintenance";

type BrandModel = {
  brand: string;
  avgAnnualServiceCost: number;
  majorServiceInterval: number;
  tireLife: number;
  image: string;
};

const BRAND_DATA: BrandModel[] = [
  /*{
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
  }*/
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
    brandImage: car.image
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
  {
    id: "creta-2021",
    brand: "Hyundai",
    avgAnnualServiceCost: 18000,
    majorServiceInterval: 10000,
    tireLife: 40000,
    title: "2021 Hyundai Creta SX IVT",
    km: "20,500",
    fuel: "Petrol",
    transmission: "Auto",
    owner: "1st owner",
    emi: "₹18,999/m",
    price: "₹11.20 lakh",
    location: "Sector 29, Gurugram",
    image: "https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&w=600",
  },
  {
    id: "baleno-2020",
    brand: "Maruti",
    avgAnnualServiceCost: 13000,
    majorServiceInterval: 10000,
    tireLife: 45000,
    title: "2020 Maruti Baleno ZETA",
    km: "30,000",
    fuel: "Petrol",
    transmission: "Manual",
    owner: "2nd owner",
    emi: "₹10,600/m",
    price: "₹6.45 lakh",
    location: "Karol Bagh, New Delhi",
    image: "https://images.pexels.com/photos/112460/pexels-photo-112460.jpeg?auto=compress&w=600",
  },
  {
    id: "eco-2018",
    brand: "Maruti",
    avgAnnualServiceCost: 12000,
    majorServiceInterval: 10000,
    tireLife: 45000,
    title: "2018 Maruti Eeco 5 STR WITH A/C+HTR",
    km: "45,000",
    fuel: "Petrol",
    transmission: "Manual",
    owner: "1st owner",
    emi: "₹5,300/m",
    price: "₹3.10 lakh",
    location: "Lajpat Nagar, New Delhi",
    image: "https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&w=600",
  },
  {
    id: "city-2019",
    brand: "Honda",
    avgAnnualServiceCost: 16000,
    majorServiceInterval: 10000,
    tireLife: 50000,
    title: "2019 Honda City ZX CVT",
    km: "25,000",
    fuel: "Petrol",
    transmission: "Auto",
    owner: "1st owner",
    emi: "₹16,500/m",
    price: "₹9.95 lakh",
    location: "South Ex, New Delhi",
    image: "https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg?auto=compress&w=600",
  },
  {
    id: "venue-2022",
    brand: "Hyundai",
    avgAnnualServiceCost: 17000,
    majorServiceInterval: 10000,
    tireLife: 40000,
    title: "2022 Hyundai Venue SX Turbo",
    km: "12,000",
    fuel: "Petrol",
    transmission: "Auto",
    owner: "1st owner",
    emi: "₹14,875/m",
    price: "₹9.40 lakh",
    location: "Noida Sector 63, Uttar Pradesh",
    image: "https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg?auto=compress&w=600",
  },
  {
    id: "altroz-2021",
    brand: "Tata",
    avgAnnualServiceCost: 14000,
    majorServiceInterval: 10000,
    tireLife: 55000,
    title: "2021 Tata Altroz XT Petrol",
    km: "18,000",
    fuel: "Petrol",
    transmission: "Manual",
    owner: "1st owner",
    emi: "₹9,350/m",
    price: "₹6.75 lakh",
    location: "Dwarka, New Delhi",
    image: "https://images.pexels.com/photos/1280560/pexels-photo-1280560.jpeg?auto=compress&w=600",
  },
  {
    id: "dzire-2016",
    brand: "Maruti",
    avgAnnualServiceCost: 12000,
    majorServiceInterval: 10000,
    tireLife: 45000,
    title: "2016 Maruti Dzire VDI",
    km: "80,000",
    fuel: "Diesel",
    transmission: "Manual",
    owner: "2nd owner",
    emi: "₹6,800/m",
    price: "₹3.50 lakh",
    location: "Janakpuri, New Delhi",
    image: "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&w=600",
  },
  {
    id: "amaze-2018",
    brand: "Honda",
    avgAnnualServiceCost: 16000,
    majorServiceInterval: 10000,
    tireLife: 50000,
    title: "2018 Honda Amaze S i-VTEC",
    km: "35,000",
    fuel: "Petrol",
    transmission: "Manual",
    owner: "1st owner",
    emi: "₹8,900/m",
    price: "₹5.25 lakh",
    location: "Pitampura, New Delhi",
    image: "https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg?auto=compress&w=600",
  }
];