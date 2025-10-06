const BASE_URL = "https://cars-24-clone-net-nextjs.onrender.com/api/Car";

type CarDetails = {
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
export const createCar = async (carDetails: CarDetails) => {
  // Avoid sending large data-URLs; keep only http(s) URLs
  const sanitizedImages = (carDetails.images || []).filter((src) => !src.startsWith("data:"));

  const payload = {
    Title: carDetails.title,
    Images: sanitizedImages,
    Price: carDetails.price,
    Emi: carDetails.emi,
    Location: carDetails.location,
    Specs: {
      Year: carDetails.specs.year,
      Km: carDetails.specs.km,
      Fuel: carDetails.specs.fuel,
      Transmission: carDetails.specs.transmission,
      Owner: carDetails.specs.owner,
      Insurance: carDetails.specs.insurance,
    },
    Features: carDetails.features,
    Highlights: carDetails.highlights,
  };

  const response = await fetch(`${BASE_URL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Create car failed (${response.status}): ${text}`);
  }

  return response.json();
};
export const getcarByid = async (id: string) => {
  const response = await fetch(`${BASE_URL}/${id}`);
  return response.json();
};
export const getcarSummaries = async () => {
  const response = await fetch(`${BASE_URL}/summaries`);
  return response.json();
};
