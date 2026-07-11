using SushiApi.Models;

namespace SushiApi.Services.Payments;

public class CashOnDeliveryProvider : IPaymentProvider
{
    public string Id => "cod";
    public string DisplayName => "Cash on delivery";
    public string Description => "Pay the courier in cash when your order arrives.";
    public bool Enabled => true;
    public bool IsOnline => false;

    public Task<PaymentResult> InitiateAsync(Order order) =>
        Task.FromResult(new PaymentResult(true, PaymentStatuses.PayOnDelivery));
}

public class CardOnDeliveryProvider : IPaymentProvider
{
    public string Id => "card_delivery";
    public string DisplayName => "Card on delivery";
    public string Description => "Pay by card at your door — the courier carries a terminal.";
    public bool Enabled => true;
    public bool IsOnline => false;

    public Task<PaymentResult> InitiateAsync(Order order) =>
        Task.FromResult(new PaymentResult(true, PaymentStatuses.PayOnDelivery));
}

/// <summary>
/// Placeholder for a real online payment processor. It stays hidden from checkout
/// until Payments:Stripe:SecretKey is configured (e.g. the Payments__Stripe__SecretKey
/// environment variable in docker-compose.yml).
///
/// To go live once you have a Stripe account:
///  1. dotnet add package Stripe.net
///  2. In InitiateAsync, create a Stripe Checkout Session for order.Total
///     and return its URL as RedirectUrl with PaymentStatus = Pending.
///  3. Add a webhook endpoint (see PaymentsController.Webhook) that flips the
///     order's PaymentStatus to Paid when Stripe confirms the charge.
/// The same pattern works for any other processor (PayPal, Netopia, etc.).
/// </summary>
public class StripeProvider : IPaymentProvider
{
    private readonly string? _secretKey;

    public StripeProvider(IConfiguration config)
    {
        _secretKey = config["Payments:Stripe:SecretKey"];
    }

    public string Id => "stripe";
    public string DisplayName => "Pay online by card";
    public string Description => "Secure online card payment.";
    public bool Enabled => !string.IsNullOrWhiteSpace(_secretKey);
    public bool IsOnline => true;

    public Task<PaymentResult> InitiateAsync(Order order) =>
        Task.FromResult(new PaymentResult(false, PaymentStatuses.Failed,
            Error: "Stripe integration not implemented yet — see StripeProvider for the integration steps."));
}
