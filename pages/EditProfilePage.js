import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';
import { useMatchType } from '../contexts/MatchTypeContext';
import EditProfilePageStyles from '../styles/EditProfileStyles';
import Geolocation from 'react-native-geolocation-service';



const profileUpdateEndpoints = {
  Date: '/api/Profile/UpdateDatingProfile',
  Business: '/api/Profile/UpdateBusinessProfile',
  Casual: '/api/Profile/UpdateCasualProfile',
  Study: '/api/Profile/UpdateStudyProfile',
  Sport: '/api/Profile/UpdateSportsProfile',
};

const getProfileEndpointMap = {
  Date: '/api/Profile/GetDatingProfile',
  Business: '/api/Profile/GetBusinessProfile',
  Casual: '/api/Profile/GetCasualProfile',
  Study: '/api/Profile/GetStudyProfile',
  Sport: '/api/Profile/GetSportsProfile',
};

const photoUploadEndpoint = '/api/Photo/UploadProfilePhotosForProfiles';

const lookupApis = {
  pronoun: '/api/GenderSexualOrientationPronoun/GetPronounById',
  orientation: '/api/GenderSexualOrientationPronoun/GetSexualOrientationById',
  genderDating: '/api/GenderSexualOrientationPronoun/GetDatingModeGenderById',
  genderOther: '/api/GenderSexualOrientationPronoun/GetOtherModeGenderById',
  tag: '/api/Tag/GetInterestTagById',
};

