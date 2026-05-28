// ─── MOCK OCR SERVICE ────────────────────────────────────────
// No OpenAI key needed. Returns realistic random receipt data
// after a short fake "processing" delay so the UI feels real.
// Swap extractReceipt() with the real OpenAI call when ready.
// ─────────────────────────────────────────────────────────────

export interface LineItem {
  name: string;
  qty: number;
  unitPrice: number;
}

export interface ExtractedReceipt {
  merchant: string;
  date: string;
  lineItems: LineItem[];
  subtotal: number;
  taxRate: number;
  total: number;
}

const MOCK_RECEIPTS: ExtractedReceipt[] = [
  {
    merchant: 'IKEA Singapore',
    date: new Date().toISOString().slice(0, 10),
    lineItems: [
      { name: 'KALLAX Shelf Unit (4x4)', qty: 1, unitPrice: 189.0 },
      { name: 'LACK Side Table', qty: 2, unitPrice: 29.9 },
      { name: 'FLISAT Storage Box', qty: 3, unitPrice: 12.5 },
    ],
    subtotal: 285.3,
    taxRate: 9,
    total: 311.0,
  },
  {
    merchant: 'Starbucks Coffee',
    date: new Date().toISOString().slice(0, 10),
    lineItems: [
      { name: 'Caramel Macchiato (L)', qty: 2, unitPrice: 7.5 },
      { name: 'Blueberry Muffin', qty: 1, unitPrice: 4.5 },
      { name: 'Bottled Water', qty: 2, unitPrice: 2.0 },
    ],
    subtotal: 23.5,
    taxRate: 6,
    total: 24.91,
  },
  {
    merchant: 'Office Supplies Co.',
    date: new Date().toISOString().slice(0, 10),
    lineItems: [
      { name: 'A4 Paper Ream 80gsm', qty: 5, unitPrice: 9.9 },
      { name: 'Whiteboard Markers (Set)', qty: 2, unitPrice: 14.0 },
      { name: 'Stapler Heavy Duty', qty: 1, unitPrice: 22.5 },
      { name: 'Binder Clips (Box)', qty: 4, unitPrice: 3.5 },
    ],
    subtotal: 104.5,
    taxRate: 9,
    total: 113.91,
  },
  {
    merchant: 'Giant Hypermarket',
    date: new Date().toISOString().slice(0, 10),
    lineItems: [
      { name: 'Basmati Rice 5kg', qty: 2, unitPrice: 18.9 },
      { name: 'Cooking Oil 2L', qty: 1, unitPrice: 11.5 },
      { name: 'Fresh Milk 1L', qty: 3, unitPrice: 3.8 },
      { name: 'Eggs (30pcs)', qty: 1, unitPrice: 12.9 },
      { name: 'Laundry Detergent 3kg', qty: 1, unitPrice: 22.0 },
    ],
    subtotal: 96.6,
    taxRate: 0,
    total: 96.6,
  },
  {
    merchant: 'Shell Petrol Station',
    date: new Date().toISOString().slice(0, 10),
    lineItems: [
      { name: 'RON 97 Fuel', qty: 42, unitPrice: 3.47 },
      { name: 'Car Wash (Premium)', qty: 1, unitPrice: 18.0 },
    ],
    subtotal: 163.74,
    taxRate: 6,
    total: 173.56,
  },
];

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

class MockOCRService {
  async extractReceipt(_imageUri: string): Promise<ExtractedReceipt> {
    // Simulate network + AI processing time (1.5 – 2.5 seconds)
    await sleep(randomBetween(1500, 2500));

    // Pick a random mock receipt
    const receipt = MOCK_RECEIPTS[randomBetween(0, MOCK_RECEIPTS.length - 1)];

    // Recalculate totals to make sure they're consistent
    const subtotal = receipt.lineItems.reduce(
      (sum, item) => sum + item.qty * item.unitPrice,
      0,
    );
    const taxAmount = subtotal * (receipt.taxRate / 100);
    const total = subtotal + taxAmount;

    return {
      ...receipt,
      subtotal: Math.round(subtotal * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  }
}

export const ocrService = new MockOCRService();
