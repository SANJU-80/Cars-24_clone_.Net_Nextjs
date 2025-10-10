const BASE_URL = "https://cars-24-clone-net-nextjs-vypo.onrender.com/api/Maintenance";

// Fallback data in case API is not available
const FALLBACK_BRANDS = [
  "Maruti", "Hyundai", "Honda", "Toyota", "Tata", "Mahindra",
  "Ford", "Volkswagen", "Skoda", "Nissan", "Renault", "Kia"
];

const FALLBACK_CONDITIONS = ["Excellent", "Good", "Fair", "Poor"];

export type MaintenanceRequest = {
  carId: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  condition: string;
};

export type ServicePrediction = {
  serviceType: string;
  mileageDue: number;
  kmRemaining: number;
  estimatedCost: number;
  priority: string;
  description: string;
};

export type ComponentReplacement = {
  component: string;
  mileageDue: number;
  kmRemaining: number;
  estimatedCost: number;
  priority: string;
  description: string;
};

export type MaintenanceEstimate = {
  id?: string;
  carId: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  condition: string;
  monthlyMaintenanceCost: number;
  annualMaintenanceCost: number;
  maintenanceLevel: string;
  upcomingServices: ServicePrediction[];
  componentReplacements: ComponentReplacement[];
  riskFactors: string[];
  recommendations: string[];
  estimatedAt: string;
};

export const getMaintenanceEstimate = async (request: MaintenanceRequest): Promise<MaintenanceEstimate> => {
  try {
    const response = await fetch(`${BASE_URL}/estimate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error("Maintenance estimate error:", error);
    
    // Return a mock estimate if API fails
    return generateMockEstimate(request);
  }
};

export const getSupportedBrands = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${BASE_URL}/brands`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error: any) {
    console.error("Get brands error:", error);
    console.warn("Using fallback brands data");
    return FALLBACK_BRANDS;
  }
};

export const getConditionOptions = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${BASE_URL}/conditions`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error: any) {
    console.error("Get conditions error:", error);
    console.warn("Using fallback conditions data");
    return FALLBACK_CONDITIONS;
  }
};

// Mock estimate generator for when API is not available
const generateMockEstimate = (request: MaintenanceRequest): MaintenanceEstimate => {
  const currentYear = new Date().getFullYear();
  const carAge = currentYear - request.year;
  
  // Calculate maintenance level based on age and mileage
  let maintenanceLevel = "Low";
  let monthlyCost = 2000;
  
  if (carAge > 5 || request.mileage > 80000) {
    maintenanceLevel = "High";
    monthlyCost = 8000;
  } else if (carAge > 3 || request.mileage > 50000) {
    maintenanceLevel = "Medium";
    monthlyCost = 5000;
  }
  
  // Adjust based on condition
  const conditionMultiplier = {
    "Excellent": 0.7,
    "Good": 1.0,
    "Fair": 1.3,
    "Poor": 1.8
  }[request.condition] || 1.0;
  
  monthlyCost = Math.round(monthlyCost * conditionMultiplier);
  
  // Generate mock service predictions
  const upcomingServices: ServicePrediction[] = [
    {
      serviceType: "Oil Change",
      mileageDue: request.mileage + 5000,
      kmRemaining: 5000,
      estimatedCost: 1500,
      priority: "Medium",
      description: "Regular oil and filter change"
    },
    {
      serviceType: "Brake Service",
      mileageDue: request.mileage + 15000,
      kmRemaining: 15000,
      estimatedCost: 3000,
      priority: "Low",
      description: "Brake pad inspection and replacement if needed"
    }
  ];
  
  // Generate mock component replacements
  const componentReplacements: ComponentReplacement[] = [
    {
      component: "Tires",
      mileageDue: request.mileage + 20000,
      kmRemaining: 20000,
      estimatedCost: 12000,
      priority: "Low",
      description: "Tire replacement (4 tires)"
    }
  ];
  
  return {
    carId: request.carId,
    brand: request.brand,
    model: request.model,
    year: request.year,
    mileage: request.mileage,
    condition: request.condition,
    monthlyMaintenanceCost: monthlyCost,
    annualMaintenanceCost: monthlyCost * 12,
    maintenanceLevel,
    upcomingServices,
    componentReplacements,
    riskFactors: [
      carAge > 8 ? "High mileage vehicle" : "",
      request.mileage > 100000 ? "Exceeds 1 lakh km" : "",
      request.condition === "Poor" ? "Poor condition increases maintenance needs" : ""
    ].filter(Boolean),
    recommendations: [
      "Follow manufacturer's service schedule",
      "Keep maintenance records",
      "Budget for unexpected repairs"
    ],
    estimatedAt: new Date().toISOString()
  };
};
