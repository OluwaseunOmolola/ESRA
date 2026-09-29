import esraData from './data/Esra Questions.json'
import { SECTION_ONE, type AnswerValue, type Answers, type Survey } from './data/types'
import { buildSubmission } from './data/response'
import { SUBMIT_URL, submitReport, type SubmitResult } from './api'
import { useGeolocation } from './hooks/useGeolocation'
import Question from './components/Question'
import logo from './assets/kdi-logo-transparent.png'
import { useMemo, useState } from 'react'
import './App.css'

const survey = esraData as Survey

type SubmitState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success'; result: Extract<SubmitResult, { ok: true }> }
  | { status: 'error'; result: Extract<SubmitResult, { ok: false }> }

function App() {
  const sectionKeys = Object.keys(survey.sections)
  const [sectionIndex, setSectionIndex] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [isDone, setIsDone] = useState(false)
  const [submitState, setSubmitState] = useState<SubmitState>({ status: 'idle' })

  const sectionKey = sectionKeys[sectionIndex]
  const section = survey.sections[sectionKey]
  const sectionAnswers = answers[sectionKey] ?? {}
  const progressPct = Math.round((sectionIndex / sectionKeys.length) * 100)
  const { location, status: locationStatus } = useGeolocation(sectionKey === SECTION_ONE && !isDone)
  const submission = useMemo(
    () => buildSubmission(survey, answers, location),
    [answers, location]
  )

  function handleChange(questionKey: string, value: AnswerValue) {
    setAnswers((prev) => ({
      ...prev,
      [sectionKey]: { ...prev[sectionKey], [questionKey]: value },
    }))
  }

  async function handleSubmit() {
    setIsDone(true)
    setSubmitState({ status: 'submitting' })

    const result = await submitReport(submission)

    if (result.ok) {
      setSubmitState({ status: 'success', result })
    } else {
      setSubmitState({ status: 'error', result })
    }
  }

  return (
    <div className="shell">
      <div className="brand">
        <img src={logo} alt="KDI" className="brand-logo" />
        <span className="brand-title">NEVER Reporting</span>
      </div>
      <h1 className="center">{survey.title}</h1>

      {!isDone && (
        <>
          <div className="progress-wrap">
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <p className="progress-label">Section {sectionIndex + 1} of {sectionKeys.length} — {progressPct}%</p>
          </div>

          <div className="jump">
            {sectionKeys.map((key, i) => (
              <button
                key={key}
                className={i === sectionIndex ? 'active' : i < sectionIndex ? 'done' : ''}
                onClick={() => setSectionIndex(i)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </>
      )}

      {isDone ? (
        <div className="card">
          <h2>Assessment complete</h2>
          <p>Thank you — your responses have been captured.</p>

          {submitState.status === 'submitting' && (
            <p className="status">Submitting your report…</p>
          )}

          {submitState.status === 'success' && (
            <div className="status success">
              <strong>{submitState.result.message}</strong>
              {submitState.result.reportId && (
                <p>Reference: {submitState.result.reportId}</p>
              )}
            </div>
          )}

          {submitState.status === 'error' && (
            <div className="status error">
              <strong>{submitState.result.message}</strong>
              {submitState.result.errors.length > 0 && (
                <ul>
                  {submitState.result.errors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              )}
              <button className="ghost" onClick={handleSubmit}>
                Try again
              </button>
            </div>
          )}

          <pre>{JSON.stringify(submission, null, 2)}</pre>
          <p className="hint">Posted to {SUBMIT_URL}</p>
          {(locationStatus === 'denied' || locationStatus === 'unavailable') && (
            <p className="hint">
              {locationStatus === 'denied'
                ? 'Location permission was declined, so no coordinates were recorded.'
                : 'Location is unavailable in this browser, so no coordinates were recorded.'}
            </p>
          )}
        </div>
      ) : (
        <div className="card">
          <h2>{section.title}</h2>

          {Object.entries(section.questions).map(([qKey, q], i) => (
            <Question
              key={qKey}
              question={q}
              name={`${sectionKey}_${qKey}`}
              num={i + 1}
              value={sectionAnswers[qKey]}
              onChange={(v) => handleChange(qKey, v)}
            />
          ))}

          <div className="nav-row">
            <button
              className="ghost"
              disabled={sectionIndex === 0}
              onClick={() => setSectionIndex((i) => i - 1)}
            >
              Back
            </button>
            <button
              onClick={() => {
                if (sectionIndex === sectionKeys.length - 1) {
                  handleSubmit()
                } else {
                  setSectionIndex((i) => i + 1)
                }
              }}
            >
              {sectionIndex === sectionKeys.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App