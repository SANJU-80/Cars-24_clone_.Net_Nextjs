import React, { useEffect, useState } from "react";

import {
  Calendar,
  Clock,
  MapPin,
  Car,
  FileText,
  PenTool as Tool,
  Shield,
  AlertCircle,
  Check,
  User,
  Settings,
  Fuel,
  Gauge,
  Mail,
  Phone,
  Landmark,
  CreditCard,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getBookingbyuser } from "@/lib/Bookingapi";

const PurchasedCarsPage = () => {
  // Mock purchased cars data matching MongoDB schema
  // const purchasedCars = [
  //   {
  //     id: "1",
  //     car: {
  //       id: "car1",
  //       title: "Honda City 2020 ZX MT PETROL",
  //       image:
  //         "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  //       price: "₹8,50,000",
  //     },
  //     bookingAmount: 25000,
  //     isRefunded: false,
  //     bookingStatus: "completed",
  //     deliveryStatus: "scheduled",
  //     deliveryDate: "2024-03-20",
  //     location: "Mumbai, Maharashtra",
  //     documents: {
  //       registration: true,
  //       insurance: true,
  //       loan: "In Process",
  //     },
  //     nextServiceDate: "2024-08-15",
  //     warranty: "Valid till 2026",
  //     specs: {
  //       km: "45,000",
  //       fuel: "Petrol",
  //       transmission: "Manual",
  //     },
  //     bookedAt: "2024-02-15",
  //   },
  //   {
  //     id: "2",
  //     car: {
  //       id: "car2",
  //       title: "Hyundai i20 2019 Asta",
  //       image:
  //         "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  //       price: "₹6,75,000",
  //     },
  //     bookingAmount: 20000,
  //     isRefunded: false,
  //     bookingStatus: "completed",
  //     deliveryStatus: "delivered",
  //     deliveryDate: "2024-02-01",
  //     location: "Mumbai, Maharashtra",
  //     documents: {
  //       registration: true,
  //       insurance: true,
  //       loan: "Approved",
  //     },
  //     nextServiceDate: "2024-07-01",
  //     warranty: "Valid till 2025",
  //     specs: {
  //       km: "38,000",
  //       fuel: "Petrol",
  //       transmission: "Manual",
  //     },
  //     bookedAt: "2024-01-10",
  //   },
  // ];

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "in_transit":
        return "bg-yellow-100 text-yellow-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getLoanStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-500";
      case "In Process":
        return "bg-yellow-500";
      case "Not Started":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [purchasedCars, setpurchasedCars] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchpurchasedCars = async () => {
      try {
        if (user?.id) {
          const bookings = await getBookingbyuser(user.id);
          console.log("Bookings received:", bookings);
          
          // Handle both array and single object responses
          if (Array.isArray(bookings)) {
            setpurchasedCars(bookings);
          } else if (bookings) {
            setpurchasedCars([bookings]);
          } else {
            setpurchasedCars([]);
          }
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setpurchasedCars([]);
      } finally {
        setLoading(false);
      }
    };

    fetchpurchasedCars();
  }, [user]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }
  
  if (!purchasedCars || purchasedCars.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl font-semibold mb-2">
            Booking not found.
          </div>
          <p className="text-gray-600 mb-4">You don't have any bookings yet.</p>
          <Link
            href="/buy-car"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-block"
          >
            Browse Cars
          </Link>
        </div>
      </div>
    );
  }
  const formatPrice = (price: string | number) => {
    if (!price) return "₹ 0";
    
    // Remove any existing currency symbols, commas, and spaces
    const cleanPrice = String(price)
      .replace(/[₹,\s]/g, '')
      .replace(/[^\d.]/g, '');
    
    // Parse as number to handle decimals if any
    const numPrice = parseFloat(cleanPrice);
    
    if (isNaN(numPrice)) return "₹ 0";
    
    // Format with Indian number system (lakhs, crores)
    return "₹ " + numPrice.toLocaleString("en-IN");
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 print:py-0 print:px-0 text-black">
      <div className="mb-8 text-center print:hidden">
        <h1 className="text-3xl font-bold text-gray-800">
          Car Booking Confirmation
        </h1>
        <p className="text-gray-600">Thank you for your purchase!</p>
      </div>
      {purchasedCars.map((data: any, index: number) => {
        // Handle API response structure - backend returns { Booking, Car }
        const booking = data.Booking || data.booking || data;
        const car = data.Car || data.car || {};
        
        // Extract car data with fallbacks for different API formats
        const carId = car.Id || car.id || "";
        const carTitle = car.Title || car.title || "Car";
        const carImages = car.Images || car.images || [];
        const carImage = Array.isArray(carImages) ? carImages[0] : carImages || "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg";
        const carPrice = car.Price || car.price || "0";
        const carEmi = car.Emi || car.emi || "";
        const carLocation = car.Location || car.location || "";
        const carSpecs = car.Specs || car.specs || {};
        const carYear = carSpecs.Year || carSpecs.year || "";
        const carKm = carSpecs.Km || carSpecs.km || "";
        const carFuel = carSpecs.Fuel || carSpecs.fuel || "";
        const carTransmission = carSpecs.Transmission || carSpecs.transmission || "";
        const carOwner = carSpecs.Owner || carSpecs.owner || "";
        const carInsurance = carSpecs.Insurance || carSpecs.insurance || "";
        const carHighlights = car.Highlights || car.highlights || [];
        const carFeatures = car.Features || car.features || [];
        
        // Extract booking data
        const bookingId = booking.Id || booking.id || "";
        const bookingName = booking.Name || booking.name || "";
        const bookingPhone = booking.Phone || booking.phone || "";
        const bookingEmail = booking.Email || booking.email || "";
        const bookingAddress = booking.Address || booking.address || "";
        const bookingDate = booking.PreferredDate || booking.preferredDate || "";
        const bookingTime = booking.PreferredTime || booking.preferredTime || "";
        const bookingPaymentMethod = booking.PaymentMethod || booking.paymentMethod || "";
        const bookingLoanRequired = booking.LoanRequired || booking.loanRequired || "";
        const bookingDownPayment = booking.DownPayment || booking.downPayment || "";
        
        return (
        <div key={bookingId || index} className="max-w-5xl mx-auto bg-gray-50 rounded-lg overflow-hidden shadow-xl mb-8">
          <div className="bg-blue-900 text-white p-6 rounded-t-lg">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center mb-2">
                  <Check className="w-6 h-6 mr-2 text-green-400" />
                  <h1 className="text-2xl font-bold">Booking Confirmed</h1>
                </div>
                <p className="text-blue-200 mb-4">
                  Booking ID: {bookingId ? bookingId.slice(-8).toUpperCase() : "N/A"}
                </p>

                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-blue-300" />
                    <span>{bookingDate || "Not scheduled"}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-blue-300" />
                    <span>{bookingTime || "Not scheduled"}</span>
                  </div>
                </div>
              </div>
              <div className="hidden md:flex items-center">
                <Car className="w-12 h-12 text-blue-300" />
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="bg-white p-6 rounded-lg shadow-md mb-6 transition-all duration-300 hover:shadow-lg">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Car Image */}
                <div className="md:w-2/5 h-64 overflow-hidden rounded-lg bg-gray-200">
                  <img
                    src={carImage}
                    alt={carTitle}
                    className="w-full h-full object-cover transform transition-transform duration-700 hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg";
                    }}
                  />
                </div>

                {/* Car Details */}
                <div className="md:w-3/5">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {carTitle}
                  </h2>
                  <p className="text-gray-600 mb-4">{carLocation || "Location not specified"}</p>

                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-700">Price</p>
                      <p className="text-xl font-bold text-blue-900">
                        {formatPrice(carPrice)}
                      </p>
                    </div>
                    {carEmi && (
                      <div className="bg-amber-50 p-3 rounded-lg">
                        <p className="text-sm text-amber-700">EMI from</p>
                        <p className="text-xl font-bold text-amber-900">
                          {formatPrice(carEmi)}/month
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Car Specifications */}
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Specifications
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    {carYear && (
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                        <span className="text-gray-700">{carYear}</span>
                      </div>
                    )}
                    {carKm && (
                      <div className="flex items-center">
                        <Gauge className="w-4 h-4 mr-2 text-blue-600" />
                        <span className="text-gray-700">{carKm} km</span>
                      </div>
                    )}
                    {carFuel && (
                      <div className="flex items-center">
                        <Fuel className="w-4 h-4 mr-2 text-blue-600" />
                        <span className="text-gray-700">{carFuel}</span>
                      </div>
                    )}
                    {carTransmission && (
                      <div className="flex items-center">
                        <Settings className="w-4 h-4 mr-2 text-blue-600" />
                        <span className="text-gray-700">{carTransmission}</span>
                      </div>
                    )}
                    {carOwner && (
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-blue-600" />
                        <span className="text-gray-700">{carOwner}</span>
                      </div>
                    )}
                    {carInsurance && (
                      <div className="flex items-center">
                        <Shield className="w-4 h-4 mr-2 text-blue-600" />
                        <span className="text-gray-700">{carInsurance}</span>
                      </div>
                    )}
                  </div>

                  {/* Highlights and Features */}
                  {(carHighlights.length > 0 || carFeatures.length > 0) && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {Array.isArray(carHighlights) && carHighlights.map((highlight: any, idx: number) => (
                        <span
                          key={`highlight-${idx}`}
                          className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                        >
                          {highlight}
                        </span>
                      ))}
                      {Array.isArray(carFeatures) && carFeatures.map((feature: any, idx: number) => (
                        <span
                          key={`feature-${idx}`}
                          className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  Customer Details
                </h2>

                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="w-8 flex-shrink-0 text-gray-500">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="text-gray-800 font-medium">
                        {bookingName || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-8 flex-shrink-0 text-gray-500">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="text-gray-800 font-medium">
                        {bookingPhone || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-8 flex-shrink-0 text-gray-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-gray-800 font-medium">
                        {bookingEmail || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-8 flex-shrink-0 text-gray-500">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="text-gray-800 font-medium">
                        {bookingAddress || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-blue-600" />
                  Payment Details
                </h2>

                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-600">Car Price</span>
                    <span className="font-semibold">
                      {formatPrice(carPrice)}
                    </span>
                  </div>

                  {bookingDownPayment && (
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-gray-600">Down Payment</span>
                      <span className="font-semibold">
                        {formatPrice(bookingDownPayment)}
                      </span>
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-800 font-medium">
                        Total Amount
                      </span>
                      <span className="text-xl font-bold text-blue-900">
                        {formatPrice(carPrice)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center bg-blue-50 p-3 rounded-lg">
                    <CreditCard className="w-5 h-5 mr-3 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Payment Method</p>
                      <p className="text-gray-800 font-medium">
                        {bookingPaymentMethod || "Not specified"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center bg-blue-50 p-3 rounded-lg">
                    <Landmark className="w-5 h-5 mr-3 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Financing</p>
                      <p className="text-gray-800 font-medium">
                        {bookingLoanRequired === "yes" ? "Loan Required" : "Full Payment"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-100 p-4 text-center text-gray-500 text-sm">
            <p>
              Thank you for your purchase! For any queries, please contact our
              customer support.
            </p>
          </div>
        </div>
        );
      })}

      <div className="mt-8 text-center text-gray-500 text-sm print:hidden">
        <p>© 2025 Premium Auto Sales. All rights reserved.</p>
      </div>
    </div>
  );
};

export default PurchasedCarsPage;
