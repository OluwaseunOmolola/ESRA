import type { AnswerValue, Question as QuestionType } from '../data/types'
import { STATES, lgasForState } from '../data/locations'

interface Props {
  question: QuestionType
  name: string
  num: number
  value: AnswerValue | undefined
  /** Answer to the state question, used to filter the LGA list */
  stateValue?: AnswerValue
  onChange: (value: AnswerValue) => void
}

function Question({ question, name, num, value, stateValue, onChange }: Props) {
  const { type, values } = question.options

  if (type === 'select') {
    return (
      <div className="q">
<p><span className="q-num">{num}.</span> {question.question}</p>        {values?.map((v) => (
          <label key={v} className="opt-row">
              <input
              type="radio"
              name={name}
              checked={value === v}
              onChange={() => onChange(v)}
            />
            {v}
          </label>
        ))}
      </div>
    )
  }

  if (type === 'string') {
    return (
      <div className="q">
        <p><span className="q-num">{num}.</span> {question.question}</p>        <input
          type="text"
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    )
  }

    if (type === 'check') {
    const selected = Array.isArray(value) ? value : []
    return (
      <div className="q">
          <p><span className="q-num">{num}.</span> {question.question}</p>        {values?.map((v) => (
              <label key={v} className="opt-row">
              <input
              type="checkbox"
              checked={selected.includes(v)}
              onChange={(e) => {
                if (e.target.checked) onChange([...selected, v])
                else onChange(selected.filter((s) => s !== v))
              }}
            />
            {v}
          </label>
        ))}
      </div>
    )
  }

    if (type === 'states') {
    return (
  <div className="q">
<p><span className="q-num">{num}.</span> {question.question}</p>
        <select
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Select a state</option>
          {STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
    )
  }

  if (type === 'lgas') {
    const state = typeof stateValue === 'string' ? stateValue : ''
    const lgas = lgasForState(state)
    const selected = typeof value === 'string' && lgas.includes(value) ? value : ''

    return (
      <div className="q">
        <p><span className="q-num">{num}.</span> {question.question}</p>
        <select
          value={selected}
          disabled={lgas.length === 0}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">{lgas.length === 0 ? 'Select a state first' : 'Select an LGA'}</option>
          {lgas.map((lga) => (
            <option key={lga} value={lga}>{lga}</option>
          ))}
        </select>
      </div>
    )
  }

if (type === 'rank') {
  const ranks = (value && typeof value === 'object' && !Array.isArray(value)) ? value : {}
  return (
    <div className="q">
      <p><span className="q-num">{num}.</span> {question.question}</p>
      {values?.map((v) => {
        const usedByOthers = Object.entries(ranks)
          .filter(([key]) => key !== v)
          .map(([, rankVal]) => rankVal)

        return (
          <div key={v} className="rank-item">
            <span>{v}</span>
            <select
              value={ranks[v] ?? ''}
              onChange={(e) => onChange({ ...ranks, [v]: e.target.value })}
            >
              <option value="">–</option>
              {values.map((_, i) => {
                const num = String(i + 1)
                return (
                  <option key={i} value={num} disabled={usedByOthers.includes(num)}>
                    {num}
                  </option>
                )
              })}
            </select>
          </div>
        )
      })}
    </div>
  )
}

  return <p><span className="q-num">{num}.</span> {question.question} (type "{type}" not built yet)</p>
}

export default Question

