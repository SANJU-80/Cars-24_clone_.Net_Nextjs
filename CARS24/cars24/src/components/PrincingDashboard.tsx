import React, { useState, useEffect } from 'react';
import { 
  getMarketInsights, 
  getPriceTrends,
  getSupportedRegions,
  getVehicleTypes,
  formatPrice,
  formatPercentage,
  MarketInsights,
  PriceTrendData
} from '@/lib/pricingapi';
import { 
  TrendingUp, 
  TrendingDown, 
  MapPin, 
  BarChart3,
  DollarSign,
  Calendar,
  Eye,
  Target,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface PricingDashboardProps {
  region?: string;
  vehicleType?: string;
  brand?: string;
}

const PricingDashboard: React.FC<PricingDashboardProps> = ({
  region = 'Mumbai',
  vehicleType,
  brand
}) => {
  const [marketInsights, setMarketInsights] = useState<MarketInsights | null>(null);
  const [priceTrends, setPriceTrends] = useState<PriceTrendData[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState(region);
  const [selectedVehicleType, setSelectedVehicleType] = useState(vehicleType || '');

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedRegion) {
      loadMarketData();
    }
  }, [selectedRegion, selectedVehicleType, brand]);

  const loadInitialData = async () => {
    try {
      const [regionsData, vehicleTypesData] = await Promise.all([
        getSupportedRegions(),
        getVehicleTypes()
      ]);
      
      setRegions(regionsData);
      setVehicleTypes(vehicleTypesData);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const loadMarketData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [insights, trends] = await Promise.all([
        getMarketInsights(selectedRegion),
        getPriceTrends(selectedRegion, selectedVehicleType || undefined, brand)
      ]);

      setMarketInsights(insights);
      setPriceTrends(trends);
    } catch (error: any) {
      console.error('Error loading market data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend.toLowerCase()) {
      case 'rising':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'falling':
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      default:
        return <BarChart3 className="w-5 h-5 text-gray-600" />;
    }
  };

  const getMarketConditionColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'slow':
        return 'text-yellow-600 bg-yellow-100';
      case 'stagnant':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getVolatilityColor = (volatility: string) => {
    switch (volatility.toLowerCase()) {
      case 'low':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'high':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading market data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <BarChart3 className="w-6 h-6 text-blue-600 mr-2" />
          <h3 className="text-xl font-bold text-gray-800">Market Dashboard</h3>
        </div>
        
        {/* Filters */}
        <div className="flex items-center space-x-4">
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          >
            {regions.map((region) => (
              <option key={region} value={region} className="text-gray-900 font-medium">{region}</option>
            ))}
          </select>
          
          <select
            value={selectedVehicleType}
            onChange={(e) => setSelectedVehicleType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          >
            <option value="" className="text-gray-500">All Vehicle Types</option>
            {vehicleTypes.map((type) => (
              <option key={type} value={type} className="text-gray-900 font-medium">{type}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {marketInsights && (
        <>
          {/* Market Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                {getTrendIcon(marketInsights.overallTrend)}
                <span className="ml-2 text-sm font-medium text-gray-700">Overall Trend</span>
              </div>
              <div className="text-lg font-bold text-blue-600">
                {marketInsights.overallTrend}
              </div>
              <div className="text-sm text-gray-600">
                {formatPercentage(marketInsights.trendPercentage)}
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="ml-2 text-sm font-medium text-gray-700">Market Condition</span>
              </div>
              <div className="text-lg font-bold text-green-600">
                {marketInsights.marketConditions}
              </div>
              <div className="text-sm text-gray-600">
                Avg listing time: {marketInsights.averageListingTime} days
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Target className="w-5 h-5 text-yellow-600" />
                <span className="ml-2 text-sm font-medium text-gray-700">Price Volatility</span>
              </div>
              <div className={`text-lg font-bold px-2 py-1 rounded ${getVolatilityColor(marketInsights.priceVolatility)}`}>
                {marketInsights.priceVolatility}
              </div>
              <div className="text-sm text-gray-600">
                Market stability
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Eye className="w-5 h-5 text-purple-600" />
                <span className="ml-2 text-sm font-medium text-gray-700">Region</span>
              </div>
              <div className="text-lg font-bold text-purple-600">
                {marketInsights.region}
              </div>
              <div className="text-sm text-gray-600">
                Market coverage
              </div>
            </div>
          </div>

          {/* Vehicle Type Performance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Hot Vehicle Types
              </h4>
              <div className="space-y-2">
                {marketInsights.hotVehicleTypes.map((type, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white rounded">
                    <span className="font-medium text-gray-800">{type}</span>
                    <span className="text-sm text-green-600 font-semibold">High Demand</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-red-50 rounded-lg">
              <h4 className="text-lg font-semibold text-red-800 mb-3 flex items-center">
                <TrendingDown className="w-5 h-5 mr-2" />
                Cold Vehicle Types
              </h4>
              <div className="space-y-2">
                {marketInsights.coldVehicleTypes.map((type, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white rounded">
                    <span className="font-medium text-gray-800">{type}</span>
                    <span className="text-sm text-red-600 font-semibold">Low Demand</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Market Factors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {marketInsights.seasonalFactors.length > 0 && (
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Seasonal Factors
                </h4>
                <ul className="space-y-2">
                  {marketInsights.seasonalFactors.map((factor, index) => (
                    <li key={index} className="text-sm text-yellow-700 flex items-start">
                      <span className="w-2 h-2 bg-yellow-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {marketInsights.economicFactors.length > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Economic Factors
                </h4>
                <ul className="space-y-2">
                  {marketInsights.economicFactors.map((factor, index) => (
                    <li key={index} className="text-sm text-blue-700 flex items-start">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Price Trends Chart */}
          {priceTrends.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Price Trends</h4>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-3">
                  Price trend over last {priceTrends.length} days in {selectedRegion}
                  {selectedVehicleType && ` for ${selectedVehicleType}`}
                </div>
                
                {/* Simple price trend visualization */}
                <div className="h-48 bg-white rounded border p-4">
                  <div className="flex items-end justify-between h-full">
                    {priceTrends.slice(-7).map((trend, index) => {
                      const maxPrice = Math.max(...priceTrends.slice(-7).map(t => t.averagePrice));
                      const height = (trend.averagePrice / maxPrice) * 100;
                      
                      return (
                        <div key={index} className="flex flex-col items-center">
                          <div
                            className="bg-blue-500 rounded-t w-8 mb-2"
                            style={{ height: `${height}%` }}
                          ></div>
                          <div className="text-xs text-gray-600">
                            {formatPrice(trend.averagePrice)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(trend.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="mt-3 text-xs text-gray-500">
                  Latest average: {formatPrice(priceTrends[priceTrends.length - 1]?.averagePrice || 0)}
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                <span>Market data for {selectedRegion}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                <span>Updated: {new Date(marketInsights.generatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PricingDashboard;

