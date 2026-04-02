import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FolderUp,
  FileText,
  User,
  School,
  Calendar,
  Loader,
  LogOut,
} from 'lucide-react'
import { usePrediction } from '../context/PredictionContext'
import { calculatePlacementScores, buildPlacementSuggestions } from '../utils/placementScoring'

const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result || '')
    reader.onerror = () => reject(reader.error || new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

const extractFirstNumber = (text) => {
  const match = text.match(/(-?\d+\.?\d*)/)
  return match ? Number(match[1]) : null
}

const detectLevel = (text, levels) => {
  const lower = text.toLowerCase()
  // Prefer highest level mentioned
  let found = null
  levels.forEach((level) => {
    if (lower.includes(level.toLowerCase())) {
      found = level
    }
  })
  return found
}

const FileUploadPage = ({ onLogout }) => {
  const navigate = useNavigate()
  const { saveFileEvaluation } = usePrediction()

  const [student, setStudent] = useState({
    name: '',
    department: '',
    year: '',
  })

  const [files, setFiles] = useState({
    coding: null,
    opensource: null,
    competitions: null,
    certificates: null,
    cprating: null,
    projects: null,
    aptitude: null,
    skillrank: null,
  })

  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleStudentChange = (e) => {
    const { name, value } = e.target
    setStudent((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleFileChange = (key, file) => {
    setFiles((prev) => ({ ...prev, [key]: file }))
    setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const validateInputs = () => {
    const newErrors = {}

    if (!student.name.trim()) newErrors.name = 'Name is required'
    if (!student.department.trim()) newErrors.department = 'Department is required'
    if (!student.year.trim()) newErrors.year = 'Year is required'

    Object.entries(files).forEach(([key, file]) => {
      if (!file) newErrors[key] = 'File is required'
      else if (!file.name.toLowerCase().endsWith('.txt')) {
        newErrors[key] = 'Only .txt files are supported'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const parseCodingFile = (text) => {
    // Try to find explicit problems solved, otherwise fallback to first number
    let problems = null
    const problemsMatch = text.match(/(problems?\s*solved|coding\s*problems)[^\d]*(\d+)/i)
    if (problemsMatch) {
      problems = Number(problemsMatch[2])
    } else {
      problems = extractFirstNumber(text)
    }

    const leetcodeMatch = text.match(/leetcode[^\d]*(\d+)/i)
    const leetcode = leetcodeMatch ? Number(leetcodeMatch[1]) : null

    return { coding_problems: problems ?? 0, leetcode_problems: leetcode ?? 0 }
  }

  const parseLevelFile = (text, field) => {
    const mapping = {
      opensource: ['Beginner', 'Intermediate', 'Advanced'],
      competitions: ['Beginner', 'Intermediate', 'Advanced'],
      certificates: ['Basic', 'Intermediate', 'Advanced'],
      cprating: ['Beginner', 'Intermediate', 'Advanced'],
      projects: ['Beginner', 'Intermediate', 'Advanced'],
    }

    const levels = mapping[field]
    const detected = levels ? detectLevel(text, levels) : null
    return detected || null
  }

  const parseScoreFile = (text) => {
    const value = extractFirstNumber(text)
    return value ?? null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')

    if (!validateInputs()) {
      setSubmitError('Please fix the errors before analyzing.')
      return
    }

    setIsProcessing(true)

    try {
      // Read all files as text
      const contents = await Promise.all(
        Object.entries(files).map(async ([key, file]) => [key, await readFileAsText(file)]),
      )
      const contentMap = Object.fromEntries(contents)

      const codingParsed = parseCodingFile(contentMap.coding)

      const openSourceLevel = parseLevelFile(contentMap.opensource, 'opensource')
      const competitionsLevel = parseLevelFile(contentMap.competitions, 'competitions')
      const certificatesLevel = parseLevelFile(contentMap.certificates, 'certificates')
      const cpLevel = parseLevelFile(contentMap.cprating, 'cprating')
      const projectsLevel = parseLevelFile(contentMap.projects, 'projects')

      const aptitudeScore = parseScoreFile(contentMap.aptitude)
      const skillrankScore = parseScoreFile(contentMap.skillrank)

      const parseErrors = {}
      if (!openSourceLevel) parseErrors.opensource = 'Could not detect level (Beginner/Intermediate/Advanced).'
      if (!competitionsLevel) parseErrors.competitions = 'Could not detect level (Beginner/Intermediate/Advanced).'
      if (!certificatesLevel) parseErrors.certificates = 'Could not detect level (Basic/Intermediate/Advanced).'
      if (!cpLevel) parseErrors.cprating = 'Could not detect level (Beginner/Intermediate/Advanced).' 
      if (!projectsLevel) parseErrors.projects = 'Could not detect level (Beginner/Intermediate/Advanced).'
      if (aptitudeScore == null) parseErrors.aptitude = 'Could not find a numeric aptitude score.'
      if (skillrankScore == null) parseErrors.skillrank = 'Could not find a numeric SkillRank score.'

      if (Object.keys(parseErrors).length > 0) {
        setErrors((prev) => ({ ...prev, ...parseErrors }))
        setSubmitError('Some files could not be parsed. Please check the highlighted fields.')
        setIsProcessing(false)
        return
      }

      // Normalize certificates into college scoring bands
      let certificatesBand = 'Basic'
      if (/advanced/i.test(certificatesLevel)) certificatesBand = 'Advanced'
      else if (/intermediate/i.test(certificatesLevel)) certificatesBand = 'Intermediate'

      const formData = {
        coding_problems: codingParsed.coding_problems,
        leetcode_problems: codingParsed.leetcode_problems,
        open_source: openSourceLevel,
        competitions: competitionsLevel,
        certificates: certificatesBand,
        cp_rating: cpLevel,
        projects: projectsLevel,
        aptitude: aptitudeScore,
        skillrank: skillrankScore,
        student_name: student.name,
        student_department: student.department,
        student_year: student.year,
        source: 'file-upload',
      }

      const placementScores = calculatePlacementScores(formData)
      const frontendSuggestions = buildPlacementSuggestions(placementScores.categoryScores)

      const categoryMax = {
        coding_problems: 30,
        open_source: 20,
        competitions: 30,
        certificates: 20,
        cp_rating: 30,
        projects: 30,
        aptitude: 20,
        skillrank: 15,
      }

      const categoryNames = {
        coding_problems: 'Coding Skills',
        open_source: 'Open Source',
        competitions: 'Competitions',
        certificates: 'Certificates',
        cp_rating: 'CP Rating',
        projects: 'Projects',
        aptitude: 'Aptitude',
        skillrank: 'SkillRank',
      }

      const category_breakdown = Object.entries(placementScores.categoryScores).reduce(
        (acc, [key, score]) => {
          const max = categoryMax[key] || 0
          const percentage = max > 0 ? (score / max) * 100 : 0
          acc[key] = {
            name: categoryNames[key] || key,
            score,
            max,
            percentage: Math.round(percentage * 10) / 10,
            weight: 1 / 8,
          }
          return acc
        },
        {},
      )

      const total_score = placementScores.scaledScore
      const max_possible_score = 300

      let eligibilityRange = { min_score: 0, max_score: 129 }
      if (total_score >= 260) {
        eligibilityRange = { min_score: 260, max_score: 300 }
      } else if (total_score >= 130) {
        eligibilityRange = { min_score: 130, max_score: 259 }
      }

      const evaluationResult = {
        success: true,
        total_score,
        eligibility: {
          tier: placementScores.placementCategory,
          color: placementScores.placementColor,
          ...eligibilityRange,
        },
        category_breakdown,
        suggestions: frontendSuggestions,
        max_possible_score,
        student: {
          name: student.name,
          department: student.department,
          year: student.year,
        },
      }

      saveFileEvaluation(evaluationResult, formData)
      navigate('/dashboard')
    } catch (err) {
      console.error('File processing error', err)
      setSubmitError('Failed to process files. Please try again with valid .txt files.')
    } finally {
      setIsProcessing(false)
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
      transition: { duration: 0.5 },
    },
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-8">
      {/* Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-dark"></div>
        <div className="absolute top-0 -right-40 w-80 h-80 bg-brand-blue/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-0 -left-40 w-80 h-80 bg-brand-purple/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '1s' }}
        ></div>
      </div>

      {/* Logout */}
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
        className="w-full max-w-3xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-brand-blue via-brand-purple to-brand-blue bg-clip-text text-transparent">
            File-Based Placement Evaluation
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
            Upload your performance files and let Mentor_AI automatically extract, score, and predict your
            placement eligibility.
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          className="glass-lg p-8 md:p-10 space-y-8"
          variants={itemVariants}
        >
          {submitError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm"
            >
              {submitError}
            </motion.div>
          )}

          {/* Student Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label
                htmlFor="name"
                className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2"
              >
                <User size={16} />
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={student.name}
                onChange={handleStudentChange}
                className={`w-full px-4 py-3 rounded-lg bg-slate-900/50 border transition-all duration-300 placeholder-slate-500 text-white focus:scale-105 ${
                  errors.name
                    ? 'border-red-500/50 bg-red-900/20'
                    : 'border-slate-700/50 hover:border-slate-600/50 focus:border-brand-blue'
                }`}
                placeholder="John Doe"
              />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label
                htmlFor="department"
                className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2"
              >
                <School size={16} />
                Department
              </label>
              <input
                id="department"
                name="department"
                type="text"
                value={student.department}
                onChange={handleStudentChange}
                className={`w-full px-4 py-3 rounded-lg bg-slate-900/50 border transition-all duration-300 placeholder-slate-500 text-white focus:scale-105 ${
                  errors.department
                    ? 'border-red-500/50 bg-red-900/20'
                    : 'border-slate-700/50 hover:border-slate-600/50 focus:border-brand-blue'
                }`}
                placeholder="CSE / ECE / IT"
              />
              {errors.department && <p className="text-red-400 text-xs mt-1">{errors.department}</p>}
            </div>
            <div>
              <label
                htmlFor="year"
                className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2"
              >
                <Calendar size={16} />
                Year
              </label>
              <input
                id="year"
                name="year"
                type="text"
                value={student.year}
                onChange={handleStudentChange}
                className={`w-full px-4 py-3 rounded-lg bg-slate-900/50 border transition-all duration-300 placeholder-slate-500 text-white focus:scale-105 ${
                  errors.year
                    ? 'border-red-500/50 bg-red-900/20'
                    : 'border-slate-700/50 hover:border-slate-600/50 focus:border-brand-blue'
                }`}
                placeholder="3rd Year / Final Year"
              />
              {errors.year && <p className="text-red-400 text-xs mt-1">{errors.year}</p>}
            </div>
          </div>

          {/* File Upload Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { key: 'coding', label: 'Coding (coding.txt)', helper: 'Problems solved, LeetCode count' },
              { key: 'opensource', label: 'Open Source (opensource.txt)', helper: 'Contribution details' },
              { key: 'competitions', label: 'Competitions (competitions.txt)', helper: 'Contests & achievements' },
              { key: 'certificates', label: 'Certificates (certificates.txt)', helper: 'Certifications summary' },
              { key: 'cprating', label: 'CP Rating (cprating.txt)', helper: 'Rating / platform details' },
              { key: 'projects', label: 'Projects (projects.txt)', helper: 'Projects & hackathons' },
              { key: 'aptitude', label: 'Aptitude (aptitude.txt)', helper: 'Aptitude test scores' },
              { key: 'skillrank', label: 'SkillRank (skillrank.txt)', helper: 'SkillRank profile & scores' },
            ].map(({ key, label, helper }) => (
              <div key={key} className="group">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                  <FileText size={16} className="text-brand-blue group-hover:text-brand-purple transition-all" />
                  {label}
                </label>
                <label
                  className={`flex items-center justify-between gap-3 w-full px-4 py-3 rounded-lg border cursor-pointer bg-slate-900/50 text-sm transition-all duration-300 ${
                    errors[key]
                      ? 'border-red-500/50 bg-red-900/20'
                      : 'border-slate-700/50 hover:border-slate-600/50 focus-within:border-brand-blue'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FolderUp size={18} className="text-slate-300 flex-shrink-0" />
                    <span className="truncate text-slate-200">
                      {files[key]?.name || 'Choose .txt file'}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 flex-shrink-0">Browse</span>
                  <input
                    type="file"
                    accept=".txt"
                    className="hidden"
                    onChange={(e) => handleFileChange(key, e.target.files?.[0] || null)}
                  />
                </label>
                <p className="text-xs text-slate-500 mt-1">{helper}</p>
                {errors[key] && <p className="text-red-400 text-xs mt-1">{errors[key]}</p>}
              </div>
            ))}
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={isProcessing}
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 px-6 rounded-lg bg-gradient-to-r from-brand-blue via-brand-purple to-brand-blue font-bold text-white text-lg shadow-lg hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
          >
            {isProcessing ? (
              <>
                <Loader size={20} className="animate-spin" />
                Processing files...
              </>
            ) : (
              <>
                <span>Analyze Files</span>
              </>
            )}
          </motion.button>
        </motion.form>
      </motion.div>
    </div>
  )
}

export default FileUploadPage
