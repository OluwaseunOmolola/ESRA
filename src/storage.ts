import type { Answers } from './data/types'

/** Bump when the question schema changes so stale drafts are discarded */
const DRAFT_KEY = 'esra_draft_v2'

function isAnswers(value: unknown): value is Answers {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  const sections = Object.entries(value)
  // an empty object means the survey was opened but nothing was answered
  if (sections.length === 0) return false
  return sections.every(
    ([, section]) =>
      typeof section === 'object' && section !== null && !Array.isArray(section)
  )
}

export function loadAnswers(): Answers | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return null

    const parsed: unknown = JSON.parse(raw)
    return isAnswers(parsed) ? parsed : null
  } catch {
    // unreadable or corrupt — treat as no draft
    return null
  }
}

export function saveAnswers(answers: Answers): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(answers))
  } catch {
    // storage unavailable or over quota — progress simply is not persisted
  }
}

export function clearAnswers(): void {
  try {
    localStorage.removeItem(DRAFT_KEY)
  } catch {
    // nothing to do
  }
}