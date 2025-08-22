// utils/refreshTokenIfNeeded.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export const refreshTokenIfNeeded = async () => {
  try {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    if (!refreshToken) return;

    const response = await fetch('https://api.matchaapp.net/api/Authentication/RefreshToken', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${refreshToken}`,
        'accept': 'text/plain',
      },
    });

    const data = await response.json();
    if (response.ok && data.response) {
      await AsyncStorage.setItem('accessToken', data.response.accessToken);
      await AsyncStorage.setItem('refreshToken', data.response.refreshToken);
      console.log('🟢 Access Token refreshed');
    } else {
      console.log('🔴 Failed to refresh token');
    }
  } catch (err) {
    console.error('❌ Error refreshing token:', err);
  }
};
