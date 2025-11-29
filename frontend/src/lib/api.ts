const API_BASE = '/api'

export interface Content {
  id: string
  contentId: number
  title: string
  description: string
  category: string
  preview: string
  fullContent?: string
  basePrice: string
  currentPrice: string
  priceUsd: string
  creator: string
  creatorName: string
  metadataURI: string
  unlockCount: number
  createdAt: string
  tags: string[]
  imageUrl?: string
  unlocked?: boolean
  transactionHash?: string
}

export interface Category {
  id: string
  name: string
  icon: string
}

export interface PaymentConfig {
  network: {
    name: string
    chainId: number
    rpcUrl: string
    currency: {
      name: string
      symbol: string
      decimals: number
    }
  }
  facilitator: {
    enabled: boolean
    recipient: string
  }
  thirdweb: {
    clientId: string
  }
}

// Content API
export async function fetchContents(params?: { category?: string; search?: string }): Promise<Content[]> {
  const searchParams = new URLSearchParams()
  if (params?.category) searchParams.set('category', params.category)
  if (params?.search) searchParams.set('search', params.search)
  
  const url = `${API_BASE}/content${searchParams.toString() ? '?' + searchParams.toString() : ''}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch contents')
  return res.json()
}

export async function fetchContentPreview(id: string): Promise<Content> {
  const res = await fetch(`${API_BASE}/content/${id}/preview`)
  if (!res.ok) throw new Error('Failed to fetch content preview')
  return res.json()
}

export async function fetchContentFull(id: string, paymentData: string, walletAddress: string): Promise<Content> {
  const res = await fetch(`${API_BASE}/content/${id}`, {
    headers: {
      'x-payment': paymentData,
      'x-wallet-address': walletAddress,
    },
  })
  
  if (res.status === 402) {
    const data = await res.json()
    throw new PaymentRequiredError(data)
  }
  
  if (!res.ok) throw new Error('Failed to fetch content')
  return res.json()
}

export async function createContent(content: Partial<Content>, walletAddress: string): Promise<Content> {
  const res = await fetch(`${API_BASE}/content`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-wallet-address': walletAddress,
    },
    body: JSON.stringify(content),
  })
  if (!res.ok) throw new Error('Failed to create content')
  return res.json()
}

// Categories
export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/content/meta/categories`)
  if (!res.ok) throw new Error('Failed to fetch categories')
  return res.json()
}

// Payment API
export async function fetchPaymentConfig(): Promise<PaymentConfig> {
  const res = await fetch(`${API_BASE}/payment/config`)
  if (!res.ok) throw new Error('Failed to fetch payment config')
  return res.json()
}

// User API
export async function fetchUserStats(walletAddress: string) {
  const res = await fetch(`${API_BASE}/user/stats`, {
    headers: { 'x-wallet-address': walletAddress },
  })
  if (!res.ok) throw new Error('Failed to fetch user stats')
  return res.json()
}

export async function fetchUnlockedContents(walletAddress: string) {
  const res = await fetch(`${API_BASE}/user/unlocked`, {
    headers: { 'x-wallet-address': walletAddress },
  })
  if (!res.ok) throw new Error('Failed to fetch unlocked contents')
  return res.json()
}

// Custom error for 402 Payment Required
export class PaymentRequiredError extends Error {
  price: string
  priceUsd: string
  contentId: number
  payTo: string

  constructor(data: { price: string; priceUsd: string; contentId: number; payTo: string }) {
    super('Payment required')
    this.name = 'PaymentRequiredError'
    this.price = data.price
    this.priceUsd = data.priceUsd
    this.contentId = data.contentId
    this.payTo = data.payTo
  }
}

