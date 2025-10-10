import React, { useState } from 'react';
import PricingDashboard from '@/components/PricingDashboard';
import { 
  BarChart3, 
  TrendingUp, 
  MapPin, 
  Calendar,
  DollarSign,
  Target
} from 'lucide-react';

const PricingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calculator'>('dashboard');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <BarChart3 className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Market Pricing Intelligence</h1>
              <p className="text-gray-600 mt-1">
                Real-time market analysis and pricing recommendations based on regional and seasonal factors
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <div className="flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                Market Dashboard
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'calculator'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <div className="flex items-center">
                <DollarSign className="w-4 h-4 mr-2" />
                Price Calculator
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'dashboard' ? (
          <div className="space-y-6">
            {/* Market Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-800">Market Trend</h3>
                    <p className="text-sm text-gray-600">Real-time pricing trends</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-full">
                    <MapPin className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-800">Regional Analysis</h3>
                    <p className="text-sm text-gray-600">Location-based pricing</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <Calendar className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-800">Seasonal Impact</h3>
                    <p className="text-sm text-gray-600">Weather & festival effects</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Target className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-800">Price Accuracy</h3>
                    <p className="text-sm text-gray-600">AI-powered recommendations</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Market Dashboard */}
            <PricingDashboard />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center py-12">
              <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Price Calculator</h3>
              <p className="text-gray-600 mb-6">
                Get instant pricing recommendations for your vehicle
              </p>
              <div className="space-y-4 max-w-md mx-auto">
                <div className="text-sm text-gray-500">
                  The price calculator is integrated into individual car listing pages.
                </div>
                <div className="text-sm text-gray-500">
                  Visit any car detail page to see the pricing engine in action.
                </div>
                <button
                  onClick={() => window.location.href = '/buy-car'}
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Browse Cars
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Dynamic Pricing</h3>
            <p className="text-gray-600">
              Prices adjust automatically based on market conditions, season, and regional factors
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Regional Intelligence</h3>
            <p className="text-gray-600">
              Location-based pricing considers local economic conditions and vehicle preferences
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Seasonal Analysis</h3>
            <p className="text-gray-600">
              Monsoon boosts SUV demand, while fuel price spikes affect small car values
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">How Our Pricing Engine Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                1
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Market Analysis</h4>
              <p className="text-sm text-gray-600">
                Analyze current market conditions, supply/demand, and economic factors
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                2
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Regional Factors</h4>
              <p className="text-sm text-gray-600">
                Consider location-specific factors like fuel prices, traffic, and preferences
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                3
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Seasonal Impact</h4>
              <p className="text-sm text-gray-600">
                Apply seasonal multipliers for weather, festivals, and vacation periods
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                4
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Smart Pricing</h4>
              <p className="text-sm text-gray-600">
                Generate recommended prices with confidence scores and market insights
              </p>
            </div>
          </div>
        </div>

        {/* Examples */}
        <div className="mt-12 bg-gray-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Real-World Examples</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Monsoon Season in Mumbai</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>SUV Demand:</span>
                  <span className="text-green-600 font-semibold">+15%</span>
                </div>
                <div className="flex justify-between">
                  <span>Hatchback Demand:</span>
                  <span className="text-red-600 font-semibold">-8%</span>
                </div>
                <div className="flex justify-between">
                  <span>Price Impact:</span>
                  <span className="text-blue-600 font-semibold">Regional + Weather</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Heavy rains increase demand for high-ground-clearance vehicles
              </p>
            </div>

            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Fuel Price Spike in Delhi</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Electric Vehicle:</span>
                  <span className="text-green-600 font-semibold">+12%</span>
                </div>
                <div className="flex justify-between">
                  <span>Diesel SUV:</span>
                  <span className="text-red-600 font-semibold">-5%</span>
                </div>
                <div className="flex justify-between">
                  <span>Price Impact:</span>
                  <span className="text-blue-600 font-semibold">Economic + Fuel</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Rising fuel costs shift demand toward fuel-efficient alternatives
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;

