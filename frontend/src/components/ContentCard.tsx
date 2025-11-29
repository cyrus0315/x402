import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, TrendingUp, Users, Clock } from 'lucide-react'
import { Content } from '../lib/api'
import { formatPrice, formatTimeAgo } from '../lib/utils'

interface ContentCardProps {
  content: Content
  index?: number
}

export default function ContentCard({ content, index = 0 }: ContentCardProps) {
  const priceIncreasePercent = Math.floor(content.unlockCount / 10) * 10

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="group"
    >
      <Link to={`/content/${content.id}`}>
        <div className="card h-full flex flex-col overflow-hidden">
          {/* Image */}
          {content.imageUrl && (
            <div className="relative h-40 -mx-6 -mt-6 mb-4 overflow-hidden">
              <img
                src={content.imageUrl}
                alt={content.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
              
              {/* Lock overlay */}
              <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-2 text-primary">
                  <Lock className="w-5 h-5" />
                  <span className="font-medium">Pay to Unlock</span>
                </div>
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {content.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {content.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
            {content.description}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>{content.unlockCount} unlocks</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTimeAgo(content.createdAt)}</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <div>
              <div className="text-lg font-bold text-gradient">
                {formatPrice(content.currentPrice)}
              </div>
              <div className="text-xs text-muted-foreground">
                ≈ {content.priceUsd}
              </div>
            </div>
            
            {/* Dynamic pricing indicator */}
            {priceIncreasePercent > 0 && (
              <div className="flex items-center gap-1 text-xs text-accent">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+{priceIncreasePercent}%</span>
              </div>
            )}
          </div>

          {/* Creator */}
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary" />
            <span className="text-sm text-muted-foreground">{content.creatorName}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

