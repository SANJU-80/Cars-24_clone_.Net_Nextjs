using Microsoft.AspNetCore.Mvc;
using Cars24Api.Models;
using Cars24Api.Services;

namespace Cars24Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MaintenanceController : ControllerBase
    {
        private readonly MaintenanceService _maintenanceService;

        public MaintenanceController(MaintenanceService maintenanceService)
        {
            _maintenanceService = maintenanceService;
        }

        // GET: api/Maintenance
        [HttpGet]
        public async Task<ActionResult<List<Maintenance>>> GetAll()
        {
            var maintenances = await _maintenanceService.GetAllAsync();
            return Ok(maintenances);
        }

        // GET: api/Maintenance/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Maintenance>> GetById(string id)
        {
            var maintenance = await _maintenanceService.GetByIdAsynch(id);
            if (maintenance == null)
                return NotFound();
            return Ok(maintenance);
        }

        // POST: api/Maintenance
        [HttpPost]
        public async Task<ActionResult> Create([FromBody] Maintenance maintenance)
        {
            await _maintenanceService.CreateAsync(maintenance);
            return CreatedAtAction(nameof(GetById), new { id = maintenance.Id }, maintenance);
        }
    }
}