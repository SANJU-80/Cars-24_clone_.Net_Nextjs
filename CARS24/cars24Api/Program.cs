using MongoDB.Driver;
using cars24Api.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting; 

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddOpenApi();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
string? connectionstring = builder.Configuration.GetConnectionString("Cars24DB");
if (string.IsNullOrEmpty(connectionstring))
    throw new InvalidOperationException("Connection string 'Cars24DB' is not configured.");
var client = new MongoClient(connectionstring);
var database = client.GetDatabase("cars24");

// Register MongoDB database as a service
builder.Services.AddSingleton<IMongoDatabase>(provider => database);

// Register services with proper dependency injection
builder.Services.AddSingleton<UserService>();
builder.Services.AddSingleton<CarService>();
builder.Services.AddSingleton<BookingService>();
builder.Services.AddSingleton<AppointmentService>();
builder.Services.AddSingleton<NotificationService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
    options.AddPolicy("AllowNextApp", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "https://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});
var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// Use AllowAll CORS in development to avoid CORS issues
if (app.Environment.IsDevelopment())
{
    app.UseCors("AllowAll");
}
else
{
    app.UseCors("AllowNextApp");
}

app.MapGet("/", () => "Welcome to Cars24 API");
app.MapGet("/db-check", async () =>
{
    try
    {
        var client = new MongoClient(connectionstring);
        var dblist = await client.ListDatabaseNamesAsync();
        return Results.Ok("MongoDb connected successfully");
    }
    catch (Exception ex)
    {
        return Results.Problem($"Mongodb connection failed:{ex.Message}");
    }
});

app.UseAuthorization();

app.MapControllers();

app.Run();

