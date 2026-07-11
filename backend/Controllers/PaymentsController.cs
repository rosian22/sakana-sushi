using Microsoft.AspNetCore.Mvc;
using SushiApi.Services.Payments;

namespace SushiApi.Controllers;

[ApiController]
[Route("api/payments")]
public class PaymentsController : ControllerBase
{
    private readonly PaymentService _payments;

    public PaymentsController(PaymentService payments) => _payments = payments;

    /// <summary>Payment methods currently available at checkout.</summary>
    [HttpGet("methods")]
    public IActionResult Methods() =>
        Ok(_payments.Enabled.Select(p => new
        {
            id = p.Id,
            name = p.DisplayName,
            description = p.Description,
            online = p.IsOnline,
        }));

    /// <summary>
    /// Webhook endpoint reserved for a future online processor. Stripe (or any
    /// other provider) would POST payment confirmations here; verify the
    /// signature, look up the order and set PaymentStatus = Paid.
    /// </summary>
    [HttpPost("webhook")]
    public IActionResult Webhook() => Ok(new { received = true });
}
