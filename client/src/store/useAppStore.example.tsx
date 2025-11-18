/**
 * Example usage of the useAppStore hook
 * This file demonstrates how to use the Zustand store in components
 */

import { useAppStore } from './useAppStore';
import type { DocumentData } from '../types';

// Example 1: Basic state access
export function DocumentCounter() {
  const documents = useAppStore((state) => state.documents);
  const warnings = useAppStore((state) => state.warnings);

  return (
    <div>
      <p>Total Documents: {documents.length}</p>
      <p>Warnings: {warnings.length}</p>
    </div>
  );
}

// Example 2: Using actions
export function AddDocumentButton() {
  const addDocument = useAppStore((state) => state.addDocument);

  const handleAddDocument = () => {
    const newDocument: DocumentData = {
      id: `doc-${Date.now()}`,
      fileName: 'example.pdf',
      fileType: 'pdf',
      documentType: 'invoice',
      date: new Date().toISOString(),
      amount: 100.0,
      description: 'Example invoice',
      confidence: 95,
      status: 'completed',
      invoiceType: 'taxi',
    };

    addDocument(newDocument);
  };

  return <button onClick={handleAddDocument}>Add Document</button>;
}

// Example 3: Using computed values
export function DocumentList() {
  const sortedDocuments = useAppStore((state) => state.sortedDocuments());
  const { invoices, tripSheets } = useAppStore((state) =>
    state.documentsByType()
  );

  return (
    <div>
      <h2>Sorted Documents ({sortedDocuments.length})</h2>
      <ul>
        {sortedDocuments.map((doc) => (
          <li key={doc.id}>
            {doc.fileName} - {doc.documentType}
          </li>
        ))}
      </ul>

      <h2>Invoices ({invoices.length})</h2>
      <h2>Trip Sheets ({tripSheets.length})</h2>
    </div>
  );
}

// Example 4: Updating documents
export function EditDocumentForm({ documentId }: { documentId: string }) {
  const updateDocument = useAppStore((state) => state.updateDocument);
  const document = useAppStore((state) =>
    state.documents.find((doc) => doc.id === documentId)
  );

  if (!document) return null;

  const handleUpdateAmount = (newAmount: number) => {
    updateDocument(documentId, { amount: newAmount });
  };

  return (
    <div>
      <h3>Edit Document: {document.fileName}</h3>
      <input
        type="number"
        value={document.amount}
        onChange={(e) => handleUpdateAmount(parseFloat(e.target.value))}
      />
    </div>
  );
}

// Example 5: Managing project info (with localStorage persistence)
export function ProjectInfoForm() {
  const projectInfo = useAppStore((state) => state.projectInfo);
  const setProjectInfo = useAppStore((state) => state.setProjectInfo);

  return (
    <div>
      <h2>Project Information</h2>
      <input
        type="text"
        placeholder="Project Name"
        value={projectInfo.projectName}
        onChange={(e) => setProjectInfo({ projectName: e.target.value })}
      />
      <input
        type="text"
        placeholder="Department"
        value={projectInfo.department}
        onChange={(e) => setProjectInfo({ department: e.target.value })}
      />
      <input
        type="text"
        placeholder="Reimbursement Period"
        value={projectInfo.reimbursementPeriod}
        onChange={(e) =>
          setProjectInfo({ reimbursementPeriod: e.target.value })
        }
      />
    </div>
  );
}

// Example 6: Managing API config (with localStorage persistence)
export function APIConfigForm() {
  const apiConfig = useAppStore((state) => state.apiConfig);
  const setApiConfig = useAppStore((state) => state.setApiConfig);

  return (
    <div>
      <h2>API Configuration</h2>
      <input
        type="text"
        placeholder="API Endpoint"
        value={apiConfig.endpoint}
        onChange={(e) => setApiConfig({ endpoint: e.target.value })}
      />
      <input
        type="password"
        placeholder="API Key"
        value={apiConfig.apiKey}
        onChange={(e) => setApiConfig({ apiKey: e.target.value })}
      />
      <input
        type="text"
        placeholder="Model"
        value={apiConfig.model}
        onChange={(e) => setApiConfig({ model: e.target.value })}
      />
    </div>
  );
}

