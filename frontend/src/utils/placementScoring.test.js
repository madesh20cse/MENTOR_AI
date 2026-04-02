import { describe, it, expect } from 'vitest'
import { calculatePlacementScores, MAX_COLLEGE_SCORE } from './placementScoring'

describe('calculatePlacementScores', () => {
  it('returns zeros when formData is missing', () => {
    const result = calculatePlacementScores(null)
    expect(result.scaledScore).toBe(0)
    expect(result.percentage).toBe(0)
    expect(result.placementCategory).toBe('Below 5 LPA')
  })

  it('calculates higher score for stronger inputs', () => {
    const weak = calculatePlacementScores({
      coding_problems: 100,
      open_source: 'Beginner',
      competitions: 'Beginner',
      certificates: 'none',
      cp_rating: '1-star',
      projects: 'Beginner',
      aptitude: 50,
      skillrank: 60,
    })

    const strong = calculatePlacementScores({
      coding_problems: 700,
      open_source: 'Advanced',
      competitions: 'Expert',
      certificates: 'multiple',
      cp_rating: '6-star',
      projects: 'Advanced',
      aptitude: 95,
      skillrank: 90,
    })

    expect(weak.scaledScore).toBeLessThan(strong.scaledScore)
    expect(strong.scaledScore).toBeLessThanOrEqual(MAX_COLLEGE_SCORE)
  })

  it('maps scaled score into placement categories', () => {
    const low = calculatePlacementScores({
      coding_problems: 0,
      open_source: 'Beginner',
      competitions: 'Beginner',
      certificates: 'none',
      cp_rating: '1-star',
      projects: 'Beginner',
      aptitude: 10,
      skillrank: 10,
    })
    expect(low.placementCategory).toBe('Below 5 LPA')

    const mid = calculatePlacementScores({
      coding_problems: 400,
      open_source: 'Intermediate',
      competitions: 'Intermediate',
      certificates: 'nptel',
      cp_rating: '3-star',
      projects: 'Intermediate',
      aptitude: 80,
      skillrank: 75,
    })
    expect(mid.placementCategory).toBe('5–10 LPA')

    const high = calculatePlacementScores({
      coding_problems: 700,
      open_source: 'Advanced',
      competitions: 'Expert',
      certificates: 'multiple',
      cp_rating: '6-star',
      projects: 'Advanced',
      aptitude: 95,
      skillrank: 90,
    })
    expect(high.placementCategory).toBe('Above 10 LPA')
  })
})
