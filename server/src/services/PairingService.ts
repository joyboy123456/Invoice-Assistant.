import { DocumentData, PairingResult, PairingPair } from '../types';

/**
 * 智能配对服务
 * 基于金额、日期、平台等信息自动匹配发票和行程单
 */
export class PairingService {
  /**
   * 配对文档
   * @param documents 所有文档列表
   * @returns 配对结果，包含配对列表和未匹配文档
   */
  pairDocuments(documents: DocumentData[]): PairingResult {
    // 分离发票和行程单
    const invoices = documents.filter(doc => doc.documentType === 'invoice');
    const tripSheets = documents.filter(doc => doc.documentType === 'trip_sheet');

    const pairs: PairingPair[] = [];
    const matchedInvoiceIds = new Set<string>();
    const matchedTripSheetIds = new Set<string>();

    // 为每张发票寻找最佳匹配的行程单
    for (const invoice of invoices) {
      let bestMatch: { tripSheet: DocumentData; score: number; reason: string } | null = null;

      for (const tripSheet of tripSheets) {
        // 跳过已匹配的行程单
        if (matchedTripSheetIds.has(tripSheet.id)) {
          continue;
        }

        // 计算匹配得分和原因
        const matchResult = this.calculateMatchScore(invoice, tripSheet);

        // 更新最佳匹配（得分至少50分才考虑）
        if (matchResult.score >= 50 && (!bestMatch || matchResult.score > bestMatch.score)) {
          bestMatch = {
            tripSheet,
            score: matchResult.score,
            reason: matchResult.reason
          };
        }
      }

      // 如果找到匹配，添加到配对列表
      if (bestMatch) {
        pairs.push({
          invoiceId: invoice.id,
          tripSheetId: bestMatch.tripSheet.id,
          confidence: bestMatch.score,
          matchReason: bestMatch.reason
        });

        matchedInvoiceIds.add(invoice.id);
        matchedTripSheetIds.add(bestMatch.tripSheet.id);
      }
    }

    // 识别未匹配的文档
    const unmatchedInvoices = invoices
      .filter(invoice => !matchedInvoiceIds.has(invoice.id))
      .map(invoice => invoice.id);

    const unmatchedTripSheets = tripSheets
      .filter(tripSheet => !matchedTripSheetIds.has(tripSheet.id))
      .map(tripSheet => tripSheet.id);

    return {
      pairs,
      unmatchedInvoices,
      unmatchedTripSheets
    };
  }

  /**
   * 计算两个文档的匹配得分
   * @param invoice 发票
   * @param tripSheet 行程单
   * @returns 匹配得分和原因
   */
  private calculateMatchScore(
    invoice: DocumentData,
    tripSheet: DocumentData
  ): { score: number; reason: string } {
    let score = 0;
    const reasons: string[] = [];

    // 1. 金额匹配检查（+50分）
    const amountMatch = this.checkAmountMatch(invoice.amount, tripSheet.amount);
    if (amountMatch.matched) {
      score += 50;
      reasons.push(amountMatch.reason);
    }

    // 2. 日期接近检查（+30分）
    const dateMatch = this.checkDateProximity(invoice.date, tripSheet.date);
    if (dateMatch.matched) {
      score += dateMatch.score;
      reasons.push(dateMatch.reason);
    }

    // 3. 平台匹配检查（+20分）
    const platformMatch = this.checkPlatformMatch(invoice, tripSheet);
    if (platformMatch.matched) {
      score += 20;
      reasons.push(platformMatch.reason);
    }

    // 生成匹配原因说明
    const matchReason = reasons.length > 0 
      ? reasons.join('，') 
      : '无明显匹配特征';

    return { score, reason: matchReason };
  }

