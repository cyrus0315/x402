import { Controller, Get, Post, Body, Headers } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('api/payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  /**
   * 获取支付状态
   */
  @Get('status')
  getStatus() {
    return {
      enabled: !!process.env.THIRDWEB_SECRET_KEY,
      network: 'monad-testnet',
      chainId: 10143,
      recipient: process.env.RECIPIENT_WALLET || 'not-configured',
    };
  }

  /**
   * 验证支付（用于前端测试）
   */
  @Post('verify')
  async verifyPayment(
    @Body() body: { paymentData: string; contentId: string; amount: string },
    @Headers('x-payment') paymentHeader: string,
  ) {
    const result = await this.paymentService.verifyPayment({
      paymentData: paymentHeader || body.paymentData,
      expectedAmount: body.amount,
      contentId: body.contentId,
      resourceUrl: `http://localhost:3001/api/content/${body.contentId}`,
    });

    return result;
  }

  /**
   * 获取支付配置（前端使用）
   */
  @Get('config')
  getConfig() {
    return {
      network: {
        name: 'Monad Testnet',
        chainId: 10143,
        rpcUrl: process.env.MONAD_RPC_URL || 'https://testnet-rpc.monad.xyz',
        currency: {
          name: 'Monad',
          symbol: 'MON',
          decimals: 18,
        },
      },
      facilitator: {
        enabled: !!process.env.THIRDWEB_SECRET_KEY,
        recipient: process.env.RECIPIENT_WALLET,
      },
      thirdweb: {
        clientId: process.env.THIRDWEB_CLIENT_ID,
      },
    };
  }
}

