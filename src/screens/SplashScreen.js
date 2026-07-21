import React, { useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ImageBackground, 
  StatusBar 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useDashboard } from '../context/DashboardContext';

export default function SplashScreen() {
  const navigation = useNavigation();
  const { authenticated, loading } = useAuth();
  const { loadDashboard } = useDashboard();

  useEffect(() => {
    // Splash should not own the auth redirect.
    // Navigation decisions are handled by the auth-aware root routing.
    console.log('🧭 SplashScreen mounted', { authenticated, loading });

    // Keep optional side-effect: preload dashboard when already authenticated.
    // Never block navigation.
    let cancelled = false;
    (async () => {
      if (authenticated) {
        try {
          await loadDashboard();
        } catch (e) {
          if (!cancelled) {
            console.error('❌ Dashboard init failed during splash:', e?.message || e);
          }
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authenticated, loadDashboard]);


  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ImageBackground 
        source={require('../../assets/images/splash_bg.png')} 
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <View style={styles.brandContainer}>
            <Text style={styles.brandText}>
              BUILD<Text style={{ color: COLORS.primary }}>TRACK.</Text>
            </Text>
            <Text style={styles.subtitleText}>
              Construction Monitoring & Management System
            </Text>
          </View>

          <View style={styles.footerContainer}>
            <Text style={styles.taglineText}>Build Better</Text>
            <Text style={styles.taglineText}>Track smarter</Text>
            <Text style={styles.taglineText}>Deliver on time</Text>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundImage: { flex: 1, width: '100%', height: '100%' },
  overlay: { flex: 1, backgroundColor: 'rgba(26, 29, 36, 0.75)', justifyContent: 'space-between', paddingHorizontal: 40, paddingTop: '50%', paddingBottom: 60 },
  brandContainer: { alignItems: 'flex-start' },
  brandText: { fontSize: 34, fontWeight: '900', color: COLORS.white, letterSpacing: 1.5, marginBottom: 8 },
  subtitleText: { ...FONTS.body, color: COLORS.lightGray, fontSize: 16, fontWeight: '300', lineHeight: 22, maxWidth: '80%' },
  footerContainer: { alignItems: 'flex-start', borderLeftWidth: 3, borderLeftColor: COLORS.primary, paddingLeft: 16 },
  taglineText: { fontSize: 18, fontWeight: '500', color: COLORS.white, lineHeight: 26, letterSpacing: 0.5 }
});