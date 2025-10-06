"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { estimateMaintenance } from '@/lib/maintenanceapi';
import { 
  Calendar, 
  Wrench, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  TrendingUp,
  Car,
  Settings
} from 'lucide-react';

interface MaintenanceEstimate {
  monthlyCost: number;
  annualCost: number;
  maintenanceLevel: "Low" | "Moderate" | "High" | "Very High";
  nextMajorServiceInKm: number;
  tireReplacementSoon: boolean;
  brakePadReplacementSoon: boolean;
  batteryReplacementSoon: boolean;
  insights: string[];
  brandImage: string;
  multiplier: number;
  age: number;
  km: number;
}

interface SavedCar {
  id: string;
  brand: string;
  year: number;
  km: string;
  nickname?: string;
  lastUpdated: Date;
  estimate: MaintenanceEstimate;
}

const MaintenanceDashboard: React.FC = () => {
  const [savedCars, setSavedCars] = useState<SavedCar[]>([]);
  const [selectedCar, setSelectedCar] = useState<SavedCar | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCar, setNewCar] = useState({ brand: '', year: '', km: '', nickname: '' });

  // Load saved cars from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('maintenanceCars');
    if (saved) {
      setSavedCars(JSON.parse(saved));
    }
  }, []);

  // Save cars to localStorage
  const saveCars = (cars: SavedCar[]) => {
    setSavedCars(cars);
    localStorage.setItem('maintenanceCars', JSON.stringify(cars));
  };

  const addCar = () => {
    if (!newCar.brand || !newCar.year || !newCar.km) return;

    const estimate = estimateMaintenance(newCar.brand, parseInt(newCar.year), newCar.km);
    if (!estimate) return;

    const car: SavedCar = {
      id: Date.now().toString(),
      brand: newCar.brand,
      year: parseInt(newCar.year),
      km: newCar.km,
      nickname: newCar.nickname || `${newCar.brand} ${newCar.year}`,
      lastUpdated: new Date(),
      estimate
    };

    const updatedCars = [...savedCars, car];
    saveCars(updatedCars);
    setNewCar({ brand: '', year: '', km: '', nickname: '' });
    setShowAddForm(false);
    setSelectedCar(car);
  };

  const removeCar = (id: string) => {
    const updatedCars = savedCars.filter(car => car.id !== id);
    saveCars(updatedCars);
    if (selectedCar?.id === id) {
      setSelectedCar(updatedCars[0] || null);
    }
  };

  const refreshEstimate = (car: SavedCar) => {
    const estimate = estimateMaintenance(car.brand, car.year, car.km);
    if (estimate) {
      const updatedCar = { ...car, estimate, lastUpdated: new Date() };
      const updatedCars = savedCars.map(c => c.id === car.id ? updatedCar : c);
      saveCars(updatedCars);
      setSelectedCar(updatedCar);
    }
  };

  const getMaintenanceLevelColor = (level: string) => {
    switch (level) {
      case 'Very High': return 'text-red-600 bg-red-50 border-red-200';
      case 'High': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getUpcomingServices = (car: SavedCar) => {
    const services = [];
    const estimate = car.estimate;

    if (estimate.nextMajorServiceInKm < 5000) {
      services.push({
        type: 'Major Service',
        due: `${estimate.nextMajorServiceInKm.toLocaleString()} km`,
        priority: 'high',
        icon: <Wrench className="h-4 w-4" />
      });
    }

    if (estimate.tireReplacementSoon) {
      services.push({
        type: 'Tire Replacement',
        due: 'Soon',
        priority: 'high',
        icon: <AlertTriangle className="h-4 w-4" />
      });
    }

    if (estimate.brakePadReplacementSoon) {
      services.push({
        type: 'Brake Pad Replacement',
        due: 'Soon',
        priority: 'medium',
        icon: <AlertTriangle className="h-4 w-4" />
      });
    }

    if (estimate.batteryReplacementSoon) {
      services.push({
        type: 'Battery Replacement',
        due: 'Soon',
        priority: 'medium',
        icon: <Settings className="h-4 w-4" />
      });
    }

    return services;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Maintenance Dashboard</h1>
        <p className="text-gray-600">Track and manage maintenance costs for all your vehicles</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Car List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">My Cars</h2>
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Car className="h-4 w-4 mr-2" />
                Add Car
              </Button>
            </div>

            {savedCars.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Car className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No cars added yet</p>
                <p className="text-sm">Add your first car to start tracking maintenance</p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedCars.map((car) => (
                  <div
                    key={car.id}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedCar?.id === car.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedCar(car)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{car.nickname}</h3>
                        <p className="text-sm text-gray-600">{car.brand} {car.year}</p>
                        <p className="text-xs text-gray-500">{car.km} km</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-blue-600">
                          ₹{car.estimate.monthlyCost.toLocaleString()}/mo
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full ${
                          car.estimate.maintenanceLevel === 'Very High' ? 'bg-red-100 text-red-800' :
                          car.estimate.maintenanceLevel === 'High' ? 'bg-orange-100 text-orange-800' :
                          car.estimate.maintenanceLevel === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {car.estimate.maintenanceLevel}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Updated {car.lastUpdated.toLocaleDateString()}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          refreshEstimate(car);
                        }}
                        className="text-xs"
                      >
                        Refresh
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Car Details */}
        <div className="lg:col-span-2">
          {selectedCar ? (
            <div className="space-y-6">
              {/* Car Overview */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedCar.nickname}</h2>
                    <p className="text-gray-600">{selectedCar.brand} {selectedCar.year} • {selectedCar.km} km</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => removeCar(selectedCar.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>

                {/* Cost Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">
                      ₹{selectedCar.estimate.monthlyCost.toLocaleString()}
                    </div>
                    <div className="text-sm text-blue-600">Monthly Cost</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">
                      ₹{selectedCar.estimate.annualCost.toLocaleString()}
                    </div>
                    <div className="text-sm text-green-600">Annual Cost</div>
                  </div>
                  <div className={`p-4 rounded-lg text-center ${getMaintenanceLevelColor(selectedCar.estimate.maintenanceLevel)}`}>
                    <Settings className="h-8 w-8 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{selectedCar.estimate.maintenanceLevel}</div>
                    <div className="text-sm">Maintenance Level</div>
                  </div>
                </div>

                {/* Upcoming Services */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Services</h3>
                  {getUpcomingServices(selectedCar).length > 0 ? (
                    <div className="space-y-3">
                      {getUpcomingServices(selectedCar).map((service, index) => (
                        <div
                          key={index}
                          className={`flex items-center p-3 rounded-lg border ${
                            service.priority === 'high'
                              ? 'bg-red-50 border-red-200'
                              : 'bg-yellow-50 border-yellow-200'
                          }`}
                        >
                          {service.icon}
                          <div className="ml-3">
                            <div className="font-medium text-gray-900">{service.type}</div>
                            <div className="text-sm text-gray-600">Due: {service.due}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-300" />
                      <p>No upcoming services</p>
                      <p className="text-sm">Your car is up to date!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Insights */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Maintenance Insights</h3>
                <div className="space-y-2">
                  {selectedCar.estimate.insights.map((insight, index) => (
                    <div key={index} className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {insight}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Car className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Car</h3>
              <p className="text-gray-600">Choose a car from the list to view detailed maintenance information</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Car Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Car</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Car Brand</label>
                <select
                  value={newCar.brand}
                  onChange={(e) => setNewCar({ ...newCar, brand: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Brand</option>
                  <option value="Maruti">Maruti</option>
                  <option value="Hyundai">Hyundai</option>
                  <option value="Honda">Honda</option>
                  <option value="Tata">Tata</option>
                  <option value="Toyota">Toyota</option>
                  <option value="Kia">Kia</option>
                  <option value="Mahindra">Mahindra</option>
                  <option value="MG">MG</option>
                  <option value="Renault">Renault</option>
                  <option value="Nissan">Nissan</option>
                  <option value="Skoda">Skoda</option>
                  <option value="Volkswagen">Volkswagen</option>
                  <option value="BMW">BMW</option>
                  <option value="Mercedes">Mercedes</option>
                  <option value="Audi">Audi</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                <Input
                  type="number"
                  value={newCar.year}
                  onChange={(e) => setNewCar({ ...newCar, year: e.target.value })}
                  placeholder="e.g., 2018"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kilometers</label>
                <Input
                  type="text"
                  value={newCar.km}
                  onChange={(e) => setNewCar({ ...newCar, km: e.target.value })}
                  placeholder="e.g., 45,000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nickname (Optional)</label>
                <Input
                  type="text"
                  value={newCar.nickname}
                  onChange={(e) => setNewCar({ ...newCar, nickname: e.target.value })}
                  placeholder="e.g., My Swift"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={addCar}
                disabled={!newCar.brand || !newCar.year || !newCar.km}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Add Car
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceDashboard;
