import { getToken } from './authService';

const BASE = 'https://api.matchaapp.net';

export const createProfile = async (type, data) => {
  const endpoints = {
    Dating: '/api/Profile/CreateDatingProfile',
    Casual: '/api/Profile/CreateCasualProfile',
    Business: '/api/Profile/CreateBusinessProfile',
    Sports: '/api/Profile/CreateSportsProfile',
    Study: '/api/Profile/CreateStudyProfile',
  };

  const token = await getToken();

  return fetch(`${BASE}${endpoints[type]}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
};
