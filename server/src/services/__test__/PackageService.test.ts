import { packageService } from '../PackageService';
import { DocumentData, SortingResult, ProjectInfo } from '../../types';

/**
 * 简单的PackageService功能测试
 * 验证核心功能：文件重命名和ZIP打包
 */

// 测试数据
const mockDocuments: DocumentData[] = [
  {
    id: 'doc1',
    fileName: 'invoice_taxi.pdf',
    fileType: 'pdf',
    documentType: 'invoice',
    date: '2024-11-01',
    amount: 219.67,
    description: '出租车费用',
    confidence: 95,
    invoiceType: 'taxi',
    invoiceNumber: 'INV001',
    vendor: '如祺出行',
    status: 'completed'
  },
  {
    id: 'doc2',
    fileName: 'trip_sheet.jpg',
    fileType: 'image',
    documentType: 'trip_sheet',
    date: '2024-11-01',
    amount: 219.67,
    description: '行程单',
    confidence: 98,
    tripDetails: {
      platform: '如祺出行',
      departure: '嘉兴电子商务产业园',
      destination: '菜鸟智谷产业园',
      time: '14:30',
      distanceKm: 15.2
    },
    status: 'completed'
  },
  {
    id: 'doc3',
    fileName: 'hotel_invoice.pdf',
    fileType: 'pdf',
    documentType: 'invoice',
    date: '2024-11-02',
    amount: 450.00,
    description: '酒店住宿',
    confidence: 92,
    invoiceType: 'hotel',
    invoiceNumber: 'INV002',
    vendor: '如家酒店',
    status: 'completed'
  }
];

const mockSorting: SortingResult = {
  suggestedOrder: ['doc3', 'doc1', 'doc2'],
  grouping: {
    hotel: ['doc3'],
    taxi: ['doc1', 'doc2']
  }
};

const mockProjectInfo: ProjectInfo = {
  projectName: '测试项目',
  department: '技术部',
  reimbursementPeriod: '2024-11'
};

async function testPackageService() {
  console.log('开始测试 PackageService...\n');

  try {
    // 测试1: 生成文件名
    console.log('测试1: 生成文件名映射');
    const fileNames = packageService.generateFileNames(mockDocuments, mockSorting);
    console.log('生成的文件名:');
    fileNames.forEach((newName, docId) => {
      const doc = mockDocuments.find(d => d.id === docId);
      console.log(`  ${doc?.fileName} -> ${newName}`);
    });
    console.log('✓ 文件名生成成功\n');

    // 测试2: 生成ZIP包
    console.log('测试2: 生成ZIP包');
    const mockFileBuffers = new Map<string, Buffer>();
    mockDocuments.forEach(doc => {
      // 创建模拟的文件内容
      mockFileBuffers.set(doc.id, Buffer.from(`Mock content for ${doc.fileName}`));
    });

    const zipBuffer = await packageService.generatePackage(
      mockDocuments,
      mockSorting,
      mockProjectInfo,
      mockFileBuffers
    );

    console.log(`ZIP包大小: ${zipBuffer.length} bytes`);
    console.log('✓ ZIP包生成成功\n');

    console.log('所有测试通过! ✓');
  } catch (error) {
    console.error('测试失败:', error);
    process.exit(1);
  }
}

// 运行测试
if (require.main === module) {
  testPackageService();
}

export { testPackageService };
