import { create } from 'zustand'
import { CURRENT_NETWORK } from '../lib/config'

interface WalletState {
  address: string | null
  balance: string | null
  isConnecting: boolean
  error: string | null
  chainId: number | null
  initialized: boolean
  
  // Actions
  connect: () => Promise<void>
  disconnect: () => void
  setAddress: (address: string | null) => void
  setBalance: (balance: string | null) => void
  checkConnection: () => Promise<void>
}

export const useWalletStore = create<WalletState>((set, get) => ({
  address: null,
  balance: null,
  isConnecting: false,
  error: null,
  chainId: null,
  initialized: false,

  // 检查是否已连接（页面加载时调用）
  checkConnection: async () => {
    if (get().initialized) return
    set({ initialized: true })
    
    if (typeof window.ethereum === 'undefined') return
    
    try {
      // 使用 eth_accounts 而不是 eth_requestAccounts，这样不会弹出连接窗口
      const accounts = await window.ethereum.request({
        method: 'eth_accounts',
      })
      
      if (accounts.length > 0) {
        const address = accounts[0]
        set({ address })
        
        // 获取链 ID
        const chainIdHex = await window.ethereum.request({
          method: 'eth_chainId',
        })
        set({ chainId: parseInt(chainIdHex, 16) })
        
        // 获取余额
        const balance = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [address, 'latest'],
        })
        const balanceFormatted = (parseInt(balance, 16) / 1e18).toFixed(4)
        set({ balance: balanceFormatted })
        
        console.log('✅ Wallet reconnected:', address)
        
        // 设置监听器
        setupListeners(get)
      }
    } catch (err) {
      console.log('No existing wallet connection')
    }
  },

  connect: async () => {
    set({ isConnecting: true, error: null })
    
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum === 'undefined') {
        throw new Error('Please install MetaMask to connect')
      }

      // Request accounts
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      })

      if (accounts.length === 0) {
        throw new Error('No accounts found')
      }

      const address = accounts[0]
      set({ address })

      // Switch to target network
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: CURRENT_NETWORK.chainIdHex }],
        })
      } catch (switchError: any) {
        // Chain not added, add it
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: CURRENT_NETWORK.chainIdHex,
              chainName: CURRENT_NETWORK.name,
              nativeCurrency: CURRENT_NETWORK.currency,
              rpcUrls: [CURRENT_NETWORK.rpcUrl],
              blockExplorerUrls: CURRENT_NETWORK.blockExplorer ? [CURRENT_NETWORK.blockExplorer] : [],
            }],
          })
        }
      }

      // Get current chain ID
      const chainIdHex = await window.ethereum.request({
        method: 'eth_chainId',
      })
      set({ chainId: parseInt(chainIdHex, 16) })

      // Get balance
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      })
      
      const balanceFormatted = (parseInt(balance, 16) / 1e18).toFixed(4)
      set({ balance: balanceFormatted })

      // 设置监听器
      setupListeners(get)

      console.log(`✅ Connected to ${CURRENT_NETWORK.name}`)
      console.log(`📍 Address: ${address}`)
      console.log(`💰 Balance: ${balanceFormatted} ${CURRENT_NETWORK.currency.symbol}`)

    } catch (error: any) {
      console.error('Connection error:', error)
      set({ error: error.message })
    } finally {
      set({ isConnecting: false })
    }
  },

  disconnect: () => {
    set({ address: null, balance: null, error: null, chainId: null })
  },

  setAddress: (address) => set({ address }),
  setBalance: (balance) => set({ balance }),
}))

// 设置事件监听器
let listenersSetup = false
function setupListeners(get: () => WalletState) {
  if (listenersSetup || typeof window.ethereum === 'undefined') return
  listenersSetup = true
  
  window.ethereum.on('accountsChanged', (accounts: string[]) => {
    if (accounts.length === 0) {
      get().disconnect()
    } else {
      // 重新连接以刷新状态
      get().connect()
    }
  })

  window.ethereum.on('chainChanged', () => {
    // 链改变时刷新页面（MetaMask 推荐做法）
    window.location.reload()
  })
}

// TypeScript declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>
      on: (event: string, callback: (...args: any[]) => void) => void
      removeListener: (event: string, callback: (...args: any[]) => void) => void
    }
  }
}

// 页面加载时自动检查连接
if (typeof window !== 'undefined') {
  // 延迟执行，确保 MetaMask 已注入
  setTimeout(() => {
    useWalletStore.getState().checkConnection()
  }, 100)
}
