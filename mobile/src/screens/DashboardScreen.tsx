import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { TIMEZONES } from "../data/timezones";
import { useNavigation } from "@react-navigation/native";
import { useUser } from "../context/UserContext";

// ─── Mock exchange rate ───────────────────────────────────────────────────────
const MOCK_USD_TRY = 38.42;
const MOCK_UPDATED = "16 Mayıs 2025, 22:00";

// ─── Types ────────────────────────────────────────────────────────────────────
interface TimeData {
  id: string;
  city: string;
  state: string;
  emoji: string;
  time: string;
  date: string;
  period: string;
}

// ─── Helper ───────────────────────────────────────────────────────────────────
function getTimeInZone(timezone: string): { time: string; date: string; period: string } {
  const now = new Date();
  const timeStr = now.toLocaleTimeString("tr-TR", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const dateStr = now.toLocaleDateString("tr-TR", {
    timeZone: timezone,
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const hour = parseInt(
    now.toLocaleString("en-US", { timeZone: timezone, hour: "numeric", hour12: false })
  );
  const period = hour >= 6 && hour < 20 ? "☀️" : "🌙";
  return { time: timeStr, date: dateStr, period };
}

function getCountdown(targetDate: Date): string {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();
  if (diff <= 0) return "Uçuş günü geldi! ✈️";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return `${days}g ${hours}s ${minutes}dk ${seconds}sn`;
}

// ─── Default flight date: 90 days from now ────────────────────────────────────
const defaultFlightDate = new Date();
defaultFlightDate.setDate(defaultFlightDate.getDate() + 90);
const defaultDateStr = defaultFlightDate.toISOString().split("T")[0];

export default function DashboardScreen() {
  const navigation = useNavigation();
  const { user } = useUser();
  const [times, setTimes] = useState<TimeData[]>([]);
  const [countdown, setCountdown] = useState("");
  const [flightDateInput, setFlightDateInput] = useState(defaultDateStr);
  const [flightDate, setFlightDate] = useState(defaultFlightDate);
  const [dateError, setDateError] = useState("");

  // Live clock — updates every second
  useEffect(() => {
    const update = () => {
      const updated = TIMEZONES.map((tz) => ({
        ...tz,
        ...getTimeInZone(tz.timezone),
      }));
      setTimes(updated);
      setCountdown(getCountdown(flightDate));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [flightDate]);

  const handleDateChange = (text: string) => {
    setFlightDateInput(text);
    const parsed = new Date(text);
    if (!isNaN(parsed.getTime())) {
      setFlightDate(parsed);
      setDateError("");
    } else {
      setDateError("Geçersiz tarih formatı (YYYY-MM-DD)");
    }
  };

  const countdownParts = countdown.split(" ");

  return (
    <SafeAreaView className="flex-1 bg-bg-dark">
      <StatusBar barStyle="light-content" backgroundColor="#1B262C" />
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Header */}
        <View className="px-5 pt-4 pb-2 flex-row items-center justify-between">
          <View>
            <Text className="text-text-light text-2xl font-bold">Merhaba 👋</Text>
            <Text className="text-text-light opacity-60 text-sm mt-1">
              Work & Travel Asistanın
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => navigation.navigate("Profile" as never)}
            className="w-10 h-10 rounded-full bg-brand-primary items-center justify-center overflow-hidden border-2 border-brand-primary"
          >
            {user?.profilePic ? (
              <Image source={{ uri: user.profilePic }} style={{ width: '100%', height: '100%' }} />
            ) : (
              <Ionicons name="person" size={20} color="#BBE1FA" />
            )}
          </TouchableOpacity>
        </View>

        {/* ── Exchange Rate Widget ────────────────────────────────────────────── */}
        <View className="mx-5 mt-4 rounded-2xl bg-bg-card p-4 overflow-hidden">
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-row items-center gap-2">
              <Text className="text-2xl">💱</Text>
              <Text className="text-text-light font-bold text-base">USD / TRY</Text>
            </View>
            <View className="bg-brand-primary rounded-full px-3 py-1">
              <Text className="text-text-light text-xs font-semibold">CANLI (Mock)</Text>
            </View>
          </View>
          <Text className="text-text-light text-4xl font-bold tracking-wider">
            ₺ {MOCK_USD_TRY.toFixed(2)}
          </Text>
          <View className="flex-row items-center mt-2 gap-1">
            <Ionicons name="trending-up" size={14} color="#4ade80" />
            <Text style={{ color: "#4ade80", fontSize: 12, fontWeight: "600" }}>
              +0.18 (%0.47) bugün
            </Text>
          </View>
          <Text className="text-text-light opacity-40 text-xs mt-2">
            Son güncelleme: {MOCK_UPDATED}
          </Text>
        </View>

        {/* ── Countdown Timer ─────────────────────────────────────────────────── */}
        <View className="mx-5 mt-4 rounded-2xl bg-bg-card p-4">
          <View className="flex-row items-center gap-2 mb-3">
            <Text className="text-2xl">✈️</Text>
            <Text className="text-text-light font-bold text-base">Uçuşa Geri Sayım</Text>
          </View>
          <Text className="text-text-light text-3xl font-bold tracking-widest mb-4">
            {countdown}
          </Text>
          <Text className="text-text-light opacity-60 text-xs mb-2">
            Uçuş tarihinizi girin (YYYY-MM-DD)
          </Text>
          <View
            style={{
              borderWidth: 1,
              borderColor: dateError ? "#f87171" : "#3282B880",
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 10,
              backgroundColor: "#1B262C",
            }}
          >
            <TextInput
              value={flightDateInput}
              onChangeText={handleDateChange}
              placeholder="2025-08-15"
              placeholderTextColor="#BBE1FA40"
              style={{ color: "#BBE1FA", fontSize: 16 }}
            />
          </View>
          {dateError ? (
            <Text style={{ color: "#f87171", fontSize: 11, marginTop: 4 }}>{dateError}</Text>
          ) : null}
        </View>

        {/* ── Timezone Cards ──────────────────────────────────────────────────── */}
        <View className="px-5 mt-5">
          <Text className="text-text-light font-bold text-base mb-3">
            🕐 ABD Şehirlerinde Saat
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {times.map((tz) => (
              <View
                key={tz.id}
                className="rounded-2xl bg-bg-card p-4"
                style={{ width: "47%" }}
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-2xl">{tz.emoji}</Text>
                  <Text className="text-text-light opacity-60 text-xs">{tz.period}</Text>
                </View>
                <Text className="text-text-light font-bold text-xl tracking-wider">
                  {tz.time}
                </Text>
                <Text className="text-text-light opacity-80 text-sm font-semibold mt-1">
                  {tz.city}
                </Text>
                <Text className="text-text-light opacity-50 text-xs">{tz.date}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
