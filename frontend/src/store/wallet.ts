import { create } from 'zustand'

interface WalletState {
  address: string | null
  balance: string | null
  isConnecting: boolean
  error: string | null
  
  // Actions
  connect: () => Promise<void>
  disconnect: () => void
  setAddress: (address: string | null) => void
  setBalance: (balance: string | null) => void
}

export const useWalletStore = create<WalletState>((set, get) => ({
  address: null,
  balance: null,
  isConnecting: false,
  error: null,

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

      // Switch to Monad Testnet
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x27AF' }], // 10143 in hex
        })
      } catch (switchError: any) {
        // Chain not added, add it
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x27AF',
              chainName: 'Monad Testnet',
              nativeCurrency: {
                name: 'Monad',
                symbol: 'MON',
                decimals: 18,
              },
              rpcUrls: ['https://testnet-rpc.monad.xyz'],
              blockExplorerUrls: ['https://testnet.monadexplorer.com'],
            }],
          })
        }
      }

      // Get balance
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      })
      
      const balanceInMon = (parseInt(balance, 16) / 1e18).toFixed(4)
      set({ balance: balanceInMon })

      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          get().disconnect()
        } else {
          set({ address: accounts[0] })
        }
      })

    } catch (error: any) {
      set({ error: error.message })
    } finally {
      set({ isConnecting: false })
    }
  },

  disconnect: () => {
    set({ address: null, balance: null, error: null })
  },

  setAddress: (address) => set({ address }),
  setBalance: (balance) => set({ balance }),
}))

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

