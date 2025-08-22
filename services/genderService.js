// services/genderService.js
import { getToken } from './authService';

export const getPronouns = async () => {
  const token = await getToken();
  const res = await fetch('https://api.matchaapp.net/api/GenderSexualOrientationPronoun/GetAllPronouns', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return await res.json();
};

export const getGenders = async (isDating = false) => {
  const token = await getToken();
  const url = isDating
    ? 'https://api.matchaapp.net/api/GenderSexualOrientationPronoun/GetAllDatingModeGenders'
    : 'https://api.matchaapp.net/api/GenderSexualOrientationPronoun/GetAllOtherModeGenders';
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return await res.json();
};

export const getSexualOrientations = async () => {
  const token = await getToken();
  const res = await fetch('https://api.matchaapp.net/api/GenderSexualOrientationPronoun/GetAllSexualOrientations', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return await res.json();
};
