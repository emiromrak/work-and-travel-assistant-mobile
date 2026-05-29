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
} from '../services/api';

interface PublicUser {
  id: number;
  username: string;
  state_city?: string;
  job_role?: string;
  profile_pic?: string | null;
}

type FriendStatus = 'none' | 'pending_sent' | 'pending_received' | 'friends' | 'self';

export default function UserPublicProfileScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useUser();

  const targetUser: PublicUser = route.params?.targetUser;

  const [friendStatus, setFriendStatus] = useState<FriendStatus>('none');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!user || !targetUser) return;
    if (user.id === targetUser.id) {
      setFriendStatus('self');
      setLoading(false);
      return;
    }
    checkFriendStatus();
  }, [user, targetUser]);

  const checkFriendStatus = async () => {
    if (!user || !targetUser) return;
    setLoading(true);
    try {
      // Arkadaş listesini kontrol et
      const friendsRes = await getFriendsListAPI(user.id);
      const friends: any[] = friendsRes?.data || [];
      const isFriend = friends.some((f: any) => f.friend?.id === targetUser.id);
      if (isFriend) {
        setFriendStatus('friends');
        setLoading(false);
        return;
      }

      // Bekleyen gelen istekleri kontrol et
      const requestsRes = await getFriendRequestsAPI(user.id);
      const pendingRequests: any[] = requestsRes?.data || [];
      const hasIncoming = pendingRequests.some(
        (r: any) => r.requester?.id === targetUser.id
      );
      if (hasIncoming) {
        setFriendStatus('pending_received');
        setLoading(false);
        return;
      }

      // Hedef kullanıcının aldığı bekleyen isteklerini kontrol et (benim gönderdiğim var mı?)
      const targetRequestsRes = await getFriendRequestsAPI(targetUser.id);
      const targetPending: any[] = targetRequestsRes?.data || [];
      const hasSent = targetPending.some(
        (r: any) => r.requester?.id === user.id
      );
      if (hasSent) {
        setFriendStatus('pending_sent');
        setLoading(false);
        return;
      }

      setFriendStatus('none');
    } catch (e) {
      setFriendStatus('none');
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async () => {
    if (!user || !targetUser) return;
    setSending(true);
    try {
      await sendFriendRequestAPI(user.id, targetUser.id);
      setFriendStatus('pending_sent');
      Alert.alert('İstek Gönderildi 🎉', `${targetUser.username} adlı kullanıcıya arkadaşlık isteği gönderildi!`);
    } catch (e: any) {
      Alert.alert('Hata', e.message || 'İstek gönderilemedi.');
    } finally {
      setSending(false);
    }
  };

  const renderFriendButton = () => {
    if (loading) {
      return (
        <View style={buttonBase}>
          <ActivityIndicator color="#BBE1FA" size="small" />
        </View>
      );
    }

    switch (friendStatus) {
      case 'self':
        return null;

      case 'friends':
        return (
          <View style={[buttonBase, { backgroundColor: '#14532d', borderColor: '#4ade80' }]}>
            <Ionicons name="checkmark-circle" size={18} color="#4ade80" />
            <Text style={{ color: '#4ade80', fontWeight: '700', fontSize: 15, marginLeft: 8 }}>
              Arkadaşsınız 🤝
            </Text>
          </View>
        );

      case 'pending_sent':
        return (
          <View style={[buttonBase, { backgroundColor: '#1e293b', borderColor: '#64748b' }]}>
            <Ionicons name="time-outline" size={18} color="#94a3b8" />
            <Text style={{ color: '#94a3b8', fontWeight: '700', fontSize: 15, marginLeft: 8 }}>
              İstek Gönderildi
            </Text>
          </View>
        );

      case 'pending_received':
        return (
          <View style={[buttonBase, { backgroundColor: '#0c4a6e', borderColor: '#3282B8' }]}>
            <Ionicons name="person-add-outline" size={18} color="#BBE1FA" />
            <Text style={{ color: '#BBE1FA', fontWeight: '700', fontSize: 15, marginLeft: 8 }}>
              Sana İstek Gönderdi
            </Text>
          </View>
        );

      default:
        return (
          <TouchableOpacity
            onPress={handleSendRequest}
            disabled={sending}
            style={[
              buttonBase,
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
            {sending ? (
              <ActivityIndicator color="#BBE1FA" size="small" />
            ) : (
              <>
                <Ionicons name="person-add-outline" size={18} color="#BBE1FA" />
                <Text style={{ color: '#BBE1FA', fontWeight: '700', fontSize: 15, marginLeft: 8 }}>
                  Arkadaşlık İsteği Gönder
                </Text>
              </>
            )}
          </TouchableOpacity>
        );
    }
  };

  if (!targetUser) {
    return null;
  }

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
          <Text style={{ color: '#BBE1FA', opacity: 0.45, fontSize: 13, marginTop: 4 }}>
            J1 Student
          </Text>
        </View>

        {/* Bilgi Kartı */}
        <View
          style={{
            backgroundColor: '#0F3460',
            borderRadius: 22,
            padding: 20,
            borderWidth: 1,
            borderColor: '#3282B820',
            gap: 16,
            marginBottom: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          {targetUser.job_role ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={iconCircle}>
                <Ionicons name="briefcase-outline" size={18} color="#3282B8" />
              </View>
              <View>
                <Text style={{ color: '#BBE1FA', opacity: 0.45, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  Pozisyon
                </Text>
                <Text style={{ color: '#BBE1FA', fontSize: 15, fontWeight: '600', marginTop: 2 }}>
                  {targetUser.job_role}
                </Text>
              </View>
            </View>
          ) : null}

          {targetUser.state_city ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={iconCircle}>
                <Ionicons name="location-outline" size={18} color="#3282B8" />
              </View>
              <View>
                <Text style={{ color: '#BBE1FA', opacity: 0.45, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  Şehir / Eyalet
                </Text>
                <Text style={{ color: '#BBE1FA', fontSize: 15, fontWeight: '600', marginTop: 2 }}>
                  {targetUser.state_city}
                </Text>
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

const buttonBase: any = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 18,
  paddingVertical: 16,
  borderWidth: 1,
  borderColor: 'transparent',
};

const iconCircle: any = {
  width: 38,
  height: 38,
  borderRadius: 19,
  backgroundColor: '#0F4C75',
  alignItems: 'center',
  justifyContent: 'center',
};
