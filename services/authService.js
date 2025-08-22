import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://api.matchaapp.net';

export async function getAccessToken() {
  const token = await AsyncStorage.getItem('accessToken');
  const expiresAt = await AsyncStorage.getItem('expiresAt');

  const now = Date.now();

  if (!token || !expiresAt || now > Number(expiresAt)) {
    console.log('🟡 Access token expired or missing. Refreshing...');
    return await refreshToken();
  }

  return token;
}

export async function refreshToken() {
  try {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token found');
    }

    const response = await fetch(`${API_BASE_URL}/api/Authentication/RefreshToken`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${refreshToken}`,
        'accept': 'text/plain',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Refresh token failed', data);
      throw new Error(data.errorMessages?.[0] || 'Failed to refresh token');
    }

    const { accessToken, refreshToken: newRefreshToken } = data.response;

    // Save new tokens
    await AsyncStorage.setItem('accessToken', accessToken);
    await AsyncStorage.setItem('refreshToken', newRefreshToken);

    // Save expiry time: token valid for 30 minutes (1800 seconds)
    const expiresAt = Date.now() + 1800 * 1000;
    await AsyncStorage.setItem('expiresAt', expiresAt.toString());

    console.log('🟢 Token refreshed successfully');

    return accessToken;
  } catch (err) {
    console.error('❌ Token refresh error:', err);
    throw err;
  }
}

export const checkAuthenticationWithProfileId = async () => {
  try {
    const [userData, token] = await Promise.all([
      AsyncStorage.getItem('user'),
      AsyncStorage.getItem('accessToken'),
    ]);

    if (!userData || !token) {
      console.log('Authentication check failed: Missing data');
      return { isAuthenticated: false };
    }

    const parsed = JSON.parse(userData);
    if (!parsed.profileId) {
      console.log('Authentication check failed: Missing profileId');
      return { isAuthenticated: false };
    }

    return {
      isAuthenticated: true,
      userData: parsed,
      token,
      profileId: parsed.profileId,
    };
  } catch (e) {
    console.error('Authentication parsing error:', e);
    return { isAuthenticated: false };
  }
};
