import React, { createContext, useState, useContext, useEffect } from 'react'
import { calculatePlacementScores, buildPlacementSuggestions } from '../utils/placementScoring'

const PredictionContext = createContext()

export const PredictionProvider = ({ children }) => {
  const [predictionResult, setPredictionResult] = useState(null)
  const [formData, setFormData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Load any saved prediction from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const storedResult = window.localStorage.getItem('placementPredictionResult')
      const storedForm = window.localStorage.getItem('placementFormData')

      if (storedResult) {
        setPredictionResult(JSON.parse(storedResult))
      }

      if (storedForm) {
        setFormData(JSON.parse(storedForm))
      }
    } catch (e) {
      // Fail silently if localStorage is unavailable or corrupted
      console.warn('Failed to restore placement data from localStorage', e)
    }
  }, [])

  const savePrediction = (result, form) => {
    // Frontend-only scoring based on college criteria
    const placementScores = calculatePlacementScores(form)
    const frontendSuggestions = buildPlacementSuggestions(placementScores.categoryScores)

    const enrichedResult = {
      ...result,
      placementScores,
      frontendSuggestions,
    }

    setPredictionResult(enrichedResult)
    setFormData(form)
    setError(null)

    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('placementPredictionResult', JSON.stringify(enrichedResult))
        window.localStorage.setItem('placementFormData', JSON.stringify(form))
      } catch (e) {
        console.warn('Failed to persist placement data to localStorage', e)
      }
    }
  }

  const saveFileEvaluation = (evaluationResult, parsedForm) => {
    // For file-based flow we can reuse the same enrichment logic
    savePrediction(evaluationResult, parsedForm)
  }

  const clearPrediction = () => {
    setPredictionResult(null)
    setFormData(null)
    setError(null)
  }

  const setLoadingState = (loading) => {
    setIsLoading(loading)
  }

  const setErrorState = (err) => {
    setError(err)
  }

  return (
    <PredictionContext.Provider
      value={{
        predictionResult,
        formData,
        isLoading,
        error,
        savePrediction,
        saveFileEvaluation,
        clearPrediction,
        setLoadingState,
        setErrorState,
      }}
    >
      {children}
    </PredictionContext.Provider>
  )
}

export const usePrediction = () => {
  const context = useContext(PredictionContext)
  if (!context) {
    throw new Error('usePrediction must be used within PredictionProvider')
  }
  return context
}
