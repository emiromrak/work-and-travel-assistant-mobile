import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { fetchDistance } from "../services/api";
import { useUser } from "../context/UserContext";
import CitySearchInput from "../components/CitySearchInput";

// ─── Tipler ───────────────────────────────────────────────────────────────────
interface DistanceInfo {
  durum: boolean;
  mesafe?: string;
  benim_sehir?: string;
  hedef_koor?: [number, number];
  benim_koor?: [number, number];
}

interface AirportInfo {
  id: string;
  name: string;
  code: string;
  distance: string;
  latitude: number;
  longitude: number;
}

interface FlightInfo {
  id: string;
  airline: string;
  airlineLogo: string;
  price: number;
  duration: string;
  stops: number;
  departure: string;
  arrival: string;
  date: string;
  fromCode?: string;
  toCode?: string;
}

// ─── Fallback: Bilinen şehirler için mock havalimanı & uçuş verisi ─────────────
const MOCK_AIRPORTS: Record<string, AirportInfo[]> = {
  "orlando": [
    { id: "mco", name: "Orlando International", code: "MCO", distance: "22 km", latitude: 28.4312, longitude: -81.3081 },
    { id: "sfb", name: "Orlando Sanford International", code: "SFB", distance: "50 km", latitude: 28.7776, longitude: -81.2375 },
  ],
  "new york": [
    { id: "jfk", name: "John F. Kennedy International", code: "JFK", distance: "26 km", latitude: 40.6413, longitude: -73.7781 },
    { id: "lga", name: "LaGuardia Airport", code: "LGA", distance: "15 km", latitude: 40.7769, longitude: -73.874 },
  ],
  "los angeles": [
    { id: "lax", name: "Los Angeles International", code: "LAX", distance: "24 km", latitude: 33.9416, longitude: -118.4085 },
  ],
  "miami": [
    { id: "mia", name: "Miami International Airport", code: "MIA", distance: "13 km", latitude: 25.7959, longitude: -80.287 },
    { id: "fll", name: "Fort Lauderdale-Hollywood", code: "FLL", distance: "45 km", latitude: 26.0742, longitude: -80.1506 },
  ],
  "chicago": [
    { id: "ord", name: "O'Hare International Airport", code: "ORD", distance: "28 km", latitude: 41.9742, longitude: -87.9073 },
    { id: "mdw", name: "Chicago Midway International", code: "MDW", distance: "16 km", latitude: 41.7868, longitude: -87.7524 },
  ],
};

const MOCK_FLIGHTS: Record<string, FlightInfo[]> = {
  "orlando": [
    { id: "f1", airline: "Turkish Airlines", airlineLogo: "🇹🇷", price: 620, duration: "12s 45dk", stops: 0, departure: "10:45", arrival: "16:30", date: "2025-06-15", fromCode: "IST", toCode: "MCO" },
    { id: "f2", airline: "Lufthansa", airlineLogo: "🇩🇪", price: 548, duration: "14s 20dk", stops: 1, departure: "08:20", arrival: "22:40", date: "2025-06-15", fromCode: "IST", toCode: "MCO" },
    { id: "f3", airline: "United Airlines", airlineLogo: "🇺🇸", price: 495, duration: "16s 05dk", stops: 1, departure: "14:10", arrival: "06:15+1", date: "2025-06-15", fromCode: "IST", toCode: "MCO" },
  ],
  "new york": [
    { id: "f1", airline: "Turkish Airlines", airlineLogo: "🇹🇷", price: 520, duration: "10s 15dk", stops: 0, departure: "13:30", arrival: "16:45", date: "2025-06-15", fromCode: "IST", toCode: "JFK" },
    { id: "f2", airline: "Lufthansa", airlineLogo: "🇩🇪", price: 430, duration: "12s 30dk", stops: 1, departure: "07:15", arrival: "14:45", date: "2025-06-15", fromCode: "IST", toCode: "JFK" },
    { id: "f3", airline: "LOT Polish", airlineLogo: "🇵🇱", price: 395, duration: "13s 10dk", stops: 1, departure: "17:00", arrival: "22:10", date: "2025-06-15", fromCode: "IST", toCode: "JFK" },
  ],
  "los angeles": [
    { id: "f1", airline: "Turkish Airlines", airlineLogo: "🇹🇷", price: 780, duration: "13s 55dk", stops: 0, departure: "14:15", arrival: "18:10", date: "2025-06-15", fromCode: "IST", toCode: "LAX" },
    { id: "f2", airline: "Qatar Airways", airlineLogo: "🇶🇦", price: 699, duration: "17s 45dk", stops: 1, departure: "19:20", arrival: "07:05+1", date: "2025-06-15", fromCode: "IST", toCode: "LAX" },
    { id: "f3", airline: "British Airways", airlineLogo: "🇬🇧", price: 650, duration: "16s 20dk", stops: 1, departure: "08:30", arrival: "17:50", date: "2025-06-15", fromCode: "IST", toCode: "LAX" },
  ],
  "miami": [
    { id: "f1", airline: "Turkish Airlines", airlineLogo: "🇹🇷", price: 670, duration: "11s 40dk", stops: 0, departure: "13:30", arrival: "18:10", date: "2025-06-15", fromCode: "IST", toCode: "MIA" },
    { id: "f2", airline: "Air France", airlineLogo: "🇫🇷", price: 530, duration: "14s 15dk", stops: 1, departure: "06:15", arrival: "14:30", date: "2025-06-15", fromCode: "IST", toCode: "MIA" },
    { id: "f3", airline: "TAP Portugal", airlineLogo: "🇵🇹", price: 490, duration: "13s 50dk", stops: 1, departure: "15:45", arrival: "22:35", date: "2025-06-15", fromCode: "IST", toCode: "MIA" },
  ],
  "chicago": [
    { id: "f1", airline: "Turkish Airlines", airlineLogo: "🇹🇷", price: 640, duration: "11s 15dk", stops: 0, departure: "14:10", arrival: "18:25", date: "2025-06-15", fromCode: "IST", toCode: "ORD" },
    { id: "f2", airline: "LOT Polish", airlineLogo: "🇵🇱", price: 460, duration: "12s 50dk", stops: 1, departure: "17:00", arrival: "21:50", date: "2025-06-15", fromCode: "IST", toCode: "ORD" },
    { id: "f3", airline: "Lufthansa", airlineLogo: "🇩🇪", price: 520, duration: "13s 30dk", stops: 1, departure: "08:20", arrival: "14:50", date: "2025-06-15", fromCode: "IST", toCode: "ORD" },
  ],
};