  /**
   * 检查金额是否匹配
   * @param amount1 金额1
   * @param amount2 金额2
   * @returns 是否匹配及原因
   */
  private checkAmountMatch(
    amount1: number,
    amount2: number
  ): { matched: boolean; reason: string } {
    // 允许0.01的误差（处理浮点数精度问题）
    const tolerance = 0.01;
    const diff = Math.abs(amount1 - amount2);

    if (diff <= tolerance) {
      return {
        matched: true,
        reason: `金额完全匹配(${amount1.toFixed(2)})`
      };
    }

    return { matched: false, reason: '' };
  }

  /**
   * 检查日期接近程度
   * @param date1 日期1（格式：MM/DD 或 YYYY-MM-DD）
   * @param date2 日期2
   * @returns 匹配得分和原因
   */
  private checkDateProximity(
    date1: string,
    date2: string
  ): { matched: boolean; score: number; reason: string } {
    try {
      const d1 = this.parseDate(date1);
      const d2 = this.parseDate(date2);

      if (!d1 || !d2) {
        return { matched: false, score: 0, reason: '' };
      }

      // 计算日期差异（天数）
      const diffMs = Math.abs(d1.getTime() - d2.getTime());
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      // 根据日期差异给分
      if (diffDays === 0) {
        return {
          matched: true,
          score: 30,
          reason: `日期相同(${this.formatDate(d1)})`
        };
      } else if (diffDays === 1) {
        return {
          matched: true,
          score: 25,
          reason: `日期相邻(相差1天)`
        };
      } else if (diffDays <= 3) {
        return {
          matched: true,
          score: 20,
          reason: `日期接近(相差${diffDays}天)`
        };
      } else if (diffDays <= 7) {
        return {
          matched: true,
          score: 10,
          reason: `日期较近(相差${diffDays}天)`
        };
      }

      return { matched: false, score: 0, reason: '' };
    } catch (error) {
      return { matched: false, score: 0, reason: '' };
    }
  }

  /**
   * 检查平台是否匹配
   * @param invoice 发票
   * @param tripSheet 行程单
   * @returns 是否匹配及原因
   */
  private checkPlatformMatch(
    invoice: DocumentData,
    tripSheet: DocumentData
  ): { matched: boolean; reason: string } {
    // 只有出租车类型的发票才检查平台匹配
    if (invoice.invoiceType !== 'taxi' || !tripSheet.tripDetails?.platform) {
      return { matched: false, reason: '' };
    }

    const platform = tripSheet.tripDetails.platform;
    
    // 检查发票的vendor或description中是否包含平台名称
    const invoiceText = [
      invoice.vendor || '',
      invoice.description || ''
    ].join(' ').toLowerCase();

    const platformLower = platform.toLowerCase();

    // 平台名称关键词匹配
    const platformKeywords = this.extractPlatformKeywords(platform);
    
    for (const keyword of platformKeywords) {
      if (invoiceText.includes(keyword.toLowerCase())) {
        return {
          matched: true,
          reason: `平台匹配(${platform})`
        };
      }
    }

    return { matched: false, reason: '' };
  }

  /**
   * 提取平台关键词
   * @param platform 平台名称
   * @returns 关键词列表
   */
  private extractPlatformKeywords(platform: string): string[] {
    const keywords: string[] = [platform];

    // 常见平台的关键词映射
    const platformMap: Record<string, string[]> = {
      '滴滴': ['滴滴', 'didi'],
      '如祺': ['如祺', 'ruqi'],
      '曹操': ['曹操', 'caocao'],
      '高德': ['高德', 'amap'],
      '美团': ['美团', 'meituan'],
      '首汽': ['首汽', 'shouqi']
    };

    // 查找匹配的平台映射
    for (const [key, values] of Object.entries(platformMap)) {
      if (platform.includes(key)) {
        keywords.push(...values);
        break;
      }
    }

    return keywords;
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
   * 格式化日期为 MM/DD
   * @param date Date对象
   * @returns 格式化的日期字符串
   */
  private formatDate(date: Date): string {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}`;
  }
}
