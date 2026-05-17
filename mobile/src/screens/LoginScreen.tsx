import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { fetchLogin, fetchRegister } from "../services/api";
import { useUser } from "../context/UserContext";

export default function LoginScreen() {
  const { setUser } = useUser();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState("");

  const handleAuth = async () => {
    if (!email || !password || (!isLoginMode && !username)) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurun.");
      return;
    }

    setIsLoading(true);
    setResultMessage("");

    try {
      if (isLoginMode) {
        // Giriş Yap İşlemi
        const result = await fetchLogin(email, password);
        setResultMessage(`Başarılı: ${result.message}`);
        
        // Backend'den gelen mesajdan kullanıcı adını ayrıştır ("Tekrar hoş geldin X!")
        let extractedUsername = "Kullanıcı";
        if (result.message && result.message.includes("Tekrar hoş geldin")) {
          extractedUsername = result.message.replace("Tekrar hoş geldin ", "").replace("!", "").trim();
        }

        // Yarım saniye bekle (kullanıcı "Başarılı" yazısını görsün) ve ana ekrana at
        setTimeout(() => {
          setUser({
            id: result.user_id,           // ← backend'den gelen ID
            username: extractedUsername,
            email: email,
            profilePic: result.profile_pic ?? null, // ← varsa mevcut profil fotoğrafı
          });
        }, 500);
      } else {
        // Kayıt Ol İşlemi
        const result = await fetchRegister(username, email, password);
        setResultMessage(`Başarılı: ${result.message}`);
        // Kayıt başarılı olunca giriş ekranına geri döndür
        setTimeout(() => {
          setIsLoginMode(true);
          setResultMessage("Kayıt başarılı! Şimdi giriş yapabilirsin.");
        }, 1500);
      }
    } catch (error: any) {
      setResultMessage(`Hata: ${error.message}`);
      Alert.alert(isLoginMode ? "Giriş Başarısız" : "Kayıt Başarısız", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-dark">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-center px-6"
      >
        <View className="items-center mb-10">
          <View className="w-20 h-20 bg-brand-primary rounded-3xl items-center justify-center mb-4 shadow-lg shadow-black/50">
            <Ionicons name="airplane" size={40} color="#BBE1FA" />
          </View>
          <Text className="text-3xl font-black text-text-light tracking-wider">WAT ASISTANT</Text>
          <Text className="text-text-light opacity-60 mt-2">Work & Travel Asistanın</Text>
        </View>

        <View className="space-y-4">
          {/* Username Input (Sadece Kayıt Modunda) */}
          {!isLoginMode && (
            <View className="bg-bg-card rounded-2xl px-4 py-3 border border-[#3282B830] flex-row items-center mb-4">
              <Ionicons name="person-outline" size={20} color="#BBE1FA80" className="mr-3" />
              <TextInput
                className="flex-1 text-text-light text-base ml-2"
                placeholder="Kullanıcı Adı"
                placeholderTextColor="#BBE1FA40"
                autoCapitalize="none"
                value={username}
                onChangeText={setUsername}
              />
            </View>
          )}

          {/* Email Input */}
          <View className="bg-bg-card rounded-2xl px-4 py-3 border border-[#3282B830] flex-row items-center">
            <Ionicons name="mail-outline" size={20} color="#BBE1FA80" className="mr-3" />
            <TextInput
              className="flex-1 text-text-light text-base ml-2"
              placeholder="E-posta"
              placeholderTextColor="#BBE1FA40"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Password Input */}
          <View className="bg-bg-card rounded-2xl px-4 py-3 border border-[#3282B830] flex-row items-center mt-4">
            <Ionicons name="lock-closed-outline" size={20} color="#BBE1FA80" className="mr-3" />
            <TextInput
              className="flex-1 text-text-light text-base ml-2"
              placeholder="Şifre"
              placeholderTextColor="#BBE1FA40"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* Test Sonucu Gösterme Alanı */}
          {resultMessage ? (
            <Text className={`text-center mt-4 font-bold ${resultMessage.includes('Başarılı') ? 'text-green-400' : 'text-red-400'}`}>
              {resultMessage}
            </Text>
          ) : null}

          {/* Login/Register Button */}
          <TouchableOpacity
            onPress={handleAuth}
            disabled={isLoading}
            className={`mt-6 rounded-2xl py-4 items-center flex-row justify-center ${isLoading ? 'bg-brand-primary/50' : 'bg-brand-primary'}`}
            style={{
              shadowColor: "#3282B8",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            {isLoading ? (
              <ActivityIndicator color="#BBE1FA" />
            ) : (
              <>
                <Text className="text-[#BBE1FA] font-bold text-lg mr-2">
                  {isLoginMode ? "Giriş Yap" : "Kayıt Ol"}
                </Text>
                <Ionicons name={isLoginMode ? "arrow-forward" : "person-add"} size={20} color="#BBE1FA" />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Geçiş Butonu */}
        <View className="mt-8 flex-row justify-center">
          <Text className="text-text-light opacity-60">
            {isLoginMode ? "Hesabın yok mu? " : "Zaten hesabın var mı? "}
          </Text>
          <TouchableOpacity onPress={() => {
            setIsLoginMode(!isLoginMode);
            setResultMessage("");
          }}>
            <Text className="text-brand-primary font-bold">
              {isLoginMode ? "Kayıt Ol" : "Giriş Yap"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
