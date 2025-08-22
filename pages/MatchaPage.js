// MatchaPage.js
import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Dimensions, Image, TouchableOpacity} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SwipeableCard from '../components/SwipeableCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useMatchType } from '../contexts/MatchTypeContext'; // <-- ⭐ ADD THIS
import BackCard from '../components/BackCard'; // <-- ⭐ ADD THIS
import InAppCreateProfile from './InAppCreateProfile'; // adjust path if needed


const { width, height } = Dimensions.get('window');

const matchModeMap = {
  Date: 1,
  Casual: 2,
  Sport: 3,
  Business: 4,
  Study: 5,
};

const MatchaPage = () => {
  const { activeSelection } = useMatchType(); // <-- ⭐ Use the current selection!
  const [matches, setMatches] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const [matchReason, setMatchReason] = useState(null);
  const [loadingReason, setLoadingReason] = useState(false);
  const [showReasonBox, setShowReasonBox] = useState(false);
  const [showCreatePrompt, setShowCreatePrompt] = useState(false);


  const fetchMatchReason = async () => {
    if (matchReason) {
      setShowReasonBox((prev) => !prev);
      return;
    }
  
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const res = await fetch(`https://api.matchaapp.net/api/Match/GetPotentialMatchReason?potentialMatchId=${matches[currentIndex].potentialMatchId}`, {
        method: 'GET',
        headers: {
          Accept: 'text/plain',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.response?.reason) {
        setMatchReason(data.response.reason);
      } else {
        setMatchReason('Could not find a reason.');
      }
      setShowReasonBox(true);
    } catch (err) {
      console.error('❌ Error fetching match reason:', err);
      setMatchReason('Failed to fetch reason.');
      setShowReasonBox(true);
    }
  };
  
  
  
  useEffect(() => {
    fetchMatches();
  }, [activeSelection]); // <-- ⭐ Listen to activeSelection changes!

  const fetchMatches = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const headers = { Authorization: `Bearer ${token}` };
      const activeMode = matchModeMap[activeSelection] || 1;
  
      console.log('🔵 Fetching matches for mode:', activeSelection, `(mode ${activeMode})`);
  
      // 1️⃣ Check if user has a profile for this mode
      const findRes = await fetch(`https://api.matchaapp.net/api/Match/FindPotentialMatchesForModes?mode=${activeMode}`, { headers });
      const findData = await findRes.json();
      console.log('🔎 findData:', JSON.stringify(findData, null, 2));
  
      if (findData.response !== true) {
        // --- Begin new logic for distinguishing no profile vs no matches ---
        const profileStateRes = await fetch(`https://api.matchaapp.net/api/Profile/GetLoggedInUserProfileState`, { headers });
        const profileStateData = await profileStateRes.json();
        const state = profileStateData.response || {};

        const profileCreatedFields = {
          Date: 'isDatingProfileCreated',
          Casual: 'isCasualProfileCreated',
          Sport: 'isSportsProfileCreated',
          Business: 'isBusinessProfileCreated',
          Study: 'isStudyProfileCreated',
        };

        const profileCreated = state[profileCreatedFields[activeSelection]];

        if (!profileCreated) {
          console.log(`⚠️ ${activeSelection} profile not created.`);
          setShowCreatePrompt(true);
        } else {
          console.log(`ℹ️ ${activeSelection} profile exists but no matches found.`);
          setShowCreatePrompt(false);
          setMatches([]);
        }

        setLoading(false);
        return;
        // --- End new logic ---
      }
      setShowCreatePrompt(false); // ✅ important

      // 2️⃣ Fetch actual matches
      const getRes = await fetch(`https://api.matchaapp.net/api/Match/GetPotentialMatchesForModes?mode=${activeMode}`, { headers });
      const getData = await getRes.json();
  
      console.log('🟢 Matches found:', getData.response?.length || 0);
      setMatches(getData.response || []);
      setCurrentIndex(0);
      setLoading(false);
    } catch (err) {
      console.error('❌ Error fetching matches:', err);
      setLoading(false);
    }
  };
  
  const handleSwipe = async (direction) => {
    console.log(`User swiped ${direction}`);
  
    const currentMatch = matches[currentIndex];
  
    if (!currentMatch) {
      console.warn('⚠️ No match at current index.');
      setCurrentIndex((prev) => prev + 1);
      setMatchReason(null);
      setShowReasonBox(false);
      return;
    }
  
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
  
      const userLiked = direction === 'right'; // right = liked (true), left = disliked (false)
      
      console.log(`📤 Sending AnswerPotentialMatch. ProfileId=${currentMatch.profileId} UserLiked=${userLiked}`);
      
      const res = await fetch(`https://api.matchaapp.net/api/Match/AnswerPotentialMatch?ProfileId=${currentMatch.profileId}&UserLiked=${userLiked}`, {
        method: 'POST',
        headers,
      });
  
      if (!res.ok) {
        console.error('❌ Failed to answer match:', await res.text());
      } else {
        console.log('✅ AnswerPotentialMatch success.');
      }
    } catch (err) {
      console.error('❌ Error answering match:', err);
    }
    setMatchReason(null);
    setShowReasonBox(false);
    setCurrentIndex((prev) => prev + 1);
  };
  

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Loading Matches...</Text>
      </View>
    );
  }
  if (showCreatePrompt) {
    return (
      <View style={styles.centered}>
        <Text>You don’t have a {activeSelection.toLowerCase()} profile yet.</Text>
        <TouchableOpacity
          style={styles.exploreButton}
          onPress={() => navigation.navigate('InAppCreateProfile', { matchType: activeSelection })}
        >
          <Text style={styles.exploreButtonText}>Create {activeSelection} Profile</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  if (currentIndex >= matches.length) {
    return (
      <View style={styles.centered}>
        <Text>No more matches available.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
        {/* 🆕 Top Header */}
        <View style={styles.header}>
  <Text style={styles.headerTitle}>Matcha</Text>
  <TouchableOpacity onPress={fetchMatchReason}>
  <Image
    source={require('../assets/images/LogoPNG.png')}
    style={styles.headerLogo}
    resizeMode="contain"
  />
</TouchableOpacity>

</View>

      <View style={styles.cardStack}>
        {matches[currentIndex + 1] && (
          <BackCard user={matches[currentIndex + 1]} />
        )}
        {matches[currentIndex] && (
          <SwipeableCard 
          user={matches[currentIndex]} 
          onSwipe={handleSwipe} 
          showReasonBox={showReasonBox}
          matchReason={matchReason}
          closeReasonBox={() => setShowReasonBox(false)}
        />
        
        )}
      </View>
    </SafeAreaView>
  );
  
  
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#fff', // Same as background
    zIndex: 0, // make sure header is over cards
    
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000',
  },
  reasonBox: {
    position: 'absolute',
    top: 70,
    right: 20,
    backgroundColor: '#D0E9FF',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#78C2F5',
    maxWidth: 220,
    zIndex: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 2, height: 2 },
  },
  reasonText: {
    fontSize: 14,
    color: '#1A4D8F',
    fontWeight: '600',
  },
  exploreButton: {
    backgroundColor: '#BCD74F',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
  },
  exploreButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  
  headerLogo: {
    width: 35,
    height: 35,
  },
  cardStack: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});


export default MatchaPage;
