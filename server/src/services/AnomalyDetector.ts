import { DocumentData, Warning, PairingResult } from '../types';

/**
 * 异常检测服务
 * 检测文档中的各种异常情况，包括重复、金额异常、日期间隔、缺失配对等
 */
export class AnomalyDetector {
  /**
   * 检测所有异常
   * @param documents 文档列表
   * @param pairingResult 配对结果（可选）
   * @returns 警告列表
   */
  detectAnomalies(documents: DocumentData[], pairingResult?: PairingResult): Warning[] {
    const warnings: Warning[] = [];

    // 1. 检测重复发票
    warnings.push(...this.detectDuplicates(documents));

    // 2. 检测异常金额
    warnings.push(...this.detectAmountAnomalies(documents));

    // 3. 检测日期间隔
    warnings.push(...this.detectDateGaps(documents));

    // 4. 检测缺失配对（如果提供了配对结果）
    if (pairingResult) {
      warnings.push(...this.detectMissingPairs(documents, pairingResult));
    }

    return warnings;
  }

  /**
   * 检测重复发票
   * 基于发票号和金额识别可能的重复发票
   * @param documents 文档列表
   * @returns 重复发票警告列表
   */
  detectDuplicates(documents: DocumentData[]): Warning[] {
    const warnings: Warning[] = [];
    const invoices = documents.filter(doc => doc.documentType === 'invoice');

    // 按发票号分组
    const invoicesByNumber = new Map<string, DocumentData[]>();
    
    for (const invoice of invoices) {
      if (invoice.invoiceNumber) {
        const key = invoice.invoiceNumber;
        if (!invoicesByNumber.has(key)) {
          invoicesByNumber.set(key, []);
        }
        invoicesByNumber.get(key)!.push(invoice);
      }
    }

    // 检查发票号重复
    for (const [invoiceNumber, docs] of invoicesByNumber.entries()) {
      if (docs.length > 1) {
        warnings.push({
          type: 'duplicate',
          message: `检测到重复发票号: ${invoiceNumber}`,
          documentIds: docs.map(d => d.id),
          severity: 'high'
        });
      }
    }

    // 按金额+日期分组检测可能的重复（针对没有发票号的情况）
    const invoicesByAmountDate = new Map<string, DocumentData[]>();
    
    for (const invoice of invoices) {
      // 只检查没有发票号或发票号未重复的发票
      if (!invoice.invoiceNumber || !invoicesByNumber.get(invoice.invoiceNumber) || 
          invoicesByNumber.get(invoice.invoiceNumber)!.length === 1) {
        const key = `${invoice.amount.toFixed(2)}_${invoice.date}`;
        if (!invoicesByAmountDate.has(key)) {
          invoicesByAmountDate.set(key, []);
        }
        invoicesByAmountDate.get(key)!.push(invoice);
      }
    }

    // 检查金额+日期重复
    for (const [key, docs] of invoicesByAmountDate.entries()) {
      if (docs.length > 1) {
        const [amount, date] = key.split('_');
        warnings.push({
          type: 'duplicate',
          message: `检测到可能的重复发票: 相同金额(${amount})和日期(${date})`,
          documentIds: docs.map(d => d.id),
          severity: 'medium'
        });
      }
    }

    return warnings;
  }

  /**
   * 检测异常金额
   * 标记明显过高或过低的金额
   * @param documents 文档列表
   * @returns 金额异常警告列表
   */
  detectAmountAnomalies(documents: DocumentData[]): Warning[] {
    const warnings: Warning[] = [];
    const invoices = documents.filter(doc => doc.documentType === 'invoice');

    // 按费用类型分组
    const invoicesByType = new Map<string, DocumentData[]>();
    
    for (const invoice of invoices) {
      const type = invoice.invoiceType || 'other';
      if (!invoicesByType.has(type)) {
        invoicesByType.set(type, []);
      }
      invoicesByType.get(type)!.push(invoice);
    }

    // 为每种类型检测异常金额
    for (const [type, typeInvoices] of invoicesByType.entries()) {
      if (typeInvoices.length < 2) {
        // 样本太少，无法判断异常
        continue;
      }

      // 计算该类型的金额统计信息
      const amounts = typeInvoices.map(inv => inv.amount).sort((a, b) => a - b);
      const stats = this.calculateAmountStats(amounts);

      // 检测异常值
      for (const invoice of typeInvoices) {
        const anomaly = this.isAmountAnomaly(invoice.amount, stats, type);
        
        if (anomaly) {
          warnings.push({
            type: 'amount_anomaly',
            message: anomaly.message,
            documentIds: [invoice.id],
            severity: anomaly.severity
          });
        }
      }
    }

    return warnings;
  }

  /**
   * 检测日期间隔
   * 识别日期序列中的不连续情况
   * @param documents 文档列表
   * @returns 日期间隔警告列表
   */
  detectDateGaps(documents: DocumentData[]): Warning[] {
    const warnings: Warning[] = [];

    // 解析并排序所有文档的日期
    const docsWithDates = documents
      .map(doc => ({
        doc,
        date: this.parseDate(doc.date)
      }))
      .filter(item => item.date !== null)
      .sort((a, b) => a.date!.getTime() - b.date!.getTime());

    if (docsWithDates.length < 2) {
      // 文档太少，无法检测间隔
      return warnings;
    }

    // 检测连续日期之间的间隔
    for (let i = 1; i < docsWithDates.length; i++) {
      const prev = docsWithDates[i - 1];
      const curr = docsWithDates[i];

      const gapDays = this.calculateDaysDiff(prev.date!, curr.date!);

      // 如果间隔超过7天，发出警告
      if (gapDays > 7) {
        warnings.push({
          type: 'date_gap',
          message: `检测到日期间隔: ${this.formatDate(prev.date!)} 到 ${this.formatDate(curr.date!)} 相隔${gapDays}天`,
          documentIds: [prev.doc.id, curr.doc.id],
          severity: gapDays > 30 ? 'high' : gapDays > 14 ? 'medium' : 'low'
        });
      }
    }

    return warnings;
  }

