/**
 * PDFGenerator Usage Example
 * 
 * This file demonstrates how to use the PDFGenerator service
 * to create expense reimbursement summary PDFs.
 */

import { PDFGenerator } from './PDFGenerator';
import { DocumentData, ProjectInfo, SortingResult } from '../types';
import * as fs from 'fs';
import * as path from 'path';

// Example usage
async function generateExamplePDF() {
  const pdfGenerator = new PDFGenerator();

  // Sample project information
  const projectInfo: ProjectInfo = {
    projectName: 'Q1 2024 Business Trip',
    department: 'Sales Department',
    reimbursementPeriod: '2024-01-01 to 2024-01-31'
  };

  // Sample documents
  const documents: DocumentData[] = [
    {
      id: 'doc-1',
      fileName: 'taxi_invoice_001.pdf',
      fileType: 'pdf',
      documentType: 'invoice',
      date: '2024-01-15',
      amount: 219.67,
      description: 'Taxi from airport to hotel',
      confidence: 98,
      invoiceType: 'taxi',
      vendor: 'City Taxi Service',
      invoiceNumber: 'TX-20240115-001',
      status: 'completed'
    },
    {
      id: 'doc-2',
      fileName: 'hotel_invoice_001.pdf',
      fileType: 'pdf',
      documentType: 'invoice',
      date: '2024-01-16',
      amount: 850.00,
      description: 'Hotel accommodation - 2 nights',
      confidence: 99,
      invoiceType: 'hotel',
      vendor: 'Grand Plaza Hotel',
      invoiceNumber: 'HTL-20240116-001',
      status: 'completed'
    },
    {
      id: 'doc-3',
      fileName: 'consumables_001.pdf',
      fileType: 'pdf',
      documentType: 'invoice',
      date: '2024-01-17',
      amount: 125.50,
      description: 'Office supplies and materials',
      confidence: 95,
      invoiceType: 'consumables',
      vendor: 'Office Supplies Co.',
      invoiceNumber: 'CS-20240117-001',
      status: 'completed'
    },
    {
      id: 'doc-4',
      fileName: 'train_ticket_001.pdf',
      fileType: 'pdf',
      documentType: 'invoice',
      date: '2024-01-18',
      amount: 320.00,
      description: 'Train ticket - Business class',
      confidence: 97,
      invoiceType: 'train',
      vendor: 'National Railway',
      invoiceNumber: 'TRN-20240118-001',
      status: 'completed'
    },
    {
      id: 'doc-5',
      fileName: 'shipping_001.pdf',
      fileType: 'pdf',
      documentType: 'invoice',
      date: '2024-01-20',
      amount: 45.80,
      description: 'Document shipping',
      confidence: 94,
      invoiceType: 'shipping',
      vendor: 'Express Courier',
      invoiceNumber: 'SHP-20240120-001',
      status: 'completed'
    }
  ];

  // Sample sorting result (按照报销规范排序：consumables > hotel > taxi > train > shipping)
  const sorting: SortingResult = {
    suggestedOrder: ['doc-3', 'doc-2', 'doc-1', 'doc-4', 'doc-5'],
    grouping: {
      consumables: ['doc-3'],
      hotel: ['doc-2'],
      taxi: ['doc-1'],
      train: ['doc-4'],
      shipping: ['doc-5']
    }
  };

  try {
    // Generate PDF
    console.log('Generating PDF summary...');
    const pdfBuffer = await pdfGenerator.generatePDFSummary(
      documents,
      projectInfo,
      sorting
    );

    // Save to file (for demonstration purposes)
    const outputPath = path.join(__dirname, '../../temp/expense_summary.pdf');
    const outputDir = path.dirname(outputPath);
    
    // Create temp directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, pdfBuffer);
    console.log(`PDF generated successfully: ${outputPath}`);
    console.log(`File size: ${(pdfBuffer.length / 1024).toFixed(2)} KB`);
    
    // Calculate totals
    const grandTotal = documents
      .filter(d => d.documentType === 'invoice')
      .reduce((sum, d) => sum + d.amount, 0);
    
    console.log(`\nSummary:`);
    console.log(`- Total documents: ${documents.length}`);
    console.log(`- Grand total: $${grandTotal.toFixed(2)}`);
    console.log(`- Categories: ${Object.keys(sorting.grouping).length}`);

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

// Run example if this file is executed directly
if (require.main === module) {
  generateExamplePDF()
    .then(() => {
      console.log('\nExample completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\nExample failed:', error);
      process.exit(1);
    });
}

export { generateExamplePDF };
