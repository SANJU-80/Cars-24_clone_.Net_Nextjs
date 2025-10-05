
const BASE_URL = "https://cars-24-clone-net-nextjs-vypo.onrender.com/api/Cars";

export async function getcarSummaries() {
  const res = await fetch(BASE_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch cars: ${res.statusText}`);
  }

  const data = await res.json();

  // ✅ Map backend data to frontend structure
  return data.map((item: any) => ({
    id: item.id || item._id,
    title: item.title || item.Brand || "Unknown Car",
    brand: item.Brand || "Unknown",
    km: item.Km || "0",
    fuel: item.Fuel || "Petrol",
    transmission: item.Transmission || "Manual",
    owner: item.Owner || "1st owner",
    emi: item.Emi || "₹0/m",
    price: item.Price || "N/A",
    location: item.Location || "Unknown",
    image:
      item.Image ||
      item.BrandImage ||
      "https://via.placeholder.com/400x300?text=No+Image",
  }));
}

export async function getcarByid(id: string) {
  const res = await fetch(`${BASE_URL}/${id}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch car with id: ${id}`);
  }
  return res.json();
}

export async function createCar(carData: any) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(carData),
  });

  if (!res.ok) {
    throw new Error("Failed to create car record");
  }

  return res.json();
}
