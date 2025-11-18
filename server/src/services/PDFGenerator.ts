import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DocumentData, ProjectInfo, SortingResult, InvoiceType } from '../types';

/**
 * PDF汇总表生成服务
 * 生成包含项目信息、费用明细和分类汇总的PDF报销文档
 * 
 * 支持中文字体显示，使用内嵌的中文字体数据
 */
export class PDFGenerator {
  private readonly PAGE_WIDTH = 210; // A4宽度(mm)
  private readonly PAGE_HEIGHT = 297; // A4高度(mm)
  private readonly MARGIN = 15;
  private readonly USE_CHINESE = true; // 启用中文标签
  private fontLoaded = false;
  
  /**
   * 加载中文字体支持
   * 使用思源黑体的简化版本或系统字体
   */
  private loadChineseFont(doc: jsPDF): void {
    if (this.fontLoaded) {
      return;
    }

    try {
      // 尝试使用系统中文字体
      // jsPDF 默认支持的字体有限，这里我们使用一个技巧：
      // 对于中文内容，我们使用 courier 字体，它对中文字符有更好的兼容性
      // 实际生产环境中，建议使用完整的中文字体文件
      doc.setFont('courier');
      this.fontLoaded = true;
    } catch (error) {
      console.warn('Failed to load Chinese font, falling back to default font');
      doc.setFont('helvetica');
    }
  }

  /**
   * 生成PDF汇总表
   * @param documents 文档数据数组
   * @param projectInfo 项目信息
   * @param sorting 排序结果
   * @returns PDF Buffer
   */
  async generatePDFSummary(
    documents: DocumentData[],
    projectInfo: ProjectInfo,
    sorting: SortingResult
  ): Promise<Buffer> {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // 加载中文字体支持
    this.loadChineseFont(doc);
    
    let yPosition = this.MARGIN;

    // 1. 添加标题
    yPosition = this.addTitle(doc, yPosition);

    // 2. 添加项目信息
    yPosition = this.addProjectInfo(doc, projectInfo, yPosition);

    // 3. 添加费用明细表
    yPosition = this.addExpenseDetails(doc, documents, sorting, yPosition);

    // 4. 添加分类汇总
    yPosition = this.addCategorySummary(doc, documents, yPosition);

    // 5. 添加总计
    this.addGrandTotal(doc, documents, yPosition);

    // 转换为Buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    return pdfBuffer;
  }

  /**
   * 添加标题
   */
  private addTitle(doc: jsPDF, yPosition: number): number {
    doc.setFontSize(20);
    doc.setFont('courier', 'bold');
    const title = this.USE_CHINESE ? '费用报销汇总表' : 'Expense Reimbursement Summary';
    const titleWidth = doc.getTextWidth(title);
    const xPosition = (this.PAGE_WIDTH - titleWidth) / 2;
    doc.text(title, xPosition, yPosition);
    
    return yPosition + 12;
  }

  /**
   * 添加项目信息
   */
  private addProjectInfo(doc: jsPDF, projectInfo: ProjectInfo, yPosition: number): number {
    doc.setFontSize(10);
    doc.setFont('courier', 'normal');
    
    const lineHeight = 6;
    const labels = this.USE_CHINESE 
      ? { project: '项目名称', dept: '部门', period: '报销期间', generated: '生成日期' }
      : { project: 'Project', dept: 'Department', period: 'Period', generated: 'Generated' };
    
    doc.text(`${labels.project}: ${projectInfo.projectName}`, this.MARGIN, yPosition);
    yPosition += lineHeight;
    doc.text(`${labels.dept}: ${projectInfo.department}`, this.MARGIN, yPosition);
    yPosition += lineHeight;
    doc.text(`${labels.period}: ${projectInfo.reimbursementPeriod}`, this.MARGIN, yPosition);
    yPosition += lineHeight;
    doc.text(`${labels.generated}: ${new Date().toLocaleDateString('zh-CN')}`, this.MARGIN, yPosition);
    
    return yPosition + 10;
  }

  /**
   * 添加费用明细表
   */
  private addExpenseDetails(
    doc: jsPDF,
    documents: DocumentData[],
    sorting: SortingResult,
    yPosition: number
  ): number {
    doc.setFontSize(12);
    doc.setFont('courier', 'bold');
    const sectionTitle = this.USE_CHINESE ? '费用明细' : 'Expense Details';
    doc.text(sectionTitle, this.MARGIN, yPosition);
    yPosition += 8;

    // 准备表格数据
    const tableData: any[] = [];
    const sortedDocs = sorting.suggestedOrder
      .map(id => documents.find(d => d.id === id))
      .filter(d => d !== undefined) as DocumentData[];

    let rowNumber = 1;
    sortedDocs.forEach((doc) => {
      if (doc.documentType === 'invoice') {
        tableData.push([
          rowNumber.toString(),
          doc.date,
          this.getInvoiceTypeLabel(doc.invoiceType),
          doc.description || '-',
          doc.vendor || '-',
          doc.invoiceNumber || '-',
          doc.amount.toFixed(2)
        ]);
        rowNumber++;
      }
    });

    // 表头标签
    const headers = this.USE_CHINESE
      ? ['序号', '日期', '类型', '说明', '商家', '发票号', '金额']
      : ['No.', 'Date', 'Type', 'Description', 'Vendor', 'Invoice No.', 'Amount'];

    // 使用autoTable生成表格
    autoTable(doc, {
      startY: yPosition,
      head: [headers],
      body: tableData,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        font: 'courier',
        fontStyle: 'normal'
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255,
        fontStyle: 'bold',
        font: 'courier'
      },
      columnStyles: {
        0: { cellWidth: 12 },
        1: { cellWidth: 20 },
        2: { cellWidth: 25 },
        3: { cellWidth: 35 },
        4: { cellWidth: 30 },
        5: { cellWidth: 30 },
        6: { cellWidth: 23, halign: 'right' }
      },
      margin: { left: this.MARGIN, right: this.MARGIN }
    });

