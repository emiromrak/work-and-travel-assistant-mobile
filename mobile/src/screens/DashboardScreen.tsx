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
import { TIMEZONES, ISTANBUL_TIMEZONE } from "../data/timezones";
import { useNavigation } from "@react-navigation/native";
import { useUser } from "../context/UserContext";
import { fetchExchangeRate } from "../services/api";

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
  const [istanbulTime, setIstanbulTime] = useState<TimeData | null>(null);
  const [countdown, setCountdown] = useState("");
  const [flightDateInput, setFlightDateInput] = useState(defaultDateStr);
  const [flightDate, setFlightDate] = useState(defaultFlightDate);
  const [dateError, setDateError] = useState("");

  const [usdTry, setUsdTry] = useState<number>(38.42);
  const [updatedTime, setUpdatedTime] = useState<string>("Yükleniyor...");
  const [liveStatus, setLiveStatus] = useState<string>("CANLI (Mock)");

  useEffect(() => {
    const loadRate = async () => {
      try {
        const res = await fetchExchangeRate();
        if (res && res.status === "success") {
          const val = parseFloat(res.calculated_amount.replace(" TL", ""));
          if (!isNaN(val)) {
            setUsdTry(val);
            setLiveStatus("CANLI");
            const now = new Date();
            setUpdatedTime(
              now.toLocaleString("tr-TR", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            );
          }
        }
      } catch (e) {
        console.error("Döviz kuru yüklenemedi:", e);
        setUpdatedTime("16 Mayıs 2025, 22:00");
      }
    };
    loadRate();
  }, []);

  // Live clock — updates every second
  useEffect(() => {
    const update = () => {
      const updated = TIMEZONES.map((tz) => ({
        ...tz,
        ...getTimeInZone(tz.timezone),
      }));
      setTimes(updated);
      setIstanbulTime({ ...ISTANBUL_TIMEZONE, ...getTimeInZone(ISTANBUL_TIMEZONE.timezone) });
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
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Header */}
        <View className="px-5 pt-5 pb-3 flex-row items-center justify-between">
          <View>
            <Text className="text-text-light text-2xl font-extrabold tracking-wide">Merhaba 👋</Text>
            <Text className="text-text-light opacity-40 text-xs mt-1 tracking-wide">
              Work & Travel Asistanın
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => navigation.navigate("Profile" as never)}
            className="w-11 h-11 rounded-full bg-brand-primary items-center justify-center overflow-hidden"
            style={{
              borderWidth: 2,
              borderColor: '#3282B8',
              shadowColor: '#3282B8',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.4,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            {user?.profilePic ? (
              <Image source={{ uri: user.profilePic }} style={{ width: '100%', height: '100%' }} />
            ) : (
              <Ionicons name="person" size={20} color="#BBE1FA" />
            )}
          </TouchableOpacity>
        </View>

        {/* ── Exchange Rate Widget ────────────────────────────────────────────── */}
        <View
          style={{
            marginHorizontal: 20,
            marginTop: 12,
            borderRadius: 20,
            backgroundColor: '#0F4C75',
            padding: 18,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: '#3282B820',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 10,
            elevation: 6,
          }}
        >
          {/* Accent top line */}
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: '#3282B8', borderTopLeftRadius: 20, borderTopRightRadius: 20 }} />
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center gap-2">
              <Text className="text-2xl">💱</Text>
              <Text className="text-text-light font-extrabold text-base tracking-wide">USD / TRY</Text>
            </View>
            <View style={{ backgroundColor: '#3282B8', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 }}>
              <Text className="text-text-light text-xs font-bold" style={{ letterSpacing: 0.5 }}>{liveStatus}</Text>
            </View>
          </View>
          <Text className="text-text-light text-4xl font-extrabold tracking-wider">
            ₺ {usdTry.toFixed(2)}
          </Text>
          <View className="flex-row items-center mt-3 gap-1">
            <Ionicons name="trending-up" size={14} color="#4ade80" />
            <Text style={{ color: "#4ade80", fontSize: 12, fontWeight: "700" }}>
              +0.18 (%0.47) bugün
            </Text>
          </View>
          <Text className="text-text-light opacity-30 text-xs mt-3" style={{ letterSpacing: 0.3 }}>
            Son güncelleme: {updatedTime}
          </Text>
        </View>

        {/* ── Countdown Timer ─────────────────────────────────────────────────── */}
        <View
          style={{
            marginHorizontal: 20,
            marginTop: 16,
            borderRadius: 20,
            backgroundColor: '#0F4C75',
            padding: 18,
            borderWidth: 1,
            borderColor: '#3282B820',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 10,
            elevation: 6,
          }}
        >
          <View className="flex-row items-center gap-2 mb-3">
            <Text className="text-2xl">✈️</Text>
            <Text className="text-text-light font-extrabold text-base tracking-wide">Uçuşa Geri Sayım</Text>
          </View>
          <Text className="text-text-light text-3xl font-extrabold tracking-widest mb-4">
            {countdown}
          </Text>
          <Text className="text-text-light opacity-50 text-xs mb-2" style={{ letterSpacing: 0.3 }}>
            Uçuş tarihinizi girin (YYYY-MM-DD)
          </Text>
          <View
            style={{
              borderWidth: 1,
              borderColor: dateError ? "#f87171" : "#3282B840",
              borderRadius: 14,
              paddingHorizontal: 14,
              paddingVertical: 12,
              backgroundColor: "#152238",
            }}
          >
            <TextInput
              value={flightDateInput}
              onChangeText={handleDateChange}
              placeholder="2025-08-15"
              placeholderTextColor="#BBE1FA30"
              style={{ color: "#BBE1FA", fontSize: 16, fontWeight: "600" }}
            />
          </View>
          {dateError ? (
            <Text style={{ color: "#f87171", fontSize: 11, marginTop: 6 }}>{dateError}</Text>
          ) : null}
        </View>

        {/* ── Timezone Cards ──────────────────────────────────────────────────── */}
        <View className="px-5 mt-5">
          <Text className="text-text-light font-extrabold text-base mb-3 tracking-wide">
            🕐 ABD Şehirlerinde Saat
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {times.map((tz) => (
              <View
                key={tz.id}
                style={{
                  width: "47%",
                  borderRadius: 18,
                  backgroundColor: '#0F4C75',
                  padding: 16,
                  borderWidth: 1,
                  borderColor: '#3282B815',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 6,
                  elevation: 3,
                }}
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-2xl">{tz.emoji}</Text>
                  <Text className="text-text-light opacity-50 text-xs">{tz.period}</Text>
                </View>
                <Text className="text-text-light font-extrabold text-xl tracking-wider">
                  {tz.time}
                </Text>
                <Text className="text-text-light opacity-70 text-sm font-bold mt-1">
                  {tz.city}
                </Text>
                <Text className="text-text-light opacity-40 text-xs mt-0.5">{tz.date}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── İstanbul Saati ──────────────────────────────────────────────────── */}
        {istanbulTime && (
          <View className="px-5 mt-5 mb-2">
            <Text className="text-text-light font-extrabold text-base mb-3 tracking-wide">
              🇹🇷 Türkiye Saati
            </Text>
            <View
              style={{
                borderRadius: 20,
                backgroundColor: '#0F3460',
                padding: 18,
                borderWidth: 1,
                borderColor: '#3282B830',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <Text style={{ fontSize: 34 }}>{istanbulTime.emoji}</Text>
                <View>
                  <Text style={{ color: '#BBE1FA', fontWeight: '800', fontSize: 24, letterSpacing: 2 }}>
                    {istanbulTime.time}
                  </Text>
                  <Text style={{ color: '#BBE1FA', opacity: 0.6, fontWeight: '700', fontSize: 14, marginTop: 2 }}>
                    {istanbulTime.city}
                  </Text>
                  <Text style={{ color: '#BBE1FA', opacity: 0.35, fontSize: 12, marginTop: 1 }}>{istanbulTime.date}</Text>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: '#BBE1FA', opacity: 0.35, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: '700' }}>Yerel Saat</Text>
                <Text style={{ fontSize: 24, marginTop: 6 }}>{istanbulTime.period}</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
