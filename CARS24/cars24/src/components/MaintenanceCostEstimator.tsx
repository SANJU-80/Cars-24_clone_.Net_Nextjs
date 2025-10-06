"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { estimateMaintenance } from '@/lib/maintenanceapi';
import { Calculator, AlertTriangle, CheckCircle, Wrench, Calendar, Zap } from 'lucide-react';

interface MaintenanceEstimate {
  monthlyCost: number;
  annualCost: number;
  maintenanceLevel: "Low" | "Moderate" | "High" | "Very High";
  nextMajorServiceInKm: number;
  tireReplacementSoon: boolean;
  brakePadReplacementSoon: boolean;
  batteryReplacementSoon: boolean;
  insights: string[];
  brandImage: string;
  multiplier: number;
  age: number;
  km: number;
}

const MaintenanceCostEstimator: React.FC = () => {
  const [brand, setBrand] = useState('');
  const [year, setYear] = useState('');
  const [km, setKm] = useState('');
  const [estimate, setEstimate] = useState<MaintenanceEstimate | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleEstimate = () => {
    if (!brand || !year || !km) return;
    
    setIsCalculating(true);
    try {
      const result = estimateMaintenance(brand, parseInt(year), km);
      setEstimate(result);
    } catch (error) {
      console.error('Error estimating maintenance:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const getMaintenanceLevelColor = (level: string) => {
    switch (level) {
      case 'Very High': return 'text-red-600 bg-red-50 border-red-200';
      case 'High': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getMaintenanceLevelIcon = (level: string) => {
    switch (level) {
      case 'Very High': return <AlertTriangle className="h-5 w-5" />;
      case 'High': return <Wrench className="h-5 w-5" />;
      case 'Moderate': return <Calendar className="h-5 w-5" />;
      case 'Low': return <CheckCircle className="h-5 w-5" />;
      default: return <Calculator className="h-5 w-5" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Maintenance Cost Estimator</h2>
        <p className="text-gray-600">Get accurate maintenance cost estimates for any car based on age, mileage, and brand</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Car Brand
            </label>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Brand</option>
              <option value="Maruti">Maruti</option>
              <option value="Hyundai">Hyundai</option>
              <option value="Honda">Honda</option>
              <option value="Tata">Tata</option>
              <option value="Toyota">Toyota</option>
              <option value="Kia">Kia</option>
              <option value="Mahindra">Mahindra</option>
              <option value="MG">MG</option>
              <option value="Renault">Renault</option>
              <option value="Nissan">Nissan</option>
              <option value="Skoda">Skoda</option>
              <option value="Volkswagen">Volkswagen</option>
              <option value="BMW">BMW</option>
              <option value="Mercedes">Mercedes</option>
              <option value="Audi">Audi</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Manufacturing Year
            </label>
            <Input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="e.g., 2018"
              min="1990"
              max={new Date().getFullYear()}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kilometers Driven
            </label>
            <Input
              type="text"
              value={km}
              onChange={(e) => setKm(e.target.value)}
              placeholder="e.g., 45,000"
            />
          </div>

          <Button
            onClick={handleEstimate}
            disabled={!brand || !year || !km || isCalculating}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isCalculating ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Calculating...
              </div>
            ) : (
              <div className="flex items-center">
                <Calculator className="h-4 w-4 mr-2" />
                Estimate Maintenance Cost
              </div>
            )}
          </Button>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {estimate ? (
            <>
              {/* Maintenance Level Badge */}
              <div className={`p-4 rounded-lg border-2 ${getMaintenanceLevelColor(estimate.maintenanceLevel)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getMaintenanceLevelIcon(estimate.maintenanceLevel)}
                    <span className="ml-2 font-semibold text-lg">
                      {estimate.maintenanceLevel} Maintenance
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm opacity-75">Condition Multiplier</div>
                    <div className="font-bold">{estimate.multiplier}x</div>
                  </div>
                </div>
              </div>

              {/* Cost Estimates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">₹{estimate.monthlyCost.toLocaleString()}</div>
                  <div className="text-sm text-blue-600">Monthly Cost</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">₹{estimate.annualCost.toLocaleString()}</div>
                  <div className="text-sm text-green-600">Annual Cost</div>
                </div>
              </div>

              {/* Vehicle Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Vehicle Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Age:</span>
                    <span className="ml-2 font-medium">{estimate.age} years</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Mileage:</span>
                    <span className="ml-2 font-medium">{estimate.km.toLocaleString()} km</span>
                  </div>
                </div>
              </div>

              {/* Service Alerts */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Service Alerts</h3>
                
                {estimate.nextMajorServiceInKm < 5000 && (
                  <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <Calendar className="h-5 w-5 text-yellow-600 mr-3" />
                    <div>
                      <div className="font-medium text-yellow-800">
                        Next major service in {estimate.nextMajorServiceInKm.toLocaleString()} km
                      </div>
                    </div>
                  </div>
                )}

                {estimate.tireReplacementSoon && (
                  <div className="flex items-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <Zap className="h-5 w-5 text-orange-600 mr-3" />
                    <div className="font-medium text-orange-800">Tire replacement expected soon</div>
                  </div>
                )}

                {estimate.brakePadReplacementSoon && (
                  <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
                    <div className="font-medium text-red-800">Brake pad replacement due soon</div>
                  </div>
                )}

                {estimate.batteryReplacementSoon && (
                  <div className="flex items-center p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <Wrench className="h-5 w-5 text-purple-600 mr-3" />
                    <div className="font-medium text-purple-800">Battery replacement may be needed</div>
                  </div>
                )}
              </div>

              {/* Insights */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Insights & Recommendations</h3>
                <div className="space-y-2">
                  {estimate.insights.map((insight, index) => (
                    <div key={index} className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                      {insight}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500 py-12">
              <Calculator className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Enter car details to get maintenance cost estimates</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaintenanceCostEstimator;
