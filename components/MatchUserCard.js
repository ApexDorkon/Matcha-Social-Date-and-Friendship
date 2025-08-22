import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height } = Dimensions.get('window');

const MatchUserCard = ({ profileId, matchModeEnum }) => {
  const [profile, setProfile] = useState(null);
  const scrollRef = useRef();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!profileId || !matchModeEnum) return;
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const res = await fetch(
          `https://api.matchaapp.net/api/Match/GetMatchProfileDetails?profileId=${profileId}&matchModeEnum=${matchModeEnum}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          }
        );
        const data = await res.json();
        if (data?.response) setProfile(data.response);
      } catch (err) {
        console.error('Fetch profile failed:', err);
      }
    };

    fetchProfile();
  }, [profileId, matchModeEnum]);

  if (!profile) {
    return (
      <View style={styles.overlay}>
        <ActivityIndicator size="large" color="#DAE8A1" />
      </View>
    );
  }

  const getCity = (location) => {
    if (!location) return '';
    const parts = location.split(',').map((p) => p.trim());
    return parts.length > 1 ? parts[1] : parts[0];
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.cardContainer}>
        <View style={styles.shadowWrapper}>
          <View style={styles.card}>
            <ScrollView ref={scrollRef} contentContainerStyle={{ paddingBottom: 60 }}>
              <View style={styles.fullImageContainer}>
                <Image
                  source={{ uri: profile.photoUrls?.[0] }}
                  style={styles.fullImage}
                  resizeMode="cover"
                />
                <View style={styles.userInfoContainer}>
                  <Text style={styles.userName}>
                    {profile.fullName} {profile.age}
                  </Text>
                  <Text style={styles.userLocation}>{getCity(profile.location)}</Text>
                </View>
              </View>

              <View style={styles.detailsContainer}>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>About Me</Text>
                  <Text style={styles.sectionText}>{profile.bio}</Text>
                </View>

                <View style={styles.pillsContainer}>
                  <View style={styles.pill}><Text>{profile.pronoun}</Text></View>
                  <View style={styles.pill}><Text>{profile.gender}</Text></View>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>My Interests</Text>
                  <View style={styles.tagsContainer}>
                    {profile.interestTags?.map((tag, i) => (
                      <View key={i} style={styles.tagPill}>
                        <Text>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {profile.photoUrls?.length > 1 && profile.photoUrls.slice(1).map((photo, idx) => (
                  <Image
                    key={idx}
                    source={{ uri: photo }}
                    style={styles.fullImage}
                    resizeMode="cover"
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadowWrapper: {
    width: '90%',
    height: height * 0.85,
    borderRadius: 20,
    backgroundColor: '#FFFDF1',
    overflow: 'hidden',
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFDF1',
  },
  fullImageContainer: {
    width: '100%',
    height: 250,
    position: 'relative',
  },
  fullImage: {
    width: '100%',
    height: 250,
  },
  userInfoContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  userName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userLocation: {
    color: '#fff',
    fontSize: 14,
  },
  detailsContainer: {
    padding: 16,
    backgroundColor: '#F2EED7',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  sectionText: {
    fontSize: 14,
    color: '#333',
  },
  pillsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginVertical: 10,
  },
  pill: {
    backgroundColor: '#EEE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    margin: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagPill: {
    backgroundColor: '#DFFFD6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    margin: 4,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
  },
});

export default MatchUserCard;