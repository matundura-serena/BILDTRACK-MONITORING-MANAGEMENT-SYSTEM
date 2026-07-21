import React, { useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../config/apiConfig';
import { COLORS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/apiClient';

const PREFERENCES_KEY = 'profile_preferences';

const DEFAULT_PREFERENCES = {
  pushNotifications: true,
  attendanceReminders: true,
  taskUpdates: true,
  compactMode: false,
  biometricLogin: false,
};

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [activePanel, setActivePanel] = useState(null);
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const roleLabel = {
    admin: 'Admin',
    project_manager: 'Project Manager',
    supervisor: 'Supervisor',
    worker: 'Worker',
  }[user?.role] || 'User';

  const initials = (user?.name || user?.email || 'BT')
    .split(/\s|@/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const stored = await AsyncStorage.getItem(PREFERENCES_KEY);
        if (stored) {
          setPreferences({ ...DEFAULT_PREFERENCES, ...JSON.parse(stored) });
        }
      } catch (error) {
        console.log('Failed to load profile preferences:', error.message);
      }
    };

    loadPreferences();
  }, []);

  const savePreferences = async (nextPreferences) => {
    setPreferences(nextPreferences);
    await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(nextPreferences));
  };

  const togglePreference = async (key) => {
    const nextPreferences = {
      ...preferences,
      [key]: !preferences[key],
    };
    await savePreferences(nextPreferences);
  };

  const togglePanel = (panel) => {
    setActivePanel((current) => (current === panel ? null : panel));
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Required Fields', 'Please fill in all password fields.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Weak Password', 'New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Password Mismatch', 'New password and confirmation do not match.');
      return;
    }

    try {
      setPasswordLoading(true);

      const response = await apiFetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Unable to change password.');
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setActivePanel(null);
      Alert.alert('Password Updated', data.message || 'Your password has been changed.');
    } catch (error) {
      Alert.alert('Password Change Failed', error.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const openSupportEmail = async () => {
    const subject = encodeURIComponent('BuildTrack Support Request');
    const body = encodeURIComponent(`Hello BuildTrack Support,\n\nAccount: ${user?.email || 'N/A'}\nRole: ${roleLabel}\n\nIssue:\n`);
    const url = `mailto:support@buildtrack.local?subject=${subject}&body=${body}`;

    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
      return;
    }

    Alert.alert('Support', 'Email support at support@buildtrack.local');
  };

  const menuOptions = [
    { id: 'password', label: 'Change Password', icon: 'lock-closed-outline' },
    { id: 'notifications', label: 'Notifications', icon: 'notifications-outline' },
    { id: 'settings', label: 'App Settings', icon: 'settings-outline' },
    { id: 'support', label: 'Help & Support', icon: 'help-circle-outline' },
  ];

  const renderToggleRow = (label, description, value, onPress) => (
    <View style={styles.toggleRow}>
      <View style={styles.toggleCopy}>
        <Text style={styles.toggleLabel}>{label}</Text>
        <Text style={styles.toggleDescription}>{description}</Text>
      </View>
      <Switch value={value} onValueChange={onPress} trackColor={{ true: COLORS.primary + '55' }} thumbColor={value ? COLORS.primary : '#F4F4F5'} />
    </View>
  );

  const renderPanel = () => {
    switch (activePanel) {
      case 'password':
        return (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Change Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Current password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="New password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.primaryButton} onPress={handleChangePassword} disabled={passwordLoading}>
              <Text style={styles.primaryButtonText}>{passwordLoading ? 'Updating...' : 'Update Password'}</Text>
            </TouchableOpacity>
          </View>
        );

      case 'notifications':
        return (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Notifications</Text>
            {renderToggleRow('Push Notifications', 'Receive important account and site updates.', preferences.pushNotifications, () => togglePreference('pushNotifications'))}
            {renderToggleRow('Attendance Reminders', 'Get reminders for QR check-in and check-out windows.', preferences.attendanceReminders, () => togglePreference('attendanceReminders'))}
            {renderToggleRow('Task Updates', 'Notify you when assigned work changes.', preferences.taskUpdates, () => togglePreference('taskUpdates'))}
          </View>
        );

      case 'settings':
        return (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>App Settings</Text>
            {renderToggleRow('Compact Mode', 'Use tighter spacing on dashboard and profile screens.', preferences.compactMode, () => togglePreference('compactMode'))}
            {renderToggleRow('Biometric Login', 'Prepare this account for device biometric unlock.', preferences.biometricLogin, () => togglePreference('biometricLogin'))}
            <Text style={styles.panelNote}>These preferences are saved on this device.</Text>
          </View>
        );

      case 'support':
        return (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Help & Support</Text>
            <Text style={styles.supportText}>For account, QR attendance, or role access issues, contact BuildTrack support with your account email and role.</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={openSupportEmail}>
              <Text style={styles.primaryButtonText}>Email Support</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => Alert.alert('BuildTrack Help', 'Check that you are signed in with the correct role and that your backend server is running.')}>
              <Text style={styles.secondaryButtonText}>View Quick Help</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.orangeBanner}>
          <Ionicons name="business" size={80} color="rgba(255,255,255,0.15)" style={styles.bgBrandingIcon} />
        </View>

        <View style={styles.profileHeaderCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials || 'BT'}</Text>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={14} color={COLORS.primary} />
            </View>
          </View>
          <Text style={styles.userName}>{user?.name || user?.email || 'BuildTrack User'}</Text>
          <Text style={styles.userRole}>{roleLabel}</Text>
        </View>

        <View style={styles.accountCard}>
          <Text style={styles.accountTitle}>Account Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Name</Text>
            <Text style={styles.detailValue}>{user?.name || 'Not provided'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Email</Text>
            <Text style={styles.detailValue}>{user?.email || 'Not provided'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Role</Text>
            <Text style={styles.detailValue}>{roleLabel}</Text>
          </View>
          {user?.worker_id ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Worker ID</Text>
              <Text style={styles.detailValue}>{user.worker_id}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.menuContainer}>
          {menuOptions.map((item) => (
            <TouchableOpacity key={item.id} style={styles.menuRow} activeOpacity={0.7} onPress={() => togglePanel(item.id)}>
              <View style={styles.rowLeft}>
                <Ionicons name={item.icon} size={20} color={COLORS.secondary} style={{ marginRight: 12 }} />
                <Text style={styles.rowLabel}>{item.label}</Text>
              </View>
              <Ionicons name={activePanel === item.id ? 'chevron-down' : 'chevron-forward'} size={16} color={COLORS.gray} />
            </TouchableOpacity>
          ))}

          {renderPanel()}

          <TouchableOpacity style={[styles.menuRow, styles.logoutRow]} onPress={logout}>
            <View style={styles.rowLeft}>
              <Ionicons name="log-out-outline" size={20} color="#EA4335" style={{ marginRight: 12 }} />
              <Text style={[styles.rowLabel, { color: '#EA4335', fontWeight: '700' }]}>Logout</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  orangeBanner: { backgroundColor: '#FF6D00', height: 140, position: 'relative', justifyContent: 'center', alignItems: 'center' },
  bgBrandingIcon: { position: 'absolute', right: -10, top: 10 },
  profileHeaderCard: { alignItems: 'center', marginTop: -50, marginBottom: 20 },
  avatarCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', position: 'relative', borderWidth: 3, borderColor: COLORS.white },
  avatarText: { fontSize: 28, fontWeight: '800', color: COLORS.secondary },
  verifiedBadge: { position: 'absolute', bottom: 2, right: 2, backgroundColor: COLORS.white, borderRadius: 10, padding: 2 },
  userName: { fontSize: 18, fontWeight: '700', color: COLORS.secondary, marginTop: 12 },
  userRole: { fontSize: 13, color: COLORS.gray, marginTop: 2 },
  accountCard: { backgroundColor: COLORS.white, marginHorizontal: 16, marginBottom: 16, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#ECEFF1' },
  accountTitle: { fontSize: 15, fontWeight: '800', color: COLORS.secondary, marginBottom: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#F1F3F4' },
  detailLabel: { fontSize: 13, color: COLORS.gray, fontWeight: '600' },
  detailValue: { flex: 1, textAlign: 'right', fontSize: 13, color: COLORS.secondary, fontWeight: '700', marginLeft: 12 },
  menuContainer: { backgroundColor: COLORS.white, marginHorizontal: 16, marginBottom: 24, borderRadius: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#ECEFF1', overflow: 'hidden' },
  menuRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F1F3F4' },
  logoutRow: { borderBottomWidth: 0, marginTop: 10 },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  rowLabel: { fontSize: 14, color: COLORS.secondary, fontWeight: '500' },
  panel: { padding: 16, backgroundColor: '#FAFAFA', borderBottomWidth: 1, borderBottomColor: '#F1F3F4' },
  panelTitle: { fontSize: 15, fontWeight: '800', color: COLORS.secondary, marginBottom: 12 },
  input: { minHeight: 46, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 12, marginBottom: 10, backgroundColor: COLORS.white, color: COLORS.secondary },
  primaryButton: { minHeight: 46, borderRadius: 8, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  primaryButtonText: { color: COLORS.white, fontSize: 14, fontWeight: '800' },
  secondaryButton: { minHeight: 44, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center', marginTop: 10, backgroundColor: COLORS.white },
  secondaryButtonText: { color: COLORS.secondary, fontSize: 14, fontWeight: '700' },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EFEFEF' },
  toggleCopy: { flex: 1, paddingRight: 12 },
  toggleLabel: { fontSize: 14, color: COLORS.secondary, fontWeight: '700' },
  toggleDescription: { fontSize: 12, color: COLORS.gray, marginTop: 3, lineHeight: 17 },
  panelNote: { fontSize: 12, color: COLORS.gray, marginTop: 12, lineHeight: 18 },
  supportText: { fontSize: 13, color: COLORS.gray, lineHeight: 19, marginBottom: 8 },
});
