using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace cars24Api.Models;

public class User
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [Required]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;

    [Required]
    [Phone]
    public string Phone { get; set; } = string.Empty;

    [BsonRepresentation(BsonType.ObjectId)]

    public List<string> BookingId { get; set; } = new List<string>();

    [BsonRepresentation(BsonType.ObjectId)]

    public List<string> AppointmentId { get; set; } = new List<string>();

    // FCM Push Notification Tokens (multiple devices)
    public List<string> FcmTokens { get; set; } = new List<string>();

    // Notification Preferences
    public NotificationPreferences NotificationPreferences { get; set; } = new NotificationPreferences();
}

public class NotificationPreferences
{
    public bool AppointmentConfirmations { get; set; } = true;
    public bool BidUpdates { get; set; } = true;
    public bool PriceDrops { get; set; } = true;
    public bool NewMessages { get; set; } = true;
    public bool EmailNotifications { get; set; } = true;
    public bool PushNotifications { get; set; } = true;
}
