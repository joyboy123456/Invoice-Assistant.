import { create } from 'zustand';
import type {
  DocumentData,
  PairingResult,
  Warning,
  ProjectInfo,
  APIConfig,
  InvoiceType,
} from '../types';

// LocalStorage keys
const STORAGE_KEYS = {
  API_CONFIG: 'ai-invoice-organizer-api-config',
  PROJECT_INFO: 'ai-invoice-organizer-project-info',
};

// State interface
interface AppState {
  // Core state
  documents: DocumentData[];
  pairs: PairingResult | null;
  warnings: Warning[];
  projectInfo: ProjectInfo;
  apiConfig: APIConfig;

  // Actions
  addDocument: (document: DocumentData) => void;
  addDocuments: (documents: DocumentData[]) => void;
  updateDocument: (id: string, updates: Partial<DocumentData>) => void;
  removeDocument: (id: string) => void;
  clearDocuments: () => void;
  
  setPairs: (pairs: PairingResult) => void;
  clearPairs: () => void;
  
  setWarnings: (warnings: Warning[]) => void;
  addWarning: (warning: Warning) => void;
  removeWarning: (index: number) => void;
  clearWarnings: () => void;
  
  setProjectInfo: (info: Partial<ProjectInfo>) => void;
  clearProjectInfo: () => void;
  
  setApiConfig: (config: Partial<APIConfig>) => void;
  clearApiConfig: () => void;

  // Computed values
  sortedDocuments: () => DocumentData[];
  documentsByType: () => {
    invoices: DocumentData[];
    tripSheets: DocumentData[];
  };
  documentsByInvoiceType: () => Record<InvoiceType, DocumentData[]>;
  pairedDocuments: () => Map<string, string>; // Maps invoice ID to trip sheet ID
  unpairedInvoices: () => DocumentData[];
  unpairedTripSheets: () => DocumentData[];
}

// Helper functions for localStorage
const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const saveToStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

// Default values
const defaultProjectInfo: ProjectInfo = {
  projectName: '',
  department: '',
  reimbursementPeriod: '',
};

const defaultApiConfig: APIConfig = {
  endpoint: '',
  apiKey: '',
  model: 'gpt-4-vision-preview',
};

