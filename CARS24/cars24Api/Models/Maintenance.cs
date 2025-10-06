using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Cars24Api.Models
{
    public class Maintenance
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = string.Empty;

        [BsonElement("Brand")]
        public string Brand { get; set; } = string.Empty;

        [BsonElement("Year")]
        public int Year { get; set; }

        [BsonElement("Km")]
        public string Km { get; set; } = string.Empty;

        [BsonElement("MonthlyCost")]
        public int MonthlyCost { get; set; }

        [BsonElement("MaintenanceLevel")]
        public string MaintenanceLevel { get; set; } = string.Empty;

        [BsonElement("NextMajorServiceInKm")]
        public int NextMajorServiceInKm { get; set; }

        [BsonElement("TireReplacementSoon")]
        public bool TireReplacementSoon { get; set; }

        [BsonElement("Insights")]
        public List<string> Insights { get; set; } = new List<string>();

        [BsonElement("BrandImage")]
        public string BrandImage { get; set; } = string.Empty;
    }

    public class MaintenanceEstimateRequest
    {
        public string Brand { get; set; } = string.Empty;
        public int Year { get; set; }
        public string Km { get; set; } = string.Empty;
    }

    public class MaintenanceEstimateResponse
    {
        public int MonthlyCost { get; set; }
        public int AnnualCost { get; set; }
        public string MaintenanceLevel { get; set; } = string.Empty;
        public int NextMajorServiceInKm { get; set; }
        public bool TireReplacementSoon { get; set; }
        public bool BrakePadReplacementSoon { get; set; }
        public bool BatteryReplacementSoon { get; set; }
        public List<string> Insights { get; set; } = new List<string>();
        public string BrandImage { get; set; } = string.Empty;
        public double Multiplier { get; set; }
        public int Age { get; set; }
        public int Km { get; set; }
    }
}