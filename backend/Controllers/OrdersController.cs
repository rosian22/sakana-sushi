using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;
using SushiApi.Models;
using SushiApi.Services;
using SushiApi.Services.Payments;

namespace SushiApi.Controllers;

public record OrderItemRequest(string ProductId, int Quantity);
public record CreateOrderRequest(
    List<OrderItemRequest> Items,
    string CustomerName, string Email, string Phone,
    string Street, string City, string? Zip, string? Notes,
    string PaymentMethod);
public record UpdateStatusRequest(string Status);

[ApiController]
[Route("api/orders")]
public class OrdersController : ControllerBase
{
    private const decimal DeliveryFee = 3.99m;
    private const decimal FreeDeliveryOver = 35m;

    private readonly MongoContext _db;
    private readonly PaymentService _payments;

    public OrdersController(MongoContext db, PaymentService payments)
    {
        _db = db;
        _payments = payments;
    }

    /// <summary>Place an order — works for both guests and logged-in users.</summary>
    [HttpPost]
    public async Task<ActionResult<Order>> Create(CreateOrderRequest request)
    {
        if (request.Items is null || request.Items.Count == 0)
            return BadRequest(new { message = "The cart is empty." });
        if (request.Items.Any(i => i.Quantity < 1 || i.Quantity > 50))
            return BadRequest(new { message = "Invalid item quantity." });
        if (string.IsNullOrWhiteSpace(request.CustomerName) ||
            string.IsNullOrWhiteSpace(request.Phone) ||
            string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Street) ||
            string.IsNullOrWhiteSpace(request.City))
            return BadRequest(new { message = "Name, phone, email and delivery address are required." });

        var provider = _payments.Find(request.PaymentMethod);
        if (provider is null)
            return BadRequest(new { message = "Unknown or unavailable payment method." });

        // Prices always come from the database, never from the client.
        var ids = request.Items.Select(i => i.ProductId).Distinct().ToList();
        if (ids.Any(id => !ObjectId.TryParse(id, out _)))
            return BadRequest(new { message = "Invalid product in cart." });
        var productFilter = Builders<Product>.Filter.In(p => p.Id, ids) &
                            Builders<Product>.Filter.Eq(p => p.Available, true);
        var products = await _db.Products.Find(productFilter).ToListAsync();
        if (products.Count != ids.Count)
            return BadRequest(new { message = "Some products in your cart are no longer available." });

        var byId = products.ToDictionary(p => p.Id!);
        var items = request.Items
            .GroupBy(i => i.ProductId)
            .Select(g => new OrderItem
            {
                ProductId = g.Key,
                Name = byId[g.Key].Name,
                UnitPrice = byId[g.Key].Price,
                Quantity = g.Sum(i => i.Quantity),
            })
            .ToList();

        var subtotal = items.Sum(i => i.UnitPrice * i.Quantity);
        var deliveryFee = subtotal >= FreeDeliveryOver ? 0m : DeliveryFee;

        var order = new Order
        {
            UserId = User.FindFirstValue(ClaimTypes.NameIdentifier),
            CustomerName = request.CustomerName.Trim(),
            Email = request.Email.Trim().ToLowerInvariant(),
            Phone = request.Phone.Trim(),
            Street = request.Street.Trim(),
            City = request.City.Trim(),
            Zip = request.Zip?.Trim(),
            Notes = request.Notes?.Trim(),
            Items = items,
            Subtotal = subtotal,
            DeliveryFee = deliveryFee,
            Total = subtotal + deliveryFee,
            PaymentMethod = provider.Id,
        };

        var payment = await provider.InitiateAsync(order);
        if (!payment.Success)
            return BadRequest(new { message = payment.Error ?? "Payment could not be initiated." });
        order.PaymentStatus = payment.PaymentStatus;

        await _db.Orders.InsertOneAsync(order);
        // RedirectUrl is null for on-delivery methods; an online processor would
        // return its hosted checkout page here for the frontend to redirect to.
        return Ok(new { order, payment.RedirectUrl });
    }

    /// <summary>Order lookup. Owners and admins see it directly; guests must supply the order email.</summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<Order>> Get(string id, [FromQuery] string? email)
    {
        if (!ObjectId.TryParse(id, out _)) return NotFound();
        var order = await _db.Orders.Find(o => o.Id == id).FirstOrDefaultAsync();
        if (order is null) return NotFound();

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isOwner = userId is not null && order.UserId == userId;
        var isAdmin = User.IsInRole(Roles.Admin);
        var emailMatches = email is not null &&
            string.Equals(order.Email, email.Trim(), StringComparison.OrdinalIgnoreCase);

        if (!isOwner && !isAdmin && !emailMatches) return NotFound();
        return Ok(order);
    }

    [Authorize]
    [HttpGet("mine")]
    public async Task<ActionResult<List<Order>>> Mine()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var orders = await _db.Orders.Find(o => o.UserId == userId)
            .SortByDescending(o => o.CreatedAt).ToListAsync();
        return Ok(orders);
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpGet]
    public async Task<ActionResult<List<Order>>> All()
    {
        var orders = await _db.Orders.Find(FilterDefinition<Order>.Empty)
            .SortByDescending(o => o.CreatedAt).Limit(200).ToListAsync();
        return Ok(orders);
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpPatch("{id}/status")]
    public async Task<ActionResult<Order>> UpdateStatus(string id, UpdateStatusRequest request)
    {
        if (!OrderStatuses.All.Contains(request.Status))
            return BadRequest(new { message = "Unknown order status." });

        var update = Builders<Order>.Update.Set(o => o.Status, request.Status);
        var order = await _db.Orders.FindOneAndUpdateAsync<Order>(
            o => o.Id == id, update,
            new FindOneAndUpdateOptions<Order> { ReturnDocument = ReturnDocument.After });
        return order is null ? NotFound() : Ok(order);
    }
}
