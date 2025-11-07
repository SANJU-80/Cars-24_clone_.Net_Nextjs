using cars24Api.Models;
using MongoDB.Driver;

namespace cars24Api.Services;

public class PricingService
{
    private readonly IMongoCollection<PricingEngine> _pricingCollection;
    private readonly IMongoCollection<RegionalPricingData> _regionalCollection;
    private readonly IMongoCollection<SeasonalPricingData> _seasonalCollection;
    private readonly IMongoCollection<MarketAnalysis> _marketAnalysisCollection;
    private readonly IMongoCollection<PriceAlert> _priceAlertCollection;
    private readonly IMongoCollection<Car> _carCollection;

    public PricingService(IMongoDatabase database)
    {
        _pricingCollection = database.GetCollection<PricingEngine>("PricingEngine");
        _regionalCollection = database.GetCollection<RegionalPricingData>("RegionalPricingData");
        _seasonalCollection = database.GetCollection<SeasonalPricingData>("SeasonalPricingData");
        _marketAnalysisCollection = database.GetCollection<MarketAnalysis>("MarketAnalysis");
        _priceAlertCollection = database.GetCollection<PriceAlert>("PriceAlerts");
        _carCollection = database.GetCollection<Car>("Cars");

        _ = Task.Run(async () => await InitializeDefaultDataAsync());
    }

    public async Task<PricingResponse> CalculateRecommendedPriceAsync(PricingRequest request)
    {
        try
        {
            var basePrice = request.BasePrice;
            var region = request.Region;
            var requestDate = request.RequestDate ?? DateTime.UtcNow;

            var season = GetCurrentSeason(requestDate);
            var regionalData = await GetRegionalPricingDataAsync(region);
            var seasonalData = await GetSeasonalPricingDataAsync(season, region);

            var marketFactors = new MarketFactors();
            var adjustments = new List<PriceAdjustment>();

            var regionalAdjustment = CalculateRegionalAdjustment(regionalData, request);
            adjustments.Add(regionalAdjustment);

            var seasonalAdjustment = CalculateSeasonalAdjustment(seasonalData, request);
            adjustments.Add(seasonalAdjustment);

            var vehicleTypeAdjustment = CalculateVehicleTypeAdjustment(request, regionalData, seasonalData);
            adjustments.Add(vehicleTypeAdjustment);

            var economicAdjustment = CalculateEconomicAdjustment(request, region);
            adjustments.Add(economicAdjustment);

            var fuelAdjustment = CalculateFuelPriceAdjustment(request, region);
            adjustments.Add(fuelAdjustment);

            var mileageAdjustment = CalculateMileageAdjustment(request);
            adjustments.Add(mileageAdjustment);

            var ageAdjustment = CalculateAgeAdjustment(request);
            adjustments.Add(ageAdjustment);

            var conditionAdjustment = CalculateConditionAdjustment(request);
            adjustments.Add(conditionAdjustment);

            var brandAdjustment = CalculateBrandAdjustment(request, region);
            adjustments.Add(brandAdjustment);

            var supplyDemandAdjustment = await CalculateSupplyDemandAdjustmentAsync(request);
            adjustments.Add(supplyDemandAdjustment);

            var totalAdjustmentPercentage = CalculateTotalAdjustmentPercentage(adjustments);
            var totalAdjustmentAmount = basePrice * (totalAdjustmentPercentage / 100);

            var recommendedPrice = basePrice + totalAdjustmentAmount;
            var marketPrice = await CalculateMarketPriceAsync(request);
            var fairPrice = (recommendedPrice + marketPrice) / 2;

            var priceRange = CalculatePriceRange(recommendedPrice, adjustments);
            var trend = await CalculatePriceTrendAsync(request);
            var insights = GenerateMarketInsights(adjustments, trend, region, season);
            var confidenceScore = CalculateConfidenceScore(adjustments, marketFactors);

            var response = new PricingResponse
            {
                CarId = request.CarId,
                BasePrice = basePrice,
                RecommendedPrice = Math.Round(recommendedPrice, 0),
                MarketPrice = Math.Round(marketPrice, 0),
                FairPrice = Math.Round(fairPrice, 0),
                MinPrice = Math.Round(priceRange.MinPrice, 0),
                MaxPrice = Math.Round(priceRange.MaxPrice, 0),
                Region = region,
                Season = season,
                TotalAdjustmentPercentage = Math.Round(totalAdjustmentPercentage, 2),
                TotalAdjustmentAmount = Math.Round(totalAdjustmentAmount, 0),
                Adjustments = adjustments,
                MarketFactors = marketFactors,
                Trend = trend,
                ConfidenceScore = confidenceScore,
                PriceRecommendation = GetPriceRecommendation(recommendedPrice, marketPrice),
                MarketInsights = insights,
                CalculatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddDays(7)
            };

            await StorePricingCalculationAsync(request, response);

            return response;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error calculating recommended price: {ex.Message}");
            throw;
        }
    }

