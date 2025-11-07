using cars24Api.Models;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Text.RegularExpressions;

namespace cars24Api.Services
{
    public class CarService
    {
        private readonly IMongoCollection<Car> _cars;
        public CarService(IConfiguration config)
        {
            var client = new MongoClient(config.GetConnectionString("Cars24DB"));
            // Use database name from config - "Cars24DB"
            var databaseName = config["MongoDB:DatabaseName"] ?? "Cars24DB";
            var database = client.GetDatabase(databaseName);
            _cars = database.GetCollection<Car>("Cars");
            
            // Log database info for debugging
            Console.WriteLine($"CarService initialized - Database: {databaseName}, Collection: Cars");
        }
        public async Task<List<Car>> GetAllAsync() =>
            await _cars.Find(_ => true).ToListAsync();
        public async Task<Car?> GetByIdAsync(string id)
        {
            return await _cars.Find(u => u.Id == id).FirstOrDefaultAsync();
        }
        public async Task CreateAsync(Car car) =>
            await _cars.InsertOneAsync(car);

        public async Task UpdateAsync(string id, Car car)
        {
            await _cars.ReplaceOneAsync(c => c.Id == id, car);
        }

        public async Task<Car?> GetByIdAsyncWithPriceTracking(string id)
        {
            return await _cars.Find(u => u.Id == id).FirstOrDefaultAsync();
        }

        // Calculate relevance score for a car based on search query
        private double CalculateRelevanceScore(Car car, string searchQuery, string? fuelType, string? transmission, int? minYear, int? maxYear, int? minMileage, int? maxMileage)
        {
            double score = 0;
            var queryLower = searchQuery.ToLower();
            var titleLower = car.Title.ToLower();
            
            // Exact title match (highest priority)
            if (titleLower == queryLower)
                score += 100;
            // Title starts with query
            else if (titleLower.StartsWith(queryLower))
                score += 80;
            // Title contains query
            else if (titleLower.Contains(queryLower))
                score += 60;
            // Fuzzy matching - check if query words appear in title
            else
            {
                var queryWords = queryLower.Split(' ', StringSplitOptions.RemoveEmptyEntries);
                var matchedWords = queryWords.Count(word => titleLower.Contains(word));
                score += matchedWords * 20;
            }

            // Check highlights and features
            if (car.Highlights != null)
            {
                foreach (var highlight in car.Highlights)
                {
                    if (highlight.ToLower().Contains(queryLower))
                        score += 15;
                }
            }
            if (car.Features != null)
            {
                foreach (var feature in car.Features)
                {
                    if (feature.ToLower().Contains(queryLower))
                        score += 10;
                }
            }

            // Location matching
            if (car.Location.ToLower().Contains(queryLower))
                score += 5;

            // Filter matching bonuses
            if (!string.IsNullOrEmpty(fuelType) && car.Specs.Fuel.Equals(fuelType, StringComparison.OrdinalIgnoreCase))
                score += 10;
            if (!string.IsNullOrEmpty(transmission) && car.Specs.Transmission.Equals(transmission, StringComparison.OrdinalIgnoreCase))
                score += 10;
            if (minYear.HasValue && car.Specs.Year >= minYear.Value)
                score += 5;
            if (maxYear.HasValue && car.Specs.Year <= maxYear.Value)
                score += 5;

            // Mileage range matching
            if (minMileage.HasValue || maxMileage.HasValue)
            {
                if (int.TryParse(car.Specs.Km.Replace(",", "").Replace(" km", "").Trim(), out int mileage))
                {
                    if (minMileage.HasValue && mileage >= minMileage.Value)
                        score += 5;
                    if (maxMileage.HasValue && mileage <= maxMileage.Value)
                        score += 5;
                }
            }

            return score;
        }

        // Fuzzy matching helper
        private bool FuzzyMatch(string text, string query, int maxDistance = 2)
        {
            if (string.IsNullOrEmpty(query)) return true;
            if (string.IsNullOrEmpty(text)) return false;

            var textLower = text.ToLower();
            var queryLower = query.ToLower();

            // Exact match
            if (textLower.Contains(queryLower))
                return true;

            // Check if all query characters appear in order in text
            int queryIndex = 0;
            foreach (char c in textLower)
            {
                if (queryIndex < queryLower.Length && c == queryLower[queryIndex])
                    queryIndex++;
            }
            if (queryIndex == queryLower.Length)
                return true;

            // Simple Levenshtein-like check for short queries
            if (queryLower.Length <= 3)
            {
                int distance = 0;
                for (int i = 0; i < Math.Min(textLower.Length, queryLower.Length); i++)
                {
                    if (textLower[i] != queryLower[i])
                        distance++;
                }
                return distance <= maxDistance;
            }

            return false;
        }

