using cars24Api.Models;
using MongoDB.Driver;
using FirebaseAdmin;
using FirebaseAdmin.Messaging;
using Google.Apis.Auth.OAuth2;
using FirebaseNotification = FirebaseAdmin.Messaging.Notification;

namespace cars24Api.Services
{
    public class NotificationService
    {
        private readonly IMongoCollection<Models.Notification> _notifications;
        private readonly IMongoCollection<User> _users;
        private readonly FirebaseMessaging? _firebaseMessaging;

        public NotificationService(IConfiguration config)
        {
            var client = new MongoClient(config.GetConnectionString("Cars24DB"));
            var database = client.GetDatabase(config["MongoDB:DatabaseName"]);
            _notifications = database.GetCollection<Models.Notification>("Notifications");
            _users = database.GetCollection<User>("Users");

            // Initialize Firebase Admin SDK
            try
            {
                var firebaseConfigPath = config["Firebase:ConfigPath"];
                if (!string.IsNullOrEmpty(firebaseConfigPath) && File.Exists(firebaseConfigPath))
                {
                    if (FirebaseApp.DefaultInstance == null)
                    {
                        FirebaseApp.Create(new AppOptions()
                        {
                            Credential = GoogleCredential.FromFile(firebaseConfigPath)
                        });
                    }
                    _firebaseMessaging = FirebaseMessaging.DefaultInstance;
                }
                else
                {
                    // Try to use environment variable or default credentials
                    var firebaseJson = config["Firebase:ServiceAccountJson"];
                    if (!string.IsNullOrEmpty(firebaseJson))
                    {
                        if (FirebaseApp.DefaultInstance == null)
                        {
                            FirebaseApp.Create(new AppOptions()
                            {
                                Credential = GoogleCredential.FromJson(firebaseJson)
                            });
                        }
                        _firebaseMessaging = FirebaseMessaging.DefaultInstance;
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Warning: Firebase not initialized. Push notifications will be disabled. Error: {ex.Message}");
                _firebaseMessaging = null;
            }
        }

        public async Task SendNotificationAsync(
            string userId,
            string title,
            string body,
            string type,
            string? relatedId = null,
            Dictionary<string, string>? data = null)
        {
            // Get user and check preferences
            var user = await _users.Find(u => u.Id == userId).FirstOrDefaultAsync();
            if (user == null || user.NotificationPreferences == null)
                return;

            // Check if user has enabled push notifications
            if (!user.NotificationPreferences.PushNotifications)
                return;

            // Check specific notification type preference
            bool shouldNotify = type switch
            {
                "appointment" => user.NotificationPreferences.AppointmentConfirmations,
                "bid" => user.NotificationPreferences.BidUpdates,
                "price_drop" => user.NotificationPreferences.PriceDrops,
                "message" => user.NotificationPreferences.NewMessages,
                _ => true
            };

            if (!shouldNotify)
                return;

            // Save notification to database
            var notification = new Models.Notification
            {
                UserId = userId,
                Title = title,
                Body = body,
                Type = type,
                RelatedId = relatedId,
                Data = data,
                CreatedAt = DateTime.UtcNow
            };
            await _notifications.InsertOneAsync(notification);

            // Send push notification if FCM is available and user has tokens
            if (_firebaseMessaging != null && user.FcmTokens != null && user.FcmTokens.Count > 0)
            {
                var message = new MulticastMessage
                {
                    Tokens = user.FcmTokens,
                    Notification = new FirebaseNotification
                    {
                        Title = title,
                        Body = body
                    },
                    Data = data?.ToDictionary(kvp => kvp.Key, kvp => kvp.Value) ?? new Dictionary<string, string>
                    {
                        { "type", type },
                        { "relatedId", relatedId ?? "" },
                        { "notificationId", notification.Id ?? "" }
                    },
                    Android = new AndroidConfig
                    {
                        Priority = Priority.High,
                        Notification = new AndroidNotification
                        {
                            ChannelId = "cars24_notifications",
                            Sound = "default"
                        }
                    },
                    Apns = new ApnsConfig
                    {
                        Headers = new Dictionary<string, string>
                        {
                            { "apns-priority", "10" }
                        },
                        Aps = new Aps
                        {
                            Sound = "default",
                            Badge = 1
                        }
                    }
                };

                try
                {
                    var response = await _firebaseMessaging.SendEachForMulticastAsync(message);
                    Console.WriteLine($"Successfully sent {response.SuccessCount} notifications");
                    if (response.FailureCount > 0)
                    {
                        Console.WriteLine($"Failed to send {response.FailureCount} notifications");
                        // Remove invalid tokens
                        var invalidTokens = new List<string>();
                        for (int i = 0; i < response.Responses.Count; i++)
                        {
                            if (!response.Responses[i].IsSuccess)
                            {
                                invalidTokens.Add(user.FcmTokens[i]);
                            }
                        }
                        if (invalidTokens.Count > 0)
                        {
                            user.FcmTokens = user.FcmTokens.Except(invalidTokens).ToList();
                            await _users.ReplaceOneAsync(u => u.Id == userId, user);
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error sending push notification: {ex.Message}");
                }
            }
        }

        public async Task<List<Models.Notification>> GetUserNotificationsAsync(string userId, int limit = 50)
        {
            return await _notifications
                .Find(n => n.UserId == userId)
                .SortByDescending(n => n.CreatedAt)
                .Limit(limit)
                .ToListAsync();
        }

        public async Task MarkAsReadAsync(string notificationId, string userId)
        {
            await _notifications.UpdateOneAsync(
                n => n.Id == notificationId && n.UserId == userId,
                Builders<Models.Notification>.Update.Set(n => n.IsRead, true));
        }

        public async Task MarkAllAsReadAsync(string userId)
        {
            await _notifications.UpdateManyAsync(
                n => n.UserId == userId && !n.IsRead,
                Builders<Models.Notification>.Update.Set(n => n.IsRead, true));
        }

        public async Task<int> GetUnreadCountAsync(string userId)
        {
            return (int)await _notifications.CountDocumentsAsync(n => n.UserId == userId && !n.IsRead);
        }
    }
}

