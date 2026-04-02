import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Code2,
  Zap,
  GitBranch,
  Trophy,
  TrendingUp,
  Briefcase,
  BookOpen,
  Target,
  Loader,
  LogOut,
} from 'lucide-react'
import { usePrediction } from '../context/PredictionContext'
import { predictionAPI } from '../utils/api'

const InputPage = ({ onLogout }) => {
  const navigate = useNavigate()
  const { savePrediction, setLoadingState, setErrorState } = usePrediction()

  const [formData, setFormData] = useState({
    coding_problems: '',
    leetcode_problems: '',
    open_source: 'Beginner',
    competitions: 'Beginner',
    cp_rating: '1-star',
    projects: 'Beginner',
    aptitude: '',
    skillrank: '',
    certificates: 'none',
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const fields = [
    {
      key: 'coding_problems',
      label: 'Coding Problems Solved',
      type: 'number',
      icon: Code2,
      placeholder: '0 - 2000',
      min: 0,
      max: 2000,
    },
    {
      key: 'leetcode_problems',
      label: 'LeetCode Problems',
      type: 'number',
      icon: Zap,
      placeholder: '0 - 3000',
      min: 0,
      max: 3000,
    },
    {
      key: 'aptitude',
      label: 'Aptitude Score',
      type: 'number',
      icon: Target,
      placeholder: '0 - 100',
      min: 0,
      max: 100,
    },
    {
      key: 'skillrank',
      label: 'SkillRank Score',
      type: 'number',
      icon: BookOpen,
      placeholder: '0 - 100',
      min: 0,
      max: 100,
    },
  ]

  const dropdownFields = [
    {
      key: 'open_source',
      label: 'Open Source Contribution',
      icon: GitBranch,
      options: ['Beginner', 'Intermediate', 'Advanced'],
    },
    {
      key: 'competitions',
      label: 'Competition Level',
      icon: Trophy,
      options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    },
    {
      key: 'cp_rating',
      label: 'CP Rating',
      icon: TrendingUp,
      options: ['1-star', '2-star', '3-star', '4-star', '5-star', '6-star'],
    },
    {
      key: 'projects',
      label: 'Projects Level',
      icon: Briefcase,
      options: ['Beginner', 'Intermediate', 'Advanced'],
    },
    {
      key: 'certificates',
      label: 'Certificates',
      icon: BookOpen,
      options: ['none', 'NPTEL', 'international', 'multiple'],
    },
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Validate number fields
    const numericFields = ['coding_problems', 'leetcode_problems', 'aptitude', 'skillrank']
    numericFields.forEach(field => {
      const value = formData[field]
      if (value === '' || value === undefined) {
        newErrors[field] = 'This field is required'
      } else {
        const numValue = parseFloat(value)
        if (isNaN(numValue)) {
          newErrors[field] = 'Must be a number'
        }
      }
    })

    // All dropdowns are required; ensure they have a value
    const requiredDropdowns = ['open_source', 'competitions', 'cp_rating', 'projects', 'certificates']
    requiredDropdowns.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = 'This field is required'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      setSubmitError('Please fix the errors above')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)
    setLoadingState(true)

    try {
      // Convert string values to numbers
      const dataToSend = {
        coding_problems: parseFloat(formData.coding_problems),
        leetcode_problems: parseFloat(formData.leetcode_problems),
        open_source: formData.open_source,
        competitions: formData.competitions,
        cp_rating: formData.cp_rating,
        projects: formData.projects,
        aptitude: parseFloat(formData.aptitude),
        skillrank: parseFloat(formData.skillrank),
        // Extra frontend-only field – ignored by backend but used for college scoring
        certificates: formData.certificates,
      }

      const result = await predictionAPI.predict(dataToSend)

      if (result.success) {
        savePrediction(result, dataToSend)
        navigate('/dashboard')
      } else {
        setSubmitError(result.error || 'Failed to analyze. Please try again.')
        setErrorState(result.error)
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Server error. Please try again.'
      setSubmitError(errorMessage)
      setErrorState(errorMessage)
      console.error('Submission error:', error)
    } finally {
      setIsSubmitting(false)
      setLoadingState(false)
    }
  }

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
      transition: { duration: 0.5, ease: [0.23, 1, 0.320, 1] },
    },
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-8">
      {/* Animated background gradient */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-dark"></div>
        <div className="absolute top-0 -right-40 w-80 h-80 bg-brand-blue/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 -left-40 w-80 h-80 bg-brand-purple/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Logout button - top right */}
      {onLogout && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            onLogout()
            navigate('/')
          }}
          className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/50 hover:bg-red-500/30 text-red-300 hover:text-red-200 rounded-lg transition-all duration-200"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Logout</span>
        </motion.button>
      )}

      <motion.div
        className="w-full max-w-2xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-brand-blue via-brand-purple to-brand-blue bg-clip-text text-transparent">
            Placement Predictor
          </h1>
          <p className="text-lg text-slate-400">
            Analyze your skills and predict your placement eligibility
          </p>
          <motion.button
            type="button"
            onClick={() => navigate('/upload')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-600/60 text-sm text-slate-200 hover:bg-slate-800/60 transition-all"
          >
            <span>Switch to file-based evaluation</span>
          </motion.button>
        </motion.div>

        {/* Form Card */}
        <motion.form
          onSubmit={handleSubmit}
          className="glass-lg p-8 md:p-12 space-y-8"
          variants={itemVariants}
        >
          {/* Error Alert */}
          {submitError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm"
            >
              {submitError}
            </motion.div>
          )}

          {/* Number Fields Grid */}
          <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6" variants={itemVariants}>
            {fields.map((field, idx) => {
              const Icon = field.icon
              return (
                <motion.div
                  key={field.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group"
                >
                  <label
                    htmlFor={field.key}
                    className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2"
                  >
                    <Icon size={16} className="text-brand-blue group-hover:text-brand-purple transition-all" />
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    name={field.key}
                    id={field.key}
                    placeholder={field.placeholder}
                    min={field.min}
                    max={field.max}
                    value={formData[field.key]}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg bg-slate-900/50 border transition-all duration-300 placeholder-slate-500 text-white focus:scale-105 ${
                      errors[field.key]
                        ? 'border-red-500/50 bg-red-900/20'
                        : 'border-slate-700/50 hover:border-slate-600/50 focus:border-brand-blue'
                    }`}
                  />
                  {errors[field.key] && (
                    <p className="text-red-400 text-xs mt-1">{errors[field.key]}</p>
                  )}
                </motion.div>
              )
            })}
          </motion.div>

          {/* Dropdown Fields Grid */}
          <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6" variants={itemVariants}>
            {dropdownFields.map((field, idx) => {
              const Icon = field.icon
              return (
                <motion.div
                  key={field.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (idx + 4) * 0.05 }}
                  className="group"
                >
                  <label
                    htmlFor={field.key}
                    className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2"
                  >
                    <Icon size={16} className="text-brand-blue group-hover:text-brand-purple transition-all" />
                    {field.label}
                  </label>
                  <select
                    name={field.key}
                    id={field.key}
                    value={formData[field.key]}
                    onChange={handleInputChange}
                    aria-required="true"
                    aria-invalid={Boolean(errors[field.key])}
                    className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700/50 hover:border-slate-600/50 focus:border-brand-blue text-white focus:scale-105 transition-all duration-300 cursor-pointer appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748b' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px center',
                      paddingRight: '36px',
                    }}
                  >
                    {field.options.map(option => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  {errors[field.key] && (
                    <p className="text-red-400 text-xs mt-1">{errors[field.key]}</p>
                  )}
                </motion.div>
              )
            })}
          </motion.div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isSubmitting}
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 px-6 rounded-lg bg-gradient-to-r from-brand-blue via-brand-purple to-brand-blue font-bold text-white text-lg shadow-lg hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
          >
            {isSubmitting ? (
              <>
                <Loader size={20} className="animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <span>Analyze Performance</span>
                <motion.span
                  className="inline-block"
                  initial={{ x: 0 }}
                  whileHover={{ x: 5 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  →
                </motion.span>
              </>
            )}
          </motion.button>

          {/* Info Text */}
          <motion.p
            variants={itemVariants}
            className="text-center text-sm text-slate-500 px-4"
          >
            Your data is processed securely and saved for future reference.
          </motion.p>
        </motion.form>

        {/* Floating cards decoration */}
        <motion.div
          className="mt-12 grid grid-cols-3 gap-4 text-center text-xs text-slate-500"
          variants={itemVariants}
        >
          <div className="p-4 rounded-lg glass hover-lift">
            <div className="text-2xl mb-2">📊</div>
            <div>Real-time Analysis</div>
          </div>
          <div className="p-4 rounded-lg glass hover-lift">
            <div className="text-2xl mb-2">🔒</div>
            <div>Secure Data</div>
          </div>
          <div className="p-4 rounded-lg glass hover-lift">
            <div className="text-2xl mb-2">⚡</div>
            <div>Instant Results</div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default InputPage
