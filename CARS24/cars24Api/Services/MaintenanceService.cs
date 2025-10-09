using Cars24Api.Models;
using MongoDB.Driver;

namespace Cars24Api.Services;

public class MaintenanceService
{
    private readonly IMongoCollection<BrandMaintenanceData> _brandDataCollection;
    private readonly IMongoCollection<MaintenanceEstimate> _estimateCollection;

    public MaintenanceService(IMongoDatabase database)
    {
        _brandDataCollection = database.GetCollection<BrandMaintenanceData>("BrandMaintenanceData");
        _estimateCollection = database.GetCollection<MaintenanceEstimate>("MaintenanceEstimates");
        
        // Initialize default brand data if not exists
        _ = Task.Run(async () => await InitializeDefaultBrandDataAsync());
    }

    public async Task<MaintenanceEstimate> GetMaintenanceEstimate(MaintenanceRequest request)
    {
        // Get brand-specific maintenance data
        var brandData = await GetBrandMaintenanceData(request.Brand, request.Model);
        
        // Calculate maintenance level based on age and mileage
        var maintenanceLevel = CalculateMaintenanceLevel(request.Year, request.Mileage, request.Condition);
        
        // Calculate base costs
        var baseMonthlyCost = CalculateBaseMonthlyCost(brandData, request.Year, request.Mileage, request.Condition);
        var baseAnnualCost = baseMonthlyCost * 12;
        
        // Generate service predictions
        var upcomingServices = GenerateServicePredictions(brandData, request.Mileage, request.Year);
        var componentReplacements = GenerateComponentReplacements(brandData, request.Mileage, request.Year);
        
        // Generate risk factors and recommendations
        var riskFactors = GenerateRiskFactors(request.Year, request.Mileage, request.Condition);
        var recommendations = GenerateRecommendations(request.Year, request.Mileage, request.Condition, upcomingServices);
        
        var estimate = new MaintenanceEstimate
        {
            CarId = request.CarId,
            Brand = request.Brand,
            Model = request.Model,
            Year = request.Year,
            Mileage = request.Mileage,
            Condition = request.Condition,
            MonthlyMaintenanceCost = baseMonthlyCost,
            AnnualMaintenanceCost = baseAnnualCost,
            MaintenanceLevel = maintenanceLevel,
            UpcomingServices = upcomingServices,
            ComponentReplacements = componentReplacements,
            RiskFactors = riskFactors,
            Recommendations = recommendations,
            EstimatedAt = DateTime.UtcNow
        };
        
        // Save estimate for future reference
        await _estimateCollection.InsertOneAsync(estimate);
        
        return estimate;
    }

    private async Task<BrandMaintenanceData> GetBrandMaintenanceData(string brand, string model)
    {
        var filter = Builders<BrandMaintenanceData>.Filter.And(
            Builders<BrandMaintenanceData>.Filter.Eq(x => x.Brand, brand),
            Builders<BrandMaintenanceData>.Filter.Eq(x => x.Model, model)
        );
        
        var brandData = await _brandDataCollection.Find(filter).FirstOrDefaultAsync();
        
        // If specific model not found, try to find brand default
        if (brandData == null)
        {
            var brandFilter = Builders<BrandMaintenanceData>.Filter.And(
                Builders<BrandMaintenanceData>.Filter.Eq(x => x.Brand, brand),
                Builders<BrandMaintenanceData>.Filter.Eq(x => x.Model, "Default")
            );
            brandData = await _brandDataCollection.Find(brandFilter).FirstOrDefaultAsync();
        }
        
        // If still not found, return default data
        return brandData ?? GetDefaultBrandData(brand);
    }

