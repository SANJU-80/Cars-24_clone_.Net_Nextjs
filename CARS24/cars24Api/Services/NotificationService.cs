using Cars24Api.Models;
using MongoDB.Driver;
using System.Text.Json;
using System.Text;

namespace Cars24Api.Services;

public class NotificationService
{
    private readonly IMongoCollection<Notification> _notificationCollection;
    private readonly IMongoCollection<NotificationTemplate> _templateCollection;
    private readonly IMongoCollection<UserNotificationPreferences> _preferencesCollection;
    private readonly IMongoCollection<FCMToken> _tokenCollection;
    private readonly HttpClient _httpClient;
    private readonly string _fcmServerKey;
    private readonly string _fcmSenderId;

    public NotificationService(IMongoDatabase database, IConfiguration configuration)
    {
        _notificationCollection = database.GetCollection<Notification>("Notifications");
        _templateCollection = database.GetCollection<NotificationTemplate>("NotificationTemplates");
        _preferencesCollection = database.GetCollection<UserNotificationPreferences>("UserNotificationPreferences");
        _tokenCollection = database.GetCollection<FCMToken>("FCMTokens");
        
        _httpClient = new HttpClient();
        _fcmServerKey = configuration["Firebase:FCMServerKey"] ?? "";
        _fcmSenderId = configuration["Firebase:FCMSenderId"] ?? "";
        
        _httpClient.DefaultRequestHeaders.Add("Authorization", $"key={_fcmServerKey}");
        _httpClient.DefaultRequestHeaders.Add("Content-Type", "application/json");
        
        // Initialize default templates
        _ = Task.Run(async () => await InitializeDefaultTemplatesAsync());
    }

    public async Task<Notification> SendNotificationAsync(NotificationRequest request)
    {
        // Check user preferences
        var preferences = await GetUserPreferencesAsync(request.UserId);
        if (!ShouldSendNotification(request.Type, preferences))
        {
            return null;
        }

        // Check quiet hours
        if (IsInQuietHours(preferences))
        {
            // Store for later delivery if digest is enabled
            if (preferences.DigestNotifications)
            {
                return await StoreNotificationForDigestAsync(request);
            }
            return null;
        }

        // Create notification
        var notification = new Notification
        {
            UserId = request.UserId,
            Title = request.Title,
            Body = request.Body,
            Type = request.Type,
            Priority = request.Priority,
            RelatedEntityId = request.RelatedEntityId,
            RelatedEntityType = request.RelatedEntityType,
            Data = request.Data,
            ImageUrl = request.ImageUrl,
            ActionUrl = request.ActionUrl,
            ExpiresAt = request.ExpiresAt
        };

        // Store in database
        await _notificationCollection.InsertOneAsync(notification);

        // Send push notification
        if (preferences.PushNotifications)
        {
            await SendPushNotificationAsync(notification);
        }

        return notification;
    }

    public async Task<List<Notification>> SendBulkNotificationAsync(BulkNotificationRequest request)
    {
        var notifications = new List<Notification>();
        var tasks = new List<Task<Notification>>();

        foreach (var userId in request.UserIds)
        {
            var notificationRequest = new NotificationRequest
            {
                UserId = userId,
                Type = request.Type,
                Title = request.Title,
                Body = request.Body,
                Priority = request.Priority,
                Data = request.Data,
                ImageUrl = request.ImageUrl,
                ActionUrl = request.ActionUrl,
                ExpiresAt = request.ExpiresAt
            };

            tasks.Add(SendNotificationAsync(notificationRequest));
        }

        var results = await Task.WhenAll(tasks);
        notifications.AddRange(results.Where(n => n != null));

        return notifications;
    }

    public async Task<Notification> SendTemplateNotificationAsync(string userId, string templateType, Dictionary<string, string> variables)
    {
        var template = await _templateCollection.Find(t => t.Type == templateType && t.IsActive).FirstOrDefaultAsync();
        if (template == null)
        {
            throw new ArgumentException($"Template '{templateType}' not found");
        }

        // Replace template variables
        var title = ReplaceTemplateVariables(template.TitleTemplate, variables);
        var body = ReplaceTemplateVariables(template.BodyTemplate, variables);
        var actionUrl = template.ActionUrlTemplate != null ? ReplaceTemplateVariables(template.ActionUrlTemplate, variables) : null;

        var request = new NotificationRequest
        {
            UserId = userId,
            Type = templateType,
            Title = title,
            Body = body,
            Priority = template.Priority,
            ImageUrl = template.ImageUrl,
            ActionUrl = actionUrl,
            Data = template.DefaultData
        };

        return await SendNotificationAsync(request);
    }

