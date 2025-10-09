const BASE_URL = "https://cars-24-clone-net-nextjs-vypo.onrender.com/api/Maintenance";

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
    throw new Error(`Failed to get maintenance estimate: ${error.message}`);
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
    throw new Error(`Failed to get supported brands: ${error.message}`);
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
    throw new Error(`Failed to get condition options: ${error.message}`);
  }
};
