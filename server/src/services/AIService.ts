import axios, { AxiosError } from 'axios';
import {
  DocumentData,
  APIConfig,
  AIError,
  AIErrorType,
  DocumentType,
  InvoiceType
} from '../types';

/**
 * AI服务类 - 负责调用OpenAI兼容的Vision API进行文档识别
 */
export class AIService {
  private readonly MAX_RETRIES = 3;
  private readonly INITIAL_RETRY_DELAY = 1000; // 1秒
  private readonly TIMEOUT = 30000; // 30秒超时

  /**
   * 识别文档内容
   */
  async recognizeDocument(
    imageBase64: string,
    apiConfig: APIConfig,
    fileName: string
  ): Promise<DocumentData> {
    const operation = async () => {
      try {
        const prompt = this.buildRecognitionPrompt();
        
        const response = await axios.post(
          `${apiConfig.endpoint}/chat/completions`,
          {
            model: apiConfig.model,
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: prompt
                  },
                  {
                    type: 'image_url',
                    image_url: {
                      url: `data:image/jpeg;base64,${imageBase64}`
                    }
                  }
                ]
              }
            ],
            max_tokens: 1000,
            temperature: 0.1
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiConfig.apiKey}`
            },
            timeout: this.TIMEOUT
          }
        );

        const content = response.data.choices[0]?.message?.content;
        if (!content) {
          throw new AIError(
            AIErrorType.PARSING_ERROR,
            false,
            'AI响应内容为空'
          );
        }

        return this.parseAIResponse(content, fileName);
      } catch (error) {
        throw this.handleAPIError(error);
      }
    };

    return this.retryWithBackoff(operation);
  }

  /**
   * 测试API连接
   */
  async testConnection(apiConfig: APIConfig): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.post(
        `${apiConfig.endpoint}/chat/completions`,
        {
          model: apiConfig.model,
          messages: [
            {
              role: 'user',
              content: 'Hello'
            }
          ],
          max_tokens: 10
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiConfig.apiKey}`
          },
          timeout: 10000
        }
      );

      if (response.status === 200) {
        return {
          success: true,
          message: 'API连接成功'
        };
      }

      return {
        success: false,
        message: `API返回异常状态码: ${response.status}`
      };
    } catch (error) {
      const aiError = this.handleAPIError(error);
      return {
        success: false,
        message: aiError.message
      };
    }
  }

  private buildRecognitionPrompt(): string {
    return `你是一个专业的文档识别助手。请分析这张图片，识别它是发票还是行程单，并提取所有相关信息。

请按照以下JSON格式返回结果（只返回JSON，不要其他文字）：

{
  "documentType": "invoice" 或 "trip_sheet",
  "date": "日期，格式：MM/DD 或 YYYY-MM-DD",
  "amount": 金额数字（不含货币符号）,
  "description": "简短描述",
  "confidence": 置信度（0-100的整数）,
  "invoiceNumber": "发票号码",
  "vendor": "商家名称",
  "taxAmount": 税额（如果有）,
  "invoiceType": "taxi/hotel/train/shipping/toll/consumables/other",
  "tripDetails": {
    "platform": "平台名称",
    "departure": "出发地",
    "destination": "目的地",
    "time": "出发时间",
    "distanceKm": 距离（公里数）
  }
}

请仔细分析图片内容，确保提取的信息准确无误。`;
  }

  private parseAIResponse(content: string, fileName: string): DocumentData {
    try {
      let jsonStr = content.trim();
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/```\n?/g, '');
      }

      const parsed = JSON.parse(jsonStr);

      if (!parsed.documentType || !parsed.date || parsed.amount === undefined) {
        throw new Error('缺少必需字段：documentType, date, amount');
      }

      const id = this.generateDocumentId(fileName);

      const documentData: DocumentData = {
        id,
        fileName,
        fileType: this.getFileType(fileName),
        documentType: parsed.documentType as DocumentType,
        date: parsed.date,
        amount: parseFloat(parsed.amount),
        description: parsed.description || '',
        confidence: this.validateConfidence(parsed.confidence),
        status: 'completed'
      };

      if (parsed.documentType === 'invoice') {
        documentData.invoiceNumber = parsed.invoiceNumber;
        documentData.vendor = parsed.vendor;
        documentData.taxAmount = parsed.taxAmount ? parseFloat(parsed.taxAmount) : undefined;
        documentData.invoiceType = this.validateInvoiceType(parsed.invoiceType);
      }

      if (parsed.documentType === 'trip_sheet' && parsed.tripDetails) {
        documentData.tripDetails = {
          platform: parsed.tripDetails.platform || '',
          departure: parsed.tripDetails.departure || '',
          destination: parsed.tripDetails.destination || '',
          time: parsed.tripDetails.time || '',
          distanceKm: parseFloat(parsed.tripDetails.distanceKm) || 0
        };
      }

      return documentData;
    } catch (error) {
      throw new AIError(
        AIErrorType.PARSING_ERROR,
        false,
        `解析AI响应失败: ${error instanceof Error ? error.message : '未知错误'}`
      );
    }
  }

  private handleAPIError(error: unknown): AIError {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      if (axiosError.code === 'ECONNABORTED' || axiosError.code === 'ETIMEDOUT') {
        return new AIError(
          AIErrorType.TIMEOUT,
          true,
          '请求超时，请检查网络连接'
        );
      }

      if (!axiosError.response) {
        return new AIError(
          AIErrorType.NETWORK_ERROR,
          true,
          `网络连接失败: ${axiosError.message}`
        );
      }

      const status = axiosError.response.status;
      const responseData = axiosError.response.data as any;

      if (status === 401 || status === 403) {
        return new AIError(
          AIErrorType.API_KEY_INVALID,
          false,
          'API密钥无效或已过期，请检查配置'
        );
      }

      if (status === 429) {
        return new AIError(
          AIErrorType.RATE_LIMIT_EXCEEDED,
          true,
          'API调用频率超限，请稍后重试'
        );
      }

      const errorMessage = responseData?.error?.message || axiosError.message;
      return new AIError(
        AIErrorType.NETWORK_ERROR,
        status >= 500,
        `API请求失败 (${status}): ${errorMessage}`
      );
    }

    return new AIError(
      AIErrorType.NETWORK_ERROR,
      false,
      `未知错误: ${error instanceof Error ? error.message : '未知错误'}`
    );
  }

  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    retryCount: number = 0
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof AIError && error.retryable && retryCount < this.MAX_RETRIES) {
        const delay = this.INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
        console.log(`重试 ${retryCount + 1}/${this.MAX_RETRIES}，等待 ${delay}ms...`);
        
        await this.delay(delay);
        return this.retryWithBackoff(operation, retryCount + 1);
      }

      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateDocumentId(fileName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `doc_${timestamp}_${random}`;
  }

  private getFileType(fileName: string): 'pdf' | 'image' {
    const ext = fileName.toLowerCase().split('.').pop();
    return ext === 'pdf' ? 'pdf' : 'image';
  }

  private validateConfidence(confidence: any): number {
    const conf = parseInt(confidence);
    if (isNaN(conf)) return 0;
    return Math.max(0, Math.min(100, conf));
  }

  private validateInvoiceType(type: any): InvoiceType {
    const validTypes: InvoiceType[] = ['taxi', 'hotel', 'train', 'shipping', 'toll', 'consumables', 'other'];
    return validTypes.includes(type) ? type : 'other';
  }
}

export const aiService = new AIService();