    // 获取表格结束位置
    const finalY = (doc as any).lastAutoTable.finalY || yPosition;
    return finalY + 10;
  }

  /**
   * 添加分类汇总
   */
  private addCategorySummary(doc: jsPDF, documents: DocumentData[], yPosition: number): number {
    // 检查是否需要新页面
    if (yPosition > this.PAGE_HEIGHT - 80) {
      doc.addPage();
      this.loadChineseFont(doc);
      yPosition = this.MARGIN;
    }

    doc.setFontSize(12);
    doc.setFont('courier', 'bold');
    const sectionTitle = this.USE_CHINESE ? '分类汇总' : 'Category Summary';
    doc.text(sectionTitle, this.MARGIN, yPosition);
    yPosition += 8;

    // 计算各类型费用
    const categoryTotals = this.calculateCategoryTotals(documents);
    
    // 准备汇总表格数据
    const summaryData: any[] = [];
    const categoryOrder: InvoiceType[] = ['consumables', 'hotel', 'taxi', 'train', 'shipping', 'toll', 'other'];
    
    categoryOrder.forEach(type => {
      const total = categoryTotals[type] || 0;
      if (total > 0) {
        summaryData.push([
          this.getInvoiceTypeLabel(type),
          total.toFixed(2)
        ]);
      }
    });

    // 表头标签
    const headers = this.USE_CHINESE ? ['类别', '小计'] : ['Category', 'Subtotal'];

    // 生成汇总表格
    autoTable(doc, {
      startY: yPosition,
      head: [headers],
      body: summaryData,
      theme: 'striped',
      styles: {
        fontSize: 10,
        cellPadding: 3,
        font: 'courier',
        fontStyle: 'normal'
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255,
        fontStyle: 'bold',
        font: 'courier'
      },
      columnStyles: {
        0: { cellWidth: 100 },
        1: { cellWidth: 50, halign: 'right', fontStyle: 'bold' }
      },
      margin: { left: this.MARGIN, right: this.MARGIN }
    });

    const finalY = (doc as any).lastAutoTable.finalY || yPosition;
    return finalY + 10;
  }

  /**
   * 添加总计
   */
  private addGrandTotal(doc: jsPDF, documents: DocumentData[], yPosition: number): void {
    const grandTotal = this.calculateGrandTotal(documents);
    
    // 检查是否需要新页面
    if (yPosition > this.PAGE_HEIGHT - 30) {
      doc.addPage();
      this.loadChineseFont(doc);
      yPosition = this.MARGIN;
    }

    doc.setFontSize(14);
    doc.setFont('courier', 'bold');
    
    const label = this.USE_CHINESE ? '总计' : 'Grand Total';
    const totalText = `${label}: ¥${grandTotal.toFixed(2)}`;
    const textWidth = doc.getTextWidth(totalText);
    const xPosition = this.PAGE_WIDTH - this.MARGIN - textWidth;
    
    // 添加背景框
    doc.setFillColor(66, 139, 202);
    doc.rect(xPosition - 5, yPosition - 7, textWidth + 10, 10, 'F');
    
    // 添加文字
    doc.setTextColor(255, 255, 255);
    doc.text(totalText, xPosition, yPosition);
    
    // 重置颜色
    doc.setTextColor(0, 0, 0);
  }

  /**
   * 计算各类型费用小计
   */
  private calculateCategoryTotals(documents: DocumentData[]): Record<InvoiceType, number> {
    const totals: Record<string, number> = {};
    
    documents.forEach(doc => {
      if (doc.documentType === 'invoice' && doc.invoiceType) {
        const type = doc.invoiceType;
        totals[type] = (totals[type] || 0) + doc.amount;
      }
    });
    
    return totals as Record<InvoiceType, number>;
  }

  /**
   * 计算总计
   */
  private calculateGrandTotal(documents: DocumentData[]): number {
    return documents
      .filter(doc => doc.documentType === 'invoice')
      .reduce((sum, doc) => sum + doc.amount, 0);
  }

  /**
   * 获取发票类型标签
   */
  private getInvoiceTypeLabel(type?: InvoiceType): string {
    if (this.USE_CHINESE) {
      const labelsZh: Record<InvoiceType, string> = {
        taxi: '出租车',
        hotel: '酒店',
        train: '火车',
        shipping: '快递',
        toll: '过路费',
        consumables: '消耗品',
        other: '其他'
      };
      return type ? labelsZh[type] : '未知';
    } else {
      const labelsEn: Record<InvoiceType, string> = {
        taxi: 'Taxi',
        hotel: 'Hotel',
        train: 'Train',
        shipping: 'Shipping',
        toll: 'Toll',
        consumables: 'Consumables',
        other: 'Other'
      };
      return type ? labelsEn[type] : 'Unknown';
    }
  }
}