        public async Task<List<CarSearchResult>> SearchAsync(
            string? searchQuery = null,
            string? fuelType = null,
            string? transmission = null,
            int? minYear = null,
            int? maxYear = null,
            int? minMileage = null,
            int? maxMileage = null,
            decimal? minPrice = null,
            decimal? maxPrice = null,
            string? location = null,
            int skip = 0,
            int limit = 50)
        {
            var filterBuilder = Builders<Car>.Filter;
            var filters = new List<FilterDefinition<Car>>();

            // Text search with fuzzy matching
            if (!string.IsNullOrWhiteSpace(searchQuery))
            {
                var searchLower = searchQuery.ToLower();
                var titleFilter = filterBuilder.Regex(c => c.Title, new BsonRegularExpression(searchLower, "i"));
                var locationFilter = filterBuilder.Regex(c => c.Location, new BsonRegularExpression(searchLower, "i"));
                var textFilter = filterBuilder.Or(titleFilter, locationFilter);
                filters.Add(textFilter);
            }

            // Fuel type filter
            if (!string.IsNullOrWhiteSpace(fuelType))
            {
                filters.Add(filterBuilder.Eq(c => c.Specs.Fuel, fuelType));
            }

            // Transmission filter
            if (!string.IsNullOrWhiteSpace(transmission))
            {
                filters.Add(filterBuilder.Eq(c => c.Specs.Transmission, transmission));
            }

            // Year range filter
            if (minYear.HasValue)
            {
                filters.Add(filterBuilder.Gte(c => c.Specs.Year, minYear.Value));
            }
            if (maxYear.HasValue)
            {
                filters.Add(filterBuilder.Lte(c => c.Specs.Year, maxYear.Value));
            }

            // Location filter
            if (!string.IsNullOrWhiteSpace(location))
            {
                filters.Add(filterBuilder.Regex(c => c.Location, new BsonRegularExpression(location, "i")));
            }

            // Build combined filter
            var combinedFilter = filters.Count > 0 
                ? filterBuilder.And(filters) 
                : filterBuilder.Empty;

            // Get all matching cars
            var cars = await _cars.Find(combinedFilter).ToListAsync();

            // Apply price and mileage filters (these need parsing)
            var filteredCars = cars.Where(car =>
            {
                // Price filter
                if (minPrice.HasValue || maxPrice.HasValue)
                {
                    var priceStr = car.Price.Replace(",", "").Replace("₹", "").Replace("$", "").Replace("lakh", "").Trim();
                    if (decimal.TryParse(priceStr, out decimal price))
                    {
                        // Convert to actual value (if in lakhs, multiply by 100000)
                        if (car.Price.Contains("lakh"))
                            price *= 100000;

                        if (minPrice.HasValue && price < minPrice.Value)
                            return false;
                        if (maxPrice.HasValue && price > maxPrice.Value)
                            return false;
                    }
                }

                // Mileage filter
                if (minMileage.HasValue || maxMileage.HasValue)
                {
                    var kmStr = car.Specs.Km.Replace(",", "").Replace(" km", "").Trim();
                    if (int.TryParse(kmStr, out int mileage))
                    {
                        if (minMileage.HasValue && mileage < minMileage.Value)
                            return false;
                        if (maxMileage.HasValue && mileage > maxMileage.Value)
                            return false;
                    }
                }

                return true;
            }).ToList();

            // Calculate relevance scores and sort
            var results = filteredCars.Select(car => new CarSearchResult
            {
                Car = car,
                RelevanceScore = CalculateRelevanceScore(car, searchQuery ?? "", fuelType, transmission, minYear, maxYear, minMileage, maxMileage)
            })
            .OrderByDescending(r => r.RelevanceScore)
            .Skip(skip)
            .Take(limit)
            .ToList();

            return results;
        }

        public async Task<List<string>> GetSuggestionsAsync(string query, int limit = 10)
        {
            if (string.IsNullOrWhiteSpace(query) || query.Length < 2)
                return new List<string>();

            var queryLower = query.ToLower();
            var allCars = await _cars.Find(_ => true).ToListAsync();

            var suggestions = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            foreach (var car in allCars)
            {
                // Extract brand/model from title (e.g., "2023 Maruti FRONX" -> "Maruti", "FRONX")
                var titleWords = car.Title.Split(' ', StringSplitOptions.RemoveEmptyEntries);
                foreach (var word in titleWords)
                {
                    var wordLower = word.ToLower();
                    if (wordLower.StartsWith(queryLower) && word.Length >= 3)
                    {
                        suggestions.Add(word);
                    }
                }

                // Add location suggestions
                if (car.Location.ToLower().Contains(queryLower))
                {
                    var locationParts = car.Location.Split(',');
                    foreach (var part in locationParts)
                    {
                        var trimmed = part.Trim();
                        if (trimmed.ToLower().StartsWith(queryLower) && trimmed.Length >= 3)
                        {
                            suggestions.Add(trimmed);
                        }
                    }
                }

                if (suggestions.Count >= limit)
                    break;
            }

            return suggestions.Take(limit).ToList();
        }
    }

    public class CarSearchResult
    {
        public Car Car { get; set; } = null!;
        public double RelevanceScore { get; set; }
    }
}