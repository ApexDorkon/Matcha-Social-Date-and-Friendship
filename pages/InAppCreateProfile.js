// InAppCrearteProfile.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../styles/CreateProfilePage.styles';
import { SafeAreaView } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';

const matchModeConfig = {
  Dating: {
    genderApi: '/api/GenderSexualOrientationPronoun/GetAllDatingModeGenders',
    postApi: '/api/Profile/CreateDatingProfile',
    requiresOrientation: true,
  },
  Business: {
    genderApi: '/api/GenderSexualOrientationPronoun/GetAllOtherModeGenders',
    postApi: '/api/Profile/CreateBusinessProfile',
    requiresOrientation: false,
  },
  Casual: {
    genderApi: '/api/GenderSexualOrientationPronoun/GetAllOtherModeGenders',
    postApi: '/api/Profile/CreateCasualProfile',
    requiresOrientation: false,
  },
  Sports: {
    genderApi: '/api/GenderSexualOrientationPronoun/GetAllOtherModeGenders',
    postApi: '/api/Profile/CreateSportsProfile',
    requiresOrientation: false,
  },
  Study: {
    genderApi: '/api/GenderSexualOrientationPronoun/GetAllOtherModeGenders',
    postApi: '/api/Profile/CreateStudyProfile',
    requiresOrientation: false,
  },
};

