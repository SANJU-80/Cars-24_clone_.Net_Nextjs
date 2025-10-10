using Cars24Api.Models;
using Cars24Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Cars24Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PricingController : ControllerBase
{
    private readonly PricingService _pricingService;

    public PricingController(PricingService pricingService)
    {
        _pricingService = pricingService;
    }

    [HttpPost("calculate")]
    public async Task<ActionResult<PricingResponse>> CalculateRecommendedPrice([FromBody] PricingRequest request)
    {
        try
        {
            if (request.BasePrice <= 0)
            {
                return BadRequest("Base price must be greater than 0");
            }

            if (string.IsNullOrEmpty(request.Region))
            {
                return BadRequest("Region is required");
            }

            // Auto-detect region from user location if not provided
            if (string.IsNullOrEmpty(request.Region) && !string.IsNullOrEmpty(request.UserLocation))
            {
                request.Region = await DetectRegionFromLocationAsync(request.UserLocation);
            }

            // Set default region if still empty
            if (string.IsNullOrEmpty(request.Region))
            {
                request.Region = "Mumbai"; // Default to Mumbai
            }

            var response = await _pricingService.CalculateRecommendedPriceAsync(request);
            return Ok(response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("history/{carId}")]
    public async Task<ActionResult<List<PricingResponse>>> GetPriceHistory(
        string carId, 
        [FromQuery] int days = 30)
    {
        try
        {
            if (string.IsNullOrEmpty(carId))
            {
                return BadRequest("Car ID is required");
            }

            if (days < 1 || days > 365)
            {
                return BadRequest("Days must be between 1 and 365");
            }

            var priceHistory = await _pricingService.GetPriceHistoryAsync(carId, days);
            return Ok(priceHistory);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("market-analysis")]
    public async Task<ActionResult<MarketAnalysis>> GetMarketAnalysis(
        [FromQuery] string region,
        [FromQuery] string vehicleType,
        [FromQuery] string brand,
        [FromQuery] string model)
    {
        try
        {
            if (string.IsNullOrEmpty(region) || string.IsNullOrEmpty(vehicleType) || 
                string.IsNullOrEmpty(brand) || string.IsNullOrEmpty(model))
            {
                return BadRequest("Region, vehicleType, brand, and model are required");
            }

            var analysis = await _pricingService.GetMarketAnalysisAsync(region, vehicleType, brand, model);
            return Ok(analysis);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("price-alerts/{userId}")]
    public async Task<ActionResult<List<PriceAlert>>> GetPriceAlerts(string userId)
    {
        try
        {
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest("User ID is required");
            }

            var alerts = await _pricingService.GetPriceAlertsAsync(userId);
            return Ok(alerts);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPost("price-alert")]
    public async Task<ActionResult<PriceAlert>> CreatePriceAlert([FromBody] CreatePriceAlertRequest request)
    {
        try
        {
            if (string.IsNullOrEmpty(request.UserId) || string.IsNullOrEmpty(request.CarId))
            {
                return BadRequest("User ID and Car ID are required");
            }

            if (request.TargetPrice <= 0)
            {
                return BadRequest("Target price must be greater than 0");
            }

            var validAlertTypes = new[] { "price_drop", "price_increase", "market_change" };
            if (!validAlertTypes.Contains(request.AlertType))
            {
                return BadRequest($"Alert type must be one of: {string.Join(", ", validAlertTypes)}");
            }

            var alert = await _pricingService.CreatePriceAlertAsync(
                request.UserId, 
                request.CarId, 
                request.AlertType, 
                request.TargetPrice);

            return Ok(alert);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("regions")]
    public ActionResult<List<string>> GetSupportedRegions()
    {
        try
        {
            var regions = new List<string>
            {
                "Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad",
                "Pune", "Ahmedabad", "Jaipur", "Surat", "Lucknow", "Kanpur",
                "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Pimpri-Chinchwad",
                "Patna", "Vadodara", "Ghaziabad", "Ludhiana", "Agra", "Nashik",
                "Faridabad", "Meerut", "Rajkot", "Kalyan-Dombivali", "Vasai-Virar",
                "Varanasi", "Srinagar", "Aurangabad", "Navi Mumbai", "Solapur",
                "Vijayawada", "Kolhapur", "Amritsar", "Noida", "Ranchi"
            };

            return Ok(regions);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("vehicle-types")]
    public ActionResult<List<string>> GetVehicleTypes()
    {
        try
        {
            var vehicleTypes = new List<string>
            {
                "Hatchback", "Sedan", "SUV", "MUV", "Luxury", "Electric", "Hybrid"
            };

            return Ok(vehicleTypes);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("conditions")]
    public ActionResult<List<string>> GetVehicleConditions()
    {
        try
        {
            var conditions = new List<string>
            {
                "Excellent", "Good", "Fair", "Poor"
            };

            return Ok(conditions);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("fuel-types")]
    public ActionResult<List<string>> GetFuelTypes()
    {
        try
        {
            var fuelTypes = new List<string>
            {
                "Petrol", "Diesel", "Electric", "Hybrid", "CNG", "LPG"
            };

            return Ok(fuelTypes);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("transmission-types")]
    public ActionResult<List<string>> GetTransmissionTypes()
    {
        try
        {
            var transmissionTypes = new List<string>
            {
                "Manual", "Automatic", "CVT", "AMT"
            };

            return Ok(transmissionTypes);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("price-trends/{region}")]
    public async Task<ActionResult<List<PriceTrendData>>> GetPriceTrends(
        string region,
        [FromQuery] string? vehicleType = null,
        [FromQuery] string? brand = null,
        [FromQuery] int days = 30)
    {
        try
        {
            if (string.IsNullOrEmpty(region))
            {
                return BadRequest("Region is required");
            }

            if (days < 1 || days > 365)
            {
                return BadRequest("Days must be between 1 and 365");
            }

            // Simulate price trend data
            var trends = await GeneratePriceTrendDataAsync(region, vehicleType, brand, days);
            return Ok(trends);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("market-insights/{region}")]
    public async Task<ActionResult<MarketInsights>> GetMarketInsights(string region)
    {
        try
        {
            if (string.IsNullOrEmpty(region))
            {
                return BadRequest("Region is required");
            }

            var insights = await GenerateMarketInsightsAsync(region);
            return Ok(insights);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPost("bulk-calculate")]
    public async Task<ActionResult<List<PricingResponse>>> BulkCalculatePrices([FromBody] List<PricingRequest> requests)
    {
        try
        {
            if (requests == null || !requests.Any())
            {
                return BadRequest("At least one pricing request is required");
            }

            if (requests.Count > 50)
            {
                return BadRequest("Maximum 50 requests allowed per batch");
            }

            var responses = new List<PricingResponse>();
            
            foreach (var request in requests)
            {
                try
                {
                    var response = await _pricingService.CalculateRecommendedPriceAsync(request);
                    responses.Add(response);
                }
                catch (Exception ex)
                {
                    // Log error but continue with other requests
                    Console.WriteLine($"Error processing request for car {request.CarId}: {ex.Message}");
                }
            }

            return Ok(responses);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    private async Task<string> DetectRegionFromLocationAsync(string userLocation)
    {
        // Simple location to region mapping
        // In a real implementation, you would use a geocoding service
        var locationMappings = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            { "mumbai", "Mumbai" },
            { "delhi", "Delhi" },
            { "bangalore", "Bangalore" },
            { "chennai", "Chennai" },
            { "kolkata", "Kolkata" },
            { "hyderabad", "Hyderabad" },
            { "pune", "Pune" },
            { "ahmedabad", "Ahmedabad" },
            { "jaipur", "Jaipur" }
        };

        foreach (var mapping in locationMappings)
        {
            if (userLocation.Contains(mapping.Key, StringComparison.OrdinalIgnoreCase))
            {
                return mapping.Value;
            }
        }

        return "Mumbai"; // Default fallback
    }

    private async Task<List<PriceTrendData>> GeneratePriceTrendDataAsync(
        string region, 
        string? vehicleType, 
        string? brand, 
        int days)
    {
        // Simulate price trend data generation
        var trends = new List<PriceTrendData>();
        var basePrice = 500000m;
        var random = new Random();

        for (int i = days; i >= 0; i--)
        {
            var date = DateTime.UtcNow.AddDays(-i);
            var variation = (decimal)(random.NextDouble() - 0.5) * 0.02m; // ±1% variation
            var price = basePrice * (1 + variation);

            trends.Add(new PriceTrendData
            {
                Date = date,
                AveragePrice = Math.Round(price, 0),
                MinPrice = Math.Round(price * 0.95m, 0),
                MaxPrice = Math.Round(price * 1.05m, 0),
                SampleSize = random.Next(5, 25)
            });
        }

        return trends;
    }

    private async Task<MarketInsights> GenerateMarketInsightsAsync(string region)
    {
        // Simulate market insights generation
        return new MarketInsights
        {
            Region = region,
            OverallTrend = "Rising",
            TrendPercentage = 2.5m,
            HotVehicleTypes = new List<string> { "SUV", "Electric" },
            ColdVehicleTypes = new List<string> { "Hatchback" },
            MarketConditions = "Active",
            AverageListingTime = 45,
            PriceVolatility = "Low",
            SeasonalFactors = new List<string> 
            { 
                "Festival season approaching",
                "Monsoon affecting SUV demand"
            },
            EconomicFactors = new List<string>
            {
                "Fuel prices stable",
                "Interest rates favorable"
            },
            GeneratedAt = DateTime.UtcNow
        };
    }
}

// Request/Response models
public class CreatePriceAlertRequest
{
    public string UserId { get; set; } = string.Empty;
    public string CarId { get; set; } = string.Empty;
    public string AlertType { get; set; } = string.Empty;
    public decimal TargetPrice { get; set; }
}

public class PriceTrendData
{
    public DateTime Date { get; set; }
    public decimal AveragePrice { get; set; }
    public decimal MinPrice { get; set; }
    public decimal MaxPrice { get; set; }
    public int SampleSize { get; set; }
}

public class MarketInsights
{
    public string Region { get; set; } = string.Empty;
    public string OverallTrend { get; set; } = string.Empty;
    public decimal TrendPercentage { get; set; }
    public List<string> HotVehicleTypes { get; set; } = new List<string>();
    public List<string> ColdVehicleTypes { get; set; } = new List<string>();
    public string MarketConditions { get; set; } = string.Empty;
    public int AverageListingTime { get; set; }
    public string PriceVolatility { get; set; } = string.Empty;
    public List<string> SeasonalFactors { get; set; } = new List<string>();
    public List<string> EconomicFactors { get; set; } = new List<string>();
    public DateTime GeneratedAt { get; set; }
}

