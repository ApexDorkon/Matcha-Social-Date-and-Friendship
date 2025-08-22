// ChatPage.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Swipeable } from 'react-native-gesture-handler';

const modeNames = {
  1: 'Date',
  2: 'Casual',
  3: 'Sport',
  4: 'Business',
  5: 'Study',
};

const ChatPage = () => {
  const [matches, setMatches] = useState([]);
  const [activeMode, setActiveMode] = useState(1);
  const navigation = useNavigation();

  useEffect(() => {
    const interval = setInterval(fetchMatches, 1500); // fetch every 5 seconds
    return () => clearInterval(interval);
  }, [activeMode]);
  const fetchMatches = async () => {
    const token = await AsyncStorage.getItem('accessToken');
    const res = await fetch('https://api.matchaapp.net/api/Match/GetMatchesForChat', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'text/plain',
      },
    });
    const data = await res.json();
    const filtered = (data.response || [])
      .filter(item => item.matchModeType === activeMode)
      .sort((a, b) => {
        const timeA = new Date(a.lastMessage?.timeStamp || 0).getTime();
        const timeB = new Date(b.lastMessage?.timeStamp || 0).getTime();
        return timeB - timeA;
      });
    setMatches(filtered);
  };

  // Remove match handler
  const removeMatch = async (profileId) => {
    console.log("🗑 Removing match with profileId:", profileId);
    const token = await AsyncStorage.getItem('accessToken');
    try {
      const res = await fetch(`https://api.matchaapp.net/api/Match/RemoveMatch?otherProfileId=${profileId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'text/plain',
        },
      });
      console.log("🧾 API request URL:", `https://api.matchaapp.net/api/Match/RemoveMatch?otherProfileId=${profileId}`);
      const json = await res.json();
      console.log("🧾 API Response JSON:", json);

      if (res.ok && json.response === true) {
        console.log("✅ Match removed successfully.");
        setMatches(prev => prev.filter(item => item.profileId !== profileId));
      } else {
        console.warn("❗ Unexpected response while removing match:", json);
      }

    } catch (err) {
      console.error("Failed to remove match:", err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={{ padding: 15 }} contentContainerStyle={{ paddingBottom: 80 }}>
        <Text style={styles.header}>Chats</Text>
        <View style={styles.modeSelector}>
          {Object.entries(modeNames).map(([key, label]) => (
            <TouchableOpacity key={key} onPress={() => setActiveMode(Number(key))}>
              <Text style={[styles.modeLabel, activeMode === Number(key) && styles.activeMode]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {matches.map((item) => (
          <Swipeable
            key={item.profileId}
            renderRightActions={() => (
              <TouchableOpacity
                onPress={() => removeMatch(item.profileId)}
                style={{
                  backgroundColor: 'red',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: 100,
                  marginVertical: 10,
                  borderRadius: 10,
                }}
              >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Remove</Text>
              </TouchableOpacity>
            )}
          >
            <TouchableOpacity
              style={styles.userBar}
              onPress={async () => {
                const token = await AsyncStorage.getItem('accessToken');
                const matchType = modeNames[activeMode].toLowerCase();

                const res = await fetch('https://api.matchaapp.net/api/Profile/GetLoggedInUserProfileState', {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                  },
                });

                const profileState = await res.json();
                const profileData = profileState?.response;

                const profileIdMap = {
                  date: profileData?.datingProfileId,
                  casual: profileData?.casualProfileId,
                  sport: profileData?.sportsProfileId,
                  business: profileData?.businessProfileId,
                  study: profileData?.studyProfileId,
                };

                const senderProfileId = profileIdMap[matchType];

                if (!senderProfileId) {
                  console.warn("❌ Could not resolve senderProfileId from profile state. Debug:", { profileData, matchType });
                  return;
                }

                await AsyncStorage.setItem('activeMatchType', matchType);

                navigation.navigate('UserChatPage', {
                  matchId: item.matchId,
                  receiverProfileId: item.profileId,
                  senderProfileId,
                  matchType,
                  user: {
                    fullName: item.fullName,
                    profilePicture: item.profilePicture,
                  }
                });
              }}
            >
              <Image source={{ uri: item.profilePicture }} style={styles.avatar} />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={styles.name}>{item.fullName}</Text>
                  <Text style={{ fontSize: 12, color: '#888' }}>
                    {item.lastMessage?.timeStamp ? new Date(item.lastMessage.timeStamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.message} numberOfLines={1}>
                    {item.lastMessage
                      ? item.lastMessage.senderProfileId === item.profileId
                        ? item.lastMessage.type === 2
                          ? '📷 Image'
                          : item.lastMessage.type === 4
                          ? '🎵 Audio'
                          : item.lastMessage.type === 5
                          ? '📎 File'
                          : item.lastMessage.content
                        : item.lastMessage.type === 2
                        ? 'You: 📷 Image'
                        : item.lastMessage.type === 4
                        ? 'You: 🎵 Audio'
                        : item.lastMessage.type === 5
                        ? 'You: 📎 File'
                        : `You: ${item.lastMessage.content}`
                      : 'No messages yet'}
                  </Text>
                  {item.lastMessage?.senderProfileId !== item.profileId && (
                    <Text style={{ fontSize: 10, color: item.lastMessage?.isRead ? '#1E90FF' : '#000' }}>
                      ✔✔
                    </Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          </Swipeable>
        ))}
        {matches.length === 0 && (
          <View style={{ alignItems: 'center', marginTop: 40, paddingHorizontal: 20 }}>
            <Text style={{ fontSize: 16, textAlign: 'center', marginBottom: 20, color: '#666' }}>
              You don’t have any Match. Let’s explore more!
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: '#BCD74F',
                paddingHorizontal: 25,
                paddingVertical: 12,
                borderRadius: 10,
              }}
              onPress={() => navigation.navigate('MatchaPage')}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#000' }}>Go to Matcha</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  userBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    marginBottom: 10,
  },
  avatar: { width: 65, height: 65, borderRadius: 32.5, marginRight: 12 },
  name: { fontSize: 16, fontWeight: 'bold' },
  message: { fontSize: 14, color: '#555', marginTop: 2, fontWeight: '400' },
  modeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  modeLabel: {
    fontSize: 16,
    color: '#AAA',
    fontWeight: '500',
  },
  activeMode: {
    fontSize: 20,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});

export default ChatPage;
