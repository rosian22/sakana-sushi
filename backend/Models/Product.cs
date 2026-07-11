using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace SushiApi.Models;

public class Product
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public string Category { get; set; } = "Rolls";

    [BsonRepresentation(BsonType.Decimal128)]
    public decimal Price { get; set; }

    public int Pieces { get; set; } = 1;
    public string? ImageUrl { get; set; }
    public List<string> Tags { get; set; } = new();
    public bool Available { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