    public async Task<List<Notification>> GetUserNotificationsAsync(string userId, int page = 1, int pageSize = 20)
    {
        var filter = Builders<Notification>.Filter.Eq(n => n.UserId, userId);
        var sort = Builders<Notification>.Sort.Descending(n => n.CreatedAt);
        
        var notifications = await _notificationCollection
            .Find(filter)
            .Sort(sort)
            .Skip((page - 1) * pageSize)
            .Limit(pageSize)
            .ToListAsync();

        return notifications;
    }

    public async Task<Notification> MarkAsReadAsync(string notificationId, string userId)
    {
        var filter = Builders<Notification>.Filter.And(
            Builders<Notification>.Filter.Eq(n => n.Id, notificationId),
            Builders<Notification>.Filter.Eq(n => n.UserId, userId)
        );

        var update = Builders<Notification>.Update
            .Set(n => n.IsRead, true)
            .Set(n => n.ReadAt, DateTime.UtcNow);

        var result = await _notificationCollection.UpdateOneAsync(filter, update);
        
        if (result.ModifiedCount > 0)
        {
            return await _notificationCollection.Find(filter).FirstOrDefaultAsync();
        }

        return null;
    }

    public async Task<Notification> MarkAsClickedAsync(string notificationId, string userId)
    {
        var filter = Builders<Notification>.Filter.And(
            Builders<Notification>.Filter.Eq(n => n.Id, notificationId),
            Builders<Notification>.Filter.Eq(n => n.UserId, userId)
        );

        var update = Builders<Notification>.Update
            .Set(n => n.IsClicked, true)
            .Set(n => n.ClickedAt, DateTime.UtcNow);

        var result = await _notificationCollection.UpdateOneAsync(filter, update);
        
        if (result.ModifiedCount > 0)
        {
            return await _notificationCollection.Find(filter).FirstOrDefaultAsync();
        }

        return null;
    }

    public async Task<int> GetUnreadCountAsync(string userId)
    {
        var filter = Builders<Notification>.Filter.And(
            Builders<Notification>.Filter.Eq(n => n.UserId, userId),
            Builders<Notification>.Filter.Eq(n => n.IsRead, false)
        );

        return (int)await _notificationCollection.CountDocumentsAsync(filter);
    }

    public async Task<UserNotificationPreferences> GetUserPreferencesAsync(string userId)
    {
        var preferences = await _preferencesCollection.Find(p => p.UserId == userId).FirstOrDefaultAsync();
        
        if (preferences == null)
        {
            // Create default preferences
            preferences = new UserNotificationPreferences
            {
                UserId = userId
            };
            await _preferencesCollection.InsertOneAsync(preferences);
        }

        return preferences;
    }

    public async Task<UserNotificationPreferences> UpdateUserPreferencesAsync(string userId, UserNotificationPreferences preferences)
    {
        preferences.UserId = userId;
        preferences.UpdatedAt = DateTime.UtcNow;

        var filter = Builders<UserNotificationPreferences>.Filter.Eq(p => p.UserId, userId);
        var options = new ReplaceOptions { IsUpsert = true };

        await _preferencesCollection.ReplaceOneAsync(filter, preferences, options);
        return preferences;
    }

    public async Task<string> RegisterFCMTokenAsync(string userId, string token, string deviceType, string? deviceId = null, string? userAgent = null)
    {
        // Check if token already exists
        var existingToken = await _tokenCollection.Find(t => t.Token == token).FirstOrDefaultAsync();
        
        if (existingToken != null)
        {
            // Update existing token
            var update = Builders<FCMToken>.Update
                .Set(t => t.UserId, userId)
                .Set(t => t.DeviceType, deviceType)
                .Set(t => t.DeviceId, deviceId)
                .Set(t => t.UserAgent, userAgent)
                .Set(t => t.IsActive, true)
                .Set(t => t.LastUsedAt, DateTime.UtcNow);

            await _tokenCollection.UpdateOneAsync(t => t.Token == token, update);
            return existingToken.Id;
        }
        else
        {
            // Create new token
            var fcmToken = new FCMToken
            {
                UserId = userId,
                Token = token,
                DeviceType = deviceType,
                DeviceId = deviceId,
                UserAgent = userAgent,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                LastUsedAt = DateTime.UtcNow
            };

            await _tokenCollection.InsertOneAsync(fcmToken);
            return fcmToken.Id;
        }
    }

