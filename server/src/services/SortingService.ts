import { DocumentData, PairingResult, SortingResult, InvoiceType } from '../types';

/**
 * 智能排序服务
 * 按费用类型分组并排序文档，确保配对的发票和行程单相邻放置
 */
export class SortingService {
  // 排序优先级定义
  private readonly typePriority: Record<InvoiceType, number> = {
    consumables: 1,
    hotel: 2,
    taxi: 3,
    shipping: 4,
    toll: 5,
    train: 6,
    other: 7
  };

  /**
   * 排序文档
   * @param documents 所有文档列表
   * @param pairs 配对结果
   * @returns 排序结果，包含排序后的文档ID数组和分组信息
   */
  sortDocuments(documents: DocumentData[], pairs: PairingResult): SortingResult {
    // 创建文档ID到文档的映射
    const documentMap = new Map<string, DocumentData>();
    documents.forEach(doc => documentMap.set(doc.id, doc));

    // 创建配对关系映射
    const pairMap = this.createPairMap(pairs);

    // 按费用类型分组
    const groups = this.groupByExpenseType(documents, pairMap);

    // 对每个分组内的文档进行排序
    const sortedGroups = this.sortGroupsByDate(groups, documentMap, pairMap);

    // 生成最终的排序顺序
    const suggestedOrder = this.generateFinalOrder(sortedGroups);

    // 生成分组信息
    const grouping = this.generateGroupingInfo(sortedGroups);

    return {
      suggestedOrder,
      grouping
    };
  }

  /**
   * 创建配对关系映射
   * @param pairs 配对结果
   * @returns 配对关系映射（发票ID -> 行程单ID，行程单ID -> 发票ID）
   */
  private createPairMap(pairs: PairingResult): Map<string, string> {
    const pairMap = new Map<string, string>();

    pairs.pairs.forEach(pair => {
      pairMap.set(pair.invoiceId, pair.tripSheetId);
      pairMap.set(pair.tripSheetId, pair.invoiceId);
    });

    return pairMap;
  }

  /**
   * 按费用类型分组
   * @param documents 所有文档列表
   * @param pairMap 配对关系映射
   * @returns 按费用类型分组的文档
   */
  private groupByExpenseType(
    documents: DocumentData[],
    pairMap: Map<string, string>
  ): Map<InvoiceType, DocumentData[]> {
    const groups = new Map<InvoiceType, DocumentData[]>();

    // 初始化所有分组
    Object.keys(this.typePriority).forEach(type => {
      groups.set(type as InvoiceType, []);
    });

    // 已处理的文档ID集合（避免重复添加配对的行程单）
    const processedIds = new Set<string>();

    // 遍历所有文档
    documents.forEach(doc => {
      // 如果已处理，跳过
      if (processedIds.has(doc.id)) {
        return;
      }

      // 只处理发票，行程单会随配对的发票一起添加
      if (doc.documentType === 'invoice') {
        const invoiceType = doc.invoiceType || 'other';
        const group = groups.get(invoiceType) || [];

        // 添加发票
        group.push(doc);
        processedIds.add(doc.id);

        // 如果有配对的行程单，也添加到同一组
        const pairedTripSheetId = pairMap.get(doc.id);
        if (pairedTripSheetId) {
          const pairedTripSheet = documents.find(d => d.id === pairedTripSheetId);
          if (pairedTripSheet) {
            group.push(pairedTripSheet);
            processedIds.add(pairedTripSheetId);
          }
        }

        groups.set(invoiceType, group);
      }
    });

    // 处理未配对的行程单（归入other类型）
    documents.forEach(doc => {
      if (doc.documentType === 'trip_sheet' && !processedIds.has(doc.id)) {
        const otherGroup = groups.get('other') || [];
        otherGroup.push(doc);
        processedIds.add(doc.id);
        groups.set('other', otherGroup);
      }
    });

    return groups;
  }

  /**
   * 对每个分组内的文档按日期排序
   * @param groups 按费用类型分组的文档
   * @param documentMap 文档ID到文档的映射
   * @param pairMap 配对关系映射
   * @returns 排序后的分组
   */
  private sortGroupsByDate(
    groups: Map<InvoiceType, DocumentData[]>,
    documentMap: Map<string, DocumentData>,
    pairMap: Map<string, string>
  ): Map<InvoiceType, DocumentData[]> {
    const sortedGroups = new Map<InvoiceType, DocumentData[]>();

    groups.forEach((docs, type) => {
      if (docs.length === 0) {
        sortedGroups.set(type, []);
        return;
      }

      // 将文档按配对关系组织成单元（发票+行程单或单独的文档）
      const units = this.createDocumentUnits(docs, pairMap);

      // 按日期排序单元
      units.sort((a, b) => {
        const dateA = this.parseDate(a.primaryDoc.date);
        const dateB = this.parseDate(b.primaryDoc.date);

        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;

        return dateA.getTime() - dateB.getTime();
      });

      // 展开单元为文档列表
      const sortedDocs: DocumentData[] = [];
      units.forEach(unit => {
        sortedDocs.push(unit.primaryDoc);
        if (unit.pairedDoc) {
          sortedDocs.push(unit.pairedDoc);
        }
      });

      sortedGroups.set(type, sortedDocs);
    });

    return sortedGroups;
  }

  /**
   * 创建文档单元（发票+配对的行程单）
   * @param docs 文档列表
   * @param pairMap 配对关系映射
   * @returns 文档单元列表
   */
  private createDocumentUnits(
    docs: DocumentData[],
    pairMap: Map<string, string>
  ): Array<{ primaryDoc: DocumentData; pairedDoc?: DocumentData }> {
    const units: Array<{ primaryDoc: DocumentData; pairedDoc?: DocumentData }> = [];
    const processedIds = new Set<string>();

    docs.forEach(doc => {
      if (processedIds.has(doc.id)) {
        return;
      }

      // 如果是发票，查找配对的行程单
      if (doc.documentType === 'invoice') {
        const pairedTripSheetId = pairMap.get(doc.id);
        const pairedTripSheet = pairedTripSheetId
          ? docs.find(d => d.id === pairedTripSheetId)
          : undefined;

        units.push({
          primaryDoc: doc,
          pairedDoc: pairedTripSheet
        });

        processedIds.add(doc.id);
        if (pairedTripSheet) {
          processedIds.add(pairedTripSheet.id);
        }
      } else {
        // 未配对的行程单
        units.push({
          primaryDoc: doc
        });
        processedIds.add(doc.id);
      }
    });

    return units;
  }

  /**
   * 生成最终的排序顺序
   * @param sortedGroups 排序后的分组
   * @returns 文档ID数组
   */
  private generateFinalOrder(sortedGroups: Map<InvoiceType, DocumentData[]>): string[] {
    const order: string[] = [];

    // 按优先级顺序遍历分组
    const sortedTypes = Array.from(sortedGroups.keys()).sort(
      (a, b) => this.typePriority[a] - this.typePriority[b]
    );

    sortedTypes.forEach(type => {
      const docs = sortedGroups.get(type) || [];
      docs.forEach(doc => {
        order.push(doc.id);
      });
    });

    return order;
  }

  /**
   * 生成分组信息
   * @param sortedGroups 排序后的分组
   * @returns 分组信息（类型 -> 文档ID数组）
   */
  private generateGroupingInfo(
    sortedGroups: Map<InvoiceType, DocumentData[]>
  ): Record<string, string[]> {
    const grouping: Record<string, string[]> = {};

    sortedGroups.forEach((docs, type) => {
      if (docs.length > 0) {
        grouping[type] = docs.map(doc => doc.id);
      }
    });

    return grouping;
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
}