    private string CalculateMaintenanceLevel(int year, int mileage, string condition)
    {
        var currentYear = DateTime.Now.Year;
        var age = currentYear - year;
        var mileagePerYear = mileage / Math.Max(age, 1);
        
        var score = 0;
        
        // Age factor (0-3 points)
        if (age <= 3) score += 0;
        else if (age <= 6) score += 1;
        else if (age <= 10) score += 2;
        else score += 3;
        
        // Mileage factor (0-3 points)
        if (mileagePerYear <= 10000) score += 0;
        else if (mileagePerYear <= 15000) score += 1;
        else if (mileagePerYear <= 20000) score += 2;
        else score += 3;
        
        // Condition factor (0-2 points)
        switch (condition.ToLower())
        {
            case "excellent": score += 0; break;
            case "good": score += 1; break;
            case "fair": score += 2; break;
            case "poor": score += 3; break;
            default: score += 1; break;
        }
        
        // Determine level based on total score
        if (score <= 2) return "Low";
        else if (score <= 5) return "Medium";
        else return "High";
    }

    private decimal CalculateBaseMonthlyCost(BrandMaintenanceData brandData, int year, int mileage, string condition)
    {
        var currentYear = DateTime.Now.Year;
        var age = currentYear - year;
        var mileagePerYear = mileage / Math.Max(age, 1);
        
        // Base cost from brand data
        var baseCost = brandData.BaseServiceCost / 12; // Convert annual to monthly
        
        // Apply age multiplier
        var ageMultiplier = 1.0m;
        if (age > 5) ageMultiplier += (age - 5) * 0.1m;
        
        // Apply mileage multiplier
        var mileageMultiplier = 1.0m;
        if (mileagePerYear > 15000) mileageMultiplier += (mileagePerYear - 15000) / 10000 * 0.2m;
        
        // Apply condition multiplier
        var conditionMultiplier = condition.ToLower() switch
        {
            "excellent" => 0.8m,
            "good" => 1.0m,
            "fair" => 1.3m,
            "poor" => 1.6m,
            _ => 1.0m
        };
        
        // Apply reliability factor
        var reliabilityMultiplier = brandData.ReliabilityFactor;
        
        return baseCost * ageMultiplier * mileageMultiplier * conditionMultiplier * reliabilityMultiplier;
    }

    private List<ServicePrediction> GenerateServicePredictions(BrandMaintenanceData brandData, int currentMileage, int year)
    {
        var predictions = new List<ServicePrediction>();
        var currentYear = DateTime.Now.Year;
        var age = currentYear - year;
        
        // Oil change prediction
        var nextOilChange = ((currentMileage / brandData.OilChangeInterval) + 1) * brandData.OilChangeInterval;
        predictions.Add(new ServicePrediction
        {
            ServiceType = "Oil Change",
            MileageDue = nextOilChange,
            KmRemaining = nextOilChange - currentMileage,
            EstimatedCost = brandData.OilChangeCost,
            Priority = "High",
            Description = "Regular oil change to maintain engine health"
        });
        
        // Major service prediction
        var nextMajorService = ((currentMileage / brandData.MajorServiceInterval) + 1) * brandData.MajorServiceInterval;
        predictions.Add(new ServicePrediction
        {
            ServiceType = "Major Service",
            MileageDue = nextMajorService,
            KmRemaining = nextMajorService - currentMileage,
            EstimatedCost = brandData.BaseServiceCost,
            Priority = nextMajorService - currentMileage <= 5000 ? "High" : "Medium",
            Description = "Comprehensive service including filters, fluids, and inspection"
        });
        
        // Brake service prediction (every 30,000 km or 2 years)
        var brakeServiceInterval = Math.Min(30000, 20000 + (age * 2000));
        var nextBrakeService = ((currentMileage / brakeServiceInterval) + 1) * brakeServiceInterval;
        predictions.Add(new ServicePrediction
        {
            ServiceType = "Brake Service",
            MileageDue = nextBrakeService,
            KmRemaining = nextBrakeService - currentMileage,
            EstimatedCost = brandData.BrakeServiceCost,
            Priority = nextBrakeService - currentMileage <= 10000 ? "High" : "Low",
            Description = "Brake pad replacement and brake fluid service"
        });
        
        return predictions.OrderBy(p => p.KmRemaining).ToList();
    }

