import wardList from './national_ward_list.json'
import { LGA_QUESTION_KEY, SECTION_ONE, STATE_QUESTION_KEY, type Answers } from './types'

interface WardRecord {
  'S/N': number
  LGA: string
  WARD: string
}

const index = wardList as unknown as Record<string, WardRecord[]>

function normalise(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

/** Every state in the ward list, in source order */
export const STATES: string[] = Object.keys(index)

const LGAS_BY_STATE: Record<string, string[]> = Object.fromEntries(
  STATES.map((state) => [state, [...new Set(index[state].map((row) => normalise(row.LGA)))]])
)

/** LGAs of a state, in source order. Empty when the state is unknown. */
export function lgasForState(state: string | null | undefined): string[] {
  if (!state) return []
  return LGAS_BY_STATE[state] ?? []
}

export function isKnownLga(
  state: string | null | undefined,
  lga: string | null | undefined
): boolean {
  if (!lga) return false
  return lgasForState(state).includes(lga)
}

/** Drops a saved LGA that does not belong to the saved state */
export function pruneInvalidLocation(answers: Answers): Answers {
  const section = answers[SECTION_ONE]
  if (!section) return answers

  const state = section[STATE_QUESTION_KEY]
  const lga = section[LGA_QUESTION_KEY]
  if (typeof lga !== 'string' || lga === '') return answers
  if (isKnownLga(typeof state === 'string' ? state : '', lga)) return answers

  const nextSection = { ...section }
  delete nextSection[LGA_QUESTION_KEY]
  return { ...answers, [SECTION_ONE]: nextSection }
}
