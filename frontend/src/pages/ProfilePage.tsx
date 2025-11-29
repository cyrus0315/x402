import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Wallet,
  TrendingUp,
  Users,
  FileText,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
} from 'lucide-react'
import { useWalletStore } from '../store/wallet'
import { fetchUserStats, fetchUnlockedContents } from '../lib/api'
import { formatAddress, formatPrice } from '../lib/utils'
import { toast } from '../components/ui/Toaster'

interface UserStats {
  totalUnlocked: number
  totalCreated: number
  totalSpent: string
  totalEarned: string
  referralEarnings: string
}

interface UnlockRecord {
  contentId: string
  transactionHash: string
  price: string
  referrer?: string
  unlockedAt: string
}

export default function ProfilePage() {
  const { address, balance, connect } = useWalletStore()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [unlocks, setUnlocks] = useState<UnlockRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (address) loadData()
  }, [address])

  async function loadData() {
    setIsLoading(true)
    try {
      const [statsData, unlocksData] = await Promise.all([
        fetchUserStats(address!),
        fetchUnlockedContents(address!),
      ])
      setStats(statsData)
      setUnlocks(unlocksData)
    } catch (error) {
      console.error('Failed to load user data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  function copyAddress() {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({ type: 'success', title: 'Address copied!' })
    }
  }

  if (!address) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-muted-foreground mb-6">
            View your profile and activity by connecting your wallet
          </p>
          <button onClick={connect} className="btn-primary">
            Connect Wallet
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-lg">{formatAddress(address)}</span>
                <button
                  onClick={copyAddress}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
                <a
                  href={`https://testnet.monadexplorer.com/address/${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span>Connected to Monad Testnet</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Balance</p>
              <p className="text-2xl font-bold text-gradient">{balance} MON</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-4 bg-muted/50 rounded w-1/2 mb-2" />
                <div className="h-8 bg-muted/50 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <StatCard
              icon={<FileText className="w-5 h-5" />}
              label="Unlocked"
              value={stats.totalUnlocked.toString()}
            />
            <StatCard
              icon={<Users className="w-5 h-5" />}
              label="Created"
              value={stats.totalCreated.toString()}
            />
            <StatCard
              icon={<TrendingUp className="w-5 h-5" />}
              label="Earned"
              value={formatPrice(stats.totalEarned)}
              highlight
            />
            <StatCard
              icon={<Users className="w-5 h-5" />}
              label="Referral Earnings"
              value={formatPrice(stats.referralEarnings)}
            />
          </motion.div>
        )}

        {/* Unlocked Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-bold mb-4">Unlocked Content</h2>
          
          {unlocks.length === 0 ? (
            <div className="card text-center py-12">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No unlocked content yet</p>
              <Link to="/" className="btn-primary inline-flex">
                Discover Content
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {unlocks.map((unlock, index) => (
                <motion.div
                  key={unlock.transactionHash}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card flex items-center justify-between"
                >
                  <div>
                    <Link
                      to={`/content/${unlock.contentId}`}
                      className="font-medium hover:text-primary transition-colors"
                    >
                      Content #{unlock.contentId}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {new Date(unlock.unlockedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono">{formatPrice(unlock.price)}</p>
                    <a
                      href={`https://testnet.monadexplorer.com/tx/${unlock.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1 justify-end"
                    >
                      View TX <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex gap-4"
        >
          <Link to="/create" className="btn-primary flex-1 text-center">
            Create Content
          </Link>
          <Link to="/" className="btn-secondary flex-1 text-center">
            Discover More
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ReactNode
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="card">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <p className={`text-xl font-bold ${highlight ? 'text-gradient' : ''}`}>{value}</p>
    </div>
  )
}

