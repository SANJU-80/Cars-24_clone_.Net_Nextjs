using Microsoft.AspNetCore.Mvc;
using cars24Api.Services;

namespace cars24Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationController : ControllerBase
    {
        private readonly NotificationService _notificationService;
        private readonly UserService _userService;

        public NotificationController(NotificationService notificationService, UserService userService)
        {
            _notificationService = notificationService;
            _userService = userService;
        }

        // Register FCM token for a user
        [HttpPost("register-token")]
        public async Task<IActionResult> RegisterToken([FromQuery] string userId, [FromBody] RegisterTokenRequest request)
        {
            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(request.Token))
                return BadRequest("UserId and Token are required");

            var user = await _userService.GetByIdAsync(userId);
            if (user == null)
                return NotFound("User not found");

            if (user.FcmTokens == null)
                user.FcmTokens = new List<string>();

            if (!user.FcmTokens.Contains(request.Token))
            {
                user.FcmTokens.Add(request.Token);
                await _userService.UpdateAsync(userId, user);
            }

            return Ok(new { message = "Token registered successfully" });
        }

        // Remove FCM token for a user
        [HttpPost("remove-token")]
        public async Task<IActionResult> RemoveToken([FromQuery] string userId, [FromBody] RegisterTokenRequest request)
        {
            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(request.Token))
                return BadRequest("UserId and Token are required");

            var user = await _userService.GetByIdAsync(userId);
            if (user == null)
                return NotFound("User not found");

            if (user.FcmTokens != null && user.FcmTokens.Contains(request.Token))
            {
                user.FcmTokens.Remove(request.Token);
                await _userService.UpdateAsync(userId, user);
            }

            return Ok(new { message = "Token removed successfully" });
        }

        // Get user notifications
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserNotifications(string userId, [FromQuery] int limit = 50)
        {
            var notifications = await _notificationService.GetUserNotificationsAsync(userId, limit);
            return Ok(notifications);
        }

        // Get unread count
        [HttpGet("user/{userId}/unread-count")]
        public async Task<IActionResult> GetUnreadCount(string userId)
        {
            var count = await _notificationService.GetUnreadCountAsync(userId);
            return Ok(new { count });
        }

        // Mark notification as read
        [HttpPost("{notificationId}/read")]
        public async Task<IActionResult> MarkAsRead(string notificationId, [FromQuery] string userId)
        {
            await _notificationService.MarkAsReadAsync(notificationId, userId);
            return Ok(new { message = "Notification marked as read" });
        }

        // Mark all notifications as read
        [HttpPost("user/{userId}/read-all")]
        public async Task<IActionResult> MarkAllAsRead(string userId)
        {
            await _notificationService.MarkAllAsReadAsync(userId);
            return Ok(new { message = "All notifications marked as read" });
        }

        // Update notification preferences
        [HttpPut("user/{userId}/preferences")]
        public async Task<IActionResult> UpdatePreferences(string userId, [FromBody] Models.NotificationPreferences preferences)
        {
            var user = await _userService.GetByIdAsync(userId);
            if (user == null)
                return NotFound("User not found");

            user.NotificationPreferences = preferences;
            await _userService.UpdateAsync(userId, user);

            return Ok(new { message = "Preferences updated successfully", preferences });
        }

        // Get notification preferences
        [HttpGet("user/{userId}/preferences")]
        public async Task<IActionResult> GetPreferences(string userId)
        {
            var user = await _userService.GetByIdAsync(userId);
            if (user == null)
                return NotFound("User not found");

            return Ok(user.NotificationPreferences ?? new Models.NotificationPreferences());
        }
    }

    public class RegisterTokenRequest
    {
        public string Token { get; set; } = string.Empty;
    }
}

