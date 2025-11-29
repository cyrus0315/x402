import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  Headers,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ContentService, Content } from './content.service';
import { PaymentService } from '../payment/payment.service';
import { CreateContentDto } from './dto/create-content.dto';

@Controller('api/content')
export class ContentController {
  constructor(
    private readonly contentService: ContentService,
    private readonly paymentService: PaymentService,
  ) {}

  /**
   * 获取所有内容列表（不含完整内容）
   */
  @Get()
  findAll(@Query('category') category?: string, @Query('search') search?: string) {
    let contents: Content[];

    if (search) {
      contents = this.contentService.search(search);
    } else if (category) {
      contents = this.contentService.getByCategory(category);
    } else {
      contents = this.contentService.findAll();
    }

    // 返回预览版本，不包含完整内容
    return contents.map(({ fullContent, ...preview }) => ({
      ...preview,
      currentPrice: this.calculateDynamicPrice(preview.basePrice, preview.unlockCount),
    }));
  }

  /**
   * 获取内容预览（免费）
   */
  @Get(':id/preview')
  getPreview(@Param('id') id: string) {
    const preview = this.contentService.getPreview(id);
    return {
      ...preview,
      currentPrice: this.calculateDynamicPrice(preview.basePrice, preview.unlockCount),
    };
  }

  /**
   * 获取完整内容（需要 x402 支付）
   */
  @Get(':id')
  async getFullContent(
    @Param('id') id: string,
    @Headers('x-payment') paymentHeader: string,
    @Headers('x-wallet-address') walletAddress: string,
  ) {
    const content = this.contentService.findOne(id);
    const currentPrice = this.calculateDynamicPrice(content.basePrice, content.unlockCount);

    // 如果没有 payment header，返回 402 要求支付
    if (!paymentHeader) {
      throw new HttpException(
        {
          statusCode: HttpStatus.PAYMENT_REQUIRED,
          message: 'Payment required to access this content',
          price: currentPrice,
          priceUsd: content.priceUsd,
          contentId: content.contentId,
          payTo: process.env.RECIPIENT_WALLET,
        },
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    // 验证支付
    try {
      const paymentResult = await this.paymentService.verifyPayment({
        paymentData: paymentHeader,
        expectedAmount: currentPrice,
        contentId: content.contentId.toString(),
        resourceUrl: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/content/${id}`,
      });

      if (!paymentResult.success) {
        throw new HttpException(
          {
            statusCode: HttpStatus.PAYMENT_REQUIRED,
            message: paymentResult.error || 'Payment verification failed',
            price: currentPrice,
          },
          HttpStatus.PAYMENT_REQUIRED,
        );
      }

      // 支付成功，增加解锁计数
      this.contentService.incrementUnlockCount(id);

      // 返回完整内容
      return {
        ...content,
        currentPrice,
        transactionHash: paymentResult.transactionHash,
        unlocked: true,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Payment processing error',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 创建新内容
   */
  @Post()
  create(
    @Body() createContentDto: CreateContentDto,
    @Headers('x-wallet-address') creator: string,
  ) {
    if (!creator) {
      throw new HttpException(
        'Wallet address required',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.contentService.create(createContentDto, creator);
  }

  /**
   * 获取分类列表
   */
  @Get('meta/categories')
  getCategories() {
    return [
      { id: 'trading', name: 'Trading', icon: '📈' },
      { id: 'ai', name: 'AI & ML', icon: '🤖' },
      { id: 'security', name: 'Security', icon: '🔒' },
      { id: 'development', name: 'Development', icon: '💻' },
      { id: 'research', name: 'Research', icon: '📊' },
      { id: 'tutorial', name: 'Tutorial', icon: '📚' },
    ];
  }

  /**
   * 计算动态价格
   * 每 10 次解锁，价格上涨 10%
   */
  private calculateDynamicPrice(basePrice: string, unlockCount: number): string {
    const base = BigInt(basePrice);
    const increments = Math.floor(unlockCount / 10);
    let price = base;

    for (let i = 0; i < increments; i++) {
      price = (price * 110n) / 100n;
    }

    return price.toString();
  }
}