    private List<ComponentReplacement> GenerateComponentReplacements(BrandMaintenanceData brandData, int currentMileage, int year)
    {
        var replacements = new List<ComponentReplacement>();
        var currentYear = DateTime.Now.Year;
        var age = currentYear - year;
        
        // Tire replacement
        var nextTireReplacement = ((currentMileage / brandData.TireReplacementInterval) + 1) * brandData.TireReplacementInterval;
        replacements.Add(new ComponentReplacement
        {
            Component = "Tires",
            MileageDue = nextTireReplacement,
            KmRemaining = nextTireReplacement - currentMileage,
            EstimatedCost = brandData.TireReplacementCost,
            Priority = nextTireReplacement - currentMileage <= 10000 ? "High" : "Medium",
            Description = "Complete tire replacement (4 tires)"
        });
        
        // Battery replacement
        var nextBatteryReplacement = ((currentMileage / brandData.BatteryReplacementInterval) + 1) * brandData.BatteryReplacementInterval;
        replacements.Add(new ComponentReplacement
        {
            Component = "Battery",
            MileageDue = nextBatteryReplacement,
            KmRemaining = nextBatteryReplacement - currentMileage,
            EstimatedCost = brandData.BatteryReplacementCost,
            Priority = age >= 4 ? "High" : "Low",
            Description = "Car battery replacement"
        });
        
        // Transmission service
        var nextTransmissionService = ((currentMileage / brandData.TransmissionServiceInterval) + 1) * brandData.TransmissionServiceInterval;
        replacements.Add(new ComponentReplacement
        {
            Component = "Transmission Service",
            MileageDue = nextTransmissionService,
            KmRemaining = nextTransmissionService - currentMileage,
            EstimatedCost = brandData.TransmissionServiceCost,
            Priority = nextTransmissionService - currentMileage <= 15000 ? "Medium" : "Low",
            Description = "Transmission fluid change and service"
        });
        
        return replacements.OrderBy(r => r.KmRemaining).ToList();
    }

    private List<string> GenerateRiskFactors(int year, int mileage, string condition)
    {
        var riskFactors = new List<string>();
        var currentYear = DateTime.Now.Year;
        var age = currentYear - year;
        var mileagePerYear = mileage / Math.Max(age, 1);
        
        if (age > 8)
            riskFactors.Add("High vehicle age increases maintenance complexity");
        
        if (mileagePerYear > 20000)
            riskFactors.Add("High annual mileage accelerates wear and tear");
        
        if (condition.ToLower() == "poor")
            riskFactors.Add("Poor condition may require additional repairs");
        
        if (mileage > 100000)
            riskFactors.Add("High mileage may require major component replacements");
        
        if (age > 10 && mileage > 150000)
            riskFactors.Add("Very high age and mileage combination");
        
        return riskFactors;
    }

    private List<string> GenerateRecommendations(int year, int mileage, string condition, List<ServicePrediction> upcomingServices)
    {
        var recommendations = new List<string>();
        var currentYear = DateTime.Now.Year;
        var age = currentYear - year;
        
        // Immediate recommendations
        var urgentServices = upcomingServices.Where(s => s.KmRemaining <= 5000).ToList();
        if (urgentServices.Any())
        {
            recommendations.Add($"Schedule {string.Join(", ", urgentServices.Select(s => s.ServiceType))} soon");
        }
        
        // General recommendations
        if (age > 5)
            recommendations.Add("Consider extended warranty for older vehicle");
        
        if (mileage > 80000)
            recommendations.Add("Set aside emergency fund for major repairs");
        
        if (condition.ToLower() == "fair" || condition.ToLower() == "poor")
            recommendations.Add("Get comprehensive inspection before purchase");
        
        recommendations.Add("Keep detailed maintenance records");
        recommendations.Add("Follow manufacturer's service schedule");
        
        return recommendations;
    }

