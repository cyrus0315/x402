# 💡 PayPerInsight

> 去中心化 AI 知识付费即时市场 - 基于 x402 协议 + Monad

## 🎯 项目概述

PayPerInsight 是一个创新的去中心化内容付费平台：
- 创作者上传高价值内容（分析报告、交易信号、Prompt、教程等）
- 用户通过 **x402 协议即时微支付**解锁内容
- **解锁即铸造 NFT**，可转让访问权
- **动态定价**机制，早期解锁更便宜
- **推荐分成**系统，分享即赚钱
- 利用 Monad 的高 TPS 实现亚秒级支付确认

## 🏗️ 技术栈

| 层级 | 技术 |
|------|------|
| **后端** | NestJS + 内存存储 |
| **智能合约** | Hardhat + Solidity + OpenZeppelin |
| **前端** | React + Vite + Tailwind + shadcn/ui + Framer Motion |
| **支付** | x402 + Thirdweb Facilitator |
| **链** | Monad Testnet (Chain ID: 10143) |

## 📁 项目结构

```
├── backend/              # NestJS 后端服务
│   ├── src/
│   │   ├── content/      # 内容管理模块
│   │   ├── payment/      # x402 支付模块
│   │   └── user/         # 用户模块
│   └── ...
├── frontend/             # React 前端应用
│   ├── src/
│   │   ├── components/   # UI 组件
│   │   ├── pages/        # 页面
│   │   ├── hooks/        # 自定义 Hooks
│   │   └── lib/          # 工具函数
│   └── ...
├── contracts/            # Solidity 智能合约
│   ├── contracts/
│   ├── scripts/
│   └── test/
└── ...
```

## 🚀 快速开始

### 环境要求
- Node.js >= 18
- pnpm >= 8

### 1. 安装依赖

```bash
# 根目录
pnpm install

# 后端
cd backend && pnpm install

# 前端
cd frontend && pnpm install

# 智能合约
cd contracts && pnpm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 填写你的配置
```

### 3. 部署智能合约

```bash
cd contracts
npx hardhat run scripts/deploy.ts --network monadTestnet
```

### 4. 启动开发服务

```bash
# 后端 (端口 3001)
cd backend && pnpm start:dev

# 前端 (端口 5173)
cd frontend && pnpm dev
```

## 📡 智能合约功能

### 核心特性

1. **动态定价**: 价格随解锁人数上涨，早期用户获得优势
2. **解锁即 NFT**: 解锁内容同时获得 ERC721 凭证，可转让
3. **推荐分成**: 创作者 85% | 推荐人 10% | 平台 5%

### 合约接口

```solidity
// 创建内容
function createContent(uint256 basePrice, string metadataURI) external;

// 解锁内容 (获得 NFT)
function unlock(uint256 contentId, address referrer) external payable;

// 获取动态价格
function getPrice(uint256 contentId) external view returns (uint256);

// 创作者提现
function withdraw() external;
```

## 📚 文档

- [🚀 启动与部署指南](./docs/GETTING_STARTED.md) - 从零开始运行项目
- [📐 架构文档](./docs/ARCHITECTURE.md) - 详细的系统架构和技术实现
- [🎯 演示指南](./docs/DEMO_GUIDE.md) - 黑客松演示快速参考

## 🔗 链接

- **Monad Testnet RPC**: https://testnet-rpc.monad.xyz
- **Chain ID**: 10143
- **x402 协议**: 基于 HTTP 402 的支付协议
- **Thirdweb**: 支付 Facilitator

## 📜 License

MIT
