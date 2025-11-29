import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Lock,
  Unlock,
  Share2,
  TrendingUp,
  Users,
  Clock,
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
} from 'lucide-react'
import { fetchContentPreview, Content } from '../lib/api'
import { useWalletStore } from '../store/wallet'
import { formatPrice, formatAddress, formatTimeAgo } from '../lib/utils'
import { toast } from '../components/ui/Toaster'

export default function ContentPage() {
  const { id } = useParams<{ id: string }>()
  const [content, setContent] = useState<Content | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [referralCopied, setReferralCopied] = useState(false)
  const { address, connect } = useWalletStore()

  useEffect(() => {
    if (id) loadContent()
  }, [id])

  async function loadContent() {
    setIsLoading(true)
    try {
      const data = await fetchContentPreview(id!)
      setContent(data)
    } catch (error) {
      console.error('Failed to load content:', error)
      toast({ type: 'error', title: 'Failed to load content' })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleUnlock() {
    if (!address) {
      connect()
      return
    }

    if (!content) return

    setIsUnlocking(true)
    try {
      // For demo: simulate payment
      // In production, this would use thirdweb x402 SDK
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Mock successful unlock
      setIsUnlocked(true)
      setContent({
        ...content,
        fullContent: `# ${content.title}

This is the full unlocked content! 🎉

${content.preview}

## Deep Dive

Here's the complete premium content that was previously locked...

### Key Insights
1. First major insight with detailed explanation
2. Second important point with examples
3. Third crucial element with code samples

### Code Example
\`\`\`javascript
// Premium code snippet
function premiumFeature() {
  return "This is exclusive content!";
}
\`\`\`

### Conclusion
Thank you for unlocking this content! You now have permanent access via your NFT.
`,
        unlocked: true,
        transactionHash: `0x${Date.now().toString(16)}${'0'.repeat(48)}`,
      })

      toast({
        type: 'success',
        title: 'Content Unlocked! 🎉',
        message: 'NFT minted to your wallet',
      })
    } catch (error) {
      toast({ type: 'error', title: 'Unlock failed', message: 'Please try again' })
    } finally {
      setIsUnlocking(false)
    }
  }

  function copyReferralLink() {
    const link = `${window.location.origin}/content/${id}?ref=${address}`
    navigator.clipboard.writeText(link)
    setReferralCopied(true)
    setTimeout(() => setReferralCopied(false), 2000)
    toast({ type: 'success', title: 'Referral link copied!' })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-4">Content not found</p>
          <Link to="/" className="btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const priceIncreasePercent = Math.floor(content.unlockCount / 10) * 10

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Discover
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {content.tags.map((tag) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4">{content.title}</h1>

          <p className="text-lg text-muted-foreground mb-6">{content.description}</p>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary" />
              <span>{content.creatorName}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{content.unlockCount} unlocks</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{formatTimeAgo(content.createdAt)}</span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card"
            >
              {/* Preview */}
              <div className="prose prose-invert max-w-none mb-6">
                <p className="text-muted-foreground">{content.preview}</p>
              </div>

              {/* Locked/Unlocked content */}
              <AnimatePresence mode="wait">
                {isUnlocked ? (
                  <motion.div
                    key="unlocked"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="border-t border-white/10 pt-6"
                  >
                    <div className="flex items-center gap-2 text-green-400 mb-4">
                      <Unlock className="w-5 h-5" />
                      <span className="font-medium">Content Unlocked</span>
                    </div>
                    <div className="prose prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap text-sm">
                        {content.fullContent}
                      </pre>
                    </div>
                    
                    {/* Transaction info */}
                    {content.transactionHash && (
                      <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Transaction Hash</p>
                        <a
                          href={`https://testnet.monadexplorer.com/tx/${content.transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-mono text-primary hover:underline flex items-center gap-1"
                        >
                          {formatAddress(content.transactionHash)}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="locked"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="relative"
                  >
                    {/* Blurred preview */}
                    <div className="h-64 overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/50 to-card" />
                      <p className="text-muted-foreground blur-sm select-none">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
                        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
                        quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
                        consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
                        cillum dolore eu fugiat nulla pariatur...
                      </p>
                    </div>

                    {/* Lock overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center"
                        >
                          <Lock className="w-8 h-8 text-primary" />
                        </motion.div>
                        <p className="text-muted-foreground">
                          Pay to unlock full content
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card sticky top-24"
            >
              {/* Price */}
              <div className="text-center mb-6">
                <p className="text-sm text-muted-foreground mb-1">Current Price</p>
                <div className="text-3xl font-bold text-gradient">
                  {formatPrice(content.currentPrice)}
                </div>
                <p className="text-sm text-muted-foreground">≈ {content.priceUsd}</p>

                {priceIncreasePercent > 0 && (
                  <div className="flex items-center justify-center gap-1 mt-2 text-accent text-sm">
                    <TrendingUp className="w-4 h-4" />
                    <span>+{priceIncreasePercent}% from base price</span>
                  </div>
                )}
              </div>

              {/* Unlock button */}
              {!isUnlocked && (
                <button
                  onClick={handleUnlock}
                  disabled={isUnlocking}
                  className="w-full btn-primary flex items-center justify-center gap-2 mb-4"
                >
                  {isUnlocking ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Unlocking...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      {address ? 'Pay & Unlock' : 'Connect to Unlock'}
                    </>
                  )}
                </button>
              )}

              {/* Share/Referral */}
              {address && (
                <button
                  onClick={copyReferralLink}
                  className="w-full btn-secondary flex items-center justify-center gap-2"
                >
                  {referralCopied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      Share & Earn 10%
                    </>
                  )}
                </button>
              )}

              {/* Info */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <h4 className="font-medium mb-3">What you get</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Unlock className="w-4 h-4 text-primary" />
                    Full content access
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    NFT proof of ownership
                  </li>
                  <li className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-primary" />
                    10% referral earnings
                  </li>
                </ul>
              </div>

              {/* Revenue split */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <h4 className="font-medium mb-3">Revenue Split</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Creator</span>
                    <span>85%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Referrer</span>
                    <span>10%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Platform</span>
                    <span>5%</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

