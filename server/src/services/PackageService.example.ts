/**
 * PackageService 使用示例
 * 展示如何使用文件打包服务生成 ZIP 包
 */

import { packageService } from './PackageService';
import { DocumentData, SortingResult, ProjectInfo } from '../types';

// ============================================================
// 示例 1: 基本使用 - 生成文件名映射
// ============================================================

export function example1_GenerateFileNames() {
  const documents: DocumentData[] = [
    {
      id: 'doc1',
      fileName: 'invoice_001.pdf',
      fileType: 'pdf',
      documentType: 'invoice',
      date: '2024-11-01',
      amount: 100.00,
      description: '办公用品',
      confidence: 95,
      invoiceType: 'consumables',
      status: 'completed'
    },
    {
      id: 'doc2',
      fileName: 'hotel_receipt.jpg',
      fileType: 'image',
      documentType: 'invoice',
      date: '2024-11-02',
      amount: 450.00,
      description: '酒店住宿',
      confidence: 92,
      invoiceType: 'hotel',
      status: 'completed'
    }
  ];

  const sorting: SortingResult = {
    suggestedOrder: ['doc2', 'doc1'], // 酒店优先，然后是消耗品
    grouping: {
      hotel: ['doc2'],
      consumables: ['doc1']
    }
  };

  // 生成文件名映射
  const fileNames = packageService.generateFileNames(documents, sorting);
  
  console.log('生成的文件名:');
  fileNames.forEach((newName, docId) => {
    const doc = documents.find(d => d.id === docId);
    console.log(`${doc?.fileName} -> ${newName}`);
  });
  
  // 输出:
  // hotel_receipt.jpg -> 01_hotel_receipt.jpg
  // invoice_001.pdf -> 02_invoice_001.pdf
}

// ============================================================
// 示例 2: 生成完整的 ZIP 包
// ============================================================

export async function example2_GeneratePackage() {
  const documents: DocumentData[] = [
    {
      id: 'doc1',
      fileName: 'taxi_invoice.pdf',
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
    }
  ];

  const sorting: SortingResult = {
    suggestedOrder: ['doc1', 'doc2'],
    grouping: {
      taxi: ['doc1', 'doc2']
    }
  };

  const projectInfo: ProjectInfo = {
    projectName: '客户拜访项目',
    department: '销售部',
    reimbursementPeriod: '2024-11'
  };

  // 准备文件 Buffer（实际使用中从上传的文件获取）
  const fileBuffers = new Map<string, Buffer>();
  fileBuffers.set('doc1', Buffer.from('PDF content for taxi invoice'));
  fileBuffers.set('doc2', Buffer.from('Image content for trip sheet'));

  // 生成 ZIP 包
  const zipBuffer = await packageService.generatePackage(
    documents,
    sorting,
    projectInfo,
    fileBuffers
  );

  console.log(`ZIP 包生成成功，大小: ${zipBuffer.length} bytes`);
  
  // 在实际应用中，可以将 zipBuffer 保存到文件或发送给客户端
  // fs.writeFileSync('expense_package.zip', zipBuffer);
  
  return zipBuffer;
}

// ============================================================
// 示例 3: 在 Express 路由中使用
// ============================================================

export function example3_ExpressRoute() {
  // 这是一个伪代码示例，展示如何在 Express 路由中使用

  /*
  router.post('/api/generate-package', uploadMultiple, async (req, res, next) => {
    try {
      // 1. 从请求中获取数据
      const documents = JSON.parse(req.body.documents);
      const sorting = JSON.parse(req.body.sorting);
      const projectInfo = JSON.parse(req.body.projectInfo);
      
      // 2. 创建文件 Buffer 映射
      const fileBuffers = new Map<string, Buffer>();
      req.files.forEach((file, index) => {
        if (documents[index]) {
          fileBuffers.set(documents[index].id, file.buffer);
        }
      });
      
      // 3. 生成 ZIP 包
      const zipBuffer = await packageService.generatePackage(
        documents,
        sorting,
        projectInfo,
        fileBuffers
      );
      
      // 4. 设置响应头并发送文件
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="expense_package.zip"');
      res.send(zipBuffer);
      
    } catch (error) {
      next(error);
    }
  });
  */
}

