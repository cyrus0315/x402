import { Module } from '@nestjs/common';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { PaymentModule } from '../payment/payment.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [PaymentModule, UserModule],
  controllers: [ContentController],
  providers: [ContentService],
  exports: [ContentService],
})
export class ContentModule {}