    private BrandMaintenanceData GetDefaultBrandData(string brand)
    {
        // Default maintenance data for common brands
        return brand.ToLower() switch
        {
            "maruti" or "suzuki" => new BrandMaintenanceData
            {
                Brand = brand,
                Model = "Default",
                BaseServiceCost = 15000,
                OilChangeCost = 2000,
                BrakeServiceCost = 8000,
                TireReplacementCost = 25000,
                BatteryReplacementCost = 6000,
                TransmissionServiceCost = 5000,
                ReliabilityFactor = 0.9m,
                OilChangeInterval = 10000,
                MajorServiceInterval = 20000,
                TireReplacementInterval = 50000,
                BatteryReplacementInterval = 60000,
                TransmissionServiceInterval = 40000
            },
            "hyundai" => new BrandMaintenanceData
            {
                Brand = brand,
                Model = "Default",
                BaseServiceCost = 18000,
                OilChangeCost = 2500,
                BrakeServiceCost = 9000,
                TireReplacementCost = 28000,
                BatteryReplacementCost = 7000,
                TransmissionServiceCost = 6000,
                ReliabilityFactor = 0.95m,
                OilChangeInterval = 10000,
                MajorServiceInterval = 20000,
                TireReplacementInterval = 50000,
                BatteryReplacementInterval = 60000,
                TransmissionServiceInterval = 40000
            },
            "honda" => new BrandMaintenanceData
            {
                Brand = brand,
                Model = "Default",
                BaseServiceCost = 20000,
                OilChangeCost = 3000,
                BrakeServiceCost = 10000,
                TireReplacementCost = 30000,
                BatteryReplacementCost = 8000,
                TransmissionServiceCost = 7000,
                ReliabilityFactor = 0.85m,
                OilChangeInterval = 10000,
                MajorServiceInterval = 20000,
                TireReplacementInterval = 50000,
                BatteryReplacementInterval = 60000,
                TransmissionServiceInterval = 40000
            },
            "toyota" => new BrandMaintenanceData
            {
                Brand = brand,
                Model = "Default",
                BaseServiceCost = 22000,
                OilChangeCost = 3500,
                BrakeServiceCost = 12000,
                TireReplacementCost = 32000,
                BatteryReplacementCost = 9000,
                TransmissionServiceCost = 8000,
                ReliabilityFactor = 0.8m,
                OilChangeInterval = 10000,
                MajorServiceInterval = 20000,
                TireReplacementInterval = 50000,
                BatteryReplacementInterval = 60000,
                TransmissionServiceInterval = 40000
            },
            _ => new BrandMaintenanceData
            {
                Brand = brand,
                Model = "Default",
                BaseServiceCost = 20000,
                OilChangeCost = 3000,
                BrakeServiceCost = 10000,
                TireReplacementCost = 30000,
                BatteryReplacementCost = 8000,
                TransmissionServiceCost = 7000,
                ReliabilityFactor = 1.0m,
                OilChangeInterval = 10000,
                MajorServiceInterval = 20000,
                TireReplacementInterval = 50000,
                BatteryReplacementInterval = 60000,
                TransmissionServiceInterval = 40000
            }
        };
    }

    private async Task InitializeDefaultBrandDataAsync()
    {
        try
        {
            var count = await _brandDataCollection.CountDocumentsAsync(FilterDefinition<BrandMaintenanceData>.Empty);
            if (count == 0)
            {
                var defaultBrands = new[]
                {
                    "Maruti", "Hyundai", "Honda", "Toyota", "Tata", "Mahindra", 
                    "Ford", "Volkswagen", "Skoda", "Nissan", "Renault", "Kia"
                };
                
                var brandDataList = defaultBrands.Select(GetDefaultBrandData).ToList();
                await _brandDataCollection.InsertManyAsync(brandDataList);
            }
        }
        catch (Exception ex)
        {
            // Log error but don't throw - this is initialization
            Console.WriteLine($"Error initializing brand data: {ex.Message}");
        }
    }
}