    public async Task<List<PricingResponse>> GetPriceHistoryAsync(string carId, int days = 30)
    {
        var startDate = DateTime.UtcNow.AddDays(-days);

        var pricingHistory = await _pricingCollection
            .Find(p => p.CarId == carId && p.CalculatedAt >= startDate)
            .Sort(Builders<PricingEngine>.Sort.Descending(p => p.CalculatedAt))
            .ToListAsync();

        return pricingHistory.Select(p => new PricingResponse
        {
            CarId = p.CarId,
            BasePrice = p.BasePrice,
            RecommendedPrice = p.RecommendedPrice,
            MarketPrice = p.MarketPrice,
            FairPrice = p.FairPrice,
            MinPrice = p.MinPrice,
            MaxPrice = p.MaxPrice,
            Region = p.Region,
            Season = p.Season,
            TotalAdjustmentPercentage = p.TotalAdjustmentPercentage,
            TotalAdjustmentAmount = p.TotalAdjustmentAmount,
            Adjustments = p.Adjustments,
            MarketFactors = p.MarketFactors,
            Trend = p.Trend,
            ConfidenceScore = p.ConfidenceScore,
            CalculatedAt = p.CalculatedAt
        }).ToList();
    }

    public async Task<MarketAnalysis> GetMarketAnalysisAsync(string region, string vehicleType, string brand, string model)
    {
        var analysis = await _marketAnalysisCollection
            .Find(a => a.Region == region && a.VehicleType == vehicleType &&
                      a.Brand == brand && a.Model == model)
            .FirstOrDefaultAsync();

        if (analysis == null)
        {
            analysis = await GenerateMarketAnalysisAsync(region, vehicleType, brand, model);
        }

        return analysis;
    }

    public async Task<List<PriceAlert>> GetPriceAlertsAsync(string userId)
    {
        return await _priceAlertCollection
            .Find(a => a.UserId == userId && a.IsActive)
            .Sort(Builders<PriceAlert>.Sort.Descending(a => a.CreatedAt))
            .ToListAsync();
    }

