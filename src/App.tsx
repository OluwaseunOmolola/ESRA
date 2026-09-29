import esraData from './data/Esra Questions.json'
import type { AnswerValue, Answers, Survey } from './data/types'
import { buildResponse } from './data/response'
import Question from './components/Question'
import logo from './assets/kdi-logo-transparent.png'
import { useMemo, useState } from 'react'
import './App.css'

const survey = esraData as Survey

function App() {
  const sectionKeys = Object.keys(survey.sections)
  const [sectionIndex, setSectionIndex] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [isDone, setIsDone] = useState(false)

  const sectionKey = sectionKeys[sectionIndex]
  const section = survey.sections[sectionKey]
  const sectionAnswers = answers[sectionKey] ?? {}
  const progressPct = Math.round((sectionIndex / sectionKeys.length) * 100)
  const response = useMemo(() => buildResponse(survey, answers), [answers])

  function handleChange(questionKey: string, value: AnswerValue) {
    setAnswers((prev) => ({
      ...prev,
      [sectionKey]: { ...prev[sectionKey], [questionKey]: value },
    }))
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
          <pre>{JSON.stringify(response, null, 2)}</pre>
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
                  setIsDone(true)
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