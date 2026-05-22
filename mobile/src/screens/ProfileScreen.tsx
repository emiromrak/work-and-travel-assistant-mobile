import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator, Alert, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useUser } from '../context/UserContext';
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
  const { user, setUser, updateProfilePic, updateUserProfile } = useUser();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stateCity, setStateCity] = useState(user?.stateCity ?? '');
  const [jobRole, setJobRole] = useState(user?.jobRole ?? '');

  useEffect(() => {
    if (user) {
      setStateCity(user.stateCity ?? '');
      setJobRole(user.jobRole ?? '');
    }
  }, [user?.id]);

  const pickImage = async () => {
    // Galeri izni iste
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Fotoğraf seçmek için galeri iznine ihtiyaç var.');
      return;
    }

    // Galeriden fotoğraf seç
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setLoading(true);
      try {
        await updateProfilePic(result.assets[0].uri);
      } catch (e) {
        Alert.alert('Hata', 'Fotoğraf yüklenirken bir sorun oluştu.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUserProfile(stateCity, jobRole);
      Alert.alert('Başarılı', 'Profil bilgileriniz kaydedildi!');
    } catch (e) {
      Alert.alert('Hata', 'Bilgiler güncellenirken bir sorun oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) return null;

  return (
    <SafeAreaView className="flex-1 bg-bg-dark">
      {/* Header */}
      <View className="px-5 py-4 flex-row items-center border-b border-[#3282B830] bg-bg-dark">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#BBE1FA" />
        </TouchableOpacity>
        <Text className="text-text-light text-xl font-bold flex-1">Profilim</Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 20 }} keyboardShouldPersistTaps="handled">
        <View className="items-center">
          {/* Profil Resmi */}
          <TouchableOpacity onPress={pickImage} className="relative mb-8" disabled={loading}>
            {user.profilePic ? (
              <Image
                source={{ uri: user.profilePic }}
                style={{ width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: '#3282B8' }}
              />
            ) : (
              <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: '#0F4C75', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#3282B8' }}>
                <Ionicons name="person" size={60} color="#BBE1FA80" />
              </View>
            )}

            {/* Kamera ikonu veya yükleme göstergesi */}
            <View className="absolute bottom-0 right-0 bg-brand-primary w-10 h-10 rounded-full items-center justify-center border-4 border-bg-dark">
              {loading
                ? <ActivityIndicator size="small" color="#BBE1FA" />
                : <Ionicons name="camera" size={18} color="#BBE1FA" />
              }
            </View>
          </TouchableOpacity>

          {/* Kullanıcı Bilgileri */}
          <View className="w-full bg-bg-card rounded-2xl p-6 border border-[#3282B830] space-y-4 mb-6">
            <View>
              <Text className="text-text-light opacity-60 text-xs mb-1 uppercase tracking-wider font-bold">Kullanıcı Adı</Text>
              <Text className="text-text-light text-lg font-semibold">{user.username}</Text>
            </View>

            <View className="h-[1px] bg-[#3282B830] my-2" />

            <View>
              <Text className="text-text-light opacity-60 text-xs mb-1 uppercase tracking-wider font-bold">E-Posta Adresi</Text>
              <Text className="text-text-light text-lg font-semibold">{user.email}</Text>
            </View>

            <View className="h-[1px] bg-[#3282B830] my-2" />

            <View>
              <Text className="text-text-light opacity-60 text-xs mb-1 uppercase tracking-wider font-bold">Gidilecek Eyalet / Şehir</Text>
              <View className="bg-bg-dark rounded-xl px-3 py-2 border border-[#3282B830] mt-1">
                <TextInput
                  value={stateCity}
                  onChangeText={setStateCity}
                  placeholder="Örn: Orlando, FL"
                  placeholderTextColor="#BBE1FA40"
                  style={{ color: '#BBE1FA', fontSize: 16 }}
                />
              </View>
            </View>

            <View className="h-[1px] bg-[#3282B830] my-2" />

            <View>
              <Text className="text-text-light opacity-60 text-xs mb-1 uppercase tracking-wider font-bold">İş / Pozisyon</Text>
              <View className="bg-bg-dark rounded-xl px-3 py-2 border border-[#3282B830] mt-1">
                <TextInput
                  value={jobRole}
                  onChangeText={setJobRole}
                  placeholder="Örn: Resort Worker"
                  placeholderTextColor="#BBE1FA40"
                  style={{ color: '#BBE1FA', fontSize: 16 }}
                />
              </View>
            </View>
          </View>

          {/* Kaydet Butonu */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            className="w-full bg-brand-primary rounded-2xl py-4 items-center flex-row justify-center mb-4"
          >
            {saving ? (
              <ActivityIndicator color="#BBE1FA" />
            ) : (
              <>
                <Ionicons name="save-outline" size={20} color="#BBE1FA" style={{ marginRight: 8 }} />
                <Text className="text-[#BBE1FA] font-bold text-lg">Değişiklikleri Kaydet</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Çıkış Yap Butonu */}
          <TouchableOpacity
            onPress={handleLogout}
            className="w-full rounded-2xl py-4 items-center flex-row justify-center border border-red-500/50 bg-red-500/10 mb-8"
          >
            <Ionicons name="log-out-outline" size={20} color="#ef4444" style={{ marginRight: 8 }} />
            <Text className="text-red-500 font-bold text-lg">Çıkış Yap</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
