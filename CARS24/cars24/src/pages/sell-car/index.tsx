import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Check, Car, Image, FileText, DollarSign } from "lucide-react";
import Carform from "@/components/sellcar/Carform";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { createCar } from "@/lib/Carapi";
type CarDetails = {
  id: string;
  title: string;
  images: string[];
  price: string;
  emi: string;
  location: string;
  specs: {
    year: number;
    km: string;
    fuel: string;
    transmission: string;
    owner: string;
    insurance: string;
  };
  features: string[];
  highlights: string[];
};

const index = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [carDetails, setCarDetails] = useState<any>({
    title: "",
    images: [],
    price: "",
    emi: "",
    location: "",
    specs: {
      year: new Date().getFullYear(),
      km: "",
      fuel: "",
      transmission: "",
      owner: "",
      insurance: "",
    },
    features: [],
    highlights: [],
  });
  const steps = [
    { id: 1, name: "Basic Details", icon: Car },
    { id: 2, name: "Images & Specs", icon: Image },
    { id: 3, name: "Features", icon: FileText },
    { id: 4, name: "Pricing", icon: DollarSign },
  ];
  const updateCarDetails = (updatedDetails: Partial<CarDetails>) => {
    setCarDetails((prev: any) => ({
      ...prev,
      ...updatedDetails,
    }));
  };

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };
  const { user } = useAuth();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to continue");
      router.push("/login");
      return;
    }

    // Validate required fields
    if (!carDetails.title || !carDetails.price || !carDetails.location) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (carDetails.images.length === 0) {
      toast.error("Please upload at least one car image");
      return;
    }

    try {
      // Add a unique ID to the car details
      const carWithId = {
        ...carDetails,
        id: carDetails.id || uuidv4()
      };

      // Save to localStorage for immediate display
      const carForDisplay = {
        id: carWithId.id,
        brand: carWithId.title.split(' ')[0] || 'Unknown', // Extract brand from title
        avgAnnualServiceCost: 15000, // Default value
        majorServiceInterval: 10000, // Default value
        tireLife: 45000, // Default value
        title: carWithId.title,
        km: carWithId.specs.km,
        fuel: carWithId.specs.fuel,
        transmission: carWithId.specs.transmission,
        owner: carWithId.specs.owner,
        emi: carWithId.emi,
        price: carWithId.price,
        location: carWithId.location,
        image: Array.isArray(carWithId.images) ? carWithId.images[0] || '' : carWithId.images || '', // Use first uploaded image
      };
      
      console.log('Saving car to localStorage:', carForDisplay);
      console.log('Car images:', carWithId.images);
      console.log('First image:', carForDisplay.image);
      
      // saveUploadedCar(carForDisplay); // Function removed

      const car = await createCar(carWithId);
      console.log("Car created successfully:", car);
      
      const newId = car?.id || car?.Id || car?._id || carWithId.id;
      if (newId) {
        toast.success("Car listed successfully!");
        // Redirect to Buy-Car details page so the user can see the listing like in buy list
        router.push(`/buy-car/${newId}`);
      } else {
        // Fallback: go to listing page even if backend didn't return id
        toast.success("Car listed. Redirecting to listings.");
        router.push(`/buy-car`);
      }
    } catch (error: any) {
      console.error("Car creation error:", error);
      
      // More specific error handling
      if (error.message?.includes("401") || error.message?.includes("Unauthorized")) {
        toast.error("Please login to continue");
        router.push("/login");
      } else if (error.message?.includes("400") || error.message?.includes("Bad Request")) {
        toast.error("Please check your car details and try again");
      } else if (error.message?.includes("500") || error.message?.includes("Internal Server Error")) {
        toast.error("Server error. Please try again later");
      } else if (error.message?.includes("Network error") || error.message?.includes("timeout")) {
        toast.error("Network issue. Please check your internet connection and try again");
      } else {
        // For other errors, show a more helpful message
        toast.error("Unable to connect to server. Please try again later.");
      }
      
      // Don't redirect on error, let user fix the issue
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sell Your Car
          </h1>
          <p className="text-gray-600 mb-8">
            Fill in the details below to get the best price for your car
          </p>
          <div className="w-full py-4">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 
                ${
                  currentStep > step.id
                    ? "bg-green-500 border-green-500 text-white"
                    : currentStep === step.id
                    ? "border-blue-600 text-blue-600"
                    : "border-gray-300 text-gray-300"
                }
                transition-all duration-300`}
                    >
                      {currentStep > step.id ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <step.icon className="w-5 h-5" />
                      )}
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium ${
                        currentStep >= step.id
                          ? "text-gray-900"
                          : "text-gray-500"
                      }`}
                    >
                      {step.name}
                    </span>
                  </div>

                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        currentStep > index + 1 ? "bg-green-500" : "bg-gray-200"
                      } transition-all duration-300`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
          <div>
            <Carform
              carDetails={carDetails}
              updateCarDetails={updateCarDetails}
              currentStep={currentStep}
              nextStep={nextStep}
              prevStep={prevStep}
              handleSubmit={handleSubmit}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default index;
