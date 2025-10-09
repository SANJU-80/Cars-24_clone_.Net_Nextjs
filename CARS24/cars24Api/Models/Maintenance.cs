using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace Cars24Api.Models;

public class MaintenanceEstimate
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }
    
    public string CarId { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public int Mileage { get; set; }
    public string Condition { get; set; } = string.Empty; // Excellent, Good, Fair, Poor
    
    // Cost estimates
    public decimal MonthlyMaintenanceCost { get; set; }
    public decimal AnnualMaintenanceCost { get; set; }
    public string MaintenanceLevel { get; set; } = string.Empty; // Low, Medium, High
    
    // Service predictions
    public List<ServicePrediction> UpcomingServices { get; set; } = new List<ServicePrediction>();
    public List<ComponentReplacement> ComponentReplacements { get; set; } = new List<ComponentReplacement>();
    
    // Risk factors
    public List<string> RiskFactors { get; set; } = new List<string>();
    public List<string> Recommendations { get; set; } = new List<string>();
    
    public DateTime EstimatedAt { get; set; } = DateTime.UtcNow;
}

public class ServicePrediction
{
    public string ServiceType { get; set; } = string.Empty; // Oil Change, Brake Service, etc.
    public int MileageDue { get; set; }
    public int KmRemaining { get; set; }
    public decimal EstimatedCost { get; set; }
    public string Priority { get; set; } = string.Empty; // High, Medium, Low
    public string Description { get; set; } = string.Empty;
}

public class ComponentReplacement
{
    public string Component { get; set; } = string.Empty; // Tires, Battery, etc.
    public int MileageDue { get; set; }
    public int KmRemaining { get; set; }
    public decimal EstimatedCost { get; set; }
    public string Priority { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class BrandMaintenanceData
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }
    
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    
    // Base maintenance costs per 10,000 km
    public decimal BaseServiceCost { get; set; }
    public decimal OilChangeCost { get; set; }
    public decimal BrakeServiceCost { get; set; }
    public decimal TireReplacementCost { get; set; }
    public decimal BatteryReplacementCost { get; set; }
    public decimal TransmissionServiceCost { get; set; }
    
    // Reliability factors (0.5 = 50% more reliable, 1.5 = 50% less reliable)
    public decimal ReliabilityFactor { get; set; } = 1.0m;
    
    // Service intervals (in km)
    public int OilChangeInterval { get; set; } = 10000;
    public int MajorServiceInterval { get; set; } = 20000;
    public int TireReplacementInterval { get; set; } = 50000;
    public int BatteryReplacementInterval { get; set; } = 60000;
    public int TransmissionServiceInterval { get; set; } = 40000;
}

public class MaintenanceRequest
{
    public string CarId { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public int Mileage { get; set; }
    public string Condition { get; set; } = string.Empty;
}
