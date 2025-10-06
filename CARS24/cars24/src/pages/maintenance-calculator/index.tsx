import React from 'react';
import MaintenanceCostEstimator from '@/components/MaintenanceCostEstimator';
import Header from '@/components/Header';
import Fotter from '@/components/Fotter';

const MaintenanceCalculatorPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-8">
        <div className="container mx-auto px-4">
          <MaintenanceCostEstimator />
        </div>
      </main>
      <Fotter />
    </div>
  );
};

export default MaintenanceCalculatorPage;
