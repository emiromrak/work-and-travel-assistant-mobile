import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

interface Job {
  id: string;
  label: string;
  hourlyWage: string;
  weeklyHours: string;
}

const WEEKS_PER_MONTH = 4.33;
const DEFAULT_TAX = "12";
const DEFAULT_EXPENSE = "900";
const USD_TRY = 38.42;

function formatUSD(n: number) {
  return `$${n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}
function formatTRY(n: number) {
  return `₺${(n * USD_TRY).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

export default function BudgetScreen() {
  const [jobs, setJobs] = useState<Job[]>([
    { id: "1", label: "İş 1", hourlyWage: "15", weeklyHours: "40" },
  ]);
  const [taxRate, setTaxRate] = useState(DEFAULT_TAX);
  const [monthlyExpense, setMonthlyExpense] = useState(DEFAULT_EXPENSE);

  // Calculated values
  const [grossMonthly, setGrossMonthly] = useState(0);
  const [netMonthly, setNetMonthly] = useState(0);
  const [threeMonthSavings, setThreeMonthSavings] = useState(0);

  useEffect(() => {
    const taxFraction = Math.min(parseFloat(taxRate) || 0, 100) / 100;
    const expense = parseFloat(monthlyExpense) || 0;

    let totalGross = 0;
    jobs.forEach((job) => {
      const wage = parseFloat(job.hourlyWage) || 0;
      const hours = parseFloat(job.weeklyHours) || 0;
      totalGross += wage * hours * WEEKS_PER_MONTH;
    });

    const net = totalGross * (1 - taxFraction) - expense;
    setGrossMonthly(totalGross);
    setNetMonthly(net);
    setThreeMonthSavings(net * 3);
  }, [jobs, taxRate, monthlyExpense]);

  const addJob = () => {
    const newId = (jobs.length + 1).toString();
    setJobs((prev) => [
      ...prev,
      { id: newId, label: `İş ${newId}`, hourlyWage: "15", weeklyHours: "20" },
    ]);
  };

  const removeJob = (id: string) => {
    if (jobs.length === 1) return;
    setJobs((prev) => prev.filter((j) => j.id !== id));
  };

  const updateJob = (id: string, field: keyof Job, value: string) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, [field]: value } : j)));
  };

  const isPositive = threeMonthSavings >= 0;

  return (
    <SafeAreaView className="flex-1 bg-bg-dark">
      <StatusBar barStyle="light-content" backgroundColor="#1B262C" />
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="px-5 pt-4 pb-4">
          <Text className="text-text-light text-2xl font-bold">💰 Bütçe Planlayıcı</Text>
          <Text className="text-text-light opacity-60 text-sm mt-1">
            3 aylık net birikimini hesapla
          </Text>
        </View>

        {/* ── Job Cards ─────────────────────────────────────────────────────── */}
        <View className="px-5">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-text-light font-bold text-base">💼 Çalışma Detayları</Text>
            <TouchableOpacity
              onPress={addJob}
              className="flex-row items-center gap-1 bg-brand-primary px-3 py-2 rounded-xl"
            >
              <Ionicons name="add" size={16} color="#BBE1FA" />
              <Text className="text-text-light text-xs font-bold">İş Ekle</Text>
            </TouchableOpacity>
          </View>

          {jobs.map((job, index) => (
            <View key={job.id} className="rounded-2xl bg-bg-card p-4 mb-3">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-text-light font-bold text-sm">{job.label}</Text>
                {jobs.length > 1 && (
                  <TouchableOpacity onPress={() => removeJob(job.id)}>
                    <Ionicons name="close-circle" size={20} color="#f87171" />
                  </TouchableOpacity>
                )}
              </View>

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text className="text-text-light opacity-60 text-xs mb-1">
                    Saatlik Ücret ($)
                  </Text>
                  <View
                    style={{
                      borderWidth: 1,
                      borderColor: "#3282B880",
                      borderRadius: 10,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      backgroundColor: "#1B262C",
                    }}
                  >
                    <TextInput
                      value={job.hourlyWage}
                      onChangeText={(v) => updateJob(job.id, "hourlyWage", v)}
                      keyboardType="decimal-pad"
                      placeholder="15.00"
                      placeholderTextColor="#BBE1FA30"
                      style={{ color: "#BBE1FA", fontSize: 16, fontWeight: "600" }}
                    />
                  </View>
                </View>

                <View className="flex-1">
                  <Text className="text-text-light opacity-60 text-xs mb-1">
                    Haftalık Saat
                  </Text>
                  <View
                    style={{
                      borderWidth: 1,
                      borderColor: "#3282B880",
                      borderRadius: 10,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      backgroundColor: "#1B262C",
                    }}
                  >
                    <TextInput
                      value={job.weeklyHours}
                      onChangeText={(v) => updateJob(job.id, "weeklyHours", v)}
                      keyboardType="decimal-pad"
                      placeholder="40"
                      placeholderTextColor="#BBE1FA30"
                      style={{ color: "#BBE1FA", fontSize: 16, fontWeight: "600" }}
                    />
                  </View>
                </View>
              </View>

              {/* Monthly calc preview */}
              <View className="mt-3 flex-row items-center gap-1">
                <Ionicons name="calculator-outline" size={12} color="#BBE1FA60" />
                <Text className="text-text-light opacity-40 text-xs">
                  Aylık brüt: ~
                  {formatUSD((parseFloat(job.hourlyWage) || 0) * (parseFloat(job.weeklyHours) || 0) * WEEKS_PER_MONTH)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── Deductions ────────────────────────────────────────────────────── */}
        <View className="px-5 mt-1">
          <Text className="text-text-light font-bold text-base mb-3">🔧 Kesintiler & Giderler</Text>
          <View className="rounded-2xl bg-bg-card p-4 gap-4">
            <View>
              <Text className="text-text-light opacity-60 text-xs mb-1">
                Vergi Kesintisi (%)
              </Text>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: "#3282B880",
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  backgroundColor: "#1B262C",
                }}
              >
                <TextInput
                  value={taxRate}
                  onChangeText={setTaxRate}
                  keyboardType="decimal-pad"
                  placeholder="12"
                  placeholderTextColor="#BBE1FA30"
                  style={{ color: "#BBE1FA", fontSize: 16, fontWeight: "600" }}
                />
              </View>
              <Text className="text-text-light opacity-40 text-xs mt-1">
                W&T öğrencileri için genellikle %10-15 arasında
              </Text>
            </View>

            <View>
              <Text className="text-text-light opacity-60 text-xs mb-1">
                Aylık Yaşam Giderleri ($)
              </Text>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: "#3282B880",
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  backgroundColor: "#1B262C",
                }}
              >
                <TextInput
                  value={monthlyExpense}
                  onChangeText={setMonthlyExpense}
                  keyboardType="decimal-pad"
                  placeholder="900"
                  placeholderTextColor="#BBE1FA30"
                  style={{ color: "#BBE1FA", fontSize: 16, fontWeight: "600" }}
                />
              </View>
              <Text className="text-text-light opacity-40 text-xs mt-1">
                Kira + yemek + ulaşım + telefon dahil
              </Text>
            </View>
          </View>
        </View>

        {/* ── Results ───────────────────────────────────────────────────────── */}
        <View className="px-5 mt-4">
          <Text className="text-text-light font-bold text-base mb-3">📊 Hesaplama Sonucu</Text>

          <View className="rounded-2xl bg-bg-card p-4 gap-3">
            {/* Gross */}
            <View className="flex-row justify-between items-center">
              <Text className="text-text-light opacity-70 text-sm">Brüt Aylık Gelir</Text>
              <Text className="text-text-light font-bold text-base">{formatUSD(grossMonthly)}</Text>
            </View>
            <View style={{ height: 1, backgroundColor: "#3282B830" }} />

            {/* Tax */}
            <View className="flex-row justify-between items-center">
              <Text className="text-text-light opacity-70 text-sm">
                Vergi Kesintisi ({taxRate}%)
              </Text>
              <Text style={{ color: "#f87171", fontWeight: "600", fontSize: 14 }}>
                -{formatUSD(grossMonthly * ((parseFloat(taxRate) || 0) / 100))}
              </Text>
            </View>

            {/* Expense */}
            <View className="flex-row justify-between items-center">
              <Text className="text-text-light opacity-70 text-sm">Aylık Giderler</Text>
              <Text style={{ color: "#f87171", fontWeight: "600", fontSize: 14 }}>
                -{formatUSD(parseFloat(monthlyExpense) || 0)}
              </Text>
            </View>
            <View style={{ height: 1, backgroundColor: "#3282B830" }} />

            {/* Net Monthly */}
            <View className="flex-row justify-between items-center">
              <Text className="text-text-light font-bold text-sm">Net Aylık Birikim</Text>
              <Text
                style={{
                  color: netMonthly >= 0 ? "#4ade80" : "#f87171",
                  fontWeight: "700",
                  fontSize: 16,
                }}
              >
                {formatUSD(netMonthly)}
              </Text>
            </View>
          </View>

          {/* 3-Month Savings Hero Card */}
          <View
            style={{
              marginTop: 16,
              borderRadius: 20,
              padding: 20,
              backgroundColor: isPositive ? "#0F4C75" : "#3B1F1F",
              borderWidth: 2,
              borderColor: isPositive ? "#3282B8" : "#f87171",
            }}
          >
            <Text className="text-text-light opacity-70 text-sm text-center mb-2">
              🏆 3 Aylık Tahmini Net Birikim
            </Text>
            <Text
              style={{
                color: isPositive ? "#4ade80" : "#f87171",
                fontSize: 40,
                fontWeight: "800",
                textAlign: "center",
                letterSpacing: 1,
              }}
            >
              {formatUSD(threeMonthSavings)}
            </Text>
            <Text
              style={{
                color: "#BBE1FA80",
                fontSize: 14,
                textAlign: "center",
                marginTop: 4,
              }}
            >
              ≈ {formatTRY(threeMonthSavings)} (1$ = ₺{USD_TRY})
            </Text>
            {!isPositive && (
              <Text
                style={{
                  color: "#fbbf24",
                  fontSize: 12,
                  textAlign: "center",
                  marginTop: 8,
                }}
              >
                ⚠️ Giderleriniz gelirinizi aşıyor. Ücret veya saat ayarını gözden geçir.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