const EditProfilePage = () => {
  const navigation = useNavigation();
  const { activeSelection } = useMatchType();

  const [profileData, setProfileData] = useState(null);
  const [photos, setPhotos] = useState(Array(5).fill(null));
  const [bio, setBio] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagNames, setTagNames] = useState([]);
  const [gender, setGender] = useState(null);
  const [genderName, setGenderName] = useState('');
  const [pronoun, setPronoun] = useState(null);
  const [pronounName, setPronounName] = useState('');
  const [orientation, setOrientation] = useState([]);
  const [orientationNames, setOrientationNames] = useState([]);
  const [matchGender, setMatchGender] = useState([]);
  const [matchGenderNames, setMatchGenderNames] = useState([]);
  const [location, setLocation] = useState('Not set');


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
      console.warn('❌ Could not parse JSON:', text);
      return {};
    }
  };

  const loadProfileData = async () => {
    try {
      const endpoint = getProfileEndpointMap[activeSelection];
      const profileRes = await fetchWithAuth(endpoint);
      if (!profileRes.response) return;

      const data = profileRes.response;
      setProfileData(data);
      setBio(data.bio);
      setSelectedTags(data.interestTags || []);
      setGender(data.genderId);
      setPronoun(data.pronounId);
      setMatchGender(data.matchGender || []);
      if (activeSelection === 'Date') setOrientation(data.sexualOrientation || []);


      const locationRes = await fetchWithAuth('/api/Location/GetUserLocation');
      const loc = locationRes.response;
      setLocation(loc ? `${loc.province}, ${loc.city}` : 'Not set');

      const genderApi = activeSelection === 'Date' ? lookupApis.genderDating : lookupApis.genderOther;
      const [g, p] = await Promise.all([
        fetchWithAuth(`${genderApi}?id=${data.genderId}`),
        fetchWithAuth(`${lookupApis.pronoun}?id=${data.pronounId}`)
      ]);
      setGenderName(g?.response?.name || '');
      setPronounName(p?.response?.name || '');

      if (activeSelection === 'Date') {
        const oNames = await Promise.all(
          (data.sexualOrientation || []).map(id =>
            fetchWithAuth(`${lookupApis.orientation}?id=${id}`)
          )
        );
        setOrientationNames(oNames.map(o => o?.response?.name));
      }

      const mgNames = await Promise.all(
        data.matchGender.map(id =>
          fetchWithAuth(`${genderApi}?id=${id}`)
        )
      );
      setMatchGenderNames(mgNames.map(m => m?.response?.name));

      const tagResponses = await Promise.all(
        (data.interestTags || []).map(id =>
          fetchWithAuth(`${lookupApis.tag}?id=${id}`)
        )
      );
      setTagNames(tagResponses.map(t => t?.response?.name || `Tag ${t?.id}`));

      const profileTypeIdMap = {
        Date: 1,
        Casual: 2,
        Sport: 3,
        Business: 4,
        Study: 5,
      };

      console.log('🧭 activeSelection:', activeSelection);
      console.log('🧭 profileTypeIdMap key exists:', profileTypeIdMap.hasOwnProperty(activeSelection));
      console.log('🧭 resolved profileType:', profileTypeIdMap[activeSelection]);

      const photoRes = await fetchWithAuth(`/api/Photo/GetProfilePhotos?profileType=${profileTypeIdMap[activeSelection]}`);
      console.log('📷 Raw API response:', photoRes.response);
      console.log('📦 Full photoRes object:', photoRes);
      if (Array.isArray(photoRes)) {
        const ordered = Array(5).fill(null);
        photoRes.forEach(p => {
          const slot = p.order - 1;
          if (slot >= 0 && slot < 5 && p.url) {
            ordered[slot] = { ...p };
          }
        });
        console.log('✅ Ordered photos:', ordered);
        setPhotos(ordered);
      }
    } catch (err) {
      console.error('❌ Error loading profile:', err);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, [activeSelection]);


  

  const handleImageChange = (slotIndex) => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.5, // Reduce file size
      },
      (response) => {
        const asset = response.assets?.[0];
        if (!asset) return;
  
        const updated = [...photos];
        updated[slotIndex] = {
          uri: asset.uri,
          type: asset.type || 'image/jpeg',
          name: asset.fileName || `photo-${slotIndex + 1}.jpg`,
          order: slotIndex + 1, // Important: backend expects 1-based order
        };
        setPhotos(updated);
        console.log(`📸 Updated slot ${slotIndex + 1}:`, updated[slotIndex]);
      }
    );
  };
  
  const handleSave = async () => {
    try {
      console.log('🔁 Starting handleSave...');
      const payload = {
        id: profileData.id,
        userId: profileData.userId,
        pronounId: pronoun,
        bio,
        interestTags: selectedTags,
        genderId: gender,
        matchGender,
      };
      if (activeSelection === 'Date') payload.sexualOrientation = orientation;
  
      console.log('📤 Submitting profile payload:', payload);
      await fetchWithAuth(profileUpdateEndpoints[activeSelection], 'PUT', payload);
  
      console.log('📤 Uploading photos...');
      await uploadPhotos();

  
      Alert.alert('✅ Success', 'Profile updated!');
      navigation.reset({
        index: 0,
        routes: [{ name: 'MePage' }],
      });
    } catch (err) {
      console.error('❌ handleSave error:', err);
      Alert.alert('❌ Error', err.message || 'Update failed');
    }
  };


  const updateUserLocation = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
  
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        Geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
  
            const payload = {
              locationX: longitude.toString(),
              locationY: latitude.toString(),
              matchRange: 50, // Default to 50 km
            };
  
            const token = await AsyncStorage.getItem('accessToken');
            const res = await fetch('https://api.matchaapp.net/api/Location/UpdateUserLocation', {
              method: 'PUT',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(payload),
            });
  
            if (res.ok) {
              setLocation(`Updated: ${latitude.toFixed(3)}, ${longitude.toFixed(3)}`);
              Alert.alert('✅ Location updated');
            } else {
              Alert.alert('❌ Failed to update location');
            }
          },
          (error) => {
            console.error(error);
            Alert.alert('❌ Error getting location');
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
      } else {
        Alert.alert('❌ Location permission denied');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('❌ Location error', err.message || 'Something went wrong');
    }
  };
  const handleManualLocationUpdate = async () => {
    const payload = {
      locationX: "39.9097", // Latitude (Çankaya)
      locationY: "32.8597", // Longitude (Çankaya)
      matchRange: 200,
    };
  
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const res = await fetch('https://api.matchaapp.net/api/Location/UpdateUserLocation', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      if (res.ok) {
        Alert.alert("✅ Location Updated", "Your location has been set to Çankaya, Ankara.");
        setLocation("Çankaya, Ankara");
      } else {
        Alert.alert("❌ Failed", "Could not update location.");
      }
    } catch (err) {
      console.error("❌ Location update error:", err);
      Alert.alert("❌ Error", "An unexpected error occurred.");
    }
  };
  const uploadPhotos = async () => {
    const token = await AsyncStorage.getItem('accessToken');
    const formData = new FormData();
  
    photos.forEach((photo, index) => {
      if (photo?.uri) {
        console.log(`📎 Appending NEW photo [${index + 1}]:`, photo.name);
        formData.append('photos', {
          uri: photo.uri,
          type: photo.type,
          name: photo.name,
        });
      } else if (photo?.url) {
        // Download & re-send existing photo to simulate "re-upload"
        console.log(`📎 Appending EXISTING photo [${index + 1}]:`, photo.url);
        formData.append('photos', {
          uri: photo.url,
          type: 'image/jpeg',
          name: `existing-photo-${index + 1}.jpg`,
        });
      }
    });
  
    const profileTypeIdMap = {
      Date: 1,
      Casual: 2,
      Sport: 3,
      Business: 4,
      Study: 5,
    };
    const uploadUrl = `https://api.matchaapp.net${photoUploadEndpoint}?profileType=${profileTypeIdMap[activeSelection]}`;
    console.log('📤 Upload URL:', uploadUrl);
  
    const res = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });
  
    console.log('📥 Upload response:', await res.text());
  
    if (!res.ok) {
      throw new Error('Upload failed');
    }
  };

  
  return (
    <ScrollView style={EditProfilePageStyles.container} contentContainerStyle={EditProfilePageStyles.contentContainer}>
      <TouchableOpacity
        style={{
          alignSelf: 'flex-start',
          margin: 20,
          backgroundColor: 'black',
          paddingVertical: 10,
          paddingHorizontal: 20,
          borderRadius: 999,
        }}
        onPress={() => navigation.goBack()}
      >
        <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>← Exit</Text>
      </TouchableOpacity>

      <Text style={EditProfilePageStyles.sectionTitle}>Edit Your Profile</Text>

      <View style={EditProfilePageStyles.section}>
        <Text style={EditProfilePageStyles.sectionTitle}>Photos</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {photos.map((photo, index) => (
            <TouchableOpacity key={index} onPress={() => handleImageChange(index)}>
              {photo?.uri || photo?.url ? (
                <Image
                  source={{ uri: photo.uri || photo.url }}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 10,
                    backgroundColor: '#CCC',
                  }}
                />
              ) : (
                <View
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 10,
                    backgroundColor: '#EEE',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 28, color: '#AAA' }}>+</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={EditProfilePageStyles.section}>
        <Text style={EditProfilePageStyles.sectionTitle}>Bio</Text>
        <TextInput
          style={[EditProfilePageStyles.input, EditProfilePageStyles.textArea]}
          value={bio}
          onChangeText={setBio}
          placeholder="Edit your bio"
          multiline
        />
      </View>

      <TouchableOpacity
        style={EditProfilePageStyles.section}
        onPress={() =>
          navigation.navigate('GenderSelectorModal', {
            selectedGender: gender,
            isDatingMode: activeSelection === 'Date', // ✅ Pass this to determine correct API
            setGender,
            setGenderName,
          })
        }
      >
        <Text style={EditProfilePageStyles.sectionTitle}>Gender</Text>
        <Text>{genderName || '>'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={EditProfilePageStyles.section} onPress={() => navigation.navigate('PronounSelectorModal', { pronoun, setPronoun, setPronounName })}>
        <Text style={EditProfilePageStyles.sectionTitle}>Pronoun</Text>
        <Text>{pronounName || '>'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={EditProfilePageStyles.section} onPress={() => navigation.navigate('MatchGenderSelectorModal', { matchGender, setMatchGender, setMatchGenderNames })}>
        <Text style={EditProfilePageStyles.sectionTitle}>Match With</Text>
        <Text>{matchGenderNames.join(', ') || '>'}</Text>
      </TouchableOpacity>

      {activeSelection === 'Date' && (
      <TouchableOpacity
        style={EditProfilePageStyles.section}
        onPress={() =>
          navigation.navigate('OrientationSelectorModal', {
            selectedOrientations: orientation,
            onSelect: (ids, names) => {
              setOrientation(ids);
              setOrientationNames(names);
            },
          })
        }
      >
        <Text style={EditProfilePageStyles.sectionTitle}>Sexual Orientation</Text>
        <Text>{orientationNames.join(', ') || '>'}</Text>
      </TouchableOpacity>
    )}

      <TouchableOpacity
        style={EditProfilePageStyles.section}
        onPress={() =>
          navigation.navigate('InterestTagSelectorModal', {
            selectedTags,
            onSelect: (newIds, newNames) => {
              setSelectedTags(newIds);
              setTagNames(newNames);
            },
          })
        }
      >
        <Text style={EditProfilePageStyles.sectionTitle}>Interests</Text>
        <View style={EditProfilePageStyles.interestsContainer}>
          {tagNames.map((tag, i) => (
            <View key={i} style={EditProfilePageStyles.interestBadge}>
              <Text style={EditProfilePageStyles.interestText}>{tag}</Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>

      <View style={EditProfilePageStyles.section}>
      <Text style={EditProfilePageStyles.sectionTitle}>Location</Text>
      <Text>{location}</Text>
      <TouchableOpacity
        onPress={handleManualLocationUpdate}
        style={{
          marginTop: 10,
          backgroundColor: '#000',
          padding: 10,
          borderRadius: 8,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Update My Location</Text>
      </TouchableOpacity>
      </View>

  
      <TouchableOpacity style={EditProfilePageStyles.saveButton} onPress={handleSave}>
        <Text style={EditProfilePageStyles.saveButtonText}>Done</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default EditProfilePage;