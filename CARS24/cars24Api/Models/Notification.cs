using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace cars24Api.Models
{
    public class Notification
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonRepresentation(BsonType.ObjectId)]
        public string UserId { get; set; } = string.Empty;

        public string Title { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // "appointment", "bid", "price_drop", "message"
        public string? RelatedId { get; set; } // ID of related entity (appointment, car, etc.)
        public bool IsRead { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public Dictionary<string, string>? Data { get; set; } // Additional data for deep linking
    }
}

