import esraData from './data/Esra Questions.json'
import type { Survey } from './data/types'
import Question from './components/Question'
import logo from './assets/kdi-logo-transparent.png'
import { useState } from 'react'
import './App.css'

const survey = esraData as Survey

type AnswerValue = string | string[] | Record<string, string>

function App() {
  const sectionKeys = Object.keys(survey.sections)
  const [sectionIndex, setSectionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({})
  const [isDone, setIsDone] = useState(false)

  const sectionKey = sectionKeys[sectionIndex]
  const section = survey.sections[sectionKey]
  const progressPct = Math.round((sectionIndex / sectionKeys.length) * 100)

  function handleChange(questionKey: string, value: AnswerValue) {
    const fullKey = `${sectionKey}_${questionKey}`
    setAnswers((prev) => ({ ...prev, [fullKey]: value }))
  }

  return (
    <div className="shell">
      <div className="brand">
        <img src={logo} alt="KDI" className="brand-logo" />
        <span className="brand-title">NEVER Reporting</span>
      </div>
      <h1>{survey.title}</h1>

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
          <pre>{JSON.stringify(answers, null, 2)}</pre>
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
              value={answers[`${sectionKey}_${qKey}`]}
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