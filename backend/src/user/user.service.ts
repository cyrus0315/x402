import { Injectable } from '@nestjs/common';

export interface UnlockRecord {
  contentId: string;
  transactionHash: string;
  price: string;
  referrer?: string;
  unlockedAt: Date;
}

export interface UserProfile {
  address: string;
  unlockedContents: UnlockRecord[];
  createdContents: string[];
  totalSpent: string;
  totalEarned: string;
  referralEarnings: string;
}

@Injectable()
export class UserService {
  // 内存存储 - 黑客松用
  private users: Map<string, UserProfile> = new Map();

  getOrCreateUser(address: string): UserProfile {
    const normalizedAddress = address.toLowerCase();
    
    if (!this.users.has(normalizedAddress)) {
      this.users.set(normalizedAddress, {
        address: normalizedAddress,
        unlockedContents: [],
        createdContents: [],
        totalSpent: '0',
        totalEarned: '0',
        referralEarnings: '0',
      });
    }
    
    return this.users.get(normalizedAddress)!;
  }

  recordUnlock(
    address: string,
    contentId: string,
    transactionHash: string,
    price: string,
    referrer?: string,
  ) {
    const user = this.getOrCreateUser(address);
    
    user.unlockedContents.push({
      contentId,
      transactionHash,
      price,
      referrer,
      unlockedAt: new Date(),
    });
    
    // 更新总支出
    user.totalSpent = (BigInt(user.totalSpent) + BigInt(price)).toString();
  }

  recordCreation(address: string, contentId: string) {
    const user = this.getOrCreateUser(address);
    user.createdContents.push(contentId);
  }

  recordEarnings(address: string, amount: string, isReferral: boolean = false) {
    const user = this.getOrCreateUser(address);
    
    if (isReferral) {
      user.referralEarnings = (BigInt(user.referralEarnings) + BigInt(amount)).toString();
    }
    user.totalEarned = (BigInt(user.totalEarned) + BigInt(amount)).toString();
  }

  getUnlockedContents(address: string): UnlockRecord[] {
    const user = this.getOrCreateUser(address);
    return user.unlockedContents;
  }

  hasUnlocked(address: string, contentId: string): boolean {
    const user = this.getOrCreateUser(address);
    return user.unlockedContents.some(u => u.contentId === contentId);
  }

  getStats(address: string) {
    const user = this.getOrCreateUser(address);
    return {
      totalUnlocked: user.unlockedContents.length,
      totalCreated: user.createdContents.length,
      totalSpent: user.totalSpent,
      totalEarned: user.totalEarned,
      referralEarnings: user.referralEarnings,
    };
  }
}

