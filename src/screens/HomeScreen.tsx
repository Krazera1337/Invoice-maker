import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Radius, Shadows } from '../utils/theme';
import { useInvoiceStore } from '../store/invoiceStore';
import InvoiceCard from '../components/InvoiceCard';
import dayjs from 'dayjs';

export default function HomeScreen() {
  const nav = useNavigation<any>();
  const { invoices, loading, fetch } = useInvoiceStore();

  useEffect(() => { fetch(); }, []);

  const thisMonth = invoices.filter(i => dayjs(i.createdAt).isSame(dayjs(), 'month'));
  const monthTotal = thisMonth.reduce((s, i) => s + i.total, 0);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetch} />}>

      {/* Header gradient */}
      <LinearGradient colors={['#534AB7', '#3C3489']} style={styles.hero}>
        <Text style={styles.heroGreeting}>Good morning 👋</Text>
        <Text style={styles.heroTitle}>Receipt2Invoice</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{thisMonth.length}</Text>
            <Text style={styles.statLbl}>This month</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNum}>${monthTotal.toFixed(0)}</Text>
            <Text style={styles.statLbl}>Total billed</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Quick action */}
      <TouchableOpacity style={styles.scanBtn} onPress={() => nav.navigate('Scan')} activeOpacity={0.85}>
        <Text style={styles.scanIcon}>📷</Text>
        <View>
          <Text style={styles.scanTitle}>Scan a Receipt</Text>
          <Text style={styles.scanSub}>Tap to open camera</Text>
        </View>
        <Text style={styles.scanArrow}>→</Text>
      </TouchableOpacity>

      {/* Demo notice */}
      <View style={styles.demoNotice}>
        <Text style={styles.demoText}>🧪 Demo mode — mock OCR, local storage, no account needed</Text>
      </View>

      {/* Recent invoices */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>Recent invoices</Text>
        <TouchableOpacity onPress={() => nav.navigate('Invoices')}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>

      {invoices.slice(0, 4).map(inv => (
        <InvoiceCard
          key={inv.id}
          invoice={inv}
          onPress={() => nav.navigate('Share', { invoice: inv, pdfPath: null })}
        />
      ))}

      {invoices.length === 0 && !loading && (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>No invoices yet</Text>
          <Text style={styles.emptySub}>Tap "Scan a Receipt" to create your first one</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingBottom: 32 },
  hero: {
    paddingTop: 60,
    paddingBottom: 28,
    paddingHorizontal: Spacing.xl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  heroGreeting: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 2 },
  heroTitle: { fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 20 },
  statsRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: Radius.lg, padding: Spacing.lg },
  statBox: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.25)' },
  statNum: { fontSize: 22, fontWeight: '700', color: '#fff' },
  statLbl: { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    margin: Spacing.xl,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    ...Shadows.card,
  },
  scanIcon: { fontSize: 32 },
  scanTitle: { fontSize: 16, fontWeight: '600', color: Colors.text },
  scanSub: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  scanArrow: { marginLeft: 'auto', fontSize: 20, color: Colors.primary },
  demoNotice: {
    marginHorizontal: Spacing.xl,
    marginTop: -4,
    marginBottom: Spacing.md,
    backgroundColor: Colors.amberLight,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  demoText: { fontSize: 12, color: Colors.amber, textAlign: 'center' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  seeAll: { fontSize: 13, color: Colors.primary, fontWeight: '500' },
  empty: { alignItems: 'center', paddingVertical: 48, gap: 8 },
  emptyIcon: { fontSize: 44 },
  emptyText: { fontSize: 16, fontWeight: '500', color: Colors.text },
  emptySub: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: 40 },
});
