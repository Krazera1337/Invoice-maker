import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, StyleSheet,
  TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors, Spacing, Radius, Shadows } from '../utils/theme';
import { invoiceService, generateInvoiceNumber, LineItem } from '../services/invoiceService';
import { pdfService } from '../services/pdfService';
import { useInvoiceStore } from '../store/invoiceStore';

export default function InvoiceEditorScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const { receiptData } = route.params || {};
  const { add } = useInvoiceStore();

  const [merchant, setMerchant] = useState(receiptData?.merchant || '');
  const [date, setDate] = useState(receiptData?.date || new Date().toISOString().slice(0, 10));
  const [customerName, setCustomerName] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('Due on receipt');
  const [items, setItems] = useState<LineItem[]>(receiptData?.lineItems || [{ name: '', qty: 1, unitPrice: 0 }]);
  const [taxRate, setTaxRate] = useState<number>(receiptData?.taxRate ?? 9);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [invoiceNum] = useState(generateInvoiceNumber());

  const subtotal = items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  const updateItem = (idx: number, field: keyof LineItem, value: any) =>
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));

  const handleSave = async () => {
    setSaving(true);
    try {
      const inv = await invoiceService.save({
        invoiceNumber: invoiceNum, merchant, date, customerName,
        lineItems: items, taxRate,
        subtotal: Math.round(subtotal * 100) / 100,
        total: Math.round(total * 100) / 100,
        paymentNotes, status: 'draft',
      });
      add(inv);
      Alert.alert('Saved', 'Invoice saved as draft.');
    } finally {
      setSaving(false);
    }
  };

  const handleGeneratePDF = async () => {
    setGenerating(true);
    try {
      const inv = await invoiceService.save({
        invoiceNumber: invoiceNum, merchant, date, customerName,
        lineItems: items, taxRate,
        subtotal: Math.round(subtotal * 100) / 100,
        total: Math.round(total * 100) / 100,
        paymentNotes, status: 'final',
      });
      add(inv);
      const pdfPath = await pdfService.generatePDF(inv);
      nav.navigate('Share', { invoice: inv, pdfPath });
    } catch (e: any) {
      Alert.alert('Error', e.message || 'PDF generation failed');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => nav.goBack()} style={{ width: 32 }}>
          <Text style={{ fontSize: 22, color: Colors.text }}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Invoice Editor</Text>
          <Text style={styles.headerSub}>{invoiceNum}</Text>
        </View>
        <View style={styles.badge}><Text style={styles.badgeText}>Draft</Text></View>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>

        {/* Details */}
        <Text style={styles.sectionLabel}>Details</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Merchant</Text>
            <TextInput style={styles.rowInput} value={merchant} onChangeText={setMerchant} placeholder="Business name" placeholderTextColor={Colors.textTertiary} />
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Date</Text>
            <TextInput style={styles.rowInput} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" placeholderTextColor={Colors.textTertiary} />
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Bill to</Text>
            <TextInput style={styles.rowInput} value={customerName} onChangeText={setCustomerName} placeholder="Customer name" placeholderTextColor={Colors.textTertiary} />
          </View>
        </View>

        {/* Items */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>Items</Text>
          <TouchableOpacity onPress={() => setItems(p => [...p, { name: '', qty: 1, unitPrice: 0 }])}>
            <Text style={styles.addBtn}>+ Add item</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.card}>
          <View style={[styles.row, { paddingBottom: 6 }]}>
            <Text style={[styles.colLabel, { flex: 3 }]}>Item</Text>
            <Text style={[styles.colLabel, { flex: 1, textAlign: 'center' }]}>Qty</Text>
            <Text style={[styles.colLabel, { flex: 2, textAlign: 'right' }]}>Price</Text>
            <View style={{ width: 24 }} />
          </View>
          {items.map((item, idx) => (
            <View key={idx}>
              <View style={styles.itemRow}>
                <TextInput style={[styles.itemInput, { flex: 3 }]} value={item.name} onChangeText={v => updateItem(idx, 'name', v)} placeholder="Description" placeholderTextColor={Colors.textTertiary} />
                <TextInput style={[styles.itemInput, { flex: 1, textAlign: 'center' }]} value={String(item.qty)} onChangeText={v => updateItem(idx, 'qty', parseFloat(v) || 0)} keyboardType="numeric" />
                <TextInput style={[styles.itemInput, { flex: 2, textAlign: 'right' }]} value={String(item.unitPrice)} onChangeText={v => updateItem(idx, 'unitPrice', parseFloat(v) || 0)} keyboardType="decimal-pad" />
                <TouchableOpacity onPress={() => items.length > 1 && setItems(p => p.filter((_, i) => i !== idx))} style={{ width: 24, alignItems: 'center' }}>
                  <Text style={{ color: Colors.textTertiary, fontSize: 18 }}>×</Text>
                </TouchableOpacity>
              </View>
              {idx < items.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
          {/* Totals */}
          <View style={[styles.divider, { marginTop: 8 }]} />
          <View style={{ padding: Spacing.lg, gap: 6 }}>
            <View style={styles.totalRow}><Text style={styles.totalLabel}>Subtotal</Text><Text style={styles.totalVal}>${subtotal.toFixed(2)}</Text></View>
            <View style={styles.totalRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <TextInput style={styles.taxInput} value={String(taxRate)} onChangeText={v => setTaxRate(parseFloat(v) || 0)} keyboardType="decimal-pad" />
                <Text style={styles.totalLabel}>% Tax</Text>
              </View>
              <Text style={styles.totalVal}>${taxAmount.toFixed(2)}</Text>
            </View>
            <View style={[styles.totalRow, { borderTopWidth: 0.5, borderTopColor: Colors.border, paddingTop: 8, marginTop: 4 }]}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: Colors.text }}>Total</Text>
              <Text style={{ fontSize: 20, fontWeight: '700', color: Colors.primary }}>${total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        <Text style={styles.sectionLabel}>Payment notes</Text>
        <View style={styles.card}>
          <TextInput style={{ padding: Spacing.lg, fontSize: 14, color: Colors.text, minHeight: 64 }} value={paymentNotes} onChangeText={setPaymentNotes} multiline placeholder="Payment terms..." placeholderTextColor={Colors.textTertiary} />
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.btnOutline} onPress={handleSave} disabled={saving || generating}>
          {saving ? <ActivityIndicator color={Colors.primary} /> : <Text style={styles.btnOutlineText}>Save Draft</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnPrimary} onPress={handleGeneratePDF} disabled={saving || generating}>
          {generating ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnPrimaryText}>Generate PDF →</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: Spacing.xl, paddingTop: 56, paddingBottom: Spacing.lg, backgroundColor: Colors.white, borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  headerTitle: { fontSize: 16, fontWeight: '600', color: Colors.text },
  headerSub: { fontSize: 12, color: Colors.textSecondary },
  badge: { backgroundColor: Colors.amberLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.pill },
  badgeText: { fontSize: 11, fontWeight: '500', color: Colors.amber },
  body: { padding: Spacing.xl, gap: 8, paddingBottom: 0 },
  sectionLabel: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, marginTop: 8 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  addBtn: { fontSize: 13, color: Colors.primary, fontWeight: '500' },
  card: { backgroundColor: Colors.white, borderRadius: Radius.lg, ...Shadows.card, overflow: 'hidden', marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: 12 },
  rowLabel: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary, width: 72 },
  rowInput: { flex: 1, fontSize: 14, color: Colors.text, textAlign: 'right' },
  divider: { height: 0.5, backgroundColor: Colors.border, marginHorizontal: Spacing.lg },
  colLabel: { fontSize: 10, fontWeight: '600', color: Colors.textTertiary, textTransform: 'uppercase', paddingHorizontal: Spacing.lg },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: Spacing.lg, paddingVertical: 10 },
  itemInput: { fontSize: 14, color: Colors.text },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 13, color: Colors.textSecondary },
  totalVal: { fontSize: 14, fontWeight: '500', color: Colors.text },
  taxInput: { width: 36, fontSize: 13, color: Colors.primary, borderBottomWidth: 1, borderBottomColor: Colors.primary, textAlign: 'center', paddingVertical: 0 },
  actions: { flexDirection: 'row', gap: Spacing.md, padding: Spacing.xl, backgroundColor: Colors.white, borderTopWidth: 0.5, borderTopColor: Colors.border },
  btnOutline: { flex: 1, borderWidth: 0.5, borderColor: Colors.borderMid, borderRadius: Radius.lg, paddingVertical: 14, alignItems: 'center' },
  btnOutlineText: { fontSize: 14, fontWeight: '500', color: Colors.text },
  btnPrimary: { flex: 1.5, backgroundColor: Colors.primary, borderRadius: Radius.lg, paddingVertical: 14, alignItems: 'center' },
  btnPrimaryText: { fontSize: 14, fontWeight: '600', color: '#fff' },
});