    public async Task<bool> UnregisterFCMTokenAsync(string token)
    {
        var filter = Builders<FCMToken>.Filter.Eq(t => t.Token, token);
        var update = Builders<FCMToken>.Update.Set(t => t.IsActive, false);

        var result = await _tokenCollection.UpdateOneAsync(filter, update);
        return result.ModifiedCount > 0;
    }

    public async Task<NotificationStats> GetNotificationStatsAsync(DateTime? startDate = null, DateTime? endDate = null)
    {
        var filter = Builders<Notification>.Filter.Empty;

        if (startDate.HasValue)
        {
            filter = Builders<Notification>.Filter.And(filter, 
                Builders<Notification>.Filter.Gte(n => n.CreatedAt, startDate.Value));
        }

        if (endDate.HasValue)
        {
            filter = Builders<Notification>.Filter.And(filter, 
                Builders<Notification>.Filter.Lte(n => n.CreatedAt, endDate.Value));
        }

        var totalSent = await _notificationCollection.CountDocumentsAsync(filter);
        var totalDelivered = await _notificationCollection.CountDocumentsAsync(
            Builders<Notification>.Filter.And(filter, Builders<Notification>.Filter.Eq(n => n.IsDelivered, true)));
        var totalRead = await _notificationCollection.CountDocumentsAsync(
            Builders<Notification>.Filter.And(filter, Builders<Notification>.Filter.Eq(n => n.IsRead, true)));
        var totalClicked = await _notificationCollection.CountDocumentsAsync(
            Builders<Notification>.Filter.And(filter, Builders<Notification>.Filter.Eq(n => n.IsClicked, true)));

        return new NotificationStats
        {
            TotalSent = (int)totalSent,
            TotalDelivered = (int)totalDelivered,
            TotalRead = (int)totalRead,
            TotalClicked = (int)totalClicked,
            DeliveryRate = totalSent > 0 ? (double)totalDelivered / totalSent * 100 : 0,
            ReadRate = totalSent > 0 ? (double)totalRead / totalSent * 100 : 0,
            ClickRate = totalSent > 0 ? (double)totalClicked / totalSent * 100 : 0
        };
    }

