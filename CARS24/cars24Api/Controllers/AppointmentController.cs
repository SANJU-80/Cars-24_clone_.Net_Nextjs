using Microsoft.AspNetCore.Mvc;
using cars24Api.Models;
using cars24Api.Services;


namespace cars24Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AppointmentController : ControllerBase
    {
        private readonly AppointmentService _appointmentService;
        private readonly UserService _userService;
        private readonly CarService _carService;
        private readonly NotificationService _notificationService;
        public class AppointmentDto
        {
            public required Appointment Appointment { get; set; }
            public Car? Car { get; set; }
        }
        public AppointmentController(AppointmentService appointmentService, UserService userService, CarService carService, NotificationService notificationService)
        {
            _appointmentService = appointmentService;
            _userService = userService;
            _carService = carService;
            _notificationService = notificationService;
        }
        [HttpPost]
        public async Task<IActionResult> CreateAppointment([FromQuery] string userId, [FromBody] Appointment appointment)
        {
            if (appointment == null || string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(appointment.CarId))
                return BadRequest("Userid and carid is not present");

            await _appointmentService.CreateAsync(appointment);
            var user = await _userService.GetByIdAsync(userId);
            if (user == null)
                return NotFound("User not found");
            if (user.AppointmentId == null)
            {
                user.AppointmentId = new List<string>();
            }
            if (appointment.Id != null)
            {
                user.AppointmentId.Add(appointment.Id);
            }
            if (user.Id == null)
                return BadRequest("User ID is missing");
            await _userService.UpdateAsync(user.Id, user);

            // Send notification for appointment creation
            var car = await _carService.GetByIdAsync(appointment.CarId);
            var carTitle = car?.Title ?? "your car";
            await _notificationService.SendNotificationAsync(
                userId,
                "Appointment Created",
                $"Your appointment for {carTitle} has been scheduled for {appointment.ScheduledDate} at {appointment.ScheduledTime}",
                "appointment",
                appointment.Id,
                new Dictionary<string, string>
                {
                    { "carId", appointment.CarId ?? "" },
                    { "carTitle", carTitle }
                }
            );

            return CreatedAtAction(nameof(GetAppointmentById), new { id = appointment.Id }, appointment);
        }

        // Update appointment status (for confirmations)
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateAppointmentStatus(string id, [FromQuery] string userId, [FromBody] UpdateStatusRequest request)
        {
            var appointment = await _appointmentService.GetByIdAsynch(id);
            if (appointment == null)
                return NotFound("Appointment not found");

            var oldStatus = appointment.Status;
            appointment.Status = request.Status;
            
            // Update appointment in database
            await _appointmentService.UpdateAsync(id, appointment);
            
            // Send notification if status changed to confirmed
            if (request.Status.ToLower() == "confirmed" && oldStatus.ToLower() != "confirmed")
            {
                var car = !string.IsNullOrEmpty(appointment.CarId) 
                    ? await _carService.GetByIdAsync(appointment.CarId) 
                    : null;
                var carTitle = car?.Title ?? "your car";
                await _notificationService.SendNotificationAsync(
                    userId,
                    "Appointment Confirmed",
                    $"Your appointment for {carTitle} on {appointment.ScheduledDate} at {appointment.ScheduledTime} has been confirmed!",
                    "appointment",
                    appointment.Id,
                    new Dictionary<string, string>
                    {
                        { "carId", appointment.CarId ?? "" },
                        { "carTitle", carTitle },
                        { "status", "confirmed" }
                    }
                );
            }

            return Ok(new { message = "Status updated", appointment });
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetAppointmentById(string id)
        {
            var appointment = await _appointmentService.GetByIdAsynch(id);
            if (appointment == null)
                return NotFound();
            return Ok(appointment);
        }
        [HttpGet("user/{userId}/appointments")]
        public async Task<IActionResult> GetAppointmentByUserId(string userId)
        {
            var user = await _userService.GetByIdAsync(userId);
            if (user == null)
                return NotFound();
            var results = new List<AppointmentDto>();
            foreach (var appointmentid in user.AppointmentId)
            {
                var appointment = await _appointmentService.GetByIdAsynch(appointmentid);
                if (appointment != null && !string.IsNullOrEmpty(appointment.CarId))
                {
                    var car = await _carService.GetByIdAsync(appointment.CarId);
                    results.Add(new AppointmentDto
                    {
                        Appointment = appointment,
                        Car = car
                    });
                }
            }
            return Ok(results);
        }
    }

    public class UpdateStatusRequest
    {
        public string Status { get; set; } = string.Empty;
    }
}