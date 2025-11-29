import { ethers } from 'ethers'
import { CONTRACT_ADDRESS, CURRENT_NETWORK } from './config'

// 合约 ABI (只包含需要的函数)
const CONTRACT_ABI = [
  // 读取函数
  'function getPrice(uint256 contentId) view returns (uint256)',
  'function getContent(uint256 contentId) view returns (address creator, uint256 basePrice, uint256 currentPrice, string metadataURI, uint256 unlockCount, uint256 createdAt, bool active)',
  'function hasUnlocked(uint256 contentId, address user) view returns (bool)',
  'function checkAccess(uint256 contentId, address user) view returns (bool)',
  'function getBalance(address user) view returns (uint256 creatorEarnings, uint256 referrerEarnings, uint256 total)',
  
  // 写入函数
  'function createContent(uint256 basePrice, string metadataURI) returns (uint256)',
  'function unlock(uint256 contentId, address referrer) payable returns (uint256)',
  'function withdraw()',
  
  // 事件
  'event ContentCreated(uint256 indexed contentId, address indexed creator, uint256 basePrice, string metadataURI)',
  'event ContentUnlocked(uint256 indexed contentId, address indexed user, uint256 indexed tokenId, uint256 paidPrice, address referrer)',
]

/**
 * 获取 Provider
 */
export function getProvider() {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('Please install MetaMask')
  }
  return new ethers.BrowserProvider(window.ethereum)
}

/**
 * 获取合约实例 (只读)
 */
export async function getContract() {
  const provider = getProvider()
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
}

/**
 * 获取合约实例 (可写)
 */
export async function getContractWithSigner() {
  const provider = getProvider()
  const signer = await provider.getSigner()
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
}

/**
 * 获取内容当前价格
 */
export async function getContentPrice(contentId: number): Promise<bigint> {
  const contract = await getContract()
  return await contract.getPrice(contentId)
}

/**
 * 检查用户是否已解锁
 */
export async function checkUserAccess(contentId: number, userAddress: string): Promise<boolean> {
  const contract = await getContract()
  return await contract.hasUnlocked(contentId, userAddress)
}

/**
 * 解锁内容 (链上交易)
 */
export async function unlockContent(
  contentId: number,
  referrer: string = ethers.ZeroAddress
): Promise<{ transactionHash: string; tokenId: number }> {
  console.log(`🔓 Unlocking content ${contentId}...`)
  
  // 获取合约
  const contract = await getContractWithSigner()
  
  // 获取当前价格
  const price = await getContentPrice(contentId)
  console.log(`💰 Price: ${ethers.formatEther(price)} ${CURRENT_NETWORK.currency.symbol}`)
  
  // 发送解锁交易
  console.log('📤 Sending transaction...')
  const tx = await contract.unlock(contentId, referrer, {
    value: price,
  })
  
  console.log(`⏳ Transaction sent: ${tx.hash}`)
  console.log('⏳ Waiting for confirmation...')
  
  // 等待交易确认
  const receipt = await tx.wait()
  console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`)
  
  // 解析事件获取 tokenId
  let tokenId = 0
  for (const log of receipt.logs) {
    try {
      const parsed = contract.interface.parseLog({
        topics: log.topics as string[],
        data: log.data,
      })
      if (parsed?.name === 'ContentUnlocked') {
        tokenId = Number(parsed.args.tokenId)
        console.log(`🎨 NFT minted: Token ID ${tokenId}`)
      }
    } catch {
      // 忽略无法解析的日志
    }
  }
  
  return {
    transactionHash: tx.hash,
    tokenId,
  }
}

/**
 * 创建内容 (链上交易)
 */
export async function createContentOnChain(
  basePrice: bigint,
  metadataURI: string
): Promise<{ transactionHash: string; contentId: number }> {
  console.log('📝 Creating content on chain...')
  
  const contract = await getContractWithSigner()
  
  const tx = await contract.createContent(basePrice, metadataURI)
  console.log(`⏳ Transaction sent: ${tx.hash}`)
  
  const receipt = await tx.wait()
  console.log(`✅ Transaction confirmed`)
  
  // 解析事件获取 contentId
  let contentId = 0
  for (const log of receipt.logs) {
    try {
      const parsed = contract.interface.parseLog({
        topics: log.topics as string[],
        data: log.data,
      })
      if (parsed?.name === 'ContentCreated') {
        contentId = Number(parsed.args.contentId)
        console.log(`📄 Content created: ID ${contentId}`)
      }
    } catch {
      // 忽略
    }
  }
  
  return {
    transactionHash: tx.hash,
    contentId,
  }
}

/**
 * 提现收益
 */
export async function withdrawEarnings(): Promise<string> {
  console.log('💸 Withdrawing earnings...')
  
  const contract = await getContractWithSigner()
  const tx = await contract.withdraw()
  
  console.log(`⏳ Transaction sent: ${tx.hash}`)
  await tx.wait()
  console.log('✅ Withdrawal complete')
  
  return tx.hash
}

/**
 * 获取用户余额
 */
export async function getUserBalance(userAddress: string): Promise<{
  creatorEarnings: bigint
  referrerEarnings: bigint
  total: bigint
}> {
  const contract = await getContract()
  const [creatorEarnings, referrerEarnings, total] = await contract.getBalance(userAddress)
  return { creatorEarnings, referrerEarnings, total }
}

