using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace Cars24Api.Models;

public class Notification
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }
    
    public string UserId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // appointment, bid, price_drop, message, system
    public string Priority { get; set; } = string.Empty; // low, normal, high, urgent
    
    // Related entity information
    public string? RelatedEntityId { get; set; } // Car ID, Appointment ID, etc.
    public string? RelatedEntityType { get; set; } // car, appointment, booking, message
    
    // Notification data
    public Dictionary<string, string> Data { get; set; } = new Dictionary<string, string>();
    public string? ImageUrl { get; set; }
    public string? ActionUrl { get; set; } // Deep link or URL to navigate to
    
    // Status tracking
    public bool IsRead { get; set; } = false;
    public bool IsDelivered { get; set; } = false;
    public bool IsClicked { get; set; } = false;
    
    // Timestamps
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ReadAt { get; set; }
    public DateTime? DeliveredAt { get; set; }
    public DateTime? ClickedAt { get; set; }
    
    // Expiration
    public DateTime? ExpiresAt { get; set; }
}

public class NotificationTemplate
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }
    
    public string Type { get; set; } = string.Empty;
    public string TitleTemplate { get; set; } = string.Empty;
    public string BodyTemplate { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public string? ActionUrlTemplate { get; set; }
    
    // Template variables
    public List<string> RequiredVariables { get; set; } = new List<string>();
    public Dictionary<string, string> DefaultData { get; set; } = new Dictionary<string, string>();
    
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class UserNotificationPreferences
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }
    
    public string UserId { get; set; } = string.Empty;
    
    // Notification type preferences
    public bool AppointmentNotifications { get; set; } = true;
    public bool BidUpdateNotifications { get; set; } = true;
    public bool PriceDropNotifications { get; set; } = true;
    public bool MessageNotifications { get; set; } = true;
    public bool SystemNotifications { get; set; } = true;
    public bool MarketingNotifications { get; set; } = false;
    
    // Delivery preferences
    public bool PushNotifications { get; set; } = true;
    public bool EmailNotifications { get; set; } = true;
    public bool SmsNotifications { get; set; } = false;
    
    // Timing preferences
    public bool QuietHoursEnabled { get; set; } = false;
    public TimeSpan QuietHoursStart { get; set; } = new TimeSpan(22, 0, 0); // 10 PM
    public TimeSpan QuietHoursEnd { get; set; } = new TimeSpan(8, 0, 0); // 8 AM
    public List<DayOfWeek> QuietDays { get; set; } = new List<DayOfWeek>();
    
    // Frequency preferences
    public bool DigestNotifications { get; set; } = false; // Group notifications
    public int DigestFrequencyHours { get; set; } = 24;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class FCMToken
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }
    
    public string UserId { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public string DeviceType { get; set; } = string.Empty; // web, android, ios
    public string? DeviceId { get; set; }
    public string? UserAgent { get; set; }
    
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime LastUsedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ExpiresAt { get; set; }
}

public class NotificationRequest
{
    public string UserId { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string Priority { get; set; } = "normal";
    public string? RelatedEntityId { get; set; }
    public string? RelatedEntityType { get; set; }
    public Dictionary<string, string> Data { get; set; } = new Dictionary<string, string>();
    public string? ImageUrl { get; set; }
    public string? ActionUrl { get; set; }
    public DateTime? ExpiresAt { get; set; }
}

public class BulkNotificationRequest
{
    public List<string> UserIds { get; set; } = new List<string>();
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string Priority { get; set; } = "normal";
    public Dictionary<string, string> Data { get; set; } = new Dictionary<string, string>();
    public string? ImageUrl { get; set; }
    public string? ActionUrl { get; set; }
    public DateTime? ExpiresAt { get; set; }
}

public class NotificationStats
{
    public int TotalSent { get; set; }
    public int TotalDelivered { get; set; }
    public int TotalRead { get; set; }
    public int TotalClicked { get; set; }
    public double DeliveryRate { get; set; }
    public double ReadRate { get; set; }
    public double ClickRate { get; set; }
}
