import React from 'react';
import { estimateMaintenance, parseBrandAndYear } from '@/lib/maintenanceapi';

const TestMaintenancePage: React.FC = () => {
  // Test cases
  const testCases = [
    { title: "2023 Maruti FRONX DELTA PLUS 1.2L AGS", km: "10,048" },
    { title: "2017 Maruti Swift VXI (O)", km: "60,056" },
    { title: "2019 BMW 3 Series 320d", km: "85,000" },
    { title: "2018 Hyundai Creta SX", km: "45,000" },
    { title: "2016 Toyota Innova Crysta VX", km: "120,000" },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Maintenance Estimation Test</h1>
      
      <div className="space-y-6">
        {testCases.map((testCase, index) => {
          const { brand, year } = parseBrandAndYear(testCase.title);
          const maintenance = estimateMaintenance(brand, year, testCase.km);
          
          return (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md border">
              <h2 className="text-xl font-semibold mb-2">{testCase.title}</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <strong>Brand:</strong> {brand}
                </div>
                <div>
                  <strong>Year:</strong> {year}
                </div>
                <div>
                  <strong>KM:</strong> {testCase.km}
                </div>
                <div>
                  <strong>Age:</strong> {new Date().getFullYear() - year} years
                </div>
              </div>
              
              {maintenance ? (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <strong>Monthly Cost:</strong> ₹{maintenance.monthlyCost.toLocaleString()}
                    </div>
                    <div>
                      <strong>Annual Cost:</strong> ₹{maintenance.annualCost.toLocaleString()}
                    </div>
                    <div>
                      <strong>Maintenance Level:</strong> {maintenance.maintenanceLevel}
                    </div>
                    <div>
                      <strong>Multiplier:</strong> {maintenance.multiplier}x
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <strong>Next Major Service:</strong> {maintenance.nextMajorServiceInKm.toLocaleString()} km
                  </div>
                  
                  <div className="mb-3">
                    <strong>Service Alerts:</strong>
                    <ul className="list-disc list-inside ml-4">
                      {maintenance.tireReplacementSoon && <li>Tire replacement expected soon</li>}
                      {maintenance.brakePadReplacementSoon && <li>Brake pad replacement due soon</li>}
                      {maintenance.batteryReplacementSoon && <li>Battery replacement may be needed</li>}
                    </ul>
                  </div>
                  
                  <div>
                    <strong>Insights:</strong>
                    <ul className="list-disc list-inside ml-4">
                      {maintenance.insights.map((insight, idx) => (
                        <li key={idx}>{insight}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 p-4 rounded-lg text-red-600">
                  <strong>Error:</strong> Could not estimate maintenance for this car
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TestMaintenancePage;
