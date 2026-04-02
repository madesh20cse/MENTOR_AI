// Frontend-only placement scoring utility based on college criteria
// Does NOT change backend behavior; used for additional dashboard insights.

export const MAX_COLLEGE_SCORE = 300

// Internal maximum raw points before scaling to 300
const RAW_MAX_SCORE = 195

const clampNumber = (value) => {
  const num = Number(value)
  if (Number.isNaN(num)) return 0
  return num < 0 ? 0 : num
}

const scoreCodingProblems = (codingProblems) => {
  const value = clampNumber(codingProblems)
  if (value >= 600) return 30
  if (value >= 350) return 20
  if (value >= 250) return 10
  return 0
}

const scoreOpenSource = (level) => {
  const normalized = (level || '').toLowerCase()
  if (normalized === 'advanced') return 20
  if (normalized === 'intermediate') return 10
  if (normalized === 'beginner') return 5
  return 0
}

const scoreCompetitions = (level) => {
  const normalized = (level || '').toLowerCase()
  // Existing UI also has "Expert" – treat as strongest bucket
  if (normalized === 'advanced' || normalized === 'expert') return 30
  if (normalized === 'intermediate') return 20
  if (normalized === 'beginner') return 10
  return 0
}

const scoreCertificates = (certificates) => {
  const normalized = (certificates || '').toLowerCase()
  // Map various certificate descriptors into basic/intermediate/advanced bands
  if (normalized === 'multiple' || normalized === 'advanced') return 20 // advanced
  if (normalized === 'international' || normalized === 'intermediate') return 10 // intermediate
  if (normalized === 'nptel' || normalized === 'basic') return 5 // basic
  return 0 // none or unknown
}

// Map existing star-based CP rating into beginner/intermediate/advanced buckets
const scoreCpRating = (cpRating) => {
  const value = (cpRating || '').toLowerCase()

  const beginner = ['1-star', '2-star']
  const intermediate = ['3-star', '4-star']
  const advanced = ['5-star', '6-star']

  if (advanced.includes(value)) return 30
  if (intermediate.includes(value)) return 20
  if (beginner.includes(value)) return 10
  return 0
}

const scoreProjects = (projectsLevel) => {
  const normalized = (projectsLevel || '').toLowerCase()
  if (normalized === 'advanced') return 30
  if (normalized === 'intermediate') return 20
  if (normalized === 'beginner') return 10
  return 0
}

const scoreAptitude = (aptitude) => {
  const value = clampNumber(aptitude)
  if (value > 85) return 20
  if (value >= 70) return 10
  return value > 0 ? 5 : 0
}

const scoreSkillRank = (skillRank) => {
  const value = clampNumber(skillRank)
  if (value > 80) return 15
  if (value >= 70) return 10
  return value > 0 ? 5 : 0
}

export const calculatePlacementScores = (formData) => {
  if (!formData) {
    return {
      totalScore: 0,
      percentage: 0,
      scaledScore: 0,
      categoryScores: {},
      placementCategory: 'Below 5 LPA',
    }
  }

  const categoryScores = {
    coding_problems: scoreCodingProblems(formData.coding_problems),
    open_source: scoreOpenSource(formData.open_source),
    competitions: scoreCompetitions(formData.competitions),
    certificates: scoreCertificates(formData.certificates),
    cp_rating: scoreCpRating(formData.cp_rating),
    projects: scoreProjects(formData.projects),
    aptitude: scoreAptitude(formData.aptitude),
    skillrank: scoreSkillRank(formData.skillrank),
  }

  const totalScore = Object.values(categoryScores).reduce((sum, val) => sum + val, 0)

  // Scale to 0-300 as per requirements
  const scaledScore = Math.round((totalScore / RAW_MAX_SCORE) * MAX_COLLEGE_SCORE)
  const percentage = (scaledScore / MAX_COLLEGE_SCORE) * 100

  let placementCategory = 'Below 5 LPA'
  let placementColor = 'red'
  if (scaledScore >= 260) {
    placementCategory = 'Above 10 LPA'
    placementColor = 'green'
  } else if (scaledScore >= 130) {
    placementCategory = '5–10 LPA'
    placementColor = 'yellow'
  }

  // Determine strongest and weakest skills
  const entries = Object.entries(categoryScores)
  const [weakestKey] = entries.reduce(
    (acc, curr) => (curr[1] < acc[1] ? curr : acc),
    entries[0] || ['coding_problems', 0],
  )
  const [strongestKey] = entries.reduce(
    (acc, curr) => (curr[1] > acc[1] ? curr : acc),
    entries[0] || ['coding_problems', 0],
  )

  return {
    totalScore,
    scaledScore,
    percentage,
    placementCategory,
    placementColor,
    categoryScores,
    strongestKey,
    weakestKey,
  }
}

export const buildPlacementSuggestions = (categoryScores) => {
  if (!categoryScores) return []
  const suggestions = []

  const low = (key, threshold) => (categoryScores[key] || 0) <= threshold

  if (low('coding_problems', 10)) {
    suggestions.push('Solve more coding problems')
  }

  if (low('cp_rating', 10)) {
    suggestions.push('Practice competitive programming')
  }

  if (low('open_source', 10)) {
    suggestions.push('Contribute to GitHub projects')
  }

  if (low('aptitude', 10)) {
    suggestions.push('Improve aptitude skills')
  }

  return suggestions
}
