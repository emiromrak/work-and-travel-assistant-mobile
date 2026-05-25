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
      style={{
        backgroundColor: '#0F3460',
        borderWidth: 1,
        borderColor: '#3282B820',
        borderRadius: 24,
        padding: 18,
        marginBottom: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 5,
      }}
    >
      <View className="flex-row items-center flex-1 pr-3">
        <View style={{ position: 'relative' }}>
          {item.profile_pic ? (
            <Image
              source={{ uri: item.profile_pic }}
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                borderWidth: 2,
                borderColor: '#3282B8',
              }}
            />
          ) : (
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: '#152238',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: '#3282B8',
              }}
            >
              <Ionicons name="person" size={24} color="#BBE1FA" />
            </View>
          )}
          {/* Online status indicator */}
          <View
            style={{
              position: 'absolute',
              bottom: 2,
              right: 2,
              width: 14,
              height: 14,
              borderRadius: 7,
              backgroundColor: '#4ade80',
              borderWidth: 2,
              borderColor: '#0F3460',
            }}
          />
        </View>
        
        <View className="ml-4 flex-1">
          <Text style={{ color: '#BBE1FA', fontWeight: '900', fontSize: 16, letterSpacing: 0.3 }}>
            {item.username}
          </Text>
          <Text style={{ color: '#BBE1FA', opacity: 0.5, fontSize: 12, marginTop: 4, fontWeight: '600' }} numberOfLines={1}>
            {item.job_role} • {item.state_city}
          </Text>
        </View>
      </View>
      
      <View 
        style={{ 
          backgroundColor: '#3282B815', 
          width: 36, 
          height: 36, 
          borderRadius: 18, 
          alignItems: 'center', 
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: '#3282B830'
        }}
      >
        <Ionicons name="chevron-forward" size={18} color="#3282B8" style={{ marginLeft: 2 }} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-bg-dark">
      {/* Header */}
      <View className="px-6 pt-6 pb-4">
        <Text style={{ color: '#BBE1FA', fontSize: 28, fontWeight: '900', letterSpacing: 0.5 }}>💬 Mesajlar</Text>
        <Text style={{ color: '#BBE1FA', opacity: 0.4, fontSize: 13, marginTop: 4, letterSpacing: 0.3, fontWeight: '600' }}>
          Diğer J1 öğrencileri ile bağlantıda kal
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
              <Ionicons name="people-outline" size={60} color="#BBE1FA20" />
              <Text className="text-text-light opacity-30 text-center mt-4 text-sm">
                Sistemde mesajlaşabileceğiniz diğer{"\n"}bir kullanıcı bulunamadı.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
