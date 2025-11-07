using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;

namespace cars24Api.Models
{
    public class Booking
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }  // Booking ID
        public string CarId { get; set; } = null!;  // Reference to Car by Id
        public string Name { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string PreferredDate { get; set; } = string.Empty;
        public string PreferredTime { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = string.Empty;
        public string LoanRequired { get; set; } = string.Empty;
        public string DownPayment { get; set; } = string.Empty;
    }
}
