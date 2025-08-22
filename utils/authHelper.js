import AsyncStorage from '@react-native-async-storage/async-storage';

export const checkAuthentication = async () => {
  try {
    const [userData, token, profileId] = await Promise.all([
      AsyncStorage.getItem('user'),
      AsyncStorage.getItem('accessToken'),
      AsyncStorage.getItem('activeProfileId') // new addition
    ]);

    if (!userData || !token || !profileId) {
      console.log('Authentication check failed: Missing data');
      return { isAuthenticated: false, userData: null, token: null, profileId: null };
    }

    const parsedUser = JSON.parse(userData);
    return {
      isAuthenticated: true,
      userData: parsedUser,
      token,
      profileId: Number(profileId)
    };
  } catch (error) {
    console.error('Error checking authentication:', error);
    return { isAuthenticated: false, userData: null, token: null, profileId: null };
  }
};

export const saveAuthData = async (userData, token, profileId) => {
  try {
    await Promise.all([
      AsyncStorage.setItem('user', JSON.stringify(userData)),
      AsyncStorage.setItem('accessToken', token),
      AsyncStorage.setItem('activeProfileId', profileId.toString())
    ]);
    return true;
  } catch (err) {
    console.error("Failed to save auth data:", err);
    return false;
  }
};

export const clearAuthData = async () => {
  try {
    await Promise.all([
      AsyncStorage.removeItem('user'),
      AsyncStorage.removeItem('accessToken'),
      AsyncStorage.removeItem('activeProfileId')
    ]);
    console.log('Auth data cleared');
    return true;
  } catch (err) {
    console.error('Failed to clear auth data:', err);
    return false;
  }
};