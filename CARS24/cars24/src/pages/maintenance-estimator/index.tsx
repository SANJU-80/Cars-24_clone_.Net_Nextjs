import React from 'react';
import MaintenanceCostEstimator from '@/components/MaintenanceCostEstimator';
import { Wrench, DollarSign, Calendar, AlertTriangle } from 'lucide-react';

const MaintenanceEstimatorPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Wrench className="w-12 h-12 text-blue-600 mr-3" />
              <h1 className="text-4xl font-bold text-gray-800">Maintenance Cost Estimator</h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get accurate maintenance cost estimates for any vehicle based on age, mileage, brand, and condition. 
              Plan your budget with confidence.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Cost Estimation</h3>
              <p className="text-gray-600 text-sm">
                Get monthly and annual maintenance cost estimates based on real-world data
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Service Predictions</h3>
              <p className="text-gray-600 text-sm">
                Know when your next service is due and what it will cost
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <AlertTriangle className="w-8 h-8 text-orange-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Risk Assessment</h3>
              <p className="text-gray-600 text-sm">
                Understand potential risks and get personalized recommendations
              </p>
            </div>
          </div>

          {/* Main Estimator Component */}
          <MaintenanceCostEstimator />

          {/* How It Works */}
          <div className="mt-12 bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Enter Details</h3>
                <p className="text-sm text-gray-600">
                  Provide vehicle brand, model, year, mileage, and condition
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">AI Analysis</h3>
                <p className="text-sm text-gray-600">
                  Our algorithm analyzes brand reliability and maintenance patterns
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold">3</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Get Estimates</h3>
                <p className="text-sm text-gray-600">
                  Receive detailed cost estimates and service predictions
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold">4</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Plan Budget</h3>
                <p className="text-sm text-gray-600">
                  Use insights to plan your maintenance budget effectively
                </p>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Why Use Our Estimator?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">For Buyers</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Make informed purchasing decisions
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Budget for future maintenance costs
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Avoid unexpected repair expenses
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">For Sellers</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Provide transparency to potential buyers
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Justify your asking price
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Build trust with detailed information
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceEstimatorPage;
