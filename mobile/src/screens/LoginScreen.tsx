import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
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
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const PRIVACY_URL = "https://oasis-backend-pro.onrender.com/privacy";

  const handleAuth = async () => {
    if (!email || !password || (!isLoginMode && !username)) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurun.");
      return;
    }
    // Kayıt modunda gizlilik politikası onayı zorunlu
    if (!isLoginMode && !privacyAccepted) {
      Alert.alert(
        "Onay Gerekli",
        "Devam etmek için Gizlilik Politikası'nı kabul etmelisin."
      );
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
            stateCity: result.state_city ?? '',
            jobRole: result.job_role ?? '',
            startCity: result.start_city ?? '',
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
        {/* Logo & Branding */}
        <View className="items-center mb-12">
          <View
            className="w-24 h-24 bg-brand-primary rounded-3xl items-center justify-center mb-5"
            style={{
              shadowColor: "#3282B8",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.45,
              shadowRadius: 20,
              elevation: 15,
            }}
          >
            <Ionicons name="airplane" size={44} color="#BBE1FA" />
          </View>
          <Text className="text-3xl font-black text-text-light tracking-widest">WAT ASISTANT</Text>
          <Text className="text-text-light opacity-50 mt-2 text-sm tracking-wide">Work & Travel Asistanın</Text>
        </View>

        {/* Form Card */}
        <View
          style={{
            backgroundColor: "#0F4C7518",
            borderRadius: 24,
            padding: 20,
            borderWidth: 1,
            borderColor: "#3282B815",
          }}
        >
          {/* Username Input (Sadece Kayıt Modunda) */}
          {!isLoginMode && (
            <View
              className="flex-row items-center mb-4"
              style={{
                backgroundColor: "#152238",
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 14,
                borderWidth: 1,
                borderColor: "#3282B825",
              }}
            >
              <Ionicons name="person-outline" size={20} color="#BBE1FA60" />
              <TextInput
                className="flex-1 text-text-light text-base ml-3"
                placeholder="Kullanıcı Adı"
                placeholderTextColor="#BBE1FA30"
                autoCapitalize="none"
                value={username}
                onChangeText={setUsername}
              />
            </View>
          )}

          {/* Email Input */}
          <View
            className="flex-row items-center"
            style={{
              backgroundColor: "#152238",
              borderRadius: 16,
              paddingHorizontal: 16,
              paddingVertical: 14,
              borderWidth: 1,
              borderColor: "#3282B825",
            }}
          >
            <Ionicons name="mail-outline" size={20} color="#BBE1FA60" />
            <TextInput
              className="flex-1 text-text-light text-base ml-3"
              placeholder="E-posta"
              placeholderTextColor="#BBE1FA30"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Password Input */}
          <View
            className="flex-row items-center mt-4"
            style={{
              backgroundColor: "#152238",
              borderRadius: 16,
              paddingHorizontal: 16,
              paddingVertical: 14,
              borderWidth: 1,
              borderColor: "#3282B825",
            }}
          >
            <Ionicons name="lock-closed-outline" size={20} color="#BBE1FA60" />
            <TextInput
              className="flex-1 text-text-light text-base ml-3"
              placeholder="Şifre"
              placeholderTextColor="#BBE1FA30"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* Test Sonucu Gösterme Alanı */}
          {resultMessage ? (
            <Text className={`text-center mt-4 font-bold text-sm ${resultMessage.includes('Başarılı') ? 'text-green-400' : 'text-red-400'}`}>
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
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.4,
              shadowRadius: 14,
              elevation: 8,
              borderRadius: 16,
            }}
          >
            {isLoading ? (
              <ActivityIndicator color="#BBE1FA" />
            ) : (
              <>
                <Text className="text-[#BBE1FA] font-extrabold text-lg mr-2 tracking-wide">
                  {isLoginMode ? "Giriş Yap" : "Kayıt Ol"}
                </Text>
                <Ionicons name={isLoginMode ? "arrow-forward" : "person-add"} size={20} color="#BBE1FA" />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Geçiş Butonu */}
        <View className="mt-8 flex-row justify-center">
          <Text className="text-text-light opacity-50 text-sm">
            {isLoginMode ? "Hesabın yok mu? " : "Zaten hesabın var mı? "}
          </Text>
          <TouchableOpacity onPress={() => {
            setIsLoginMode(!isLoginMode);
            setResultMessage("");
            setPrivacyAccepted(false);
          }}>
            <Text className="text-brand-primary font-bold text-sm">
              {isLoginMode ? "Kayıt Ol" : "Giriş Yap"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Gizlilik Politikası notu — sadece kayıt modunda */}
        {!isLoginMode && (
          <View style={{ marginTop: 24, paddingHorizontal: 4 }}>
            <TouchableOpacity
              onPress={() => setPrivacyAccepted(!privacyAccepted)}
              style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}
              activeOpacity={0.7}
            >
              {/* Checkbox */}
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 8,
                  borderWidth: 2,
                  borderColor: privacyAccepted ? '#3282B8' : '#3282B850',
                  backgroundColor: privacyAccepted ? '#3282B8' : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 1,
                  flexShrink: 0,
                }}
              >
                {privacyAccepted && (
                  <Text style={{ color: '#fff', fontSize: 13, fontWeight: '800', lineHeight: 16 }}>✓</Text>
                )}
              </View>

              {/* Metin */}
              <Text style={{ color: '#BBE1FA', opacity: 0.6, fontSize: 13, flex: 1, lineHeight: 20 }}>
                {'Kayıt olarak '}
                <Text
                  style={{ color: '#3282B8', textDecorationLine: 'underline', fontWeight: '600' }}
                  onPress={() => Linking.openURL(PRIVACY_URL)}
                >
                  Gizlilik Politikası
                </Text>
                {"'nı okuduğumu ve kabul ettiğimi onaylıyorum."}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
