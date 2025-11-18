# App Store

This directory contains the Zustand state management store for the AI Invoice Organizer application.

## Usage

### Basic Usage

```typescript
import { useAppStore } from './store/useAppStore';

function MyComponent() {
  // Access state
  const documents = useAppStore((state) => state.documents);
  const warnings = useAppStore((state) => state.warnings);
  
  // Access actions
  const addDocument = useAppStore((state) => state.addDocument);
  const setWarnings = useAppStore((state) => state.setWarnings);
  
  // Use computed values
  const sortedDocuments = useAppStore((state) => state.sortedDocuments());
  const { invoices, tripSheets } = useAppStore((state) => state.documentsByType());
  
  return (
    <div>
      <p>Total documents: {documents.length}</p>
      <p>Warnings: {warnings.length}</p>
    </div>
  );
}
```

### State Structure

- **documents**: Array of all uploaded and processed documents
- **pairs**: Pairing results between invoices and trip sheets
- **warnings**: Array of detected anomalies and warnings
- **projectInfo**: Project metadata (persisted to localStorage)
- **apiConfig**: AI API configuration (persisted to localStorage)

### Actions

#### Document Management
- `addDocument(document)`: Add a single document
- `addDocuments(documents)`: Add multiple documents
- `updateDocument(id, updates)`: Update a document by ID
- `removeDocument(id)`: Remove a document by ID
- `clearDocuments()`: Clear all documents

#### Pairing Management
- `setPairs(pairs)`: Set pairing results
- `clearPairs()`: Clear pairing results

#### Warning Management
- `setWarnings(warnings)`: Set all warnings
- `addWarning(warning)`: Add a single warning
- `removeWarning(index)`: Remove a warning by index
- `clearWarnings()`: Clear all warnings

#### Project Info Management
- `setProjectInfo(info)`: Update project info (auto-persisted)
- `clearProjectInfo()`: Reset project info to defaults

#### API Config Management
- `setApiConfig(config)`: Update API config (auto-persisted)
- `clearApiConfig()`: Reset API config to defaults

### Computed Values

- `sortedDocuments()`: Returns documents sorted by date and pairing
- `documentsByType()`: Returns documents grouped by type (invoices, tripSheets)
- `documentsByInvoiceType()`: Returns invoices grouped by invoice type
- `pairedDocuments()`: Returns a Map of invoice ID to trip sheet ID
- `unpairedInvoices()`: Returns invoices without paired trip sheets
- `unpairedTripSheets()`: Returns trip sheets without paired invoices

### LocalStorage Persistence

The following state is automatically persisted to localStorage:
- **apiConfig**: Saved under key `ai-invoice-organizer-api-config`
- **projectInfo**: Saved under key `ai-invoice-organizer-project-info`

These values are automatically loaded when the store is initialized and saved whenever they are updated.
