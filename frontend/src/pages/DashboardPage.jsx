import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, AlertCircle, LogOut } from 'lucide-react'
import { usePrediction } from '../context/PredictionContext'
import ScoreCard from '../components/ScoreCard'
import MetricsGrid from '../components/MetricsGrid'
import AnalyticsSection from '../components/AnalyticsSection'
import SuggestionsCard from '../components/SuggestionsCard'
import EligibilityCards from '../components/EligibilityCards'
import Confetti from '../components/Confetti'

const DashboardPage = ({ onLogout }) => {
  const navigate = useNavigate()
  const { predictionResult } = usePrediction()
  const [isConfetti, setIsConfetti] = useState(false)

  useEffect(() => {
    // Redirect to input if no prediction result
    if (!predictionResult) {
      navigate('/')
      return
    }

    // Trigger confetti for top tier
    if (predictionResult.eligibility?.color === 'green') {
      setIsConfetti(true)
    }
  }, [predictionResult, navigate])

  if (!predictionResult) {
    return null
  }

  const { total_score, max_possible_score, eligibility, category_breakdown, suggestions, placementScores, frontendSuggestions, student } = predictionResult

  const effectiveTotalScore = placementScores?.scaledScore ?? total_score
  const effectiveMaxScore = placementScores ? 300 : max_possible_score
  const effectiveEligibility = placementScores
    ? {
        ...eligibility,
        tier: placementScores.placementCategory,
        color: placementScores.placementColor,
      }
    : eligibility

  const combinedSuggestions = Array.from(
    new Set([...(suggestions || []), ...(frontendSuggestions || [])]),
  )

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.23, 1, 0.320, 1] },
    },
  }

  return (
    <div className="min-h-screen w-full pb-12">
      {/* Confetti animation for top tier */}
      {isConfetti && <Confetti />}

      {/* Animated background gradient */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-dark"></div>
        <div className="absolute top-0 -right-40 w-80 h-80 bg-brand-blue/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 -left-40 w-80 h-80 bg-brand-purple/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header with Back Button */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-brand-blue via-brand-purple to-brand-blue bg-clip-text text-transparent">
              Placement Eligibility Dashboard
            </h1>
            <p className="text-slate-400 mt-2">Your Performance Analysis & Package Prediction</p>
            {student && (
              <div className="mt-3 text-sm text-slate-300 flex flex-wrap gap-3">
                <span className="font-semibold">{student.name}</span>
                <span className="text-slate-500">|</span>
                <span>{student.department}</span>
                <span className="text-slate-500">|</span>
                <span>{student.year}</span>
              </div>
            )}
          </div>
          <motion.div className="flex items-center gap-3">
            <motion.button
              onClick={() => navigate('/predictor')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg glass hover:bg-white/20 transition-all"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Back</span>
            </motion.button>
            {onLogout && (
              <motion.button
                onClick={() => {
                  onLogout()
                  navigate('/')
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/50 hover:bg-red-500/30 text-red-300 hover:text-red-200 transition-all"
              >
                <LogOut size={20} />
                <span className="hidden sm:inline">Logout</span>
              </motion.button>
            )}
          </motion.div>
        </motion.div>

        {/* Main Score Card - Center Focused */}
        <motion.div variants={itemVariants}>
          <ScoreCard
            totalScore={effectiveTotalScore}
            maxScore={effectiveMaxScore}
            eligibility={effectiveEligibility}
          />
        </motion.div>

        {/* Performance Metrics Grid */}
        <motion.div variants={itemVariants}>
          <MetricsGrid categoryBreakdown={category_breakdown} />
        </motion.div>

        {/* Analytics Section */}
        <motion.div variants={itemVariants}>
          <AnalyticsSection categoryBreakdown={category_breakdown} />
        </motion.div>

        {/* AI Suggestions Card */}
        <motion.div variants={itemVariants}>
          <SuggestionsCard suggestions={combinedSuggestions} />
        </motion.div>

        {/* Eligibility Status Cards */}
        <motion.div variants={itemVariants}>
          <EligibilityCards currentTier={effectiveEligibility.tier} />
        </motion.div>

        {/* Footer Info */}
        <motion.div
          variants={itemVariants}
          className="mt-12 p-6 glass rounded-xl text-center text-slate-400 text-sm"
        >
          <p>
            💡 Pro Tip: Use the suggestions above to improve your score and compete for higher placement packages.
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default DashboardPage
