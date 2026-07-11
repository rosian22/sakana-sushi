using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;
using SushiApi.Models;
using SushiApi.Services;

namespace SushiApi.Controllers;

public record ProductRequest(
    string Name, string Description, string Category, decimal Price,
    int Pieces, string? ImageUrl, List<string>? Tags, bool Available);

[ApiController]
[Route("api/products")]
public class ProductsController : ControllerBase
{
    private readonly MongoContext _db;

    public ProductsController(MongoContext db) => _db = db;

    /// <summary>Public menu. Admins can pass all=true to include unavailable products.</summary>
    [HttpGet]
    public async Task<ActionResult<List<Product>>> List([FromQuery] bool all = false)
    {
        var includeAll = all && User.IsInRole(Roles.Admin);
        var filter = includeAll
            ? Builders<Product>.Filter.Empty
            : Builders<Product>.Filter.Eq(p => p.Available, true);
        var products = await _db.Products.Find(filter)
            .SortBy(p => p.Category).ThenBy(p => p.Name).ToListAsync();
        return Ok(products);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Product>> Get(string id)
    {
        if (!ObjectId.TryParse(id, out _)) return NotFound();
        var product = await _db.Products.Find(p => p.Id == id).FirstOrDefaultAsync();
        return product is null ? NotFound() : Ok(product);
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpPost]
    public async Task<ActionResult<Product>> Create(ProductRequest request)
    {
        var error = Validate(request);
        if (error is not null) return BadRequest(new { message = error });

        var product = new Product();
        Apply(product, request);
        await _db.Products.InsertOneAsync(product);
        return CreatedAtAction(nameof(Get), new { id = product.Id }, product);
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpPut("{id}")]
    public async Task<ActionResult<Product>> Update(string id, ProductRequest request)
    {
        var error = Validate(request);
        if (error is not null) return BadRequest(new { message = error });

        var product = await _db.Products.Find(p => p.Id == id).FirstOrDefaultAsync();
        if (product is null) return NotFound();

        Apply(product, request);
        await _db.Products.ReplaceOneAsync(p => p.Id == id, product);
        return Ok(product);
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var result = await _db.Products.DeleteOneAsync(p => p.Id == id);
        return result.DeletedCount == 0 ? NotFound() : NoContent();
    }

    private static string? Validate(ProductRequest r)
    {
        if (string.IsNullOrWhiteSpace(r.Name)) return "Name is required.";
        if (r.Price <= 0) return "Price must be greater than zero.";
        if (r.Pieces < 1) return "Pieces must be at least 1.";
        return null;
    }

    private static void Apply(Product p, ProductRequest r)
    {
        p.Name = r.Name.Trim();
        p.Description = r.Description?.Trim() ?? "";
        p.Category = string.IsNullOrWhiteSpace(r.Category) ? "Rolls" : r.Category.Trim();
        p.Price = decimal.Round(r.Price, 2);
        p.Pieces = r.Pieces;
        p.ImageUrl = string.IsNullOrWhiteSpace(r.ImageUrl) ? null : r.ImageUrl.Trim();
        p.Tags = r.Tags?.Where(t => !string.IsNullOrWhiteSpace(t)).Select(t => t.Trim()).ToList() ?? new();
        p.Available = r.Available;
    }
}
