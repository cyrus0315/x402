import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, User, Wallet, LogOut } from 'lucide-react'
import { useWalletStore } from '../store/wallet'
import { formatAddress } from '../lib/utils'
import { CURRENT_NETWORK, NETWORK } from '../lib/config'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const { address, balance, isConnecting, connect, disconnect } = useWalletStore()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <motion.div
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.5 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center"
              >
                <Sparkles className="w-5 h-5 text-white" />
              </motion.div>
              <span className="text-xl font-bold text-gradient">PayPerInsight</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <NavLink to="/" active={location.pathname === '/'}>
                Discover
              </NavLink>
              <NavLink to="/create" active={location.pathname === '/create'}>
                Create
              </NavLink>
              {address && (
                <NavLink to="/profile" active={location.pathname === '/profile'}>
                  Profile
                </NavLink>
              )}
            </nav>

            {/* Wallet */}
            <div className="flex items-center gap-3">
              {/* Network indicator */}
              <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                NETWORK === 'local' 
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' 
                  : 'bg-green-500/20 text-green-400 border border-green-500/30'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${NETWORK === 'local' ? 'bg-yellow-400' : 'bg-green-400'} animate-pulse`} />
                {CURRENT_NETWORK.name}
              </div>

              {address ? (
                <div className="flex items-center gap-3">
                  {/* Balance */}
                  <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-sm font-mono">{balance} {CURRENT_NETWORK.currency.symbol}</span>
                  </div>
                  
                  {/* Address dropdown */}
                  <div className="relative group">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 border border-primary/30 hover:bg-primary/30 transition-colors">
                      <Wallet className="w-4 h-4" />
                      <span className="font-mono text-sm">{formatAddress(address)}</span>
                    </button>
                    
                    {/* Dropdown */}
                    <div className="absolute right-0 mt-2 w-48 py-2 glass rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </Link>
                      <button
                        onClick={disconnect}
                        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-white/5 transition-colors text-red-400"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Disconnect</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={connect}
                  disabled={isConnecting}
                  className="btn-primary flex items-center gap-2"
                >
                  <Wallet className="w-4 h-4" />
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 pt-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Sparkles className="w-4 h-4" />
              <span>PayPerInsight</span>
              <span className="text-white/20">•</span>
              <span>Powered by x402 + Monad</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Docs</a>
              <a href="#" className="hover:text-foreground transition-colors">GitHub</a>
              <a href="#" className="hover:text-foreground transition-colors">Twitter</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function NavLink({ to, active, children }: { to: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className={`relative px-3 py-2 text-sm font-medium transition-colors ${
        active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      {children}
      {active && (
        <motion.div
          layoutId="nav-indicator"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-secondary"
        />
      )}
    </Link>
  )
}

