import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { MOCK_FLIGHTS, NEAREST_AIRPORTS } from "../data/mockFlights";
import { CITY_GUIDES } from "../data/mockGuides";
import { fetchDistance } from "../services/api";

const { width } = Dimensions.get("window");

const CITIES = [
  { id: "orlando", name: "Orlando, FL", lat: 28.5383, lng: -81.3792 },
  { id: "new-york", name: "New York, NY", lat: 40.7128, lng: -74.006 },
  { id: "los-angeles", name: "Los Angeles, CA", lat: 34.0522, lng: -118.2437 },
  { id: "miami", name: "Miami, FL", lat: 25.7617, lng: -80.1918 },
  { id: "chicago", name: "Chicago, IL", lat: 41.8781, lng: -87.6298 },
];

interface DistanceInfo {
  durum: boolean;
  mesafe?: string;
  benim_sehir?: string;
  hedef_koor?: [number, number];
  benim_koor?: [number, number];
}

export default function MapScreen() {
  const [selectedCityId, setSelectedCityId] = useState("orlando");
  const selectedCity = CITIES.find((c) => c.id === selectedCityId) ?? CITIES[0];
  const guide = CITY_GUIDES.find((g) => g.id === selectedCityId);

  const [distanceInfo, setDistanceInfo] = useState<DistanceInfo | null>(null);
  const [loadingDistance, setLoadingDistance] = useState(false);

  useEffect(() => {
    let active = true;
    const getDistanceInfo = async () => {
      setLoadingDistance(true);
      try {
        const data = await fetchDistance(selectedCity.name);
        if (active && data) {
          setDistanceInfo(data);
        }
      } catch (error) {
        console.error("Mesafe bilgisi çekilirken hata:", error);
      } finally {
        if (active) {
          setLoadingDistance(false);
        }
      }
    };
    getDistanceInfo();
    return () => {
      active = false;
    };
  }, [selectedCityId]);

  const mapLat = distanceInfo?.hedef_koor ? distanceInfo.hedef_koor[0] : selectedCity.lat;
  const mapLng = distanceInfo?.hedef_koor ? distanceInfo.hedef_koor[1] : selectedCity.lng;

  return (
    <SafeAreaView className="flex-1 bg-bg-dark">
      <StatusBar barStyle="light-content" backgroundColor="#1B262C" />

      {/* Header */}
      <View className="px-5 pt-4 pb-3">
        <Text className="text-text-light text-2xl font-bold">🗺️ Harita & Uçuşlar</Text>
        <Text className="text-text-light opacity-60 text-sm mt-1">
          Hedef şehir ve en ucuz uçuşlar
        </Text>
      </View>

      {/* City Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="pl-5 mb-3"
        contentContainerStyle={{ paddingRight: 20, gap: 10 }}
      >
        {CITIES.map((city) => {
          const active = city.id === selectedCityId;
          return (
            <TouchableOpacity
              key={city.id}
              onPress={() => setSelectedCityId(city.id)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: active ? "#3282B8" : "#0F4C75",
                borderWidth: 1,
                borderColor: active ? "#3282B8" : "#3282B830",
              }}
            >
              <Text
                style={{
                  color: "#BBE1FA",
                  fontSize: 13,
                  fontWeight: active ? "700" : "400",
                }}
              >
                {city.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        {/* Map */}
        <View
          style={{
            marginHorizontal: 20,
            borderRadius: 20,
            overflow: "hidden",
            height: 240,
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
              latitudeDelta: 0.4,
              longitudeDelta: 0.4,
            }}
            mapType="standard"
          >
            {/* City center marker */}
            <Marker
              coordinate={{ latitude: mapLat, longitude: mapLng }}
              title={selectedCity.name}
              description="Hedef şehir"
              pinColor="#3282B8"
            />

            {/* Airport markers */}
            {NEAREST_AIRPORTS.map((airport) => (
              <Marker
                key={airport.id}
                coordinate={{ latitude: airport.latitude, longitude: airport.longitude }}
                title={airport.name}
                description={`${airport.code} • ${airport.distance}`}
                pinColor="#BBE1FA"
              />
            ))}
          </MapView>
        </View>

        {/* Mesafe Bilgisi Kartı */}
        {loadingDistance ? (
          <View className="mx-5 mt-4 rounded-2xl bg-bg-card p-4 items-center justify-center border border-brand-primary/20">
            <Text className="text-text-light opacity-60 text-sm">Mesafe hesaplanıyor...</Text>
          </View>
        ) : distanceInfo?.durum ? (
          <View className="mx-5 mt-4 rounded-2xl bg-bg-card p-4 border border-brand-primary/30">
            <View className="flex-row items-center gap-2 mb-3">
              <Ionicons name="navigate-circle-outline" size={22} color="#3282B8" />
              <Text className="text-text-light font-bold text-base">Uzaklık & Konum</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-text-light opacity-60 text-xs uppercase tracking-wider">
                  Bulunduğunuz Şehir
                </Text>
                <Text className="text-text-light font-semibold text-sm mt-0.5">
                  {distanceInfo.benim_sehir || "Belirlenemedi"}
                </Text>
              </View>
              
              <View className="px-4 items-center justify-center">
                <Ionicons name="airplane-outline" size={18} color="#BBE1FA" />
                <View style={{ height: 1, width: 60, backgroundColor: "#3282B860", marginVertical: 4 }} />
                <Text className="text-brand-primary font-bold text-xs">
                  {distanceInfo.mesafe} km
                </Text>
              </View>

              <View className="flex-1 items-end">
                <Text className="text-text-light opacity-60 text-xs uppercase tracking-wider">
                  Hedef Şehir
                </Text>
                <Text className="text-text-light font-semibold text-sm mt-0.5 text-right">
                  {selectedCity.name}
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        {/* Nearest Airport Info */}
        <View className="mx-5 mt-4 rounded-2xl bg-bg-card p-4">
          <View className="flex-row items-center gap-2 mb-3">
            <Text className="text-xl">🛫</Text>
            <Text className="text-text-light font-bold text-base">En Yakın Havalimanı</Text>
          </View>
          {NEAREST_AIRPORTS.map((airport) => (
            <View
              key={airport.id}
              className="flex-row items-center justify-between py-2"
              style={{ borderBottomWidth: 1, borderBottomColor: "#3282B830" }}
            >
              <View>
                <Text className="text-text-light font-semibold text-sm">{airport.name}</Text>
                <Text className="text-text-light opacity-50 text-xs">
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
                <Text className="text-text-light font-bold text-sm">{airport.code}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Flight Cards */}
        <View className="px-5 mt-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-text-light font-bold text-base">
              💸 En Ucuz Uçuş Rotaları
            </Text>
            <View
              style={{
                backgroundColor: "#0F4C75",
                borderRadius: 8,
                paddingHorizontal: 8,
                paddingVertical: 3,
              }}
            >
              <Text className="text-text-light opacity-60 text-xs">Mock Veri</Text>
            </View>
          </View>

          {MOCK_FLIGHTS.map((flight, index) => (
            <View
              key={flight.id}
              className="rounded-2xl bg-bg-card p-4 mb-3"
              style={{
                borderWidth: index === 2 ? 1 : 0,
                borderColor: "#4ade80",
              }}
            >
              {index === 2 && (
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
                  <Text style={{ color: "#1B262C", fontSize: 10, fontWeight: "700" }}>
                    EN UCUZ
                  </Text>
                </View>
              )}

              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center gap-2">
                  <Text className="text-lg">{flight.airlineLogo}</Text>
                  <Text className="text-text-light font-semibold text-sm">{flight.airline}</Text>
                </View>
                <Text
                  style={{
                    color: "#4ade80",
                    fontWeight: "800",
                    fontSize: 20,
                  }}
                >
                  ${flight.price}
                </Text>
              </View>

              <View className="flex-row items-center justify-between">
                <View className="items-center">
                  <Text className="text-text-light font-bold text-base">{flight.departure}</Text>
                  <Text className="text-text-light opacity-50 text-xs">IST</Text>
                </View>

                <View className="flex-1 items-center px-3">
                  <Text className="text-text-light opacity-40 text-xs">{flight.duration}</Text>
                  <View
                    style={{ height: 1, backgroundColor: "#3282B860", width: "100%", marginVertical: 4 }}
                  />
                  <Text className="text-text-light opacity-40 text-xs">
                    {flight.stops === 0 ? "Direkt" : `${flight.stops} aktarma`}
                  </Text>
                </View>

                <View className="items-center">
                  <Text className="text-text-light font-bold text-base">{flight.arrival}</Text>
                  <Text className="text-text-light opacity-50 text-xs">MCO</Text>
                </View>
              </View>

              <Text className="text-text-light opacity-30 text-xs text-center mt-2">
                {flight.date}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
