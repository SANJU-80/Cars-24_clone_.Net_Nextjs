import React, { useState } from 'react';
import { getMaintenanceEstimate } from '@/lib/maintenanceapi';
import { Wrench, DollarSign, Calendar, AlertTriangle } from 'lucide-react';

const TestMaintenancePage: React.FC = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Test cases
  const testCases = [
    { 
      title: "2023 Maruti FRONX DELTA PLUS 1.2L AGS", 
      brand: "Maruti", 
      model: "FRONX", 
      year: 2023, 
      mileage: 10048, 
      condition: "Good" 
    },
    { 
      title: "2017 Maruti Swift VXI (O)", 
      brand: "Maruti", 
      model: "Swift", 
      year: 2017, 
      mileage: 60056, 
      condition: "Fair" 
    },
    { 
      title: "2019 BMW 3 Series 320d", 
      brand: "BMW", 
      model: "3 Series", 
      year: 2019, 
      mileage: 85000, 
      condition: "Good" 
    },
    { 
      title: "2018 Hyundai Creta SX", 
      brand: "Hyundai", 
      model: "Creta", 
      year: 2018, 
      mileage: 45000, 
      condition: "Good" 
    },
    { 
      title: "2015 Toyota Innova Crysta", 
      brand: "Toyota", 
      model: "Innova", 
      year: 2015, 
      mileage: 120000, 
      condition: "Fair" 
    }
  ];

  const runTests = async () => {
    setLoading(true);
    const results = [];

    for (const testCase of testCases) {
      try {
        const estimate = await getMaintenanceEstimate({
          carId: `test-${testCase.brand}-${testCase.model}`,
          brand: testCase.brand,
          model: testCase.model,
          year: testCase.year,
          mileage: testCase.mileage,
          condition: testCase.condition
        });
        
        results.push({
          ...testCase,
          estimate,
          success: true
        });
      } catch (error: any) {
        results.push({
          ...testCase,
          error: error.message,
          success: false
        });
      }
    }

    setTestResults(results);
    setLoading(false);
  };

  const getMaintenanceLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center mb-6">
          <Wrench className="w-8 h-8 text-blue-600 mr-3" />
          <h1 className="text-3xl font-bold">Maintenance Estimation Test</h1>
        </div>
        
        <div className="mb-6">
          <button
            onClick={runTests}
            disabled={loading}
            className={`px-6 py-3 rounded-md text-white font-medium ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Running Tests...' : 'Run Maintenance Tests'}
          </button>
        </div>

        {testResults.length > 0 && (
          <div className="space-y-6">
            {testResults.map((result, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md border">
                <h2 className="text-xl font-semibold mb-4">{result.title}</h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <strong>Brand:</strong> {result.brand}
                  </div>
                  <div>
                    <strong>Model:</strong> {result.model}
                  </div>
                  <div>
                    <strong>Year:</strong> {result.year}
                  </div>
                  <div>
                    <strong>Mileage:</strong> {result.mileage.toLocaleString()} km
                  </div>
                  <div>
                    <strong>Age:</strong> {new Date().getFullYear() - result.year} years
                  </div>
                  <div>
                    <strong>Condition:</strong> {result.condition}
                  </div>
                </div>
                
                {result.success ? (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center">
                        <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                        <div>
                          <p className="text-sm text-gray-600">Monthly Cost</p>
                          <p className="text-lg font-bold text-green-600">
                            ₹{result.estimate.monthlyMaintenanceCost.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                        <div>
                          <p className="text-sm text-gray-600">Annual Cost</p>
                          <p className="text-lg font-bold text-blue-600">
                            ₹{result.estimate.annualMaintenanceCost.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
                        <div>
                          <p className="text-sm text-gray-600">Maintenance Level</p>
                          <span className={`px-2 py-1 rounded text-sm font-medium ${getMaintenanceLevelColor(result.estimate.maintenanceLevel)}`}>
                            {result.estimate.maintenanceLevel}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Upcoming Services */}
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-800 mb-2">Upcoming Services</h3>
                      <div className="space-y-2">
                        {result.estimate.upcomingServices.slice(0, 3).map((service: any, idx: number) => (
                          <div key={idx} className="bg-white p-3 rounded border">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{service.serviceType}</span>
                              <span className="text-sm text-gray-600">
                                Due in {service.kmRemaining.toLocaleString()} km
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">₹{service.estimatedCost.toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Risk Factors */}
                    {result.estimate.riskFactors.length > 0 && (
                      <div className="mb-4">
                        <h3 className="font-semibold text-gray-800 mb-2">Risk Factors</h3>
                        <ul className="space-y-1">
                          {result.estimate.riskFactors.map((risk: string, idx: number) => (
                            <li key={idx} className="text-sm text-orange-700 flex items-start">
                              <AlertTriangle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                              {risk}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Recommendations */}
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Recommendations</h3>
                      <ul className="space-y-1">
                        {result.estimate.recommendations.slice(0, 3).map((rec: string, idx: number) => (
                          <li key={idx} className="text-sm text-blue-700">
                            • {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                      <div>
                        <h3 className="font-semibold text-red-800">Test Failed</h3>
                        <p className="text-sm text-red-700">{result.error}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 bg-gray-100 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Test Summary</h2>
          <p className="text-gray-700 mb-2">
            This test page validates the maintenance cost estimation tool with various vehicle scenarios:
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>Different car brands (Maruti, BMW, Hyundai, Toyota)</li>
            <li>Various ages (1-9 years old)</li>
            <li>Different mileage ranges (10K - 120K km)</li>
            <li>Multiple condition levels (Good, Fair)</li>
            <li>Comprehensive cost calculations and service predictions</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TestMaintenancePage;