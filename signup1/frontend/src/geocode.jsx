// src/utils/geocode.js
import axios from 'axios';

const GEOCODE_API_KEY = 'a3c56f158ba84f20a06b693d285e3df5'; // Replace with your actual API key

export const geocodeAddress = async (address) => {
  try {
    const response = await axios.get('https://api.opencagedata.com/geocode/v1/json', { 
      params: {
        q: address,
        key: GEOCODE_API_KEY,
        limit: 1,
        no_annotations: 1,
      },
    });

    const result = response.data.results[0];
    if (result) {
      const { lat, lng } = result.geometry;
      return { lat, lng };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};
