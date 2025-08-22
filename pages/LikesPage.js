import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Image, Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MatchDetailCard from '../components/MatchDetailCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';



const modeNames = {
  1: 'Date',
  2: 'Casual',
  3: 'Sport',
  4: 'Business',
  5 : 'Study',
};

const LikesPage = () => {
  const [allLikes, setAllLikes] = useState([]);
  const [expandedProfile, setExpandedProfile] = useState(null); // profileId
  const [selectedMode, setSelectedMode] = useState(null);
  const [matchDetail, setMatchDetail] = useState(null);
  const [activeMode, setActiveMode] = useState(1); // 0 = Date
  const navigation = useNavigation();
  const handleSwipe = async (direction, profileId) => {
    const token = await AsyncStorage.getItem('accessToken');
    const answer = direction === 'right'; // right = true (like), left = false (dislike)
  
    try {
      const res = await fetch(
        `https://api.matchaapp.net/api/Match/AnswerUserLikes?mode=${selectedMode}&profileId=${profileId}&answer=${answer}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'text/plain',
          },
        }
      );
  
      if (!res.ok) {
        console.error(`❌ Failed to respond with ${answer ? 'like' : 'dislike'}:`, await res.text());
      } else {
        console.log(`✅ Sent ${answer ? 'like' : 'dislike'} for profile ${profileId}`);
        setExpandedProfile(null);
        fetchLikes(); // Optionally refresh the list
      }
    } catch (err) {
      console.error('❌ API error:', err);
    }
  };
  
  
  useEffect(() => {
    fetchLikes();
  }, []);

  const fetchLikes = async () => {
    const token = await AsyncStorage.getItem('accessToken');
    const res = await fetch('https://api.matchaapp.net/api/Match/GetProfilesOfWhoLikedUser', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'text/plain',
      },
    });
    const data = await res.json();
    setAllLikes(data.response || []);
  };

  const handleExpand = async (profileId, matchModeEnum) => {
    setExpandedProfile(profileId);
    setSelectedMode(matchModeEnum);

    const token = await AsyncStorage.getItem('accessToken');
    const res = await fetch(`https://api.matchaapp.net/api/Match/GetMatchProfileDetails?profileId=${profileId}&matchModeEnum=${matchModeEnum}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'text/plain',
      },
    });
    const data = await res.json();
    setMatchDetail(data.response || null);
  };

  return (
    <>
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.pageTitle}>Likes</Text>
        <View style={styles.modeSelector}>
  {Object.entries(modeNames).map(([key, label]) => (
    <TouchableOpacity key={key} onPress={() => setActiveMode(Number(key))}>
      <Text style={[styles.modeLabel, activeMode === Number(key) && styles.activeMode]}>
        {label}
      </Text>
    </TouchableOpacity>
  ))}
</View>
{groupByMode(allLikes)[activeMode]?.length > 0 ? (
  groupByMode(allLikes)[activeMode].map((user) => (
    <TouchableOpacity
      key={user.profileId}
      style={styles.userBar}
      onPress={() => handleExpand(user.profileId, user.matchModeType)}
    >
      <Image source={{ uri: user.profilePicture }} style={styles.avatar} />
      <Text style={styles.userName}>{user.fullName}</Text>
    </TouchableOpacity>
  ))
) : (
  <View style={styles.emptyBox}>
    <Text style={styles.emptyText}>
      No one seems to like you yet. Let’s explore more!
    </Text>
    <TouchableOpacity
      style={styles.exploreButton}
      onPress={() => navigation.navigate('MatchaPage')}
    >
      <Text style={styles.exploreButtonText}>Go to Matcha</Text>
    </TouchableOpacity>
  </View>
)}

        
      </ScrollView>
      </SafeAreaView>
    {/* 👇 render *after* SafeAreaView */}
    {matchDetail && expandedProfile && (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
      <MatchDetailCard
  user={matchDetail}
  onClose={() => setExpandedProfile(null)}
  onLike={() => handleSwipe('right', expandedProfile)} // <-- use `expandedProfile`, not `matchDetail.profileId`
  onDislike={() => handleSwipe('left', expandedProfile)}

/>


    </View>
  )}
</>

  
  );
};

const groupByMode = (arr) =>
  arr.reduce((acc, curr) => {
    const mode = curr.matchModeType;
    if (!acc[mode]) acc[mode] = [];
    acc[mode].push(curr);
    return acc;
  }, {});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollContainer: {
    padding: 15,
    paddingBottom: 100,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modeGroup: {
    marginVertical: 10,
  },
  modeTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 6,
    color: '#4CAF50',
  },
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
  
  userBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEE',
    padding: 10,
    borderRadius: 10,
    marginBottom: 6,
  },
  avatar: {
    width: 50, height: 50,
    borderRadius: 25, marginRight: 10,
  },
  userName: {
    fontSize: 16,
    color: '#000',
  },
  fullscreenOverlay: {
    position: 'absolute',
    top: 0, left: 0, bottom: 0, right: 0,
    zIndex: 999,
  },
  dimBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  cardWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  emptyBox: {
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  exploreButton: {
    backgroundColor: '#BCD74F',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 10,
  },
  exploreButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  
});

export default LikesPage;
