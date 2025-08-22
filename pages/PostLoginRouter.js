// pages/PostLoginRouter.js
import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PostLoginRouter = ({ navigation }) => {
  useEffect(() => {
    const checkAndRedirect = async () => {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!accessToken) return navigation.navigate('LoginPage');

      try {
        const response = await fetch('https://api.matchaapp.net/api/Profile/GetLoggedInUserProfileState', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        const profile = data.response;

        if (!profile) throw new Error('No profile data returned.');

        const hasAnyProfile =
          profile.isDatingProfileCreated ||
          profile.isCasualProfileCreated ||
          profile.isBusinessProfileCreated ||
          profile.isStudyProfileCreated ||
          profile.isSportsProfileCreated;

        if (hasAnyProfile) {
          navigation.replace('MatchaPage');
        } else {
          navigation.replace('CreateProfilePage');
        }
      } catch (err) {
        console.error('Profile check error:', err);
        Alert.alert('Error', 'Could not check profile.');
        await AsyncStorage.removeItem('accessToken');
        navigation.reset({
          index: 0,
          routes: [{ name: 'LoginPage' }],
        });
      }
    };

    checkAndRedirect();
  }, []);

  return null; // Optionally replace with splash screen later
};

export default PostLoginRouter;
