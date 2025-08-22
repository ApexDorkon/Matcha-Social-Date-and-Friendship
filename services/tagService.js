// services/tagService.js
import { getToken } from './authService';

export const getAllInterestTags = async () => {
  const token = await getToken();
  const res = await fetch('https://api.matchaapp.net/api/Tag/GetAllInterestTags', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return await res.json();
};
