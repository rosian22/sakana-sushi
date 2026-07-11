using MongoDB.Driver;
using SushiApi.Models;

namespace SushiApi.Services;

public class MongoContext
{
    public IMongoDatabase Database { get; }
    public IMongoCollection<Product> Products => Database.GetCollection<Product>("products");
    public IMongoCollection<User> Users => Database.GetCollection<User>("users");
    public IMongoCollection<Order> Orders => Database.GetCollection<Order>("orders");

    public MongoContext(IConfiguration config)
    {
        var connectionString = config["Mongo:ConnectionString"] ?? "mongodb://localhost:27017";
        var databaseName = config["Mongo:Database"] ?? "sushi";
        var client = new MongoClient(connectionString);
        Database = client.GetDatabase(databaseName);
    }
}
