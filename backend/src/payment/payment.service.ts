import { Injectable, Logger } from '@nestjs/common';
import { createThirdwebClient } from 'thirdweb';
import { facilitator, settlePayment } from 'thirdweb/x402';
import { defineChain } from 'thirdweb/chains';

export interface PaymentVerificationResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

export interface VerifyPaymentParams {
  paymentData: string;
  expectedAmount: string;
  contentId: string;
  resourceUrl: string;
}

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly client: ReturnType<typeof createThirdwebClient>;
  private readonly monadTestnet = defineChain(10143);
  private readonly twFacilitator: ReturnType<typeof facilitator>;

  constructor() {
    // 初始化 Thirdweb client
    if (process.env.THIRDWEB_SECRET_KEY) {
      this.client = createThirdwebClient({
        secretKey: process.env.THIRDWEB_SECRET_KEY,
      });

      this.twFacilitator = facilitator({
        client: this.client,
        serverWalletAddress: process.env.RECIPIENT_WALLET || '',
      });

      this.logger.log('x402 Payment Service initialized');
    } else {
      this.logger.warn('THIRDWEB_SECRET_KEY not set, payment service running in mock mode');
    }
  }

  /**
   * 验证并结算 x402 支付
   */
  async verifyPayment(params: VerifyPaymentParams): Promise<PaymentVerificationResult> {
    const { paymentData, expectedAmount, contentId, resourceUrl } = params;

    // 链上已验证 - 前端已经验证了链上的 hasUnlocked
    if (paymentData === 'chain-verified') {
      this.logger.log(`[CHAIN] User already unlocked content ${contentId} on-chain`);
      return {
        success: true,
        transactionHash: 'on-chain-verified',
      };
    }

    // Mock 模式 - 用于开发和测试
    if (!process.env.THIRDWEB_SECRET_KEY) {
      this.logger.log(`[MOCK] Verifying payment for content ${contentId}`);
      
      // 模拟支付验证
      if (paymentData === 'mock-payment-success') {
        return {
          success: true,
          transactionHash: `0x${Date.now().toString(16)}${'0'.repeat(48)}`,
        };
      }
      
      // 接受交易哈希作为支付证明
      if (paymentData && paymentData.startsWith('0x')) {
        return {
          success: true,
          transactionHash: paymentData, // 使用实际交易哈希
        };
      }

      return {
        success: false,
        error: 'Invalid payment data in mock mode',
      };
    }

    // 真实模式 - 使用 Thirdweb x402
    try {
      this.logger.log(`Settling payment for content ${contentId}`);
      
      const result = await settlePayment({
        resourceUrl,
        method: 'GET',
        paymentData,
        network: this.monadTestnet,
        price: this.weiToUsd(expectedAmount), // 转换为 USD 格式
        payTo: process.env.RECIPIENT_WALLET || '',
        facilitator: this.twFacilitator,
      });

      if (result.status === 200) {
        const txHash = result.paymentReceipt?.transaction || '';
        this.logger.log(`Payment settled successfully: ${txHash}`);
        return {
          success: true,
          transactionHash: txHash,
        };
      } else {
        this.logger.warn(`Payment failed with status ${result.status}`);
        return {
          success: false,
          error: `Payment failed with status ${result.status}`,
        };
      }
    } catch (error) {
      this.logger.error(`Payment error: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 获取支付要求信息
   */
  getPaymentRequirements(contentId: string, price: string) {
    return {
      'x-payment-required': 'true',
      'x-payment-network': 'monad-testnet',
      'x-payment-chain-id': '10143',
      'x-payment-amount': price,
      'x-payment-recipient': process.env.RECIPIENT_WALLET,
      'x-payment-content-id': contentId,
    };
  }

  /**
   * Wei 转 USD 格式 (简化，实际应该使用价格预言机)
   * 假设 1 MON = $10 用于演示
   */
  private weiToUsd(weiAmount: string): string {
    const wei = BigInt(weiAmount);
    const monPrice = 10; // 假设价格
    const mon = Number(wei) / 1e18;
    const usd = mon * monPrice;
    return `$${usd.toFixed(4)}`;
  }
}

