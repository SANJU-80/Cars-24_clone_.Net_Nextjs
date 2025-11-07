import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { createBooking } from "@/lib/Bookingapi";
import { getcarByid } from "@/lib/Carapi";
import {
  AlertCircle,
  Calendar,
  Clock,
  CreditCard,
  MapPin,
  Phone,
  User,
  Mail,
} from "lucide-react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
const carDetails = {
  id: "fronx-2023",
  title: "2023 Maruti FRONX DELTA PLUS 1.2L AGS",
  images: [
    "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg",
    "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg",
    "https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg",
  ],
  price: "₹7.80 lakh",
  emi: "₹15,245/month",
  location: "Metro Walk, Rohini, New Delhi",
  specs: {
    year: 2023,
    km: "10,048",
    fuel: "Petrol",
    transmission: "Automatic",
    owner: "1st owner",
    insurance: "Valid till 2024",
  },
  features: [
    "Power Steering",
    "Power Windows",
    "Air Conditioning",
    "Driver Airbag",
    "Passenger Airbag",
    "Alloy Wheels",
  ],
  highlights: [
    "Single owner vehicle",
    "All original documents",
    "Non-accidental",
    "Fully maintained",
  ],
};
const index = () => {
  // All hooks must be called at the top level, before any conditional returns
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [formData, setformData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    preferredDate: "",
    preferredTime: "",
    paymentMethod: "",
    loanRequired: "no",
    downPayment: "",
  });
  const [carDetails, setcarDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [step, setstep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (!id) return;
    async function fetchCar() {
      try {
        const data = await getcarByid(id as string);
        console.log("Car data received:", data);
        if (data && (data.Id || data.id || data.Title || data.title)) {
          setcarDetails(data);
        } else {
          console.error("Invalid car data received:", data);
          setcarDetails(null);
        }
      } catch (error) {
        console.error("Error fetching car:", error);
        setcarDetails(null);
        toast.error(error instanceof Error ? error.message : "Failed to load car details");
      } finally {
        setLoading(false);
      }
    }
    fetchCar();
  }, [id]);
  
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setformData((Prev) => ({
      ...Prev,
      [name]: value,
    }));
  };
  
  // Conditional returns must come after all hooks
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading car details...</p>
        </div>
      </div>
    );
  }
  
  if (!carDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl font-semibold mb-2">
            Car details not found.
          </div>
          <p className="text-gray-600 mb-4">The car you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => router.push('/buy-car')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Browse All Cars
          </button>
        </div>
      </div>
    );
  }
  
  const handlesubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please login to continue");
      router.push('/login');
      return;
    }
    
    // Validate all required fields
    if (!formData.name || !formData.phone || !formData.email) {
      toast.error("Please fill in all required personal information");
      setstep(1);
      return;
    }
    
    if (!formData.preferredDate || !formData.preferredTime || !formData.address) {
      toast.error("Please fill in all visit details");
      setstep(2);
      return;
    }
    
    if (!formData.paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }
    
    // Validate date is in the future
    const selectedDate = new Date(formData.preferredDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      toast.error("Please select a future date for your visit");
      setstep(2);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Format booking data to match backend model (PascalCase)
      const booking = {
        CarId: id as string,
        Name: formData.name,
        Phone: formData.phone,
        Email: formData.email,
        Address: formData.address,
        PreferredDate: formData.preferredDate,
        PreferredTime: formData.preferredTime,
        PaymentMethod: formData.paymentMethod,
        LoanRequired: formData.paymentMethod === "loan" ? "yes" : "no",
        DownPayment: formData.downPayment || "",
      };
      
      console.log("Submitting booking:", booking);
      console.log("User ID:", user.id);
      
      const response = await createBooking(user.id, booking);
      
      console.log("Booking response:", response);
      
      if (response && (response.Id || response.id)) {
        toast.success("Booking created successfully! Redirecting to your bookings...");
        setTimeout(() => {
          router.push(`/bookings`);
        }, 1500);
      } else {
        throw new Error("Booking creation failed - no ID returned");
      }
    } catch (error: any) {
      console.error("Error creating booking:", error);
      const errorMessage = error?.message || error?.response?.data?.message || "Failed to create booking. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validatestep = () => {
    if (step === 1) {
      return formData.name && formData.phone && formData.email;
    }
    if (step === 2) {
      if (!formData.preferredDate || !formData.preferredTime) {
        return false;
      }
      // Validate that the date is in the future
      const selectedDate = new Date(formData.preferredDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        toast.error("Please select a future date");
        return false;
      }
      return true;
    }
    return true;
  };
  const availableTimes = [
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
  ];

  // Transform car data to handle different API response formats
  const carImage = Array.isArray(carDetails.Images) 
    ? carDetails.Images[0] || carDetails.images?.[0] || ""
    : Array.isArray(carDetails.images)
    ? carDetails.images[0] || ""
    : carDetails.image || carDetails.Images || "";
  
  const carTitle = carDetails.Title || carDetails.title || "Car";
  const carId = carDetails.Id || carDetails.id || "";
  const carPrice = carDetails.Price || carDetails.price || "0";
  const carEmi = carDetails.Emi || carDetails.emi || "0";
  const carLocation = carDetails.Location || carDetails.location || "Location not specified";
  const carKm = carDetails.Specs?.Km || carDetails.specs?.km || carDetails.km || "0";
  const carYear = carDetails.Specs?.Year || carDetails.specs?.year || "";
  const carFuel = carDetails.Specs?.Fuel || carDetails.specs?.fuel || "";
  const carTransmission = carDetails.Specs?.Transmission || carDetails.specs?.transmission || "";
  const carOwner = carDetails.Specs?.Owner || carDetails.specs?.owner || "";

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Car Details Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              {/* Car Image */}
              <div className="mb-6">
                <img
                  src={carImage}
                  alt={carTitle}
                  className="w-full h-80 object-cover rounded-lg"
                />
              </div>

              {/* Title and ID */}
              <h2 className="text-3xl font-bold mb-2">{carTitle}</h2>
              <p className="text-sm text-gray-500 mb-6">ID: {carId}</p>

              {/* Price and Location */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-4xl font-bold text-blue-600 mb-2">
                    ₹{carPrice}
                  </p>
                  <p className="text-lg text-gray-700">EMI from ₹{carEmi}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg text-gray-700">{carLocation}</p>
                  <p className="text-sm text-gray-600">
                    {carKm} driven
                  </p>
                </div>
              </div>

              {/* Specs Grid - Only 4 boxes as shown in image */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Year</p>
                  <p className="text-lg font-semibold text-gray-900">{carYear}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Fuel Type</p>
                  <p className="text-lg font-semibold text-gray-900">{carFuel}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Transmission</p>
                  <p className="text-lg font-semibold text-gray-900">{carTransmission}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Owner</p>
                  <p className="text-lg font-semibold text-gray-900">{carOwner}</p>
                </div>
              </div>
            </div>
            {/* Purchase Form */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-3xl font-bold mb-8">
                Complete Your Purchase
              </h2>

              {/* Progress Indicator */}
              <div className="mb-8">
                <div className="flex items-center justify-center space-x-2">
                  {[1, 2, 3].map((stepNumber) => (
                    <React.Fragment key={stepNumber}>
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-semibold ${
                          step === stepNumber
                            ? "bg-blue-600 text-white shadow-lg"
                            : step > stepNumber
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {step > stepNumber ? "✓" : stepNumber}
                      </div>
                      {stepNumber < 3 && (
                        <div
                          className={`w-16 h-1 ${
                            step > stepNumber ? "bg-green-500" : "bg-gray-200"
                          }`}
                        ></div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <form onSubmit={handlesubmit} className="space-y-6">
                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                        <User className="w-5 h-5 mr-2 text-gray-600" />
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                        required
                      />
                    </div>
                    <div>
                      <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                        <Phone className="w-5 h-5 mr-2 text-gray-600" />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter your phone number"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                        required
                      />
                    </div>
                    <div>
                      <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                        <Mail className="w-5 h-5 mr-2 text-gray-600" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email address"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                        required
                      />
                    </div>
                  </div>
                )}
                {step === 2 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Calendar className="w-4 h-4 inline mr-1" /> Preferred
                        Visit Date
                      </label>
                      <Input
                        type="date"
                        name="preferredDate"
                        value={formData.preferredDate}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Please select a future date
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Clock className="w-4 h-4 inline mr-1" /> Preferred Time
                      </label>
                      <select
                        name="preferredTime"
                        value={formData.preferredTime}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Select a time</option>
                        {availableTimes.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <MapPin className="w-4 h-4 inline mr-1" /> Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                )}
                {step === 3 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <CreditCard className="w-4 h-4 inline mr-1" /> Payment
                        Method
                      </label>
                      <select
                        name="paymentMethod"
                        value={formData.paymentMethod}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Select payment method</option>
                        <option value="full">Full Payment</option>
                        <option value="loan">Car Loan</option>
                      </select>
                    </div>
                    {formData.paymentMethod === "loan" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Down Payment Amount
                        </label>
                        <input
                          type="text"
                          name="downPayment"
                          value={formData.downPayment}
                          onChange={handleInputChange}
                          placeholder="Enter amount"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    )}

                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="flex items-start">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" />
                        <div>
                          <h4 className="text-sm font-medium text-yellow-800">
                            Required Documents
                          </h4>
                          <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
                            <li>Valid ID Proof</li>
                            <li>Address Proof</li>
                            <li>Income Proof (for loan)</li>
                            <li>Bank Statements (for loan)</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex justify-between pt-6">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={() => setstep(step - 1)}
                      className="px-6 py-3 text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-all"
                    >
                      Back
                    </button>
                  )}

                  {step < 3 ? (
                    <button
                      type="button"
                      onClick={() => validatestep() && setstep(step + 1)}
                      className={`px-8 py-3 rounded-lg text-white font-semibold transition-all ${
                        validatestep()
                          ? "bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl"
                          : "bg-gray-400 cursor-not-allowed"
                      } ${step === 1 ? "ml-auto" : ""}`}
                      disabled={!validatestep()}
                    >
                      Continue
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`px-8 py-3 bg-green-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all ml-auto ${
                        isSubmitting 
                          ? "opacity-50 cursor-not-allowed" 
                          : "hover:bg-green-700"
                      }`}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                          Processing...
                        </span>
                      ) : (
                        "Complete Purchase"
                      )}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default index;

export async function getServerSideProps() {
  return {
    props: {},
  };
}
