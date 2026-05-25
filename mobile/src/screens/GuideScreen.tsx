import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { CITY_GUIDES, CityGuide } from "../data/mockGuides";

// ─── Section accordion component ─────────────────────────────────────────────
function AccordionSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <View style={{ marginBottom: 12 }}>
      <TouchableOpacity
        onPress={() => setOpen((p) => !p)}
        style={{
          backgroundColor: "#0F4C75",
          borderRadius: 16,
          padding: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          borderWidth: 1,
          borderColor: "#3282B815",
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <Text style={{ color: "#BBE1FA", fontWeight: "800", fontSize: 14, letterSpacing: 0.3 }}>{title}</Text>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={18}
          color="#BBE1FA"
        />
      </TouchableOpacity>
      {open && (
        <View
          style={{
            backgroundColor: "#0F4C7570",
            borderBottomLeftRadius: 16,
            borderBottomRightRadius: 16,
            padding: 16,
            marginTop: -6,
            borderWidth: 1,
            borderTopWidth: 0,
            borderColor: "#3282B810",
          }}
        >
          {children}
        </View>
      )}
    </View>
  );
}

// ─── Chat bubble ─────────────────────────────────────────────────────────────
function AiBubble({ text }: { text: string }) {
  return (
    <View className="flex-row items-start gap-2 mb-3">
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 17,
          backgroundColor: "#3282B8",
          alignItems: "center",
          justifyContent: "center",
          shadowColor: '#3282B8',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
          elevation: 3,
        }}
      >
        <Text style={{ fontSize: 16 }}>🤖</Text>
      </View>
      <View
        style={{
          flex: 1,
          backgroundColor: "#0F4C75",
          borderRadius: 16,
          borderTopLeftRadius: 4,
          padding: 14,
          borderWidth: 1,
          borderColor: "#3282B815",
        }}
      >
        <Text style={{ color: "#BBE1FA", fontSize: 13, lineHeight: 20 }}>{text}</Text>
      </View>
    </View>
  );
}

