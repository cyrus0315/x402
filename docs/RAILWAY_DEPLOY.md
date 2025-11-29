# 🚂 Railway 部署指南

## 前提条件

1. 已注册 [Railway](https://railway.com/) 账号
2. 项目已推送到 GitHub
3. 合约已部署到 Monad Testnet

## 部署步骤

### Step 1: 部署后端

1. 登录 Railway Dashboard
2. 点击 **New Project** → **Deploy from GitHub Repo**
3. 选择你的仓库
4. Railway 会自动检测到 `backend/Dockerfile`
5. 配置 **Root Directory**: `backend`
6. 添加环境变量：

```
PORT=3001
NODE_ENV=production
NETWORK=monad
CHAIN_ID=10143
MONAD_RPC_URL=https://testnet-rpc.monad.xyz
RECIPIENT_WALLET=你的钱包地址
THIRDWEB_SECRET_KEY=（可选）
```

7. 点击 Deploy
8. 部署成功后，记录后端 URL（类似 `https://backend-xxx.up.railway.app`）

### Step 2: 部署前端

1. 在同一 Project 中，点击 **+ New** → **GitHub Repo**
2. 选择同一仓库
3. 配置 **Root Directory**: `frontend`
4. 添加环境变量：

```
VITE_NETWORK=monad
VITE_CONTRACT_ADDRESS=你部署到Monad的合约地址
VITE_API_URL=https://backend-xxx.up.railway.app/api
```

5. 点击 Deploy
6. 部署成功后获得前端 URL

### Step 3: 配置域名（可选）

1. 在 Railway 的 Service Settings 中
2. 点击 **Generate Domain** 或添加自定义域名

## 环境变量汇总

### 后端环境变量

| 变量 | 说明 | 示例 |
|------|------|------|
| `PORT` | 端口 | `3001` |
| `NODE_ENV` | 环境 | `production` |
| `NETWORK` | 网络 | `monad` |
| `CHAIN_ID` | Chain ID | `10143` |
| `MONAD_RPC_URL` | RPC URL | `https://testnet-rpc.monad.xyz` |
| `RECIPIENT_WALLET` | 收款钱包 | `0x...` |
| `THIRDWEB_SECRET_KEY` | Thirdweb 密钥 | （可选） |

### 前端环境变量

| 变量 | 说明 | 示例 |
|------|------|------|
| `VITE_NETWORK` | 网络 | `monad` |
| `VITE_CONTRACT_ADDRESS` | 合约地址 | `0x...` |
| `VITE_API_URL` | 后端 API URL | `https://backend-xxx.up.railway.app/api` |

## 部署后检查

1. 访问前端 URL，确认页面正常加载
2. 打开 DevTools → Network，确认 API 请求正常
3. 连接 MetaMask，切换到 Monad Testnet
4. 尝试解锁内容

## 常见问题

### Q: API 请求跨域错误？
确保后端启用了 CORS，检查 `main.ts`:
```typescript
app.enableCors({
  origin: true,
  credentials: true,
});
```

### Q: 前端构建失败？
检查是否设置了必要的 `VITE_` 环境变量

### Q: 后端连接不上？
检查 Railway 的 Deploy Logs 查看错误信息

## 架构图

```
┌─────────────────────────────────────────────────────────┐
│                     Railway                              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────┐       ┌─────────────────┐          │
│  │    Frontend     │──────►│    Backend      │          │
│  │  (React/Vite)   │  API  │   (NestJS)      │          │
│  │                 │       │                 │          │
│  │  nginx:80       │       │  node:3001      │          │
│  └─────────────────┘       └─────────────────┘          │
│         │                          │                     │
└─────────┼──────────────────────────┼─────────────────────┘
          │                          │
          ▼                          ▼
    ┌───────────┐            ┌───────────────┐
    │  用户浏览器  │            │  Monad Testnet │
    │  MetaMask  │◄──────────│    合约        │
    └───────────┘            └───────────────┘
```

## Railway 费用

- **免费额度**: $5/月，足够 hackathon 演示
- **超出后**: 按使用量计费

---

部署成功后，你的项目就可以在线访问了！🎉

