using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using SushiApi.Services;
using SushiApi.Services.Payments;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddSingleton<MongoContext>();
builder.Services.AddSingleton<TokenService>();

// Payment providers. To enable a real processor later (e.g. Stripe), set the
// Payments__Stripe__SecretKey environment variable and implement StripeProvider.
builder.Services.AddSingleton<IPaymentProvider, CashOnDeliveryProvider>();
builder.Services.AddSingleton<IPaymentProvider, CardOnDeliveryProvider>();
builder.Services.AddSingleton<IPaymentProvider, StripeProvider>();
builder.Services.AddSingleton<PaymentService>();

var jwtKey = builder.Configuration["Jwt:Key"] ?? "dev-only-secret-change-me-0123456789abcdef";
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        };
    });
builder.Services.AddAuthorization();

// The nginx container proxies same-origin /api calls, but allow any origin so the
// Vite dev server (npm run dev) works against the API directly too.
builder.Services.AddCors(o => o.AddDefaultPolicy(p => p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapGet("/api/health", () => Results.Ok(new { status = "ok" }));

await Seeder.RunAsync(app.Services, app.Configuration, app.Logger);

app.Run();