function getMockDataForCity(cityName: string): { airports: AirportInfo[]; flights: FlightInfo[] } {
  const lower = cityName.toLowerCase();
  for (const key of Object.keys(MOCK_AIRPORTS)) {
    if (lower.includes(key)) {
      return { airports: MOCK_AIRPORTS[key], flights: MOCK_FLIGHTS[key] || [] };
    }
  }
  return { airports: [], flights: [] };
}

// ─── Ana Ekran ─────────────────────────────────────────────────────────────────
export default function MapScreen() {
  const { user } = useUser();

  // Başlangıç değerlerini kullanıcı profilinden al
  const [myCity, setMyCity] = useState(user?.startCity || "");
  const [targetCity, setTargetCity] = useState(user?.stateCity || "");

  const [distanceInfo, setDistanceInfo] = useState<DistanceInfo | null>(null);
  const [loadingDistance, setLoadingDistance] = useState(false);

  // Harita konum state'leri
  const [mapLat, setMapLat] = useState(28.5383);
  const [mapLng, setMapLng] = useState(-81.3792);

  // Havalimanı & uçuş verileri
  const [airports, setAirports] = useState<AirportInfo[]>([]);
  const [flights, setFlights] = useState<FlightInfo[]>([]);

  // Hedef şehir seçildiğinde haritayı güncelle ve mesafeyi hesapla
  useEffect(() => {
    if (!targetCity || targetCity.length < 3) return;

    // Mock veriyi güncelle
    const { airports: mockAirports, flights: mockFlights } = getMockDataForCity(targetCity);
    setAirports(mockAirports);
    setFlights(mockFlights);

    let active = true;
    const getDistanceInfo = async () => {
      setLoadingDistance(true);
      try {
        const data = await fetchDistance(targetCity, myCity || undefined);
        if (active && data) {
          setDistanceInfo(data);
          if (data.hedef_koor) {
            setMapLat(data.hedef_koor[0]);
            setMapLng(data.hedef_koor[1]);
          }
        }
      } catch (error) {
        console.error("Mesafe bilgisi çekilirken hata:", error);
        setDistanceInfo(null);
      } finally {
        if (active) setLoadingDistance(false);
      }
    };
    getDistanceInfo();
    return () => { active = false; };
  }, [targetCity, myCity]);

  // Profil değişirse sync et
  useEffect(() => {
    if (user?.startCity && !myCity) setMyCity(user.startCity);
    if (user?.stateCity && !targetCity) setTargetCity(user.stateCity);
  }, [user?.startCity, user?.stateCity]);

  const cheapestIndex = flights.length > 0
    ? flights.reduce((minIdx, f, idx) => f.price < flights[minIdx].price ? idx : minIdx, 0)
    : -1;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#1B262C" }}>
      <StatusBar barStyle="light-content" backgroundColor="#1B262C" />

      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 }}>
        <Text style={{ color: "#BBE1FA", fontSize: 22, fontWeight: "800" }}>🗺️ Harita & Uçuşlar</Text>
        <Text style={{ color: "#BBE1FA", opacity: 0.6, fontSize: 13, marginTop: 2 }}>
          Şehir seç, uçuşları ve uzaklığı gör
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Şehir Arama Inputları ─────────────────────────────────────────── */}
        <View style={{ marginHorizontal: 20, marginTop: 16, gap: 12 }}>
          <CitySearchInput
            label="📍 Bulunduğunuz Şehir"
            placeholder="Örn: İstanbul, Ankara..."
            value={myCity}
            onSelect={setMyCity}
            icon="home-outline"
          />
          <CitySearchInput
            label="🎯 Hedef Şehir"
            placeholder="Örn: Orlando, New York..."
            value={targetCity}
            onSelect={setTargetCity}
            icon="location-outline"
          />
        </View>

        {/* ── Harita ──────────────────────────────────────────────────────── */}
        <View
          style={{
            marginHorizontal: 20,
            marginTop: 16,
            borderRadius: 20,
            overflow: "hidden",
            height: 220,
            borderWidth: 1,
            borderColor: "#3282B840",
          }}
        >
          <MapView
            provider={PROVIDER_DEFAULT}
            style={{ flex: 1 }}
            region={{
              latitude: mapLat,
              longitude: mapLng,
              latitudeDelta: 0.6,
              longitudeDelta: 0.6,
            }}
            mapType="standard"
          >
            {/* Hedef şehir marker */}
            <Marker
              coordinate={{ latitude: mapLat, longitude: mapLng }}
              title={targetCity || "Hedef Şehir"}
              description="Hedef şehir"
              pinColor="#3282B8"
            />
            {/* Havalimanı markerları */}
            {airports.map((airport) => (
              <Marker
                key={airport.id}
                coordinate={{ latitude: airport.latitude, longitude: airport.longitude }}
                title={airport.name}
                description={`${airport.code} • ${airport.distance}`}
                pinColor="#4ade80"
              />
            ))}
          </MapView>
        </View>

        {/* ── Mesafe Kartı ─────────────────────────────────────────────────── */}
        {!targetCity ? (
          <View
            style={{
              marginHorizontal: 20,
              marginTop: 16,
              borderRadius: 16,
              backgroundColor: "#0F3460",
              padding: 16,
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#3282B830",
            }}
          >
            <Ionicons name="search-outline" size={28} color="#3282B880" />
            <Text style={{ color: "#BBE1FA", opacity: 0.5, marginTop: 8, fontSize: 13, textAlign: "center" }}>
              Yukarıdan bir hedef şehir seç{"\n"}uzaklık, havalimanı ve uçuşlar görünür
            </Text>
          </View>
        ) : loadingDistance ? (
          <View
            style={{
              marginHorizontal: 20,
              marginTop: 16,
              borderRadius: 16,
              backgroundColor: "#0F3460",
              padding: 16,
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#3282B830",
            }}
          >
            <Text style={{ color: "#BBE1FA", opacity: 0.6, fontSize: 13 }}>📡 Mesafe hesaplanıyor...</Text>
          </View>
        ) : distanceInfo?.durum ? (
          <View
            style={{
              marginHorizontal: 20,
              marginTop: 16,
              borderRadius: 16,
              backgroundColor: "#0F3460",
              padding: 16,
              borderWidth: 1,
              borderColor: "#3282B840",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Ionicons name="navigate-circle-outline" size={22} color="#3282B8" />
              <Text style={{ color: "#BBE1FA", fontWeight: "700", fontSize: 15 }}>Uzaklık & Konum</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#BBE1FA", opacity: 0.5, fontSize: 10, textTransform: "uppercase", letterSpacing: 1 }}>
                  Bulunduğunuz Şehir
                </Text>
                <Text style={{ color: "#BBE1FA", fontWeight: "600", fontSize: 13, marginTop: 2 }}>
                  {distanceInfo.benim_sehir || myCity || "Belirlenemedi"}
                </Text>
              </View>

              <View style={{ alignItems: "center", paddingHorizontal: 12 }}>
                <Ionicons name="airplane-outline" size={18} color="#BBE1FA" />
                <View style={{ height: 1, width: 50, backgroundColor: "#3282B860", marginVertical: 4 }} />
                <Text style={{ color: "#3282B8", fontWeight: "800", fontSize: 13 }}>
                  {distanceInfo.mesafe} km
                </Text>
              </View>

              <View style={{ flex: 1, alignItems: "flex-end" }}>
                <Text style={{ color: "#BBE1FA", opacity: 0.5, fontSize: 10, textTransform: "uppercase", letterSpacing: 1 }}>
                  Hedef Şehir
                </Text>
                <Text style={{ color: "#BBE1FA", fontWeight: "600", fontSize: 13, marginTop: 2, textAlign: "right" }}>
                  {targetCity}
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        {/* ── En Yakın Havalimanı ──────────────────────────────────────────── */}
        {airports.length > 0 && (
          <View
            style={{
              marginHorizontal: 20,
              marginTop: 16,
              borderRadius: 16,
              backgroundColor: "#0F3460",
              padding: 16,
              borderWidth: 1,
              borderColor: "#3282B830",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Text style={{ fontSize: 18 }}>🛫</Text>
              <Text style={{ color: "#BBE1FA", fontWeight: "700", fontSize: 15 }}>En Yakın Havalimanı</Text>
            </View>
            {airports.map((airport, index) => (
              <View
                key={airport.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingVertical: 10,
                  borderBottomWidth: index < airports.length - 1 ? 1 : 0,
                  borderBottomColor: "#3282B820",
                }}
              >
                <View>
                  <Text style={{ color: "#BBE1FA", fontWeight: "600", fontSize: 13 }}>{airport.name}</Text>
                  <Text style={{ color: "#BBE1FA", opacity: 0.5, fontSize: 11, marginTop: 2 }}>
                    {airport.distance} uzaklıkta
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: "#3282B8",
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ color: "#BBE1FA", fontWeight: "800", fontSize: 13 }}>{airport.code}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── Uçuş Rotaları ───────────────────────────────────────────────── */}
        {flights.length > 0 && (
          <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <Text style={{ color: "#BBE1FA", fontWeight: "700", fontSize: 15 }}>💸 En Ucuz Uçuş Rotaları</Text>
              <View
                style={{
                  backgroundColor: "#0F4C75",
                  borderRadius: 8,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                }}
              >
                <Text style={{ color: "#BBE1FA", opacity: 0.6, fontSize: 11 }}>Mock Veri</Text>
              </View>
            </View>

            {flights.map((flight, index) => {
              const isCheapest = index === cheapestIndex;
              return (
                <View
                  key={flight.id}
                  style={{
                    borderRadius: 16,
                    backgroundColor: "#0F3460",
                    padding: 16,
                    marginBottom: 12,
                    borderWidth: isCheapest ? 1 : 0,
                    borderColor: "#4ade80",
                  }}
                >
                  {isCheapest && (
                    <View
                      style={{
                        position: "absolute",
                        top: -1,
                        right: 12,
                        backgroundColor: "#4ade80",
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        borderBottomLeftRadius: 6,
                        borderBottomRightRadius: 6,
                      }}
                    >
                      <Text style={{ color: "#1B262C", fontSize: 10, fontWeight: "700" }}>EN UCUZ</Text>
                    </View>
                  )}

                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <Text style={{ fontSize: 18 }}>{flight.airlineLogo}</Text>
                      <Text style={{ color: "#BBE1FA", fontWeight: "600", fontSize: 13 }}>{flight.airline}</Text>
                    </View>
                    <Text style={{ color: "#4ade80", fontWeight: "800", fontSize: 20 }}>${flight.price}</Text>
                  </View>

                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <View style={{ alignItems: "center" }}>
                      <Text style={{ color: "#BBE1FA", fontWeight: "700", fontSize: 15 }}>{flight.departure}</Text>
                      <Text style={{ color: "#BBE1FA", opacity: 0.5, fontSize: 11 }}>{flight.fromCode || "IST"}</Text>
                    </View>

                    <View style={{ flex: 1, alignItems: "center", paddingHorizontal: 10 }}>
                      <Text style={{ color: "#BBE1FA", opacity: 0.4, fontSize: 11 }}>{flight.duration}</Text>
                      <View style={{ height: 1, backgroundColor: "#3282B860", width: "100%", marginVertical: 4 }} />
                      <Text style={{ color: "#BBE1FA", opacity: 0.4, fontSize: 11 }}>
                        {flight.stops === 0 ? "Direkt ✈️" : `${flight.stops} aktarma`}
                      </Text>
                    </View>

                    <View style={{ alignItems: "center" }}>
                      <Text style={{ color: "#BBE1FA", fontWeight: "700", fontSize: 15 }}>{flight.arrival}</Text>
                      <Text style={{ color: "#BBE1FA", opacity: 0.5, fontSize: 11 }}>{flight.toCode || "?"}</Text>
                    </View>
                  </View>

                  <Text style={{ color: "#BBE1FA", opacity: 0.3, fontSize: 11, textAlign: "center", marginTop: 8 }}>
                    {flight.date}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
