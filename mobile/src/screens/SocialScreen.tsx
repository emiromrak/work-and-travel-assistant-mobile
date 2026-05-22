import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { fetchPosts, createPostAPI } from '../services/api';
import { useUser } from '../context/UserContext';

interface Post {
  id: number;
  title: string;
  content: string;
  user_id: number;
  username: string;
  profile_pic: string | null;
  image_url?: string | null;
  location_name?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export default function SocialScreen() {
  const { user } = useUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Post oluşturma form durumu
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 📸 Fotoğraf & Konum durumu
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [fetchingLocation, setFetchingLocation] = useState(false);

  const getPosts = async () => {
    try {
      const response = await fetchPosts();
      if (response && response.status === 'success') {
        setPosts(response.data);
      }
    } catch (error) {
      console.error('Gönderiler yüklenirken hata:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    getPosts();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    getPosts();
  };

  // 📸 Galeriden fotoğraf seç
  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Galeriye erişim izni vermeniz gerekiyor.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
      aspect: [16, 9],
    });
    if (!result.canceled && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  // 📍 Anlık konumu al ve reverse geocode yap
  const handleGetLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Konum erişim izni vermeniz gerekiyor.');
      return;
    }

    setFetchingLocation(true);
    try {
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = position.coords;
      setLocationCoords({ lat: latitude, lng: longitude });

      // Reverse Geocode → şehir ismi al
      const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (place) {
        const city = place.city || place.subregion || place.region || '';
        const country = place.country || '';
        setLocationName(`${city}${country ? ', ' + country : ''}`);
      } else {
        setLocationName(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      }
    } catch (error) {
      Alert.alert('Hata', 'Konum alınamadı. Lütfen tekrar deneyin.');
    } finally {
      setFetchingLocation(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setSelectedImage(null);
    setLocationName(null);
    setLocationCoords(null);
  };

  const handleCreatePost = async () => {
    if (!user) {
      Alert.alert('Hata', 'Paylaşım yapmak için giriş yapmalısınız.');
      return;
    }
    if (!title.trim() || !content.trim()) {
      Alert.alert('Hata', 'Lütfen başlık ve içerik alanlarını doldurun.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await createPostAPI({
        title: title.trim(),
        content: content.trim(),
        user_id: user.id,
        imageUri: selectedImage,
        locationName: locationName,
        lat: locationCoords?.lat ?? null,
        lng: locationCoords?.lng ?? null,
      });

      if (response && response.status === 'success') {
        resetForm();
        setShowForm(false);
        getPosts(); // Listeyi yenile
        Alert.alert('Başarılı 🎉', 'Gönderiniz paylaşıldı!');
      }
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Gönderi paylaşılırken bir hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderPostItem = ({ item }: { item: Post }) => (
    <View
      style={{
        backgroundColor: '#1A2F45',
        borderWidth: 1,
        borderColor: '#3282B820',
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
      }}
    >
      {/* Kullanıcı Bilgisi */}
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 14, paddingBottom: 10 }}>
        {item.profile_pic ? (
          <Image
            source={{ uri: item.profile_pic }}
            style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: '#3282B8' }}
          />
        ) : (
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#0F4C75',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: '#3282B8',
            }}
          >
            <Ionicons name="person" size={18} color="#BBE1FA" />
          </View>
        )}
        <View style={{ marginLeft: 10, flex: 1 }}>
          <Text style={{ color: '#BBE1FA', fontWeight: 'bold', fontSize: 13 }}>{item.username}</Text>
          {/* 📍 Konum Badge */}
          {item.location_name ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
              <Ionicons name="location" size={11} color="#3282B8" />
              <Text style={{ color: '#3282B8', fontSize: 11, marginLeft: 2 }}>{item.location_name}</Text>
            </View>
          ) : (
            <Text style={{ color: '#BBE1FA', opacity: 0.4, fontSize: 11, marginTop: 2 }}>J1 Student</Text>
          )}
        </View>
      </View>

      {/* Post Başlık & İçerik */}
      <View style={{ paddingHorizontal: 14, paddingBottom: item.image_url ? 0 : 14 }}>
        <Text style={{ color: '#BBE1FA', fontWeight: 'bold', fontSize: 15, marginBottom: 4 }}>{item.title}</Text>
        <Text style={{ color: '#BBE1FA', opacity: 0.8, fontSize: 13, lineHeight: 19 }}>{item.content}</Text>
      </View>

      {/* 📸 Post Görseli */}
      {item.image_url ? (
        <Image
          source={{ uri: item.image_url }}
          style={{ width: '100%', height: 220, marginTop: 10 }}
          resizeMode="cover"
        />
      ) : null}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-bg-dark">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="px-5 pt-4 pb-2 flex-row justify-between items-center border-b border-[#3282B820]">
          <View>
            <Text className="text-text-light text-2xl font-bold">🌍 Sosyal Akış</Text>
            <Text className="text-text-light opacity-60 text-xs mt-1">
              Amerika'daki J1 öğrencilerinin paylaşımları
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              if (showForm) resetForm();
              setShowForm(!showForm);
            }}
            className="bg-brand-primary w-10 h-10 rounded-full items-center justify-center shadow-lg"
          >
            <Ionicons name={showForm ? 'close' : 'add'} size={24} color="#BBE1FA" />
          </TouchableOpacity>
        </View>

        {/* Gönderi Ekleme Formu */}
        {showForm && (
          <ScrollView
            style={{ maxHeight: 420 }}
            contentContainerStyle={{ padding: 16 }}
            keyboardShouldPersistTaps="handled"
          >
            <View
              style={{
                backgroundColor: '#1A2F45',
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: '#3282B840',
              }}
            >
              <Text style={{ color: '#BBE1FA', fontWeight: 'bold', fontSize: 15, marginBottom: 12 }}>
                Yeni Paylaşım Yap
              </Text>

              {/* Başlık */}
              <View
                style={{
                  backgroundColor: '#0D2136',
                  borderRadius: 10,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderWidth: 1,
                  borderColor: '#3282B830',
                  marginBottom: 10,
                }}
              >
                <TextInput
                  placeholder="Konu Başlığı"
                  placeholderTextColor="#BBE1FA40"
                  style={{ color: '#BBE1FA', fontSize: 13, fontWeight: '600' }}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>

              {/* İçerik */}
              <View
                style={{
                  backgroundColor: '#0D2136',
                  borderRadius: 10,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderWidth: 1,
                  borderColor: '#3282B830',
                  marginBottom: 12,
                }}
              >
                <TextInput
                  placeholder="Ne paylaşmak istersin? (Konaklama, araba arayışı, parti vb.)"
                  placeholderTextColor="#BBE1FA40"
                  style={{ color: '#BBE1FA', fontSize: 13, height: 80, textAlignVertical: 'top' }}
                  multiline
                  numberOfLines={4}
                  value={content}
                  onChangeText={setContent}
                />
              </View>

              {/* 📸 Fotoğraf Seç & 📍 Konum Ekle Butonları */}
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
                <TouchableOpacity
                  onPress={handlePickImage}
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: selectedImage ? '#0F4C75' : '#0D2136',
                    borderRadius: 10,
                    paddingVertical: 10,
                    borderWidth: 1,
                    borderColor: selectedImage ? '#3282B8' : '#3282B830',
                    gap: 6,
                  }}
                >
                  <Ionicons
                    name={selectedImage ? 'image' : 'image-outline'}
                    size={16}
                    color={selectedImage ? '#3282B8' : '#BBE1FA80'}
                  />
                  <Text style={{ color: selectedImage ? '#3282B8' : '#BBE1FA80', fontSize: 12, fontWeight: '600' }}>
                    {selectedImage ? 'Fotoğraf Seçildi ✓' : 'Fotoğraf Ekle'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleGetLocation}
                  disabled={fetchingLocation}
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: locationName ? '#0F4C75' : '#0D2136',
                    borderRadius: 10,
                    paddingVertical: 10,
                    borderWidth: 1,
                    borderColor: locationName ? '#3282B8' : '#3282B830',
                    gap: 6,
                  }}
                >
                  {fetchingLocation ? (
                    <ActivityIndicator size="small" color="#3282B8" />
                  ) : (
                    <>
                      <Ionicons
                        name={locationName ? 'location' : 'location-outline'}
                        size={16}
                        color={locationName ? '#3282B8' : '#BBE1FA80'}
                      />
                      <Text style={{ color: locationName ? '#3282B8' : '#BBE1FA80', fontSize: 12, fontWeight: '600' }}>
                        {locationName ? 'Konum Eklendi ✓' : 'Konum Ekle'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Seçili Fotoğraf Önizleme */}
              {selectedImage && (
                <View style={{ marginBottom: 10, position: 'relative' }}>
                  <Image
                    source={{ uri: selectedImage }}
                    style={{ width: '100%', height: 140, borderRadius: 10 }}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    onPress={() => setSelectedImage(null)}
                    style={{
                      position: 'absolute',
                      top: 6,
                      right: 6,
                      backgroundColor: '#E74C3C',
                      borderRadius: 12,
                      width: 24,
                      height: 24,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name="close" size={14} color="#fff" />
                  </TouchableOpacity>
                </View>
              )}

              {/* Seçili Konum Badge */}
              {locationName && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#0D2136',
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    marginBottom: 10,
                    borderWidth: 1,
                    borderColor: '#3282B840',
                    gap: 6,
                  }}
                >
                  <Ionicons name="location" size={14} color="#3282B8" />
                  <Text style={{ color: '#3282B8', fontSize: 12, flex: 1 }}>{locationName}</Text>
                  <TouchableOpacity onPress={() => { setLocationName(null); setLocationCoords(null); }}>
                    <Ionicons name="close-circle" size={16} color="#BBE1FA50" />
                  </TouchableOpacity>
                </View>
              )}

              {/* Paylaş Butonu */}
              <TouchableOpacity
                onPress={handleCreatePost}
                disabled={submitting}
                style={{
                  backgroundColor: '#3282B8',
                  borderRadius: 10,
                  paddingVertical: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  gap: 8,
                }}
              >
                {submitting ? (
                  <ActivityIndicator color="#BBE1FA" />
                ) : (
                  <>
                    <Text style={{ color: '#BBE1FA', fontWeight: 'bold', fontSize: 14 }}>Paylaş</Text>
                    <Ionicons name="send" size={14} color="#BBE1FA" />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

        {/* Akış Listesi */}
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#3282B8" />
          </View>
        ) : (
          <FlatList
            data={posts}
            renderItem={renderPostItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ padding: 16 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#3282B8" />
            }
            ListEmptyComponent={
              <View className="flex-1 py-20 items-center justify-center">
                <Ionicons name="chatbubbles-outline" size={60} color="#BBE1FA30" />
                <Text className="text-text-light opacity-40 text-center mt-4">
                  Henüz paylaşım yapılmamış.{'\n'}İlk paylaşımı sen yap!
                </Text>
              </View>
            }
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