// Create the store
export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  documents: [],
  pairs: null,
  warnings: [],
  projectInfo: loadFromStorage(STORAGE_KEYS.PROJECT_INFO, defaultProjectInfo),
  apiConfig: loadFromStorage(STORAGE_KEYS.API_CONFIG, defaultApiConfig),

  // Document actions
  addDocument: (document) =>
    set((state) => ({
      documents: [...state.documents, document],
    })),

  addDocuments: (documents) =>
    set((state) => ({
      documents: [...state.documents, ...documents],
    })),

  updateDocument: (id, updates) =>
    set((state) => ({
      documents: state.documents.map((doc) =>
        doc.id === id ? { ...doc, ...updates } : doc
      ),
    })),

  removeDocument: (id) =>
    set((state) => ({
      documents: state.documents.filter((doc) => doc.id !== id),
    })),

  clearDocuments: () =>
    set({
      documents: [],
      pairs: null,
      warnings: [],
    }),

  // Pairing actions
  setPairs: (pairs) =>
    set({
      pairs,
    }),

  clearPairs: () =>
    set({
      pairs: null,
    }),

  // Warning actions
  setWarnings: (warnings) =>
    set({
      warnings,
    }),

  addWarning: (warning) =>
    set((state) => ({
      warnings: [...state.warnings, warning],
    })),

  removeWarning: (index) =>
    set((state) => ({
      warnings: state.warnings.filter((_, i) => i !== index),
    })),

  clearWarnings: () =>
    set({
      warnings: [],
    }),

  // Project info actions
  setProjectInfo: (info) =>
    set((state) => {
      const newProjectInfo = { ...state.projectInfo, ...info };
      saveToStorage(STORAGE_KEYS.PROJECT_INFO, newProjectInfo);
      return { projectInfo: newProjectInfo };
    }),

  clearProjectInfo: () => {
    saveToStorage(STORAGE_KEYS.PROJECT_INFO, defaultProjectInfo);
    set({ projectInfo: defaultProjectInfo });
  },

  // API config actions
  setApiConfig: (config) =>
    set((state) => {
      const newApiConfig = { ...state.apiConfig, ...config };
      saveToStorage(STORAGE_KEYS.API_CONFIG, newApiConfig);
      return { apiConfig: newApiConfig };
    }),

  clearApiConfig: () => {
    saveToStorage(STORAGE_KEYS.API_CONFIG, defaultApiConfig);
    set({ apiConfig: defaultApiConfig });
  },

  // Computed values
  sortedDocuments: () => {
    const state = get();
    const { documents, pairs } = state;

    if (!pairs || pairs.pairs.length === 0) {
      // No pairing, sort by date
      return [...documents].sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateA - dateB;
      });
    }

    // Create a map of paired documents
    const pairedMap = new Map<string, string>();
    pairs.pairs.forEach((pair) => {
      pairedMap.set(pair.invoiceId, pair.tripSheetId);
    });

    // Separate paired and unpaired documents
    const paired: DocumentData[] = [];
    const unpaired: DocumentData[] = [];

    documents.forEach((doc) => {
      if (doc.documentType === 'invoice' && pairedMap.has(doc.id)) {
        paired.push(doc);
      } else if (
        doc.documentType === 'trip_sheet' &&
        Array.from(pairedMap.values()).includes(doc.id)
      ) {
        // Skip trip sheets here, they'll be added with their invoices
      } else {
        unpaired.push(doc);
      }
    });

    // Build sorted list with paired documents adjacent
    const sorted: DocumentData[] = [];
    paired.forEach((invoice) => {
      sorted.push(invoice);
      const tripSheetId = pairedMap.get(invoice.id);
      if (tripSheetId) {
        const tripSheet = documents.find((doc) => doc.id === tripSheetId);
        if (tripSheet) {
          sorted.push(tripSheet);
        }
      }
    });

    // Add unpaired documents at the end, sorted by date
    const sortedUnpaired = unpaired.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateA - dateB;
    });

    return [...sorted, ...sortedUnpaired];
  },

  documentsByType: () => {
    const state = get();
    const invoices = state.documents.filter(
      (doc) => doc.documentType === 'invoice'
    );
    const tripSheets = state.documents.filter(
      (doc) => doc.documentType === 'trip_sheet'
    );
    return { invoices, tripSheets };
  },

  documentsByInvoiceType: () => {
    const state = get();
    const invoices = state.documents.filter(
      (doc) => doc.documentType === 'invoice'
    );

    const grouped: Record<InvoiceType, DocumentData[]> = {
      taxi: [],
      hotel: [],
      train: [],
      shipping: [],
      toll: [],
      consumables: [],
      other: [],
    };

    invoices.forEach((invoice) => {
      const type = invoice.invoiceType || 'other';
      grouped[type].push(invoice);
    });

    return grouped;
  },

  pairedDocuments: () => {
    const state = get();
    const map = new Map<string, string>();
    
    if (state.pairs) {
      state.pairs.pairs.forEach((pair) => {
        map.set(pair.invoiceId, pair.tripSheetId);
      });
    }
    
    return map;
  },

  unpairedInvoices: () => {
    const state = get();
    const { documents, pairs } = state;

    if (!pairs) {
      return documents.filter((doc) => doc.documentType === 'invoice');
    }

    const pairedInvoiceIds = new Set(pairs.pairs.map((p) => p.invoiceId));
    return documents.filter(
      (doc) =>
        doc.documentType === 'invoice' && !pairedInvoiceIds.has(doc.id)
    );
  },

  unpairedTripSheets: () => {
    const state = get();
    const { documents, pairs } = state;

    if (!pairs) {
      return documents.filter((doc) => doc.documentType === 'trip_sheet');
    }

    const pairedTripSheetIds = new Set(pairs.pairs.map((p) => p.tripSheetId));
    return documents.filter(
      (doc) =>
        doc.documentType === 'trip_sheet' && !pairedTripSheetIds.has(doc.id)
    );
  },
}));
