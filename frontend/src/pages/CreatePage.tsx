import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, X, Sparkles, AlertCircle } from 'lucide-react'
import { useWalletStore } from '../store/wallet'
import { createContent } from '../lib/api'
import { toast } from '../components/ui/Toaster'

const categories = [
  { id: 'trading', name: 'Trading', icon: '📈' },
  { id: 'ai', name: 'AI & ML', icon: '🤖' },
  { id: 'security', name: 'Security', icon: '🔒' },
  { id: 'development', name: 'Development', icon: '💻' },
  { id: 'research', name: 'Research', icon: '📊' },
  { id: 'tutorial', name: 'Tutorial', icon: '📚' },
]

export default function CreatePage() {
  const navigate = useNavigate()
  const { address, connect } = useWalletStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    preview: '',
    fullContent: '',
    basePrice: '0.01',
    creatorName: '',
    tags: [] as string[],
    imageUrl: '',
  })
  const [tagInput, setTagInput] = useState('')

  function updateForm(field: string, value: string | string[]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function addTag() {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      updateForm('tags', [...form.tags, tagInput.trim().toLowerCase()])
      setTagInput('')
    }
  }

  function removeTag(tag: string) {
    updateForm('tags', form.tags.filter((t) => t !== tag))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!address) {
      connect()
      return
    }

    if (!form.title || !form.description || !form.category || !form.preview || !form.fullContent) {
      toast({ type: 'error', title: 'Please fill all required fields' })
      return
    }

    setIsSubmitting(true)
    try {
      const basePriceWei = (parseFloat(form.basePrice) * 1e18).toString()
      
      const content = await createContent({
        title: form.title,
        description: form.description,
        category: form.category,
        preview: form.preview,
        fullContent: form.fullContent,
        basePrice: basePriceWei,
        priceUsd: `$${(parseFloat(form.basePrice) * 10).toFixed(2)}`, // Assuming 1 MON = $10
        creatorName: form.creatorName || 'Anonymous',
        tags: form.tags,
        imageUrl: form.imageUrl,
      }, address)

      toast({ type: 'success', title: 'Content created successfully!' })
      navigate(`/content/${content.id}`)
    } catch (error) {
      toast({ type: 'error', title: 'Failed to create content' })
    } finally {
      setIsSubmitting(false)
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
            You need to connect your wallet to create content
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2">Create Content</h1>
          <p className="text-muted-foreground mb-8">
            Share your knowledge and earn with every unlock
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Title <span className="text-accent">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => updateForm('title', e.target.value)}
                placeholder="e.g., Advanced Trading Strategies for DeFi"
                className="input"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Description <span className="text-accent">*</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => updateForm('description', e.target.value)}
                placeholder="A brief description of what readers will learn..."
                className="input min-h-[100px] resize-y"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Category <span className="text-accent">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => updateForm('category', cat.id)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      form.category === cat.id
                        ? 'border-primary bg-primary/10'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <span className="text-xl mb-1 block">{cat.icon}</span>
                    <span className="text-sm">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Preview Content <span className="text-accent">*</span>
              </label>
              <p className="text-xs text-muted-foreground mb-2">
                This will be visible to everyone before they pay
              </p>
              <textarea
                value={form.preview}
                onChange={(e) => updateForm('preview', e.target.value)}
                placeholder="A teaser of your content that hooks the reader..."
                className="input min-h-[120px] resize-y"
                required
              />
            </div>

            {/* Full Content */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Full Content <span className="text-accent">*</span>
              </label>
              <p className="text-xs text-muted-foreground mb-2">
                The complete content revealed after payment
              </p>
              <textarea
                value={form.fullContent}
                onChange={(e) => updateForm('fullContent', e.target.value)}
                placeholder="Your valuable content goes here... (Markdown supported)"
                className="input min-h-[300px] resize-y font-mono text-sm"
                required
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Base Price (MON) <span className="text-accent">*</span>
              </label>
              <p className="text-xs text-muted-foreground mb-2">
                Price will increase by 10% for every 10 unlocks
              </p>
              <div className="relative">
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  value={form.basePrice}
                  onChange={(e) => updateForm('basePrice', e.target.value)}
                  className="input pr-16"
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  MON
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                ≈ ${(parseFloat(form.basePrice || '0') * 10).toFixed(2)} USD
              </p>
            </div>

            {/* Creator Name */}
            <div>
              <label className="block text-sm font-medium mb-2">Creator Name</label>
              <input
                type="text"
                value={form.creatorName}
                onChange={(e) => updateForm('creatorName', e.target.value)}
                placeholder="Your display name (optional)"
                className="input"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium mb-2">Tags</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add a tag..."
                  className="input flex-1"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="btn-secondary px-4"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.tags.map((tag) => (
                    <span key={tag} className="tag flex items-center gap-1">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium mb-2">Cover Image URL</label>
              <input
                type="url"
                value={form.imageUrl}
                onChange={(e) => updateForm('imageUrl', e.target.value)}
                placeholder="https://..."
                className="input"
              />
            </div>

            {/* Submit */}
            <div className="pt-6 border-t border-white/10">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary flex items-center justify-center gap-2 py-4"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Publish Content
                  </>
                )}
              </button>
              <p className="text-xs text-muted-foreground text-center mt-3">
                Content will be stored and you'll start earning immediately
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

