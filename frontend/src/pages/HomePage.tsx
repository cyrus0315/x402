import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Sparkles, Zap, Shield, TrendingUp } from 'lucide-react'
import ContentCard from '../components/ContentCard'
import { fetchContents, fetchCategories, Content, Category } from '../lib/api'

export default function HomePage() {
  const [contents, setContents] = useState<Content[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [selectedCategory, searchQuery])

  async function loadData() {
    setIsLoading(true)
    try {
      const [contentsData, categoriesData] = await Promise.all([
        fetchContents({
          category: selectedCategory || undefined,
          search: searchQuery || undefined,
        }),
        fetchCategories(),
      ])
      setContents(contentsData)
      setCategories(categoriesData)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[128px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 mb-6"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm">Powered by x402 + Monad</span>
            </motion.div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-gradient">Pay Per Insight</span>
              <br />
              <span className="text-foreground">Unlock Knowledge Instantly</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              A decentralized marketplace where premium knowledge meets instant micropayments.
              No subscriptions. No sign-ups. Just pay and unlock.
            </p>

            {/* Search */}
            <div className="max-w-xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search for insights..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-12 pr-4 py-4 text-lg"
              />
            </div>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16"
          >
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              title="Instant Payments"
              description="Pay with x402 protocol - no gas confirmation wait"
            />
            <FeatureCard
              icon={<TrendingUp className="w-6 h-6" />}
              title="Dynamic Pricing"
              description="Early supporters get the best prices"
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title="NFT Access"
              description="Unlock once, get NFT proof forever"
            />
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Categories */}
          <div className="flex flex-wrap gap-3 mb-8">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                !selectedCategory
                  ? 'bg-primary text-white'
                  : 'bg-muted/50 text-muted-foreground hover:text-foreground'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  selectedCategory === category.id
                    ? 'bg-primary text-white'
                    : 'bg-muted/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>

          {/* Content Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-40 bg-muted/50 rounded-lg mb-4" />
                  <div className="h-4 bg-muted/50 rounded w-1/4 mb-3" />
                  <div className="h-6 bg-muted/50 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted/50 rounded w-full mb-4" />
                  <div className="h-8 bg-muted/50 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : contents.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No content found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contents.map((content, index) => (
                <ContentCard key={content.id} content={content} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="card text-center">
      <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary">
        {icon}
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

