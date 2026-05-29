import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import {
  getFriendsListAPI,
  searchUsersAPI,
  sendFriendRequestAPI,
  getFriendRequestsAPI,
  respondFriendRequestAPI,
} from '../services/api';
import { useUser } from '../context/UserContext';

interface Friend {
  friendship_id: number;
  friend: {
    id: number;
    username: string;
    state_city: string;
    job_role: string;
    profile_pic: string | null;
    start_city?: string;
  };
}

interface FriendRequest {
  friendship_id: number;
  created_at: string;
  requester: {
    id: number;
    username: string;
    profile_pic: string | null;
    state_city: string;
    job_role: string;
  };
}

interface SearchUser {
  id: number;
  username: string;
  state_city: string;
  job_role: string;
  profile_pic: string | null;
}

export default function ChatListScreen() {
  const { user } = useUser();
  const navigation = useNavigation<any>();

  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Arkadaş Ekleme Modali
  const [searchModal, setSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [sendingTo, setSendingTo] = useState<number | null>(null);
  const [sentTo, setSentTo] = useState<Set<number>>(new Set());

  // Bekleyen İstekler Modalı
  const [requestsModal, setRequestsModal] = useState(false);
  const [respondingTo, setRespondingTo] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const [friendsRes, requestsRes] = await Promise.all([
        getFriendsListAPI(user.id),
        getFriendRequestsAPI(user.id),
      ]);
      setFriends(friendsRes?.data || []);
      setFriendRequests(requestsRes?.data || []);
    } catch (e) {
      console.error('Veri yüklenemedi:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Kullanıcı Arama
  useEffect(() => {
    if (!searchModal) return;
    const timer = setTimeout(async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      setSearching(true);
      const results = await searchUsersAPI(searchQuery, user?.id);
      setSearchResults(results);
      setSearching(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, searchModal]);

  const handleSendRequest = async (targetId: number) => {
    if (!user) return;
    setSendingTo(targetId);
    try {
      await sendFriendRequestAPI(user.id, targetId);
      setSentTo(prev => new Set(prev).add(targetId));
      Alert.alert('İstek Gönderildi 🎉', 'Arkadaşlık isteği iletildi!');
    } catch (e: any) {
      Alert.alert('Hata', e.message || 'İstek gönderilemedi.');
    } finally {
      setSendingTo(null);
    }
  };

  const handleRespond = async (friendshipId: number, action: 'accepted' | 'rejected') => {
    if (!user) return;
    setRespondingTo(friendshipId);
    try {
      await respondFriendRequestAPI(user.id, friendshipId, action);
      setFriendRequests(prev => prev.filter(r => r.friendship_id !== friendshipId));
      if (action === 'accepted') {
        loadData(); // Arkadaş listesini yenile
        Alert.alert('Harika! 🎉', 'Artık arkadaşsınız!');
      }
    } catch (e: any) {
      Alert.alert('Hata', e.message || 'İşlem gerçekleştirilemedi.');
    } finally {
      setRespondingTo(null);
    }
  };

  const renderFriendItem = ({ item }: { item: Friend }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ChatDetail', { receiver: item.friend })}
      style={{
        backgroundColor: '#0F3460',
        borderWidth: 1,
        borderColor: '#3282B820',
        borderRadius: 24,
        padding: 18,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 12 }}>
        <View style={{ position: 'relative' }}>
          {item.friend.profile_pic ? (
            <Image
              source={{ uri: item.friend.profile_pic }}
              style={{ width: 54, height: 54, borderRadius: 27, borderWidth: 2, borderColor: '#3282B8' }}
            />
          ) : (
            <View
              style={{
                width: 54,
                height: 54,
                borderRadius: 27,
                backgroundColor: '#152238',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: '#3282B8',
              }}
            >
              <Ionicons name="person" size={22} color="#BBE1FA" />
            </View>
          )}
          {/* Online dot */}
          <View
            style={{
              position: 'absolute',
              bottom: 2,
              right: 2,
              width: 13,
              height: 13,
              borderRadius: 6.5,
              backgroundColor: '#4ade80',
              borderWidth: 2,
              borderColor: '#0F3460',
            }}
          />
        </View>
        <View style={{ marginLeft: 14, flex: 1 }}>
          <Text style={{ color: '#BBE1FA', fontWeight: '900', fontSize: 16, letterSpacing: 0.3 }}>
            {item.friend.username}
          </Text>
          <Text style={{ color: '#BBE1FA', opacity: 0.5, fontSize: 12, marginTop: 3, fontWeight: '600' }} numberOfLines={1}>
            {item.friend.job_role} • {item.friend.state_city}
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
          borderColor: '#3282B830',
        }}
      >
        <Ionicons name="chevron-forward" size={18} color="#3282B8" style={{ marginLeft: 2 }} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1B262C' }}>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottomWidth: 1,
          borderBottomColor: '#3282B815',
        }}
      >
        <View>
          <Text style={{ color: '#BBE1FA', fontSize: 26, fontWeight: '900', letterSpacing: 0.5 }}>
            💬 Mesajlar
          </Text>
          <Text style={{ color: '#BBE1FA', opacity: 0.4, fontSize: 12, marginTop: 4, fontWeight: '600' }}>
            Arkadaşlarınla bağlantıda kal
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          {/* Bekleyen İstekler Butonu */}
          {friendRequests.length > 0 && (
            <TouchableOpacity
              onPress={() => setRequestsModal(true)}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: '#0F3460',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: '#f59e0b40',
                position: 'relative',
              }}
            >
              <Ionicons name="notifications-outline" size={20} color="#f59e0b" />
              <View
                style={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  backgroundColor: '#f59e0b',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: '#1B262C', fontSize: 10, fontWeight: '900' }}>
                  {friendRequests.length}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Arkadaş Ekle Butonu */}
          <TouchableOpacity
            onPress={() => {
              setSearchQuery('');
              setSearchResults([]);
              setSentTo(new Set());
              setSearchModal(true);
            }}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: '#3282B8',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#3282B8',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.35,
              shadowRadius: 10,
              elevation: 6,
            }}
          >
            <Ionicons name="person-add-outline" size={20} color="#BBE1FA" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Arkadaş Listesi */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#3282B8" />
        </View>
      ) : (
        <FlatList
          data={friends}
          renderItem={renderFriendItem}
          keyExtractor={(item) => item.friendship_id.toString()}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#3282B8" />
          }
          ListEmptyComponent={
            <View style={{ flex: 1, paddingVertical: 80, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="people-outline" size={64} color="#BBE1FA20" />
              <Text style={{ color: '#BBE1FA', opacity: 0.3, textAlign: 'center', marginTop: 16, fontSize: 14, lineHeight: 22 }}>
                Henüz arkadaşın yok.{'\n'}Sağ üstteki + butonuyla{'\n'}arkadaş ekleyebilirsin!
              </Text>
            </View>
          }
        />
      )}

      {/* ── Arkadaş Arama Modali ─────────────────────────────────────────────── */}
      <Modal
        visible={searchModal}
        animationType="slide"
        transparent
        onRequestClose={() => setSearchModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: '#000000AA',
            justifyContent: 'flex-end',
          }}
        >
          <View
            style={{
              backgroundColor: '#1B262C',
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              paddingTop: 20,
              paddingHorizontal: 20,
              paddingBottom: 40,
              maxHeight: '80%',
            }}
          >
            {/* Modal Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ color: '#BBE1FA', fontSize: 18, fontWeight: '900', flex: 1 }}>
                👤 Arkadaş Ekle
              </Text>
              <TouchableOpacity onPress={() => setSearchModal(false)}>
                <Ionicons name="close-circle" size={28} color="#BBE1FA40" />
              </TouchableOpacity>
            </View>

            {/* Arama Kutusu */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#0F3460',
                borderRadius: 16,
                paddingHorizontal: 14,
                paddingVertical: 12,
                borderWidth: 1,
                borderColor: '#3282B830',
                marginBottom: 16,
              }}
            >
              <Ionicons name="search-outline" size={18} color="#BBE1FA50" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Kullanıcı adı ile ara..."
                placeholderTextColor="#BBE1FA30"
                style={{ flex: 1, color: '#BBE1FA', fontSize: 15, marginLeft: 10 }}
                autoFocus
              />
              {searching && <ActivityIndicator size="small" color="#3282B8" />}
            </View>

            {/* Arama Sonuçları */}
            <ScrollView showsVerticalScrollIndicator={false}>
              {searchResults.length === 0 && searchQuery.length >= 2 && !searching ? (
                <View style={{ alignItems: 'center', paddingVertical: 30 }}>
                  <Ionicons name="search-outline" size={40} color="#BBE1FA20" />
                  <Text style={{ color: '#BBE1FA', opacity: 0.3, marginTop: 10, fontSize: 13 }}>
                    Kullanıcı bulunamadı
                  </Text>
                </View>
              ) : (
                searchResults.map((u) => {
                  const alreadyFriend = friends.some(f => f.friend.id === u.id);
                  const sent = sentTo.has(u.id);
                  return (
                    <View
                      key={u.id}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: '#0F3460',
                        borderRadius: 18,
                        padding: 14,
                        marginBottom: 10,
                        borderWidth: 1,
                        borderColor: '#3282B820',
                      }}
                    >
                      {u.profile_pic ? (
                        <Image
                          source={{ uri: u.profile_pic }}
                          style={{ width: 46, height: 46, borderRadius: 23, borderWidth: 2, borderColor: '#3282B8' }}
                        />
                      ) : (
                        <View
                          style={{
                            width: 46,
                            height: 46,
                            borderRadius: 23,
                            backgroundColor: '#152238',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: 2,
                            borderColor: '#3282B8',
                          }}
                        >
                          <Ionicons name="person" size={20} color="#BBE1FA" />
                        </View>
                      )}
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={{ color: '#BBE1FA', fontWeight: '800', fontSize: 15 }}>{u.username}</Text>
                        <Text style={{ color: '#BBE1FA', opacity: 0.45, fontSize: 12, marginTop: 2 }}>
                          {u.job_role} • {u.state_city}
                        </Text>
                      </View>
                      {alreadyFriend ? (
                        <View
                          style={{
                            paddingHorizontal: 12,
                            paddingVertical: 7,
                            borderRadius: 12,
                            backgroundColor: '#14532d30',
                            borderWidth: 1,
                            borderColor: '#4ade8040',
                          }}
                        >
                          <Text style={{ color: '#4ade80', fontSize: 12, fontWeight: '700' }}>Arkadaş ✓</Text>
                        </View>
                      ) : sent ? (
                        <View
                          style={{
                            paddingHorizontal: 12,
                            paddingVertical: 7,
                            borderRadius: 12,
                            backgroundColor: '#1e293b',
                            borderWidth: 1,
                            borderColor: '#64748b40',
                          }}
                        >
                          <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '700' }}>Gönderildi</Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          onPress={() => handleSendRequest(u.id)}
                          disabled={sendingTo === u.id}
                          style={{
                            paddingHorizontal: 14,
                            paddingVertical: 8,
                            borderRadius: 12,
                            backgroundColor: '#3282B8',
                            shadowColor: '#3282B8',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.3,
                            shadowRadius: 5,
                            elevation: 3,
                          }}
                        >
                          {sendingTo === u.id ? (
                            <ActivityIndicator size="small" color="#BBE1FA" />
                          ) : (
                            <Text style={{ color: '#BBE1FA', fontSize: 12, fontWeight: '800' }}>+ Ekle</Text>
                          )}
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Bekleyen İstekler Modali ─────────────────────────────────────────── */}
      <Modal
        visible={requestsModal}
        animationType="slide"
        transparent
        onRequestClose={() => setRequestsModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: '#000000AA',
            justifyContent: 'flex-end',
          }}
        >
          <View
            style={{
              backgroundColor: '#1B262C',
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              paddingTop: 20,
              paddingHorizontal: 20,
              paddingBottom: 40,
              maxHeight: '70%',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ color: '#BBE1FA', fontSize: 18, fontWeight: '900', flex: 1 }}>
                🔔 Arkadaşlık İstekleri
              </Text>
              <TouchableOpacity onPress={() => setRequestsModal(false)}>
                <Ionicons name="close-circle" size={28} color="#BBE1FA40" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {friendRequests.map((req) => (
                <View
                  key={req.friendship_id}
                  style={{
                    backgroundColor: '#0F3460',
                    borderRadius: 18,
                    padding: 16,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: '#f59e0b20',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
                    {req.requester.profile_pic ? (
                      <Image
                        source={{ uri: req.requester.profile_pic }}
                        style={{ width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: '#f59e0b' }}
                      />
                    ) : (
                      <View
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 24,
                          backgroundColor: '#152238',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderWidth: 2,
                          borderColor: '#f59e0b',
                        }}
                      >
                        <Ionicons name="person" size={22} color="#BBE1FA" />
                      </View>
                    )}
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text style={{ color: '#BBE1FA', fontWeight: '800', fontSize: 15 }}>
                        {req.requester.username}
                      </Text>
                      <Text style={{ color: '#BBE1FA', opacity: 0.45, fontSize: 12, marginTop: 2 }}>
                        {req.requester.job_role} • {req.requester.state_city}
                      </Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity
                      onPress={() => handleRespond(req.friendship_id, 'accepted')}
                      disabled={respondingTo === req.friendship_id}
                      style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#14532d',
                        borderRadius: 14,
                        paddingVertical: 12,
                        borderWidth: 1,
                        borderColor: '#4ade8040',
                      }}
                    >
                      {respondingTo === req.friendship_id ? (
                        <ActivityIndicator size="small" color="#4ade80" />
                      ) : (
                        <Text style={{ color: '#4ade80', fontWeight: '800', fontSize: 14 }}>✓ Kabul Et</Text>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleRespond(req.friendship_id, 'rejected')}
                      disabled={respondingTo === req.friendship_id}
                      style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#3B1F1F',
                        borderRadius: 14,
                        paddingVertical: 12,
                        borderWidth: 1,
                        borderColor: '#f8717120',
                      }}
                    >
                      <Text style={{ color: '#f87171', fontWeight: '800', fontSize: 14 }}>✗ Reddet</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {friendRequests.length === 0 && (
                <View style={{ alignItems: 'center', paddingVertical: 30 }}>
                  <Ionicons name="checkmark-circle-outline" size={48} color="#BBE1FA20" />
                  <Text style={{ color: '#BBE1FA', opacity: 0.3, marginTop: 12, fontSize: 13 }}>
                    Bekleyen istek yok
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
