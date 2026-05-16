export interface MockFlight {
  id: string;
  from: string;
  to: string;
  airline: string;
  airlineLogo: string;
  price: number;
  currency: string;
  duration: string;
  stops: number;
  departure: string;
  arrival: string;
  date: string;
}

export const MOCK_FLIGHTS: MockFlight[] = [
  {
    id: "f1",
    from: "Istanbul (IST)",
    to: "Orlando (MCO)",
    airline: "Turkish Airlines",
    airlineLogo: "✈️",
    price: 620,
    currency: "USD",
    duration: "12s 45dk",
    stops: 0,
    departure: "10:45",
    arrival: "16:30",
    date: "2025-06-15",
  },
  {
    id: "f2",
    from: "Istanbul (IST)",
    to: "Orlando (MCO)",
    airline: "Lufthansa",
    airlineLogo: "✈️",
    price: 548,
    currency: "USD",
    duration: "14s 20dk",
    stops: 1,
    departure: "08:20",
    arrival: "22:40",
    date: "2025-06-15",
  },
  {
    id: "f3",
    from: "Istanbul (IST)",
    to: "Orlando (MCO)",
    airline: "United Airlines",
    airlineLogo: "✈️",
    price: 495,
    currency: "USD",
    duration: "16s 05dk",
    stops: 1,
    departure: "14:10",
    arrival: "06:15+1",
    date: "2025-06-15",
  },
  {
    id: "f4",
    from: "Istanbul (IST)",
    to: "Orlando (MCO)",
    airline: "Air France",
    airlineLogo: "✈️",
    price: 512,
    currency: "USD",
    duration: "13s 50dk",
    stops: 1,
    departure: "11:30",
    arrival: "01:20+1",
    date: "2025-06-20",
  },
];

export const NEAREST_AIRPORTS = [
  {
    id: "mco",
    name: "Orlando International Airport",
    code: "MCO",
    distance: "22 km",
    latitude: 28.4312,
    longitude: -81.3081,
  },
  {
    id: "sfb",
    name: "Orlando Sanford International",
    code: "SFB",
    distance: "50 km",
    latitude: 28.7776,
    longitude: -81.2375,
  },
];
