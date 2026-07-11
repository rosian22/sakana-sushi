using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using SushiApi.Models;
using SushiApi.Services;

namespace SushiApi.Controllers;

public record RegisterRequest(string Name, string Email, string Password, string? Phone);
public record LoginRequest(string Email, string Password);
public record UserDto(string Id, string Name, string Email, string? Phone, string Role);
public record AuthResponse(string Token, UserDto User);

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly MongoContext _db;
    private readonly TokenService _tokens;

    public AuthController(MongoContext db, TokenService tokens)
    {
        _db = db;
        _tokens = tokens;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(email))
            return BadRequest(new { message = "Name and email are required." });
        if (string.IsNullOrEmpty(request.Password) || request.Password.Length < 8)
            return BadRequest(new { message = "Password must be at least 8 characters." });

        var exists = await _db.Users.Find(u => u.Email == email).AnyAsync();
        if (exists)
            return Conflict(new { message = "An account with this email already exists." });

        var user = new User
        {
            Name = request.Name.Trim(),
            Email = email,
            Phone = request.Phone?.Trim(),
            PasswordHash = PasswordHasher.Hash(request.Password),
            Role = Roles.Customer,
        };
        await _db.Users.InsertOneAsync(user);
        return Ok(new AuthResponse(_tokens.Create(user), ToDto(user)));
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await _db.Users.Find(u => u.Email == email).FirstOrDefaultAsync();
        if (user is null || !PasswordHasher.Verify(request.Password, user.PasswordHash))
            return Unauthorized(new { message = "Invalid email or password." });

        return Ok(new AuthResponse(_tokens.Create(user), ToDto(user)));
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserDto>> Me()
    {
        var id = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = await _db.Users.Find(u => u.Id == id).FirstOrDefaultAsync();
        if (user is null) return Unauthorized();
        return Ok(ToDto(user));
    }

    private static UserDto ToDto(User u) => new(u.Id!, u.Name, u.Email, u.Phone, u.Role);
}
