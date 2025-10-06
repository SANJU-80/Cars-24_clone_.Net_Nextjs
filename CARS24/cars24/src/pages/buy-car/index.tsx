"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { getcarSummaries } from "@/lib/Carapi";
import { ChevronDown, Search, Sliders } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { CARS, parseBrandAndYear, estimateMaintenance } from "@/lib/maintenanceapi";

interface Car {
  id: string;
  brand: string;
  avgAnnualServiceCost: number;
  majorServiceInterval: number;
  tireLife: number;
  title: string;
  km: string;
  fuel: string;
  transmission: string;
  owner: string;
  emi: string;
  price: string;
  location: string;
  image: string;
}

function LoaderCard() {
  return (
    <div className="bg-white rounded-lg shadow-md animate-pulse overflow-hidden">
      <div className="h-48 bg-gray-200"></div>
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
      </div>
    </div>
  );
}

const IndexPage = () => {
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [cars, setCars] = useState<Car[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        // The API call fails, so `carData` never gets populated.
        const carData = await getcarSummaries();
        setCars(carData);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchCars();
  }, []);

  return (
    <div className="bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white text-black">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Filters */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold mb-4">Filters</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Price Range</label>
                  <Slider
                    defaultValue={[0, 1000000]}
                    max={1000000}
                    step={10000}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="mt-2"
                  />
                  <div className="flex justify-between mt-2 text-sm text-gray-600">
                    <span>₹{priceRange[0]}</span>
                    <span>₹{priceRange[1]}</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Brand</label>
                  <div className="space-y-2">
                    {["Maruti", "Hyundai", "Honda", "Tata", "Toyota"].map((brand) => (
                      <label key={brand} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand)}
                          onChange={(e) =>
                            setSelectedBrands((prev) =>
                              e.target.checked
                                ? [...prev, brand]
                                : prev.filter((b) => b !== brand)
                            )
                          }
                          className="mr-2"
                        />
                        <span>{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cars Grid */}
          <div className="md:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Used Cars in Delhi NCR</h1>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Input type="text" placeholder="Search cars..." className="pl-10" />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                <Button variant="outline" className="flex items-center text-white">
                  <Sliders className="h-4 w-4 mr-2" />
                  Sort
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>

            {error ? (
              <div className="text-red-600 font-semibold">🚨 {error}</div>
            ) : cars === null ? (
              Array.from({ length: 6 }).map((_, index) => <LoaderCard key={index} />)
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cars.map((car) => {
                  const { brand, year } = parseBrandAndYear(car.title);
                  const kmValue = parseInt(car.km.replace(/,/g, ""));
                  const maintenance = estimateMaintenance(brand, year, car.km);

                  return (
                    <Link
                      key={car.id}
                      href={`/buy-car/${car.id}`}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="relative h-48 bg-gray-200">
                        {car.image ? (
                          <img
                            src={car.image}
                            alt={car.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-500">
                            No Image Available
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2">{car.title}</h3>
                        <div className="flex items-center justify-between mb-2 text-sm text-gray-600">
                          <span>{car.km} km</span>
                          <span>{car.transmission}</span>
                          <span>{car.fuel}</span>
                          <span>{car.owner}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-gray-600">EMI from</div>
                            <div className="font-semibold">{car.emi}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600">Price</div>
                            <div className="font-semibold">{car.price}</div>
                          </div>
                        </div>

                        {maintenance && (
                          <div className="mt-3 space-y-2">
                            {/* Maintenance Cost Summary */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-blue-800">
                                  Est. Maintenance: ₹{maintenance.monthlyCost.toLocaleString()}/mo
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  maintenance.maintenanceLevel === 'Very High' ? 'bg-red-100 text-red-800' :
                                  maintenance.maintenanceLevel === 'High' ? 'bg-orange-100 text-orange-800' :
                                  maintenance.maintenanceLevel === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {maintenance.maintenanceLevel}
                                </span>
                              </div>
                              <div className="text-xs text-blue-700">
                                Annual: ₹{maintenance.annualCost.toLocaleString()} • Multiplier: {maintenance.multiplier}x
                              </div>
                            </div>

                            {/* Key Insights */}
                            <div className="space-y-1">
                              {maintenance.insights.slice(0, 3).map((insight, idx) => (
                                <div key={idx} className="text-xs text-gray-600 bg-gray-50 rounded px-2 py-1">
                                  {insight}
                                </div>
                              ))}
                              {maintenance.insights.length > 3 && (
                                <div className="text-xs text-blue-600 font-medium">
                                  +{maintenance.insights.length - 3} more insights
                                </div>
                              )}
                            </div>

                            {/* Service Alerts */}
                            {(maintenance.nextMajorServiceInKm < 5000 || maintenance.tireReplacementSoon || maintenance.brakePadReplacementSoon) && (
                              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                                <div className="text-xs font-semibold text-yellow-800 mb-1">Service Alerts:</div>
                                <div className="space-y-1">
                                  {maintenance.nextMajorServiceInKm < 5000 && (
                                    <div className="text-xs text-yellow-700">
                                      🔧 Service due in {maintenance.nextMajorServiceInKm.toLocaleString()} km
                                    </div>
                                  )}
                                  {maintenance.tireReplacementSoon && (
                                    <div className="text-xs text-yellow-700">🛞 Tires need replacement</div>
                                  )}
                                  {maintenance.brakePadReplacementSoon && (
                                    <div className="text-xs text-yellow-700">🛑 Brake pads due</div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="mt-2 text-xs text-gray-500">{car.location}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndexPage;
