import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateContentDto } from './dto/create-content.dto';

export interface Content {
  id: string;
  contentId: number; // 链上的 contentId
  title: string;
  description: string;
  category: string;
  preview: string; // 预览内容（免费可见）
  fullContent: string; // 完整内容（付费后可见）
  basePrice: string; // 基础价格 (wei)
  priceUsd: string; // USD 价格显示
  creator: string; // 创作者钱包地址
  creatorName: string;
  metadataURI: string;
  unlockCount: number;
  createdAt: Date;
  tags: string[];
  imageUrl?: string;
}

@Injectable()
export class ContentService {
  // 内存存储 - 黑客松用
  private contents: Map<string, Content> = new Map();
  private contentIdCounter = 1;

  constructor() {
    // 初始化一些示例内容
    this.initSampleContent();
  }

  private initSampleContent() {
    const sampleContents: Omit<Content, 'id' | 'contentId' | 'createdAt'>[] = [
      {
        title: 'Monad 高性能交易策略',
        description: '深入分析 Monad 的 10000 TPS 如何为高频交易带来机会，包含完整的策略框架和风险管理方案。',
        category: 'Trading',
        preview: 'Monad 作为新一代 L1 公链，其并行执行引擎带来了前所未有的交易速度...',
        fullContent: `# Monad 高性能交易策略完整指南

## 1. Monad 技术优势分析
Monad 采用并行执行引擎，能够实现 10,000+ TPS，这为高频交易策略提供了绝佳的基础设施。

## 2. 策略框架
### 2.1 套利策略
- DEX 间价差套利
- 跨链套利机会
- 清算机器人策略

### 2.2 做市策略
- 利用低延迟提供流动性
- 动态价差调整
- 库存管理

## 3. 风险管理
- 设置止损点位
- 资金分配原则
- 监控系统搭建

## 4. 代码实现
\`\`\`javascript
// 套利检测示例
async function checkArbitrage(tokenA, tokenB) {
  const priceOnDexA = await getDexPrice(DEX_A, tokenA, tokenB);
  const priceOnDexB = await getDexPrice(DEX_B, tokenA, tokenB);
  const spread = Math.abs(priceOnDexA - priceOnDexB) / priceOnDexA;
  return spread > THRESHOLD;
}
\`\`\`

## 5. 实战案例
...`,
        basePrice: '10000000000000000', // 0.01 MON
        priceUsd: '$0.10',
        creator: '0x1234567890123456789012345678901234567890',
        creatorName: 'CryptoAlpha',
        metadataURI: 'ipfs://QmTrading123',
        unlockCount: 42,
        tags: ['trading', 'defi', 'monad'],
        imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400',
      },
      {
        title: 'GPT-4 终极 Prompt 工程指南',
        description: '经过数千次测试优化的 GPT-4 Prompt 模板，涵盖代码生成、内容创作、数据分析等场景。',
        category: 'AI',
        preview: '好的 Prompt 是与 AI 高效沟通的关键。本指南将带你掌握...',
        fullContent: `# GPT-4 终极 Prompt 工程指南

## Prompt 设计原则
1. 明确角色设定
2. 提供充分上下文
3. 指定输出格式
4. 添加示例

## 高效模板库

### 代码生成模板
\`\`\`
你是一位资深 [语言] 开发者。请根据以下需求编写代码：
需求：[描述]
要求：
- 代码简洁高效
- 添加详细注释
- 考虑边界情况
\`\`\`

### 内容创作模板
...

## 高级技巧
- Chain of Thought
- Few-shot Learning
- Self-consistency
...`,
        basePrice: '5000000000000000', // 0.005 MON
        priceUsd: '$0.05',
        creator: '0x2345678901234567890123456789012345678901',
        creatorName: 'AIWhisperer',
        metadataURI: 'ipfs://QmPrompt456',
        unlockCount: 128,
        tags: ['ai', 'prompt', 'gpt'],
        imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400',
      },
      {
        title: 'Web3 智能合约安全审计清单',
        description: '来自顶级安全团队的实战经验，包含 50+ 常见漏洞检查项和修复方案。',
        category: 'Security',
        preview: '智能合约安全是 Web3 项目的生命线。本清单基于真实审计经验...',
        fullContent: `# Web3 智能合约安全审计清单

## 一、重入攻击防护
- [ ] 使用 ReentrancyGuard
- [ ] 检查-生效-交互模式
- [ ] 避免外部调用后修改状态

## 二、整数溢出
- [ ] 使用 Solidity 0.8+
- [ ] 或使用 SafeMath

## 三、访问控制
- [ ] 关键函数权限检查
- [ ] 多签机制
- [ ] 时间锁

## 四、闪电贷攻击
...

## 五、预言机操纵
...

## 六、前端安全
...`,
        basePrice: '20000000000000000', // 0.02 MON
        priceUsd: '$0.20',
        creator: '0x3456789012345678901234567890123456789012',
        creatorName: 'SecurityGuru',
        metadataURI: 'ipfs://QmSecurity789',
        unlockCount: 35,
        tags: ['security', 'audit', 'solidity'],
        imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400',
      },
    ];

    sampleContents.forEach((content) => {
      const id = uuidv4();
      this.contents.set(id, {
        ...content,
        id,
        contentId: this.contentIdCounter++,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      });
    });
  }

  findAll(): Content[] {
    return Array.from(this.contents.values())
      .sort((a, b) => b.unlockCount - a.unlockCount);
  }

  findOne(id: string): Content {
    const content = this.contents.get(id);
    if (!content) {
      throw new NotFoundException(`Content ${id} not found`);
    }
    return content;
  }

  findByContentId(contentId: number): Content | undefined {
    return Array.from(this.contents.values())
      .find(c => c.contentId === contentId);
  }

  create(dto: CreateContentDto, creator: string): Content {
    const id = uuidv4();
    // 如果传入了链上的 contentId，使用它；否则自动递增
    const contentId = dto.contentId ?? this.contentIdCounter++;
    // 确保 counter 始终大于已使用的最大 ID
    if (dto.contentId && dto.contentId >= this.contentIdCounter) {
      this.contentIdCounter = dto.contentId + 1;
    }
    
    const content: Content = {
      id,
      contentId,
      title: dto.title,
      description: dto.description,
      category: dto.category,
      preview: dto.preview,
      fullContent: dto.fullContent,
      basePrice: dto.basePrice,
      priceUsd: dto.priceUsd,
      creator,
      creatorName: dto.creatorName || 'Anonymous',
      metadataURI: dto.metadataURI || `ipfs://Qm${id.slice(0, 20)}`,
      unlockCount: 0,
      createdAt: new Date(),
      tags: dto.tags || [],
      imageUrl: dto.imageUrl,
    };
    
    this.contents.set(id, content);
    return content;
  }

  incrementUnlockCount(id: string): void {
    const content = this.findOne(id);
    content.unlockCount++;
  }

  getPreview(id: string): Omit<Content, 'fullContent'> {
    const content = this.findOne(id);
    const { fullContent, ...preview } = content;
    return preview;
  }

  getByCategory(category: string): Content[] {
    return Array.from(this.contents.values())
      .filter(c => c.category.toLowerCase() === category.toLowerCase());
  }

  search(query: string): Content[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.contents.values())
      .filter(c => 
        c.title.toLowerCase().includes(lowerQuery) ||
        c.description.toLowerCase().includes(lowerQuery) ||
        c.tags.some(t => t.toLowerCase().includes(lowerQuery))
      );
  }
}

