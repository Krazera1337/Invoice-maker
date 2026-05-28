import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, RefreshControl, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Radius } from '../utils/theme';
import { useInvoiceStore } from '../store/invoiceStore';
import InvoiceCard from '../components/InvoiceCard';

export default function InvoicesScreen() {
  const nav = useNavigation<any>();
  const { invoices, loading, fetch, remove } = useInvoiceStore();

  useEffect(() => { fetch(); }, []);

  const confirmDelete = (id: string) =>
    Alert.alert('Delete invoice', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => remove(id) },
    ]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Invoices</Text>
        <Text style={styles.count}>{invoices.length} saved</Text>
      </View>

      <FlatList
        data={invoices}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetch} />}
        renderItem={({ item }) => (
          <InvoiceCard
            invoice={item}
            onPress={() => nav.navigate('Share', { invoice: item, pdfPath: null })}
            onLongPress={() => confirmDelete(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>No invoices yet</Text>
            <Text style={styles.emptySub}>Scan a receipt to get started</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingHorizontal: Spacing.xl, paddingTop: 56, paddingBottom: Spacing.lg, backgroundColor: Colors.white, borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  title: { fontSize: 22, fontWeight: '700', color: Colors.text },
  count: { fontSize: 13, color: Colors.textSecondary },
  list: { padding: Spacing.xl, gap: Spacing.md, paddingBottom: 32 },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyIcon: { fontSize: 44 },
  emptyText: { fontSize: 16, fontWeight: '500', color: Colors.text },
  emptySub: { fontSize: 13, color: Colors.textSecondary },
});
