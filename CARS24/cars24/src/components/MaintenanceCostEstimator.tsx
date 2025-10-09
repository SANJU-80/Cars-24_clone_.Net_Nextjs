import React, { useState, useEffect } from 'react';
import { getMaintenanceEstimate, getSupportedBrands, getConditionOptions, MaintenanceRequest, MaintenanceEstimate } from '@/lib/maintenanceapi';
import { AlertCircle, Wrench, DollarSign, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface MaintenanceCostEstimatorProps {
  carId?: string;
  initialData?: {
    brand: string;
    model: string;
    year: number;
    mileage: number;
  };
  onEstimateComplete?: (estimate: MaintenanceEstimate) => void;
}

const MaintenanceCostEstimator: React.FC<MaintenanceCostEstimatorProps> = ({
  carId = '',
  initialData,
  onEstimateComplete
}) => {
  const [formData, setFormData] = useState({
    brand: initialData?.brand || '',
    model: initialData?.model || '',
    year: initialData?.year || new Date().getFullYear(),
    mileage: initialData?.mileage || 0,
    condition: 'Good'
  });

  const [brands, setBrands] = useState<string[]>([]);
  const [conditions, setConditions] = useState<string[]>([]);
  const [estimate, setEstimate] = useState<MaintenanceEstimate | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [brandsData, conditionsData] = await Promise.all([
          getSupportedBrands(),
          getConditionOptions()
        ]);
        setBrands(brandsData);
        setConditions(conditionsData);
      } catch (error) {
        console.error('Error loading initial data:', error);
        toast.error('Failed to load form data');
      } finally {
        setLoadingData(false);
      }
    };

    loadInitialData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' || name === 'mileage' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.brand || !formData.model || formData.year <= 0 || formData.mileage < 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const request: MaintenanceRequest = {
        carId,
        brand: formData.brand,
        model: formData.model,
        year: formData.year,
        mileage: formData.mileage,
        condition: formData.condition
      };

      const estimateData = await getMaintenanceEstimate(request);
      setEstimate(estimateData);
      onEstimateComplete?.(estimateData);
      toast.success('Maintenance estimate generated successfully!');
    } catch (error: any) {
      console.error('Error getting estimate:', error);
      toast.error(error.message || 'Failed to get maintenance estimate');
    } finally {
      setLoading(false);
    }
  };

  const getMaintenanceLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loadingData) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <Wrench className="w-6 h-6 text-blue-600 mr-2" />
        <h2 className="text-2xl font-bold text-gray-800">Maintenance Cost Estimator</h2>
      </div>

      {!estimate ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand *
              </label>
              <select
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Brand</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model *
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Swift, i20, City"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year *
              </label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                min="1990"
                max={new Date().getFullYear()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mileage (km) *
              </label>
              <input
                type="number"
                name="mileage"
                value={formData.mileage}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Condition
              </label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {conditions.map(condition => (
                  <option key={condition} value={condition}>{condition}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-md text-white font-medium ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Calculating...' : 'Get Maintenance Estimate'}
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Maintenance Summary</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getMaintenanceLevelColor(estimate.maintenanceLevel)}`}>
                {estimate.maintenanceLevel} Maintenance Expected
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                <div>
                  <p className="text-sm text-gray-600">Monthly Cost</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{estimate.monthlyMaintenanceCost.toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                <div>
                  <p className="text-sm text-gray-600">Annual Cost</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ₹{estimate.annualMaintenanceCost.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Services */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Wrench className="w-5 h-5 mr-2" />
              Upcoming Services
            </h3>
            <div className="space-y-3">
              {estimate.upcomingServices.map((service, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800">{service.serviceType}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(service.priority)}`}>
                      {service.priority} Priority
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Due in: {service.kmRemaining.toLocaleString()} km
                    </span>
                    <span className="font-medium text-gray-800">
                      ₹{service.estimatedCost.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Component Replacements */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Component Replacements
            </h3>
            <div className="space-y-3">
              {estimate.componentReplacements.map((component, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800">{component.component}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(component.priority)}`}>
                      {component.priority} Priority
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{component.description}</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Due in: {component.kmRemaining.toLocaleString()} km
                    </span>
                    <span className="font-medium text-gray-800">
                      ₹{component.estimatedCost.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Factors */}
          {estimate.riskFactors.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-orange-600" />
                Risk Factors
              </h3>
              <div className="bg-orange-50 rounded-lg p-4">
                <ul className="space-y-2">
                  {estimate.riskFactors.map((risk, index) => (
                    <li key={index} className="flex items-start">
                      <AlertCircle className="w-4 h-4 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-orange-800">{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              Recommendations
            </h3>
            <div className="bg-green-50 rounded-lg p-4">
              <ul className="space-y-2">
                {estimate.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-green-800">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <button
            onClick={() => setEstimate(null)}
            className="w-full py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Calculate New Estimate
          </button>
        </div>
      )}
    </div>
  );
};

export default MaintenanceCostEstimator;
