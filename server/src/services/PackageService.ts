import archiver from 'archiver';
import { Readable } from 'stream';
import { DocumentData, SortingResult, ProjectInfo } from '../types';

/**
 * 文件打包服务
 * 负责将文档按排序顺序重命名并打包成ZIP文件
 */
export class PackageService {
  /**
   * 生成完整的文件包
   * @param documents 文档数据数组
   * @param sorting 排序结果
   * @param projectInfo 项目信息
   * @param fileBuffers 文件内容的Map，key为文档ID，value为文件Buffer
   * @returns ZIP文件的Buffer
   */
  async generatePackage(
    documents: DocumentData[],
    sorting: SortingResult,
    projectInfo: ProjectInfo,
    fileBuffers: Map<string, Buffer>
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const archive = archiver('zip', {
        zlib: { level: 9 } // 最高压缩级别
      });

      const chunks: Buffer[] = [];

      // 收集数据块
      archive.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      // 完成时返回完整Buffer
      archive.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve(buffer);
      });

      // 错误处理
      archive.on('error', (err: Error) => {
        reject(err);
      });

      // 按排序顺序添加文件
      const sortedDocs = sorting.suggestedOrder
        .map(id => documents.find(d => d.id === id))
        .filter(d => d !== undefined) as DocumentData[];

      let fileNumber = 1;
      sortedDocs.forEach((doc) => {
        const fileBuffer = fileBuffers.get(doc.id);
        if (fileBuffer) {
          // 生成新文件名：编号_原文件名
          const paddedNumber = fileNumber.toString().padStart(2, '0');
          const newFileName = `${paddedNumber}_${doc.fileName}`;
          
          // 添加文件到ZIP
          archive.append(fileBuffer, { name: newFileName });
          fileNumber++;
        }
      });

      // 添加项目信息文件
      const projectInfoContent = this.generateProjectInfoText(projectInfo, documents, sorting);
      archive.append(projectInfoContent, { name: 'project_info.txt' });

      // 完成打包
      archive.finalize();
    });
  }

  /**
   * 生成项目信息文本
   */
  private generateProjectInfoText(
    projectInfo: ProjectInfo,
    documents: DocumentData[],
    sorting: SortingResult
  ): string {
    const lines: string[] = [];
    
    lines.push('='.repeat(60));
    lines.push('项目信息 / Project Information');
    lines.push('='.repeat(60));
    lines.push('');
    lines.push(`项目名称 / Project Name: ${projectInfo.projectName}`);
    lines.push(`部门 / Department: ${projectInfo.department}`);
    lines.push(`报销期间 / Period: ${projectInfo.reimbursementPeriod}`);
    lines.push(`生成日期 / Generated: ${new Date().toLocaleString('zh-CN')}`);
    lines.push('');
    lines.push('='.repeat(60));
    lines.push('文件清单 / File List');
    lines.push('='.repeat(60));
    lines.push('');

    // 按排序顺序列出文件
    const sortedDocs = sorting.suggestedOrder
      .map(id => documents.find(d => d.id === id))
      .filter(d => d !== undefined) as DocumentData[];

    let fileNumber = 1;
    sortedDocs.forEach((doc) => {
      const paddedNumber = fileNumber.toString().padStart(2, '0');
      const typeLabel = doc.documentType === 'invoice' ? '发票/Invoice' : '行程单/Trip Sheet';
      const invoiceTypeLabel = doc.invoiceType ? ` (${this.getInvoiceTypeLabel(doc.invoiceType)})` : '';
      
      lines.push(`${paddedNumber}. ${doc.fileName}`);
      lines.push(`    类型 / Type: ${typeLabel}${invoiceTypeLabel}`);
      lines.push(`    日期 / Date: ${doc.date}`);
      lines.push(`    金额 / Amount: ${doc.amount.toFixed(2)}`);
      if (doc.description) {
        lines.push(`    说明 / Description: ${doc.description}`);
      }
      lines.push('');
      
      fileNumber++;
    });

    // 添加统计信息
    lines.push('='.repeat(60));
    lines.push('统计信息 / Statistics');
    lines.push('='.repeat(60));
    lines.push('');
    
    const invoiceCount = documents.filter(d => d.documentType === 'invoice').length;
    const tripSheetCount = documents.filter(d => d.documentType === 'trip_sheet').length;
    const totalAmount = documents
      .filter(d => d.documentType === 'invoice')
      .reduce((sum, d) => sum + d.amount, 0);

    lines.push(`发票数量 / Invoice Count: ${invoiceCount}`);
    lines.push(`行程单数量 / Trip Sheet Count: ${tripSheetCount}`);
    lines.push(`总金额 / Total Amount: ${totalAmount.toFixed(2)}`);
    lines.push('');

    // 分类统计
    const categoryTotals = this.calculateCategoryTotals(documents);
    if (Object.keys(categoryTotals).length > 0) {
      lines.push('分类汇总 / Category Summary:');
      Object.entries(categoryTotals).forEach(([type, amount]) => {
        const label = this.getInvoiceTypeLabel(type as any);
        lines.push(`  ${label}: ${amount.toFixed(2)}`);
      });
    }

    return lines.join('\n');
  }

  /**
   * 计算各类型费用小计
   */
  private calculateCategoryTotals(documents: DocumentData[]): Record<string, number> {
    const totals: Record<string, number> = {};
    
    documents.forEach(doc => {
      if (doc.documentType === 'invoice' && doc.invoiceType) {
        const type = doc.invoiceType;
        totals[type] = (totals[type] || 0) + doc.amount;
      }
    });
    
    return totals;
  }

  /**
   * 获取发票类型标签
   */
  private getInvoiceTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      taxi: '出租车/Taxi',
      hotel: '酒店/Hotel',
      train: '火车/Train',
      shipping: '快递/Shipping',
      toll: '过路费/Toll',
      consumables: '消耗品/Consumables',
      other: '其他/Other'
    };
    return labels[type] || '未知/Unknown';
  }

  /**
   * 生成文件名建议
   * @param documents 文档数据数组
   * @param sorting 排序结果
   * @returns 重命名后的文件名数组
   */
  generateFileNames(documents: DocumentData[], sorting: SortingResult): Map<string, string> {
    const fileNames = new Map<string, string>();
    
    const sortedDocs = sorting.suggestedOrder
      .map(id => documents.find(d => d.id === id))
      .filter(d => d !== undefined) as DocumentData[];

    let fileNumber = 1;
    sortedDocs.forEach((doc) => {
      const paddedNumber = fileNumber.toString().padStart(2, '0');
      const newFileName = `${paddedNumber}_${doc.fileName}`;
      fileNames.set(doc.id, newFileName);
      fileNumber++;
    });

    return fileNames;
  }
}

// 导出单例
export const packageService = new PackageService();
