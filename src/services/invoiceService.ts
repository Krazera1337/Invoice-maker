import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LineItem {
  name: string;
  qty: number;
  unitPrice: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  merchant: string;
  date: string;
  customerName: string;
  lineItems: LineItem[];
  taxRate: number;
  subtotal: number;
  total: number;
  paymentNotes: string;
  status: 'draft' | 'final';
  createdAt: string;
}

const STORAGE_KEY = 'r2i_invoices';

let _counter = 1;

export function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const num = String(_counter++).padStart(4, '0');
  return `INV-${year}-${num}`;
}

class InvoiceService {
  async getAll(): Promise<Invoice[]> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const list: Invoice[] = raw ? JSON.parse(raw) : [];
      return list.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } catch {
      return [];
    }
  }

  async save(data: Omit<Invoice, 'id' | 'createdAt'>): Promise<Invoice> {
    const invoice: Invoice = {
      ...data,
      id: Math.random().toString(36).slice(2),
      createdAt: new Date().toISOString(),
    };
    const all = await this.getAll();
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([invoice, ...all]));
    return invoice;
  }

  async update(id: string, data: Partial<Invoice>): Promise<void> {
    const all = await this.getAll();
    const updated = all.map(inv => (inv.id === id ? { ...inv, ...data } : inv));
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  async delete(id: string): Promise<void> {
    const all = await this.getAll();
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(all.filter(inv => inv.id !== id)),
    );
  }

  async clearAll(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEY);
  }
}

export const invoiceService = new InvoiceService();
