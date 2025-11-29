import {
  Controller,
  Get,
  Headers,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';

@Controller('api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * 获取用户已解锁的内容
   */
  @Get('unlocked')
  getUnlockedContents(@Headers('x-wallet-address') address: string) {
    if (!address) {
      throw new HttpException(
        'Wallet address required',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.userService.getUnlockedContents(address);
  }

  /**
   * 获取用户统计信息
   */
  @Get('stats')
  getStats(@Headers('x-wallet-address') address: string) {
    if (!address) {
      throw new HttpException(
        'Wallet address required',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.userService.getStats(address);
  }

  /**
   * 获取用户完整资料
   */
  @Get('profile')
  getProfile(@Headers('x-wallet-address') address: string) {
    if (!address) {
      throw new HttpException(
        'Wallet address required',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.userService.getOrCreateUser(address);
  }

  /**
   * 检查是否已解锁某内容
   */
  @Get('check-unlock/:contentId')
  checkUnlock(
    @Headers('x-wallet-address') address: string,
    contentId: string,
  ) {
    if (!address) {
      return { unlocked: false };
    }
    return {
      unlocked: this.userService.hasUnlocked(address, contentId),
    };
  }
}

