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
  Logger,
} from '@nestjs/common';
import { ContentService, Content } from './content.service';
import { PaymentService } from '../payment/payment.service';
import { UserService } from '../user/user.service';
import { CreateContentDto } from './dto/create-content.dto';

@Controller('api/content')
export class ContentController {
  private readonly logger = new Logger(ContentController.name);

  constructor(
    private readonly contentService: ContentService,
    private readonly paymentService: PaymentService,
    private readonly userService: UserService,
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
   * 
   * x402 流程：
   * 1. 客户端请求内容（无 payment header）
   * 2. 服务端返回 HTTP 402 + 支付信息
   * 3. 客户端完成支付
   * 4. 客户端带 payment header 重新请求
   * 5. 服务端验证并返回内容
   */
  @Get(':id')
  async getFullContent(
    @Param('id') id: string,
    @Headers('x-payment') paymentHeader: string,
    @Headers('x-wallet-address') walletAddress: string,
  ) {
    const content = this.contentService.findOne(id);
    // 使用后端计算的动态价格（与链上保持一致的算法）
    const currentPrice = this.calculateDynamicPrice(content.basePrice, content.unlockCount);

    // ============ x402 Step 2: 返回 402 要求支付 ============
    if (!paymentHeader) {
      this.logger.log(`[x402] 402 Payment Required for content ${content.contentId}`);
      this.logger.log(`[x402] Price: ${currentPrice} wei`);
      
      throw new HttpException(
        {
          statusCode: HttpStatus.PAYMENT_REQUIRED,
          message: 'Payment required to access this content',
          price: currentPrice,
          priceUsd: content.priceUsd,
          contentId: content.contentId,
          payTo: process.env.RECIPIENT_WALLET || content.creator,
          // x402 标准 headers
          'x-payment-required': true,
          'x-payment-network': process.env.NETWORK || 'monad-testnet',
          'x-payment-chain-id': process.env.CHAIN_ID || '10143',
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

      // ============ x402 Step 5: 支付验证成功 ============
      this.logger.log(`[x402] Payment verified for content ${content.contentId}`);
      this.logger.log(`[x402] TX: ${paymentResult.transactionHash || paymentHeader}`);
      
      // 增加解锁计数
      this.contentService.incrementUnlockCount(id);
      const updatedContent = this.contentService.findOne(id);
      const newPrice = this.calculateDynamicPrice(updatedContent.basePrice, updatedContent.unlockCount);
      
      this.logger.log(`[x402] Unlock count: ${content.unlockCount} → ${updatedContent.unlockCount}`);
      this.logger.log(`[x402] Price updated: ${currentPrice} → ${newPrice} wei`);

      // 记录用户解锁（使用链上 contentId）
      if (walletAddress) {
        this.userService.recordUnlock(
          walletAddress,
          content.contentId.toString(),
          paymentResult.transactionHash || paymentHeader,
          currentPrice,
        );
      }

      // 返回完整内容
      return {
        ...updatedContent,
        currentPrice: newPrice,
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
    const content = this.contentService.create(createContentDto, creator);
    
    // 记录用户创建的内容
    this.userService.recordCreation(creator, content.contentId.toString());
    
    return content;
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

