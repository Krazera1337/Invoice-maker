import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Radius, Shadows, Spacing } from '../utils/theme';
import { Invoice } from '../services/invoiceService';
import dayjs from 'dayjs';

interface Props {
  invoice: Invoice;
  onPress: () => void;
  onLongPress?: () => void;
}

export default function InvoiceCard({ invoice, onPress, onLongPress }: Props) {
  const sc = invoice.status === 'final'
    ? { bg: Colors.tealLight, text: Colors.teal }
    : { bg: Colors.amberLight, text: Colors.amber };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} onLongPress={onLongPress} activeOpacity={0.8}>
      <View style={styles.left}>
        <Text style={styles.merchant} numberOfLines={1}>{invoice.merchant}</Text>
        <Text style={styles.number}>{invoice.invoiceNumber}</Text>
        <Text style={styles.date}>{dayjs(invoice.createdAt).format('D MMM YYYY')}</Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.total}>${invoice.total.toFixed(2)}</Text>
        <View style={[styles.badge, { backgroundColor: sc.bg }]}>
          <Text style={[styles.badgeText, { color: sc.text }]}>{invoice.status}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.white, borderRadius: Radius.lg, padding: Spacing.lg, ...Shadows.card },
  left: { flex: 1, gap: 2 },
  merchant: { fontSize: 15, fontWeight: '600', color: Colors.text },
  number: { fontSize: 12, color: Colors.textSecondary },
  date: { fontSize: 12, color: Colors.textTertiary },
  right: { alignItems: 'flex-end', gap: 6 },
  total: { fontSize: 17, fontWeight: '700', color: Colors.primary },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 10, fontWeight: '600', textTransform: 'capitalize' },
});
