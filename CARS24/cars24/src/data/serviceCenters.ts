export interface LatLngLiteral {
  lat: number;
  lng: number;
}

export type ServiceLocationType = "service" | "pickup";

export interface ServiceCenter {
  id: string;
  name: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  type: ServiceLocationType;
  phone?: string;
  hours?: string;
}

export interface ServiceCenterWithDistance extends ServiceCenter {
  distanceKm?: number;
}

const SERVICE_CENTERS: ServiceCenter[] = [
  {
    id: "delhi-okhla",
    name: "CARS24 Mega Service Hub - Okhla",
    address: "D-186, Okhla Industrial Area Phase 1, New Delhi",
    city: "New Delhi",
    lat: 28.53657,
    lng: 77.26849,
    type: "service",
    phone: "+91-11-4000-2424",
    hours: "09:30 AM - 07:00 PM",
  },
  {
    id: "delhi-janakpuri",
    name: "CARS24 Delivery Center - Janakpuri",
    address: "B-1/2, Community Centre, Janakpuri, New Delhi",
    city: "New Delhi",
    lat: 28.62708,
    lng: 77.08273,
    type: "pickup",
    phone: "+91-11-4600-2424",
    hours: "10:00 AM - 06:30 PM",
  },
  {
    id: "mumbai-andheri",
    name: "CARS24 Service Center - Andheri",
    address: "Unit 7, Marol Co-Op Industrial Estate, Andheri East, Mumbai",
    city: "Mumbai",
    lat: 19.10497,
    lng: 72.8716,
    type: "service",
    phone: "+91-22-3900-2424",
    hours: "09:30 AM - 07:30 PM",
  },
  {
    id: "mumbai-nerul",
    name: "CARS24 Delivery Hub - Nerul",
    address: "Plot 10, Sector 19A, Near Nerul Railway Station, Navi Mumbai",
    city: "Mumbai",
    lat: 19.03302,
    lng: 73.02966,
    type: "pickup",
    phone: "+91-22-3700-2424",
    hours: "10:00 AM - 06:00 PM",
  },
  {
    id: "bengaluru-krpuram",
    name: "CARS24 Flagship Store - KR Puram",
    address: "No. 54, Old Madras Road, KR Puram, Bengaluru",
    city: "Bengaluru",
    lat: 13.00787,
    lng: 77.70349,
    type: "service",
    phone: "+91-80-4500-2424",
    hours: "09:00 AM - 08:00 PM",
  },
  {
    id: "bengaluru-btm",
    name: "CARS24 Pickup Point - BTM Layout",
    address: "17th Main Rd, BTM 2nd Stage, Bengaluru",
    city: "Bengaluru",
    lat: 12.91605,
    lng: 77.61011,
    type: "pickup",
    phone: "+91-80-4800-2424",
    hours: "10:00 AM - 07:00 PM",
  },
  {
    id: "hyderabad-hitech",
    name: "CARS24 Service Hub - HITEC City",
    address: "1-90/2, Silicon Valley, Madhapur, Hyderabad",
    city: "Hyderabad",
    lat: 17.44774,
    lng: 78.37665,
    type: "service",
    phone: "+91-40-4700-2424",
    hours: "09:30 AM - 07:00 PM",
  },
  {
    id: "hyderabad-banjara",
    name: "CARS24 Delivery Lounge - Banjara Hills",
    address: "Road Number 12, Banjara Hills, Hyderabad",
    city: "Hyderabad",
    lat: 17.41276,
    lng: 78.43461,
    type: "pickup",
    phone: "+91-40-4900-2424",
    hours: "10:00 AM - 06:30 PM",
  },
  {
    id: "pune-hinjewadi",
    name: "CARS24 Service Center - Hinjewadi",
    address: "Survey 35/3, Rajiv Gandhi Infotech Park, Hinjewadi, Pune",
    city: "Pune",
    lat: 18.59177,
    lng: 73.73828,
    type: "service",
    phone: "+91-20-4600-2424",
    hours: "09:30 AM - 07:00 PM",
  },
  {
    id: "pune-koregaon",
    name: "CARS24 Pickup Zone - Koregaon Park",
    address: "Lane 6, Koregaon Park, Pune",
    city: "Pune",
    lat: 18.53865,
    lng: 73.89337,
    type: "pickup",
    phone: "+91-20-4800-2424",
    hours: "10:30 AM - 06:30 PM",
  },
];

const normalize = (value: string | undefined | null) =>
  value ? value.trim().toLowerCase() : "";

export const haversineDistanceKm = (a: LatLngLiteral, b: LatLngLiteral): number => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const sinHalfLat = Math.sin(dLat / 2);
  const sinHalfLng = Math.sin(dLng / 2);

  const haversine =
    sinHalfLat * sinHalfLat +
    Math.cos(lat1) * Math.cos(lat2) * sinHalfLng * sinHalfLng;

  const angularDistance = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

  return Math.round((earthRadiusKm * angularDistance + Number.EPSILON) * 100) / 100;
};

export const getServiceCentersByCity = (city: string): ServiceCenter[] => {
  const normalized = normalize(city);
  return SERVICE_CENTERS.filter((center) => normalize(center.city) === normalized);
};

export const getServiceCentersNearCoordinates = (
  coordinates: LatLngLiteral,
  options: { limit?: number; radiusKm?: number } = {}
): ServiceCenterWithDistance[] => {
  const { limit = 6, radiusKm = 75 } = options;

  const withDistance = SERVICE_CENTERS.map<ServiceCenterWithDistance>((center) => ({
    ...center,
    distanceKm: haversineDistanceKm(coordinates, { lat: center.lat, lng: center.lng }),
  }));

  const filtered = withDistance
    .filter((center) => center.distanceKm === undefined || center.distanceKm <= radiusKm)
    .sort((a, b) => {
      if (a.distanceKm === undefined) return 1;
      if (b.distanceKm === undefined) return -1;
      return a.distanceKm - b.distanceKm;
    });

  return filtered.slice(0, limit);
};

export const getServiceCentersForLocation = (
  options: {
    city?: string;
    coordinates?: LatLngLiteral;
    limit?: number;
    radiusKm?: number;
  }
): ServiceCenterWithDistance[] => {
  const { city, coordinates, limit = 6, radiusKm = 75 } = options;

  const byCity = city ? getServiceCentersByCity(city) : [];

  const annotatedCityCenters = coordinates
    ? byCity.map<ServiceCenterWithDistance>((center) => ({
        ...center,
        distanceKm: haversineDistanceKm(coordinates, { lat: center.lat, lng: center.lng }),
      }))
    : byCity;

  if (annotatedCityCenters.length >= limit) {
    return annotatedCityCenters.slice(0, limit);
  }

  const remaining = limit - annotatedCityCenters.length;

  if (!coordinates) {
    return annotatedCityCenters;
  }

  const nearest = getServiceCentersNearCoordinates(coordinates, {
    limit: remaining,
    radiusKm,
  }).filter((center) => !byCity.some((existing) => existing.id === center.id));

  return [...annotatedCityCenters, ...nearest].slice(0, limit);
};

export const getDefaultServiceCenters = () => SERVICE_CENTERS;