    public async Task<PriceAlert> CreatePriceAlertAsync(string userId, string carId, string alertType, decimal targetPrice)
    {
        var alert = new PriceAlert
        {
            UserId = userId,
            CarId = carId,
            AlertType = alertType,
            TargetPrice = targetPrice,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _priceAlertCollection.InsertOneAsync(alert);
        return alert;
    }

    private string GetCurrentSeason(DateTime date)
    {
        var month = date.Month;
        return month switch
        {
            12 or 1 or 2 => "Winter",
            3 or 4 or 5 => "Spring",
            6 or 7 or 8 => "Summer",
            9 or 10 or 11 => "Monsoon",
            _ => "Spring"
        };
    }

    private async Task<RegionalPricingData> GetRegionalPricingDataAsync(string region)
    {
        var data = await _regionalCollection
            .Find(r => r.Region == region && r.IsActive)
            .FirstOrDefaultAsync();

        if (data == null)
        {
            data = new RegionalPricingData
            {
                Region = region,
                State = "Unknown",
                City = region
            };
        }

        return data;
    }

    private async Task<SeasonalPricingData> GetSeasonalPricingDataAsync(string season, string region)
    {
        var data = await _seasonalCollection
            .Find(s => s.Season == season && s.IsActive)
            .FirstOrDefaultAsync();

        if (data == null)
        {
            data = new SeasonalPricingData
            {
                Season = season,
                Month = DateTime.UtcNow.Month
            };
        }

        return data;
    }

    private PriceAdjustment CalculateRegionalAdjustment(RegionalPricingData regionalData, PricingRequest request)
    {
        var multiplier = regionalData.EconomicMultiplier;
        var percentage = (multiplier - 1) * 100;

        return new PriceAdjustment
        {
            Factor = "region",
            Description = $"Regional economic factors in {regionalData.Region}",
            Percentage = Math.Round(percentage, 2),
            Amount = request.BasePrice * (percentage / 100),
            Impact = percentage >= 0 ? "positive" : "negative",
            Weight = 1.2m
        };
    }

    private PriceAdjustment CalculateSeasonalAdjustment(SeasonalPricingData seasonalData, PricingRequest request)
    {
        var vehicleType = request.VehicleType;
        var multiplier = seasonalData.VehicleTypeMultipliers.GetValueOrDefault(vehicleType, 1.0m);
        var percentage = (multiplier - 1) * 100;

        var seasonDescription = seasonalData.Season switch
        {
            "Summer" => "High demand for AC-equipped vehicles",
            "Monsoon" => "Increased demand for SUVs and off-road vehicles",
            "Winter" => "Moderate demand across vehicle types",
            "Spring" => "Peak buying season with festival discounts",
            _ => "Standard seasonal demand"
        };

        return new PriceAdjustment
        {
            Factor = "season",
            Description = $"{seasonDescription} during {seasonalData.Season}",
            Percentage = Math.Round(percentage, 2),
            Amount = request.BasePrice * (percentage / 100),
            Impact = percentage >= 0 ? "positive" : "negative",
            Weight = 1.1m
        };
    }

    private PriceAdjustment CalculateVehicleTypeAdjustment(PricingRequest request, RegionalPricingData regionalData, SeasonalPricingData seasonalData)
    {
        var vehicleType = request.VehicleType;
        var regionalPreference = regionalData.VehicleTypePreferences.GetValueOrDefault(vehicleType, 1.0m);
        var seasonalPreference = seasonalData.VehicleTypeMultipliers.GetValueOrDefault(vehicleType, 1.0m);

        var combinedMultiplier = (regionalPreference + seasonalPreference) / 2;
        var percentage = (combinedMultiplier - 1) * 100;

        var description = vehicleType switch
        {
            "SUV" => "High demand for SUVs in current market conditions",
            "Hatchback" => "Fuel-efficient hatchbacks preferred in current market",
            "Sedan" => "Steady demand for sedans",
            "Electric" => "Growing interest in electric vehicles",
            _ => "Standard demand for vehicle type"
        };

        return new PriceAdjustment
        {
            Factor = "vehicle_type",
            Description = description,
            Percentage = Math.Round(percentage, 2),
            Amount = request.BasePrice * (percentage / 100),
            Impact = percentage >= 0 ? "positive" : "negative",
            Weight = 1.0m
        };
    }

    private PriceAdjustment CalculateEconomicAdjustment(PricingRequest request, string region)
    {
        var economicMultiplier = region.ToLower() switch
        {
            "mumbai" or "delhi" => 1.05m,
            "bangalore" or "hyderabad" => 1.03m,
            "chennai" or "kolkata" => 1.0m,
            _ => 0.98m
        };

        var percentage = (economicMultiplier - 1) * 100;

        return new PriceAdjustment
        {
            Factor = "economic",
            Description = $"Economic conditions in {region}",
            Percentage = Math.Round(percentage, 2),
            Amount = request.BasePrice * (percentage / 100),
            Impact = percentage >= 0 ? "positive" : "negative",
            Weight = 0.8m
        };
    }

    private PriceAdjustment CalculateFuelPriceAdjustment(PricingRequest request, string region)
    {
        var fuelImpact = (request.VehicleType, request.FuelType) switch
        {
            ("Hatchback", "Petrol") => -0.03m,
            ("SUV", "Diesel") => -0.02m,
            ("Electric", "Electric") => 0.05m,
            ("Sedan", "Petrol") => -0.01m,
            _ => 0.0m
        };

        var percentage = fuelImpact * 100;

        return new PriceAdjustment
        {
            Factor = "fuel_price",
            Description = $"Fuel price impact on {request.FuelType} {request.VehicleType}",
            Percentage = Math.Round(percentage, 2),
            Amount = request.BasePrice * (percentage / 100),
            Impact = percentage >= 0 ? "positive" : "negative",
            Weight = 0.9m
        };
    }

    private PriceAdjustment CalculateMileageAdjustment(PricingRequest request)
    {
        var mileage = request.Mileage;
        var year = request.Year;
        var age = DateTime.UtcNow.Year - year;
        var averageMileage = age * 15000;

        var mileageRatio = (decimal)mileage / averageMileage;
        var percentage = mileageRatio > 1.2m ? -5.0m :
                        mileageRatio < 0.8m ? 3.0m :
                        0.0m;

        return new PriceAdjustment
        {
            Factor = "mileage",
            Description = mileageRatio > 1.2m ? "High mileage reduces value" :
                         mileageRatio < 0.8m ? "Low mileage increases value" :
                         "Normal mileage for age",
            Percentage = Math.Round(percentage, 2),
            Amount = request.BasePrice * (percentage / 100),
            Impact = percentage >= 0 ? "positive" : "negative",
            Weight = 1.3m
        };
    }

    private PriceAdjustment CalculateAgeAdjustment(PricingRequest request)
    {
        var age = DateTime.UtcNow.Year - request.Year;
        var percentage = age switch
        {
            <= 1 => 0.0m,
            <= 3 => -2.0m,
            <= 5 => -5.0m,
            <= 8 => -8.0m,
            _ => -12.0m
        };

        return new PriceAdjustment
        {
            Factor = "age",
            Description = $"Vehicle age ({age} years) depreciation",
            Percentage = Math.Round(percentage, 2),
            Amount = request.BasePrice * (percentage / 100),
            Impact = "negative",
            Weight = 1.4m
        };
    }

    private PriceAdjustment CalculateConditionAdjustment(PricingRequest request)
    {
        var percentage = request.Condition.ToLower() switch
        {
            "excellent" => 5.0m,
            "good" => 0.0m,
            "fair" => -8.0m,
            "poor" => -15.0m,
            _ => 0.0m
        };

        return new PriceAdjustment
        {
            Factor = "condition",
            Description = $"Vehicle condition ({request.Condition}) impact",
            Percentage = Math.Round(percentage, 2),
            Amount = request.BasePrice * (percentage / 100),
            Impact = percentage >= 0 ? "positive" : "negative",
            Weight = 1.5m
        };
    }

    private PriceAdjustment CalculateBrandAdjustment(PricingRequest request, string region)
    {
        var brandMultiplier = (request.Brand.ToLower(), region.ToLower()) switch
        {
            ("maruti", _) => 1.02m,
            ("hyundai", "mumbai" or "delhi") => 1.01m,
            ("toyota", "bangalore") => 1.03m,
            ("bmw" or "mercedes", "mumbai" or "delhi") => 1.05m,
            _ => 1.0m
        };

        var percentage = (brandMultiplier - 1) * 100;

        return new PriceAdjustment
        {
            Factor = "brand",
            Description = $"{request.Brand} brand popularity in {region}",
            Percentage = Math.Round(percentage, 2),
            Amount = request.BasePrice * (percentage / 100),
            Impact = percentage >= 0 ? "positive" : "negative",
            Weight = 0.7m
        };
    }

    private async Task<PriceAdjustment> CalculateSupplyDemandAdjustmentAsync(PricingRequest request)
    {
        var supplyDemandRatio = 0.95m;
        var percentage = (supplyDemandRatio - 1) * 100;

        return new PriceAdjustment
        {
            Factor = "supply_demand",
            Description = "Current market supply and demand conditions",
            Percentage = Math.Round(percentage, 2),
            Amount = request.BasePrice * (percentage / 100),
            Impact = percentage >= 0 ? "positive" : "negative",
            Weight = 1.1m
        };
    }

    private decimal CalculateTotalAdjustmentPercentage(List<PriceAdjustment> adjustments)
    {
        var weightedSum = adjustments.Sum(a => a.Percentage * a.Weight);
        var totalWeight = adjustments.Sum(a => a.Weight);

        return totalWeight > 0 ? weightedSum / totalWeight : 0;
    }

    private async Task<decimal> CalculateMarketPriceAsync(PricingRequest request)
    {
        var analysis = await GetMarketAnalysisAsync(request.Region, request.VehicleType, request.Brand, request.Model);
        return analysis?.AveragePrice ?? request.BasePrice;
    }

    private (decimal MinPrice, decimal MaxPrice) CalculatePriceRange(decimal recommendedPrice, List<PriceAdjustment> adjustments)
    {
        var volatility = Math.Abs(adjustments.Sum(a => Math.Abs(a.Percentage))) / 10;
        var minPrice = recommendedPrice * (1 - volatility / 100);
        var maxPrice = recommendedPrice * (1 + volatility / 100);

        return (minPrice, maxPrice);
    }

    private async Task<PriceTrend> CalculatePriceTrendAsync(PricingRequest request)
    {
        var priceHistory = await GetPriceHistoryAsync(request.CarId, 30);

        if (priceHistory.Count < 2)
        {
            return new PriceTrend
            {
                Direction = "stable",
                ChangePercentage = 0,
                ChangeAmount = 0,
                TrendDuration = 0,
                TrendReason = "Insufficient data for trend analysis"
            };
        }

        var latestPrice = priceHistory.First().RecommendedPrice;
        var oldestPrice = priceHistory.Last().RecommendedPrice;

        var changeAmount = latestPrice - oldestPrice;
        var changePercentage = (changeAmount / oldestPrice) * 100;

        var direction = changePercentage > 2 ? "rising" :
                       changePercentage < -2 ? "falling" : "stable";

        return new PriceTrend
        {
            Direction = direction,
            ChangePercentage = Math.Round(changePercentage, 2),
            ChangeAmount = Math.Round(changeAmount, 0),
            TrendDuration = priceHistory.Count,
            TrendReason = direction switch
            {
                "rising" => "Prices trending upward due to market conditions",
                "falling" => "Prices trending downward due to market conditions",
                _ => "Prices remaining stable"
            },
            TrendStartDate = priceHistory.Last().CalculatedAt,
            LastUpdated = DateTime.UtcNow
        };
    }

    private List<string> GenerateMarketInsights(List<PriceAdjustment> adjustments, PriceTrend trend, string region, string season)
    {
        var insights = new List<string>();

        if (trend.Direction == "rising")
            insights.Add($"Prices are trending upward by {trend.ChangePercentage}% in the last {trend.TrendDuration} days");
        else if (trend.Direction == "falling")
            insights.Add($"Prices are trending downward by {Math.Abs(trend.ChangePercentage)}% in the last {trend.TrendDuration} days");

        var seasonalAdjustment = adjustments.FirstOrDefault(a => a.Factor == "season");
        if (seasonalAdjustment != null && Math.Abs(seasonalAdjustment.Percentage) > 1)
            insights.Add($"Seasonal demand in {season} is affecting prices by {seasonalAdjustment.Percentage}%");

        var regionalAdjustment = adjustments.FirstOrDefault(a => a.Factor == "region");
        if (regionalAdjustment != null && Math.Abs(regionalAdjustment.Percentage) > 1)
            insights.Add($"Regional factors in {region} are impacting prices by {regionalAdjustment.Percentage}%");

        var vehicleTypeAdjustment = adjustments.FirstOrDefault(a => a.Factor == "vehicle_type");
        if (vehicleTypeAdjustment != null && Math.Abs(vehicleTypeAdjustment.Percentage) > 2)
            insights.Add($"Current market demand for this vehicle type is affecting prices by {vehicleTypeAdjustment.Percentage}%");

        var fuelAdjustment = adjustments.FirstOrDefault(a => a.Factor == "fuel_price");
        if (fuelAdjustment != null && Math.Abs(fuelAdjustment.Percentage) > 1)
            insights.Add($"Fuel price conditions are impacting this vehicle's value by {fuelAdjustment.Percentage}%");

        return insights;
    }

    private int CalculateConfidenceScore(List<PriceAdjustment> adjustments, MarketFactors marketFactors)
    {
        var baseScore = 70;

        baseScore += Math.Min(adjustments.Count * 2, 20);
        baseScore += 10;

        var extremeAdjustments = adjustments.Count(a => Math.Abs(a.Percentage) > 10);
        baseScore -= extremeAdjustments * 5;

        return Math.Max(0, Math.Min(100, baseScore));
    }

    private string GetPriceRecommendation(decimal recommendedPrice, decimal marketPrice)
    {
        var ratio = recommendedPrice / marketPrice;

        return ratio switch
        {
            < 0.95m => "Good Deal",
            < 1.05m => "Fair Price",
            < 1.15m => "Slightly Overpriced",
            _ => "Overpriced"
        };
    }

    private async Task StorePricingCalculationAsync(PricingRequest request, PricingResponse response)
    {
        var pricing = new PricingEngine
        {
            CarId = request.CarId,
            BasePrice = request.BasePrice,
            RecommendedPrice = response.RecommendedPrice,
            MarketPrice = response.MarketPrice,
            Region = request.Region,
            Season = response.Season,
            Adjustments = response.Adjustments,
            TotalAdjustmentPercentage = response.TotalAdjustmentPercentage,
            TotalAdjustmentAmount = response.TotalAdjustmentAmount,
            MarketFactors = response.MarketFactors,
            Trend = response.Trend,
            ConfidenceScore = response.ConfidenceScore,
            MinPrice = response.MinPrice,
            MaxPrice = response.MaxPrice,
            FairPrice = response.FairPrice,
            CalculatedAt = response.CalculatedAt
        };

        await _pricingCollection.InsertOneAsync(pricing);
    }

    private async Task<MarketAnalysis> GenerateMarketAnalysisAsync(string region, string vehicleType, string brand, string model)
    {
        var analysis = new MarketAnalysis
        {
            Region = region,
            VehicleType = vehicleType,
            Brand = brand,
            Model = model,
            AveragePrice = 500000,
            MedianPrice = 480000,
            MinPrice = 400000,
            MaxPrice = 600000,
            StandardDeviation = 50000,
            SampleSize = 25,
            PriceTrend = 2.5m,
            AnalyzedAt = DateTime.UtcNow,
            DataFrom = DateTime.UtcNow.AddDays(-90),
            DataTo = DateTime.UtcNow
        };

        await _marketAnalysisCollection.InsertOneAsync(analysis);
        return analysis;
    }

    private async Task InitializeDefaultDataAsync()
    {
        try
        {
            var regionalCount = await _regionalCollection.CountDocumentsAsync(FilterDefinition<RegionalPricingData>.Empty);
            if (regionalCount == 0)
            {
                var regionalData = new List<RegionalPricingData>
                {
                    new RegionalPricingData
                    {
                        Region = "Mumbai",
                        State = "Maharashtra",
                        City = "Mumbai",
                        FuelPriceMultiplier = 1.05m,
                        TrafficDensityMultiplier = 0.98m,
                        WeatherImpactMultiplier = 1.02m,
                        EconomicMultiplier = 1.08m,
                        VehicleTypePreferences = new Dictionary<string, decimal>
                        {
                            { "Hatchback", 1.0m },
                            { "Sedan", 1.05m },
                            { "SUV", 1.1m },
                            { "Luxury", 1.2m }
                        }
                    },
                    new RegionalPricingData
                    {
                        Region = "Delhi",
                        State = "Delhi",
                        City = "Delhi",
                        FuelPriceMultiplier = 1.02m,
                        TrafficDensityMultiplier = 0.95m,
                        WeatherImpactMultiplier = 1.05m,
                        EconomicMultiplier = 1.06m,
                        VehicleTypePreferences = new Dictionary<string, decimal>
                        {
                            { "Hatchback", 0.98m },
                            { "Sedan", 1.02m },
                            { "SUV", 1.15m },
                            { "Luxury", 1.18m }
                        }
                    },
                    new RegionalPricingData
                    {
                        Region = "Bangalore",
                        State = "Karnataka",
                        City = "Bangalore",
                        FuelPriceMultiplier = 1.01m,
                        TrafficDensityMultiplier = 1.02m,
                        WeatherImpactMultiplier = 1.0m,
                        EconomicMultiplier = 1.04m,
                        VehicleTypePreferences = new Dictionary<string, decimal>
                        {
                            { "Hatchback", 1.02m },
                            { "Sedan", 1.08m },
                            { "SUV", 1.05m },
                            { "Luxury", 1.12m }
                        }
                    }
                };

                await _regionalCollection.InsertManyAsync(regionalData);
            }

            var seasonalCount = await _seasonalCollection.CountDocumentsAsync(FilterDefinition<SeasonalPricingData>.Empty);
            if (seasonalCount == 0)
            {
                var seasonalData = new List<SeasonalPricingData>
                {
                    new SeasonalPricingData
                    {
                        Season = "Summer",
                        Month = 6,
                        VehicleTypeMultipliers = new Dictionary<string, decimal>
                        {
                            { "Hatchback", 0.98m },
                            { "Sedan", 1.02m },
                            { "SUV", 1.05m },
                            { "Electric", 1.1m }
                        },
                        FuelPriceImpact = 0.97m,
                        FestivalImpact = 1.0m,
                        VacationImpact = 1.03m
                    },
                    new SeasonalPricingData
                    {
                        Season = "Monsoon",
                        Month = 7,
                        VehicleTypeMultipliers = new Dictionary<string, decimal>
                        {
                            { "Hatchback", 0.95m },
                            { "Sedan", 0.98m },
                            { "SUV", 1.15m },
                            { "MUV", 1.1m }
                        },
                        FuelPriceImpact = 1.0m,
                        FestivalImpact = 1.0m,
                        VacationImpact = 0.98m
                    },
                    new SeasonalPricingData
                    {
                        Season = "Winter",
                        Month = 12,
                        VehicleTypeMultipliers = new Dictionary<string, decimal>
                        {
                            { "Hatchback", 1.0m },
                            { "Sedan", 1.0m },
                            { "SUV", 1.02m },
                            { "Luxury", 1.05m }
                        },
                        FuelPriceImpact = 1.02m,
                        FestivalImpact = 1.08m,
                        VacationImpact = 1.0m
                    },
                    new SeasonalPricingData
                    {
                        Season = "Spring",
                        Month = 3,
                        VehicleTypeMultipliers = new Dictionary<string, decimal>
                        {
                            { "Hatchback", 1.03m },
                            { "Sedan", 1.05m },
                            { "SUV", 1.08m },
                            { "Luxury", 1.1m }
                        },
                        FuelPriceImpact = 1.0m,
                        FestivalImpact = 1.05m,
                        VacationImpact = 1.02m
                    }
                };

                await _seasonalCollection.InsertManyAsync(seasonalData);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error initializing pricing data: {ex.Message}");
        }
    }
}
