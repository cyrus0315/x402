import { Module } from '@nestjs/common';
import { ContentModule } from './content/content.module';
import { PaymentModule } from './payment/payment.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ContentModule,
    PaymentModule,
    UserModule,
  ],
})
export class AppModule {}

