import { create } from 'zustand';
import { Invoice, invoiceService } from '../services/invoiceService';

interface Store {
  invoices: Invoice[];
  loading: boolean;
  fetch: () => Promise<void>;
  add: (inv: Invoice) => void;
  remove: (id: string) => Promise<void>;
}

export const useInvoiceStore = create<Store>((set, get) => ({
  invoices: [],
  loading: false,

  fetch: async () => {
    set({ loading: true });
    const invoices = await invoiceService.getAll();
    set({ invoices, loading: false });
  },

  add: (inv) => set(s => ({ invoices: [inv, ...s.invoices] })),

  remove: async (id) => {
    await invoiceService.delete(id);
    set(s => ({ invoices: s.invoices.filter(i => i.id !== id) }));
  },
}));
