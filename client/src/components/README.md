# Document Display Components

This directory contains the frontend components for displaying and managing document results in the AI Invoice Organizer.

## Components

### APIConfigPanel.tsx

A configuration panel for setting up AI API credentials and testing connectivity.

**Features:**
- API endpoint URL input
- API key input with show/hide toggle
- Model name input
- Test connection functionality
- Configuration persistence to LocalStorage
- Connection status display with visual feedback
- Encrypted storage (Base64 encoding)
- Input validation
- Auto-save on successful connection test

**Props:**
None - uses Zustand store for state management

**Connection Status:**
- **Idle**: No status message
- **Testing**: Blue spinner with "正在测试连接..." message
- **Success**: Green checkmark with success message
- **Error**: Red X with error details

**Usage:**
```tsx
import APIConfigPanel from './components/APIConfigPanel';

function App() {
  return <APIConfigPanel />;
}
```

**Accessing Configuration:**
```tsx
import { useAppStore } from './store/useAppStore';

function MyComponent() {
  const { apiConfig } = useAppStore();
  
  // Use configuration
  console.log(apiConfig.endpoint);  // API endpoint URL
  console.log(apiConfig.apiKey);    // API key
  console.log(apiConfig.model);     // Model name
}
```

**Security:**
- API credentials stored in browser LocalStorage only
- No data uploaded to external servers
- Base64 encoding for basic obfuscation
- Password field with show/hide toggle

**Requirements Satisfied:**
- **7.1**: Configuration interface for API endpoint and key
- **7.3**: Secure local storage of API credentials
- **7.4**: API connectivity validation with error display

### ProgressBar.tsx

A progress indicator component for displaying batch processing status.

**Features:**
- Real-time progress tracking (completed/total documents)
- Current processing stage display
- Stage-specific icons and colors
- Failed documents list with error messages
- Smooth progress bar animation
- Responsive design

**Props:**
```typescript
interface ProgressBarProps {
  total: number;                     // Total number of documents
  completed: number;                 // Number of completed documents
  stage: 'uploading' | 'recognizing' | 'pairing' | 'sorting' | 'detecting' | 'completed';
  failedDocuments?: Array<{          // Optional list of failed documents
    fileName: string;
    errorMessage: string;
  }>;
}
```

**Processing Stages:**
- **uploading**: Uploading files (blue)
- **recognizing**: AI recognition in progress (blue)
- **pairing**: Pairing documents (purple)
- **sorting**: Sorting documents (indigo)
- **detecting**: Detecting anomalies (yellow)
- **completed**: Processing complete (green)

**Usage:**
```tsx
import ProgressBar from './components/ProgressBar';

function App() {
  return (
    <ProgressBar
      total={10}
      completed={7}
      stage="recognizing"
      failedDocuments={[
        { fileName: 'invoice1.pdf', errorMessage: 'API错误' }
      ]}
    />
  );
}
```

**Requirements Satisfied:**
- **8.1**: Display progress indicator with document count
- **8.2**: Real-time progress updates
- **8.3**: Show intermediate results
- **8.4**: Display current processing stage
- **8.5**: Show failed documents with error messages

### UploadZone.tsx

A drag-and-drop file upload component with validation and progress tracking.

**Features:**
- Drag-and-drop file upload
- Click to browse file selection
- File type validation (PDF, PNG, JPG, JPEG)
- File size validation (max 10MB per file)
- Multiple file upload support
- Upload progress display
- Error handling and display
- File list management with remove functionality
- Visual feedback during drag operations
- Responsive design

**Props:**
```typescript
interface UploadZoneProps {
  onFilesAdded?: (files: File[]) => void;  // Callback when valid files are added
}
```

**File Validation:**
- Allowed types: PDF, PNG, JPG, JPEG
- Maximum file size: 10MB
- Automatic validation with error messages
- Invalid files are marked with error status

**Usage:**
```tsx
import UploadZone from './components/UploadZone';

function App() {
  const handleFilesAdded = (files: File[]) => {
    // Process uploaded files
    console.log('Files added:', files);
  };

  return <UploadZone onFilesAdded={handleFilesAdded} />;
}
```

### DocumentCard.tsx

A draggable card component that displays individual document information.

**Features:**
- Document type icon (invoice/trip sheet)
- File name and document type label
- Confidence score with color coding (green ≥90%, yellow ≥70%, red <70%)
- All document fields (date, amount, description, etc.)
- Invoice-specific fields (invoice number, vendor, tax amount, invoice type)
- Trip sheet-specific fields (platform, departure, destination, time, distance)
- Drag-and-drop support for reordering
- Edit button to modify document information
- Pair/Unpair buttons for manual pairing
- Visual indicators for paired documents (blue border/background)
- Visual indicators for documents with warnings (red border/background)

