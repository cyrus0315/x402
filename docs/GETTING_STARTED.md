# 🚀 PayPerInsight 启动与部署指南

> 从零开始运行 PayPerInsight 的完整指南

---

## 📋 目录

1. [环境要求](#-环境要求)
2. [快速开始](#-快速开始)
3. [详细安装步骤](#-详细安装步骤)
4. [环境变量配置](#-环境变量配置)
5. [启动开发环境](#-启动开发环境)
6. [智能合约部署](#-智能合约部署)
7. [生产环境部署](#-生产环境部署)
8. [常见问题](#-常见问题)

---

## 🔧 环境要求

### 必需软件

| 软件 | 最低版本 | 推荐版本 | 安装说明 |
|------|----------|----------|----------|
| **Node.js** | 18.x | 20.x | [nodejs.org](https://nodejs.org) |
| **pnpm** | 8.x | 9.x | `npm install -g pnpm` |
| **Git** | 2.x | 最新 | [git-scm.com](https://git-scm.com) |

### 推荐工具

| 工具 | 用途 | 安装 |
|------|------|------|
| **VS Code** | 代码编辑器 | [code.visualstudio.com](https://code.visualstudio.com) |
| **MetaMask** | 浏览器钱包 | [metamask.io](https://metamask.io) |

### 检查环境

```bash
# 检查 Node.js 版本
node --version
# 应输出: v18.x.x 或更高

# 检查 pnpm 版本
pnpm --version
# 应输出: 8.x.x 或更高

# 检查 Git 版本
git --version
# 应输出: git version 2.x.x
```

---

## ⚡ 快速开始

如果你只是想快速运行项目，执行以下命令：

```bash
# 1. 克隆项目 (如果还没有)
cd /path/to/your/workspace
git clone <your-repo-url> x402
cd x402

# 2. 安装所有依赖
pnpm install
cd backend && pnpm install && cd ..
cd frontend && pnpm install && cd ..
cd contracts && pnpm install && cd ..

# 3. 创建环境变量文件
cp .env.example .env
# 编辑 .env 文件，填入你的配置

# 4. 启动后端
cd backend && pnpm start:dev &

# 5. 启动前端
cd ../frontend && pnpm dev
```

然后访问 http://localhost:5173 即可看到应用。

---

## 📦 详细安装步骤

### 步骤 1: 获取项目代码

```bash
# 方式 A: 从 Git 克隆
git clone <your-repo-url> x402
cd x402

# 方式 B: 如果已有代码
cd /Users/h15/Desktop/x402
```

### 步骤 2: 安装根目录依赖

```bash
# 在项目根目录
pnpm install
```

这会安装 `concurrently` 等开发工具。

**预期输出**:
```
Packages: +29
+++++++++++++++++++++++++++++
Done in 10s
```

### 步骤 3: 安装后端依赖

```bash
cd backend
pnpm install
```

**预期输出**:
```
Packages: +932
Done in 2m
```

主要依赖包括:
- `@nestjs/core` - NestJS 核心框架
- `thirdweb` - x402 支付集成
- `ethers` - 以太坊交互库

### 步骤 4: 安装前端依赖

```bash
cd ../frontend
pnpm install
```

**预期输出**:
```
Packages: +815
Done in 2m
```

主要依赖包括:
- `react` - UI 框架
- `vite` - 构建工具
- `tailwindcss` - CSS 框架
- `framer-motion` - 动画库
- `thirdweb` - 钱包连接

### 步骤 5: 安装合约依赖

```bash
cd ../contracts
pnpm install
```

**预期输出**:
```
Packages: +530
Done in 40s
```

主要依赖包括:
- `hardhat` - 合约开发框架
- `@openzeppelin/contracts` - 安全合约库

---

## 🔐 环境变量配置

### 创建 .env 文件

在项目根目录创建 `.env` 文件：

```bash
cd /Users/h15/Desktop/x402
touch .env
```

### 配置内容

```bash
# ============================================
# PayPerInsight 环境配置
# ============================================

# --------------------------------------------
# 1. Thirdweb 配置 (必需)
# --------------------------------------------
# 获取方式: 访问 https://thirdweb.com/dashboard
# 1. 登录/注册账号
# 2. 创建项目
# 3. 进入 Settings -> API Keys
# 4. 复制 Secret Key 和 Client ID

THIRDWEB_SECRET_KEY=your_thirdweb_secret_key
THIRDWEB_CLIENT_ID=your_thirdweb_client_id

# --------------------------------------------
# 2. 钱包配置 (必需)
# --------------------------------------------
# RECIPIENT_WALLET: 接收支付的钱包地址
# - 从 MetaMask 复制你的钱包地址
# - 格式: 0x + 40位十六进制

RECIPIENT_WALLET=0xYourWalletAddress

# PRIVATE_KEY: 部署合约用的私钥 (危险! 不要泄露!)
# - 从 MetaMask 导出: 账户详情 -> 显示私钥
# - 格式: 0x + 64位十六进制

PRIVATE_KEY=0xYourPrivateKey

# --------------------------------------------
# 3. Monad 网络配置
# --------------------------------------------
MONAD_RPC_URL=https://testnet-rpc.monad.xyz
MONAD_CHAIN_ID=10143

# --------------------------------------------
# 4. 服务配置
# --------------------------------------------
PORT=3001
BACKEND_URL=http://localhost:3001
FRONTEND_URL=http://localhost:5173

# --------------------------------------------
# 5. 合约地址 (部署后填写)
# --------------------------------------------
CONTRACT_ADDRESS=
```

### 获取 Thirdweb 密钥

1. 访问 [thirdweb.com/dashboard](https://thirdweb.com/dashboard)
2. 登录或注册账号
3. 点击 **Create Project**
4. 进入项目 -> **Settings** -> **API Keys**
5. 复制:
   - **Secret Key** → `THIRDWEB_SECRET_KEY`
   - **Client ID** → `THIRDWEB_CLIENT_ID`

### 获取私钥 (从 MetaMask)

⚠️ **警告**: 私钥非常敏感，请勿分享或提交到代码库！

1. 打开 MetaMask
2. 点击账户右侧的 `⋮` 菜单
3. 选择 **Account details**
4. 点击 **Show private key**
5. 输入密码确认
6. 复制私钥 (以 `0x` 开头)

### 获取 Monad 测试币

1. 访问 Monad 水龙头: [faucet.monad.xyz](https://faucet.monad.xyz) (如有)
2. 或加入 Monad Discord 申请测试币
3. 确保钱包有足够的 MON 用于部署合约

---

## 🖥️ 启动开发环境

### 方式 1: 分别启动 (推荐调试时使用)

#### 启动后端

```bash
# 终端 1
cd /Users/h15/Desktop/x402/backend
pnpm start:dev
```

**预期输出**:
```
🚀 PayPerInsight Backend is running!

📍 Server:    http://localhost:3001
📡 API:       http://localhost:3001/api
💰 x402:      Enabled

📋 Endpoints:
   GET  /api/content          - List all content
   GET  /api/content/:id      - Get content (requires x402 payment)
   POST /api/content          - Create content
   GET  /api/user/unlocked    - Get user's unlocked content
```

#### 启动前端

```bash
# 终端 2
cd /Users/h15/Desktop/x402/frontend
pnpm dev
```

**预期输出**:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
  ➜  press h + enter to show help
```

### 方式 2: 同时启动

```bash
# 在项目根目录
cd /Users/h15/Desktop/x402
pnpm dev
```

这会使用 `concurrently` 同时启动后端和前端。

### 验证服务

| 服务 | URL | 验证方法 |
|------|-----|----------|
| 前端 | http://localhost:5173 | 浏览器访问 |
| 后端 | http://localhost:3001 | 浏览器访问 |
| API | http://localhost:3001/api/content | 返回内容列表 JSON |
| 支付状态 | http://localhost:3001/api/payment/status | 返回支付配置 |

---

## 📜 智能合约部署

### 步骤 1: 编译合约

```bash
cd /Users/h15/Desktop/x402/contracts
npx hardhat compile
```

**预期输出**:
```
Generating typings for: 21 artifacts in dir: typechain-types for target: ethers-v6
Successfully generated 60 typings!
Compiled 21 Solidity files successfully (evm target: paris).
```

### 步骤 2: 运行测试

```bash
npx hardhat test
```

**预期输出**:
```
  PayPerInsight
    Content Creation
      ✔ Should create content successfully
      ✔ Should emit ContentCreated event
      ✔ Should reject zero price
    Unlocking Content
      ✔ Should unlock content and mint NFT
      ✔ Should distribute revenue correctly without referrer
      ✔ Should distribute revenue correctly with referrer
      ✔ Should reject double unlock
      ✔ Should reject insufficient payment
    Dynamic Pricing
      ✔ Should increase price after 10 unlocks
    Withdrawal
      ✔ Should allow creator to withdraw
      ✔ Should allow referrer to withdraw
      ✔ Should allow owner to withdraw platform fees
    Access Control
      ✔ Should grant access after unlock
      ✔ Creator should be able to deactivate content

  14 passing (1s)
```

### 步骤 3: 部署到本地网络 (测试)

```bash
# 终端 1: 启动本地节点
npx hardhat node

# 终端 2: 部署到本地
npx hardhat run scripts/deploy.ts --network localhost
```

### 步骤 4: 部署到 Monad Testnet

确保 `.env` 中已配置:
- `PRIVATE_KEY` - 有测试币的钱包私钥
- `MONAD_RPC_URL` - Monad RPC 地址

```bash
npx hardhat run scripts/deploy.ts --network monadTestnet
```

**预期输出**:
```
🚀 Deploying PayPerInsight to Monad Testnet...

📍 Deployer address: 0x...
💰 Deployer balance: x.xxxx MON

✅ PayPerInsight deployed to: 0x...

📋 Contract Details:
   - Name: PayPerInsight
   - Symbol: PPI
   - Owner: 0x...

🔗 Add to your .env file:
   CONTRACT_ADDRESS=0x...
```

### 步骤 5: 更新环境变量

部署成功后，将合约地址添加到 `.env`:

```bash
CONTRACT_ADDRESS=0x部署输出的合约地址
```

### 步骤 6: 验证合约 (可选)

```bash
npx hardhat verify --network monadTestnet <CONTRACT_ADDRESS>
```

---

## 🌐 生产环境部署

### 后端部署

#### 选项 A: 部署到 Railway/Render

1. 将代码推送到 GitHub
2. 在 Railway/Render 创建新项目
3. 连接 GitHub 仓库
4. 设置环境变量
5. 部署

#### 选项 B: 部署到 VPS

```bash
# 1. SSH 到服务器
ssh user@your-server

# 2. 克隆代码
git clone <repo-url>
cd x402/backend

# 3. 安装依赖
pnpm install

# 4. 构建
pnpm build

# 5. 使用 PM2 运行
npm install -g pm2
pm2 start dist/main.js --name payperinsight-backend

# 6. 配置 Nginx 反向代理
sudo nano /etc/nginx/sites-available/api.yourdomain.com
```

Nginx 配置示例:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 前端部署

#### 选项 A: 部署到 Vercel (推荐)

1. 将代码推送到 GitHub
2. 访问 [vercel.com](https://vercel.com)
3. 导入项目
4. 设置:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `pnpm build`
   - **Output Directory**: `dist`
5. 添加环境变量
6. 部署

#### 选项 B: 手动构建部署

```bash
cd frontend

# 构建
pnpm build

# 构建产物在 dist/ 目录
ls dist/
# index.html  assets/  ...

# 上传 dist/ 到你的静态服务器 (Nginx, S3, etc.)
```

### 环境变量 (生产环境)

```bash
# 后端
THIRDWEB_SECRET_KEY=xxx
THIRDWEB_CLIENT_ID=xxx
RECIPIENT_WALLET=0x...
MONAD_RPC_URL=https://testnet-rpc.monad.xyz
PORT=3001
FRONTEND_URL=https://yourdomain.com

# 前端 (如果需要)
VITE_API_URL=https://api.yourdomain.com
VITE_THIRDWEB_CLIENT_ID=xxx
```

---

## 🔍 常见问题

### Q1: 后端启动报错 "Module not found"

**原因**: 依赖未安装完整

**解决**:
```bash
cd backend
rm -rf node_modules
pnpm install
```

### Q2: 前端报 CORS 错误

**原因**: 后端未正确配置 CORS

**解决**: 检查后端 `main.ts` 中的 CORS 配置:
```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
});
```

### Q3: 合约编译失败 "Could not download compiler"

**原因**: 网络问题无法下载 Solidity 编译器

**解决**:
1. 检查网络连接
2. 使用 VPN
3. 尝试其他 Solidity 版本

```typescript
// hardhat.config.ts
solidity: {
  version: "0.8.20", // 尝试其他版本
}
```

### Q4: 部署合约报 "insufficient funds"

**原因**: 钱包没有足够的测试币

**解决**:
1. 从水龙头获取测试币
2. 检查私钥对应的地址是否正确
3. 确认网络配置正确

### Q5: MetaMask 连接失败

**原因**: 网络配置不正确

**解决**: 在 MetaMask 中手动添加网络:
```
网络名称: Monad Testnet
RPC URL: https://testnet-rpc.monad.xyz
Chain ID: 10143
货币符号: MON
```

### Q6: x402 支付验证失败

**原因**: Thirdweb 配置问题

**解决**:
1. 确认 `THIRDWEB_SECRET_KEY` 正确
2. 确认 `RECIPIENT_WALLET` 是有效地址
3. 检查后端日志查看具体错误

---

## 📊 服务状态检查

### 检查所有服务

```bash
# 检查后端
curl http://localhost:3001/api/payment/status

# 检查前端
curl -I http://localhost:5173

# 检查合约 (需要部署后)
npx hardhat run scripts/check-contract.ts --network monadTestnet
```

### 健康检查端点

| 端点 | 预期响应 |
|------|----------|
| `GET /api/payment/status` | `{"enabled": true, "network": "monad-testnet", ...}` |
| `GET /api/content` | 内容数组 |
| `GET /api/payment/config` | 支付配置对象 |

---

## 📝 开发命令速查

```bash
# === 根目录 ===
pnpm dev              # 同时启动前后端
pnpm install:all      # 安装所有依赖

# === 后端 ===
cd backend
pnpm start:dev        # 开发模式 (热重载)
pnpm build            # 构建生产版本
pnpm start:prod       # 运行生产版本

# === 前端 ===
cd frontend
pnpm dev              # 开发模式
pnpm build            # 构建生产版本
pnpm preview          # 预览生产构建

# === 合约 ===
cd contracts
npx hardhat compile   # 编译合约
npx hardhat test      # 运行测试
npx hardhat node      # 启动本地节点
npx hardhat run scripts/deploy.ts --network monadTestnet  # 部署
```

---

## 🎉 完成！

如果一切顺利，你现在应该能够:

1. ✅ 访问前端: http://localhost:5173
2. ✅ 后端 API 正常响应
3. ✅ 连接 MetaMask 钱包
4. ✅ 浏览和解锁内容
5. ✅ (部署后) 链上交互正常

如有问题，请查看上方的 [常见问题](#-常见问题) 部分。

---

*文档最后更新: 2024*

