import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { useNavigation } from '@react-navigation/native'; 
import { Ionicons, FontAwesome5 } from '@expo/vector-icons'; 
import { COLORS, FONTS, SIZES } from '../constants/theme';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { useAuth } from '../context/AuthContext';

export default function SignInScreen() {
  const navigation = useNavigation(); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loginLoading } = useAuth();

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Required Fields', 'Please fill in both your email address and password.');
      return;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    try {
      const result = await login(email, password);
      
      if (result.success) {
        // Login successful - navigation will be handled by AppNavigator
        console.log('✅ Sign in successful');
      } else {
        Alert.alert('Login Failed', result.message || 'Invalid credentials');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
      console.error('❌ Sign in error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Header/Branding Section */}
          <View style={styles.headerContainer}>
            <Text style={styles.brandText}>
              BUILD<Text style={{ color: COLORS.primary }}>TRACK.</Text>
            </Text>
            <Text style={styles.welcomeTitle}>Welcome Back!</Text>
            <Text style={styles.welcomeSubtitle}>Sign in to your account</Text>
          </View>

          {/* Form Input Section */}
          <View style={styles.formContainer}>
            <CustomInput
              label="Email Address"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              icon={<Ionicons name="mail-outline" size={20} color={COLORS.gray} />}
            />

            <CustomInput
              label="Password"
              placeholder="Enter your password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              icon={<Ionicons name="lock-closed-outline" size={20} color={COLORS.gray} />}
            />

            <TouchableOpacity 
              activeOpacity={0.7} 
              style={styles.forgotPasswordContainer}
              onPress={() => Alert.alert('Reset Password', 'A reset link will be sent to your email.')}
            >
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>

            {loginLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>
            ) : (
              <CustomButton 
                title="Sign in" 
                onPress={handleSignIn} 
                style={styles.signInButton}
              />
            )}
          </View>

          {/* Divider Line */}
          <View style={styles.dividerContainer}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.line} />
          </View>

          {/* OAuth Social Buttons */}
          <View style={styles.oauthContainer}>
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
              <FontAwesome5 name="google" size={18} color="#EA4335" style={{ marginRight: 10 }} />
              <Text style={styles.socialButtonText}>Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
              <View style={styles.microsoftIconMock} />
              <Text style={styles.socialButtonText}>Microsoft</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Navigation Sign Up Link */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => {
              console.log("Sign up clicked! Redirecting cleanly to 'SignUp'...");
              navigation.navigate('SignUp');
            }}>
              <Text style={styles.signUpText}>Sign up</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.copyrightText}>BuildTrack. All rights reserved</Text>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  scrollContainer: { flexGrow: 1, paddingHorizontal: SIZES.padding * 1.5, justifyContent: 'center', paddingBottom: 20 },
  headerContainer: { alignItems: 'center', marginBottom: 40, marginTop: 20 },
  brandText: { fontSize: 24, fontWeight: '800', color: COLORS.secondary, letterSpacing: 1, marginBottom: 24 },
  welcomeTitle: { ...FONTS.h1, marginBottom: 4 },
  welcomeSubtitle: { ...FONTS.body, color: COLORS.gray },
  formContainer: { width: '100%' },
  forgotPasswordContainer: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotPasswordText: { ...FONTS.caption, color: COLORS.primary, fontWeight: '600' },
  signInButton: { marginTop: 10 },
  loadingContainer: { height: 52, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 30 },
  line: { flex: 1, height: 1, backgroundColor: COLORS.lightGray },
  dividerText: { ...FONTS.body, color: COLORS.gray, marginHorizontal: 15 },
  oauthContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 40 },
  socialButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flex: 0.47, height: 48, borderWidth: 1, borderColor: COLORS.lightGray, borderRadius: SIZES.radius, backgroundColor: COLORS.white },
  socialButtonText: { ...FONTS.body, fontWeight: '500', color: COLORS.secondary },
  microsoftIconMock: { width: 16, height: 16, backgroundColor: '#00A4EF', marginRight: 10 },
  footerContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
  footerText: { ...FONTS.body, color: COLORS.gray },
  signUpText: { ...FONTS.body, color: COLORS.primary, fontWeight: '600' },
  copyrightText: { ...FONTS.caption, textAlign: 'center', color: COLORS.gray, fontSize: 11 }
});
