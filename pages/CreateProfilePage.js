// CreateProfilePage.js
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
import Geolocation from '@react-native-community/geolocation';
import Slider from '@react-native-community/slider';

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

const CreateProfilePage = ({ navigation }) => {
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
  const [createdProfileTypes, setCreatedProfileTypes] = useState([]);
  const [matchRange, setMatchRange] = useState(50); // default to 100 km  

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
      const profileTypeId = profileTypeIdMap[selectedUploadProfileType];

      const response = await fetch(`https://api.matchaapp.net/api/Photo/UploadProfilePhotosForProfiles?profileType=${profileTypeId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const text = await response.text();
      let data = {};
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.warn('⚠️ Response not JSON:', text);
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

    setMatchModes((await matchRes.json()).response || []);
    setPronouns((await pronounRes.json()).response || []);
    setSexualOrientations((await orientationRes.json()).response || []);

    const tagData = await tagRes.json();

  setInterestTags(tagData.response || []);

  };

  useEffect(() => { loadInitialData(); }, []);
  useEffect(() => {
    if (step === 1 && selectedModes.length > 0) {
      loadGendersForCurrentMode();
    }
  }, [step, currentModeIndex]);

  const loadGendersForCurrentMode = async () => {
    const mode = matchModes.find((m) => m.id === selectedModes[currentModeIndex]);
    const config = matchModeConfig[mode.name];
    const res = await fetch(`https://api.matchaapp.net${config.genderApi}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setGenders(data.response || []);
  };

  const toggleSelect = (id, array, setArray) => {
    if (step === 0) {
      setArray([id]); // only one mode allowed at step 0
    } else {
      if (array.includes(id)) {
        setArray(array.filter((i) => i !== id));
      } else {
        if (step === 4 && array.length >= 20) {
          Alert.alert('You can select a maximum of 20 interest tags.');
          return;
        }
        setArray([...array, id]);
      }
    }
  };

  const handleNext = async () => {
    if (step === 0 && selectedModes.length === 0) {
      return Alert.alert('Select at least one match mode.');
    }

    if (step === 1 && (!form.genderId || !form.pronounId)) {
      return Alert.alert('Select one gender and one pronoun.');
    }

    const isDating = matchModes.find((m) => m.id === selectedModes[currentModeIndex])?.name === 'Dating';
    if (step === 2 && isDating) {
      if (form.sexualOrientation.length === 0 || form.matchGender.length === 0) {
        return Alert.alert('Select at least one sexual orientation and match gender.');
      }
    }

    if (step === 3 && (!form.bio || form.bio.trim().length === 0)) {
      return Alert.alert('Please enter a short bio before continuing.');
    }

    if (step === 4) {
      if (form.interestTags.length < 3 || form.interestTags.length > 20) {
        return Alert.alert('Select between 3 and 20 interest tags.');
      }
      await handleSubmitCurrentMode();
      return setStep(5); // go to Location step
    }

    if (step === 5) {
      // Location share logic happens here, don't skip it
      handleShareLocation();
      return;
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
  const handleShareLocation = () => {
    Geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log('📍 Location obtained:', latitude, longitude);
  
        const payload = {
          locationX: latitude.toString(),
          locationY: longitude.toString(),
          matchRange: matchRange,
        };
  
        try {
          const token = await AsyncStorage.getItem('accessToken');
  
          const res = await fetch('https://api.matchaapp.net/api/Location/CreateUserLocation', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });
  
          const data = await res.json();
  
          if (!res.ok && data.errorMessages?.[0]?.includes('already')) {
            console.warn('⚠️ Location already exists, switching to update');
  
            const updateRes = await fetch('https://api.matchaapp.net/api/Location/UpdateUserLocation', {
              method: 'PUT',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(payload),
            });
  
            const updateData = await updateRes.json();
  
            if (!updateRes.ok) {
              console.error('❌ Location update failed:', updateData);
              return Alert.alert('Error', updateData.errorMessages?.[0] || 'Could not update location.');
            }
  
            Alert.alert('✅ Success', 'Location updated!');
            setStep(6);
          } else if (!res.ok) {
            console.error('❌ Location creation failed:', data);
            return Alert.alert('Error', data.errorMessages?.[0] || 'Could not create location.');
          } else {
            Alert.alert('✅ Success', 'Location saved!');
            setStep(6);
          }
        } catch (err) {
          console.error('❌ Location error:', err);
          Alert.alert('Error', 'Something went wrong while saving your location.');
        }
      },
      (error) => {
        console.error('❌ Geolocation error:', error);
        Alert.alert('Error', 'Failed to get location. Please enable location services.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };
  
  const handleSubmitCurrentMode = async () => {
    const currentMatchMode = matchModes.find((m) => m.id === selectedModes[currentModeIndex]);
    const config = matchModeConfig[currentMatchMode.name];
    const payload = {
      bio: form.bio,
      pronounId: form.pronounId,
      genderId: form.genderId,
      interestTags: form.interestTags,
      matchGender: form.matchGender,
    };
    if (config.requiresOrientation) {
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

      if (currentModeIndex < selectedModes.length - 1) {
        setCreatedProfileTypes((prev) => [...prev, currentMatchMode.name]);
        setCurrentModeIndex((i) => i + 1);
        setForm({ genderId: null, pronounId: null, sexualOrientation: [], matchGender: [], bio: '', interestTags: [] });
        setStep(1);
      } else {
        // All profiles created → go to Step 5
        setCreatedProfileTypes((prev) => [...prev, currentMatchMode.name]);
        setStep(5);
      }
      
    } catch (err) {
      Alert.alert('Error', err.message);
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
    const currentMode = matchModes.find((m) => m.id === selectedModes[currentModeIndex]);
    const isDating = currentMode?.name === 'Dating';

    switch (step) {
      case 0:
        return (
          <View>
            <Text style={styles.stepTitle}>What are you looking for?</Text>
            {matchModes.map((mode) => (
              <TouchableOpacity
                key={mode.id}
                onPress={() => toggleSelect(mode.id, selectedModes, setSelectedModes)}
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
                        onPress={() => toggleSelect(tag.id, form.interestTags, (val) => setForm({ ...form, interestTags: val }))}
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
        case 5:
          return (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Share Your Location</Text>
              <Text style={styles.subtitle}>
                Allow access to your location to find people nearby.
              </Text>
        
              
              <TouchableOpacity style={styles.shareLocationButton} onPress={handleShareLocation}>
                <Text style={styles.buttonText}>Share My Location</Text>
              </TouchableOpacity>

              <Text style={{ marginTop: 50, fontSize: 18, fontWeight: 'bold', color: '#000' }}>
  Match Range: <Text style={{ color: '#4CAF50', fontSize: 20, fontWeight: 'bold' }}>{matchRange} KM</Text>
</Text>

              <Slider
                style={{ width: '100%', height: 40 }}
                minimumValue={0}
                maximumValue={250}
                step={10}
                value={matchRange}
                onValueChange={(value) => setMatchRange(value)}
                minimumTrackTintColor="#4CAF50"
                maximumTrackTintColor="#DDD"
                thumbTintColor="#4CAF50"
              />
        
            </View>
          );
        
        case 6:
          return (
            <ScrollView>
              <Text style={styles.stepTitle}>Add Your Photos</Text>

              <View style={styles.dropdownWrapper}>
                {createdProfileTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setSelectedUploadProfileType(type)}
                    style={[
                      styles.optionButton,
                      selectedUploadProfileType === type && styles.selectedOption,
                    ]}
                  >
                    <Text style={selectedUploadProfileType === type ? styles.selectedText : styles.unselectedText}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

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

export default CreateProfilePage;
