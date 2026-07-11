using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace SushiApi.Models;

public class Order
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonRepresentation(BsonType.ObjectId)]
    public string? UserId { get; set; }

    public string CustomerName { get; set; } = "";
    public string Email { get; set; } = "";
    public string Phone { get; set; } = "";
    public string Street { get; set; } = "";
    public string City { get; set; } = "";
    public string? Zip { get; set; }
    public string? Notes { get; set; }

    public List<OrderItem> Items { get; set; } = new();

    [BsonRepresentation(BsonType.Decimal128)]
    public decimal Subtotal { get; set; }

    [BsonRepresentation(BsonType.Decimal128)]
    public decimal DeliveryFee { get; set; }

    [BsonRepresentation(BsonType.Decimal128)]
    public decimal Total { get; set; }

    public string PaymentMethod { get; set; } = "";
    public string PaymentStatus { get; set; } = PaymentStatuses.Pending;
    public string Status { get; set; } = OrderStatuses.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class OrderItem
{
    [BsonRepresentation(BsonType.ObjectId)]
    public string ProductId { get; set; } = "";
    public string Name { get; set; } = "";

    [BsonRepresentation(BsonType.Decimal128)]
    public decimal UnitPrice { get; set; }

    public int Quantity { get; set; }
}

public static class OrderStatuses
{
    public const string Pending = "Pending";
    public const string Confirmed = "Confirmed";
    public const string Preparing = "Preparing";
    public const string OutForDelivery = "OutForDelivery";
    public const string Delivered = "Delivered";
    public const string Cancelled = "Cancelled";

    public static readonly string[] All =
        { Pending, Confirmed, Preparing, OutForDelivery, Delivered, Cancelled };
}

public static class PaymentStatuses
{
    public const string Pending = "Pending";
    public const string Paid = "Paid";
    public const string PayOnDelivery = "PayOnDelivery";
    public const string Failed = "Failed";
}
