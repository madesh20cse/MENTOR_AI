import React from 'react'
import { motion } from 'framer-motion'
import {
  Code2,
  Zap,
  GitBranch,
  Trophy,
  TrendingUp,
  Briefcase,
  Target,
  BookOpen,
} from 'lucide-react'

const MetricsGrid = ({ categoryBreakdown }) => {
  const iconMap = {
    coding_problems: Code2,
    leetcode_problems: Zap,
    open_source: GitBranch,
    competitions: Trophy,
    certificates: BookOpen,
    cp_rating: TrendingUp,
    projects: Briefcase,
    aptitude: Target,
    skillrank: BookOpen,
  }

  const getColorByPercentage = (percentage) => {
    if (percentage >= 80) return { bar: 'bg-green-500', text: 'text-green-400' }
    if (percentage >= 60) return { bar: 'bg-blue-500', text: 'text-blue-400' }
    if (percentage >= 40) return { bar: 'bg-yellow-500', text: 'text-yellow-400' }
    return { bar: 'bg-red-500', text: 'text-red-400' }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      <h2 className="text-2xl font-bold text-slate-100 mb-6">Performance Breakdown</h2>
      
      <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(categoryBreakdown).map(([key, category], idx) => {
          const Icon = iconMap[key]
          const { bar, text } = getColorByPercentage(category.percentage)
          
          return (
            <motion.div
              key={key}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -2 }}
              className="group glass hover-lift overflow-hidden"
            >
              {/* Card background animation */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 to-slate-800/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative p-6 space-y-4">
                {/* Header with icon and name */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Icon size={20} className="text-brand-blue group-hover:text-brand-purple transition-all" />
                      <h3 className="font-semibold text-slate-200 group-hover:text-white transition-all">{category.name}</h3>
                    </div>
                  </div>
                  <div className={`text-lg font-bold ${text}`}>
                    {category.percentage.toFixed(0)}%
                  </div>
                </div>

                {/* Score display */}
                <div className="text-sm text-slate-400 flex justify-between">
                  <span>Score</span>
                  <span className="text-slate-300 font-medium">{category.score} / {category.max}</span>
                </div>

                {/* Animated progress bar */}
                <div className="space-y-2">
                  <div className="h-2 bg-slate-900/50 rounded-full overflow-hidden border border-slate-700/30">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${category.percentage}%` }}
                      transition={{ delay: idx * 0.05 + 0.3, duration: 1, ease: 'easeOut' }}
                      className={`h-full rounded-full ${bar} shadow-lg`}
                    ></motion.div>
                  </div>
                </div>

                {/* Weight info (hover) */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  className="text-xs text-slate-500 pt-2 border-t border-slate-700/30"
                >
                  Weight: {(category.weight * 100).toFixed(0)}%
                </motion.div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Heatmap Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-8 grid grid-cols-4 gap-2 p-4 glass rounded-lg"
      >
        <div className="text-center text-xs">
          <div className="h-3 rounded bg-green-500 mb-2"></div>
          <div className="text-slate-400">80%+</div>
        </div>
        <div className="text-center text-xs">
          <div className="h-3 rounded bg-blue-500 mb-2"></div>
          <div className="text-slate-400">60-80%</div>
        </div>
        <div className="text-center text-xs">
          <div className="h-3 rounded bg-yellow-500 mb-2"></div>
          <div className="text-slate-400">40-60%</div>
        </div>
        <div className="text-center text-xs">
          <div className="h-3 rounded bg-red-500 mb-2"></div>
          <div className="text-slate-400">&lt;40%</div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default MetricsGrid
