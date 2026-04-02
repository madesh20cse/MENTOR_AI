import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { PredictionProvider } from '../context/PredictionContext'
import InputPage from './InputPage'

const renderWithProviders = () => {
  return render(
    <PredictionProvider>
      <MemoryRouter>
        <InputPage />
      </MemoryRouter>
    </PredictionProvider>,
  )
}

describe('InputPage', () => {
  it('renders all key input fields', () => {
    renderWithProviders()

    expect(screen.getByLabelText(/Coding Problems Solved/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/LeetCode Problems/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Aptitude Score/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/SkillRank Score/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Open Source Contribution/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Competition Level/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/CP Rating/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Projects Level/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Certificates/i)).toBeInTheDocument()
  })
})
