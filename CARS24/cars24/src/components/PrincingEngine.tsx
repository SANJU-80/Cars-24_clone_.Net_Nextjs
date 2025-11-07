import React, { useState, useEffect } from 'react';
import { 
  calculateRecommendedPrice, 
  getPriceTrends, 
  getMarketInsights,
  formatPrice, 
  formatPercentage,
  getPriceRecommendationColor,
  getAdjustmentImpactColor,
  detectUserRegion,
  PricingRequest,
  PricingResponse,
  PriceTrendData,
  MarketInsights
} from '@/lib/pricingapi';
import { 
  TrendingUp, 
  TrendingDown, 
  MapPin, 
  Calendar, 
  DollarSign,
  Info,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';

interface PricingEngineProps {
  carId: string;
  basePrice: number;
  brand: string;
  model: string;
  vehicleType: string;
  year: number;
  mileage: number;
  condition: string;
  fuelType: string;
  transmission: string;
  onPriceCalculated?: (pricing: PricingResponse) => void;
}

const PricingEngine: React.FC<PricingEngineProps> = ({
  carId,
  basePrice,
  brand,
  model,
  vehicleType,
  year,
  mileage,
  condition,
  fuelType,
  transmission,
  onPriceCalculated
}) => {
  const [pricing, setPricing] = useState<PricingResponse | null>(null);
  const [priceTrends, setPriceTrends] = useState<PriceTrendData[]>([]);
  const [marketInsights, setMarketInsights] = useState<MarketInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [region, setRegion] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeRegion();
  }, []);

  useEffect(() => {
    if (region && basePrice > 0) {
      calculatePricing();
    }
  }, [region, basePrice, carId, brand, model, vehicleType, year, mileage, condition, fuelType, transmission]);

  const initializeRegion = async () => {
    try {
      const detectedRegion = await detectUserRegion();
      setRegion(detectedRegion);
    } catch (error) {
      console.error('Error detecting region:', error);
      setRegion('Mumbai'); // Default fallback
    }
  };

  const calculatePricing = async () => {
    if (!region || basePrice <= 0) return;

    setLoading(true);
    setError(null);

    try {
      const request: PricingRequest = {
        carId,
        basePrice,
        region,
        brand,
        model,
        vehicleType,
        year,
        mileage,
        condition,
        fuelType,
        transmission,
        requestDate: new Date().toISOString()
      };

      const [pricingResponse, trends, insights] = await Promise.all([
        calculateRecommendedPrice(request),
        getPriceTrends(region, vehicleType, brand),
        getMarketInsights(region)
      ]);

      setPricing(pricingResponse);
      setPriceTrends(trends);
      setMarketInsights(insights);

      if (onPriceCalculated) {
        onPriceCalculated(pricingResponse);
      }
    } catch (error: any) {
      console.error('Error calculating pricing:', error);
      setError(error.message);
      toast.error('Failed to calculate pricing');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction.toLowerCase()) {
      case 'rising':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'falling':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <BarChart3 className="w-4 h-4 text-gray-600" />;
    }
  };

  const getAdjustmentIcon = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'positive':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'negative':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Calculating market price...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center text-red-600">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!pricing) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-600">
          <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>Pricing engine not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <DollarSign className="w-6 h-6 text-blue-600 mr-2" />
          <h3 className="text-xl font-bold text-gray-800">Market Price Analysis</h3>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="w-4 h-4 mr-1" />
          <span>{pricing.region}</span>
          <Clock className="w-4 h-4 ml-3 mr-1" />
          <span>{new Date(pricing.calculatedAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Price Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Recommended Price</div>
          <div className="text-2xl font-bold text-blue-600">
            {formatPrice(pricing.recommendedPrice)}
          </div>
          <div className={`text-sm ${getPriceRecommendationColor(pricing.priceRecommendation)}`}>
            {pricing.priceRecommendation}
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Market Price</div>
          <div className="text-2xl font-bold text-green-600">
            {formatPrice(pricing.marketPrice)}
          </div>
          <div className="text-sm text-gray-600">
            Based on {pricing.confidenceScore}% confidence
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Fair Price Range</div>
          <div className="text-lg font-semibold text-gray-800">
            {formatPrice(pricing.minPrice)} - {formatPrice(pricing.maxPrice)}
          </div>
          <div className="text-sm text-gray-600">
            Fair price: {formatPrice(pricing.fairPrice)}
          </div>
        </div>
      </div>

      {/* Price Trend */}
      {pricing.trend && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center mb-2">
            {getTrendIcon(pricing.trend.direction)}
            <span className="ml-2 font-semibold text-gray-800">
              Price Trend: {pricing.trend.direction.charAt(0).toUpperCase() + pricing.trend.direction.slice(1)}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            {formatPercentage(pricing.trend.changePercentage)} change over {pricing.trend.trendDuration} days
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {pricing.trend.trendReason}
          </div>
        </div>
      )}

      {/* Price Adjustments */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Price Adjustments</h4>
        <div className="space-y-2">
          {pricing.adjustments.map((adjustment, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                {getAdjustmentIcon(adjustment.impact)}
                <div className="ml-3">
                  <div className="font-medium text-gray-800">{adjustment.description}</div>
                  <div className="text-sm text-gray-600">{adjustment.factor.replace('_', ' ')}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`font-semibold ${getAdjustmentImpactColor(adjustment.impact)}`}>
                  {formatPercentage(adjustment.percentage)}
                </div>
                <div className="text-sm text-gray-600">
                  {formatPrice(adjustment.amount)}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-800">Total Adjustment</span>
            <div className="text-right">
              <div className={`font-bold text-lg ${getAdjustmentImpactColor(pricing.totalAdjustmentAmount >= 0 ? 'positive' : 'negative')}`}>
                {formatPercentage(pricing.totalAdjustmentPercentage)}
              </div>
              <div className="text-sm text-gray-600">
                {formatPrice(pricing.totalAdjustmentAmount)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Market Insights */}
      {marketInsights && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">Market Insights</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center mb-2">
                <TrendingUp className="w-4 h-4 text-green-600 mr-2" />
                <span className="font-medium text-green-800">Hot Vehicle Types</span>
              </div>
              <div className="text-sm text-green-700">
                {marketInsights.hotVehicleTypes.join(', ')}
              </div>
            </div>
            
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-center mb-2">
                <TrendingDown className="w-4 h-4 text-red-600 mr-2" />
                <span className="font-medium text-red-800">Cold Vehicle Types</span>
              </div>
              <div className="text-sm text-red-700">
                {marketInsights.coldVehicleTypes.join(', ')}
              </div>
            </div>
          </div>
          
          {marketInsights.seasonalFactors.length > 0 && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center mb-2">
                <Calendar className="w-4 h-4 text-yellow-600 mr-2" />
                <span className="font-medium text-yellow-800">Seasonal Factors</span>
              </div>
              <ul className="text-sm text-yellow-700 space-y-1">
                {marketInsights.seasonalFactors.map((factor, index) => (
                  <li key={index}>• {factor}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Market Insights from Pricing */}
      {pricing.marketInsights.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">Key Insights</h4>
          <div className="space-y-2">
            {pricing.marketInsights.map((insight, index) => (
              <div key={index} className="flex items-start p-3 bg-blue-50 rounded-lg">
                <Info className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-blue-800">{insight}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Price History Chart Placeholder */}
      {priceTrends.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">Price Trends</h4>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-2">
              Price trend over last {priceTrends.length} days
            </div>
            <div className="h-32 bg-white rounded border flex items-center justify-center">
              <span className="text-gray-500">Price chart visualization would go here</span>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center">
            <Target className="w-4 h-4 mr-1" />
            <span>Confidence: {pricing.confidenceScore}%</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span>Expires: {new Date(pricing.expiresAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingEngine;

