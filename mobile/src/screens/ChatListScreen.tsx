import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { fetchUsers } from '../services/api';
import { useUser } from '../context/UserContext';

interface OtherUser {
  id: number;
  username: string;
  email: string;
  state_city: string;
  job_role: string;
  profile_pic: string | null;
}

export default function ChatListScreen() {
  const { user } = useUser();
  const navigation = useNavigation<any>();
  const [users, setUsers] = useState<OtherUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getUsers = async () => {
    try {
      const response = await fetchUsers();
      if (response && response.status === 'success') {
        // Kendimizi listeden çıkaralım
        const filtered = response.data.filter((u: OtherUser) => u.id !== user?.id);
        setUsers(filtered);
      }
    } catch (error) {
      console.error('Kullanıcılar yüklenirken hata:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    getUsers();
  };

  const renderUserItem = ({ item }: { item: OtherUser }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ChatDetail', { receiver: item })}
      className="bg-bg-card border border-[#3282B820] rounded-2xl p-4 mb-3 flex-row items-center justify-between"
    >
      <View className="flex-row items-center flex-1 pr-3">
        {item.profile_pic ? (
          <Image
            source={{ uri: item.profile_pic }}
            className="w-12 h-12 rounded-full border-2 border-brand-primary"
          />
        ) : (
          <View className="w-12 h-12 rounded-full bg-[#0F4C75] items-center justify-center border-2 border-brand-primary">
            <Ionicons name="person" size={22} color="#BBE1FA" />
          </View>
        )}
        <View className="ml-3 flex-1">
          <Text className="text-text-light font-bold text-base">{item.username}</Text>
          <Text className="text-text-light opacity-50 text-xs mt-0.5" numberOfLines={1}>
            {item.job_role} • {item.state_city}
          </Text>
        </View>
      </View>
      
      <Ionicons name="chevron-forward" size={18} color="#3282B8" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-bg-dark">
      {/* Header */}
      <View className="px-5 pt-4 pb-2 border-b border-[#3282B820]">
        <Text className="text-text-light text-2xl font-bold">💬 Sohbetler</Text>
        <Text className="text-text-light opacity-60 text-xs mt-1">
          Diğer J1 öğrencileri ile mesajlaş
        </Text>
      </View>

      {/* Kullanıcı Listesi */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3282B8" />
        </View>
      ) : (
        <FlatList
          data={users}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 20 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#3282B8" />
          }
          ListEmptyComponent={
            <View className="flex-1 py-20 items-center justify-center">
              <Ionicons name="people-outline" size={60} color="#BBE1FA30" />
              <Text className="text-text-light opacity-40 text-center mt-4">
                Sistemde mesajlaşabileceğiniz diğer{"\n"}bir kullanıcı bulunamadı.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
