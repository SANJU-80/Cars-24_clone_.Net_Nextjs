using Microsoft.AspNetCore.Mvc;
using cars24Api.Models;
using cars24Api.Services;


namespace cars24Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CarController : ControllerBase
    {
        private readonly CarService _carservice;
        private readonly NotificationService _notificationService;
        private readonly UserService _userService;
        public CarController(CarService carService, NotificationService notificationService, UserService userService)
        {
            _carservice = carService;
            _notificationService = notificationService;
            _userService = userService;
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var car = await _carservice.GetByIdAsync(id);
            if (car == null)
            {
                return NotFound();
            }
            return Ok(car);
        }
        [HttpGet("summaries")]
        public async Task<IActionResult> GetCarsummaries()
        {
            var cars = await _carservice.GetAllAsync();
            var result = cars.Select(car => new
            {
                car.Id,
                car.Title,
                km = car.Specs.Km,
                Fuel = car.Specs.Fuel,
                Transmission = car.Specs.Transmission,
                Owner = car.Specs.Owner,
                car.Emi,
                car.Price,
                car.Location,
                image = car.Images
            });
            return Ok(result);
        }

        [HttpGet("search")]
        public async Task<IActionResult> Search(
            [FromQuery] string? query = null,
            [FromQuery] string? fuelType = null,
            [FromQuery] string? transmission = null,
            [FromQuery] int? minYear = null,
            [FromQuery] int? maxYear = null,
            [FromQuery] int? minMileage = null,
            [FromQuery] int? maxMileage = null,
            [FromQuery] decimal? minPrice = null,
            [FromQuery] decimal? maxPrice = null,
            [FromQuery] string? location = null,
            [FromQuery] int skip = 0,
            [FromQuery] int limit = 50)
        {
            try
            {
                var results = await _carservice.SearchAsync(
                    searchQuery: query,
                    fuelType: fuelType,
                    transmission: transmission,
                    minYear: minYear,
                    maxYear: maxYear,
                    minMileage: minMileage,
                    maxMileage: maxMileage,
                    minPrice: minPrice,
                    maxPrice: maxPrice,
                    location: location,
                    skip: skip,
                    limit: limit
                );

                var response = results.Select(r => new
                {
                    Id = r.Car.Id,
                    Title = r.Car.Title,
                    km = r.Car.Specs.Km,
                    Fuel = r.Car.Specs.Fuel,
                    Transmission = r.Car.Specs.Transmission,
                    Owner = r.Car.Specs.Owner,
                    Emi = r.Car.Emi,
                    Price = r.Car.Price,
                    Location = r.Car.Location,
                    image = r.Car.Images,
                    Year = r.Car.Specs.Year,
                    RelevanceScore = r.RelevanceScore
                });

                return Ok(new
                {
                    results = response,
                    total = results.Count,
                    query = query,
                    filters = new
                    {
                        fuelType,
                        transmission,
                        minYear,
                        maxYear,
                        minMileage,
                        maxMileage,
                        minPrice,
                        maxPrice,
                        location
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Search failed", error = ex.Message });
            }
        }

        [HttpGet("suggestions")]
        public async Task<IActionResult> GetSuggestions([FromQuery] string query, [FromQuery] int limit = 10)
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return Ok(new List<string>());
            }

            try
            {
                var suggestions = await _carservice.GetSuggestionsAsync(query, limit);
                return Ok(suggestions);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to get suggestions", error = ex.Message });
            }
        }
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Car car)
        {
            if (car == null)
            {
                return BadRequest("Car data is required");
            }
            
            try
            {
                Console.WriteLine("=== Saving Car to MongoDB ===");
                Console.WriteLine($"Title: {car.Title}");
                Console.WriteLine($"Price: {car.Price}");
                Console.WriteLine($"Location: {car.Location}");
                Console.WriteLine($"Database: Cars24DB, Collection: Cars");
                
                await _carservice.CreateAsync(car);
                
                Console.WriteLine($"=== Car Saved Successfully ===");
                Console.WriteLine($"Car ID: {car.Id}");
                Console.WriteLine($"Database: Cars24DB");
                Console.WriteLine($"Collection: Cars");
                
                return CreatedAtAction(nameof(GetById), new { id = car.Id }, new 
                { 
                    message = "Car saved to MongoDB successfully",
                    carId = car.Id,
                    database = "Cars24DB",
                    collection = "Cars",
                    saved = true
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error saving car: {ex.Message}");
                return StatusCode(500, new { message = "Failed to save car", error = ex.Message });
            }
        }
        
        // Endpoint to check if cars exist in database
        [HttpGet("check-database")]
        public async Task<IActionResult> CheckDatabase()
        {
            try
            {
                var cars = await _carservice.GetAllAsync();
                return Ok(new 
                { 
                    message = "Database check successful",
                    database = "Cars24DB",
                    collection = "Cars",
                    totalCars = cars.Count,
                    cars = cars.Select(c => new 
                    {
                        c.Id,
                        c.Title,
                        c.Price,
                        c.Location,
                        hasImages = c.Images != null && c.Images.Count > 0
                    }).ToList()
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Database check failed", error = ex.Message });
            }
        }

        // Update car price and notify users if price dropped
        [HttpPut("{id}/price")]
        public async Task<IActionResult> UpdatePrice(string id, [FromBody] UpdatePriceRequest request)
        {
            var car = await _carservice.GetByIdAsync(id);
            if (car == null)
                return NotFound("Car not found");

            // Parse prices (remove commas and currency symbols)
            var oldPriceStr = car.Price.Replace(",", "").Replace("₹", "").Replace("$", "").Trim();
            var newPriceStr = request.Price.Replace(",", "").Replace("₹", "").Replace("$", "").Trim();

            if (int.TryParse(oldPriceStr, out int oldPrice) && int.TryParse(newPriceStr, out int newPrice))
            {
                // Check if price dropped
                if (newPrice < oldPrice)
                {
                    // Find users who have appointments or bookings for this car
                    var allUsers = await _userService.GetAllAsync();
                    var interestedUsers = allUsers.Where(u =>
                        (u.AppointmentId != null && u.AppointmentId.Any()) ||
                        (u.BookingId != null && u.BookingId.Any())
                    ).ToList();

                    // For each user, check if they have appointments/bookings for this car
                    foreach (var user in interestedUsers)
                    {
                        bool hasInterest = false;
                        
                        if (user.AppointmentId != null)
                        {
                            // Check appointments (would need AppointmentService here, but for now we'll notify all)
                            hasInterest = true;
                        }
                        
                        if (user.BookingId != null)
                        {
                            // Check bookings (would need BookingService here, but for now we'll notify all)
                            hasInterest = true;
                        }

                        if (hasInterest && user.Id != null)
                        {
                            var priceDrop = oldPrice - newPrice;
                            var priceDropPercent = Math.Round((double)priceDrop / oldPrice * 100, 1);
                            
                            await _notificationService.SendNotificationAsync(
                                user.Id,
                                "Price Drop Alert! 🎉",
                                $"{car.Title} price dropped by ₹{priceDrop:N0} ({priceDropPercent}%)! New price: ₹{newPrice:N0}",
                                "price_drop",
                                car.Id,
                                new Dictionary<string, string>
                                {
                                    { "carId", car.Id ?? "" },
                                    { "carTitle", car.Title },
                                    { "oldPrice", oldPrice.ToString() },
                                    { "newPrice", newPrice.ToString() },
                                    { "priceDrop", priceDrop.ToString() }
                                }
                            );
                        }
                    }
                }
            }

            // Update car price
            car.Price = request.Price;
            await _carservice.UpdateAsync(id, car);

            return Ok(new { message = "Price updated successfully", car });
        }
    }

    public class UpdatePriceRequest
    {
        public string Price { get; set; } = string.Empty;
    }
}
