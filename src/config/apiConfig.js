import { Platform } from 'react-native';

const getBackendUrl = () => {
  try {
    // Use the development machine's LAN IP for Expo Go on Android devices.
    if (Platform.OS === 'android') {
      return 'http://192.168.1.100:5000';
    }
    
    // iOS Simulators and Web browsers use standard localhost channels
    return 'http://localhost:5000';
  } catch (e) {
    // Extreme fallback protection to ensure it never returns undefined
    return 'http://localhost:5000';
  }
};

export const API_BASE_URL = getBackendUrl().trim();

console.log('📱 Expo Go Routing to Backend at:', API_BASE_URL);

export default API_BASE_URL;
