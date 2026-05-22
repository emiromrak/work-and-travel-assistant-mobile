import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { fetchConversation, sendMessageAPI } from '../services/api';
import { useUser } from '../context/UserContext';

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  image_url?: string | null;
}

export default function ChatDetailScreen() {
  const { user } = useUser();
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { receiver } = route.params; // receiver: { id, username, profile_pic }

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const flatListRef = useRef<FlatList>(null);

  const getConversation = async (showLoading = false) => {
    if (!user) return;
    if (showLoading) setLoading(true);
    try {
      const response = await fetchConversation(user.id, receiver.id);
      if (response && response.status === 'success') {
        // En son mesajlar altta gözüksün diye listeyi ters (inverted) basacağız.
        // Bu yüzden API'den gelen artan sıralı diziyi ters çevirip FlatList'e besliyoruz.
        const reversed = [...response.data].reverse();
        setMessages(reversed);
      }
    } catch (error) {
      console.error('Konuşma yüklenirken hata:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // İlk yükleme ve Polling (Anlık güncelleme için)
  useEffect(() => {
    getConversation(true);

    const interval = setInterval(() => {
      getConversation(false);
    }, 2500); // 2.5 saniyede bir sohbeti yeniler

    return () => clearInterval(interval);
  }, [receiver.id]);

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
    });
    if (!result.canceled && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleSend = async () => {
    if (!user || (!inputText.trim() && !selectedImage)) return;

    const textToSend = inputText.trim() || '📸';
    const imageToSend = selectedImage;

    setInputText('');
    setSelectedImage(null);
    setSending(true);

    try {
      const response = await sendMessageAPI({
        sender_id: user.id,
        receiver_id: receiver.id,
        content: textToSend,
        imageUri: imageToSend,
      });

      if (response && response.status === 'success') {
        // Hemen konuşmayı yenile
        getConversation(false);
      }
    } catch (error) {
      console.error('Mesaj gönderilemedi:', error);
    } finally {
      setSending(false);
    }
  };

  const renderMessageItem = ({ item }: { item: Message }) => {
    const isMyMessage = item.sender_id === user?.id;
    return (
      <View
        className={`flex-row mb-2 ${isMyMessage ? 'justify-end' : 'justify-start'}`}
      >
        <View
          style={{
            maxWidth: '75%',
            backgroundColor: isMyMessage ? '#3282B8' : '#0F4C75',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            borderBottomLeftRadius: isMyMessage ? 16 : 4,
            borderBottomRightRadius: isMyMessage ? 4 : 16,
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderWidth: 1,
            borderColor: isMyMessage ? '#3282B830' : '#3282B810',
            overflow: 'hidden',
          }}
        >
          {/* 📸 Mesaj Görseli */}
          {item.image_url ? (
            <Image
              source={{ uri: item.image_url }}
              style={{
                width: 200,
                height: 200,
                borderRadius: 10,
                marginBottom: item.content && item.content !== '📸' ? 6 : 0,
              }}
              resizeMode="cover"
            />
          ) : null}
          {/* Metin (sadece gerçek metin varsa göster) */}
          {item.content && item.content !== '📸' ? (
            <Text className="text-text-light text-sm">{item.content}</Text>
          ) : null}
        </View>
      </View>
    );
  };

  const canSend = !sending && (!!inputText.trim() || !!selectedImage);

  return (
    <SafeAreaView className="flex-1 bg-bg-dark">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
      >
        {/* Header */}
        <View className="px-4 py-3 flex-row items-center border-b border-[#3282B820] bg-bg-card">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#BBE1FA" />
          </TouchableOpacity>
          
          {receiver.profile_pic ? (
            <Image
              source={{ uri: receiver.profile_pic }}
              className="w-10 h-10 rounded-full border border-brand-primary"
            />
          ) : (
            <View className="w-10 h-10 rounded-full bg-[#0F4C75] items-center justify-center border border-brand-primary">
              <Ionicons name="person" size={18} color="#BBE1FA" />
            </View>
          )}

          <View className="ml-3 flex-1">
            <Text className="text-text-light font-bold text-sm">{receiver.username}</Text>
            <Text className="text-text-light opacity-50 text-xs">J1 Student</Text>
          </View>
        </View>

        {/* Mesaj Listesi */}
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#3282B8" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessageItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ padding: 16 }}
            inverted
            ListEmptyComponent={
              <View className="flex-1 py-20 items-center justify-center" style={{ transform: [{ scaleY: -1 }] }}>
                <Ionicons name="chatbubble-ellipses-outline" size={50} color="#BBE1FA20" />
                <Text className="text-text-light opacity-40 text-center mt-4">
                  Sohbeti başlatmak için ilk mesajı yazın!
                </Text>
              </View>
            }
          />
        )}

        {/* 📸 Seçilen Fotoğraf Önizlemesi */}
        {selectedImage && (
          <View
            style={{
              marginHorizontal: 16,
              marginBottom: 6,
              position: 'relative',
              alignSelf: 'flex-start',
            }}
          >
            <Image
              source={{ uri: selectedImage }}
              style={{ width: 80, height: 80, borderRadius: 10, borderWidth: 1, borderColor: '#3282B8' }}
              resizeMode="cover"
            />
            <TouchableOpacity
              onPress={() => setSelectedImage(null)}
              style={{
                position: 'absolute',
                top: -6,
                right: -6,
                backgroundColor: '#E74C3C',
                borderRadius: 10,
                width: 20,
                height: 20,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="close" size={12} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {/* Mesaj Gönderme Barı */}
        <View className="p-4 bg-bg-card border-t border-[#3282B820] flex-row items-center">
          {/* 📷 Galeri Butonu */}
          <TouchableOpacity
            onPress={handlePickImage}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#0F4C75',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 8,
              borderWidth: 1,
              borderColor: '#3282B840',
            }}
          >
            <Ionicons name="image-outline" size={20} color="#BBE1FA" />
          </TouchableOpacity>

          <View className="flex-1 bg-bg-dark rounded-full px-4 py-2 border border-[#3282B830] flex-row items-center mr-3">
            <TextInput
              placeholder="Mesaj yazın..."
              placeholderTextColor="#BBE1FA40"
              className="flex-1 text-text-light text-sm"
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
          </View>
          <TouchableOpacity
            onPress={handleSend}
            disabled={!canSend}
            className={`w-10 h-10 rounded-full items-center justify-center bg-brand-primary ${!canSend ? 'opacity-60' : ''}`}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#BBE1FA" />
            ) : (
              <Ionicons name="send" size={16} color="#BBE1FA" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
