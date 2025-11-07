using Microsoft.AspNetCore.Mvc;
using cars24Api.Models;
using cars24Api.Services;


namespace cars24Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingController : ControllerBase
    {
        private readonly BookingService _bookingService;
        private readonly UserService _userService;
        private readonly CarService _carService;
        private readonly NotificationService _notificationService;
        public class bookingDto
        {
            public required Booking Booking { get; set; }
            public Car? Car { get; set; }
        }
        public BookingController(BookingService bookingService, UserService userService, CarService carService, NotificationService notificationService)
        {
            _bookingService = bookingService;
            _userService = userService;
            _carService = carService;
            _notificationService = notificationService;
        }
        [HttpPost]
        public async Task<IActionResult> CreateAppointment([FromQuery] string userId, [FromBody] Booking booking)
        {
            if (booking == null || string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(booking.CarId))
                return BadRequest("Userid and carid is not present");

            await _bookingService.CreateAsync(booking);
            var user = await _userService.GetByIdAsync(userId);
            if (user == null)
                return NotFound("User not found");
            if (user.BookingId == null)
            {
                user.BookingId = new List<string>();
            }
            if (booking.Id != null)
            {
                user.BookingId.Add(booking.Id);
            }
            if (user.Id == null)
                return BadRequest("User ID is missing");
            await _userService.UpdateAsync(user.Id, user);

            // Send notification for booking creation
            var car = await _carService.GetByIdAsync(booking.CarId);
            var carTitle = car?.Title ?? "your car";
            await _notificationService.SendNotificationAsync(
                userId,
                "Booking Created",
                $"Your booking for {carTitle} has been created. Preferred date: {booking.PreferredDate} at {booking.PreferredTime}",
                "appointment",
                booking.Id,
                new Dictionary<string, string>
                {
                    { "carId", booking.CarId },
                    { "carTitle", carTitle }
                }
            );

            return CreatedAtAction(nameof(GetbookingById), new { id = booking.Id }, booking);
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetbookingById(string id)
        {
            var booking = await _bookingService.GetByIdAsynch(id);
            if (booking == null)
                return NotFound();
            return Ok(booking);
        }
        [HttpGet("user/{userId}/bookings")]
        public async Task<IActionResult> GetbookingByUserId(string userId)
        {
            var user = await _userService.GetByIdAsync(userId);
            if (user == null)
                return NotFound();
            var results = new List<bookingDto>();
            foreach (var bookingid in user.BookingId)
            {
                var booking = await _bookingService.GetByIdAsynch(bookingid);
                if (booking != null && !string.IsNullOrEmpty(booking.CarId))
                {
                    var car = await _carService.GetByIdAsync(booking.CarId);
                    results.Add(new bookingDto
                    {
                        Booking = booking,
                        Car = car
                    });
                }
            }
            return Ok(results);
        }
    }
}