    private async Task SendPushNotificationAsync(Notification notification)
    {
        try
        {
            // Get user's FCM tokens
            var tokens = await _tokenCollection.Find(t => t.UserId == notification.UserId && t.IsActive).ToListAsync();
            
            if (!tokens.Any())
            {
                return; // No tokens to send to
            }

            var fcmMessage = new
            {
                registration_ids = tokens.Select(t => t.Token).ToList(),
                notification = new
                {
                    title = notification.Title,
                    body = notification.Body,
                    icon = "/favicon.ico",
                    image = notification.ImageUrl,
                    click_action = notification.ActionUrl
                },
                data = notification.Data.Concat(new Dictionary<string, string>
                {
                    { "notificationId", notification.Id },
                    { "type", notification.Type },
                    { "priority", notification.Priority }
                }).ToDictionary(kvp => kvp.Key, kvp => kvp.Value),
                priority = notification.Priority == "high" || notification.Priority == "urgent" ? "high" : "normal"
            };

            var json = JsonSerializer.Serialize(fcmMessage);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync("https://fcm.googleapis.com/fcm/send", content);
            
            if (response.IsSuccessStatusCode)
            {
                // Mark as delivered
                var update = Builders<Notification>.Update
                    .Set(n => n.IsDelivered, true)
                    .Set(n => n.DeliveredAt, DateTime.UtcNow);

                await _notificationCollection.UpdateOneAsync(n => n.Id == notification.Id, update);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error sending push notification: {ex.Message}");
        }
    }


    private bool ShouldSendNotification(string notificationType, UserNotificationPreferences preferences)
    {
        return notificationType.ToLower() switch
        {
            "appointment" => preferences.AppointmentNotifications,
            "bid" => preferences.BidUpdateNotifications,
            "price_drop" => preferences.PriceDropNotifications,
            "message" => preferences.MessageNotifications,
            "system" => preferences.SystemNotifications,
            "marketing" => preferences.MarketingNotifications,
            _ => true
        };
    }

    private bool IsInQuietHours(UserNotificationPreferences preferences)
    {
        if (!preferences.QuietHoursEnabled)
        {
            return false;
        }

        var now = DateTime.Now;
        var currentTime = now.TimeOfDay;
        var currentDay = now.DayOfWeek;

        // Check if current day is in quiet days
        if (preferences.QuietDays.Contains(currentDay))
        {
            return true;
        }

        // Check if current time is in quiet hours
        if (preferences.QuietHoursStart <= preferences.QuietHoursEnd)
        {
            // Same day quiet hours (e.g., 10 PM to 8 AM)
            return currentTime >= preferences.QuietHoursStart || currentTime <= preferences.QuietHoursEnd;
        }
        else
        {
            // Overnight quiet hours (e.g., 10 PM to 8 AM)
            return currentTime >= preferences.QuietHoursStart || currentTime <= preferences.QuietHoursEnd;
        }
    }

    private async Task<Notification> StoreNotificationForDigestAsync(NotificationRequest request)
    {
        var notification = new Notification
        {
            UserId = request.UserId,
            Title = request.Title,
            Body = request.Body,
            Type = request.Type,
            Priority = request.Priority,
            RelatedEntityId = request.RelatedEntityId,
            RelatedEntityType = request.RelatedEntityType,
            Data = request.Data,
            ImageUrl = request.ImageUrl,
            ActionUrl = request.ActionUrl,
            ExpiresAt = request.ExpiresAt
        };

        await _notificationCollection.InsertOneAsync(notification);
        return notification;
    }

    private string ReplaceTemplateVariables(string template, Dictionary<string, string> variables)
    {
        foreach (var variable in variables)
        {
            template = template.Replace($"{{{variable.Key}}}", variable.Value);
        }
        return template;
    }

    private async Task InitializeDefaultTemplatesAsync()
    {
        try
        {
            var count = await _templateCollection.CountDocumentsAsync(FilterDefinition<NotificationTemplate>.Empty);
            if (count == 0)
            {
                var templates = new List<NotificationTemplate>
                {
                    new NotificationTemplate
                    {
                        Type = "appointment_confirmation",
                        TitleTemplate = "Appointment Confirmed",
                        BodyTemplate = "Your appointment for {carTitle} has been confirmed for {appointmentDate} at {appointmentTime}.",
                        Priority = "high",
                        ActionUrlTemplate = "/appointments/{appointmentId}",
                        RequiredVariables = new List<string> { "carTitle", "appointmentDate", "appointmentTime", "appointmentId" }
                    },
                    new NotificationTemplate
                    {
                        Type = "appointment_reminder",
                        TitleTemplate = "Appointment Reminder",
                        BodyTemplate = "Don't forget! Your appointment for {carTitle} is scheduled for tomorrow at {appointmentTime}.",
                        Priority = "normal",
                        ActionUrlTemplate = "/appointments/{appointmentId}",
                        RequiredVariables = new List<string> { "carTitle", "appointmentTime", "appointmentId" }
                    },
                    new NotificationTemplate
                    {
                        Type = "bid_update",
                        TitleTemplate = "Bid Update",
                        BodyTemplate = "Your bid of ₹{bidAmount} for {carTitle} has been {bidStatus}.",
                        Priority = "high",
                        ActionUrlTemplate = "/buy-car/{carId}",
                        RequiredVariables = new List<string> { "bidAmount", "carTitle", "bidStatus", "carId" }
                    },
                    new NotificationTemplate
                    {
                        Type = "price_drop",
                        TitleTemplate = "Price Drop Alert",
                        BodyTemplate = "Great news! The price of {carTitle} has dropped from ₹{oldPrice} to ₹{newPrice}.",
                        Priority = "normal",
                        ActionUrlTemplate = "/buy-car/{carId}",
                        RequiredVariables = new List<string> { "carTitle", "oldPrice", "newPrice", "carId" }
                    },
                    new NotificationTemplate
                    {
                        Type = "new_message",
                        TitleTemplate = "New Message",
                        BodyTemplate = "You have a new message from {senderName}: {messagePreview}",
                        Priority = "normal",
                        ActionUrlTemplate = "/messages/{conversationId}",
                        RequiredVariables = new List<string> { "senderName", "messagePreview", "conversationId" }
                    },
                    new NotificationTemplate
                    {
                        Type = "booking_confirmation",
                        TitleTemplate = "Booking Confirmed",
                        BodyTemplate = "Your booking for {carTitle} has been confirmed. Booking ID: {bookingId}",
                        Priority = "high",
                        ActionUrlTemplate = "/bookings/{bookingId}",
                        RequiredVariables = new List<string> { "carTitle", "bookingId" }
                    }
                };

                await _templateCollection.InsertManyAsync(templates);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error initializing notification templates: {ex.Message}");
        }
    }
}
