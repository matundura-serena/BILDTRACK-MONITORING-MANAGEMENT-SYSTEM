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
import { SafeAreaView } from 'react-native-safe-area-context'; // <-- Modern Safe Area Fix
import { Ionicons } from '@expo/vector-icons'; 
import { COLORS, FONTS, SIZES } from '../constants/theme';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { useAuth, USER_ROLES } from '../context/AuthContext';

export default function SignUpScreen({ navigation }) { // <-- Destructured navigation prop explicitly
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState(USER_ROLES.PROJECT_MANAGER);
  const { register, signupLoading } = useAuth();

  const handleSignUp = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Mismatch', 'Passwords do not match.');
      return;
    }

    const result = await register({ name, email, password, role });

    if (result.success) {
      Alert.alert('Account Created', 'Please sign in with your new account.', [
        { text: 'Sign In', onPress: () => navigation.navigate('SignIn') },
      ]);
    } else {
      Alert.alert('Registration Failed', result.message || 'Unable to create account.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          <View style={styles.headerContainer}>
            <Text style={styles.brandText}>
              BUILD<Text style={{ color: COLORS.primary }}>TRACK.</Text>
            </Text>
            <Text style={styles.welcomeTitle}>Create Account</Text>
            <Text style={styles.welcomeSubtitle}>Get started with your tracking workspace</Text>
          </View>

          <View style={styles.formContainer}>
            <CustomInput
              label="Full Name"
              placeholder="e.g. Serena Matundura"
              value={name}
              onChangeText={setName}
              icon={<Ionicons name="person-outline" size={20} color={COLORS.gray} />}
            />

            <CustomInput
              label="Email Address"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              icon={<Ionicons name="mail-outline" size={20} color={COLORS.gray} />}
            />

            <Text style={styles.roleLabel}>Role</Text>
            <View style={styles.roleGrid}>
              {[
                [USER_ROLES.ADMIN, 'Admin'],
                [USER_ROLES.PROJECT_MANAGER, 'Project Manager'],
                [USER_ROLES.SUPERVISOR, 'Supervisor'],
                [USER_ROLES.WORKER, 'Worker'],
              ].map(([value, label]) => (
                <TouchableOpacity
                  key={value}
                  style={[styles.roleChip, role === value && styles.roleChipActive]}
                  onPress={() => setRole(value)}
                >
                  <Text style={[styles.roleChipText, role === value && styles.roleChipTextActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <CustomInput
              label="Password"
              placeholder="Create strong password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              icon={<Ionicons name="lock-closed-outline" size={20} color={COLORS.gray} />}
            />

            <CustomInput
              label="Confirm Password"
              placeholder="Retype password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              icon={<Ionicons name="shield-checkmark-outline" size={20} color={COLORS.gray} />}
            />

            {signupLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>
            ) : (
              <CustomButton title="Sign Up" onPress={handleSignUp} style={styles.signUpButton} />
            )}
          </View>

          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
              <Text style={styles.signInText}>Sign in</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  scrollContainer: { flexGrow: 1, paddingHorizontal: SIZES.padding * 1.5, justifyContent: 'center', paddingVertical: 20 },
  headerContainer: { alignItems: 'center', marginBottom: 30 },
  brandText: { fontSize: 24, fontWeight: '800', color: COLORS.secondary, letterSpacing: 1, marginBottom: 15 },
  welcomeTitle: { ...FONTS.h1, marginBottom: 4 },
  welcomeSubtitle: { ...FONTS.body, color: COLORS.gray, textAlign: 'center' },
  formContainer: { width: '100%' },
  roleLabel: { ...FONTS.body, color: COLORS.secondary, fontWeight: '600', marginBottom: 10 },
  roleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  roleChip: { borderWidth: 1, borderColor: COLORS.lightGray, borderRadius: SIZES.radius, paddingHorizontal: 12, paddingVertical: 10 },
  roleChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  roleChipText: { ...FONTS.caption, color: COLORS.secondary, fontWeight: '600' },
  roleChipTextActive: { color: COLORS.white },
  signUpButton: { marginTop: 15 },
  loadingContainer: { height: 52, justifyContent: 'center', alignItems: 'center', marginTop: 15 },
  footerContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 30 },
  footerText: { ...FONTS.body, color: COLORS.gray },
  signInText: { ...FONTS.body, color: COLORS.primary, fontWeight: '600' }
});
