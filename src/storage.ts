import type { Answers } from './data/types'

/** Bump when the question schema changes so stale drafts are discarded */
const DRAFT_KEY = 'esra_draft_v1'

export interface Draft {
  sectionIndex: number
  answers: Answers
}

function isAnswers(value: unknown): value is Answers {
  if (typeof value !== 'object' || value === null) return false
  return Object.values(value).every(
    (section) => typeof section === 'object' && section !== null
  )
}

export function loadDraft(): Draft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return null

    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return null

    const { sectionIndex, answers } = parsed as Partial<Draft>
    if (!isAnswers(answers)) return null
    if (!Number.isInteger(sectionIndex) || (sectionIndex as number) < 0) return null

    return { sectionIndex: sectionIndex as number, answers }
  } catch {
    // unreadable or corrupt — treat as no draft
    return null
  }
}

export function saveDraft(draft: Draft): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  } catch {
    // storage unavailable or over quota — progress simply is not persisted
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(DRAFT_KEY)
  } catch {
    // nothing to do
  }
}