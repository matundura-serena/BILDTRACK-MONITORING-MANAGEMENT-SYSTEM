import AsyncStorage from '@react-native-async-storage/async-storage';

export const getAuthHeaders = async (headers = {}) => {
  const token = await AsyncStorage.getItem('auth_token');
  const authHeaders = {
    ...headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  
  // Log authentication headers for debugging
  if (__DEV__) {
    console.log('🔐 Auth Headers:', {
      hasToken: !!token,
      tokenPrefix: token ? `${token.substring(0, 20)}...` : 'null',
      authorization: authHeaders.Authorization || 'NOT SET',
    });
  }
  
  return authHeaders;
};

export const apiFetch = async (url, options = {}) => {
  const headers = await getAuthHeaders(options.headers || {});
  
  // Log API requests in development mode
  if (__DEV__) {
    let parsedBody;
    try {
      parsedBody = options.body ? JSON.parse(options.body) : undefined;
    } catch (e) {
      parsedBody = options.body || undefined;
    }
    console.log('🌐 API Request:', {
      url,
      method: options.method || 'GET',
      headers: {
        ...headers,
        Authorization: headers.Authorization ? 'Bearer [REDACTED]' : 'NOT SET',
      },
      body: parsedBody,
    });
  }
  
  const response = await fetch(url, { ...options, headers });
  
  // Log API responses in development mode
  if (__DEV__) {
    console.log('📥 API Response:', {
      url,
      status: response.status,
      statusText: response.statusText,
    });
  }
  
  return response;
};
