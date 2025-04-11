using INTEXApp.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using INTEXApp.Data;
using System.Security.Claims;
using INTEXApp.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database contexts
builder.Services.AddDbContext<RecommendationsDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("RecommendationsConnection")));

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("IdentityConnection")));

builder.Services.AddDbContext<MoviesDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("MoviesConnection")));

// Identity and security
builder.Services.AddAuthorization();

//necessary for roles
builder.Services.AddIdentity<IdentityUser, IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();
//obsolete if using roles
//builder.Services.AddIdentityApiEndpoints<IdentityUser>()
//    .AddEntityFrameworkStores<ApplicationDbContext>();

builder.Services.Configure<IdentityOptions>(options =>
{
    options.ClaimsIdentity.UserIdClaimType = ClaimTypes.NameIdentifier;
    options.ClaimsIdentity.UserNameClaimType = ClaimTypes.Email;
});

builder.Services.AddScoped<IUserClaimsPrincipalFactory<IdentityUser>, CustomUserClaimsPrincipalFactory>();

builder.Services.ConfigureApplicationCookie(options =>
{
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = SameSiteMode.None; // change to strict after adding https for production
    options.Cookie.Name = ".AspNetCore.Identity.Application"; // these need to be the same fields as the mapp.post /logout
    options.LoginPath = "/login";
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
});

// CORS for frontend React app
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3003", "https://intex2-group-4-12-bfccddekgjdectcx.eastus-01.azurewebsites.net", "https://yellow-pebble-0c27b3a1e.6.azurestaticapps.net", "https://red-river-03a98491e.6.azurestaticapps.net")
            .AllowCredentials()
            .AllowAnyHeader()
            .AllowAnyMethod();
            //.WithExposedHeaders("Content-Security-Policy");
    });
});

builder.Services.AddSingleton<IEmailSender<IdentityUser>, NoOpEmailSender<IdentityUser>>();

var app = builder.Build();

// ✅ CSP override to allow Vite dev server (React)
if (app.Environment.IsDevelopment())
{
    app.Use(async (context, next) =>
    {
        context.Response.Headers["Content-Security-Policy"] =
            "default-src 'self' http://localhost:3003; " +
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:3003; " +
            "style-src 'self' 'unsafe-inline' http://localhost:3003; " +
            "connect-src *";
        await next();
    });

    app.UseSwagger();
    app.UseSwaggerUI();
}


// Middleware



app.UseHttpsRedirection(); //1
app.UseStaticFiles(); // 2
app.UseCors("AllowFrontend"); // 3
app.UseRouting(); // 4
app.UseAuthentication(); // 5
app.UseAuthorization(); // 6

app.MapControllers();
app.MapIdentityApi<IdentityUser>();

// Logout endpoint
app.MapPost("/logout", async (HttpContext context, SignInManager<IdentityUser> signInManager) =>
{
    await signInManager.SignOutAsync();

    context.Response.Cookies.Delete(".AspNetCore.Identity.Application", new CookieOptions
    {
        HttpOnly = true,
        SameSite = SameSiteMode.None,
        Secure = true
    });

    return Results.Ok(new { message = "Logout successful" });
}).RequireAuthorization();

// Ping endpoint for auth status
app.MapGet("/pingauth", (ClaimsPrincipal user) =>
{
    if (!user.Identity?.IsAuthenticated ?? false)
    {
        return Results.Unauthorized();
    }

    var id = user.FindFirstValue(ClaimTypes.NameIdentifier);
    var email = user.FindFirstValue(ClaimTypes.Email) ?? "unknown@example.com";
    var roles = user.FindAll(ClaimTypes.Role).Select(r => r.Value).ToList();
    var userIdStr = user.FindFirstValue(ClaimTypes.NameIdentifier);
    int.TryParse(userIdStr, out int userId);


    return Results.Json(new { id = id, email = email, roles = roles });
}).RequireAuthorization();




app.Run();



