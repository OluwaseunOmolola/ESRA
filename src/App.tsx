import esraData from './data/Esra Questions.json'
import {
  MIN_ANSWER_RATIO,
  SECTION_ONE,
  type AnswerValue,
  type Answers,
  type Survey,
} from './data/types'
import { buildSubmission } from './data/response'
import { buildPreview } from './data/preview'
import { submitReport, type SubmitResult } from './api'
import { clearSubmitted, hasSubmitted, markSubmitted } from './cookies'
import { useGeolocation } from './hooks/useGeolocation'
import Question from './components/Question'
import Turnstile from './components/Turnstile'
import logo from './assets/kdi-logo-transparent.png'
import { useCallback, useMemo, useState } from 'react'
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
  const [alreadySubmitted, setAlreadySubmitted] = useState(hasSubmitted)
  const [submitState, setSubmitState] = useState<SubmitState>({ status: 'idle' })
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [turnstileFailed, setTurnstileFailed] = useState(false)

  const showForm = !alreadySubmitted && !isDone
  const sectionKey = sectionKeys[sectionIndex]
  const section = survey.sections[sectionKey]
  const sectionAnswers = answers[sectionKey] ?? {}
  const isLastSection = sectionIndex === sectionKeys.length - 1
  const progressPct = Math.round((sectionIndex / sectionKeys.length) * 100)
  const { location, status: locationStatus } = useGeolocation(showForm && sectionKey === SECTION_ONE)
  const submission = useMemo(
    () => buildSubmission(survey, answers, location, turnstileToken),
    [answers, location, turnstileToken]
  )
  const preview = useMemo(() => buildPreview(survey, answers), [answers])

  const { answeredCount, totalCount, requiredCount } = useMemo(() => {
    let answered = 0
    let total = 0
    for (const s of preview) {
      total += s.questions.length
      answered += s.questions.filter((q) => q.answered).length
    }
    return { answeredCount: answered, totalCount: total, requiredCount: Math.ceil(total * MIN_ANSWER_RATIO) }
  }, [preview])
  const answerPct = totalCount === 0 ? 0 : Math.round((answeredCount / totalCount) * 100)

  const turnstileReady =
    !import.meta.env.VITE_TURNSTILE_SITE_KEY || turnstileFailed || Boolean(turnstileToken)
  const canSubmit = answeredCount >= requiredCount && turnstileReady

  const handleTurnstileToken = useCallback((token: string | null) => {
    setTurnstileFailed(false)
    setTurnstileToken(token)
  }, [])

  const handleTurnstileUnavailable = useCallback(() => {
    setTurnstileFailed(true)
    setTurnstileToken(null)
  }, [])

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
      markSubmitted()
      setAlreadySubmitted(true)
      setSubmitState({ status: 'success', result })
    } else {
      setSubmitState({ status: 'error', result })
    }
  }

  function handleStartOver() {
    clearSubmitted()
    window.location.reload()
  }

  return (
    <div className="shell">
      <div className="brand">
        <img src={logo} alt="KDI" className="brand-logo" />
        <span className="brand-title">NEVER Reporting</span>
      </div>
      <h1 className="center">{survey.title}</h1>

      {showForm && (
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

          <div className="preview">
            <h3>Your responses</h3>

            <dl className="preview-meta">
              <dt>State</dt>
              <dd>{submission.state ?? 'Not answered'}</dd>
              <dt>LGA</dt>
              <dd>{submission.lga ?? 'Not answered'}</dd>
              <dt>Ward</dt>
              <dd>{submission.ward ?? 'Not answered'}</dd>
              <dt>Location</dt>
              <dd>
                {submission.location.length > 0
                  ? submission.location.join(', ')
                  : 'Not captured'}
              </dd>
              <dt>Election</dt>
              <dd>
                {submission.election_type} {submission.election_year}
              </dd>
            </dl>

            {preview.map((section) => (
              <div key={section.number} className="preview-section">
                <h3>
                  <span className="q-num">Section {section.number}.</span> {section.title}
                </h3>
                <dl>
                  {section.questions.map((question) => (
                    <div key={question.number} className="preview-q">
                      <dt>
                        <span className="q-num">{question.number}.</span> {question.question}
                      </dt>
                      <dd className={question.answered ? '' : 'muted'}>
                        {!question.answered && 'Not answered'}
                        {question.answered && !question.multiple && question.answers[0]}
                        {question.answered && question.multiple && (
                          <ul>
                            {question.answers.map((answer) => (
                              <li key={answer}>{answer}</li>
                            ))}
                          </ul>
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>

          {(locationStatus === 'denied' || locationStatus === 'unavailable') && (
            <p className="hint">
              {locationStatus === 'denied'
                ? 'Location permission was declined, so no coordinates were recorded.'
                : 'Location is unavailable in this browser, so no coordinates were recorded.'}
            </p>
          )}
        </div>
      ) : alreadySubmitted ? (
        <div className="card">
          <h2>Already submitted</h2>
          <p>
            You have already completed and submitted this assessment on this device. Each
            person can only submit once.
          </p>
          {import.meta.env.DEV && (
            <button className="ghost" onClick={handleStartOver}>
              Reset and start over (dev only)
            </button>
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

          {isLastSection && (
            <div className="turnstile-block">
              <h3>Before you submit</h3>

              <div className="meter">
                <div className="meter-track">
                  <div
                    className={answeredCount >= requiredCount ? 'meter-fill met' : 'meter-fill'}
                    style={{ width: `${answerPct}%` }}
                  />
                </div>
                <p className="hint">
                  {answeredCount} of {totalCount} questions answered ({answerPct}%). At least{' '}
                  {requiredCount} ({Math.round(MIN_ANSWER_RATIO * 100)}%) must be answered before
                  you can submit.
                </p>
              </div>

              <p className="hint">
                Complete this check to confirm you are a person before submitting.
              </p>
              <Turnstile
                onToken={handleTurnstileToken}
                onUnavailable={handleTurnstileUnavailable}
              />
            </div>
          )}

          <div className="nav-row">
            <button
              className="ghost"
              disabled={sectionIndex === 0}
              onClick={() => setSectionIndex((i) => i - 1)}
            >
              Back
            </button>
            <button
              disabled={isLastSection && !canSubmit}
              onClick={() => {
                if (isLastSection) {
                  handleSubmit()
                } else {
                  setSectionIndex((i) => i + 1)
                }
              }}
            >
              {isLastSection ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App