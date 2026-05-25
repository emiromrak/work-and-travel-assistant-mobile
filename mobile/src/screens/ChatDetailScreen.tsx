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
            backgroundColor: isMyMessage ? '#3282B8' : '#152238',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            borderBottomLeftRadius: isMyMessage ? 20 : 4,
            borderBottomRightRadius: isMyMessage ? 4 : 20,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderWidth: 1,
            borderColor: isMyMessage ? '#3282B840' : '#3282B815',
            overflow: 'hidden',
            shadowColor: isMyMessage ? '#3282B8' : '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isMyMessage ? 0.4 : 0.15,
            shadowRadius: isMyMessage ? 6 : 4,
            elevation: isMyMessage ? 4 : 2,
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
        <View
          style={{
            paddingHorizontal: 20,
            paddingVertical: 16,
            flexDirection: 'row',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: '#3282B815',
            backgroundColor: '#0F3460',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 10,
            elevation: 6,
            zIndex: 10,
          }}
        >
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 14 }}>
            <Ionicons name="arrow-back" size={24} color="#BBE1FA" />
          </TouchableOpacity>
          
          <View style={{ position: 'relative' }}>
            {receiver.profile_pic ? (
              <Image
                source={{ uri: receiver.profile_pic }}
                style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: '#3282B8' }}
              />
            ) : (
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#152238', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#3282B8' }}>
                <Ionicons name="person" size={20} color="#BBE1FA" />
              </View>
            )}
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: '#4ade80',
                borderWidth: 2,
                borderColor: '#0F3460',
              }}
            />
          </View>

          <View className="ml-4 flex-1">
            <Text style={{ color: '#BBE1FA', fontWeight: '900', fontSize: 16, letterSpacing: 0.3 }}>{receiver.username}</Text>
            <Text style={{ color: '#BBE1FA', opacity: 0.5, fontSize: 11, marginTop: 2, fontWeight: '600' }}>J1 Student</Text>
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
                <Ionicons name="chatbubble-ellipses-outline" size={50} color="#BBE1FA15" />
                <Text className="text-text-light opacity-30 text-center mt-4 text-sm">
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
              style={{ width: 80, height: 80, borderRadius: 14, borderWidth: 2, borderColor: '#3282B8' }}
              resizeMode="cover"
            />
            <TouchableOpacity
              onPress={() => setSelectedImage(null)}
              style={{
                position: 'absolute',
                top: -6,
                right: -6,
                backgroundColor: '#E74C3C',
                borderRadius: 12,
                width: 22,
                height: 22,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#E74C3C',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Ionicons name="close" size={12} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {/* Mesaj Gönderme Barı */}
        <View
          style={{
            marginHorizontal: 16,
            marginBottom: Platform.OS === 'ios' ? 8 : 16,
            marginTop: 8,
            padding: 8,
            backgroundColor: '#0F3460',
            borderRadius: 36,
            borderWidth: 1,
            borderColor: '#3282B820',
            flexDirection: 'row',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          {/* 📷 Galeri Butonu */}
          <TouchableOpacity
            onPress={handlePickImage}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#152238',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 10,
              marginLeft: 4,
              borderWidth: 1,
              borderColor: '#3282B820',
            }}
          >
            <Ionicons name="image-outline" size={20} color="#BBE1FA" />
          </TouchableOpacity>

          <View
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              paddingHorizontal: 8,
              paddingVertical: 8,
              flexDirection: 'row',
              alignItems: 'center',
              marginRight: 10,
              maxHeight: 100,
            }}
          >
            <TextInput
              placeholder="Mesaj yazın..."
              placeholderTextColor="#BBE1FA30"
              className="flex-1 text-text-light text-sm"
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
          </View>
          <TouchableOpacity
            onPress={handleSend}
            disabled={!canSend}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: canSend ? '#3282B8' : '#3282B830',
              shadowColor: canSend ? '#3282B8' : 'transparent',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.4,
              shadowRadius: 8,
              elevation: canSend ? 4 : 0,
            }}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#BBE1FA" />
            ) : (
              <Ionicons name="send" size={18} color="#BBE1FA" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
