using MongoDB.Driver;
using SushiApi.Models;

namespace SushiApi.Services;

public static class Seeder
{
    public static async Task RunAsync(IServiceProvider services, IConfiguration config, ILogger logger)
    {
        var db = services.GetRequiredService<MongoContext>();

        var adminEmail = config["Admin:Email"];
        var adminPassword = config["Admin:Password"];
        if (string.IsNullOrWhiteSpace(adminEmail) || string.IsNullOrWhiteSpace(adminPassword))
        {
            logger.LogWarning(
                "Admin:Email / Admin:Password not configured — skipping admin account seeding");
        }
        else if (await db.Users.Find(u => u.Email == adminEmail).FirstOrDefaultAsync() is null)
        {
            await db.Users.InsertOneAsync(new User
            {
                Email = adminEmail,
                Name = "Administrator",
                PasswordHash = PasswordHasher.Hash(adminPassword),
                Role = Roles.Admin,
            });
            logger.LogInformation("Seeded admin account {Email}", adminEmail);
        }

        if (await db.Products.CountDocumentsAsync(FilterDefinition<Product>.Empty) > 0) return;

        var products = new List<Product>
        {
            new() { Name = "Salmon Lover Roll", Category = "Rolls", Price = 11.90m, Pieces = 8,
                Description = "Fresh salmon, avocado and cream cheese wrapped in nori and sushi rice.",
                Tags = new() { "bestseller" },
                ImageUrl = "https://images.unsplash.com/photo-1617196035154-1e7e6e28b0db?w=800&q=80&auto=format&fit=crop" },
            new() { Name = "Spicy Tuna Roll", Category = "Rolls", Price = 12.50m, Pieces = 8,
                Description = "Tuna tartare with spicy mayo, cucumber and sesame seeds.",
                Tags = new() { "spicy" },
                ImageUrl = "https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=800&q=80&auto=format&fit=crop" },
            new() { Name = "California Roll", Category = "Rolls", Price = 9.90m, Pieces = 8,
                Description = "Surimi, avocado and cucumber rolled in tobiko.",
                Tags = new() { "classic" },
                ImageUrl = "https://images.unsplash.com/photo-1564489563601-c53cfc451e93?w=800&q=80&auto=format&fit=crop" },
            new() { Name = "Crispy Ebi Roll", Category = "Rolls", Price = 13.40m, Pieces = 8,
                Description = "Tempura shrimp, avocado and teriyaki glaze with crunchy panko.",
                Tags = new() { "bestseller" },
                ImageUrl = "https://images.unsplash.com/photo-1617196035154-1e7e6e28b0db?w=800&q=80&auto=format&fit=crop" },
            new() { Name = "Veggie Garden Roll", Category = "Rolls", Price = 8.50m, Pieces = 8,
                Description = "Avocado, cucumber, carrot, mango and pickled radish.",
                Tags = new() { "vegetarian", "vegan" },
                ImageUrl = "https://images.unsplash.com/photo-1564489563601-c53cfc451e93?w=800&q=80&auto=format&fit=crop" },
            new() { Name = "Salmon Nigiri", Category = "Nigiri", Price = 5.90m, Pieces = 2,
                Description = "Hand-pressed rice topped with thick-cut Norwegian salmon.",
                ImageUrl = "https://images.unsplash.com/photo-1615361200141-f45040f367be?w=800&q=80&auto=format&fit=crop" },
            new() { Name = "Tuna Nigiri", Category = "Nigiri", Price = 6.50m, Pieces = 2,
                Description = "Bluefin tuna over seasoned sushi rice.",
                ImageUrl = "https://images.unsplash.com/photo-1563612116625-3012372fccce?w=800&q=80&auto=format&fit=crop" },
            new() { Name = "Unagi Nigiri", Category = "Nigiri", Price = 7.20m, Pieces = 2,
                Description = "Grilled freshwater eel brushed with sweet unagi sauce.",
                ImageUrl = "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=800&q=80&auto=format&fit=crop" },
            new() { Name = "Salmon Sashimi", Category = "Sashimi", Price = 10.90m, Pieces = 6,
                Description = "Six slices of sashimi-grade salmon, served with wasabi and ginger." },
            new() { Name = "Tuna Sashimi", Category = "Sashimi", Price = 12.90m, Pieces = 6,
                Description = "Six slices of ruby-red tuna loin." },
            new() { Name = "Tokyo Set", Category = "Sets", Price = 32.90m, Pieces = 24,
                Description = "Chef's selection: 8 salmon roll, 8 spicy tuna, 4 nigiri, 4 sashimi.",
                Tags = new() { "bestseller", "for two" },
                ImageUrl = "https://images.unsplash.com/photo-1583623025817-d180a2221d0a?w=800&q=80&auto=format&fit=crop" },
            new() { Name = "Vegan Set", Category = "Sets", Price = 24.90m, Pieces = 20,
                Description = "Veggie rolls, avocado nigiri and inari pockets.",
                Tags = new() { "vegan" },
                ImageUrl = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80&auto=format&fit=crop" },
            new() { Name = "Miso Soup", Category = "Extras", Price = 4.50m, Pieces = 1,
                Description = "Traditional miso broth with tofu, wakame and spring onion.",
                Tags = new() { "vegetarian" },
                ImageUrl = "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80&auto=format&fit=crop" },
            new() { Name = "Edamame", Category = "Extras", Price = 4.90m, Pieces = 1,
                Description = "Steamed soybeans with flaky sea salt.",
                Tags = new() { "vegan" } },
            new() { Name = "Green Tea", Category = "Drinks", Price = 2.90m, Pieces = 1,
                Description = "Hot sencha green tea." },
            new() { Name = "Ramune Lemonade", Category = "Drinks", Price = 3.90m, Pieces = 1,
                Description = "Classic Japanese marble soda." },
            new() { Name = "Mochi Ice Cream", Category = "Desserts", Price = 6.90m, Pieces = 3,
                Description = "Matcha, mango and strawberry mochi trio.",
                Tags = new() { "vegetarian" } },
        };
        await db.Products.InsertManyAsync(products);
        logger.LogInformation("Seeded {Count} products", products.Count);
    }
}
