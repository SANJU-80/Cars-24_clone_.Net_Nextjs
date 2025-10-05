"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { getcarSummaries } from "@/lib/Carapi";
import { ChevronDown, Heart, Search, Sliders } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { CARS, estimateMaintenance } from "@/lib/maintenanceapi";

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

// Helper to extract brand and year
function parseBrandAndYear(title: string) {
  const yearMatch = title.match(/^(\d{4})/);
  const year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();
  const brandMatch = title.match(/\d{4}\s+([A-Za-z]+)/);
  const brand = brandMatch ? brandMatch[1] : "";
  return { brand, year };
}

const IndexPage = () => {
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [cars, setCars] = useState<Car[] | null>(null);

  useEffect(() => {
    const fetchCars = async () => {
      const carData = await getcarSummaries();
      setCars(carData);
    };
    fetchCars();
  }, []);

  return (
    <div className="bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white text-black">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Filter */}
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
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={selectedBrands.includes(brand)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedBrands([...selectedBrands, brand]);
                            } else {
                              setSelectedBrands(selectedBrands.filter((b) => b !== brand));
                            }
                          }}
                        />
                        <span className="ml-2 text-sm">{brand}</span>
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cars === null
                ? Array.from({ length: 6 }).map((_, index) => <LoaderCard key={index} />)
                : cars.map((car) => {
                    const { brand, year } = parseBrandAndYear(car.title);
                    const maintenance = estimateMaintenance(
                      brand,
                      year,
                      car.km
                    );

                    return (
                      <Link
                        key={car.id}
                        href={`/buy-car/${car.id}`}
                        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                      >
                        <div className="relative h-48">
                          <img
                            src={car.image}
                            alt={car.title}
                            className="w-full h-full object-cover"
                          />
                          <button className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full hover:bg-white">
                            <Heart className="h-4 w-4 text-gray-500 hover:text-red-500" />
                          </button>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-lg mb-2">{car.title}</h3>
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm text-gray-600">{car.km} km</div>
                            <div className="text-sm text-gray-600">{car.transmission}</div>
                            <div className="text-sm text-gray-600">{car.fuel}</div>
                            <div className="text-sm text-gray-600">{car.owner}</div>
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
                            <div className="mt-2 text-xs text-blue-700 bg-blue-50 rounded p-2">
                              <div>
                                <strong>Est. Maintenance:</strong> ₹{maintenance.monthlyCost}/mo (
                                {maintenance.maintenanceLevel})
                              </div>
                              {maintenance.insights.map((insight, idx) => (
                                <div key={idx}>{insight}</div>
                              ))}
                            </div>
                          )}
                          <div className="mt-2 text-xs text-gray-500">{car.location}</div>
                        </div>
                      </Link>
                    );
                  })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndexPage;
