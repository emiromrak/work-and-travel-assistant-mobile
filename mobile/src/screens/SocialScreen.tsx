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
import { useNavigation } from '@react-navigation/native';

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
  const navigation = useNavigation<any>();
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

  const renderPostItem = ({ item }: { item: Post }) => {
    const isOwnPost = item.user_id === user?.id;
    const targetUser = {
      id: item.user_id,
      username: item.username,
      profile_pic: item.profile_pic,
    };

    return (
    <View
      style={{
        backgroundColor: '#0F4C75',
        borderWidth: 1,
        borderColor: '#3282B815',
        borderRadius: 20,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      {/* Kullanıcı Bilgisi — profile tıklanınca UserPublicProfile aç */}
      <TouchableOpacity
        onPress={() => {
          if (!isOwnPost) {
            navigation.navigate('UserPublicProfile', { targetUser });
          }
        }}
        activeOpacity={isOwnPost ? 1 : 0.7}
        style={{ flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: 10 }}
      >
        {item.profile_pic ? (
          <Image
            source={{ uri: item.profile_pic }}
            style={{ width: 42, height: 42, borderRadius: 21, borderWidth: 2, borderColor: '#3282B8' }}
          />
        ) : (
          <View
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: '#0F3460',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderColor: '#3282B8',
            }}
          >
            <Ionicons name="person" size={18} color="#BBE1FA" />
          </View>
        )}
        <View style={{ marginLeft: 12, flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ color: '#BBE1FA', fontWeight: '800', fontSize: 14 }}>{item.username}</Text>
            {isOwnPost && (
              <View style={{ backgroundColor: '#3282B820', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                <Text style={{ color: '#3282B8', fontSize: 10, fontWeight: '700' }}>Sen</Text>
              </View>
            )}
          </View>
          {/* 📍 Konum Badge */}
          {item.location_name ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
              <Ionicons name="location" size={11} color="#3282B8" />
              <Text style={{ color: '#3282B8', fontSize: 11, marginLeft: 3, fontWeight: '600' }}>{item.location_name}</Text>
            </View>
          ) : (
            <Text style={{ color: '#BBE1FA', opacity: 0.35, fontSize: 11, marginTop: 2 }}>J1 Student</Text>
          )}
        </View>
        {!isOwnPost && (
          <Ionicons name="chevron-forward" size={14} color="#BBE1FA20" />
        )}
      </TouchableOpacity>

      {/* Post Başlık & İçerik */}
      <View style={{ paddingHorizontal: 16, paddingBottom: item.image_url ? 0 : 16 }}>
        <Text style={{ color: '#BBE1FA', fontWeight: '800', fontSize: 15, marginBottom: 4 }}>{item.title}</Text>
        <Text style={{ color: '#BBE1FA', opacity: 0.7, fontSize: 13, lineHeight: 20 }}>{item.content}</Text>
      </View>

      {/* 📸 Post Görseli */}
      {item.image_url ? (
        <Image
          source={{ uri: item.image_url }}
          style={{ width: '100%', height: 220, marginTop: 12 }}
          resizeMode="cover"
        />
      ) : null}
    </View>
  );
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-dark">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View
          className="px-5 pt-5 pb-3 flex-row justify-between items-center"
          style={{ borderBottomWidth: 1, borderBottomColor: '#3282B815' }}
        >
          <View>
            <Text className="text-text-light text-2xl font-extrabold tracking-wide">🌍 Sosyal Akış</Text>
            <Text className="text-text-light opacity-40 text-xs mt-1 tracking-wide">
              Amerika'daki J1 öğrencilerinin paylaşımları
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              if (showForm) resetForm();
              setShowForm(!showForm);
            }}
            style={{
              backgroundColor: '#3282B8',
              width: 44,
              height: 44,
              borderRadius: 22,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#3282B8',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.35,
              shadowRadius: 10,
              elevation: 6,
            }}
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
                backgroundColor: '#0F4C75',
                borderRadius: 20,
                padding: 18,
                borderWidth: 1,
                borderColor: '#3282B820',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 10,
                elevation: 5,
              }}
            >
              <Text style={{ color: '#BBE1FA', fontWeight: '800', fontSize: 16, marginBottom: 14 }}>
                Yeni Paylaşım Yap
              </Text>

              {/* Başlık */}
              <View
                style={{
                  backgroundColor: '#152238',
                  borderRadius: 14,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  borderWidth: 1,
                  borderColor: '#3282B820',
                  marginBottom: 10,
                }}
              >
                <TextInput
                  placeholder="Konu Başlığı"
                  placeholderTextColor="#BBE1FA30"
                  style={{ color: '#BBE1FA', fontSize: 14, fontWeight: '700' }}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>

              {/* İçerik */}
              <View
                style={{
                  backgroundColor: '#152238',
                  borderRadius: 14,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  borderWidth: 1,
                  borderColor: '#3282B820',
                  marginBottom: 14,
                }}
              >
                <TextInput
                  placeholder="Ne paylaşmak istersin? (Konaklama, araba arayışı, parti vb.)"
                  placeholderTextColor="#BBE1FA30"
                  style={{ color: '#BBE1FA', fontSize: 13, height: 80, textAlignVertical: 'top' }}
                  multiline
                  numberOfLines={4}
                  value={content}
                  onChangeText={setContent}
                />
              </View>

              {/* 📸 Fotoğraf Seç & 📍 Konum Ekle Butonları */}
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
                <TouchableOpacity
                  onPress={handlePickImage}
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: selectedImage ? '#0F3460' : '#152238',
                    borderRadius: 14,
                    paddingVertical: 12,
                    borderWidth: 1,
                    borderColor: selectedImage ? '#3282B8' : '#3282B820',
                    gap: 6,
                  }}
                >
                  <Ionicons
                    name={selectedImage ? 'image' : 'image-outline'}
                    size={16}
                    color={selectedImage ? '#3282B8' : '#BBE1FA60'}
                  />
                  <Text style={{ color: selectedImage ? '#3282B8' : '#BBE1FA60', fontSize: 12, fontWeight: '700' }}>
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
                    backgroundColor: locationName ? '#0F3460' : '#152238',
                    borderRadius: 14,
                    paddingVertical: 12,
                    borderWidth: 1,
                    borderColor: locationName ? '#3282B8' : '#3282B820',
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
                        color={locationName ? '#3282B8' : '#BBE1FA60'}
                      />
                      <Text style={{ color: locationName ? '#3282B8' : '#BBE1FA60', fontSize: 12, fontWeight: '700' }}>
                        {locationName ? 'Konum Eklendi ✓' : 'Konum Ekle'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Seçili Fotoğraf Önizleme */}
              {selectedImage && (
                <View style={{ marginBottom: 12, position: 'relative' }}>
                  <Image
                    source={{ uri: selectedImage }}
                    style={{ width: '100%', height: 140, borderRadius: 14 }}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    onPress={() => setSelectedImage(null)}
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: '#E74C3C',
                      borderRadius: 14,
                      width: 26,
                      height: 26,
                      alignItems: 'center',
                      justifyContent: 'center',
                      shadowColor: '#E74C3C',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                      elevation: 3,
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
                    backgroundColor: '#152238',
                    borderRadius: 12,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: '#3282B830',
                    gap: 6,
                  }}
                >
                  <Ionicons name="location" size={14} color="#3282B8" />
                  <Text style={{ color: '#3282B8', fontSize: 12, flex: 1, fontWeight: '600' }}>{locationName}</Text>
                  <TouchableOpacity onPress={() => { setLocationName(null); setLocationCoords(null); }}>
                    <Ionicons name="close-circle" size={16} color="#BBE1FA40" />
                  </TouchableOpacity>
                </View>
              )}

              {/* Paylaş Butonu */}
              <TouchableOpacity
                onPress={handleCreatePost}
                disabled={submitting}
                style={{
                  backgroundColor: '#3282B8',
                  borderRadius: 14,
                  paddingVertical: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  gap: 8,
                  shadowColor: '#3282B8',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 5,
                }}
              >
                {submitting ? (
                  <ActivityIndicator color="#BBE1FA" />
                ) : (
                  <>
                    <Text style={{ color: '#BBE1FA', fontWeight: '800', fontSize: 15 }}>Paylaş</Text>
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
                <Ionicons name="chatbubbles-outline" size={60} color="#BBE1FA20" />
                <Text className="text-text-light opacity-30 text-center mt-4 text-sm">
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
