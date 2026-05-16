export interface CityGuide {
  id: string;
  city: string;
  state: string;
  emoji: string;
  latitude: number;
  longitude: number;
  overview: string;
  highlights: string[];
  restaurants: Restaurant[];
  budgetTips: BudgetTip[];
  avgMonthlyCost: number;
  minWage: number;
}

export interface Restaurant {
  name: string;
  type: string;
  avgPrice: string;
  rating: number;
  studentFriendly: boolean;
}

export interface BudgetTip {
  category: string;
  tip: string;
  monthlyCost: string;
}

export const CITY_GUIDES: CityGuide[] = [
  {
    id: "orlando",
    city: "Orlando",
    state: "Florida",
    emoji: "🏰",
    latitude: 28.5383,
    longitude: -81.3792,
    overview:
      "Florida'nın eğlence başkenti Orlando, Work & Travel öğrencileri için en popüler destinasyonlardan biri. Disney World, Universal Studios ve SeaWorld gibi dev parklarda çalışma imkânı sunar. Subtropical iklimi, geniş iş piyasası ve canlı sosyal hayatı ile harika bir deneyim vadeder.",
    highlights: [
      "Disney World & Universal Studios yakınlığı",
      "Saatlik asgari ücret: $12.00",
      "Toplu taşıma: Lynx Bus sistemi",
      "Türk toplulukları mevcut",
    ],
    restaurants: [
      {
        name: "Chipotle Mexican Grill",
        type: "Fast Casual",
        avgPrice: "$10-14",
        rating: 4.2,
        studentFriendly: true,
      },
      {
        name: "Panda Express",
        type: "Fast Food",
        avgPrice: "$8-12",
        rating: 3.9,
        studentFriendly: true,
      },
      {
        name: "Wawa",
        type: "Convenience / Deli",
        avgPrice: "$5-9",
        rating: 4.5,
        studentFriendly: true,
      },
      {
        name: "Olive Garden",
        type: "Italian",
        avgPrice: "$15-25",
        rating: 4.1,
        studentFriendly: false,
      },
      {
        name: "Tijuana Flats",
        type: "Tex-Mex",
        avgPrice: "$9-13",
        rating: 4.3,
        studentFriendly: true,
      },
    ],
    budgetTips: [
      {
        category: "🏠 Konaklama",
        tip: "Şehir merkezinden uzakta ev tut, ulaşım için bisiklet kirala",
        monthlyCost: "$600-900",
      },
      {
        category: "🍔 Yemek",
        tip: "Walmart ve Publix'ten haftalık market alışverişi yap",
        monthlyCost: "$250-350",
      },
      {
        category: "🚌 Ulaşım",
        tip: "Lynx bus aylık pass al, park günleri için bisiklet kullan",
        monthlyCost: "$65-120",
      },
      {
        category: "📱 İletişim",
        tip: "Mint Mobile veya T-Mobile prepaid, 15GB $35/ay",
        monthlyCost: "$35-50",
      },
    ],
    avgMonthlyCost: 1100,
    minWage: 12.0,
  },
  {
    id: "new-york",
    city: "New York City",
    state: "New York",
    emoji: "🗽",
    latitude: 40.7128,
    longitude: -74.006,
    overview:
      "Dünyanın en ikonik şehri NYC, yüksek yaşam maliyetine karşın sunduğu olağanüstü deneyimler ve networking fırsatlarıyla öne çıkar. Restoran, otel ve perakende sektörlerinde yoğun iş imkânı sunar. Metro ağı sayesinde araç gerekmez.",
    highlights: [
      "New York asgari ücreti: $16.50/saat (en yüksek)",
      "NYC Metro ile şehrin her yerine ulaşım",
      "Çok kültürlü ve Türk nüfusu yüksek",
      "Yoğun iş piyasası - turizm, F&B, retail",
    ],
    restaurants: [
      {
        name: "Halal Guys",
        type: "Middle Eastern",
        avgPrice: "$8-12",
        rating: 4.4,
        studentFriendly: true,
      },
      {
        name: "Xi'an Famous Foods",
        type: "Chinese",
        avgPrice: "$10-15",
        rating: 4.6,
        studentFriendly: true,
      },
      {
        name: "Shake Shack",
        type: "Burger",
        avgPrice: "$12-18",
        rating: 4.3,
        studentFriendly: true,
      },
      {
        name: "Gray's Papaya",
        type: "Hot Dog",
        avgPrice: "$3-7",
        rating: 4.2,
        studentFriendly: true,
      },
      {
        name: "Joe's Pizza",
        type: "Pizza",
        avgPrice: "$3-5 per slice",
        rating: 4.5,
        studentFriendly: true,
      },
    ],
    budgetTips: [
      {
        category: "🏠 Konaklama",
        tip: "Brooklyn veya Queens'te paylaşımlı oda tut - Manhattan çok pahalı",
        monthlyCost: "$900-1400",
      },
      {
        category: "🍔 Yemek",
        tip: "Trader Joe's ve Aldi'den alışveriş, halal cart yemeklerini dene",
        monthlyCost: "$350-500",
      },
      {
        category: "🚇 Ulaşım",
        tip: "Monthly MetroCard al ($132), ek ulaşım masrafı yoktur",
        monthlyCost: "$132",
      },
      {
        category: "🎭 Eğlence",
        tip: "Museums ücretsiz Cuma akşamları, Central Park, Brooklyn Bridge bedava",
        monthlyCost: "$50-150",
      },
    ],
    avgMonthlyCost: 2000,
    minWage: 16.5,
  },
  {
    id: "los-angeles",
    city: "Los Angeles",
    state: "California",
    emoji: "🎬",
    latitude: 34.0522,
    longitude: -118.2437,
    overview:
      "Güneş, plajlar ve Hollywood - LA, Work & Travel için benzersiz bir deneyim sunar. Eğlence sektörü, restoran ve konaklama iş fırsatları açısından zengindir. Araba olmadan yaşamak zor olsa da, toplu taşıma seçenekleri giderek gelişmektedir.",
    highlights: [
      "California asgari ücreti: $16.50/saat",
      "Hollywood, Santa Monica, Venice Beach",
      "Büyük Türk-Amerikan topluluğu",
      "Yıl boyunca güneşli iklim",
    ],
    restaurants: [
      {
        name: "In-N-Out Burger",
        type: "Fast Food",
        avgPrice: "$7-12",
        rating: 4.6,
        studentFriendly: true,
      },
      {
        name: "Erewhon",
        type: "Organic / Healthy",
        avgPrice: "$15-30",
        rating: 4.1,
        studentFriendly: false,
      },
      {
        name: "Tacos 1986",
        type: "Mexican",
        avgPrice: "$8-14",
        rating: 4.7,
        studentFriendly: true,
      },
      {
        name: "Gjusta",
        type: "Bakery / Deli",
        avgPrice: "$10-18",
        rating: 4.5,
        studentFriendly: true,
      },
      {
        name: "Zankou Chicken",
        type: "Mediterranean",
        avgPrice: "$9-15",
        rating: 4.4,
        studentFriendly: true,
      },
    ],
    budgetTips: [
      {
        category: "🏠 Konaklama",
        tip: "Koreatown veya Mid-City'de oda paylaşımı - West LA ve Santa Monica pahalı",
        monthlyCost: "$800-1200",
      },
      {
        category: "🚗 Ulaşım",
        tip: "Metro Rail ve Dash bus kullan, Uber paylaşımı dene - araba gerek yok",
        monthlyCost: "$100-200",
      },
      {
        category: "🍔 Yemek",
        tip: "Farmer's markets ve Trader Joe's - sağlıklı ve uygun fiyatlı",
        monthlyCost: "$300-450",
      },
      {
        category: "🏖️ Eğlence",
        tip: "Plajlar bedava, Griffith Observatory ücretsiz, LA hikaye her köşede",
        monthlyCost: "$50-100",
      },
    ],
    avgMonthlyCost: 1700,
    minWage: 16.5,
  },
  {
    id: "miami",
    city: "Miami",
    state: "Florida",
    emoji: "🌴",
    latitude: 25.7617,
    longitude: -80.1918,
    overview:
      "Miami, Latin kültürünün ABD'deki kalbi. Türkçe ve İspanyolca bilen öğrenciler için inanılmaz fırsatlar sunar. Turizm ve konaklama sektörü yıl boyunca aktiftir. South Beach ve Wynwood gibi trendy bölgeler hareketli bir sosyal hayat vadeder.",
    highlights: [
      "Florida asgari ücreti: $13.00/saat",
      "Yıl boyunca tropik iklim",
      "Latin ve Türk kültürünün buluşması",
      "Yoğun turizm ve otel sektörü",
    ],
    restaurants: [
      {
        name: "Versailles Restaurant",
        type: "Cuban",
        avgPrice: "$12-20",
        rating: 4.3,
        studentFriendly: true,
      },
      {
        name: "Zak the Baker",
        type: "Bakery",
        avgPrice: "$8-15",
        rating: 4.5,
        studentFriendly: true,
      },
      {
        name: "La Moon",
        type: "Colombian",
        avgPrice: "$10-16",
        rating: 4.2,
        studentFriendly: true,
      },
      {
        name: "Casablanca Seafood",
        type: "Seafood",
        avgPrice: "$18-35",
        rating: 4.4,
        studentFriendly: false,
      },
      {
        name: "Pollo Tropical",
        type: "Caribbean Fast Food",
        avgPrice: "$7-11",
        rating: 4.0,
        studentFriendly: true,
      },
    ],
    budgetTips: [
      {
        category: "🏠 Konaklama",
        tip: "Hialeah veya North Miami'de kal - South Beach çok pahalı",
        monthlyCost: "$650-950",
      },
      {
        category: "🚌 Ulaşım",
        tip: "Metrorail ve Metrobus kullan, aylık pas $112.50",
        monthlyCost: "$112",
      },
      {
        category: "🍔 Yemek",
        tip: "Little Havana ve Hialeah'da yerel restoranlar çok ucuz",
        monthlyCost: "$250-380",
      },
      {
        category: "☀️ Eğlence",
        tip: "Plajlar bedava, South Beach yürüyüşleri, Bayside Marketplace",
        monthlyCost: "$40-100",
      },
    ],
    avgMonthlyCost: 1200,
    minWage: 13.0,
  },
  {
    id: "chicago",
    city: "Chicago",
    state: "Illinois",
    emoji: "🌆",
    latitude: 41.8781,
    longitude: -87.6298,
    overview:
      "The Windy City, Work & Travel öğrencilerine yoğun bir şehir deneyimi ve güçlü bir iş piyasası sunar. Mimari güzelliği, müzik sahnesi ve dünyaca ünlü derin tabak pizzaları ile benzersizdir. Kışlar sert olsa da yaz mevsimi harika etkinliklerle doludur.",
    highlights: [
      "Illinois asgari ücreti: $14.00/saat",
      "Chicago CTA (toplu taşıma) çok gelişmiş",
      "Deep dish pizza, blues müzik, Magnificent Mile",
      "İşçi dostu şehir - güçlü sendikalar",
    ],
    restaurants: [
      {
        name: "Lou Malnati's",
        type: "Deep Dish Pizza",
        avgPrice: "$15-25",
        rating: 4.6,
        studentFriendly: true,
      },
      {
        name: "Harold's Chicken",
        type: "Fried Chicken",
        avgPrice: "$8-14",
        rating: 4.3,
        studentFriendly: true,
      },
      {
        name: "Portillo's",
        type: "Hot Dogs / Italian Beef",
        avgPrice: "$8-13",
        rating: 4.5,
        studentFriendly: true,
      },
      {
        name: "Cerebelly",
        type: "American",
        avgPrice: "$20-40",
        rating: 4.4,
        studentFriendly: false,
      },
      {
        name: "Eataly Chicago",
        type: "Italian Market",
        avgPrice: "$12-22",
        rating: 4.3,
        studentFriendly: true,
      },
    ],
    budgetTips: [
      {
        category: "🏠 Konaklama",
        tip: "Logan Square veya Pilsen'de kal, downtown'dan uzakta uygun fiyatlı",
        monthlyCost: "$700-1000",
      },
      {
        category: "🚇 Ulaşım",
        tip: "CTA monthly pass $105 - metro ve otobüs ile her yere gidilir",
        monthlyCost: "$105",
      },
      {
        category: "🍔 Yemek",
        tip: "Devon Ave'de Orta Doğu marketleri, Whole Foods alternatifi Aldi",
        monthlyCost: "$280-400",
      },
      {
        category: "❄️ Kış Hazırlığı",
        tip: "Kaliteli mont ve bot al - kış çok sert, ama iç mekânlar çok sıcak",
        monthlyCost: "$100 (tek seferlik)",
      },
    ],
    avgMonthlyCost: 1300,
    minWage: 14.0,
  },
];
