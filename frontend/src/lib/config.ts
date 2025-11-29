/**
 * 网络配置
 * 通过环境变量 VITE_NETWORK 切换网络
 * - 'local' = Hardhat 本地网络
 * - 'monad' = Monad Testnet (默认)
 */

export type NetworkType = 'local' | 'monad';

// 从环境变量读取，默认为 'local' 方便本地开发
export const NETWORK: NetworkType = (import.meta.env.VITE_NETWORK as NetworkType) || 'local';

export const NETWORKS = {
  local: {
    name: 'Localhost',
    chainId: 31337,
    chainIdHex: '0x7A69',
    rpcUrl: 'http://127.0.0.1:8545',
    currency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorer: '',
  },
  monad: {
    name: 'Monad Testnet',
    chainId: 10143,
    chainIdHex: '0x27AF',
    rpcUrl: 'https://testnet-rpc.monad.xyz',
    currency: {
      name: 'Monad',
      symbol: 'MON',
      decimals: 18,
    },
    blockExplorer: 'https://testnet.monadexplorer.com',
  },
};

export const CURRENT_NETWORK = NETWORKS[NETWORK];

// 合约地址 (本地部署后更新)
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3';

// API 地址
export const API_BASE = import.meta.env.VITE_API_URL || '/api';

console.log(`🔗 Network: ${CURRENT_NETWORK.name} (Chain ID: ${CURRENT_NETWORK.chainId})`);

