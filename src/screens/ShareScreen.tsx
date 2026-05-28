import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Sharing from 'expo-sharing';
import { Colors, Spacing, Radius, Shadows } from '../utils/theme';
import { pdfService } from '../services/pdfService';
import { Invoice } from '../services/invoiceService';

export default function ShareScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const { invoice, pdfPath: initialPath } = route.params as { invoice: Invoice; pdfPath: string | null };

  const [pdfPath, setPdfPath] = useState<string | null>(initialPath);
  const [generating, setGenerating] = useState(!initialPath);
  const [sharing, setSharing] = useState<string | null>(null);

  useEffect(() => {
    if (!pdfPath) {
      pdfService.generatePDF(invoice)
        .then(p => setPdfPath(p))
        .catch(() => Alert.alert('Error', 'Could not generate PDF'))
        .finally(() => setGenerating(false));
    }
  }, []);

  const share = async (method: string) => {
    if (!pdfPath) return;
    setSharing(method);
    try {
      if (method === 'whatsapp') {
        const canOpen = await Linking.canOpenURL('whatsapp://');
        if (!canOpen) {
          Alert.alert('WhatsApp not installed', 'Please install WhatsApp first.');
          return;
        }
        // Share the file natively — WhatsApp will appear in the share sheet
        await Sharing.shareAsync(pdfPath, { mimeType: 'application/pdf', dialogTitle: `Share ${invoice.invoiceNumber}` });
      } else {
        await Sharing.shareAsync(pdfPath, { mimeType: 'application/pdf', dialogTitle: `Share ${invoice.invoiceNumber}` });
      }
    } catch (e: any) {
      if (!e.message?.includes('cancelled')) {
        Alert.alert('Share failed', e.message);
      }
    } finally {
      setSharing(null);
    }
  };

  const buttons = [
    { id: 'whatsapp', icon: '💬', label: 'WhatsApp', color: '#1a7741', bg: '#E8F5EE' },
    { id: 'email', icon: '📧', label: 'Email', color: Colors.blue, bg: Colors.blueLight },
    { id: 'download', icon: '⬇️', label: 'Download PDF', color: Colors.primary, bg: Colors.primaryLight },
    { id: 'more', icon: '↗️', label: 'More options', color: Colors.textSecondary, bg: Colors.bg },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => nav.navigate('Tabs')}>
          <Text style={{ fontSize: 22, color: Colors.text }}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerTitle}>Share Invoice</Text>
          <Text style={styles.headerSub}>{invoice.invoiceNumber} · ${invoice.total.toFixed(2)}</Text>
        </View>
      </View>

      {/* PDF Preview card */}
      <View style={styles.previewCard}>
        <View style={styles.pdfIcon}>
          <Text style={{ fontSize: 28 }}>📄</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.previewName}>{invoice.invoiceNumber}.pdf</Text>
          <Text style={styles.previewMeta}>{invoice.merchant} · ${invoice.total.toFixed(2)}</Text>
          <View style={styles.readyBadge}>
            {generating
              ? <ActivityIndicator size="small" color={Colors.primary} />
              : <Text style={styles.readyText}>✓ Ready to share</Text>}
          </View>
        </View>
      </View>

      {/* Share buttons */}
      <View style={styles.grid}>
        {buttons.map(btn => (
          <TouchableOpacity
            key={btn.id}
            style={[styles.shareBtn, { backgroundColor: btn.bg }]}
            onPress={() => share(btn.id)}
            disabled={generating || !!sharing}>
            {sharing === btn.id
              ? <ActivityIndicator color={btn.color} />
              : <Text style={styles.btnIcon}>{btn.icon}</Text>}
            <Text style={[styles.btnLabel, { color: btn.color }]}>{btn.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.doneBtn} onPress={() => nav.navigate('Tabs')}>
        <Text style={styles.doneBtnText}>Done</Text>
      </TouchableOpacity>
      <Text style={styles.savedNote}>Invoice saved to local history</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingTop: 56, paddingBottom: Spacing.lg, backgroundColor: Colors.white, borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  headerTitle: { fontSize: 16, fontWeight: '600', color: Colors.text },
  headerSub: { fontSize: 12, color: Colors.textSecondary },
  previewCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg, margin: Spacing.xl, padding: Spacing.xl, backgroundColor: Colors.white, borderRadius: Radius.lg, ...Shadows.card },
  pdfIcon: { width: 52, height: 64, backgroundColor: '#FCEBEB', borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  previewName: { fontSize: 15, fontWeight: '600', color: Colors.text },
  previewMeta: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  readyBadge: { alignSelf: 'flex-start', backgroundColor: Colors.tealLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.pill, marginTop: 5 },
  readyText: { fontSize: 11, fontWeight: '500', color: Colors.teal },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, paddingHorizontal: Spacing.xl },
  shareBtn: { width: '47%', borderRadius: Radius.lg, padding: Spacing.xl, alignItems: 'center', gap: Spacing.sm, borderWidth: 0.5, borderColor: Colors.border },
  btnIcon: { fontSize: 28 },
  btnLabel: { fontSize: 13, fontWeight: '500' },
  doneBtn: { margin: Spacing.xl, backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: Radius.lg, alignItems: 'center' },
  doneBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  savedNote: { textAlign: 'center', fontSize: 12, color: Colors.textTertiary },
});
