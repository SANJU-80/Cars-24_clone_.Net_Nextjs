using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace cars24Api.Models;

public class PricingEngine
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }
    
    public string CarId { get; set; } = string.Empty;
    public decimal BasePrice { get; set; }
    public decimal RecommendedPrice { get; set; }
    public decimal MarketPrice { get; set; }
    public string Region { get; set; } = string.Empty;
    public string Season { get; set; } = string.Empty;
    public DateTime CalculatedAt { get; set; } = DateTime.UtcNow;
    
    // Price adjustments
    public List<PriceAdjustment> Adjustments { get; set; } = new List<PriceAdjustment>();
    public decimal TotalAdjustmentPercentage { get; set; }
    public decimal TotalAdjustmentAmount { get; set; }
    
    // Market factors
    public MarketFactors MarketFactors { get; set; } = new MarketFactors();
    
    // Price trend
    public PriceTrend Trend { get; set; } = new PriceTrend();
    
    // Confidence score (0-100)
    public int ConfidenceScore { get; set; }
    
    // Price range
    public decimal MinPrice { get; set; }
    public decimal MaxPrice { get; set; }
    public decimal FairPrice { get; set; }
}

public class PriceAdjustment
{
    public string Factor { get; set; } = string.Empty; // "season", "region", "fuel_price", "demand", etc.
    public string Description { get; set; } = string.Empty;
    public decimal Percentage { get; set; }
    public decimal Amount { get; set; }
    public string Impact { get; set; } = string.Empty; // "positive", "negative", "neutral"
    public decimal Weight { get; set; } = 1.0m; // Weight of this factor (0-2)
    public DateTime CalculatedAt { get; set; } = DateTime.UtcNow;
}

public class MarketFactors
{
    public decimal FuelPriceIndex { get; set; } = 1.0m;
    public decimal EconomicIndex { get; set; } = 1.0m;
    public decimal SeasonalDemand { get; set; } = 1.0m;
    public decimal RegionalDemand { get; set; } = 1.0m;
    public decimal VehicleTypeDemand { get; set; } = 1.0m;
    public decimal BrandPopularity { get; set; } = 1.0m;
    public decimal MileageImpact { get; set; } = 1.0m;
    public decimal AgeImpact { get; set; } = 1.0m;
    public decimal ConditionImpact { get; set; } = 1.0m;
    public decimal MarketSupply { get; set; } = 1.0m;
}

public class PriceTrend
{
    public string Direction { get; set; } = string.Empty; // "rising", "falling", "stable"
    public decimal ChangePercentage { get; set; }
    public decimal ChangeAmount { get; set; }
    public int TrendDuration { get; set; } // Days
    public string TrendReason { get; set; } = string.Empty;
    public DateTime TrendStartDate { get; set; }
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
}

public class RegionalPricingData
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }
    
    public string Region { get; set; } = string.Empty; // "Mumbai", "Delhi", "Bangalore", etc.
    public string State { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    
    // Regional factors
    public decimal FuelPriceMultiplier { get; set; } = 1.0m;
    public decimal TrafficDensityMultiplier { get; set; } = 1.0m;
    public decimal WeatherImpactMultiplier { get; set; } = 1.0m;
    public decimal EconomicMultiplier { get; set; } = 1.0m;
    
    // Vehicle type preferences by region
    public Dictionary<string, decimal> VehicleTypePreferences { get; set; } = new Dictionary<string, decimal>
    {
        { "Hatchback", 1.0m },
        { "Sedan", 1.0m },
        { "SUV", 1.0m },
        { "MUV", 1.0m },
        { "Luxury", 1.0m },
        { "Electric", 1.0m }
    };
    
    // Seasonal factors
    public Dictionary<string, decimal> SeasonalMultipliers { get; set; } = new Dictionary<string, decimal>
    {
        { "Summer", 1.0m },
        { "Monsoon", 1.0m },
        { "Winter", 1.0m },
        { "Spring", 1.0m }
    };
    
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;
}

public class SeasonalPricingData
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }
    
    public string Season { get; set; } = string.Empty;
    public int Month { get; set; }
    
    // Vehicle type seasonal demand
    public Dictionary<string, decimal> VehicleTypeMultipliers { get; set; } = new Dictionary<string, decimal>
    {
        { "Hatchback", 1.0m },
        { "Sedan", 1.0m },
        { "SUV", 1.0m },
        { "MUV", 1.0m },
        { "Luxury", 1.0m },
        { "Electric", 1.0m }
    };
    
    // Regional seasonal impact
    public Dictionary<string, decimal> RegionalMultipliers { get; set; } = new Dictionary<string, decimal>();
    
    // Economic factors
    public decimal FuelPriceImpact { get; set; } = 1.0m;
    public decimal FestivalImpact { get; set; } = 1.0m;
    public decimal VacationImpact { get; set; } = 1.0m;
    
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;
}

public class PricingRequest
{
    public string CarId { get; set; } = string.Empty;
    public decimal BasePrice { get; set; }
    public string Region { get; set; } = string.Empty;
    public string? UserLocation { get; set; }
    public DateTime? RequestDate { get; set; }
    
    // Car details for analysis
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public string VehicleType { get; set; } = string.Empty;
    public int Year { get; set; }
    public int Mileage { get; set; }
    public string Condition { get; set; } = string.Empty;
    public string FuelType { get; set; } = string.Empty;
    public string Transmission { get; set; } = string.Empty;
}

public class PricingResponse
{
    public string CarId { get; set; } = string.Empty;
    public decimal BasePrice { get; set; }
    public decimal RecommendedPrice { get; set; }
    public decimal MarketPrice { get; set; }
    public decimal FairPrice { get; set; }
    public decimal MinPrice { get; set; }
    public decimal MaxPrice { get; set; }
    
    public string Region { get; set; } = string.Empty;
    public string Season { get; set; } = string.Empty;
    public decimal TotalAdjustmentPercentage { get; set; }
    public decimal TotalAdjustmentAmount { get; set; }
    
    public List<PriceAdjustment> Adjustments { get; set; } = new List<PriceAdjustment>();
    public MarketFactors MarketFactors { get; set; } = new MarketFactors();
    public PriceTrend Trend { get; set; } = new PriceTrend();
    
    public int ConfidenceScore { get; set; }
    public string PriceRecommendation { get; set; } = string.Empty; // "Good Deal", "Fair Price", "Overpriced", etc.
    public List<string> MarketInsights { get; set; } = new List<string>();
    
    public DateTime CalculatedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; }
}

public class MarketAnalysis
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }
    
    public string Region { get; set; } = string.Empty;
    public string VehicleType { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    
    public decimal AveragePrice { get; set; }
    public decimal MedianPrice { get; set; }
    public decimal MinPrice { get; set; }
    public decimal MaxPrice { get; set; }
    public decimal StandardDeviation { get; set; }
    
    public int SampleSize { get; set; }
    public decimal PriceTrend { get; set; } // Percentage change over time
    public int DaysToAnalyze { get; set; } = 90;
    
    public DateTime AnalyzedAt { get; set; } = DateTime.UtcNow;
    public DateTime DataFrom { get; set; }
    public DateTime DataTo { get; set; }
}

public class PriceAlert
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }
    
    public string UserId { get; set; } = string.Empty;
    public string CarId { get; set; } = string.Empty;
    public string AlertType { get; set; } = string.Empty; // "price_drop", "price_increase", "market_change"
    
    public decimal CurrentPrice { get; set; }
    public decimal TargetPrice { get; set; }
    public decimal PercentageChange { get; set; }
    
    public string Region { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? TriggeredAt { get; set; }
}

