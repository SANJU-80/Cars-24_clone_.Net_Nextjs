using Cars24Api.Models;
using Cars24Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Cars24Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MaintenanceController : ControllerBase
{
    private readonly MaintenanceService _maintenanceService;

    public MaintenanceController(MaintenanceService maintenanceService)
    {
        _maintenanceService = maintenanceService;
    }

    [HttpPost("estimate")]
    public async Task<ActionResult<MaintenanceEstimate>> GetMaintenanceEstimate([FromBody] MaintenanceRequest request)
    {
        try
        {
            if (string.IsNullOrEmpty(request.Brand) || string.IsNullOrEmpty(request.Model))
            {
                return BadRequest("Brand and Model are required");
            }

            if (request.Year <= 0 || request.Mileage < 0)
            {
                return BadRequest("Valid year and mileage are required");
            }

            var estimate = await _maintenanceService.GetMaintenanceEstimate(request);
            return Ok(estimate);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("estimate/{carId}")]
    public ActionResult<MaintenanceEstimate> GetMaintenanceEstimateByCarId(string carId)
    {
        try
        {
            // This would require additional service method to fetch by car ID
            // For now, return not implemented
            return StatusCode(501, "Feature not yet implemented");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("brands")]
    public ActionResult<List<string>> GetSupportedBrands()
    {
        try
        {
            var brands = new List<string>
            {
                "Maruti", "Hyundai", "Honda", "Toyota", "Tata", "Mahindra",
                "Ford", "Volkswagen", "Skoda", "Nissan", "Renault", "Kia"
            };
            return Ok(brands);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("conditions")]
    public ActionResult<List<string>> GetConditionOptions()
    {
        try
        {
            var conditions = new List<string> { "Excellent", "Good", "Fair", "Poor" };
            return Ok(conditions);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
}
