import React, { useState } from 'react';

import {

  View,

  Text,

  StyleSheet,

  ScrollView,

  Share,

  Alert,

} from 'react-native';

import QRCode from 'react-native-qrcode-svg';

import { useAttendance } from '../context/AttendanceContext';

import CustomButton from '../components/CustomButton';

import { COLORS, SIZES, FONTS, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';





const QRDisplayScreen = ({ route, navigation }) => {

  const { session } = route.params || {};

  const { currentSession } = useAttendance();

  

  const displaySession = session || currentSession;



  const handleShareToken = async () => {

    if (!displaySession?.session_token) return;



    try {

      await Share.share({

        message: `BuildTrack Attendance Session Token:\n\n${displaySession.session_token}\n\nScan this QR code to mark your attendance.`,

        title: 'Attendance Session Token',

      });

    } catch (error) {

      Alert.alert('Error', 'Failed to share token');

    }

  };



  const formatDate = (dateString) => {

    if (!dateString) return 'N/A';

    const date = new Date(dateString);

    return date.toLocaleDateString('en-US', {

      year: 'numeric',

      month: 'short',

      day: 'numeric',

    });

  };



  if (!displaySession) {

    return (

      <View style={styles.container}>

        <View style={styles.header}>

          <Text style={styles.title}>QR Code Display</Text>

        </View>

        <View style={styles.noSessionContainer}>

          <Text style={styles.noSessionText}>No active session found</Text>

          <CustomButton

            title="Go Back"

            onPress={() => navigation.goBack()}

            style={styles.backButton}

          />

        </View>

      </View>

    );

  }

  const qrPayload = {
    type: 'attendance',
    session_id: displaySession.id,
    project_id: displaySession.project_id,
    session_token: displaySession.session_token,
    session_date: displaySession.session_date,
    check_in_start: displaySession.check_in_start,
    check_in_end: displaySession.check_in_end,
    expires_at: displaySession.updated_at || new Date().toISOString(),
    generated_at: new Date().toISOString(),
  };



  return (

    <ScrollView style={styles.container}>

      <View style={styles.header}>

        <Text style={styles.title}>Attendance QR Code</Text>

        <Text style={styles.subtitle}>Share this with workers to scan</Text>

      </View>



      {/* Session Info Card */}

      <View style={styles.section}>

        <View style={styles.infoCard}>

          <Text style={styles.infoTitle}>Session Information</Text>

          

          <View style={styles.infoRow}>

            <Text style={styles.infoLabel}>Status:</Text>

            <View style={styles.statusBadge}>

              <Text style={styles.statusText}>{displaySession.status}</Text>

            </View>

          </View>



          <View style={styles.infoRow}>

            <Text style={styles.infoLabel}>Session Date:</Text>

            <Text style={styles.infoValue}>{formatDate(displaySession.session_date)}</Text>

          </View>


        </View>

      </View>



      {/* QR Code Placeholder */}
      {/* Actual QR Code */}

<View style={styles.section}>
  <View style={styles.qrCodeContainer}>

    <QRCode
      value={JSON.stringify(qrPayload)}
    />

   

    <Text style={styles.qrCodeNote}>
      Workers should scan this QR code using the BuildTrack mobile app.
    </Text>

  </View>
</View>


      {/* Token Display */}

      <View style={styles.section}>

        <View style={styles.tokenCard}>

          <Text style={styles.tokenTitle}>Session Token</Text>

          <View style={styles.tokenBox}>

            <Text style={styles.tokenText}>{displaySession.session_token}</Text>

          </View>

          <Text style={styles.tokenNote}>

            Workers can also manually enter this token if QR scanning is not available

          </Text>

        </View>

      </View>



      {/* Instructions */}

      <View style={styles.section}>

        <View style={styles.instructionsCard}>

          <Text style={styles.instructionsTitle}>How to Use</Text>

          <View style={styles.instructionItem}>

            <Text style={styles.instructionNumber}>1</Text>

            <Text style={styles.instructionText}>

              Share this QR code or token with workers

            </Text>

          </View>

          <View style={styles.instructionItem}>

            <Text style={styles.instructionNumber}>2</Text>

            <Text style={styles.instructionText}>

              Workers open the app and tap "Scan QR Code"

            </Text>

          </View>

          <View style={styles.instructionItem}>

            <Text style={styles.instructionNumber}>3</Text>

            <Text style={styles.instructionText}>

              They scan the QR code or enter the token manually

            </Text>

          </View>

          <View style={styles.instructionItem}>

            <Text style={styles.instructionNumber}>4</Text>

            <Text style={styles.instructionText}>

              Attendance is recorded with the worker name, date, and scan time

            </Text>

          </View>

        </View>

      </View>



      {/* Action Buttons */}

      <View style={styles.section}>

        <CustomButton

          title="Share Token"

          onPress={handleShareToken}

          style={styles.shareButton}

        />

        <CustomButton

          title="View Attendance"

          onPress={() => navigation.navigate('AttendanceDetails', { sessionId: displaySession.id })}

          style={styles.attendanceButton}

        />

        <CustomButton

          title="Back to Attendance"

          onPress={() => navigation.goBack()}

          style={styles.backButton}

        />

      </View>

    </ScrollView>

  );

};



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

    fontWeight: 'bold',

    color: COLORS.white,

    marginBottom: SIZES.xs,

  },

  subtitle: {

    fontSize: FONT_SIZES.sm,

    color: COLORS.white,

    opacity: 0.9,

  },

  section: {

    padding: SIZES.md,

  },

  noSessionContainer: {

    flex: 1,

    justifyContent: 'center',

    alignItems: 'center',

    padding: SIZES.xl,

  },

  noSessionText: {

    fontSize: FONT_SIZES.md,

    color: COLORS.textSecondary,

    marginBottom: SIZES.lg,

    textAlign: 'center',

  },

  infoCard: {

    backgroundColor: COLORS.white,

    borderRadius: BORDER_RADIUS.md,

    padding: SIZES.lg,

    shadowColor: COLORS.shadow,

    shadowOffset: { width: 0, height: 2 },

    shadowOpacity: 0.1,

    shadowRadius: 4,

    elevation: 3,

  },

  infoTitle: {

    fontSize: FONT_SIZES.lg,

    fontWeight: 'bold',

    color: COLORS.text,

    marginBottom: SIZES.md,

  },

  infoRow: {

    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'center',

    paddingVertical: SIZES.sm,

    borderBottomWidth: 1,

    borderBottomColor: COLORS.border,

  },

  infoLabel: {

    fontSize: FONT_SIZES.md,

    color: COLORS.textSecondary,

  },

  infoValue: {

    fontSize: FONT_SIZES.md,

    fontWeight: '600',

    color: COLORS.text,

  },

  statusBadge: {

    backgroundColor: COLORS.success + '20',

    paddingHorizontal: SIZES.md,

    paddingVertical: SIZES.xs,

    borderRadius: BORDER_RADIUS.sm,

  },

  statusText: {

    color: COLORS.success,

    fontWeight: '600',

    fontSize: FONT_SIZES.sm,

  },

  
  qrCodeContainer: {
  backgroundColor: COLORS.white,
  borderRadius: BORDER_RADIUS.lg,
  padding: 25,
  alignItems: 'center',
  justifyContent: 'center',
  shadowColor: '#000',
  shadowOpacity: 0.15,
  shadowRadius: 8,
  elevation: 5,
},


  
  qrCodeNote: {

    fontSize: FONT_SIZES.xs,

    color: COLORS.textSecondary,

    textAlign: 'center',

    fontStyle: 'italic',

  },

  tokenCard: {

    backgroundColor: COLORS.white,

    borderRadius: BORDER_RADIUS.md,

    padding: SIZES.lg,

    shadowColor: COLORS.shadow,

    shadowOffset: { width: 0, height: 2 },

    shadowOpacity: 0.1,

    shadowRadius: 4,

    elevation: 3,

  },

  tokenTitle: {

    fontSize: FONT_SIZES.md,

    fontWeight: '600',

    color: COLORS.text,

    marginBottom: SIZES.md,

  },

  tokenBox: {

    backgroundColor: COLORS.background,

    padding: SIZES.md,

    borderRadius: BORDER_RADIUS.sm,

    borderWidth: 1,

    borderColor: COLORS.border,

    marginBottom: SIZES.sm,

  },

  tokenText: {

    fontSize: FONT_SIZES.sm,

    fontWeight: '600',

    color: COLORS.primary,

    fontFamily: 'monospace',

    textAlign: 'center',

  },

  tokenNote: {

    fontSize: FONT_SIZES.xs,

    color: COLORS.textSecondary,

    textAlign: 'center',

    fontStyle: 'italic',

  },

  instructionsCard: {

    backgroundColor: COLORS.white,

    borderRadius: BORDER_RADIUS.md,

    padding: SIZES.lg,

    shadowColor: COLORS.shadow,

    shadowOffset: { width: 0, height: 2 },

    shadowOpacity: 0.1,

    shadowRadius: 4,

    elevation: 3,

  },

  instructionsTitle: {

    fontSize: FONT_SIZES.lg,

    fontWeight: 'bold',

    color: COLORS.text,

    marginBottom: SIZES.md,

  },

  instructionItem: {

    flexDirection: 'row',

    alignItems: 'flex-start',

    marginBottom: SIZES.md,

  },

  instructionNumber: {

    width: 28,

    height: 28,

    borderRadius: 14,

    backgroundColor: COLORS.primary,

    color: COLORS.white,

    fontWeight: 'bold',

    fontSize: FONT_SIZES.sm,

    textAlign: 'center',

    lineHeight: 28,

    marginRight: SIZES.md,

  },

  instructionText: {

    flex: 1,

    fontSize: FONT_SIZES.md,

    color: COLORS.text,

    lineHeight: 20,

    paddingTop: SIZES.xs,

  },

  shareButton: {

    backgroundColor: COLORS.primary,

    marginBottom: SIZES.sm,

  },

  attendanceButton: {

    backgroundColor: COLORS.secondary,

    marginBottom: SIZES.sm,

  },

  backButton: {

    backgroundColor: COLORS.textSecondary,

  },

});



export default QRDisplayScreen;
