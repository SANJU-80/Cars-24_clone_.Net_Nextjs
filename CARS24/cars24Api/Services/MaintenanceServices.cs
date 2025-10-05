using Cars24Api.Models;
using MongoDB.Driver;

namespace Cars24Api.Services
{
    public class MaintenanceService
    {
        private readonly IMongoCollection<Maintenance> _maintenances;
        public MaintenanceService(IConfiguration config)
        {
            var client = new MongoClient(config.GetConnectionString("Cars24DB"));
            var database = client.GetDatabase(config["MongoDB:DatabaseName"]);
            _maintenances = database.GetCollection<Maintenance>("Maintenances");
        }
        public async Task CreateAsync(Maintenance maintenance)
        {
            await _maintenances.InsertOneAsync(maintenance);
        }

        public async Task<Maintenance> GetByIdAsynch(string id)
        {
            return await _maintenances.Find(a => a.Id == id).FirstOrDefaultAsync();
        }

        public async Task<List<Maintenance>> GetAllAsync()
        {
            return await _maintenances.Find(_ => true).ToListAsync();
        }
    }
}