// ============================================================
// 示例 4: 处理大量文件
// ============================================================

export async function example4_LargeFileSet() {
  // 模拟大量文档
  const documents: DocumentData[] = [];
  const fileBuffers = new Map<string, Buffer>();
  
  for (let i = 1; i <= 50; i++) {
    const docId = `doc${i}`;
    documents.push({
      id: docId,
      fileName: `invoice_${i.toString().padStart(3, '0')}.pdf`,
      fileType: 'pdf',
      documentType: 'invoice',
      date: `2024-11-${(i % 30 + 1).toString().padStart(2, '0')}`,
      amount: Math.random() * 1000,
      description: `费用 ${i}`,
      confidence: 90 + Math.random() * 10,
      invoiceType: ['taxi', 'hotel', 'consumables'][i % 3] as any,
      status: 'completed'
    });
    
    // 模拟文件内容
    fileBuffers.set(docId, Buffer.from(`Content for document ${i}`));
  }

  const sorting: SortingResult = {
    suggestedOrder: documents.map(d => d.id),
    grouping: {
      taxi: documents.filter(d => d.invoiceType === 'taxi').map(d => d.id),
      hotel: documents.filter(d => d.invoiceType === 'hotel').map(d => d.id),
      consumables: documents.filter(d => d.invoiceType === 'consumables').map(d => d.id)
    }
  };

  const projectInfo: ProjectInfo = {
    projectName: '大型项目',
    department: '项目部',
    reimbursementPeriod: '2024-11'
  };

  console.log(`处理 ${documents.length} 个文档...`);
  
  const startTime = Date.now();
  const zipBuffer = await packageService.generatePackage(
    documents,
    sorting,
    projectInfo,
    fileBuffers
  );
  const endTime = Date.now();

  console.log(`ZIP 包生成完成:`);
  console.log(`- 文件数量: ${documents.length}`);
  console.log(`- ZIP 大小: ${(zipBuffer.length / 1024).toFixed(2)} KB`);
  console.log(`- 处理时间: ${endTime - startTime} ms`);
  
  return zipBuffer;
}

// ============================================================
// 示例 5: 错误处理
// ============================================================

export async function example5_ErrorHandling() {
  try {
    const documents: DocumentData[] = [];
    const sorting: SortingResult = {
      suggestedOrder: [],
      grouping: {}
    };
    const projectInfo: ProjectInfo = {
      projectName: '',
      department: '',
      reimbursementPeriod: ''
    };
    const fileBuffers = new Map<string, Buffer>();

    // 这会因为文档为空而失败
    await packageService.generatePackage(
      documents,
      sorting,
      projectInfo,
      fileBuffers
    );
    
  } catch (error) {
    console.error('捕获到错误:', error);
    
    // 在实际应用中，应该返回友好的错误消息给用户
    if (error instanceof Error) {
      console.log('错误消息:', error.message);
    }
  }
}

// ============================================================
// 运行示例
// ============================================================

async function runExamples() {
  console.log('='.repeat(60));
  console.log('PackageService 使用示例');
  console.log('='.repeat(60));
  console.log();

  console.log('示例 1: 生成文件名映射');
  console.log('-'.repeat(60));
  example1_GenerateFileNames();
  console.log();

  console.log('示例 2: 生成完整的 ZIP 包');
  console.log('-'.repeat(60));
  await example2_GeneratePackage();
  console.log();

  console.log('示例 4: 处理大量文件');
  console.log('-'.repeat(60));
  await example4_LargeFileSet();
  console.log();

  console.log('示例 5: 错误处理');
  console.log('-'.repeat(60));
  await example5_ErrorHandling();
  console.log();
}

// 如果直接运行此文件，执行示例
if (require.main === module) {
  runExamples().catch(console.error);
}
