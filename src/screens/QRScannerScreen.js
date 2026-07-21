import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {
  CameraView,
  useCameraPermissions,
} from 'expo-camera';

import { useAttendance } from '../context/AttendanceContext';
import { useAuth } from '../context/AuthContext';
import { COLORS, SIZES, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function QRScannerScreen({ navigation }) {

  // ✅ Correct Hook usage
  const [permission, requestPermission] = useCameraPermissions();

  const { scanAttendance } = useAttendance();
  const { user } = useAuth();

  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scanType, setScanType] = useState('check_in');

  // Request permission once
  useEffect(() => {
    if (!permission) return;

    if (!permission.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = async ({ data }) => {

    if (loading || scanned) return;

    setScanned(true);
    setLoading(true);

    try {

      let sessionToken = data;
      let parsedQR = null;

      // Log raw QR data
      console.log('🔍 Raw QR Data:', data);
      console.log('👤 Current User:', user);

      // Try to parse QR as JSON
      try {
        parsedQR = JSON.parse(data);
        console.log('📦 Parsed QR Payload:', parsedQR);

        // Extract session token from various possible fields
        sessionToken = parsedQR.session_token || parsedQR.token || data;

        // Validate required fields
        if (!sessionToken || sessionToken === data) {
          throw new Error('Invalid QR: Missing session_token');
        }

        console.log('✅ Extracted Session Token:', sessionToken);

      } catch (error) {
        console.error('❌ QR Parse Error:', error.message);

        // If it's not JSON, treat the raw data as the token
        if (error.message.includes('Invalid QR')) {
          throw new Error('Invalid QR Code: Missing required session_token field');
        }
        sessionToken = data;
      }

      const scannedAt = new Date();
      const workerName = user?.name || 'Worker';

      console.log('========== CURRENT USER ==========');
      console.log(user);
      console.log('Role:', user?.role);
      console.log('Worker ID:', user?.worker_id);
      console.log('Token exists:', !!user?.token);
      console.log('=================================');

      console.log('📤 Sending Attendance Request:', {
        session_token: sessionToken,
        scan_type: scanType,
        worker_name: workerName,
        worker_id: user?.worker_id,
        scan_date: scannedAt.toISOString().split('T')[0],
        scanned_at: scannedAt.toISOString(),
      });

      const result = await scanAttendance(sessionToken, {
        scan_type: scanType,
        worker_name: workerName,
        scan_date: scannedAt.toISOString().split('T')[0],
        scanned_at: scannedAt.toISOString(),
      });

      const attendance = result?.attendance || result?.data || result;
      const recordedAt =
        result?.recorded_at ||
        (scanType === 'check_out'
          ? attendance?.check_out_time
          : attendance?.check_in_time) ||
        scannedAt.toISOString();
      const formattedTime = new Date(recordedAt).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      const welcomeName = result?.worker_name || workerName;
      const actionText = scanType === 'check_out' ? 'checked out' : 'checked in';

      Alert.alert(
        `Welcome, ${welcomeName}`,
        `You have ${actionText} at ${formattedTime}.`,
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );

    } catch (err) {

      console.error('❌ Attendance Scan Error:', err.message);

      // Provide user-friendly error messages
      let errorMessage = err.message || "Unable to record attendance.";

      // Clean up technical error messages for users
      if (errorMessage.includes('UNAUTHORIZED')) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (errorMessage.includes('INVALID_QR_CODE')) {
        errorMessage = 'Invalid QR Code. Please scan a valid attendance QR code.';
      } else if (errorMessage.includes('SESSION_INACTIVE')) {
        errorMessage = 'This attendance session is no longer active.';
      } else if (errorMessage.includes('ALREADY_CHECKED_IN')) {
        errorMessage = 'You have already checked in for this session.';
      } else if (errorMessage.includes('WORKER_NOT_FOUND')) {
        errorMessage = 'Worker account not found. Please contact administrator.';
      }

      Alert.alert(
        "Scan Failed",
        errorMessage,
        [
          {
            text: "Scan Again",
            onPress: () => setScanned(false),
          },
          {
            text: "Cancel",
            onPress: () => navigation.goBack(),
          },
        ]
      );

    } finally {

      setLoading(false);

    }

  };

  // Loading permission

  if (!permission) {

    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text>Loading camera...</Text>
      </View>
    );

  }

  // Permission denied

  if (!permission.granted) {

    return (

      <View style={styles.center}>

        <Text style={styles.errorText}>
          Camera permission is required to scan attendance QR codes.
        </Text>

        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionText}>
            Grant Camera Permission
          </Text>
        </TouchableOpacity>

      </View>

    );

  }

  return (

    <View style={styles.container}>

      <View style={styles.header}>

        <Text style={styles.title}>
          Scan Attendance QR
        </Text>

        <Text style={styles.subtitle}>
          Select your action, then position the QR code inside the frame
        </Text>

      </View>

      <View style={styles.scanTypeContainer}>
        <TouchableOpacity
          style={[
            styles.scanTypeButton,
            scanType === 'check_in' && styles.scanTypeButtonActive,
          ]}
          onPress={() => setScanType('check_in')}
          disabled={loading}
        >
          <Text
            style={[
              styles.scanTypeText,
              scanType === 'check_in' && styles.scanTypeTextActive,
            ]}
          >
            Check In
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.scanTypeButton,
            scanType === 'check_out' && styles.scanTypeButtonActive,
          ]}
          onPress={() => setScanType('check_out')}
          disabled={loading}
        >
          <Text
            style={[
              styles.scanTypeText,
              scanType === 'check_out' && styles.scanTypeTextActive,
            ]}
          >
            Check Out
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cameraContainer}>

        <CameraView
          style={styles.camera}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
          onBarcodeScanned={
            scanned ? undefined : handleBarCodeScanned
          }
        />

        <View
          pointerEvents="none"
          style={styles.overlay}
        >
          <View style={styles.frame} />
        </View>

      </View>

      {loading && (

        <View style={styles.loadingOverlay}>

          <ActivityIndicator
            size="large"
            color={COLORS.primary}
          />

          <Text style={styles.loadingText}>
            Processing Attendance...
          </Text>

        </View>

      )}

      {scanned && !loading && (

        <TouchableOpacity
          style={styles.scanAgainButton}
          onPress={() => setScanned(false)}
        >
          <Text style={styles.scanAgainText}>
            Scan Another QR Code
          </Text>
        </TouchableOpacity>

      )}

    </View>

  );

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    padding: SIZES.lg,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },

  title: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.white,
    fontWeight: 'bold',
  },

  subtitle: {
    marginTop: 5,
    color: COLORS.white,
    opacity: 0.9,
  },

  camera: {
    flex: 1,
  },

  scanTypeContainer: {
    flexDirection: 'row',
    padding: SIZES.md,
    gap: SIZES.sm,
    backgroundColor: COLORS.white,
  },

  scanTypeButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },

  scanTypeButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },

  scanTypeText: {
    color: COLORS.text,
    fontWeight: '600',
  },

  scanTypeTextActive: {
    color: COLORS.white,
  },

  cameraContainer: {
    flex: 1,
    position: 'relative',
  },

  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },

  frame: {
    width: width * 0.7,
    height: width * 0.7,
    borderWidth: 3,
    borderRadius: BORDER_RADIUS.md,
    borderColor: COLORS.white,
  },

  loadingOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },

  loadingText: {
    color: COLORS.white,
    marginTop: 12,
    fontSize: FONT_SIZES.md,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },

  errorText: {
    textAlign: 'center',
    color: COLORS.error,
    marginBottom: 20,
    fontSize: FONT_SIZES.md,
  },

  permissionButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 10,
  },

  permissionText: {
    color: COLORS.white,
    fontWeight: '600',
  },

  scanAgainButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },

  scanAgainText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },

});
