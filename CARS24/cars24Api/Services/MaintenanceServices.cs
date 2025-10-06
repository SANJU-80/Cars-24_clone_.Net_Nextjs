using Cars24Api.Models;
using MongoDB.Driver;

namespace Cars24Api.Services
{
    public class MaintenanceService
    {
        private readonly IMongoCollection<Maintenance> _maintenances;
        public MaintenanceService(IConfiguration config)
        {
            var client = new MongoClient(config.GetConnectionString("Cars24DB"));
            var database = client.GetDatabase(config["MongoDB:DatabaseName"]);
            _maintenances = database.GetCollection<Maintenance>("Maintenances");
        }
        public async Task CreateAsync(Maintenance maintenance)
        {
            await _maintenances.InsertOneAsync(maintenance);
        }

        public async Task<Maintenance> GetByIdAsynch(string id)
        {
            return await _maintenances.Find(a => a.Id == id).FirstOrDefaultAsync();
        }

        public async Task<List<Maintenance>> GetAllAsync()
        {
            return await _maintenances.Find(_ => true).ToListAsync();
        }

        public async Task<MaintenanceEstimateResponse> EstimateMaintenanceAsync(string brand, int year, string kmStr)
        {
            // Brand data with maintenance costs
            var brandData = GetBrandData(brand);
            if (brandData == null)
                throw new ArgumentException($"Brand {brand} not supported");

            var currentYear = DateTime.Now.Year;
            var age = currentYear - year;
            var km = int.Parse(kmStr.Replace(",", ""));
            var multiplier = GetConditionMultiplier(age, km);

            var annualCost = (int)(brandData.AvgAnnualServiceCost * multiplier);
            var monthlyCost = annualCost / 12;

            // Enhanced maintenance level categorization
            string maintenanceLevel = "Low";
            if (multiplier >= 1.8) maintenanceLevel = "Very High";
            else if (multiplier >= 1.5) maintenanceLevel = "High";
            else if (multiplier >= 1.2) maintenanceLevel = "Moderate";

            // Calculate service intervals
            var nextMajorServiceInKm = brandData.MajorServiceInterval - (km % brandData.MajorServiceInterval);
            var tireReplacementSoon = (brandData.TireLife - (km % brandData.TireLife)) < 5000;
            var brakePadReplacementSoon = (30000 - (km % 30000)) < 3000;
            var batteryReplacementSoon = age > 3 && (40000 - (km % 40000)) < 5000;

            // Generate insights
            var insights = new List<string>();
            
            if (maintenanceLevel == "Very High")
            {
                insights.Add("⚠️ Very High Maintenance Expected");
                insights.Add("Consider comprehensive inspection before purchase");
            }
            else if (maintenanceLevel == "High")
                insights.Add("🔧 High Maintenance Expected");
            else if (maintenanceLevel == "Moderate")
                insights.Add("⚙️ Moderate Maintenance Expected");
            else
                insights.Add("✅ Low Maintenance Expected");

            if (nextMajorServiceInKm < 2000)
                insights.Add($"🔧 Next major service due in {nextMajorServiceInKm:N0} km");
            else if (nextMajorServiceInKm < 5000)
                insights.Add($"📅 Major service due in {nextMajorServiceInKm:N0} km");

            if (tireReplacementSoon)
                insights.Add("🛞 Tire replacement expected soon");
            if (brakePadReplacementSoon)
                insights.Add("🛑 Brake pad replacement due soon");
            if (batteryReplacementSoon)
                insights.Add("🔋 Battery replacement may be needed");

            if (age > 8)
                insights.Add($"📅 {age}-year-old vehicle - higher maintenance likely");
            if (km > 100000)
                insights.Add($"🛣️ High mileage ({km:N0} km) - increased wear expected");

            if (new[] { "BMW", "Mercedes", "Audi" }.Contains(brand))
                insights.Add("💎 Premium brand - higher service costs");
            else if (new[] { "Maruti", "Tata" }.Contains(brand))
                insights.Add("💰 Budget-friendly maintenance costs");

            return new MaintenanceEstimateResponse
            {
                MonthlyCost = monthlyCost,
                AnnualCost = annualCost,
                MaintenanceLevel = maintenanceLevel,
                NextMajorServiceInKm = nextMajorServiceInKm,
                TireReplacementSoon = tireReplacementSoon,
                BrakePadReplacementSoon = brakePadReplacementSoon,
                BatteryReplacementSoon = batteryReplacementSoon,
                Insights = insights,
                BrandImage = brandData.Image,
                Multiplier = Math.Round(multiplier, 2),
                Age = age,
                Km = km
            };
        }

