using Microsoft.AspNetCore.Mvc;
using Cars24Api.Models;
using Cars24Api.Services;


namespace Cars24Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CarController : ControllerBase
    {
        private readonly CarService _carservice;
        public CarController(CarService carService)
        {
            _carservice = carService;
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
                image = car.Images?.FirstOrDefault() ?? "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg",
                Images = car.Images // Include the full Images array for debugging
            });
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Car car)
        {
            if (car == null)
            {
                return BadRequest("Car data is required");
            }
            
            // Debug logging
            Console.WriteLine($"🚗 BACKEND: Creating car '{car.Title}'");
            Console.WriteLine($"🚗 BACKEND: Images count: {car.Images?.Count ?? 0}");
            if (car.Images?.Count > 0)
            {
                Console.WriteLine($"🚗 BACKEND: First image: {car.Images[0]?.Substring(0, Math.Min(50, car.Images[0]?.Length ?? 0))}...");
            }
            
            await _carservice.CreateAsync(car);
            return CreatedAtAction(nameof(GetById), new { id = car.Id }, car);
        }
    }
}
