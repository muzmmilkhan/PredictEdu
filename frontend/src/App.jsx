import { useState } from 'react'
import './App.css'

const initialForm = {
  hours_studied: 5,
  previous_scores: 70,
  extracurricular_activities: 'Yes',
  sleep_hours: 7,
  sample_question_papers_practiced: 5,
}

const apiUrl = `${import.meta.env.VITE_API_URL ?? '/api'}/predict`

function App() {
  const [form, setForm] = useState(initialForm)
  const [prediction, setPrediction] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const updateField = (event) => {
    const { name, value, type } = event.target
    setForm((current) => ({
      ...current,
      [name]: type === 'number' ? Number(value) : value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setPrediction(null)
    setIsLoading(true)

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => null)
        const message =
          typeof body?.detail === 'string'
            ? body.detail
            : 'The prediction service could not process this request.'
        throw new Error(message)
      }

      const data = await response.json()
      setPrediction(Number(data.performance_index))
    } catch (requestError) {
      setError(
        requestError instanceof TypeError
          ? 'Could not reach the backend. Make sure it is running on port 8000.'
          : requestError.message,
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="page-shell">
      <section className="intro">
        <span className="eyebrow">PredictEdu</span>
        <h1>Student performance predictor</h1>
        <p>
          Enter a few study details to estimate a student's performance index.
        </p>
      </section>

      <section className="card" aria-labelledby="form-title">
        <form onSubmit={handleSubmit}>
          <div className="card-heading">
            <div>
              <span className="step">Prediction form</span>
              <h2 id="form-title">Student details</h2>
            </div>
            <span className="badge">ML powered</span>
          </div>

          <div className="form-grid">
            <label>
              Hours studied
              <input
                name="hours_studied"
                type="number"
                min="1"
                max="9"
                value={form.hours_studied}
                onChange={updateField}
                required
              />
            </label>

            <label>
              Previous score
              <input
                name="previous_scores"
                type="number"
                min="0"
                max="100"
                value={form.previous_scores}
                onChange={updateField}
                required
              />
            </label>

            <label>
              Sleep hours
              <input
                name="sleep_hours"
                type="number"
                min="1"
                max="12"
                value={form.sleep_hours}
                onChange={updateField}
                required
              />
            </label>

            <label>
              Practice papers
              <input
                name="sample_question_papers_practiced"
                type="number"
                min="0"
                max="10"
                value={form.sample_question_papers_practiced}
                onChange={updateField}
                required
              />
            </label>

            <label className="full-width">
              Extracurricular activities
              <select
                name="extracurricular_activities"
                value={form.extracurricular_activities}
                onChange={updateField}
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </label>
          </div>

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Calculating...' : 'Predict performance'}
          </button>
        </form>

        <div className="result-panel" aria-live="polite">
          {prediction !== null ? (
            <>
              <span>Estimated performance index</span>
              <strong>{prediction.toFixed(1)}</strong>
              <div className="score-track" aria-hidden="true">
                <div
                  className="score-fill"
                  style={{ width: `${Math.min(Math.max(prediction, 0), 100)}%` }}
                />
              </div>
              <p>This result is an estimate based on the trained model.</p>
            </>
          ) : (
            <>
              <span>Your result will appear here</span>
              <div className="placeholder-score">--</div>
              <p>Complete the form and submit it to get a prediction.</p>
            </>
          )}
          {error && <p className="error-message">{error}</p>}
        </div>
      </section>
    </main>
  )
}

export default App