        private BrandData? GetBrandData(string brand)
        {
            var brandData = new Dictionary<string, BrandData>
            {
                ["Maruti"] = new BrandData { AvgAnnualServiceCost = 15000, MajorServiceInterval = 10000, TireLife = 45000, Image = "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&w=600" },
                ["Hyundai"] = new BrandData { AvgAnnualServiceCost = 18000, MajorServiceInterval = 10000, TireLife = 40000, Image = "https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&w=600" },
                ["Honda"] = new BrandData { AvgAnnualServiceCost = 16000, MajorServiceInterval = 10000, TireLife = 50000, Image = "https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg?auto=compress&w=600" },
                ["Tata"] = new BrandData { AvgAnnualServiceCost = 14000, MajorServiceInterval = 10000, TireLife = 55000, Image = "https://images.pexels.com/photos/1280560/pexels-photo-1280560.jpeg?auto=compress&w=600" },
                ["Toyota"] = new BrandData { AvgAnnualServiceCost = 20000, MajorServiceInterval = 10000, TireLife = 50000, Image = "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&w=600" },
                ["Kia"] = new BrandData { AvgAnnualServiceCost = 19000, MajorServiceInterval = 10000, TireLife = 45000, Image = "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&w=600" },
                ["Mahindra"] = new BrandData { AvgAnnualServiceCost = 17000, MajorServiceInterval = 10000, TireLife = 50000, Image = "https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg?auto=compress&w=600" },
                ["MG"] = new BrandData { AvgAnnualServiceCost = 22000, MajorServiceInterval = 10000, TireLife = 45000, Image = "https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&w=600" },
                ["Renault"] = new BrandData { AvgAnnualServiceCost = 16000, MajorServiceInterval = 10000, TireLife = 40000, Image = "https://images.pexels.com/photos/1280560/pexels-photo-1280560.jpeg?auto=compress&w=600" },
                ["Nissan"] = new BrandData { AvgAnnualServiceCost = 18000, MajorServiceInterval = 10000, TireLife = 45000, Image = "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&w=600" },
                ["Skoda"] = new BrandData { AvgAnnualServiceCost = 25000, MajorServiceInterval = 15000, TireLife = 50000, Image = "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&w=600" },
                ["Volkswagen"] = new BrandData { AvgAnnualServiceCost = 24000, MajorServiceInterval = 15000, TireLife = 50000, Image = "https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg?auto=compress&w=600" },
                ["BMW"] = new BrandData { AvgAnnualServiceCost = 45000, MajorServiceInterval = 15000, TireLife = 40000, Image = "https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&w=600" },
                ["Mercedes"] = new BrandData { AvgAnnualServiceCost = 50000, MajorServiceInterval = 15000, TireLife = 40000, Image = "https://images.pexels.com/photos/1280560/pexels-photo-1280560.jpeg?auto=compress&w=600" },
                ["Audi"] = new BrandData { AvgAnnualServiceCost = 42000, MajorServiceInterval = 15000, TireLife = 40000, Image = "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&w=600" }
            };

            return brandData.FirstOrDefault(x => brand.Contains(x.Key, StringComparison.OrdinalIgnoreCase)).Value;
        }

        private double GetConditionMultiplier(int age, int km)
        {
            double multiplier = 1.0;
            
            // Age-based adjustments
            if (age > 10) multiplier += 0.6;
            else if (age > 8) multiplier += 0.4;
            else if (age > 6) multiplier += 0.3;
            else if (age > 4) multiplier += 0.2;
            else if (age > 2) multiplier += 0.1;
            
            // Mileage-based adjustments
            if (km > 150000) multiplier += 0.5;
            else if (km > 120000) multiplier += 0.4;
            else if (km > 100000) multiplier += 0.3;
            else if (km > 80000) multiplier += 0.2;
            else if (km > 60000) multiplier += 0.1;
            
            // Combined high-risk assessment
            if (age > 8 && km > 100000) multiplier += 0.2;
            if (age > 10 && km > 120000) multiplier += 0.3;
            
            return Math.Min(multiplier, 2.0);
        }
    }

    public class BrandData
    {
        public int AvgAnnualServiceCost { get; set; }
        public int MajorServiceInterval { get; set; }
        public int TireLife { get; set; }
        public string Image { get; set; } = string.Empty;
    }
}