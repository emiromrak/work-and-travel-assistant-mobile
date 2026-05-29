import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useUser } from '../context/UserContext';
import {
  getFriendsListAPI,
  sendFriendRequestAPI,
  getFriendRequestsAPI,
  cancelFriendRequestAPI,
  fetchUserProfileAPI,
} from '../services/api';

interface PublicUser {
  id: number;
  username: string;
  state_city?: string;
  job_role?: string;
  profile_pic?: string | null;
  start_city?: string;
}

type FriendStatus = 'none' | 'pending_sent' | 'pending_received' | 'friends' | 'self';

export default function UserPublicProfileScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useUser();

  const initialUser: PublicUser = route.params?.targetUser;

  const [targetUser, setTargetUser] = useState<PublicUser>(initialUser);
  const [profileLoading, setProfileLoading] = useState(true);
  const [friendStatus, setFriendStatus] = useState<FriendStatus>('none');
  const [statusLoading, setStatusLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Tam profili çek (start_city, state_city dahil)
  useEffect(() => {
    if (!initialUser?.id) return;
    fetchUserProfileAPI(initialUser.id)
      .then((res) => {
        if (res?.data) {
          setTargetUser((prev) => ({ ...prev, ...res.data }));
        }
      })
      .catch(() => {})
      .finally(() => setProfileLoading(false));
  }, [initialUser?.id]);

  // Arkadaşlık durumunu kontrol et
  useEffect(() => {
    if (!user || !initialUser) return;
    if (user.id === initialUser.id) {
      setFriendStatus('self');
      setStatusLoading(false);
      return;
    }
    checkFriendStatus();
  }, [user, initialUser]);

  const checkFriendStatus = async () => {
    if (!user || !initialUser) return;
    setStatusLoading(true);
    try {
      const [friendsRes, myRequestsRes] = await Promise.all([
        getFriendsListAPI(user.id),
        getFriendRequestsAPI(user.id),
      ]);

      const friends: any[] = friendsRes?.data || [];
      if (friends.some((f: any) => f.friend?.id === initialUser.id)) {
        setFriendStatus('friends');
        return;
      }

      // Bana gelen bekleyen istek
      const incoming: any[] = myRequestsRes?.data || [];
      if (incoming.some((r: any) => r.requester?.id === initialUser.id)) {
        setFriendStatus('pending_received');
        return;
      }

      // Benim gönderdiğim bekleyen istek (hedef kullanıcının gelen isteklerini kontrol et)
      const targetRequestsRes = await getFriendRequestsAPI(initialUser.id);
      const targetIncoming: any[] = targetRequestsRes?.data || [];
      if (targetIncoming.some((r: any) => r.requester?.id === user.id)) {
        setFriendStatus('pending_sent');
        return;
      }

      setFriendStatus('none');
    } catch {
      setFriendStatus('none');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleSendRequest = async () => {
    if (!user || !targetUser) return;
    setActionLoading(true);
    try {
      await sendFriendRequestAPI(user.id, targetUser.id);
      setFriendStatus('pending_sent');
    } catch (e: any) {
      Alert.alert('Hata', e.message || 'İstek gönderilemedi.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!user || !targetUser) return;
    Alert.alert(
      'İsteği Geri Çek',
      `${targetUser.username} adlı kullanıcıya gönderilen istek iptal edilsin mi?`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Geri Çek',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              await cancelFriendRequestAPI(user.id, targetUser.id);
              setFriendStatus('none');
            } catch (e: any) {
              Alert.alert('Hata', e.message || 'İstek geri çekilemedi.');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderFriendButton = () => {
    if (statusLoading) {
      return (
        <View style={[btnBase, { backgroundColor: '#0F3460', borderColor: '#3282B820' }]}>
          <ActivityIndicator color="#BBE1FA" size="small" />
        </View>
      );
    }

    switch (friendStatus) {
      case 'self':
        return null;

      case 'friends':
        return (
          <View style={[btnBase, { backgroundColor: '#14532d', borderColor: '#4ade8050' }]}>
            <Ionicons name="checkmark-circle" size={19} color="#4ade80" />
            <Text style={{ color: '#4ade80', fontWeight: '700', fontSize: 15, marginLeft: 8 }}>
              Arkadaşsınız 🤝
            </Text>
          </View>
        );

      case 'pending_sent':
        return (
          <TouchableOpacity
            onPress={handleCancelRequest}
            disabled={actionLoading}
            style={[btnBase, { backgroundColor: '#1e293b', borderColor: '#64748b50' }]}
          >
            {actionLoading ? (
              <ActivityIndicator color="#94a3b8" size="small" />
            ) : (
              <>
                <Ionicons name="time-outline" size={19} color="#94a3b8" />
                <Text style={{ color: '#94a3b8', fontWeight: '700', fontSize: 15, marginLeft: 8 }}>
                  İstek Gönderildi
                </Text>
                <Text style={{ color: '#64748b', fontSize: 12, marginLeft: 6 }}>· Geri çek</Text>
              </>
            )}
          </TouchableOpacity>
        );

      case 'pending_received':
        return (
          <View style={[btnBase, { backgroundColor: '#0c4a6e', borderColor: '#3282B840' }]}>
            <Ionicons name="person-add-outline" size={19} color="#BBE1FA" />
            <Text style={{ color: '#BBE1FA', fontWeight: '700', fontSize: 15, marginLeft: 8 }}>
              Sana İstek Gönderdi
            </Text>
          </View>
        );

      default:
        return (
          <TouchableOpacity
            onPress={handleSendRequest}
            disabled={actionLoading}
            style={[
              btnBase,
              {
                backgroundColor: '#3282B8',
                borderColor: '#3282B8',
                shadowColor: '#3282B8',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.35,
                shadowRadius: 10,
                elevation: 6,
              },
            ]}
          >
            {actionLoading ? (
              <ActivityIndicator color="#BBE1FA" size="small" />
            ) : (
              <>
                <Ionicons name="person-add-outline" size={19} color="#BBE1FA" />
                <Text style={{ color: '#BBE1FA', fontWeight: '700', fontSize: 15, marginLeft: 8 }}>
                  Arkadaşlık İsteği Gönder
                </Text>
              </>
            )}
          </TouchableOpacity>
        );
    }
  };

  if (!targetUser) return null;

  const hasJourney = targetUser.start_city && targetUser.state_city;

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
          borderBottomColor: '#3282B815',
          backgroundColor: '#0B3A5C',
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 16 }}>
          <Ionicons name="arrow-back" size={24} color="#BBE1FA" />
        </TouchableOpacity>
        <Text style={{ color: '#BBE1FA', fontSize: 19, fontWeight: '900', flex: 1 }}>
          {targetUser.username}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24 }}>
        {/* Avatar */}
        <View style={{ alignItems: 'center', marginBottom: 28 }}>
          {targetUser.profile_pic ? (
            <Image
              source={{ uri: targetUser.profile_pic }}
              style={{
                width: 110,
                height: 110,
                borderRadius: 55,
                borderWidth: 3,
                borderColor: '#3282B8',
              }}
            />
          ) : (
            <View
              style={{
                width: 110,
                height: 110,
                borderRadius: 55,
                backgroundColor: '#0F4C75',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 3,
                borderColor: '#3282B8',
              }}
            >
              <Ionicons name="person" size={50} color="#BBE1FA40" />
            </View>
          )}
          <Text style={{ color: '#BBE1FA', fontSize: 22, fontWeight: '900', marginTop: 14 }}>
            {targetUser.username}
          </Text>
          <Text style={{ color: '#BBE1FA', opacity: 0.4, fontSize: 13, marginTop: 4 }}>
            J1 Student
          </Text>
        </View>

        {/* Yolculuk: Nereden → Nereye */}
        {profileLoading ? (
          <View style={[card, { alignItems: 'center', paddingVertical: 24 }]}>
            <ActivityIndicator color="#3282B8" />
          </View>
        ) : hasJourney ? (
          <View style={[card, { marginBottom: 16 }]}>
            <Text
              style={{
                color: '#BBE1FA',
                opacity: 0.45,
                fontSize: 11,
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: 1,
                marginBottom: 14,
              }}
            >
              ✈️ Yolculuk
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              {/* Kalkış */}
              <View style={{ flex: 1, alignItems: 'center' }}>
                <View style={iconCircle}>
                  <Ionicons name="home-outline" size={18} color="#3282B8" />
                </View>
                <Text
                  style={{
                    color: '#BBE1FA',
                    fontSize: 13,
                    fontWeight: '700',
                    marginTop: 8,
                    textAlign: 'center',
                  }}
                  numberOfLines={2}
                >
                  {targetUser.start_city}
                </Text>
              </View>

              {/* Ok */}
              <View style={{ alignItems: 'center', paddingHorizontal: 8 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <View style={{ width: 24, height: 1, backgroundColor: '#3282B860' }} />
                  <Ionicons name="airplane" size={18} color="#3282B8" />
                  <View style={{ width: 24, height: 1, backgroundColor: '#3282B860' }} />
                </View>
              </View>

              {/* Varış */}
              <View style={{ flex: 1, alignItems: 'center' }}>
                <View style={[iconCircle, { backgroundColor: '#3282B820' }]}>
                  <Ionicons name="location-outline" size={18} color="#4ade80" />
                </View>
                <Text
                  style={{
                    color: '#BBE1FA',
                    fontSize: 13,
                    fontWeight: '700',
                    marginTop: 8,
                    textAlign: 'center',
                  }}
                  numberOfLines={2}
                >
                  {targetUser.state_city}
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        {/* Bilgi Kartı */}
        <View style={[card, { gap: 16, marginBottom: 24 }]}>
          {targetUser.job_role ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={iconCircle}>
                <Ionicons name="briefcase-outline" size={18} color="#3282B8" />
              </View>
              <View>
                <Text style={labelStyle}>Pozisyon</Text>
                <Text style={valueStyle}>{targetUser.job_role}</Text>
              </View>
            </View>
          ) : null}

          {targetUser.state_city ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={iconCircle}>
                <Ionicons name="location-outline" size={18} color="#3282B8" />
              </View>
              <View>
                <Text style={labelStyle}>Çalışma Şehri</Text>
                <Text style={valueStyle}>{targetUser.state_city}</Text>
              </View>
            </View>
          ) : null}
        </View>

        {/* Arkadaşlık Butonu */}
        {renderFriendButton()}
      </ScrollView>
    </SafeAreaView>
  );
}

const btnBase: any = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 18,
  paddingVertical: 16,
  borderWidth: 1,
};

const card: any = {
  backgroundColor: '#0F3460',
  borderRadius: 22,
  padding: 20,
  borderWidth: 1,
  borderColor: '#3282B820',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.2,
  shadowRadius: 8,
  elevation: 4,
};

const iconCircle: any = {
  width: 38,
  height: 38,
  borderRadius: 19,
  backgroundColor: '#0F4C75',
  alignItems: 'center',
  justifyContent: 'center',
};

const labelStyle: any = {
  color: '#BBE1FA',
  opacity: 0.45,
  fontSize: 11,
  fontWeight: '700',
  textTransform: 'uppercase',
  letterSpacing: 0.8,
};

const valueStyle: any = {
  color: '#BBE1FA',
  fontSize: 15,
  fontWeight: '600',
  marginTop: 2,
};
