import esraData from './data/Esra Questions.json'
import {
  MIN_ANSWER_RATIO,
  SECTION_ONE,
  STATE_QUESTION_KEY,
  isHiddenQuestion,
  type AnswerValue,
  type Answers,
  type Survey,
} from './data/types'
import { pruneInvalidLocation } from './data/locations'
import { buildSubmission } from './data/response'
import { buildPreview } from './data/preview'
import { submitReport, type SubmitResult } from './api'
import { clearSubmitted, hasSubmitted, markSubmitted } from './cookies'
import { clearAnswers, loadAnswers, saveAnswers } from './storage'
import { useGeolocation, type GeolocationStatus } from './hooks/useGeolocation'
import Question from './components/Question'
import Turnstile from './components/Turnstile'
import Introduction from './components/Introduction'
import logo from './assets/kdi-logo-transparent.png'
import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'

const survey = esraData as Survey

const LOCATION_MESSAGES: Record<GeolocationStatus, string> = {
  idle: 'Sharing where you are helps us understand how responses are spread across the country. It is optional and you can submit without it.',
  pending: 'Waiting for your browser to share your location…',
  granted: 'Location captured. Thank you.',
  denied:
    'Location access was declined. That is fine — you can submit without it, or change the permission in your browser and try again.',
  unavailable:
    'This browser cannot provide a location. You can still submit without it.',
}

type SubmitState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success'; result: Extract<SubmitResult, { ok: true }> }
  | { status: 'error'; result: Extract<SubmitResult, { ok: false }> }

function App() {
  const sectionKeys = Object.keys(survey.sections)
  const [restored] = useState(loadAnswers)
  const [sectionIndex, setSectionIndex] = useState(0)
  const [answers, setAnswers] = useState<Answers>(() => pruneInvalidLocation(restored ?? {}))
  const [isDone, setIsDone] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [alreadySubmitted, setAlreadySubmitted] = useState(hasSubmitted)
  const [submitState, setSubmitState] = useState<SubmitState>({ status: 'idle' })
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [turnstileFailed, setTurnstileFailed] = useState(false)

  const showForm = hasStarted && !alreadySubmitted && !isDone
  const sectionKey = sectionKeys[sectionIndex]
  const section = survey.sections[sectionKey]
  const sectionAnswers = answers[sectionKey] ?? {}
  const isLastSection = sectionIndex === sectionKeys.length - 1
  const progressPct = Math.round((sectionIndex / sectionKeys.length) * 100)
  const {
    location,
    status: locationStatus,
    supported: locationSupported,
    request: requestLocation,
    reset: resetLocation,
  } = useGeolocation()
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
  const hasLocation = location.length > 0
  const canSubmit = answeredCount >= requiredCount && turnstileReady

  const locationNotice = hasLocation ? null : (
    <div className="requirement optional">
      <strong>Location is optional.</strong>
      <p>{LOCATION_MESSAGES[locationStatus]}</p>
      {locationSupported && locationStatus !== 'denied' && locationStatus !== 'unavailable' && (
        <button className="ghost" onClick={requestLocation} disabled={locationStatus === 'pending'}>
          {locationStatus === 'pending' ? 'Locating…' : 'Share my location'}
        </button>
      )}
    </div>
  )

  const handleTurnstileToken = useCallback((token: string | null) => {
    setTurnstileFailed(false)
    setTurnstileToken(token)
  }, [])

  const handleTurnstileUnavailable = useCallback(() => {
    setTurnstileFailed(true)
    setTurnstileToken(null)
  }, [])

  function handleChange(questionKey: string, value: AnswerValue) {
    setAnswers((prev) =>
      pruneInvalidLocation({
        ...prev,
        [sectionKey]: { ...prev[sectionKey], [questionKey]: value },
      })
    )
  }

  function scrollToTop() {
    window.scrollTo(0, 0)
  }

  function goToSection(next: number | ((current: number) => number)) {
    setSectionIndex(next)
    scrollToTop()
  }

  useEffect(() => {
    if (!hasStarted || isDone || alreadySubmitted) return
    saveAnswers(answers)
  }, [answers, hasStarted, isDone, alreadySubmitted])

  function handleDiscardDraft() {
    clearAnswers()
    setAnswers({})
    goToSection(0)
    resetLocation()
  }

  async function handleSubmit() {
    setIsDone(true)
    scrollToTop()
    setSubmitState({ status: 'submitting' })

    const result = await submitReport(submission)

    if (result.ok) {
      markSubmitted()
      clearAnswers()
      setAlreadySubmitted(true)
      setSubmitState({ status: 'success', result })
    } else {
      setSubmitState({ status: 'error', result })
    }
  }

  function handleResetForRetest() {
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
            <p className="progress-saved">
              <span>
                Progress saved · {answeredCount} of {totalCount} answered
              </span>
              <button className="link" onClick={handleDiscardDraft}>
                Start over
              </button>
            </p>
          </div>

          <div className="jump">
            {sectionKeys.map((key, i) => (
              <button
                key={key}
                className={i === sectionIndex ? 'active' : i < sectionIndex ? 'done' : ''}
                onClick={() => goToSection(i)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </>
      )}

      {isDone ? (
        <div className="card">
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

        </div>
      ) : alreadySubmitted ? (
        <>
          <div className="card">
            <h2>Already submitted</h2>
            <p>
              You have already completed and submitted this survey on this device. Each
              person can only submit once.
            </p>
            {import.meta.env.DEV && (
              <button className="ghost" onClick={handleResetForRetest}>
                Reset and start over (dev only)
              </button>
            )}
          </div>
          <Introduction />
        </>
      ) : !hasStarted ? (
        <Introduction
          onBegin={() => {
            setHasStarted(true)
            scrollToTop()
          }}
          savedCount={restored ? answeredCount : 0}
          onStartOver={handleDiscardDraft}
        />
      ) : (
        <div className="card">
          <h2>{section.title}</h2>

          {Object.entries(section.questions)
            .filter(([qKey]) => !isHiddenQuestion(sectionKey, qKey))
            .map(([qKey, q], i) => (
              <Question
                key={qKey}
                question={q}
                name={`${sectionKey}_${qKey}`}
                num={i + 1}
                value={sectionAnswers[qKey]}
                stateValue={sectionAnswers[STATE_QUESTION_KEY]}
                onChange={(v) => handleChange(qKey, v)}
              />
            ))}

          {sectionKey === SECTION_ONE && locationNotice}

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

              {locationNotice}
            </div>
          )}

          <div className="nav-row">
            <button
              className="ghost"
              disabled={sectionIndex === 0}
              onClick={() => goToSection((i) => i - 1)}
            >
              Back
            </button>
            <button
              disabled={isLastSection && !canSubmit}
              onClick={() => {
                if (isLastSection) {
                  handleSubmit()
                } else {
                  goToSection((i) => i + 1)
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