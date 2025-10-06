using MongoDB.Driver;
using Cars24Api.Services;
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddOpenApi();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
string connectionstring = builder.Configuration.GetConnectionString("Cars24DB");
builder.Services.AddSingleton<UserService>();
builder.Services.AddSingleton<CarService>();
builder.Services.AddSingleton<BookingService>();
builder.Services.AddSingleton<AppointmentService>();
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
        // Allow your frontend to connect
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});
var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
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
app.UseCors("AllowNextApp");

app.UseAuthorization();

app.MapControllers();

app.Run();

