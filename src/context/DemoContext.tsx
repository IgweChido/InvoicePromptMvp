'use client';

import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

export interface DemoBooking {
  _id: string;
  shipmentId: string;
  quoteId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  origin: string;
  destination: string;
  scheduledDate: string;
  status: string;
  trackingNumber: string;
}

export interface DemoQuote {
  _id: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  baseRate: number;
  adjustments: number;
  total: number;
  currency: string;
  status: string;
}

export interface DemoInvoice {
  _id: string;
  shipmentId: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  quickbooksInvoiceId: string;
}

export interface DemoReceipt {
  filename: string;
  dataUrl: string;
  uploadedAt: string;
}

export interface DemoState {
  started: boolean;
  /** 0=not started, 1=sailing toast, 2=QB modal, 3=channel picker, 4=invoice sent, 5=receipt uploaded */
  flowStep: number;
  invoiceSendChannel: 'whatsapp' | 'email' | null;
  receipt: DemoReceipt | null;
  booking: DemoBooking | null;
  quote: DemoQuote | null;
  invoice: DemoInvoice | null;
}

const INITIAL_STATE: DemoState = {
  started: false,
  flowStep: 0,
  invoiceSendChannel: null,
  receipt: null,
  booking: null,
  quote: null,
  invoice: null,
};

export const DEMO_BOOKING: DemoBooking = {
  _id: 'demo-booking-001',
  shipmentId: 'demo-ship-001',
  quoteId: 'demo-quote-001',
  customerId: 'DEMO-CUST-001',
  customerName: 'Acme Imports Ltd',
  customerEmail: 'shipping@acme.com',
  customerPhone: '+14155552671',
  origin: 'Shanghai, China',
  destination: 'Los Angeles, USA',
  scheduledDate: '2026-03-15',
  status: 'CONFIRMED',
  trackingNumber: 'DEMO-TRK-2026-001',
};

export const DEMO_QUOTE: DemoQuote = {
  _id: 'demo-quote-001',
  bookingId: 'demo-booking-001',
  customerId: 'DEMO-CUST-001',
  customerName: 'Acme Imports Ltd',
  baseRate: 2500,
  adjustments: 150,
  total: 2650,
  currency: 'USD',
  status: 'ACCEPTED',
};

export const DEMO_INVOICE: DemoInvoice = {
  _id: 'demo-invoice-001',
  shipmentId: 'demo-ship-001',
  bookingId: 'demo-booking-001',
  customerId: 'DEMO-CUST-001',
  customerName: 'Acme Imports Ltd',
  subtotal: 2650,
  tax: 265,
  total: 2915,
  status: 'SENT',
  quickbooksInvoiceId: 'QB-DEMO-2026-001',
};

type DemoAction =
  | { type: 'START_DEMO' }
  | { type: 'ADVANCE_FLOW' }
  | { type: 'SET_CHANNEL'; channel: 'whatsapp' | 'email' }
  | { type: 'MARK_RECEIPT'; receipt: DemoReceipt }
  | { type: 'RESET_DEMO' }
  | { type: 'LOAD_STATE'; state: DemoState };

function demoReducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case 'START_DEMO':
      return {
        ...INITIAL_STATE,
        started: true,
        flowStep: 1,
        booking: DEMO_BOOKING,
        quote: DEMO_QUOTE,
        invoice: DEMO_INVOICE,
      };
    case 'ADVANCE_FLOW':
      return { ...state, flowStep: state.flowStep + 1 };
    case 'SET_CHANNEL':
      return { ...state, invoiceSendChannel: action.channel, flowStep: 4 };
    case 'MARK_RECEIPT':
      return { ...state, receipt: action.receipt, flowStep: 5 };
    case 'RESET_DEMO':
      return INITIAL_STATE;
    case 'LOAD_STATE':
      return action.state;
    default:
      return state;
  }
}

const STORAGE_KEY = 'invoiceprompt_demo';

interface DemoContextValue {
  state: DemoState;
  startDemo: () => void;
  advanceFlow: () => void;
  setChannel: (channel: 'whatsapp' | 'email') => void;
  markReceiptUploaded: (receipt: DemoReceipt) => void;
  resetDemo: () => void;
}

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(demoReducer, INITIAL_STATE);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as DemoState;
        dispatch({ type: 'LOAD_STATE', state: parsed });
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage errors
    }
  }, [state]);

  const startDemo = () => dispatch({ type: 'START_DEMO' });
  const advanceFlow = () => dispatch({ type: 'ADVANCE_FLOW' });
  const setChannel = (channel: 'whatsapp' | 'email') => dispatch({ type: 'SET_CHANNEL', channel });
  const markReceiptUploaded = (receipt: DemoReceipt) => dispatch({ type: 'MARK_RECEIPT', receipt });
  const resetDemo = () => {
    dispatch({ type: 'RESET_DEMO' });
    try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  };

  return (
    <DemoContext.Provider value={{ state, startDemo, advanceFlow, setChannel, markReceiptUploaded, resetDemo }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error('useDemo must be used within DemoProvider');
  return ctx;
}
