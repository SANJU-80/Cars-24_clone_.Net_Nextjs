import React, { useState, useEffect } from 'react';
import { getMaintenanceEstimate, MaintenanceEstimate } from '@/lib/maintenanceapi';
import { Wrench, DollarSign, Calendar, AlertTriangle, TrendingUp, Car } from 'lucide-react';

interface MaintenanceDashboardProps {
  carId: string;
  carData: {
    title: string;
    brand: string;
    model: string;
    year: number;
    mileage: number;
    condition?: string;
  };
}

const MaintenanceDashboard: React.FC<MaintenanceDashboardProps> = ({ carId, carData }) => {
  const [estimate, setEstimate] = useState<MaintenanceEstimate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEstimate = async () => {
      try {
        setLoading(true);
        const estimateData = await getMaintenanceEstimate({
          carId,
          brand: carData.brand,
          model: carData.model,
          year: carData.year,
          mileage: carData.mileage,
          condition: carData.condition || 'Good'
        });
        setEstimate(estimateData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadEstimate();
  }, [carId, carData]);

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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600" />
          <span className="ml-2 text-gray-600">Loading maintenance data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-red-600">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
          <p>Failed to load maintenance data: {error}</p>
        </div>
      </div>
    );
  }

  if (!estimate) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-600">
          <Car className="w-8 h-8 mx-auto mb-2" />
          <p>No maintenance data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <Wrench className="w-6 h-6 text-blue-600 mr-2" />
        <h2 className="text-2xl font-bold text-gray-800">Maintenance Overview</h2>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-green-600 font-medium">Monthly Cost</p>
              <p className="text-2xl font-bold text-green-700">
                ₹{estimate.monthlyMaintenanceCost.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-blue-600 font-medium">Annual Cost</p>
              <p className="text-2xl font-bold text-blue-700">
                ₹{estimate.annualMaintenanceCost.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-purple-600 font-medium">Maintenance Level</p>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getMaintenanceLevelColor(estimate.maintenanceLevel)}`}>
                {estimate.maintenanceLevel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Urgent Services */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
          Urgent Services (Next 5,000 km)
        </h3>
        <div className="space-y-3">
          {estimate.upcomingServices
            .filter(service => service.kmRemaining <= 5000)
            .map((service, index) => (
              <div key={index} className="bg-orange-50 border-l-4 border-orange-400 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-orange-800">{service.serviceType}</h4>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(service.priority)}`}>
                    {service.priority} Priority
                  </span>
                </div>
                <p className="text-sm text-orange-700 mb-2">{service.description}</p>
                <div className="flex justify-between text-sm">
                  <span className="text-orange-600">
                    Due in: {service.kmRemaining.toLocaleString()} km
                  </span>
                  <span className="font-medium text-orange-800">
                    ₹{service.estimatedCost.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          
          {estimate.upcomingServices.filter(service => service.kmRemaining <= 5000).length === 0 && (
            <div className="bg-green-50 border-l-4 border-green-400 rounded-lg p-4">
              <p className="text-green-800 font-medium">No urgent services required in the next 5,000 km</p>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Component Replacements */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Car className="w-5 h-5 mr-2 text-blue-600" />
          Upcoming Replacements
        </h3>
        <div className="space-y-3">
          {estimate.componentReplacements
            .filter(component => component.kmRemaining <= 20000)
            .map((component, index) => (
              <div key={index} className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-blue-800">{component.component}</h4>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(component.priority)}`}>
                    {component.priority} Priority
                  </span>
                </div>
                <p className="text-sm text-blue-700 mb-2">{component.description}</p>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-600">
                    Due in: {component.kmRemaining.toLocaleString()} km
                  </span>
                  <span className="font-medium text-blue-800">
                    ₹{component.estimatedCost.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Key Insights</h3>
        <div className="space-y-2">
          <div className="flex items-start">
            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
            <p className="text-sm text-gray-700">
              This {estimate.year} {estimate.brand} {estimate.model} with {estimate.mileage.toLocaleString()} km 
              is expected to have <strong>{estimate.maintenanceLevel.toLowerCase()}</strong> maintenance costs.
            </p>
          </div>
          
          {estimate.riskFactors.length > 0 && (
            <div className="flex items-start">
              <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <p className="text-sm text-gray-700">
                <strong>Risk factors:</strong> {estimate.riskFactors.join(', ')}
              </p>
            </div>
          )}
          
          <div className="flex items-start">
            <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
            <p className="text-sm text-gray-700">
              <strong>Budget recommendation:</strong> Set aside ₹{estimate.monthlyMaintenanceCost.toLocaleString()} 
              per month for maintenance costs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceDashboard;
