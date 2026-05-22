import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useUser } from '../context/UserContext';
import { useNavigation } from '@react-navigation/native';
import CitySearchInput from '../components/CitySearchInput';

export default function ProfileScreen() {
  const { user, setUser, updateProfilePic, updateUserProfile } = useUser();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stateCity, setStateCity] = useState(user?.stateCity ?? '');
  const [jobRole, setJobRole] = useState(user?.jobRole ?? '');
  const [startCity, setStartCity] = useState(user?.startCity ?? '');

  useEffect(() => {
    if (user) {
      setStateCity(user.stateCity ?? '');
      setJobRole(user.jobRole ?? '');
      setStartCity(user.startCity ?? '');
    }
  }, [user?.id]);

  // ── Fotoğraf seçimi ───────────────────────────────────────────────────────────
  const handlePickFromGallery = async () => {
    // Galeri izni iste
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Galeri İzni Gerekli',
        'Fotoğraf seçmek için galeri iznine ihtiyaç var. Ayarlardan izin verebilirsiniz.',
        [{ text: 'Tamam' }]
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadPhoto(result.assets[0].uri);
    }
  };

  const handlePickFromCamera = async () => {
    // Kamera izni iste
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Kamera İzni Gerekli',
        'Fotoğraf çekmek için kamera iznine ihtiyaç var. Ayarlardan izin verebilirsiniz.',
        [{ text: 'Tamam' }]
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadPhoto(result.assets[0].uri);
    }
  };

  const uploadPhoto = async (uri: string) => {
    setLoading(true);
    try {
      await updateProfilePic(uri);
    } catch (e) {
      Alert.alert('Hata', 'Fotoğraf yüklenirken bir sorun oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = () => {
    Alert.alert(
      'Profil Fotoğrafı',
      'Fotoğrafı nereden yüklemek istersiniz?',
      [
        {
          text: '📷 Kamera',
          onPress: handlePickFromCamera,
        },
        {
          text: '🖼️ Galeri',
          onPress: handlePickFromGallery,
        },
        {
          text: 'İptal',
          style: 'cancel',
        },
      ]
    );
  };

  // ── Kaydet ────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUserProfile(stateCity, jobRole, startCity);
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1B262C' }}>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingVertical: 16,
          flexDirection: 'row',
          alignItems: 'center',
          borderBottomWidth: 1,
          borderBottomColor: '#3282B830',
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 16 }}>
          <Ionicons name="arrow-back" size={24} color="#BBE1FA" />
        </TouchableOpacity>
        <Text style={{ color: '#BBE1FA', fontSize: 20, fontWeight: '800', flex: 1 }}>Profilim</Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 20, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Profil Fotoğrafı ─────────────────────────────────────────────── */}
        <View style={{ alignItems: 'center', marginBottom: 28 }}>
          <TouchableOpacity onPress={pickImage} disabled={loading} style={{ position: 'relative' }}>
            {user.profilePic ? (
              <Image
                source={{ uri: user.profilePic }}
                style={{ width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: '#3282B8' }}
              />
            ) : (
              <View
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  backgroundColor: '#0F4C75',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 3,
                  borderColor: '#3282B8',
                }}
              >
                <Ionicons name="person" size={56} color="#BBE1FA50" />
              </View>
            )}

            {/* Kamera ikonu */}
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                backgroundColor: '#3282B8',
                width: 36,
                height: 36,
                borderRadius: 18,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 3,
                borderColor: '#1B262C',
              }}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#BBE1FA" />
              ) : (
                <Ionicons name="camera" size={16} color="#BBE1FA" />
              )}
            </View>
          </TouchableOpacity>

          <Text style={{ color: '#BBE1FA', opacity: 0.5, fontSize: 12, marginTop: 10 }}>
            Değiştirmek için dokun
          </Text>
        </View>

        {/* ── Kullanıcı Bilgileri Kartı ─────────────────────────────────────── */}
        <View
          style={{
            backgroundColor: '#0F3460',
            borderRadius: 20,
            padding: 20,
            borderWidth: 1,
            borderColor: '#3282B830',
            marginBottom: 16,
            gap: 16,
          }}
        >
          {/* Kullanıcı Adı */}
          <View>
            <Text style={{ color: '#BBE1FA', opacity: 0.5, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
              Kullanıcı Adı
            </Text>
            <Text style={{ color: '#BBE1FA', fontSize: 17, fontWeight: '600' }}>{user.username}</Text>
          </View>

          <View style={{ height: 1, backgroundColor: '#3282B820' }} />

          {/* E-posta */}
          <View>
            <Text style={{ color: '#BBE1FA', opacity: 0.5, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
              E-Posta Adresi
            </Text>
            <Text style={{ color: '#BBE1FA', fontSize: 17, fontWeight: '600' }}>{user.email}</Text>
          </View>

          <View style={{ height: 1, backgroundColor: '#3282B820' }} />

          {/* Hedef Şehir — CitySearchInput */}
          <CitySearchInput
            label="🎯 Gidilecek Eyalet / Şehir"
            placeholder="Örn: Orlando, FL"
            value={stateCity}
            onSelect={setStateCity}
            icon="location-outline"
          />

          <View style={{ height: 1, backgroundColor: '#3282B820' }} />

          {/* Başlangıç Şehri — CitySearchInput */}
          <CitySearchInput
            label="🏠 Uçuş Başlangıç Şehri (Hometown)"
            placeholder="Örn: İstanbul, Ankara..."
            value={startCity}
            onSelect={setStartCity}
            icon="home-outline"
          />

          <View style={{ height: 1, backgroundColor: '#3282B820' }} />

          {/* İş / Pozisyon */}
          <View>
            <Text style={{ color: '#BBE1FA', opacity: 0.5, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
              İş / Pozisyon
            </Text>
            <View
              style={{
                backgroundColor: '#1B262C',
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderWidth: 1,
                borderColor: '#3282B840',
              }}
            >
              <TextInput
                value={jobRole}
                onChangeText={setJobRole}
                placeholder="Örn: Resort Worker"
                placeholderTextColor="#BBE1FA30"
                style={{ color: '#BBE1FA', fontSize: 15 }}
              />
            </View>
          </View>
        </View>

        {/* ── Kaydet Butonu ─────────────────────────────────────────────────── */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          style={{
            backgroundColor: '#3282B8',
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            marginBottom: 12,
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? (
            <ActivityIndicator color="#BBE1FA" />
          ) : (
            <>
              <Ionicons name="save-outline" size={20} color="#BBE1FA" style={{ marginRight: 8 }} />
              <Text style={{ color: '#BBE1FA', fontWeight: '700', fontSize: 16 }}>Değişiklikleri Kaydet</Text>
            </>
          )}
        </TouchableOpacity>

        {/* ── Çıkış Yap ────────────────────────────────────────────────────── */}
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: '#ef444450',
            backgroundColor: '#ef444415',
            marginBottom: 20,
          }}
        >
          <Ionicons name="log-out-outline" size={20} color="#ef4444" style={{ marginRight: 8 }} />
          <Text style={{ color: '#ef4444', fontWeight: '700', fontSize: 16 }}>Çıkış Yap</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
