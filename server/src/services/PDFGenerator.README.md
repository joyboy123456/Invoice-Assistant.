# PDFGenerator Service

## Overview

The `PDFGenerator` service creates professional PDF expense reimbursement summary documents with the following features:

- Project information header
- Detailed expense table with all invoice information
- Category-based expense summary
- Grand total calculation
- Professional formatting with tables and styling

## Features

✅ **Complete Implementation**
- Generates PDF documents using jsPDF and jspdf-autotable
- Includes project information (name, department, period)
- Creates detailed expense table with all invoice fields
- Calculates category subtotals (consumables, hotel, taxi, train, shipping, toll, other)
- Displays grand total with highlighted formatting
- Supports pagination for large datasets
- Professional table layouts with grid and striped themes

✅ **Multi-language Support**
- English labels (default)
- Chinese labels (configurable via `USE_CHINESE` flag)
- Note: Chinese text rendering requires additional font configuration (see below)

## Usage

### Basic Usage

```typescript
import { PDFGenerator } from './services/PDFGenerator';
import { DocumentData, ProjectInfo, SortingResult } from './types';

const pdfGenerator = new PDFGenerator();

const projectInfo: ProjectInfo = {
  projectName: 'Q1 2024 Business Trip',
  department: 'Sales Department',
  reimbursementPeriod: '2024-01-01 to 2024-01-31'
};

const documents: DocumentData[] = [
  // ... your document data
];

const sorting: SortingResult = {
  suggestedOrder: ['doc-1', 'doc-2', 'doc-3'],
  grouping: {
    consumables: ['doc-1'],
    hotel: ['doc-2'],
    taxi: ['doc-3']
  }
};

const pdfBuffer = await pdfGenerator.generatePDFSummary(
  documents,
  projectInfo,
  sorting
);

// Save to file or send as response
fs.writeFileSync('expense_summary.pdf', pdfBuffer);
```

### Express.js Integration

```typescript
import express from 'express';
import { PDFGenerator } from './services/PDFGenerator';

const app = express();
const pdfGenerator = new PDFGenerator();

app.post('/api/generate-pdf', async (req, res) => {
  try {
    const { documents, projectInfo, sorting } = req.body;
    
    const pdfBuffer = await pdfGenerator.generatePDFSummary(
      documents,
      projectInfo,
      sorting
    );
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=expense_summary.pdf');
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});
```

## Chinese Font Support

### Current Implementation

The current implementation uses the built-in Helvetica font, which supports English text but has limited Chinese character support. Chinese labels are available but may not render correctly without additional configuration.

### Adding Chinese Font Support

To enable full Chinese text rendering, you have several options:

#### Option 1: Using jspdf-font-loader (Recommended)

```bash
npm install jspdf-font-loader
```

```typescript
import { PDFGenerator } from './services/PDFGenerator';
import { loadFont } from 'jspdf-font-loader';

// Load Chinese font (e.g., Source Han Sans / Noto Sans CJK)
const fontData = await loadFont('path/to/SourceHanSans-Regular.ttf');

// Modify PDFGenerator to use custom font
// In generatePDFSummary method:
doc.addFileToVFS('SourceHanSans-Regular.ttf', fontData);
doc.addFont('SourceHanSans-Regular.ttf', 'SourceHanSans', 'normal');
doc.setFont('SourceHanSans');
```

#### Option 2: Using Base64 Encoded Font

1. Convert font file to base64:
```bash
base64 SourceHanSans-Regular.ttf > font.base64.txt
```

2. Add to PDFGenerator:
```typescript
const fontBase64 = 'AAEAAAALAIAAAwAwT1MvMg8SBfAAAAC8AAAA...'; // Your base64 font data

doc.addFileToVFS('SourceHanSans-Regular.ttf', fontBase64);
doc.addFont('SourceHanSans-Regular.ttf', 'SourceHanSans', 'normal');
doc.setFont('SourceHanSans');
```

#### Option 3: Using Google Fonts

```typescript
import { jsPDF } from 'jspdf';

// Use a web-safe font that supports Chinese
// Note: This requires internet connection during PDF generation
```

### Recommended Chinese Fonts

- **Source Han Sans (思源黑体)** - Open source, excellent CJK support
- **Noto Sans CJK** - Google's open source CJK font
- **Microsoft YaHei (微软雅黑)** - Good for Windows environments
- **PingFang SC (苹方)** - Good for macOS environments

### Enabling Chinese Labels

To enable Chinese labels in the PDF, modify the `USE_CHINESE` flag in `PDFGenerator.ts`:

```typescript
export class PDFGenerator {
  private readonly USE_CHINESE = true; // Set to true for Chinese labels
  // ...
}
```

## PDF Structure

The generated PDF includes the following sections:

1. **Title**: "Expense Reimbursement Summary" / "费用报销汇总表"
2. **Project Information**:
   - Project name
   - Department
   - Reimbursement period
   - Generation date
3. **Expense Details Table**:
   - Sequential number
   - Date
   - Expense type
   - Description
   - Vendor
   - Invoice number
   - Amount
4. **Category Summary**:
   - Subtotals by expense type
5. **Grand Total**:
   - Total amount with highlighted formatting

## Customization

### Styling

You can customize the PDF appearance by modifying these constants in `PDFGenerator.ts`:

```typescript
private readonly PAGE_WIDTH = 210;  // A4 width in mm
private readonly PAGE_HEIGHT = 297; // A4 height in mm
private readonly MARGIN = 15;       // Page margins in mm
```

### Colors

Modify the color scheme in the table styles:

```typescript
headStyles: {
  fillColor: [66, 139, 202],  // RGB values for header background
  textColor: 255,              // White text
  fontStyle: 'bold'
}
```

### Table Layout

Adjust column widths in the `columnStyles` configuration:

```typescript
columnStyles: {
  0: { cellWidth: 12 },  // No. column
  1: { cellWidth: 20 },  // Date column
  2: { cellWidth: 25 },  // Type column
  // ... etc
}
```

## Requirements Satisfied

This implementation satisfies the following requirements from the specification:

- ✅ **Requirement 6.1**: Generate PDF summary table with expense details
- ✅ **Requirement 6.4**: Calculate and display category subtotals and grand total
- ✅ **Requirement 10.3**: Include project information in generated documents

## Dependencies

- `jspdf` (^3.0.3) - PDF generation library
- `jspdf-autotable` (^5.0.2) - Table generation for jsPDF

## Example Output

Run the example file to see the PDFGenerator in action:

```bash
npx ts-node src/services/PDFGenerator.example.ts
```

This will generate a sample PDF at `server/temp/expense_summary.pdf`.

## Troubleshooting

### Issue: Chinese characters not displaying

**Solution**: Add Chinese font support using one of the methods described above.

### Issue: PDF file is too large

**Solution**: Use compressed font files or subset fonts to include only required characters.

### Issue: Table overflows page

**Solution**: The PDFGenerator automatically handles pagination. Ensure your data is properly formatted.

## Future Enhancements

Potential improvements for future versions:

- [ ] Add watermark support
- [ ] Include document thumbnails
- [ ] Add digital signature support
- [ ] Export to Excel format
- [ ] Add chart/graph visualizations
- [ ] Support custom templates
- [ ] Add QR code for verification

## License

This service is part of the AI Invoice Organizer project.