export default function GuideScreen() {
  const [selectedId, setSelectedId] = useState<string>("orlando");
  const guide: CityGuide | undefined = CITY_GUIDES.find((g) => g.id === selectedId);

  return (
    <SafeAreaView className="flex-1 bg-bg-dark">
      <StatusBar barStyle="light-content" backgroundColor="#1B262C" />

      {/* Header */}
      <View className="px-5 pt-5 pb-3">
        <Text className="text-text-light text-2xl font-extrabold tracking-wide">🤖 AI Şehir Rehberi</Text>
        <Text className="text-text-light opacity-40 text-xs mt-1 tracking-wide">
          W&T için kişiselleştirilmiş şehir rehberleri
        </Text>
      </View>

      {/* City Selector Grid */}
      <View className="px-5 py-3">
        <View className="flex-row flex-wrap gap-2">
          {CITY_GUIDES.map((city) => {
            const active = city.id === selectedId;
            return (
              <TouchableOpacity
                key={city.id}
                onPress={() => setSelectedId(city.id)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 22,
                  backgroundColor: active ? "#3282B8" : "#0F4C75",
                  borderWidth: 1,
                  borderColor: active ? "#3282B8" : "#3282B820",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  shadowColor: active ? '#3282B8' : 'transparent',
                  shadowOffset: { width: 0, height: active ? 3 : 0 },
                  shadowOpacity: active ? 0.3 : 0,
                  shadowRadius: active ? 8 : 0,
                  elevation: active ? 4 : 0,
                }}
              >
                <Text style={{ fontSize: 16 }}>{city.emoji}</Text>
                <Text
                  style={{
                    color: "#BBE1FA",
                    fontSize: 13,
                    fontWeight: active ? "800" : "500",
                    letterSpacing: active ? 0.3 : 0,
                  }}
                >
                  {city.city}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {guide ? (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 30 }}
        >
          {/* City Hero Card */}
          <View
            style={{
              borderRadius: 24,
              backgroundColor: "#0F4C75",
              padding: 20,
              marginBottom: 18,
              borderWidth: 1,
              borderColor: "#3282B820",
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 10,
              elevation: 5,
            }}
          >
            <View className="flex-row items-center gap-3 mb-4">
              <Text style={{ fontSize: 44 }}>{guide.emoji}</Text>
              <View>
                <Text style={{ color: "#BBE1FA", fontSize: 24, fontWeight: "900", letterSpacing: 0.5 }}>
                  {guide.city}
                </Text>
                <Text style={{ color: "#BBE1FA60", fontSize: 13, fontWeight: "600" }}>{guide.state}</Text>
              </View>
            </View>
            <View className="flex-row gap-3">
              <View
                style={{
                  flex: 1,
                  backgroundColor: "#152238",
                  borderRadius: 16,
                  padding: 14,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#3282B815",
                }}
              >
                <Text style={{ color: "#4ade80", fontWeight: "900", fontSize: 20 }}>
                  ${guide.minWage}
                </Text>
                <Text style={{ color: "#BBE1FA50", fontSize: 11, marginTop: 2, fontWeight: '600' }}>Min. ücret/saat</Text>
              </View>
              <View
                style={{
                  flex: 1,
                  backgroundColor: "#152238",
                  borderRadius: 16,
                  padding: 14,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#3282B815",
                }}
              >
                <Text style={{ color: "#fbbf24", fontWeight: "900", fontSize: 20 }}>
                  ${guide.avgMonthlyCost}
                </Text>
                <Text style={{ color: "#BBE1FA50", fontSize: 11, marginTop: 2, fontWeight: '600' }}>Aylık ort. gider</Text>
              </View>
            </View>
          </View>

          {/* AI Overview Bubble */}
          <Text style={{ color: "#BBE1FA", fontWeight: "800", marginBottom: 12, fontSize: 15, letterSpacing: 0.3 }}>
            💬 AI Genel Bakış
          </Text>
          <AiBubble text={guide.overview} />

          {/* Highlights */}
          <AccordionSection title="⭐ Öne Çıkan Özellikler" defaultOpen>
            {guide.highlights.map((h, i) => (
              <View key={i} className="flex-row items-start gap-2 mb-2">
                <Ionicons name="checkmark-circle" size={16} color="#4ade80" style={{ marginTop: 2 }} />
                <Text style={{ color: "#BBE1FA", fontSize: 13, flex: 1, lineHeight: 19 }}>{h}</Text>
              </View>
            ))}
          </AccordionSection>

          {/* Restaurants */}
          <AccordionSection title="🍽️ Öğrenci Dostu Restoranlar">
            {guide.restaurants.map((r, i) => (
              <View
                key={i}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingVertical: 10,
                  borderBottomWidth: i < guide.restaurants.length - 1 ? 1 : 0,
                  borderBottomColor: "#3282B820",
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#BBE1FA", fontWeight: "700", fontSize: 13 }}>
                    {r.name}
                  </Text>
                  <Text style={{ color: "#BBE1FA50", fontSize: 11, marginTop: 2 }}>
                    {r.type} • ⭐ {r.rating}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={{ color: "#4ade80", fontWeight: "800", fontSize: 13 }}>
                    {r.avgPrice}
                  </Text>
                  {r.studentFriendly && (
                    <Text style={{ color: "#3282B8", fontSize: 10, fontWeight: "700", marginTop: 1 }}>
                      Öğrenci dostu ✓
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </AccordionSection>

          {/* Budget Tips */}
          <AccordionSection title="💡 Bütçe Tavsiyeleri">
            {guide.budgetTips.map((tip, i) => (
              <View
                key={i}
                style={{
                  backgroundColor: "#152238",
                  borderRadius: 14,
                  padding: 14,
                  marginBottom: 8,
                  borderWidth: 1,
                  borderColor: "#3282B810",
                }}
              >
                <View className="flex-row justify-between items-center mb-1">
                  <Text style={{ color: "#BBE1FA", fontWeight: "800", fontSize: 13 }}>
                    {tip.category}
                  </Text>
                  <Text style={{ color: "#4ade80", fontWeight: "800", fontSize: 12 }}>
                    {tip.monthlyCost}
                  </Text>
                </View>
                <Text style={{ color: "#BBE1FA60", fontSize: 12, lineHeight: 18 }}>
                  {tip.tip}
                </Text>
              </View>
            ))}
          </AccordionSection>

          {/* Bottom AI note */}
          <AiBubble
            text={`${guide.city} için tavsiyem: Net aylık birikim hedefini belirleyip bütçe planlayıcısında hesapla. Asgari ücret $${guide.minWage}/saat ile tam zamanlı çalışırsan aylık brüt ~$${(guide.minWage * 40 * 4.33).toFixed(0)} kazanırsın. Harcamalarını kontrol altında tutarsan 3 ayda güçlü bir birikim yapabilirsin! 🚀`}
          />
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}
