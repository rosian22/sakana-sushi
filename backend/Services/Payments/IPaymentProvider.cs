using SushiApi.Models;

namespace SushiApi.Services.Payments;

public record PaymentResult(bool Success, string PaymentStatus, string? RedirectUrl = null, string? Error = null);

/// <summary>
/// Abstraction over payment methods. Adding a real processor later means
/// implementing this interface and registering it in Program.cs — the
/// checkout flow and the /api/payments/methods endpoint pick it up automatically.
/// </summary>
public interface IPaymentProvider
{
    /// <summary>Stable identifier stored on orders, e.g. "cod", "stripe".</summary>
    string Id { get; }
    string DisplayName { get; }
    string Description { get; }
    /// <summary>Disabled providers are hidden from checkout.</summary>
    bool Enabled { get; }
    /// <summary>True when payment happens online before the order is confirmed.</summary>
    bool IsOnline { get; }

    /// <summary>Called when an order is placed. May return a RedirectUrl for hosted checkout pages.</summary>
    Task<PaymentResult> InitiateAsync(Order order);
}

public class PaymentService
{
    private readonly List<IPaymentProvider> _providers;

    public PaymentService(IEnumerable<IPaymentProvider> providers)
    {
        _providers = providers.ToList();
    }

    public IEnumerable<IPaymentProvider> Enabled => _providers.Where(p => p.Enabled);

    public IPaymentProvider? Find(string id) =>
        _providers.FirstOrDefault(p => p.Enabled && p.Id == id);
}
