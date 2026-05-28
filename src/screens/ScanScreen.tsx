import React, { useRef, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { Colors, Radius } from '../utils/theme';
import { ocrService } from '../services/ocrService';

export default function ScanScreen() {
  const nav = useNavigation<any>();
  const [permission, requestPermission] = useCameraPermissions();
  const [processing, setProcessing] = useState(false);
  const [torch, setTorch] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, []);

  const process = async (uri: string) => {
    setProcessing(true);
    try {
      const data = await ocrService.extractReceipt(uri);
      nav.navigate('InvoiceEditor', { receiptData: data });
    } catch {
      Alert.alert('Error', 'Could not read receipt. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const onCapture = async () => {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
    if (photo?.uri) await process(photo.uri);
  };

  const onPickGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      await process(result.assets[0].uri);
    }
  };

  if (!permission?.granted) {
    return (
      <View style={styles.permBox}>
        <Text style={styles.permIcon}>📷</Text>
        <Text style={styles.permTitle}>Camera permission needed</Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Grant permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        enableTorch={torch}
        facing="back"
      />
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>Scan Receipt</Text>
        <TouchableOpacity onPress={() => setTorch(t => !t)}>
          <Text style={styles.flashBtn}>{torch ? '⚡' : '🔦'}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.frameWrap}>
        <View style={styles.frame}>
          <View style={[styles.corner, styles.tl]} />
          <View style={[styles.corner, styles.tr]} />
          <View style={[styles.corner, styles.bl]} />
          <View style={[styles.corner, styles.br]} />
        </View>
        <Text style={styles.hint}>Position receipt within the frame</Text>
      </View>
      <View style={styles.controls}>
        <TouchableOpacity style={styles.sideBtn} onPress={onPickGallery} disabled={processing}>
          <Text style={styles.sideBtnIcon}>🖼️</Text>
          <Text style={styles.sideBtnLabel}>Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shutter} onPress={onCapture} disabled={processing}>
          <View style={styles.shutterInner} />
        </TouchableOpacity>
        <View style={styles.sideBtn} />
      </View>
      {processing && (
        <View style={styles.processingOverlay}>
          <View style={styles.processingCard}>
            <ActivityIndicator color={Colors.primary} size="large" />
            <Text style={styles.processingTitle}>Reading receipt...</Text>
            <Text style={styles.processingSubtitle}>Extracting items & amounts</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const C = 20, CW = 3;
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  permBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, backgroundColor: Colors.bg },
  permIcon: { fontSize: 48 },
  permTitle: { fontSize: 16, color: Colors.text },
  permBtn: { backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: Radius.lg },
  permBtnText: { color: '#fff', fontWeight: '600' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12, backgroundColor: 'rgba(0,0,0,0.45)' },
  topTitle: { color: '#fff', fontSize: 16, fontWeight: '600' },
  flashBtn: { fontSize: 22 },
  frameWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  frame: { width: 240, height: 320, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.3)', borderRadius: 8, position: 'relative' },
  corner: { position: 'absolute', width: C, height: C },
  tl: { top: -1, left: -1, borderTopWidth: CW, borderLeftWidth: CW, borderColor: '#5DCAA5', borderTopLeftRadius: 5 },
  tr: { top: -1, right: -1, borderTopWidth: CW, borderRightWidth: CW, borderColor: '#5DCAA5', borderTopRightRadius: 5 },
  bl: { bottom: -1, left: -1, borderBottomWidth: CW, borderLeftWidth: CW, borderColor: '#5DCAA5', borderBottomLeftRadius: 5 },
  br: { bottom: -1, right: -1, borderBottomWidth: CW, borderRightWidth: CW, borderColor: '#5DCAA5', borderBottomRightRadius: 5 },
  hint: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 40, paddingBottom: 44, paddingTop: 20, backgroundColor: 'rgba(0,0,0,0.5)' },
  sideBtn: { alignItems: 'center', gap: 4, width: 60 },
  sideBtnIcon: { fontSize: 26 },
  sideBtnLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 11 },
  shutter: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 2, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  shutterInner: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#fff' },
  processingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center' },
  processingCard: { backgroundColor: '#fff', borderRadius: Radius.xl, padding: 32, alignItems: 'center', gap: 12, width: 220 },
  processingTitle: { fontSize: 16, fontWeight: '600', color: Colors.text },
  processingSubtitle: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center' },
});
