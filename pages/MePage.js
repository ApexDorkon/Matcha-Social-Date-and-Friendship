import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../styles/MePageStyles';
import { useMatchType } from '../contexts/MatchTypeContext';
import { useNavigation } from '@react-navigation/native';

const profileEndpoints = {
  Date: '/api/Profile/GetDatingProfile',
  Business: '/api/Profile/GetBusinessProfile',
  Casual: '/api/Profile/GetCasualProfile',
  Study: '/api/Profile/GetStudyProfile',
  Sport: '/api/Profile/GetSportsProfile',
};

const profileTypeIdMap = {
  Date: 1,
  Casual: 2,
  Sport: 3,
  Business: 4,
  Study: 5,
};

const lookupApis = {
  pronoun: '/api/GenderSexualOrientationPronoun/GetPronounById',
  orientation: '/api/GenderSexualOrientationPronoun/GetSexualOrientationById',
  tag: '/api/Tag/GetInterestTagById',
  genderDating: '/api/GenderSexualOrientationPronoun/GetDatingModeGenderById',
  genderOther: '/api/GenderSexualOrientationPronoun/GetOtherModeGenderById',
};

const MePage = ({ handleLogout }) => {
  const { activeSelection } = useMatchType();
  const navigation = useNavigation();
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [profileInfo, setProfileInfo] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [resolvedData, setResolvedData] = useState({
    gender: '',
    pronoun: '',
    orientation: [],
    matchGender: [],
    tags: [],
  });
  const [menuVisible, setMenuVisible] = useState(false);

  const fetchWithAuth = async (url, method = 'GET', body = null) => {
    const token = await AsyncStorage.getItem('accessToken');
    const res = await fetch(`https://api.matchaapp.net${url}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : null,
    });

    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      console.warn('⚠️ Could not parse response:', text);
      return {};
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const profileState = await fetchWithAuth('/api/Profile/GetLoggedInUserProfileState');
        const isCreatedField = {
          Date: 'isDatingProfileCreated',
          Casual: 'isCasualProfileCreated',
          Sport: 'isSportsProfileCreated',
          Business: 'isBusinessProfileCreated',
          Study: 'isStudyProfileCreated',
        }[activeSelection];

        if (!profileState.response?.[isCreatedField]) {
          setProfileInfo(null);
          setPhotos([]);
          setResolvedData({
            gender: '',
            pronoun: '',
            orientation: [],
            matchGender: [],
            tags: [],
          });
          setLocation(null);
          setUserInfo(null);
          setLoading(false);
          return;
        }

        const userRes = await fetchWithAuth('/api/Authentication/Profile');
        setUserInfo(userRes.response);

        const profileRes = await fetchWithAuth(profileEndpoints[activeSelection]);
        if (!profileRes.response) {
          setProfileInfo(null);
          setPhotos([]);
          return;
        }

        const profile = profileRes.response;
        setProfileInfo(profile);

        const locationRes = await fetchWithAuth('/api/Location/GetUserLocation');
        const loc = locationRes.response;
        setLocation(loc ? `${loc.province}, ${loc.city}` : 'Not set');

        const profileTypeId = profileTypeIdMap[activeSelection];
        const photoRes = await fetchWithAuth(`/api/Photo/GetProfilePhotos?profileType=${profileTypeId}`);
        setPhotos(Array.isArray(photoRes) ? photoRes : []);

        const genderApi =
          activeSelection === 'Date'
            ? lookupApis.genderDating
            : lookupApis.genderOther;

        const [gender, pronoun] = await Promise.all([
          fetchWithAuth(`${genderApi}?id=${profile.genderId}`),
          fetchWithAuth(`${lookupApis.pronoun}?id=${profile.pronounId}`),
        ]);

        const orientationNames = profile.sexualOrientation?.length
          ? await Promise.all(
              profile.sexualOrientation.map((id) =>
                fetchWithAuth(`${lookupApis.orientation}?id=${id}`)
              )
            )
          : [];

        const matchGenderNames = await Promise.all(
          profile.matchGender.map((id) =>
            fetchWithAuth(`${genderApi}?id=${id}`)
          )
        );

        const tagNames = await Promise.all(
          profile.interestTags.map((id) =>
            fetchWithAuth(`${lookupApis.tag}?id=${id}`)
          )
        );

        setResolvedData({
          gender: gender.response.name,
          pronoun: pronoun.response.name,
          orientation: orientationNames.map((o) => o.response.name),
          matchGender: matchGenderNames.map((g) => g.response.name),
          tags: (tagNames || []).map((t) => t.response?.name),
        });
      } catch (err) {
        console.error('❌ Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [activeSelection]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFEF8' }}>
      <ScrollView contentContainerStyle={[styles.container, styles.contentContainer, { backgroundColor: '#FFFEF8', flexGrow: 1 }]}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
            <Text>Loading profile...</Text>
          </View>
        ) : !profileInfo ? (
          <View style={styles.centered}>
            <View style={{ position: 'absolute', top: 0, right: 0, zIndex: 10 }}>
              <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)} style={{ paddingHorizontal: 5, margin: 8 }}>
                <Text style={{ fontSize: 24 }}>⋮</Text>
              </TouchableOpacity>
              {menuVisible && (
                <View style={{
                  position: 'absolute',
                  top: 30,
                  right: 0,
                  backgroundColor: '#fff',
                  padding: 10,
                  borderRadius: 6,
                  elevation: 5,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                }}>
                  <TouchableOpacity onPress={handleLogout}>
                    <Text style={{ color: '#000', fontWeight: '500', width: 60, textAlign: 'center' }}>Logout</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            <Text style={styles.infoText}>You don’t have a {activeSelection.toLowerCase()} profile yet.</Text>
            <TouchableOpacity
              style={styles.createProfileButton}
              onPress={() => navigation.navigate('InAppCreateProfile', { matchType: activeSelection })}
            >
              <Text style={styles.createProfileButtonText}>Create {activeSelection} Profile</Text>
            </TouchableOpacity>
            <Text style={[styles.infoText, { marginTop: 10 }]}>or try a different mode!</Text>
          </View>
        ) : (
          <>
            <View style={styles.header}>
              {photos.length > 0 && (
                <Image
                  source={{ uri: photos[0].url }}
                  style={styles.profileImage}
                />
              )}
              <View style={styles.headerContent}>
                <Text style={styles.userName}>
                  {userInfo?.firstName} {userInfo?.lastName}
                  {userInfo?.dob ? `, ${Math.floor((new Date() - new Date(userInfo.dob)) / (1000 * 60 * 60 * 24 * 365.25))}` : ''}
                </Text>
                <TouchableOpacity
                  style={[styles.editButton, { alignSelf: 'flex-start', marginTop: 4 }]}
                  onPress={() => navigation.navigate('EditProfilePage')}
                >
                  <Text style={styles.editButtonText}>Edit Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)} style={{ position: 'absolute', right: 0, top: 0 }}>
                  <Text style={{ fontSize: 24, paddingHorizontal: 5 }}>⋮</Text>
                </TouchableOpacity>
                {menuVisible && (
                  <View style={{
                    position: 'absolute',
                    top: 35,
                    right: 0,
                    backgroundColor: '#fff',
                    padding: 10,
                    borderRadius: 6,
                    elevation: 5,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    zIndex: 10,
                  }}>
                    <TouchableOpacity onPress={handleLogout}>
                      <Text style={{ color: '#000', fontWeight: '500', width: 60, textAlign: 'center' }}>Logout</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.personalInfoSection}>
            <Text style={styles.sectionTitle}>Personal Info</Text>
            <Text style={styles.infoText}>Gender: {resolvedData.gender}</Text>
            <Text style={styles.infoText}>Pronoun: {resolvedData.pronoun}</Text>
            <Text style={styles.infoText}>Match With: {resolvedData.matchGender.join(', ')}</Text>
            {activeSelection === 'Date' && (
              <Text style={styles.infoText}>
                Sexual Orientation: {resolvedData.orientation.join(', ')}
              </Text>
            )}
          </View>

            <View style={styles.bioSection}>
              <Text style={styles.sectionTitle}>Bio</Text>
              <Text style={styles.infoText}>{profileInfo.bio || 'No bio available.'}</Text>
            </View>

            <View style={styles.interestsSection}>
              <Text style={styles.sectionTitle}>Interests</Text>
              <View style={styles.interestsContainer}>
                {resolvedData.tags.length > 0 ? (
                  resolvedData.tags.map((tag, index) => (
                    <View key={index} style={styles.interestBadge}>
                      <Text style={styles.interestText}>{tag}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.infoText}>No interests added.</Text>
                )}
              </View>
            </View>

            <View style={styles.interestsSection}>
              <Text style={styles.sectionTitle}>Photos</Text>
              <View style={styles.photoContainer}>
                {photos.length > 0 ? (
                  photos.map((photo, index) => (
                    <Image
                      key={index}
                      source={{ uri: photo.url }}
                      style={styles.photoThumbnail}
                    />
                  ))
                ) : (
                  <Text style={styles.infoText}>No profile photos found.</Text>
                )}
              </View>
            </View>

            <View style={styles.interestsSection}>
              <Text style={styles.sectionTitle}>Location</Text>
              <Text style={styles.infoText}>{location || 'Not set'}</Text>
            </View>
          </>
        )}

          
      </ScrollView>
    </SafeAreaView>
  );
};

export default MePage;


// Add new styles for centered, createProfileButton, createProfileButtonText
import { StyleSheet } from 'react-native';
styles.centered = {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  padding: 20,
};
styles.createProfileButton = {
  marginTop: 20,
  paddingVertical: 12,
  paddingHorizontal: 20,
  backgroundColor: '#DAE8A1',
  borderRadius: 10,
};
styles.createProfileButtonText = {
  color: '#000',
  fontWeight: '600',
  fontSize: 16,
};
styles.userAge = {
  fontSize: 18,
  color: '#555',
  marginTop: 0,
  fontWeight: 'bold',
};
styles.logoutButton = {
  marginTop: 20,
  marginBottom: 30,
  paddingVertical: 14,
  paddingHorizontal: 30,
  backgroundColor: '#61C554',
  borderRadius: 10,
  alignItems: 'center',
};
styles.logoutButtonText = {
  color: '#fff',
  fontSize: 16,
  fontWeight: '600',
};