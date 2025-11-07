"use client";
import React, { useState } from "react";
import { Wrench, DollarSign, Calendar, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface MaintenanceEstimate {
  monthlyCost: number;
  annualCost: number;
  riskLevel: "Low" | "Medium" | "High";
  nextServiceKm: number;
  nextServiceType: string;
  insights: string[];
}

const carBrands = [
  "Maruti Suzuki",
  "Hyundai",
  "Tata",
  "Mahindra",
  "Honda",
  "Toyota",
  "Ford",
  "Volkswagen",
  "Skoda",
  "Nissan",
  "Renault",
  "Kia",
  "MG",
  "Other",
];

const conditions = ["Excellent", "Good", "Fair", "Poor"];

// Average monthly maintenance costs by brand (in INR)
const brandMaintenanceCosts: Record<string, number> = {
  "Maruti Suzuki": 2000,
  "Hyundai": 2500,
  "Tata": 2800,
  "Mahindra": 3000,
  "Honda": 3500,
  "Toyota": 3200,
  "Ford": 4000,
  "Volkswagen": 4500,
  "Skoda": 4500,
  "Nissan": 3500,
  "Renault": 3200,
  "Kia": 2800,
  "MG": 3000,
  "Other": 3000,
};

// Condition multipliers
const conditionMultipliers: Record<string, number> = {
  "Excellent": 0.8,
  "Good": 1.0,
  "Fair": 1.3,
  "Poor": 1.6,
};

// Age-based multipliers (years)
const getAgeMultiplier = (age: number): number => {
  if (age <= 2) return 0.7;
  if (age <= 4) return 1.0;
  if (age <= 6) return 1.4;
  if (age <= 8) return 1.8;
  return 2.2;
};

// Mileage-based multipliers
const getMileageMultiplier = (mileage: number): number => {
  if (mileage < 30000) return 0.8;
  if (mileage < 50000) return 1.0;
  if (mileage < 80000) return 1.3;
  if (mileage < 120000) return 1.6;
  return 2.0;
};

const calculateMaintenanceEstimate = (
  brand: string,
  year: number,
  mileage: number,
  condition: string
): MaintenanceEstimate => {
  const currentYear = new Date().getFullYear();
  const age = currentYear - year;
  
  const baseCost = brandMaintenanceCosts[brand] || 3000;
  const conditionMult = conditionMultipliers[condition] || 1.0;
  const ageMult = getAgeMultiplier(age);
  const mileageMult = getMileageMultiplier(mileage);
  
  const monthlyCost = Math.round(baseCost * conditionMult * ageMult * mileageMult);
  const annualCost = monthlyCost * 12;
  
  // Determine risk level
  let riskLevel: "Low" | "Medium" | "High" = "Low";
  if (age >= 6 && mileage >= 80000) {
    riskLevel = "High";
  } else if (age >= 4 || mileage >= 50000) {
    riskLevel = "Medium";
  }
  
  // Calculate next service
  const lastServiceKm = mileage % 10000;
  const nextServiceKm = 10000 - lastServiceKm;
  let nextServiceType = "Regular Service";
  
  if (mileage >= 40000 && mileage < 50000) {
    nextServiceType = "Major Service (40K)";
  } else if (mileage >= 80000 && mileage < 90000) {
    nextServiceType = "Major Service (80K)";
  } else if (mileage >= 100000 && mileage < 110000) {
    nextServiceType = "Major Service (100K)";
  }
  
  // Generate insights
  const insights: string[] = [];
  
  if (age >= 6 && mileage >= 80000) {
    insights.push("High maintenance expected due to age and mileage");
  }
  
  if (mileage >= 60000 && mileage < 70000) {
    insights.push("Tire replacement likely needed soon (typically at 60K-70K km)");
  } else if (mileage >= 100000) {
    insights.push("Tire replacement may be needed");
  }
  
  if (mileage >= 50000 && mileage < 60000) {
    insights.push("Battery replacement may be needed (typically at 50K-60K km)");
  }
  
  if (age >= 5) {
    insights.push("Older vehicle - expect higher frequency of repairs");
  }
  
  if (condition === "Poor") {
    insights.push("Poor condition may require additional repairs");
  }
  
  if (mileage >= 80000) {
    insights.push("Timing belt replacement may be due (check manufacturer guidelines)");
  }
  
  if (insights.length === 0) {
    insights.push("Vehicle in good condition with normal maintenance expected");
  }
  
  return {
    monthlyCost,
    annualCost,
    riskLevel,
    nextServiceKm,
    nextServiceType,
    insights,
  };
};

export default function MaintenancePage() {
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("2025");
  const [mileage, setMileage] = useState("0");
  const [condition, setCondition] = useState("Good");
  const [estimate, setEstimate] = useState<MaintenanceEstimate | null>(null);
  const [showResults, setShowResults] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!brand || !model || !year || !mileage) {
      alert("Please fill in all required fields");
      return;
    }
    
    const yearNum = parseInt(year);
    const mileageNum = parseInt(mileage);
    
    if (isNaN(yearNum) || yearNum < 1990 || yearNum > new Date().getFullYear() + 1) {
      alert("Please enter a valid year");
      return;
    }
    
    if (isNaN(mileageNum) || mileageNum < 0) {
      alert("Please enter a valid mileage");
      return;
    }
    
    const result = calculateMaintenanceEstimate(brand, yearNum, mileageNum, condition);
    setEstimate(result);
    setShowResults(true);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "High":
        return "bg-red-100 text-red-800 border-red-300";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-green-100 text-green-800 border-green-300";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <style dangerouslySetInnerHTML={{__html: `
        .maintenance-form input::placeholder {
          color: #6b7280 !important;
          opacity: 1 !important;
        }
        .maintenance-form input {
          color: #111827 !important;
        }
        .maintenance-form select {
          color: #111827 !important;
        }
      `}} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Cost Estimation</h3>
            </div>
            <p className="text-sm text-gray-600">
              Get monthly and annual maintenance cost estimates based on real-world data.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Service Predictions</h3>
            </div>
            <p className="text-sm text-gray-600">
              Know when your next service is due and what it will cost.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="bg-orange-100 p-3 rounded-full mr-4">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Risk Assessment</h3>
            </div>
            <p className="text-sm text-gray-600">
              Understand potential risks and get personalized recommendations.
            </p>
          </div>
        </div>

        {/* Main Form Box */}
        <div className="bg-white rounded-2xl shadow-2xl p-10 border-4 border-blue-300 relative overflow-hidden">
          {/* Decorative top border */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500"></div>
          <div className="flex items-center mb-8 pt-2">
            <div className="bg-blue-500 p-3 rounded-full mr-4 shadow-lg">
              <Wrench className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Maintenance Cost Estimator</h2>
          </div>

          <form onSubmit={handleSubmit} className="maintenance-form space-y-6 bg-white p-8 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Brand <span className="text-red-500">*</span>
                </label>
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full h-14 rounded-lg bg-white px-4 py-3 text-lg font-medium text-gray-900 shadow-lg transition-all focus-visible:border-blue-600 focus-visible:ring-4 focus-visible:ring-blue-500/40 outline-none hover:border-blue-600"
                  style={{ borderWidth: '3px', borderColor: '#4b5563', borderStyle: 'solid' }}
                  required
                >
                  <option value="" className="text-gray-400">Select Brand</option>
                  {carBrands.map((b) => (
                    <option key={b} value={b} className="text-gray-900">
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Model <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g., Swift, i20, City"
                  className="h-14 text-lg font-medium rounded-lg px-4 shadow-lg focus-visible:border-blue-600 focus-visible:ring-4 focus-visible:ring-blue-500/40 hover:border-blue-600 bg-white text-gray-900"
                  style={{ borderWidth: '3px', borderColor: '#4b5563', borderStyle: 'solid' }}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Year <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  min="1990"
                  max={new Date().getFullYear() + 1}
                  placeholder="2019"
                  className="h-14 text-lg font-medium rounded-lg px-4 shadow-lg focus-visible:border-blue-600 focus-visible:ring-4 focus-visible:ring-blue-500/40 hover:border-blue-600 bg-white text-gray-900"
                  style={{ borderWidth: '3px', borderColor: '#4b5563', borderStyle: 'solid' }}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Mileage (km) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  value={mileage}
                  onChange={(e) => setMileage(e.target.value)}
                  min="0"
                  placeholder="087987"
                  className="h-14 text-lg font-medium rounded-lg px-4 shadow-lg focus-visible:border-blue-600 focus-visible:ring-4 focus-visible:ring-blue-500/40 hover:border-blue-600 bg-white text-gray-900"
                  style={{ borderWidth: '3px', borderColor: '#4b5563', borderStyle: 'solid' }}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Condition
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full h-14 rounded-lg bg-white px-4 py-3 text-lg font-medium text-gray-900 shadow-lg transition-all focus-visible:border-blue-600 focus-visible:ring-4 focus-visible:ring-blue-500/40 outline-none hover:border-blue-600"
                  style={{ borderWidth: '3px', borderColor: '#4b5563', borderStyle: 'solid' }}
                >
                  {conditions.map((c) => (
                    <option key={c} value={c} className="text-gray-900">
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-7 text-xl font-bold rounded-lg shadow-xl hover:shadow-2xl transition-all transform hover:scale-[1.02]"
            >
              Get Maintenance Estimate
            </Button>
          </form>

          {/* Results Section */}
          {showResults && estimate && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="space-y-6">
                {/* Risk Level Badge */}
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">Estimate Results</h3>
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold border ${getRiskColor(
                      estimate.riskLevel
                    )}`}
                  >
                    {estimate.riskLevel === "High" && "⚠️ "}
                    {estimate.riskLevel} Maintenance {estimate.riskLevel === "High" && "Expected"}
                  </span>
                </div>

                {/* Cost Estimates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                    <div className="flex items-center mb-2">
                      <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
                      <h4 className="text-sm font-medium text-gray-700">Monthly Cost</h4>
                    </div>
                    <p className="text-3xl font-bold text-blue-600">
                      ₹{estimate.monthlyCost.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Estimated monthly maintenance</p>
                  </div>

                  <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                    <div className="flex items-center mb-2">
                      <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                      <h4 className="text-sm font-medium text-gray-700">Annual Cost</h4>
                    </div>
                    <p className="text-3xl font-bold text-green-600">
                      ₹{estimate.annualCost.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Estimated annual maintenance</p>
                  </div>
                </div>

                {/* Next Service Info */}
                <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                  <div className="flex items-center mb-3">
                    <Calendar className="h-5 w-5 text-yellow-600 mr-2" />
                    <h4 className="text-lg font-semibold text-gray-900">Next Service</h4>
                  </div>
                  <p className="text-2xl font-bold text-yellow-700 mb-1">
                    Due in {estimate.nextServiceKm.toLocaleString()} km
                  </p>
                  <p className="text-sm text-gray-600">{estimate.nextServiceType}</p>
                </div>

                {/* Insights */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="flex items-center mb-4">
                    <AlertTriangle className="h-5 w-5 text-gray-600 mr-2" />
                    <h4 className="text-lg font-semibold text-gray-900">Maintenance Insights</h4>
                  </div>
                  <ul className="space-y-2">
                    {estimate.insights.map((insight, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