const InAppCreateProfile = ({ route, navigation }) => {
   
    const { matchType } = route.params;

  const [step, setStep] = useState(0);
  const [token, setToken] = useState('');
  const [matchModes, setMatchModes] = useState([]);
  const [selectedModes, setSelectedModes] = useState([]);

  const [currentModeIndex, setCurrentModeIndex] = useState(0);
  const [selectedImages, setSelectedImages] = useState([]);
  const [pronouns, setPronouns] = useState([]);
  const [genders, setGenders] = useState([]);
  const [sexualOrientations, setSexualOrientations] = useState([]);
  const [interestTags, setInterestTags] = useState([]);
  const [selectedUploadProfileType, setSelectedUploadProfileType] = useState('');



  const uploadImages = async () => {
    console.log('🟢 uploadImages called');

    if (!selectedUploadProfileType) {
      Alert.alert('Please select which profile type to upload photos for.');
      return;
    }

    if (selectedImages.length === 0) {
      Alert.alert('Upload at least one profile photo.');
      return;
    }
    
    if (selectedImages.length > 5) {
      Alert.alert('You can only upload up to 5 photos.');
      return;
    }
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const formData = new FormData();

      selectedImages.forEach((img, index) => {
        formData.append('photos', {
          uri: img.uri,
          type: img.type,
          name: img.fileName || `image-${index}.jpg`,
        });
      });

      const profileTypeIdMap = {
        Dating: 1,
        Casual: 2,
        Sports: 3,
        Business: 4,
        Study: 5,
      };
      // 🟡 Add debug log for selectedUploadProfileType
      console.log('🟡 selectedUploadProfileType:', selectedUploadProfileType);
      const profileTypeId = profileTypeIdMap[selectedUploadProfileType.trim()];
      if (!profileTypeId) {
        Alert.alert('Error', 'Invalid profile type for upload.');
        return;
      }

      console.log('Uploading with:', {
        profileTypeId,
        images: selectedImages.map((img) => img.uri),
      });

      const response = await fetch(`https://api.matchaapp.net/api/Photo/UploadProfilePhotosForProfiles?profileType=${profileTypeId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          // Let fetch set Content-Type automatically
        },
        body: formData,
      });

      const text = await response.text();
      console.log('Upload response status:', response.status);
      let data = {};
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.warn('⚠️ Non-JSON response:', text);
      }

      if (!response.ok) {
        console.error('❌ Upload failed:', data);
        throw new Error(data.errorMessages?.[0] || 'Upload failed');
      }

      Alert.alert('✅ Success', 'Photos uploaded!');
      navigation.replace('MatchaPage');
    } catch (err) {
      console.error('❌ uploadImages error:', err);
      Alert.alert('Error', err.message || 'Upload failed');
    }
  };

  const handleSelectImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 5, // <-- Native limit 5
        includeBase64: false,
        quality: 0.7,
        maxWidth: 800,
        maxHeight: 800,
      },
      (response) => {
        if (response.didCancel || response.errorCode) return;
  
        const assets = response.assets || [];
  
        if (assets.length > 5) {
          Alert.alert('⚠️ Limit Exceeded', 'You can select up to 5 photos.');
          return;
        }
        if (assets.length === 0) {
          Alert.alert('⚠️ No Photo Selected', 'Please select at least 1 photo.');
          return;
        }
  
        setSelectedImages(assets);
      }
    );
  };
  
   
  const [form, setForm] = useState({
    genderId: null,
    pronounId: null,
    sexualOrientation: [],
    matchGender: [],
    bio: '',
    interestTags: [],
  });
 
  const loadInitialData = async () => {
    const token = await AsyncStorage.getItem('accessToken');
    setToken(token);

    const headers = { Authorization: `Bearer ${token}` };
    const [matchRes, pronounRes, orientationRes, tagRes] = await Promise.all([
      fetch('https://api.matchaapp.net/api/Match/GetAllMatchModes', { headers }),
      fetch('https://api.matchaapp.net/api/GenderSexualOrientationPronoun/GetAllPronouns', { headers }),
      fetch('https://api.matchaapp.net/api/GenderSexualOrientationPronoun/GetAllSexualOrientations', { headers }),
      fetch('https://api.matchaapp.net/api/Tag/GetAllInterestTags', { headers }),
    ]);

    const matchModesData = (await matchRes.json()).response || [];
    setMatchModes(matchModesData); // ✅ set first

    setSelectedModes([]);
    setCurrentModeIndex(0);

    setPronouns((await pronounRes.json()).response || []);
    setSexualOrientations((await orientationRes.json()).response || []);

    const tagData = await tagRes.json();
    setInterestTags(tagData.response || []);
  };
  useEffect(() => {
    if (step === 1 && selectedModes.length > 0) {
      loadGendersForCurrentMode();
    }
  }, [step, selectedModes]); // <-- 🔄 listen to selectedModes too
  
  useEffect(() => {
    loadInitialData();
  }, []);
useEffect(() => {
  if (matchType) {
    const formatted = matchType.trim();
    const map = {
      Date: 'Dating',
      Casual: 'Casual',
      Sports: 'Sports',
      Business: 'Business',
      Study: 'Study',
      Dating: 'Dating',
    };
    setSelectedUploadProfileType(map[formatted] || '');
  }
}, [matchType]);
  
  
  useEffect(() => {
    if (step === 1 && selectedModes.length > 0) {
      loadGendersForCurrentMode();
    }
  }, [step, currentModeIndex]);

  const loadGendersForCurrentMode = async () => {
    const selectedModeObj = matchModes.find((m) => m.id === selectedModes[0]);
    const config = matchModeConfig[selectedModeObj?.name];
    if (!config || !config.genderApi) return;

    try {
      const res = await fetch(`https://api.matchaapp.net${config.genderApi}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setGenders(data.response || []);
    } catch (err) {
      console.error('❌ Failed to load genders:', err);
    }
  };
  

  const toggleSelect = (id, array, setArray) => {
    if (array.includes(id)) setArray(array.filter((i) => i !== id));
    else setArray([...array, id]);
  };
// Fix for the handleNext function and handleSubmitProfile function

const handleNext = async () => {
    if (step === 0 && selectedModes.length === 0) {
      return Alert.alert('Select at least one match mode.');
    }

    if (step === 1 && (!form.genderId || !form.pronounId)) {
      return Alert.alert('Select one gender and one pronoun.');
    }

    const selectedModeName = matchModes.find((m) => m.id === selectedModes[0])?.name;
    const isDating = selectedModeName === 'Dating';
    if (step === 2 && isDating) {
      if (form.sexualOrientation.length === 0 || form.matchGender.length === 0) {
        return Alert.alert('Select at least one sexual orientation and match gender.');
      }
    }

    if (step === 3) {
      if (!form.bio || form.bio.trim().length === 0) {
        return Alert.alert('Please enter something in your bio.');
      }
    }

    if (step === 4) {
      if (form.interestTags.length < 3 || form.interestTags.length > 20) {
        return Alert.alert('Select between 3 and 20 interest tags.');
      }

      try {
        await handleSubmitProfile();  // First submit the profile
        setStep(6);  // Then skip to step 6
      } catch (error) {
        Alert.alert('Error', error.message || 'Failed to create profile');
      }
      return; // Important to return here to prevent the default step increment
    }

    if (step === 6) {
      if (selectedImages.length === 0) {
        return Alert.alert('Upload at least one profile photo.');
      }
      console.log('🟢 Proceeding to upload images...');
      return uploadImages(); // send photos
    }

    setStep((s) => s + 1);
  };
  
  const handleSubmitProfile = async () => {
    const selectedModeName = matchModes.find((m) => m.id === selectedModes[0])?.name;
    // Guard: ensure selectedModeName exists and is valid
    if (!selectedModeName || !matchModeConfig[selectedModeName]) {
      throw new Error('Invalid or missing profile type selection.');
    }
    const config = matchModeConfig[selectedModeName];

    const payload = {
      bio: form.bio,
      pronounId: form.pronounId,
      genderId: form.genderId,
      interestTags: form.interestTags,
      matchGender: form.matchGender,
    };
    
    if (config?.requiresOrientation) {
      payload.sexualOrientation = form.sexualOrientation;
    }

    try {
      const res = await fetch(`https://api.matchaapp.net${config.postApi}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.errorMessages?.[0] || 'Unknown error');
      }

      // We don't need to set state here, just return success
      return true;
    } catch (err) {
      console.error('❌ Profile submission error:', err);
      throw err; // Rethrow so the calling function can handle it
    }
  };
  const groupedTags = Array.isArray(interestTags)
    ? interestTags.reduce((acc, tag) => {
        const category = (tag.category && tag.category.name) ? tag.category.name : 'Other';
        if (!acc[category]) acc[category] = [];
        acc[category].push(tag);
        return acc;
      }, {})
    : {};

  // rest of the code remains unchanged


  const renderStep = () => {
    const selectedModeName = matchModes.find((m) => m.id === selectedModes[0])?.name;
    const isDating = selectedModeName === 'Dating';

    switch (step) {
      case 0:
        // Exclude already created profiles by filtering matchModes
        // Find out which profiles already exist
        // For this patch, assume `existingProfileTypes` is available in scope (if not, must be added)
        // For now, check if it exists, otherwise default to empty array
        const existingProfileTypes = typeof existingProfileTypes !== "undefined" ? existingProfileTypes : [];
        return (
          <View>
            <Text style={styles.stepTitle}>What are you looking for?</Text>
            {matchModes
              .filter((mode) => !existingProfileTypes.includes(mode.name))
              .map((mode) => (
                <TouchableOpacity
                  key={mode.id}
                  onPress={() => setSelectedModes([mode.id])}
                  style={[styles.optionButton, selectedModes.includes(mode.id) && styles.selectedOption]}
                >
                  <Text style={selectedModes.includes(mode.id) ? styles.selectedText : styles.unselectedText}>{mode.name}</Text>
                </TouchableOpacity>
            ))}
          </View>
        );

      case 1:
        return (
          <View>
            <Text style={styles.stepTitle}>Gender</Text>
            {genders.map((g) => (
              <TouchableOpacity key={g.id} onPress={() => setForm({ ...form, genderId: g.id })} style={[styles.optionButton, form.genderId === g.id && styles.selectedOption]}>
                <Text style={form.genderId === g.id ? styles.selectedText : styles.unselectedText}>{g.name}</Text>
              </TouchableOpacity>
            ))}
            <Text style={styles.stepTitle}>Pronoun</Text>
            {Array.isArray(pronouns) && pronouns.map((p) => (
              <TouchableOpacity key={p.id} onPress={() => setForm({ ...form, pronounId: p.id })} style={[styles.optionButton, form.pronounId === p.id && styles.selectedOption]}>
                <Text style={form.pronounId === p.id ? styles.selectedText : styles.unselectedText}>{p.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        );
      case 2:
        return (
          <View>
            {isDating ? (
              <>
                <Text style={styles.stepTitle}>What is your sexual orientation?</Text>
                {sexualOrientations.map((s) => (
                  <TouchableOpacity
                    key={s.id}
                    onPress={() => toggleSelect(s.id, form.sexualOrientation, (val) => setForm({ ...form, sexualOrientation: val }))}
                    style={[styles.optionButton, form.sexualOrientation.includes(s.id) && styles.selectedOption]}
                  >
                    <Text style={form.sexualOrientation.includes(s.id) ? styles.selectedText : styles.unselectedText}>{s.name}</Text>
                  </TouchableOpacity>
                ))}

                <Text style={styles.stepTitle}>Who do you want to be matched with?</Text>
                {genders.map((g) => (
                  <TouchableOpacity
                    key={g.id}
                    onPress={() => toggleSelect(g.id, form.matchGender, (val) => setForm({ ...form, matchGender: val }))}
                    style={[styles.optionButton, form.matchGender.includes(g.id) && styles.selectedOption]}
                  >
                    <Text style={form.matchGender.includes(g.id) ? styles.selectedText : styles.unselectedText}>{g.name}</Text>
                  </TouchableOpacity>
                ))}
              </>
            ) : (
              <>
                <Text style={styles.stepTitle}>Who do you want to be matched with?</Text>
                {genders.map((g) => (
                  <TouchableOpacity
                    key={g.id}
                    onPress={() => toggleSelect(g.id, form.matchGender, (val) => setForm({ ...form, matchGender: val }))}
                    style={[styles.optionButton, form.matchGender.includes(g.id) && styles.selectedOption]}
                  >
                    <Text style={form.matchGender.includes(g.id) ? styles.selectedText : styles.unselectedText}>{g.name}</Text>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </View>
        );
      case 3:
        return (
          <View>
            <Text style={styles.stepTitle}>Your Bio</Text>
            <TextInput
              style={styles.textInput}
              multiline
              maxLength={200}
              placeholder="Say something about yourself"
              value={form.bio}
              onChangeText={(text) => setForm({ ...form, bio: text })}
            />
          </View>
        );
      case 4:
        return (
          <ScrollView>
            <Text style={styles.stepTitle}>Pick Your Interests</Text>
            {Object.keys(groupedTags).length === 0 ? (
              <Text>No interest tags found.</Text>
            ) : (
              Object.entries(groupedTags).map(([cat, tags]) => (
                <View key={cat}>
                  <Text style={styles.categoryTitle}>{cat}</Text>
                  <View style={styles.tagRow}>
                    {tags.map((tag) => (
                      <TouchableOpacity
                        key={tag.id}
                        onPress={() => {
                          if (!form.interestTags.includes(tag.id) && form.interestTags.length >= 20) {
                            Alert.alert('Maximum limit', 'You can select up to 20 interest tags.');
                            return;
                          }
                          toggleSelect(tag.id, form.interestTags, (val) => setForm({ ...form, interestTags: val }));
                        }}
                        style={[styles.pill, form.interestTags.includes(tag.id) && styles.selectedOption]}
                      >
                        <Text style={form.interestTags.includes(tag.id) ? styles.selectedText : styles.unselectedText}>{tag.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        );
        
      case 6:
        // Profile type selector should show the selected value from step 0, non-editable
        return (
          <ScrollView>
            {/* Profile Type Display (non-editable) */}
            <Text style={styles.stepTitle}>Profile Type</Text>
            <View style={[styles.optionButton, { backgroundColor: '#f0f0f0' }]}>
              <Text style={styles.selectedText}>{selectedUploadProfileType || 'Not selected'}</Text>
            </View>

            {/* Image selection UI */}
            <Text style={styles.stepTitle}>Add Your Photos</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginVertical: 20 }}>
              {Array.from({ length: 5 }).map((_, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    launchImageLibrary(
                      {
                        mediaType: 'photo',
                        quality: 0.7,
                        maxWidth: 800,
                        maxHeight: 800,
                      },
                      (response) => {
                        const asset = response.assets?.[0];
                        if (!asset) return;
                        const updated = [...selectedImages];
                        updated[index] = {
                          uri: asset.uri,
                          type: asset.type || 'image/jpeg',
                          name: asset.fileName || `photo-${index + 1}.jpg`,
                        };
                        setSelectedImages(updated);
                      }
                    );
                  }}
                  style={{
                    margin: 8,
                    width: 100,
                    height: 100,
                    borderRadius: 10,
                    backgroundColor: '#EEE',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  {selectedImages[index]?.uri ? (
                    <Image
                      source={{ uri: selectedImages[index].uri }}
                      style={{
                        width: 100,
                        height: 100,
                        borderRadius: 10,
                        backgroundColor: '#CCC',
                      }}
                    />
                  ) : (
                    <Text style={{ fontSize: 28, color: '#AAA' }}>+</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        );


      default:
        return null;
    }
  };

 
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Create Profile</Text>
      <ScrollView style={{ flex: 1 }}>{renderStep()}</ScrollView>
      <View style={styles.navButtons}>
  {step > 0 && (
    <TouchableOpacity style={styles.navButton} onPress={() => setStep((s) => s - 1)}>
      <Text style={styles.navButtonText}>Back</Text>
    </TouchableOpacity>
  )}
  <TouchableOpacity style={styles.navButton} onPress={handleNext}>
  <Text style={styles.navButtonText}>
    {step === 6 ? 'Finish' : 'Next'}
  </Text>
</TouchableOpacity>

</View>


    </SafeAreaView>
  );
};

export default InAppCreateProfile;

