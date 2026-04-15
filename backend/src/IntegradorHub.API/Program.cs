using MediatR;
using FluentValidation;
using IntegradorHub.API.Shared.Domain.Interfaces;
using IntegradorHub.API.Shared.Infrastructure.Repositories;
using IntegradorHub.API.Shared.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// === KESTREL: Aumentar límite global a 500MB para subida de videos ===
builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 524288000; // 500 MB
});

// === SERVICES ===

// Controllers
builder.Services.AddControllers();

// Form options globales para multipart (500MB)
builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 524288000; // 500 MB
    options.ValueLengthLimit = int.MaxValue;
    options.MultipartHeadersLengthLimit = int.MaxValue;
});

// === SECURITY: Rate Limiting (Protección contra DoS/Script Kiddies) ===
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    
    // Límite Global de 100 peticiones por minuto por IP
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? httpContext.Request.Headers.Host.ToString(),
            factory: partition => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 100,
                QueueLimit = 2,
                Window = TimeSpan.FromMinutes(1)
            }));
});

// Authentication (Firebase JWT)
var projectId = builder.Configuration["Firebase:ProjectId"] ?? "integradorhub-dsm";

// Cache para las signing keys de Google (se refrescan cada hora)
IList<SecurityKey>? _cachedSigningKeys = null;
DateTime _keysCachedAt = DateTime.MinValue;
var _keysLock = new object();

IEnumerable<SecurityKey> ResolveSigningKeys(string token, SecurityToken securityToken, string kid, TokenValidationParameters parameters)
{
    lock (_keysLock)
    {
        if (_cachedSigningKeys == null || DateTime.UtcNow - _keysCachedAt > TimeSpan.FromHours(1))
        {
            try
            {
                using var httpClient = new HttpClient();
                var json = httpClient.GetStringAsync(
                    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"
                ).ConfigureAwait(false).GetAwaiter().GetResult();
                _cachedSigningKeys = new JsonWebKeySet(json).Keys.Cast<SecurityKey>().ToList();
                _keysCachedAt = DateTime.UtcNow;
            }
            catch (Exception)
            {
                if (_cachedSigningKeys != null) return _cachedSigningKeys;
                throw;
            }
        }
        return _cachedSigningKeys;
    }
}

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = null;
        options.RequireHttpsMetadata = false;
        
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = $"https://securetoken.google.com/{projectId}",
            ValidateAudience = true,
            ValidAudience = projectId,
            ValidateLifetime = true,
            IssuerSigningKeyResolver = ResolveSigningKeys
        };
    });


// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// MediatR (CQRS)
builder.Services.AddMediatR(cfg => 
    cfg.RegisterServicesFromAssembly(typeof(Program).Assembly));

// FluentValidation
builder.Services.AddValidatorsFromAssembly(typeof(Program).Assembly);

// Repositories (Firestore)
builder.Services.AddSingleton<IUserRepository, UserRepository>();
builder.Services.AddScoped<IProjectRepository, ProjectRepository>();
builder.Services.AddScoped<IEvaluationRepository, EvaluationRepository>();
builder.Services.AddScoped<IGroupRepository, GroupRepository>();
builder.Services.AddScoped<IMateriaRepository, MateriaRepository>();
builder.Services.AddScoped<ICarreraRepository, CarreraRepository>();

// Storage Service (Supabase)
builder.Services.AddSingleton<IStorageService, SupabaseStorageService>();

// CORS (Dinámico para Producción y Desarrollo)
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();
var fixedOrigins = new[]
{
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "https://integradorhub-frontend.vercel.app",
    "https://integradorhub.onrender.com"
};
var allOrigins = allowedOrigins.Concat(fixedOrigins).Distinct().ToArray();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.SetIsOriginAllowed(origin =>
            {
                if (string.IsNullOrEmpty(origin)) return false;
                var uri = new Uri(origin);
                // Permitir todos los subdominios de vercel.app (preview + producción)
                if (uri.Host.EndsWith(".vercel.app", StringComparison.OrdinalIgnoreCase)) return true;
                // Permitir orígenes locales y fijos
                return allOrigins.Contains(origin, StringComparer.OrdinalIgnoreCase);
            })
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// === MIDDLEWARE ===

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");

// Aplicar el Rate Limiter antes de rutas Auth
app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Endpoint de prueba
app.MapGet("/api/health", () => new { status = "ok", timestamp = DateTime.UtcNow })
   .WithName("HealthCheck")
   .WithOpenApi();

app.Run();
