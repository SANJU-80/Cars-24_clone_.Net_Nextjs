using Cars24Api.Models;
using Cars24Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Cars24Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotificationController : ControllerBase
{
    private readonly NotificationService _notificationService;

    public NotificationController(NotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpPost("send")]
    public async Task<ActionResult<Notification>> SendNotification([FromBody] NotificationRequest request)
    {
        try
        {
            if (string.IsNullOrEmpty(request.UserId) || string.IsNullOrEmpty(request.Title) || string.IsNullOrEmpty(request.Body))
            {
                return BadRequest("UserId, Title, and Body are required");
            }

            var notification = await _notificationService.SendNotificationAsync(request);
            
            if (notification == null)
            {
                return Ok(new { message = "Notification not sent due to user preferences or quiet hours" });
            }

            return Ok(notification);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPost("send-bulk")]
    public async Task<ActionResult<List<Notification>>> SendBulkNotification([FromBody] BulkNotificationRequest request)
    {
        try
        {
            if (!request.UserIds.Any() || string.IsNullOrEmpty(request.Title) || string.IsNullOrEmpty(request.Body))
            {
                return BadRequest("UserIds, Title, and Body are required");
            }

            var notifications = await _notificationService.SendBulkNotificationAsync(request);
            return Ok(notifications);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPost("send-template/{templateType}")]
    public async Task<ActionResult<Notification>> SendTemplateNotification(
        string templateType, 
        [FromBody] Dictionary<string, string> variables)
    {
        try
        {
            var userId = variables.GetValueOrDefault("userId");
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest("userId is required in variables");
            }

            var notification = await _notificationService.SendTemplateNotificationAsync(userId, templateType, variables);
            return Ok(notification);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<List<Notification>>> GetUserNotifications(
        string userId, 
        [FromQuery] int page = 1, 
        [FromQuery] int pageSize = 20)
    {
        try
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 20;

            var notifications = await _notificationService.GetUserNotificationsAsync(userId, page, pageSize);
            return Ok(notifications);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("user/{userId}/unread-count")]
    public async Task<ActionResult<int>> GetUnreadCount(string userId)
    {
        try
        {
            var count = await _notificationService.GetUnreadCountAsync(userId);
            return Ok(count);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPut("{notificationId}/read")]
    public async Task<ActionResult<Notification>> MarkAsRead(string notificationId, [FromQuery] string userId)
    {
        try
        {
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest("userId is required");
            }

            var notification = await _notificationService.MarkAsReadAsync(notificationId, userId);
            
            if (notification == null)
            {
                return NotFound("Notification not found or already marked as read");
            }

            return Ok(notification);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPut("{notificationId}/clicked")]
    public async Task<ActionResult<Notification>> MarkAsClicked(string notificationId, [FromQuery] string userId)
    {
        try
        {
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest("userId is required");
            }

            var notification = await _notificationService.MarkAsClickedAsync(notificationId, userId);
            
            if (notification == null)
            {
                return NotFound("Notification not found");
            }

            return Ok(notification);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("preferences/{userId}")]
    public async Task<ActionResult<UserNotificationPreferences>> GetUserPreferences(string userId)
    {
        try
        {
            var preferences = await _notificationService.GetUserPreferencesAsync(userId);
            return Ok(preferences);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPut("preferences/{userId}")]
    public async Task<ActionResult<UserNotificationPreferences>> UpdateUserPreferences(
        string userId, 
        [FromBody] UserNotificationPreferences preferences)
    {
        try
        {
            var updatedPreferences = await _notificationService.UpdateUserPreferencesAsync(userId, preferences);
            return Ok(updatedPreferences);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPost("fcm-token")]
    public async Task<ActionResult<string>> RegisterFCMToken([FromBody] FCMTokenRequest request)
    {
        try
        {
            if (string.IsNullOrEmpty(request.UserId) || string.IsNullOrEmpty(request.Token))
            {
                return BadRequest("UserId and Token are required");
            }

            var tokenId = await _notificationService.RegisterFCMTokenAsync(
                request.UserId, 
                request.Token, 
                request.DeviceType ?? "web",
                request.DeviceId,
                request.UserAgent);

            return Ok(new { tokenId });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpDelete("fcm-token")]
    public async Task<ActionResult> UnregisterFCMToken([FromBody] FCMTokenUnregisterRequest request)
    {
        try
        {
            if (string.IsNullOrEmpty(request.Token))
            {
                return BadRequest("Token is required");
            }

            var success = await _notificationService.UnregisterFCMTokenAsync(request.Token);
            
            if (!success)
            {
                return NotFound("Token not found");
            }

            return Ok(new { message = "Token unregistered successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("stats")]
    public async Task<ActionResult<NotificationStats>> GetNotificationStats(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            var stats = await _notificationService.GetNotificationStatsAsync(startDate, endDate);
            return Ok(stats);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    // Specialized notification endpoints for specific events
    [HttpPost("appointment-confirmation")]
    public async Task<ActionResult<Notification>> SendAppointmentConfirmation([FromBody] AppointmentConfirmationRequest request)
    {
        try
        {
            var variables = new Dictionary<string, string>
            {
                { "userId", request.UserId },
                { "carTitle", request.CarTitle },
                { "appointmentDate", request.AppointmentDate.ToString("MMM dd, yyyy") },
                { "appointmentTime", request.AppointmentTime.ToString("hh:mm tt") },
                { "appointmentId", request.AppointmentId }
            };

            var notification = await _notificationService.SendTemplateNotificationAsync(
                request.UserId, 
                "appointment_confirmation", 
                variables);

            return Ok(notification);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPost("price-drop")]
    public async Task<ActionResult<Notification>> SendPriceDropNotification([FromBody] PriceDropRequest request)
    {
        try
        {
            var variables = new Dictionary<string, string>
            {
                { "userId", request.UserId },
                { "carTitle", request.CarTitle },
                { "oldPrice", request.OldPrice.ToString("N0") },
                { "newPrice", request.NewPrice.ToString("N0") },
                { "carId", request.CarId }
            };

            var notification = await _notificationService.SendTemplateNotificationAsync(
                request.UserId, 
                "price_drop", 
                variables);

            return Ok(notification);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPost("bid-update")]
    public async Task<ActionResult<Notification>> SendBidUpdate([FromBody] BidUpdateRequest request)
    {
        try
        {
            var variables = new Dictionary<string, string>
            {
                { "userId", request.UserId },
                { "bidAmount", request.BidAmount.ToString("N0") },
                { "carTitle", request.CarTitle },
                { "bidStatus", request.BidStatus },
                { "carId", request.CarId }
            };

            var notification = await _notificationService.SendTemplateNotificationAsync(
                request.UserId, 
                "bid_update", 
                variables);

            return Ok(notification);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
}

// Request models for specialized notifications
public class FCMTokenRequest
{
    public string UserId { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public string? DeviceType { get; set; }
    public string? DeviceId { get; set; }
    public string? UserAgent { get; set; }
}

public class FCMTokenUnregisterRequest
{
    public string Token { get; set; } = string.Empty;
}

public class AppointmentConfirmationRequest
{
    public string UserId { get; set; } = string.Empty;
    public string CarTitle { get; set; } = string.Empty;
    public DateTime AppointmentDate { get; set; }
    public TimeSpan AppointmentTime { get; set; }
    public string AppointmentId { get; set; } = string.Empty;
}

public class PriceDropRequest
{
    public string UserId { get; set; } = string.Empty;
    public string CarTitle { get; set; } = string.Empty;
    public decimal OldPrice { get; set; }
    public decimal NewPrice { get; set; }
    public string CarId { get; set; } = string.Empty;
}

public class BidUpdateRequest
{
    public string UserId { get; set; } = string.Empty;
    public decimal BidAmount { get; set; }
    public string CarTitle { get; set; } = string.Empty;
    public string BidStatus { get; set; } = string.Empty; // accepted, rejected, outbid
    public string CarId { get; set; } = string.Empty;
}
