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
    <View className="mb-3">
      <TouchableOpacity
        onPress={() => setOpen((p) => !p)}
        style={{
          backgroundColor: "#0F4C75",
          borderRadius: 14,
          padding: 14,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ color: "#BBE1FA", fontWeight: "700", fontSize: 14 }}>{title}</Text>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={18}
          color="#BBE1FA"
        />
      </TouchableOpacity>
      {open && (
        <View
          style={{
            backgroundColor: "#0F4C7590",
            borderBottomLeftRadius: 14,
            borderBottomRightRadius: 14,
            padding: 14,
            marginTop: -4,
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
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: "#3282B8",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 16 }}>🤖</Text>
      </View>
      <View
        style={{
          flex: 1,
          backgroundColor: "#0F4C75",
          borderRadius: 14,
          borderTopLeftRadius: 4,
          padding: 12,
        }}
      >
        <Text style={{ color: "#BBE1FA", fontSize: 13, lineHeight: 19 }}>{text}</Text>
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
      <View className="px-5 pt-4 pb-2">
        <Text className="text-text-light text-2xl font-bold">🤖 AI Şehir Rehberi</Text>
        <Text className="text-text-light opacity-60 text-sm mt-1">
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
                  paddingHorizontal: 14,
                  paddingVertical: 9,
                  borderRadius: 20,
                  backgroundColor: active ? "#3282B8" : "#0F4C75",
                  borderWidth: 1,
                  borderColor: active ? "#3282B8" : "#3282B830",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Text style={{ fontSize: 16 }}>{city.emoji}</Text>
                <Text
                  style={{
                    color: "#BBE1FA",
                    fontSize: 13,
                    fontWeight: active ? "700" : "400",
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
              borderRadius: 20,
              backgroundColor: "#0F4C75",
              padding: 18,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: "#3282B840",
            }}
          >
            <View className="flex-row items-center gap-3 mb-3">
              <Text style={{ fontSize: 40 }}>{guide.emoji}</Text>
              <View>
                <Text style={{ color: "#BBE1FA", fontSize: 22, fontWeight: "800" }}>
                  {guide.city}
                </Text>
                <Text style={{ color: "#BBE1FA80", fontSize: 13 }}>{guide.state}</Text>
              </View>
            </View>
            <View className="flex-row gap-3">
              <View
                style={{
                  flex: 1,
                  backgroundColor: "#1B262C",
                  borderRadius: 12,
                  padding: 10,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#4ade80", fontWeight: "800", fontSize: 18 }}>
                  ${guide.minWage}
                </Text>
                <Text style={{ color: "#BBE1FA60", fontSize: 11 }}>Min. ücret/saat</Text>
              </View>
              <View
                style={{
                  flex: 1,
                  backgroundColor: "#1B262C",
                  borderRadius: 12,
                  padding: 10,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fbbf24", fontWeight: "800", fontSize: 18 }}>
                  ${guide.avgMonthlyCost}
                </Text>
                <Text style={{ color: "#BBE1FA60", fontSize: 11 }}>Aylık ort. gider</Text>
              </View>
            </View>
          </View>

          {/* AI Overview Bubble */}
          <Text style={{ color: "#BBE1FA", fontWeight: "700", marginBottom: 10, fontSize: 14 }}>
            💬 AI Genel Bakış
          </Text>
          <AiBubble text={guide.overview} />

          {/* Highlights */}
          <AccordionSection title="⭐ Öne Çıkan Özellikler" defaultOpen>
            {guide.highlights.map((h, i) => (
              <View key={i} className="flex-row items-start gap-2 mb-2">
                <Ionicons name="checkmark-circle" size={16} color="#4ade80" style={{ marginTop: 2 }} />
                <Text style={{ color: "#BBE1FA", fontSize: 13, flex: 1, lineHeight: 18 }}>{h}</Text>
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
                  paddingVertical: 8,
                  borderBottomWidth: i < guide.restaurants.length - 1 ? 1 : 0,
                  borderBottomColor: "#3282B830",
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#BBE1FA", fontWeight: "600", fontSize: 13 }}>
                    {r.name}
                  </Text>
                  <Text style={{ color: "#BBE1FA60", fontSize: 11 }}>
                    {r.type} • ⭐ {r.rating}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={{ color: "#4ade80", fontWeight: "700", fontSize: 13 }}>
                    {r.avgPrice}
                  </Text>
                  {r.studentFriendly && (
                    <Text style={{ color: "#3282B8", fontSize: 10, fontWeight: "600" }}>
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
                  backgroundColor: "#1B262C",
                  borderRadius: 10,
                  padding: 12,
                  marginBottom: 8,
                }}
              >
                <View className="flex-row justify-between items-center mb-1">
                  <Text style={{ color: "#BBE1FA", fontWeight: "700", fontSize: 13 }}>
                    {tip.category}
                  </Text>
                  <Text style={{ color: "#4ade80", fontWeight: "700", fontSize: 12 }}>
                    {tip.monthlyCost}
                  </Text>
                </View>
                <Text style={{ color: "#BBE1FA80", fontSize: 12, lineHeight: 17 }}>
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
