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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { fetchPosts, createPostAPI } from '../services/api';
import { useUser } from '../context/UserContext';

interface Post {
  id: number;
  title: string;
  content: string;
  user_id: number;
  username: string;
  profile_pic: string | null;
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
      });

      if (response && response.status === 'success') {
        setTitle('');
        setContent('');
        setShowForm(false);
        getPosts(); // Listeyi yenile
        Alert.alert('Başarılı', 'Gönderiniz paylaşıldı!');
      }
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Gönderi paylaşılırken bir hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderPostItem = ({ item }: { item: Post }) => (
    <View className="bg-bg-card border border-[#3282B820] rounded-2xl p-4 mb-4">
      {/* Kullanıcı Bilgisi */}
      <View className="flex-row items-center mb-3">
        {item.profile_pic ? (
          <Image
            source={{ uri: item.profile_pic }}
            className="w-10 h-10 rounded-full border border-brand-primary"
          />
        ) : (
          <View className="w-10 h-10 rounded-full bg-[#0F4C75] items-center justify-center border border-brand-primary">
            <Ionicons name="person" size={18} color="#BBE1FA" />
          </View>
        )}
        <View className="ml-3">
          <Text className="text-text-light font-bold text-sm">{item.username}</Text>
          <Text className="text-text-light opacity-40 text-xs">J1 Student</Text>
        </View>
      </View>

      {/* Post İçeriği */}
      <Text className="text-text-light font-bold text-base mb-1">{item.title}</Text>
      <Text className="text-text-light opacity-80 text-sm leading-5">{item.content}</Text>
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
            onPress={() => setShowForm(!showForm)}
            className="bg-brand-primary w-10 h-10 rounded-full items-center justify-center shadow-lg"
          >
            <Ionicons name={showForm ? 'close' : 'add'} size={24} color="#BBE1FA" />
          </TouchableOpacity>
        </View>

        {/* Gönderi Ekleme Formu */}
        {showForm && (
          <View className="m-5 p-4 bg-bg-card border border-brand-primary/40 rounded-2xl space-y-3">
            <Text className="text-text-light font-bold text-base mb-1">Yeni Paylaşım Yap</Text>
            
            <View className="bg-bg-dark rounded-xl px-4 py-2 border border-[#3282B830]">
              <TextInput
                placeholder="Konu Başlığı"
                placeholderTextColor="#BBE1FA40"
                className="text-text-light text-sm font-semibold"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View className="bg-bg-dark rounded-xl px-4 py-2 border border-[#3282B830]">
              <TextInput
                placeholder="Ne paylaşmak istersin? (Konaklama, araba arayışı, parti vb.)"
                placeholderTextColor="#BBE1FA40"
                className="text-text-light text-sm h-20"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={content}
                onChangeText={setContent}
              />
            </View>

            <TouchableOpacity
              onPress={handleCreatePost}
              disabled={submitting}
              className="bg-brand-primary py-3 rounded-xl items-center justify-center flex-row"
            >
              {submitting ? (
                <ActivityIndicator color="#BBE1FA" />
              ) : (
                <>
                  <Text className="text-[#BBE1FA] font-bold text-sm mr-2">Paylaş</Text>
                  <Ionicons name="send" size={14} color="#BBE1FA" />
                </>
              )}
            </TouchableOpacity>
          </View>
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
            contentContainerStyle={{ padding: 20 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#3282B8" />
            }
            ListEmptyComponent={
              <View className="flex-1 py-20 items-center justify-center">
                <Ionicons name="chatbubbles-outline" size={60} color="#BBE1FA30" />
                <Text className="text-text-light opacity-40 text-center mt-4">
                  Henüz paylaşım yapılmamış.{"\n"}İlk paylaşımı sen yap!
                </Text>
              </View>
            }
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