**Props:**
```typescript
interface DocumentCardProps {
  document: DocumentData;           // The document to display
  index: number;                     // Position in the list (for drag-and-drop)
  isPaired: boolean;                 // Whether this document is paired
  pairId?: string;                   // ID of the paired document
  onEdit: (document: DocumentData) => void;        // Edit handler
  onPair: (documentId: string) => void;            // Pair handler
  onUnpair: (documentId: string) => void;          // Unpair handler
  onMove: (dragIndex: number, hoverIndex: number) => void;  // Drag handler
  hasWarning?: boolean;              // Whether this document has warnings
}
```

### EditModal.tsx

A modal dialog for editing document information.

**Features:**
- Edit all document fields
- Dynamic form based on document type (invoice vs trip sheet)
- Invoice type selector with Chinese labels
- Trip details editor for trip sheets
- Form validation
- Save/Cancel actions
- Smooth transitions using Headless UI

**Props:**
```typescript
interface EditModalProps {
  isOpen: boolean;                   // Modal visibility
  document: DocumentData | null;     // Document to edit
  onClose: () => void;               // Close handler
  onSave: (document: DocumentData) => void;  // Save handler
}
```

### DocumentList.tsx

A container component that manages a collection of DocumentCards with drag-and-drop and pairing functionality.

**Features:**
- Drag-and-drop reordering of documents
- Visual pairing mode with selection indicator
- Pairing connections visualization
- Document summary statistics (total, paired, warnings)
- Empty state display
- Integrated EditModal
- Automatic pairing state management

**Props:**
```typescript
interface DocumentListProps {
  documents: DocumentData[];         // Array of documents to display
  pairs: PairingResult;              // Pairing information
  warnings: Warning[];               // Warning information
  onUpdateDocument: (document: DocumentData) => void;      // Update handler
  onReorderDocuments: (documents: DocumentData[]) => void; // Reorder handler
  onPairDocuments: (doc1Id: string, doc2Id: string) => void;   // Pair handler
  onUnpairDocuments: (documentId: string) => void;         // Unpair handler
}
```

## Usage Example

See `DocumentList.example.tsx` for a complete working example.

Basic usage:

```tsx
import DocumentList from './components/DocumentList';

function App() {
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [pairs, setPairs] = useState<PairingResult>({ pairs: [], unmatchedInvoices: [], unmatchedTripSheets: [] });
  const [warnings, setWarnings] = useState<Warning[]>([]);

  return (
    <DocumentList
      documents={documents}
      pairs={pairs}
      warnings={warnings}
      onUpdateDocument={(doc) => {
        setDocuments(prev => prev.map(d => d.id === doc.id ? doc : d));
      }}
      onReorderDocuments={setDocuments}
      onPairDocuments={(id1, id2) => {
        // Add pairing logic
      }}
      onUnpairDocuments={(id) => {
        // Remove pairing logic
      }}
    />
  );
}
```

## Dependencies

- **react-dnd**: Drag-and-drop functionality
- **react-dnd-html5-backend**: HTML5 backend for react-dnd
- **@headlessui/react**: Accessible UI components (Dialog/Modal)
- **tailwindcss**: Styling

## Pairing Workflow

1. User clicks "配对" button on first document
2. Document is highlighted with blue ring
3. Pairing mode indicator appears at top
4. User clicks "配对" button on second document
5. Documents are paired and visual indicators update
6. User can click "取消配对" to remove pairing

## Visual Indicators

- **Blue border/background**: Paired documents
- **Red border/background**: Documents with warnings
- **Blue ring**: Selected for pairing
- **Confidence colors**:
  - Green (≥90%): High confidence
  - Yellow (≥70%): Medium confidence
  - Red (<70%): Low confidence

## Accessibility

- Keyboard navigation support via react-dnd
- ARIA labels on interactive elements
- Focus management in modal dialogs
- Color contrast meets WCAG standards

## Requirements Satisfied

This implementation satisfies the following requirements from the spec:

**UploadZone Component:**
- **9.1**: Drag-and-drop file upload for multiple documents
- **9.2**: Accept PDF and image formats (PNG, JPG, JPEG)
- **9.3**: Display upload progress and error messages
- File type and size validation
- Visual feedback and error handling

**DocumentCard, EditModal, DocumentList Components:**
- **5.1**: Display all recognized document information in an editable interface
- **5.2**: Allow modification of any extracted field
- **5.3**: Support drag-and-drop reordering of documents
- **5.4**: Enable manual pairing/unpairing of documents
- Visual pairing indicators (blue borders and connection lines)
- Warning indicators (red borders and icons)