// Example 7: Working with pairing results
export function PairingStatus() {
  const pairs = useAppStore((state) => state.pairs);
  const unpairedInvoices = useAppStore((state) => state.unpairedInvoices());
  const unpairedTripSheets = useAppStore((state) =>
    state.unpairedTripSheets()
  );

  return (
    <div>
      <h2>Pairing Status</h2>
      {pairs && (
        <>
          <p>Paired Documents: {pairs.pairs.length}</p>
          <p>Unpaired Invoices: {unpairedInvoices.length}</p>
          <p>Unpaired Trip Sheets: {unpairedTripSheets.length}</p>
        </>
      )}
    </div>
  );
}

// Example 8: Working with warnings
export function WarningsList() {
  const warnings = useAppStore((state) => state.warnings);
  const removeWarning = useAppStore((state) => state.removeWarning);

  return (
    <div>
      <h2>Warnings</h2>
      {warnings.map((warning, index) => (
        <div key={index}>
          <p>
            <strong>{warning.type}</strong>: {warning.message}
          </p>
          <button onClick={() => removeWarning(index)}>Dismiss</button>
        </div>
      ))}
    </div>
  );
}

// Example 9: Grouped documents by invoice type
export function DocumentsByInvoiceType() {
  const documentsByInvoiceType = useAppStore((state) =>
    state.documentsByInvoiceType()
  );

  return (
    <div>
      <h2>Documents by Invoice Type</h2>
      {Object.entries(documentsByInvoiceType).map(([type, docs]) => (
        <div key={type}>
          <h3>
            {type}: {docs.length} documents
          </h3>
          <ul>
            {docs.map((doc) => (
              <li key={doc.id}>{doc.fileName}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

// Example 10: Complete workflow example
export function CompleteWorkflowExample() {
  const documents = useAppStore((state) => state.documents);
  const addDocuments = useAppStore((state) => state.addDocuments);
  const setPairs = useAppStore((state) => state.setPairs);
  const setWarnings = useAppStore((state) => state.setWarnings);
  const clearDocuments = useAppStore((state) => state.clearDocuments);

  const handleProcessDocuments = async () => {
    // Simulate document processing workflow
    const mockDocuments: DocumentData[] = [
      {
        id: 'inv-1',
        fileName: 'invoice1.pdf',
        fileType: 'pdf',
        documentType: 'invoice',
        date: '2024-11-01',
        amount: 219.67,
        description: 'Taxi fare',
        confidence: 98,
        status: 'completed',
        invoiceType: 'taxi',
      },
      {
        id: 'trip-1',
        fileName: 'trip1.pdf',
        fileType: 'pdf',
        documentType: 'trip_sheet',
        date: '2024-11-01',
        amount: 219.67,
        description: 'Trip details',
        confidence: 95,
        status: 'completed',
        tripDetails: {
          platform: '如祺出行',
          departure: '嘉兴电子商务产业园',
          destination: '菜鸟智谷产业园',
          time: '10:30',
          distanceKm: 15.2,
        },
      },
    ];

    // Add documents
    addDocuments(mockDocuments);

    // Set pairing results
    setPairs({
      pairs: [
        {
          invoiceId: 'inv-1',
          tripSheetId: 'trip-1',
          confidence: 98,
          matchReason: '金额完全匹配(219.67)，日期相同(11/1)',
        },
      ],
      unmatchedInvoices: [],
      unmatchedTripSheets: [],
    });

    // Set warnings
    setWarnings([
      {
        type: 'date_gap',
        message: '检测到日期间隔较大',
        documentIds: ['inv-1'],
        severity: 'low',
      },
    ]);
  };

  return (
    <div>
      <h2>Complete Workflow</h2>
      <button onClick={handleProcessDocuments}>Process Documents</button>
      <button onClick={clearDocuments}>Clear All</button>
      <p>Total Documents: {documents.length}</p>
    </div>
  );
}