  /**
   * 检测缺失配对
   * 标记应该有配对但未找到匹配的文档
   * @param documents 文档列表
   * @param pairingResult 配对结果
   * @returns 缺失配对警告列表
   */
  detectMissingPairs(documents: DocumentData[], pairingResult: PairingResult): Warning[] {
    const warnings: Warning[] = [];

    // 检查未匹配的出租车发票
    for (const invoiceId of pairingResult.unmatchedInvoices) {
      const invoice = documents.find(d => d.id === invoiceId);
      
      if (invoice && invoice.invoiceType === 'taxi') {
        warnings.push({
          type: 'missing_pair',
          message: `出租车发票缺少对应的行程单: ${invoice.fileName}`,
          documentIds: [invoiceId],
          severity: 'medium'
        });
      }
    }

    // 检查未匹配的行程单
    for (const tripSheetId of pairingResult.unmatchedTripSheets) {
      const tripSheet = documents.find(d => d.id === tripSheetId);
      
      if (tripSheet) {
        warnings.push({
          type: 'missing_pair',
          message: `行程单缺少对应的发票: ${tripSheet.fileName}`,
          documentIds: [tripSheetId],
          severity: 'medium'
        });
      }
    }

    return warnings;
  }

  /**
   * 计算金额统计信息
   * @param amounts 金额数组（已排序）
   * @returns 统计信息
   */
  private calculateAmountStats(amounts: number[]): {
    mean: number;
    median: number;
    q1: number;
    q3: number;
    iqr: number;
    min: number;
    max: number;
  } {
    const n = amounts.length;
    
    // 计算平均值
    const mean = amounts.reduce((sum, val) => sum + val, 0) / n;
    
    // 计算中位数
    const median = n % 2 === 0
      ? (amounts[n / 2 - 1] + amounts[n / 2]) / 2
      : amounts[Math.floor(n / 2)];
    
    // 计算四分位数
    const q1Index = Math.floor(n * 0.25);
    const q3Index = Math.floor(n * 0.75);
    const q1 = amounts[q1Index];
    const q3 = amounts[q3Index];
    const iqr = q3 - q1;
    
    return {
      mean,
      median,
      q1,
      q3,
      iqr,
      min: amounts[0],
      max: amounts[n - 1]
    };
  }

  /**
   * 判断金额是否异常
   * 使用IQR方法检测离群值
   * @param amount 金额
   * @param stats 统计信息
   * @param type 费用类型
   * @returns 异常信息或null
   */
  private isAmountAnomaly(
    amount: number,
    stats: ReturnType<typeof this.calculateAmountStats>,
    type: string
  ): { message: string; severity: 'low' | 'medium' | 'high' } | null {
    // 使用IQR方法检测离群值
    const lowerBound = stats.q1 - 1.5 * stats.iqr;
    const upperBound = stats.q3 + 1.5 * stats.iqr;
    const extremeLowerBound = stats.q1 - 3 * stats.iqr;
    const extremeUpperBound = stats.q3 + 3 * stats.iqr;

    // 极端异常值
    if (amount < extremeLowerBound || amount > extremeUpperBound) {
      const direction = amount < extremeLowerBound ? '过低' : '过高';
      return {
        message: `${this.getTypeDisplayName(type)}金额${direction}: ¥${amount.toFixed(2)} (该类型中位数: ¥${stats.median.toFixed(2)})`,
        severity: 'high'
      };
    }

    // 普通异常值
    if (amount < lowerBound || amount > upperBound) {
      const direction = amount < lowerBound ? '偏低' : '偏高';
      return {
        message: `${this.getTypeDisplayName(type)}金额${direction}: ¥${amount.toFixed(2)} (该类型中位数: ¥${stats.median.toFixed(2)})`,
        severity: 'medium'
      };
    }

    return null;
  }

  /**
   * 获取费用类型的显示名称
   * @param type 费用类型
   * @returns 显示名称
   */
  private getTypeDisplayName(type: string): string {
    const typeNames: Record<string, string> = {
      'taxi': '出租车',
      'hotel': '酒店',
      'train': '火车',
      'shipping': '快递',
      'toll': '过路费',
      'consumables': '耗材',
      'other': '其他'
    };

    return typeNames[type] || type;
  }

  /**
   * 解析日期字符串
   * @param dateStr 日期字符串（支持 MM/DD 或 YYYY-MM-DD 格式）
   * @returns Date对象
   */
  private parseDate(dateStr: string): Date | null {
    try {
      // 处理 MM/DD 格式（假设为当前年份）
      if (/^\d{1,2}\/\d{1,2}$/.test(dateStr)) {
        const [month, day] = dateStr.split('/').map(Number);
        const currentYear = new Date().getFullYear();
        return new Date(currentYear, month - 1, day);
      }

      // 处理 YYYY-MM-DD 格式
      if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(dateStr)) {
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day);
      }

      // 处理 YYYY/MM/DD 格式
      if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(dateStr)) {
        const [year, month, day] = dateStr.split('/').map(Number);
        return new Date(year, month - 1, day);
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * 计算两个日期之间的天数差
   * @param date1 日期1
   * @param date2 日期2
   * @returns 天数差
   */
  private calculateDaysDiff(date1: Date, date2: Date): number {
    const diffMs = Math.abs(date2.getTime() - date1.getTime());
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  /**
   * 格式化日期为 YYYY-MM-DD
   * @param date Date对象
   * @returns 格式化的日期字符串
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
